const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // e.g., Produce, Dairy, Protein
  unit: { type: String, required: true }, // base unit for pricing
  averagePrice: { type: Number, required: true }, // price per base unit
  conversionFactors: {
    type: Map,
    of: Number, // Example: { 'cup': 250, 'tbsp': 15 } - converts these units to the base unit (e.g., grams)
    default: {}
  }
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
