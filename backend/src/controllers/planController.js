const planService = require('../services/planService');
const geminiService = require('../services/geminiService');
const cloudinaryService = require('../services/cloudinaryService');
const Plan = require('../models/Plan');
const Recipe = require('../models/Recipe');

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

    // 4. Find substitutions for missing items
    const missingIngredients = listResult.flatShoppingList;
    const substitutions = await geminiService.getMissingIngredientSubstitutes(missingIngredients, allergies);

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
