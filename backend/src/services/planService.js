const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

class PlanService {
  async generateDeterministicPlan(preferences, budget, pantryItems) {
    // 1. Fetch eligible recipes based on diet tags
    const query = {};
    if (preferences && preferences.length > 0) {
      query.dietTags = { $in: preferences };
    }

    const breakfastRecipes = await Recipe.find({ ...query, mealType: 'Breakfast' });
    const lunchRecipes = await Recipe.find({ ...query, mealType: 'Lunch' });
    const dinnerRecipes = await Recipe.find({ ...query, mealType: 'Dinner' });

    // Fallback if no matching recipes found
    const breakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)] || await Recipe.findOne({ mealType: 'Breakfast' });
    const lunch = lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)] || await Recipe.findOne({ mealType: 'Lunch' });
    const dinner = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)] || await Recipe.findOne({ mealType: 'Dinner' });

    const selectedRecipes = [breakfast, lunch, dinner].filter(Boolean);

    // 2. Generate Shopping List and apply Pantry Netting
    const requiredIngredients = {};
    for (const recipe of selectedRecipes) {
      for (const ing of recipe.ingredients) {
        if (requiredIngredients[ing.name]) {
          requiredIngredients[ing.name].qty += ing.qty;
        } else {
          requiredIngredients[ing.name] = { ...ing._doc };
        }
      }
    }

    // Deduct pantry items
    if (pantryItems && pantryItems.length > 0) {
      for (const item of pantryItems) {
        if (requiredIngredients[item.name]) {
          // Simplification: Assume units match for V1
          requiredIngredients[item.name].qty -= item.qty;
          if (requiredIngredients[item.name].qty <= 0) {
            delete requiredIngredients[item.name];
          }
        }
      }
    }

    // 3. Calculate Budget
    const allIngredientDocs = await Ingredient.find();
    const priceMap = {};
    allIngredientDocs.forEach(doc => priceMap[doc.name] = doc.averagePrice);

    let totalCost = 0;
    const shoppingList = Object.values(requiredIngredients).map(ing => {
      const pricePerUnit = priceMap[ing.name] || 1.0; // Fallback price
      const cost = ing.qty * pricePerUnit;
      totalCost += cost;
      return {
        ingredientName: ing.name,
        qty: ing.qty,
        unit: ing.unit,
        estimatedCost: cost,
        category: 'General' // simplified
      };
    });

    return {
      meals: {
        breakfast: breakfast?._id,
        lunch: lunch?._id,
        dinner: dinner?._id
      },
      shoppingList,
      totalCost,
      budget
    };
  }
}

module.exports = new PlanService();
