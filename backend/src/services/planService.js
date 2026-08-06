const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const unitConverter = require('../utils/unitConverter');
const geminiService = require('./geminiService');

class PlanService {
  /**
   * 6.2 Filter and Score Candidates
   */
  async getScoredCandidates(dietPreferences, allergies, budget, pantryItems, cuisinePrefs, cookTimePref) {
    // 1. Filter by Hard Constraints (Diet, Allergies)
    const query = {};
    if (dietPreferences && dietPreferences.length > 0) {
      query.dietTags = { $in: dietPreferences };
    }

    let allRecipes = await Recipe.find(query);

    // Filter out allergens
    if (allergies && allergies.length > 0) {
      const lowerAllergies = allergies.map(a => a.toLowerCase());
      allRecipes = allRecipes.filter(recipe => {
        if (!recipe.allergens) return true;
        const hasAllergen = recipe.allergens.some(a => lowerAllergies.includes(a.toLowerCase()));
        return !hasAllergen;
      });
    }

    // Prepare for scoring
    const allIngredientDocs = await Ingredient.find();
    const priceMap = {};
    allIngredientDocs.forEach(doc => priceMap[doc.name.toLowerCase()] = doc.averagePrice);

    // Score recipes
    const scoredRecipes = allRecipes.map(recipe => {
      let score = 0;
      let estimatedCost = 0;
      let pantryOverlapCount = 0;

      for (const ing of recipe.ingredients) {
        // Calculate cost
        const price = priceMap[ing.name.toLowerCase()] || 1.0;
        estimatedCost += (ing.qty * price);

        // Pantry overlap
        if (pantryItems && pantryItems.length > 0) {
          const match = pantryItems.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
          if (match) pantryOverlapCount++;
        }
      }

      // Add to score based on pantry overlap
      score += (pantryOverlapCount * 10);
      
      // Add to score if it's cheap
      if (estimatedCost < (budget / 3)) score += 5;

      // Add to score for cuisine match
      if (cuisinePrefs && cuisinePrefs.length > 0 && recipe.cuisine) {
        if (cuisinePrefs.some(c => c.toLowerCase() === recipe.cuisine.toLowerCase())) {
          score += 15;
        }
      }

      // Add to score for cook time fit
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      if (cookTimePref === 'Quick <30 min/meal' && totalTime <= 30) {
        score += 10;
      } else if (cookTimePref === 'Standard' && totalTime > 30 && totalTime <= 60) {
        score += 5;
      } else if (cookTimePref === 'Elaborate' && totalTime > 60) {
        score += 5;
      }

      return { recipe, score, estimatedCost };
    });

    // Sort by score descending
    scoredRecipes.sort((a, b) => b.score - a.score);

    // Separate into categories
    const breakfast = scoredRecipes.filter(r => r.recipe.mealType === 'Breakfast').slice(0, 5).map(r => r.recipe);
    const lunch = scoredRecipes.filter(r => r.recipe.mealType === 'Lunch').slice(0, 5).map(r => r.recipe);
    const dinner = scoredRecipes.filter(r => r.recipe.mealType === 'Dinner').slice(0, 5).map(r => r.recipe);

    return { breakfast, lunch, dinner };
  }

  /**
   * 6.3, 6.5, 6.6 Shopping List & Budget Analysis
   */
  async generateShoppingList(selectedRecipes, pantryItems, budget) {
    const requiredIngredients = {};

    // 1. Aggregate required ingredients with normalized units
    for (const recipe of selectedRecipes) {
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const norm = unitConverter.normalize(ing.qty, ing.unit);
        const key = `${ing.name.toLowerCase()}`;
        
        if (requiredIngredients[key]) {
          // If we already have this ingredient but units differ and aren't standardized, we might have an issue
          // but for simplicity, we'll assume standard unit conversion handles most.
          requiredIngredients[key].qty += norm.qty;
          requiredIngredients[key].meals.push(recipe.mealType);
        } else {
          requiredIngredients[key] = {
            originalName: ing.name,
            qty: norm.qty,
            unit: norm.unit, // store the normalized unit
            isStandardized: norm.isStandardized,
            meals: [recipe.mealType],
            warning: null
          };
        }
      }
    }

