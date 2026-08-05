const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
  dietTags: [{ type: String, enum: ['vegetarian', 'vegan', 'keto', 'none', 'non-vegetarian'] }],
  cuisine: { type: String },
  ingredients: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  steps: [{
    text: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    type: { type: String, enum: ['prep', 'cook', 'wait'], required: true }
  }],
  allergens: [{ type: String }],
  prepTime: { type: Number },
  cookTime: { type: Number },
  imageUrl: { type: String },
  description: { type: String }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
