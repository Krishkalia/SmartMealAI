const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false // Do not return password by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  preferences: {
    dietaryPreferences: { type: [String], default: [] },
    pantry: [{
      name: String,
      qty: Number,
      unit: String
    }],
    budget: { type: Number, default: null },
    household: { type: Number, default: 2 },
    cuisine: { type: [String], default: [] },
    cookTime: { type: String, default: 'Standard' }
  },
  favorites: {
    type: Array,
    default: []
  }
});

// Encrypt password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
