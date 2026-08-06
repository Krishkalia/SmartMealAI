import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { user, updatePreferences } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [household, setHousehold] = useState(2);
  const [pantryItems, setPantryItems] = useState([]);

  // Initialize from user preferences
  useEffect(() => {
    if (user && user.preferences) {
      setHousehold(user.preferences.household || 2);
      setPantryItems(user.preferences.pantry || []);
      
      // We will handle the radio/checkboxes by waiting a tick for DOM to render, 
      // or we can control them via state. Since the original used uncontrolled inputs, 
      // we'll programmatically check them for simplicity.
      setTimeout(() => {
        const prefs = user.preferences;
        
        // Diet
        if (prefs.dietaryPreferences) {
          const diets = ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian', 'no restriction'];
          const userDiets = prefs.dietaryPreferences;
          
          document.querySelectorAll('input[name="diet"]').forEach(el => {
            el.checked = userDiets.includes(el.value);
            // Default if none selected and it's 'no restriction'
            if (userDiets.length === 0 && el.value === 'no restriction') el.checked = true;
          });
          
          const allergyCheckboxes = ['nuts', 'dairy', 'shellfish', 'gluten'];
          const customAllergies = [];
          
          document.querySelectorAll('input[name="allergy"]').forEach(el => {
            el.checked = userDiets.includes(el.value);
          });
          
          userDiets.forEach(d => {
            if (!diets.includes(d) && !allergyCheckboxes.includes(d)) {
              customAllergies.push(d);
            }
          });
          
          const customEl = document.getElementById('customAllergies');
          if (customEl) customEl.value = customAllergies.join(', ');
        }
        
        // Cuisine
        if (prefs.cuisine) {
          document.querySelectorAll('input[name="cuisine"]').forEach(el => {
            el.checked = prefs.cuisine.includes(el.value);
            if (prefs.cuisine.length === 0 && el.value === 'mixed/no preference') el.checked = true;
          });
        }
        
        // CookTime
        if (prefs.cookTime) {
          document.querySelectorAll('input[name="cookTime"]').forEach(el => {
            el.checked = el.value === prefs.cookTime;
          });
        }
        
        // Budget
        const budgetEl = document.getElementById('budget');
        if (budgetEl && prefs.budget) budgetEl.value = prefs.budget;
        
      }, 50);
    }
  }, [user]);

  const handleAddPantryItem = () => {
    setPantryItems([...pantryItems, { name: '', qty: 1, unit: 'pcs' }]);
  };

  const handlePantryChange = (index, field, value) => {
    const newItems = [...pantryItems];
    newItems[index][field] = value;
    setPantryItems(newItems);
  };

  const removePantryItem = (indexToRemove) => {
    setPantryItems(pantryItems.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Collect all diet prefs
    const selectedDiets = Array.from(document.querySelectorAll('input[name="diet"]:checked')).map(el => el.value);
    const selectedAllergies = Array.from(document.querySelectorAll('input[name="allergy"]:checked')).map(el => el.value);
    const customAllergies = document.getElementById('customAllergies').value.split(',').map(s => s.trim()).filter(Boolean);
    const allAllergies = [...selectedAllergies, ...customAllergies];
    
    const budgetInput = document.getElementById('budget').value;
    const budget = budgetInput ? parseFloat(budgetInput) : null;
    
    // New fields
    const selectedCuisine = Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(el => el.value);
    const cookTime = document.querySelector('input[name="cookTime"]:checked')?.value || 'Standard';
    
    const preferences = {
      dietaryPreferences: [...selectedDiets, ...allAllergies].filter(p => p !== 'no restriction' && p !== 'none'),
      pantry: pantryItems.filter(item => item.name.trim() !== ''),
      budget,
      household,
      cuisine: selectedCuisine.filter(c => c !== 'mixed/no preference'),
      cookTime
    };
    
    const result = await updatePreferences(preferences);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Profile preferences saved!');
    } else {
      toast.error(result.message || 'Failed to save preferences.');
    }
  };

  return (
    <div className="p-4 md:p-margin max-w-2xl mx-auto w-full flex-1 pt-6 md:pt-12 pb-8">
      <div className="mb-8 border-b border-border pb-6">
        <h2 className="font-h1 text-[32px] md:text-hero text-on-surface leading-tight mb-2">Profile Preferences</h2>
        <p className="font-body-lg text-body-lg text-text-secondary">Update your dietary needs, pantry inventory, and household budget.</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 md:p-8 shadow-sm space-y-8">
        
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* 1. Dietary Preference */}
          <div className="space-y-3">
            <label className="font-label-caps text-label-caps uppercase text-text-secondary">Dietary Preference</label>
            <div className="flex flex-wrap gap-2">
              {['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian', 'No Restriction'].map((diet) => (
                <label key={diet} className="cursor-pointer">
                  <input className="peer sr-only" name="diet" type="radio" value={diet.toLowerCase()} />
                  <div className="px-4 py-2 rounded-full border border-border text-on-background font-body-sm text-body-sm peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-colors hover:bg-surface-variant">
                    {diet}
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* 2. Allergies */}
          <div className="space-y-3">
            <label className="font-label-caps text-label-caps uppercase text-text-secondary">Allergies & Dislikes</label>
            <div className="flex flex-wrap pb-2 gap-2">
              {[
                { name: 'Nuts', icon: 'eco', value: 'nuts' },
                { name: 'Dairy', icon: 'local_drink', value: 'dairy' },
                { name: 'Shellfish', icon: 'set_meal', value: 'shellfish' },
                { name: 'Gluten', icon: 'breakfast_dining', value: 'gluten' },
              ].map((allergy) => (
                <label key={allergy.value} className="cursor-pointer shrink-0">
                  <input className="peer sr-only" name="allergy" type="checkbox" value={allergy.value} />
                  <div className="px-3 py-1.5 rounded-full bg-surface-alt text-secondary font-body-sm text-body-sm peer-checked:bg-secondary-container peer-checked:text-on-secondary-container transition-colors flex items-center gap-1 border border-transparent peer-checked:border-secondary-container hover:bg-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">{allergy.icon}</span> {allergy.name}
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-2">
              <input 
                className="block w-full px-4 py-2 border border-border rounded-lg bg-surface text-on-background font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                id="customAllergies" 
                placeholder="Other allergies (comma separated, e.g., soy, sesame)" 
                type="text" 
              />
            </div>
          </div>
          
          {/* 2.5 Cuisine Preferences */}
          <div className="space-y-3">
            <label className="font-label-caps text-label-caps uppercase text-text-secondary">Cuisine Preference</label>
            <div className="flex flex-wrap gap-2">
              {['Indian', 'Continental', 'Asian', 'Mexican', 'Mixed/No preference'].map((cuisine) => (
                <label key={cuisine} className="cursor-pointer">
                  <input className="peer sr-only" name="cuisine" type="radio" value={cuisine.toLowerCase()} />
                  <div className="px-4 py-2 rounded-full border border-border text-on-background font-body-sm text-body-sm peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-colors hover:bg-surface-variant">
                    {cuisine}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 2.6 Cooking Time */}
          <div className="space-y-3">
            <label className="font-label-caps text-label-caps uppercase text-text-secondary">Cooking Time Available</label>
            <div className="flex flex-wrap gap-2">
              {['Quick <30 min/meal', 'Standard', 'Elaborate'].map((time) => (
                <label key={time} className="cursor-pointer">
                  <input className="peer sr-only" name="cookTime" type="radio" value={time} />
                  <div className="px-4 py-2 rounded-full border border-border text-on-background font-body-sm text-body-sm peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-colors hover:bg-surface-variant">
                    {time}
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3. Daily Budget */}
            <div className="space-y-3">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary block" htmlFor="budget">Daily Budget</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary font-body-lg text-body-lg">
                  ₹
                </div>
                <input className="block w-full pl-7 pr-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" id="budget" min="0" name="budget" placeholder="Optional" step="1" type="number" />
              </div>
            </div>
            
            {/* 4. Household Size */}
            <div className="space-y-3">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary block">Household Size</label>
              <div className="flex items-center border border-border rounded-lg bg-surface w-fit">
                <button className="px-3 py-2 text-text-secondary hover:text-primary transition-colors flex items-center" onClick={() => setHousehold(Math.max(1, household - 1))} type="button">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input className="w-12 text-center border-none bg-transparent font-body-lg text-body-lg text-on-background focus:ring-0 p-0 m-0 outline-none" id="household" max="12" min="1" name="household" type="number" value={household} readOnly />
                <button className="px-3 py-2 text-text-secondary hover:text-primary transition-colors flex items-center" onClick={() => setHousehold(Math.min(12, household + 1))} type="button">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 5. Pantry Items */}
          <div className="space-y-3">
            <label className="font-label-caps text-label-caps uppercase text-text-secondary block">What's in your pantry?</label>
            <p className="font-body-sm text-body-sm text-text-secondary mt-1">We'll use what's already in your kitchen first.</p>
            
            <div className="space-y-3">
              {pantryItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <input 
                    className="flex-1 w-full sm:w-auto px-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                    placeholder="Ingredient (e.g., Rice)" 
                    type="text"
                    value={item.name}
                    onChange={(e) => handlePantryChange(index, 'name', e.target.value)}
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input 
                      className="w-24 px-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                      placeholder="Qty" 
                      type="number"
                      min="0"
                      step="any"
                      value={item.qty}
                      onChange={(e) => handlePantryChange(index, 'qty', parseFloat(e.target.value) || '')}
                    />
                    <select
                      className="w-28 px-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={item.unit}
                      onChange={(e) => handlePantryChange(index, 'unit', e.target.value)}
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lbs">lbs</option>
                      <option value="oz">oz</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                      <option value="cups">cups</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="bottle">bottle</option>
                    </select>
                    <button 
                      className="p-2 text-text-secondary hover:text-danger rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center border border-transparent" 
                      type="button" 
                      onClick={() => removePantryItem(index)}
                      title="Remove Item"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={handleAddPantryItem}
                className="flex items-center gap-1 text-primary hover:text-primary-hover font-body-sm font-semibold transition-colors mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add another item
              </button>
            </div>
          </div>
          
          {/* Submit CTA */}
          <div className="pt-6 border-t border-border mt-8 flex justify-end">
            <button 
              className="bg-primary hover:bg-primary-hover text-on-primary font-body-lg text-body-lg font-semibold py-3 px-8 rounded-full transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
              type="button"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="material-symbols-outlined">save</span>}
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
