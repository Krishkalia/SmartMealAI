const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  budget: { type: Number },
  totalCost: { type: Number },
  isOverBudget: { type: Boolean },
  budgetDifference: { type: Number },
  meals: {
    breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }
  },
  aiMessage: { type: String },
  shoppingList: { type: mongoose.Schema.Types.Mixed }, // Structured categories or flat
  pantryUsed: [{
    name: { type: String },
    qtyUsed: { type: Number },
    unit: { type: String }
  }],
  substitutions: { type: mongoose.Schema.Types.Mixed }, // object mapping ingredientName -> {substitute, ratio, notes}
  timeline: [{
    timeOffset: { type: Number },
    mealType: { type: String },
    instruction: { type: String },
    phrasedInstruction: { type: String },
    duration: { type: Number },
    type: { type: String }
  }]
});

module.exports = mongoose.model('Plan', PlanSchema);
