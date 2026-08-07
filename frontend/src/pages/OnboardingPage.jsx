import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { generatePlan, isLoading } = usePlan();
  const { updatePreferences, user } = useAuth();
  
  const prefs = user?.preferences || {};
  
  const [household, setHousehold] = useState(prefs.household || 2);
  const [pantryItems, setPantryItems] = useState(prefs.pantry?.length > 0 ? prefs.pantry : []);

  React.useEffect(() => {
    if (!prefs.pantry || prefs.pantry.length === 0) {
      const saved = localStorage.getItem('smartmeal_pantry');
      if (saved) {
        try {
          setPantryItems(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse pantry data', e);
        }
      } else {
        setPantryItems([
          { name: 'Olive Oil', qty: 1, unit: 'bottle' },
          { name: 'Basmati Rice', qty: 2, unit: 'kg' }
        ]);
      }
    }
  }, [prefs.pantry]);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const quotes = [
    "Building a plan perfect for you...",
    "Are you hungry yet?",
    "Consulting the digital chefs...",
    "Chopping the virtual onions...",
    "Sprinkling some AI magic..."
  ];

  React.useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const initialDiets = ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian'];
  const userDiet = prefs.dietaryPreferences?.find(p => initialDiets.includes(p)) || 'no restriction';
  
  const predefinedAllergies = ['nuts', 'dairy', 'shellfish', 'gluten'];
  const userAllergies = prefs.dietaryPreferences?.filter(p => predefinedAllergies.includes(p)) || [];
  const userCustomAllergies = prefs.dietaryPreferences?.filter(p => !predefinedAllergies.includes(p) && !initialDiets.includes(p)) || [];
  
  const userCuisine = prefs.cuisine?.length > 0 ? prefs.cuisine[0] : 'mixed/no preference';

  const savePantry = (items) => {
    setPantryItems(items);
    localStorage.setItem('smartmeal_pantry', JSON.stringify(items));
  };

  const [isGeneratingPantry, setIsGeneratingPantry] = useState(false);

  const handleAutoFillPantry = async () => {
    setIsGeneratingPantry(true);
    const toastId = toast.loading('Consulting AI for common pantry staples...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/plan/common-pantry', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success && result.data) {
        // filter out items already in pantry
        const newItems = result.data.filter(aiItem => 
          !pantryItems.some(pItem => pItem.name.toLowerCase() === aiItem.name.toLowerCase())
        );
        const combined = [...pantryItems, ...newItems];
        savePantry(combined);
        toast.success(`Added ${newItems.length} common items!`, { id: toastId });
      } else {
        toast.error('Failed to get pantry items.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error.', { id: toastId });
    } finally {
      setIsGeneratingPantry(false);
    }
  };

  const handleAddPantryItem = () => {
    savePantry([...pantryItems, { name: '', qty: 1, unit: 'pcs' }]);
  };

  const handlePantryChange = (index, field, value) => {
    const newItems = [...pantryItems];
    newItems[index][field] = value;
    savePantry(newItems);
  };

  const removePantryItem = (indexToRemove) => {
    savePantry(pantryItems.filter((_, index) => index !== indexToRemove));
  };

  const handleGeneratePlan = async () => {
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
    
    const success = await generatePlan(preferences);
    if (success) {
      // Save to user profile
      await updatePreferences(preferences);
      toast.success('Meal plan generated successfully!');
      navigate('/dashboard');
    } else {
      toast.error('Failed to generate meal plan.');
    }
  };
  return (
    <div className="min-h-screen font-body-lg antialiased bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* Full-Screen Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300">
          <div className="relative">
            {/* "Magic sparks" - absolute positioned animated dots */}
            <div className="absolute -top-6 -left-6 w-3 h-3 bg-primary rounded-full animate-ping"></div>
            <div className="absolute -bottom-8 -right-8 w-4 h-4 bg-secondary rounded-full animate-pulse delay-100"></div>
            <div className="absolute top-1/2 -right-12 w-2 h-2 bg-warning rounded-full animate-ping delay-300"></div>
            <div className="absolute -bottom-2 -left-12 w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
            <div className="absolute -top-8 right-0 w-2 h-2 bg-success rounded-full animate-pulse delay-75"></div>
            
            <Loader2 className="w-20 h-20 text-primary animate-spin" />
          </div>
          
          <div className="h-20 mt-12 flex flex-col items-center justify-center">
            <h2 key={quoteIndex} className="font-h1 text-[28px] md:text-[36px] text-on-surface text-center px-4 animate-[fadeIn_0.5s_ease-out]">
              {quotes[quoteIndex]}
            </h2>
          </div>
          
          <p className="mt-4 text-text-secondary font-body-lg text-center max-w-md px-4">
            This might take a few seconds. We're doing the heavy lifting to find the perfect recipes and deals!
          </p>
        </div>
      )}

      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-background/90 backdrop-blur-sm flex justify-between items-center px-margin py-4 max-w-max-width mx-auto border-b border-border transition-all">
        <h1 className="font-h1 text-h1 font-bold text-primary">SmartMeal AI</h1>
      </header>

      <main className="py-section-gap-sm px-4 md:px-margin max-w-4xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h2 className="font-h1 text-[32px] md:text-hero text-on-surface leading-tight mb-4">Tell us how you eat.</h2>
          <p className="font-body-lg text-body-lg text-text-secondary">We'll craft a plan that fits your life, your pantry, and your budget.</p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 md:p-8 shadow-sm space-y-8">
          
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            {/* 1. Dietary Preference */}
            <div className="space-y-3">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary">Dietary Preference</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian', 'No Restriction'].map((diet) => (
                  <label key={diet} className="cursor-pointer">
                    <input className="peer sr-only" name="diet" type="radio" value={diet.toLowerCase()} defaultChecked={diet.toLowerCase() === userDiet} />
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
                    <input className="peer sr-only" name="allergy" type="checkbox" value={allergy.value} defaultChecked={userAllergies.includes(allergy.value)} />
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
                  defaultValue={userCustomAllergies.join(', ')}
                />
              </div>
            </div>
            
            {/* 2.5 Cuisine Preferences */}
            <div className="space-y-3">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary">Cuisine Preference</label>
              <div className="flex flex-wrap gap-2">
                {['Indian', 'Continental', 'Asian', 'Mexican', 'Mixed/No preference'].map((cuisine) => (
                  <label key={cuisine} className="cursor-pointer">
                    <input className="peer sr-only" name="cuisine" type="radio" value={cuisine.toLowerCase()} defaultChecked={cuisine.toLowerCase() === userCuisine} />
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
                    <input className="peer sr-only" name="cookTime" type="radio" value={time} defaultChecked={time === (prefs.cookTime || 'Standard')} />
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
                  <input className="block w-full pl-7 pr-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" id="budget" min="0" name="budget" placeholder="Optional" step="1" type="number" defaultValue={prefs.budget || ''} />
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
                
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <button 
                    type="button" 
                    onClick={handleAddPantryItem}
                    className="flex items-center gap-1 text-primary hover:text-primary-hover font-body-sm font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add another item
                  </button>
                  <button 
                    type="button" 
                    onClick={handleAutoFillPantry}
                    disabled={isGeneratingPantry}
                    className="flex items-center gap-1 text-secondary hover:text-secondary-hover font-body-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isGeneratingPantry ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    )}
                    {isGeneratingPantry ? 'Adding staples...' : 'Auto-add common staples (AI)'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Submit CTA */}
            <div className="pt-6 border-t border-border mt-8">
              <button 
                className="w-full bg-primary hover:bg-primary-hover text-on-primary font-body-lg text-body-lg font-semibold py-3 px-6 rounded-full transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" 
                type="button"
                onClick={handleGeneratePlan}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
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
