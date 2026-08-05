const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const Ingredient = require('./models/Ingredient');
const Substitution = require('./models/Substitution');

const MONGO_URI = 'mongodb://localhost:27017/smartmeal_ai';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  await Recipe.deleteMany({});
  await Ingredient.deleteMany({});
  await Substitution.deleteMany({});

  const ingredients = [
    { name: 'Steel-cut oats', category: 'Grains', unit: 'cup', averagePrice: 0.5 },
    { name: 'Honey', category: 'Pantry', unit: 'tbsp', averagePrice: 0.2 },
    { name: 'Mixed berries', category: 'Produce', unit: 'cup', averagePrice: 2.5 },
    { name: 'Pre-cooked quinoa', category: 'Grains', unit: 'cup', averagePrice: 1.0 },
    { name: 'Cucumber', category: 'Produce', unit: 'unit', averagePrice: 0.8 },
    { name: 'Salmon fillets', category: 'Protein', unit: 'unit', averagePrice: 5.5 },
    { name: 'Asparagus', category: 'Produce', unit: 'bunch', averagePrice: 3.5 },
    { name: 'Olive Oil', category: 'Pantry', unit: 'tbsp', averagePrice: 0.15 },
    { name: 'Basmati Rice', category: 'Grains', unit: 'cup', averagePrice: 0.6 }
  ];

  await Ingredient.insertMany(ingredients);
  console.log('Ingredients seeded.');

  const recipes = [
    {
      name: 'Berry Almond Oatmeal',
      mealType: 'Breakfast',
      dietTags: ['vegetarian', 'vegan'],
      cuisine: 'Continental',
      ingredients: [
        { name: 'Steel-cut oats', qty: 0.5, unit: 'cup' },
        { name: 'Honey', qty: 1, unit: 'tbsp' },
        { name: 'Mixed berries', qty: 1, unit: 'cup' }
      ],
      steps: [
        { text: 'Mix oats and milk, leave overnight.', duration: 5, type: 'prep' },
        { text: 'Top with berries and honey.', duration: 5, type: 'cook' }
      ],
      prepTime: 5,
      cookTime: 15,
      description: 'A warming start to the day.',
      allergens: ['nuts']
    },
    {
      name: 'Mediterranean Quinoa Bowl',
      mealType: 'Lunch',
      dietTags: ['vegetarian', 'vegan'],
      cuisine: 'Continental',
      ingredients: [
        { name: 'Pre-cooked quinoa', qty: 1, unit: 'cup' },
        { name: 'Cucumber', qty: 0.5, unit: 'unit' }
      ],
      steps: [
        { text: 'Chop cucumber.', duration: 5, type: 'prep' },
        { text: 'Mix with quinoa and dressing.', duration: 5, type: 'prep' }
      ],
      prepTime: 15,
      cookTime: 0,
      description: 'Crisp refreshing bowl.',
      allergens: []
    },
    {
      name: 'Pan-Seared Salmon',
      mealType: 'Dinner',
      dietTags: ['non-vegetarian', 'keto'],
      cuisine: 'Continental',
      ingredients: [
        { name: 'Salmon fillets', qty: 2, unit: 'unit' },
        { name: 'Asparagus', qty: 1, unit: 'bunch' }
      ],
      steps: [
        { text: 'Season salmon.', duration: 5, type: 'prep' },
        { text: 'Pan sear salmon and asparagus.', duration: 20, type: 'cook' }
      ],
      prepTime: 10,
      cookTime: 20,
      description: 'Crispy skin salmon.',
      allergens: ['fish']
    }
  ];

  await Recipe.insertMany(recipes);
  console.log('Recipes seeded.');

  const substitutions = [
    {
      originalIngredient: 'Honey',
      substitute: 'Maple Syrup',
      ratio: 1,
      notes: 'Vegan alternative',
      suitableFor: ['vegan']
    }
  ];

  await Substitution.insertMany(substitutions);
  console.log('Substitutions seeded.');

  console.log('Seeding complete!');
  mongoose.disconnect();
}

seed().catch(console.error);