    // 2. Net against pantry items
    const pantryUsed = [];
    if (pantryItems && pantryItems.length > 0) {
      for (const item of pantryItems) {
        const pNorm = unitConverter.normalize(item.qty, item.unit);
        const key = `${item.name.toLowerCase()}`;
        
        if (requiredIngredients[key]) {
          const req = requiredIngredients[key];
          
          // Check for unit mismatch
          if (req.unit !== pNorm.unit || (!req.isStandardized && !pNorm.isStandardized && req.unit !== pNorm.unit)) {
            // Mismatch: add a warning, don't subtract
            req.warning = `Couldn't auto-match units for ${req.originalName} — verify manually`;
            continue;
          }

          const reqQty = req.qty;
          if (pNorm.qty >= reqQty) {
            // Full overlap
            pantryUsed.push({ name: item.name, qtyUsed: reqQty, unit: pNorm.unit });
            delete requiredIngredients[key];
          } else {
            // Partial overlap
            pantryUsed.push({ name: item.name, qtyUsed: pNorm.qty, unit: pNorm.unit });
            requiredIngredients[key].qty -= pNorm.qty;
          }
        }
      }
    }

    // Prepare list for AI pricing
    const ingredientsListForPricing = Object.values(requiredIngredients).map(ing => ({
      name: ing.originalName,
      qty: ing.qty,
      unit: ing.unit
    }));

    // 3. Get AI Prices in INR
    const aiPrices = await geminiService.estimatePrices(ingredientsListForPricing);

    const allIngredientDocs = await Ingredient.find();
    const categoryMap = {};
    allIngredientDocs.forEach(doc => {
      categoryMap[doc.name.toLowerCase()] = doc.category;
    });

    let totalCost = 0;
    const perMealCost = { Breakfast: 0, Lunch: 0, Dinner: 0 };
    
    const shoppingList = Object.values(requiredIngredients).map(ing => {
      // Use AI price if available, otherwise default to a small amount
      const cost = aiPrices[ing.originalName] || (ing.qty * 0.5); // Fallback pricing
      const category = categoryMap[ing.originalName.toLowerCase()] || 'Other';
      
      totalCost += cost;

      // Approximate per-meal split for this ingredient
      const splitCost = cost / (ing.meals.length || 1);
      ing.meals.forEach(m => {
        const normalizedMeal = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
        if (perMealCost[normalizedMeal] !== undefined) {
          perMealCost[normalizedMeal] += splitCost;
        }
      });

      return {
        ingredientName: ing.originalName,
        qty: parseFloat(ing.qty.toFixed(2)),
        unit: ing.unit,
        estimatedCost: parseFloat(cost.toFixed(2)),
        category,
        meals: [...new Set(ing.meals)],
        warning: ing.warning
      };
    });

    // Grouping for frontend
    const groupedShoppingList = shoppingList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return {
      shoppingList: groupedShoppingList,
      flatShoppingList: shoppingList, // for db save
      pantryUsed,
      totalCost: parseFloat(totalCost.toFixed(2)),
      perMealCost: {
        Breakfast: parseFloat(perMealCost.Breakfast.toFixed(2)),
        Lunch: parseFloat(perMealCost.Lunch.toFixed(2)),
        Dinner: parseFloat(perMealCost.Dinner.toFixed(2))
      },
      budget,
      isOverBudget: totalCost > budget,
      difference: parseFloat(Math.abs(budget - totalCost).toFixed(2))
    };
  }

  /**
   * 6.7 Cooking Timeline Scheduling
   */
  generateCookingTimeline(recipes) {
    const timeline = [];
    let currentTime = 0; // minutes from start
    let totalActiveTime = 0;

    for (const recipe of recipes) {
      if (!recipe || !recipe.steps) continue;
      
      for (const step of recipe.steps) {
        // Very basic deterministic scheduling:
        // Active steps block time. Passive steps don't block.
        const entry = {
          timeOffset: currentTime,
          mealType: recipe.mealType,
          instruction: step.text,
          duration: step.duration,
          type: step.type
        };
        timeline.push(entry);

        if (step.type === 'cook' || step.type === 'prep') {
          currentTime += step.duration;
          totalActiveTime += step.duration;
        }
      }
      // Add a small buffer between meals if sequential
      currentTime += 5;
    }

    return { timeline, totalActiveTime };
  }
}

module.exports = new PlanService();
