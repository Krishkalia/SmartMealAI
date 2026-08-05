import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { generatePlan, isLoading } = usePlan();
  
  const [household, setHousehold] = useState(2);
  const [pantryItem, setPantryItem] = useState('');
  const [pantryItems, setPantryItems] = useState(['Olive Oil', 'Basmati Rice']);

  const handlePantryKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pantryItem.trim() !== '') {
        setPantryItems([...pantryItems, pantryItem.trim()]);
        setPantryItem('');
      }
    }
  };

  const removePantryItem = (indexToRemove) => {
    setPantryItems(pantryItems.filter((_, index) => index !== indexToRemove));
  };

  const handleGeneratePlan = async () => {
    // Collect all diet prefs
    const selectedDiets = Array.from(document.querySelectorAll('input[name="diet"]:checked')).map(el => el.value);
    const selectedAllergies = Array.from(document.querySelectorAll('input[name="allergy"]:checked')).map(el => el.value);
    const budget = parseFloat(document.getElementById('budget').value) || 25.00;
    
    const preferences = {
      dietaryPreferences: [...selectedDiets, ...selectedAllergies].filter(p => p !== 'no restriction'),
      pantry: pantryItems.map(item => ({ name: item, qty: 1, unit: 'unit' })),
      budget,
      household
    };
    
    await generatePlan(preferences);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col font-body-lg antialiased bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* Top App Bar (Suppress Navigation - Onboarding Intent) */}
      <header className="w-full sticky top-0 z-50 bg-background flex justify-between items-center px-margin py-4 max-w-max-width mx-auto border-b border-border dark:border-outline-variant">
        <div className="font-h1 text-h1 font-bold text-primary">SmartMeal AI</div>
      </header>
      
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center py-section-gap-sm px-4 md:px-margin max-w-max-width mx-auto w-full">
        <div className="w-full max-w-2xl bg-surface rounded-xl border border-border p-6 md:p-10 shadow-sm md:shadow-md">
          <div className="mb-8 text-center">
            <h1 className="font-hero-mobile text-hero-mobile md:font-hero md:text-h1 text-primary mb-2">Let's set your table</h1>
            <p className="font-body-lg text-body-lg text-text-secondary">Tell us a bit about how you eat, and we'll craft the perfect plan.</p>
          </div>
          
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            {/* 1. Dietary Preference */}
            <div className="space-y-3">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary">Dietary Preference</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto', 'No Restriction'].map((diet) => (
                  <label key={diet} className="cursor-pointer">
                    <input className="peer sr-only" name="diet" type="radio" value={diet.toLowerCase()} defaultChecked={diet === 'No Restriction'} />
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Daily Budget */}
              <div className="space-y-3">
                <label className="font-label-caps text-label-caps uppercase text-text-secondary block" htmlFor="budget">Daily Budget</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary font-body-lg text-body-lg">
                    $
                  </div>
                  <input className="block w-full pl-7 pr-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" id="budget" min="0" name="budget" placeholder="25.00" step="0.50" type="number" />
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
              <label className="font-label-caps text-label-caps uppercase text-text-secondary block" htmlFor="pantry">What's in your pantry?</label>
              <p className="font-body-sm text-body-sm text-text-secondary mt-1">We'll use what's already in your kitchen first.</p>
              <div className="relative">
                <input 
                  className="block w-full px-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-2" 
                  id="pantry" 
                  placeholder="e.g., Rice, Pasta, Olive Oil... (press enter)" 
                  type="text"
                  value={pantryItem}
                  onChange={(e) => setPantryItem(e.target.value)}
                  onKeyDown={handlePantryKeyDown}
                />
                
                {/* Added tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {pantryItems.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-alt text-on-background font-body-sm text-body-sm">
                      {item} 
                      <button className="text-text-secondary hover:text-danger flex items-center" type="button" onClick={() => removePantryItem(index)}>
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Submit CTA */}
            <div className="pt-6 border-t border-border mt-8">
              <button 
                className="w-full bg-primary hover:bg-primary-hover text-on-primary font-body-lg text-body-lg font-semibold py-3 px-6 rounded-full transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
                type="button"
                onClick={handleGeneratePlan}
                disabled={isLoading}
              >
                {isLoading ? 'Generating Plan...' : 'Generate My Plan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
