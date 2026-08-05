const planService = require('../services/planService');
const geminiService = require('../services/geminiService');
const Plan = require('../models/Plan');

exports.generatePlan = async (req, res) => {
  try {
    const { dietaryPreferences, pantry, budget } = req.body;
    
    // 1. Generate Deterministic Plan
    const deterministicPlan = await planService.generateDeterministicPlan(dietaryPreferences, budget, pantry);
    
    // 2. Enhance with Gemini
    const finalPlanData = await geminiService.enhancePlan(deterministicPlan, dietaryPreferences || []);
    
    // 3. Save to DB
    const plan = new Plan({
      userId: req.user.id,
      budget: finalPlanData.budget,
      totalCost: finalPlanData.totalCost,
      meals: finalPlanData.meals,
      shoppingList: finalPlanData.shoppingList
    });
    
    await plan.save();
    
    res.status(201).json({
      success: true,
      data: {
        planId: plan._id,
        ...finalPlanData
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
