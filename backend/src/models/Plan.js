const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  budget: { type: Number },
  totalCost: { type: Number },
  meals: {
    breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }
  },
  shoppingList: [{
    ingredientName: { type: String },
    qty: { type: Number },
    unit: { type: String },
    estimatedCost: { type: Number },
    category: { type: String }
  }]
});

module.exports = mongoose.model('Plan', PlanSchema);
