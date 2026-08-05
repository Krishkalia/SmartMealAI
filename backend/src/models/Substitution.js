const mongoose = require('mongoose');

const SubstitutionSchema = new mongoose.Schema({
  originalIngredient: { type: String, required: true },
  substitute: { type: String, required: true },
  ratio: { type: Number, required: true, default: 1 }, // Multiply original qty by this to get sub qty
  notes: { type: String },
  suitableFor: [{ type: String }] // e.g., ['vegan', 'dairy-free']
});

module.exports = mongoose.model('Substitution', SubstitutionSchema);
