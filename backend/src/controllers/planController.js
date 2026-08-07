const planService = require('../services/planService');
const geminiService = require('../services/geminiService');
const cloudinaryService = require('../services/cloudinaryService');
const Plan = require('../models/Plan');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

exports.generatePlan = async (req, res) => {
  try {
    const { dietaryPreferences = [], pantry = [], budget = 50, household = 2, cuisine = [], cookTime = 'Standard' } = req.body;
    
    // Separate allergies from diets
    const diets = dietaryPreferences.filter(p => ['vegetarian', 'vegan', 'keto', 'non-vegetarian'].includes(p.toLowerCase()));
    const allergies = dietaryPreferences.filter(p => !['vegetarian', 'vegan', 'keto', 'non-vegetarian'].includes(p.toLowerCase()));

    let selectedRecipes = [];
    let aiMessage = "Your customized AI-generated meal plan is ready.";
    let selection = null;

    try {
      // 1. Attempt to GENERATE brand new recipes with AI (infinite variety)
      const generatedPlan = await geminiService.generateBestCombination(req.body);
      
      // Save these brand new recipes to the database to get valid _ids (PRD Step 4 constraint)
      const inserted = await Recipe.insertMany([
        generatedPlan.breakfast, 
        generatedPlan.lunch, 
        generatedPlan.dinner
      ]);
      
      selection = {
        breakfast: inserted[0],
        lunch: inserted[1],
        dinner: inserted[2],
        aiMessage: generatedPlan.aiMessage
      };
      selectedRecipes = [inserted[0], inserted[1], inserted[2]];
      aiMessage = generatedPlan.aiMessage;

    } catch (aiError) {
      console.warn("AI generation failed, falling back to deterministic DB selection:", aiError.message);
      
      // FALLBACK: Deterministic DB Selection (if AI is down or fails schema)
      const candidates = await planService.getScoredCandidates(diets, allergies, budget, pantry, cuisine, cookTime);

      if (candidates.breakfast.length === 0 || candidates.lunch.length === 0 || candidates.dinner.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No matching recipes for these restrictions — try relaxing your constraints.' 
        });
      }

      selection = {
        breakfast: candidates.breakfast[0],
        lunch: candidates.lunch[0],
        dinner: candidates.dinner[0],
        aiMessage: "Your deterministic meal plan is ready."
      };
      selectedRecipes = [selection.breakfast, selection.lunch, selection.dinner];
      aiMessage = selection.aiMessage;
    }

    // 3. Generate shopping list with pantry netting & budget analysis
    const listResult = await planService.generateShoppingList(selectedRecipes, pantry, budget);

    // 4. Find substitutions for missing items (Disabled auto-substitution per user request)
    const missingIngredients = listResult.flatShoppingList;
    const substitutions = {};

    // 5. Generate and phrase timeline
    const { timeline: rawTimeline, totalActiveTime } = planService.generateCookingTimeline(selectedRecipes);
    const phrasedTimeline = await geminiService.phraseTimeline(rawTimeline);
    
    let activeTimeWarning = null;
    if (totalActiveTime > 210) { // 3.5 hours = 210 mins
      activeTimeWarning = `Warning: This plan requires ~${(totalActiveTime / 60).toFixed(1)} hrs of active cooking time. Consider adjusting your cooking-time preference and regenerating.`;
    }

    // 6. Save core plan to DB
    const plan = new Plan({
      userId: req.user.id,
      budget: listResult.budget,
      totalCost: listResult.totalCost,
      isOverBudget: listResult.isOverBudget,
      budgetDifference: listResult.difference,
      perMealCost: listResult.perMealCost,
      meals: {
        breakfast: selection.breakfast._id,
        lunch: selection.lunch._id,
        dinner: selection.dinner._id
      },
      aiMessage: selection.aiMessage,
      shoppingList: listResult.shoppingList, // Grouped by category
      pantryUsed: listResult.pantryUsed,
      substitutions,
      timeline: phrasedTimeline
    });
    
    await plan.save();
    
    // 7. Return comprehensive payload
    res.status(201).json({
      success: true,
      data: {
        planId: plan._id,
        meals: {
          breakfast: selection.breakfast,
          lunch: selection.lunch,
          dinner: selection.dinner
        },
        aiMessage: selection.aiMessage,
        shoppingList: listResult.shoppingList, // Grouped by category
        flatShoppingList: listResult.flatShoppingList,
        pantryUsed: listResult.pantryUsed,
        budget: listResult.budget,
        totalCost: listResult.totalCost,
        perMealCost: listResult.perMealCost,
        isOverBudget: listResult.isOverBudget,
        budgetDifference: listResult.difference,
        substitutions,
        timeline: phrasedTimeline,
        activeTimeWarning
      }
    });
  } catch (error) {
    console.error("Generate plan error:", error);
    res.status(500).json({ success: false, message: 'Failed to generate plan' });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('meals.breakfast')
      .populate('meals.lunch')
      .populate('meals.dinner');
      
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.refreshMeal = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('meals.breakfast')
      .populate('meals.lunch')
      .populate('meals.dinner');
      
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (plan.userId.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { mealType } = req.body; // 'breakfast', 'lunch', 'dinner'
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({ success: false, message: 'Invalid meal type' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const preferences = user.preferences || {};
    
    const diets = preferences.dietaryPreferences?.filter(p => ['vegetarian', 'vegan', 'keto', 'non-vegetarian'].includes(p.toLowerCase())) || [];
    const allergies = preferences.dietaryPreferences?.filter(p => !['vegetarian', 'vegan', 'keto', 'non-vegetarian'].includes(p.toLowerCase())) || [];
    
    const candidates = await planService.getScoredCandidates(
      diets, allergies, preferences.budget || 50, preferences.pantry || [], preferences.cuisine || [], preferences.cookTime || 'Standard'
    );
    
    let newRecipe = candidates[mealType].find(r => r._id.toString() !== plan.meals[mealType]._id.toString());
    if (!newRecipe) newRecipe = candidates[mealType][0];

    plan.meals[mealType] = newRecipe._id;

    const selectedRecipes = [
      mealType === 'breakfast' ? newRecipe : plan.meals.breakfast,
      mealType === 'lunch' ? newRecipe : plan.meals.lunch,
      mealType === 'dinner' ? newRecipe : plan.meals.dinner
    ];

    const listResult = await planService.generateShoppingList(selectedRecipes, preferences.pantry || [], preferences.budget || 50);
    const missingIngredients = listResult.flatShoppingList;
    const substitutions = plan.substitutions || {};
    
    const { timeline: rawTimeline, totalActiveTime } = planService.generateCookingTimeline(selectedRecipes);
    const phrasedTimeline = await geminiService.phraseTimeline(rawTimeline);

    plan.budget = listResult.budget;
    plan.totalCost = listResult.totalCost;
    plan.perMealCost = listResult.perMealCost;
    plan.isOverBudget = listResult.isOverBudget;
    plan.budgetDifference = listResult.difference;
    plan.shoppingList = listResult.shoppingList;
    plan.pantryUsed = listResult.pantryUsed;
    plan.substitutions = substitutions;
    plan.timeline = phrasedTimeline;
    
    await plan.save();

    const updatedPlan = await Plan.findById(plan._id)
      .populate('meals.breakfast')
      .populate('meals.lunch')
      .populate('meals.dinner');

    let activeTimeWarning = null;
    if (totalActiveTime > 210) {
      activeTimeWarning = `Warning: This plan requires ~${(totalActiveTime / 60).toFixed(1)} hrs of active cooking time. Consider adjusting your cooking-time preference and regenerating.`;
    }

    res.json({
      success: true,
      data: {
        ...updatedPlan.toObject(),
        activeTimeWarning
      }
    });

  } catch (error) {
    console.error("Refresh meal error:", error);
    res.status(500).json({ success: false, message: 'Failed to refresh meal' });
  }
};

exports.getCommonPantry = async (req, res) => {
  try {
    const items = await geminiService.generateCommonPantry();
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Common pantry generation error:", error);
    res.status(500).json({ success: false, message: 'Failed to generate common pantry items' });
  }
};

exports.getUserPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('meals.breakfast')
      .populate('meals.lunch')
      .populate('meals.dinner');
    
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.scanPantry = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    // Extract base64 and mime type from data URL (e.g. "data:image/jpeg;base64,....")
    let base64Data = image;
    let mimeType = 'image/jpeg';

    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1];
    }

    // Upload to Cloudinary in parallel with AI scanning
    const uploadPromise = cloudinaryService.uploadMedia(image, 'pantry_scans').catch(err => {
      console.warn('Cloudinary upload failed, but continuing with AI scan:', err.message);
      return null;
    });

    const scanPromise = geminiService.scanPantryImage(base64Data, mimeType);
    
    const [imageUrl, items] = await Promise.all([uploadPromise, scanPromise]);
    
    res.json({ success: true, data: items, imageUrl });
  } catch (error) {
    console.error("Scan pantry error:", error);
    res.status(500).json({ success: false, message: 'Failed to analyze image' });
  }
};

exports.getSubstituteOptions = async (req, res) => {
  try {
    const { ingredientName, originalQty, originalUnit } = req.body;
    if (!ingredientName) {
      return res.status(400).json({ success: false, message: 'ingredientName is required' });
    }

    const user = await User.findById(req.user.id);
    const dietaryPrefs = user?.preferences?.dietaryPreferences || [];
    const allergies = dietaryPrefs.filter(p => !['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian', 'no restriction'].includes(p));

    const options = await geminiService.getSubstituteOptions(ingredientName, allergies, originalQty, originalUnit);
    res.json({ success: true, data: options });
  } catch (error) {
    console.error("Get substitute options error:", error);
    res.status(500).json({ success: false, message: 'Failed to get options' });
  }
};

exports.swapIngredient = async (req, res) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const { ingredientName, substituteData } = req.body;
    if (!ingredientName || !substituteData) {
      return res.status(400).json({ success: false, message: 'ingredientName and substituteData are required' });
    }

    const updatedSubstitutions = { ...plan.substitutions };
    
    // Calculate budget adjustments
    let currentEffectiveCost = 0;
    let originalMeals = [];
    
    if (plan.shoppingList) {
      for (const category of Object.values(plan.shoppingList)) {
        const item = category.find(i => i.ingredientName === ingredientName);
        if (item) {
          const existingSub = plan.substitutions && plan.substitutions[ingredientName];
          currentEffectiveCost = existingSub && existingSub.estimatedPrice !== undefined 
            ? existingSub.estimatedPrice 
            : (item.estimatedCost || 0);
          originalMeals = item.meals || [];
          break;
        }
      }
    }

    const newCost = substituteData.estimatedPrice || 0;
    const costDelta = newCost - currentEffectiveCost;

    plan.totalCost += costDelta;
    plan.budgetDifference = plan.budget - plan.totalCost;
    plan.isOverBudget = plan.totalCost > plan.budget;

    if (originalMeals.length > 0) {
      if (!plan.perMealCost) plan.perMealCost = { Breakfast: 0, Lunch: 0, Dinner: 0 };
      const splitDelta = costDelta / originalMeals.length;
      originalMeals.forEach(m => {
        const normalizedMeal = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
        if (plan.perMealCost[normalizedMeal] !== undefined) {
          plan.perMealCost[normalizedMeal] += splitDelta;
        }
      });
    }

    updatedSubstitutions[ingredientName] = substituteData;
    plan.substitutions = updatedSubstitutions;
    
    await plan.save();

    const updatedPlan = await Plan.findById(plan._id)
      .populate('meals.breakfast')
      .populate('meals.lunch')
      .populate('meals.dinner');

    res.json({ success: true, data: updatedPlan });
  } catch (error) {
    console.error("Swap ingredient error:", error);
    res.status(500).json({ success: false, message: 'Failed to apply substitution' });
  }
};

exports.addManualItem = async (req, res) => {
  try {
    const { ingredientName } = req.body;
    
    if (!ingredientName) {
      return res.status(400).json({ success: false, message: 'Ingredient name is required' });
    }

    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (!plan.shoppingList) {
      plan.shoppingList = {};
    }
    
    if (!plan.shoppingList['Other']) {
      plan.shoppingList['Other'] = [];
    }

    plan.shoppingList['Other'].push({
      ingredientName,
      qty: 1,
      unit: 'pcs',
      estimatedCost: 0
    });

    plan.markModified('shoppingList');
    
    await plan.save();
    
    const updatedPlan = await Plan.findById(plan._id)
      .populate('meals.breakfast')
      .populate('meals.lunch')
      .populate('meals.dinner');
      
    res.json({ success: true, data: updatedPlan });
  } catch (error) {
    console.error("Add manual item error:", error);
    res.status(500).json({ success: false, message: 'Failed to add manual item' });
  }
};
