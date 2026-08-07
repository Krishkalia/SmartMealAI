import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { useNavigate } from 'react-router-dom';
import RecipeDetailModal from './RecipeDetailModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GuidedTour from './GuidedTour';

const RecipeCard = ({ recipe, cost, pantryUsed, substitutions, onRefresh, isRefreshing, onClick }) => {
  const [imgError, setImgError] = useState(false);

  if (!recipe) return null;

  const isIngredientInPantry = (ingName) => {
    return pantryUsed?.some(p => p.name.toLowerCase() === ingName.toLowerCase());
  };

  const defaultImage = "https://images.unsplash.com/photo-149883716733f-56516b530f4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  // Generate a dynamic AI image based on the recipe name
  const dynamicImage = `https://image.pollinations.ai/prompt/delicious%20food%20dish%20${encodeURIComponent(recipe.name)}?width=800&height=600&nologo=true`;

  const getTheme = () => {
    switch (recipe.mealType?.toLowerCase()) {
      case 'breakfast': return {
        pill: 'bg-gradient-to-r from-amber-200/50 to-orange-200/20 text-amber-700 border border-amber-200/50',
        icon: 'brightness_5',
        shadow: 'hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)]'
      };
      case 'lunch': return {
        pill: 'bg-gradient-to-r from-sky-200/50 to-blue-200/20 text-sky-700 border border-sky-200/50',
        icon: 'light_mode',
        shadow: 'hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)]'
      };
      case 'dinner': return {
        pill: 'bg-gradient-to-r from-indigo-200/50 to-purple-200/20 text-indigo-700 border border-indigo-200/50',
        icon: 'nights_stay',
        shadow: 'hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)]'
      };
      default: return {
        pill: 'bg-primary/10 text-primary border border-primary/10',
        icon: 'restaurant',
        shadow: 'hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
      };
    }
  };
  
  const theme = getTheme();

  return (
    <article 
      onClick={() => onClick && onClick(recipe)}
      className={`bg-surface rounded-2xl border border-border shadow-md hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group h-full w-[92%] sm:w-full max-w-md mx-auto ${theme.shadow}`}
    >
      <div className="w-full h-48 sm:h-64 relative overflow-hidden bg-surface-alt shrink-0 flex items-center justify-center">
        {!imgError ? (
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={recipe.imageUrl || dynamicImage || defaultImage}
            alt={recipe.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="material-symbols-outlined text-[140px] text-primary group-hover:scale-110 transition-transform duration-500">restaurant</span>
        )}
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded border border-border">
          <span className="font-body-sm text-xs font-medium text-on-background">₹{cost?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-grow relative">
        {/* Refresh Button */}
        {onRefresh && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRefresh(recipe.mealType.toLowerCase()); }}
            disabled={isRefreshing}
            className="tour-refresh-meal absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-surface-variant text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            title="Get a different meal for this slot"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        )}

        <div className="flex items-center gap-2 mb-3 pr-10">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-xs font-bold ${theme.pill}`}>
            <span className="material-symbols-outlined text-[14px]">{theme.icon}</span>
            {recipe.mealType}
          </span>
          {(recipe.prepTime === 0 || recipe.cookTime === 0) && (
            <span className="bg-secondary/10 text-secondary border border-secondary/10 px-3 py-1 rounded-full font-label-caps text-xs font-bold">Prep Ahead</span>
          )}
        </div>
        <h3 className="font-h2 text-2xl font-bold text-on-background mb-2 group-hover:text-primary transition-colors pr-10 leading-tight">{recipe.name}</h3>
        <p className="font-body-sm text-sm text-text-secondary mb-4 line-clamp-3">{recipe.description || 'A delicious and healthy meal.'}</p>
        <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
          <div className="flex items-center gap-1.5 text-text-secondary bg-surface-alt px-3 py-1.5 rounded">
            <span className="material-symbols-outlined text-[18px]">skillet</span>
            <span className="font-body-sm text-sm font-medium">{recipe.prepTime || 0}m prep</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary bg-surface-alt px-3 py-1.5 rounded">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            <span className="font-body-sm text-sm font-medium">{recipe.cookTime || 0}m cook</span>
          </div>
        </div>
        <div className="flex-grow">
          <h4 className="font-label-caps text-xs text-on-background mb-3 uppercase tracking-wider">Ingredients</h4>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ing, idx) => {
              const inPantry = isIngredientInPantry(ing.name);
              const sub = substitutions?.[ing.name];
              
              let displayQty = `${ing.qty} ${ing.unit}`;
              if (sub) {
                if (sub.replacementQty) {
                  displayQty = `${sub.replacementQty} ${sub.replacementUnit || ''}`;
                } else if (sub.ratio && !sub.ratio.includes(':') && !sub.ratio.includes('x')) {
                  displayQty = sub.ratio.replace(/use/i, '').trim();
                } else if (sub.ratio && sub.ratio.includes('x')) {
                  const multiplier = parseFloat(sub.ratio.replace('x', ''));
                  if (!isNaN(multiplier)) displayQty = `${ing.qty * multiplier} ${ing.unit}`;
                }
              }

              return (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${inPantry ? 'bg-success border-success text-on-primary' : 'border-outline text-transparent'}`}>
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  </div>
                  <div className={`text-sm ${inPantry ? 'text-text-secondary' : 'text-on-background'} flex flex-col`}>
                    <div>
                      {ing.qty > 0 && !sub ? (
                        <>
                          <span className="font-semibold mr-1">{ing.qty}</span>
                          <span className="mr-1">{ing.unit}</span>
                        </>
                      ) : sub ? (
                        <span className="font-semibold mr-1">{displayQty}</span>
                      ) : null}
                      <span className="font-medium">{sub?.substitute || ing.name}</span>
                    </div>
                    {sub && (
                      <span className="text-xs text-text-secondary italic mt-0.5">Instead of {ing.name}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
};

const MealPlanView = ({ setCurrentTab }) => {
  const { planData, refreshMeal, generatePlan, isLoading } = usePlan();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshingMeal, setRefreshingMeal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleRefresh = async (mealType) => {
    setRefreshingMeal(mealType);
    await refreshMeal(planData._id || planData.planId, mealType);
    setRefreshingMeal(null);
  };

  const tourSteps = [
    {
      target: '.tour-change-prefs',
      title: 'Update Your Preferences',
      content: 'Need to change your diet, allergies, or household size? Click here to update your profile and generate a fresh plan.',
      placement: 'bottom',
    },
    {
      target: '.tour-regenerate',
      title: 'Quick Regenerate',
      content: 'Added new items to your Pantry? Click here to instantly generate a new meal plan using what you just added!',
      placement: 'bottom',
    },
    {
      target: '.tour-refresh-meal',
      title: 'Swap Single Meals',
      content: 'Don\'t like a specific meal? Click this refresh button on any card to swap it out for something else without changing the rest of your plan.',
      placement: 'left',
    }
  ];

  if (!planData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 flex-1 text-center h-full min-h-[60vh]">
        <div className="bg-surface-alt w-24 h-24 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px] text-primary">restaurant_menu</span>
        </div>
        <h2 className="font-h2 text-h2 text-on-background font-bold mb-3">No Plan Generated Yet</h2>
        <p className="font-body-lg text-body-lg text-text-secondary max-w-md mb-8">
          You haven't created a meal plan yet. Let's create your personalized AI meal plan based on your dietary preferences and pantry!
        </p>
        <button 
          onClick={() => navigate('/onboarding')}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-label-caps text-label-caps hover:bg-primary-hover transition-colors shadow-sm"
        >
          Create New Plan
        </button>
      </div>
    );
  }

  const { meals, aiMessage, perMealCost, pantryUsed } = planData;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 md:p-8 w-full flex-1 pt-6 md:pt-10 pb-16 bg-gradient-to-br from-amber-100/60 via-sky-100/40 to-indigo-100/60 min-h-full relative z-0 overflow-hidden">
      <GuidedTour steps={tourSteps} tourKey="meal_planner" />
      {/* Background Aesthetic Icons */}
      <div className="absolute top-[-5%] left-[-2%] text-amber-500/10 pointer-events-none -z-10 transform -rotate-12">
        <span className="material-symbols-outlined" style={{ fontSize: '300px', fontVariationSettings: "'FILL' 1" }}>light_mode</span>
      </div>
      <div className="absolute bottom-[-10%] right-[-5%] text-indigo-500/10 pointer-events-none -z-10 transform rotate-12">
        <span className="material-symbols-outlined" style={{ fontSize: '350px', fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
      </div>

      {/* Header / Summary Strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12 border-b border-border pb-6">
        <div>
          <h2 className="font-hero-mobile md:font-hero text-hero-mobile md:text-hero text-on-background leading-tight">Today's Menu</h2>
          <p className="font-body-lg text-body-lg text-text-secondary mt-2">{today}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            onClick={() => setCurrentTab ? setCurrentTab('profile') : navigate('/onboarding')}
            className="tour-change-prefs w-full sm:w-auto px-6 py-3 md:py-2 bg-surface border border-border text-text-secondary rounded-full font-label-caps text-label-caps hover:bg-surface-variant hover:text-on-surface transition-colors shadow-sm flex justify-center items-center"
          >
            Change Prefs
          </button>
          <button 
            onClick={async () => {
              const toastId = toast.loading('Regenerating plan...');
              try {
                const prefs = user?.preferences || {};
                const saved = localStorage.getItem(`smartmeal_pantry_${user?._id || 'guest'}`);
                if (saved) {
                  prefs.pantry = JSON.parse(saved);
                }
                const success = await generatePlan(prefs);
                if (success) {
                  toast.success('Plan generated successfully!', { id: toastId });
                } else {
                  toast.error('Failed to regenerate plan.', { id: toastId });
                }
              } catch (err) {
                toast.error('Network error.', { id: toastId });
              }
            }}
            disabled={isLoading}
            className="tour-regenerate w-full sm:w-auto px-6 py-3 md:py-2 bg-primary text-on-primary rounded-full font-label-caps text-label-caps hover:bg-primary-hover transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">autorenew</span>
            )}
            Regenerate (Current Pantry)
            </button>
          </div>
        {/* Budget Summary Strip */}
        <div className="bg-gradient-to-r from-surface to-surface-alt rounded-2xl p-5 md:p-6 shadow-sm border border-border/50 flex flex-col md:flex-row gap-4 md:items-start w-full md:w-auto max-w-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="w-full z-10">
            <p className="font-label-caps text-label-caps text-primary mb-1.5 font-bold">AI Insights</p>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              "{aiMessage || 'Welcome to your tailored SmartMeal plan.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 max-w-[1400px] mx-auto w-full justify-center">
        <RecipeCard recipe={meals?.breakfast} cost={perMealCost?.Breakfast} pantryUsed={pantryUsed} substitutions={planData.substitutions} onRefresh={handleRefresh} isRefreshing={refreshingMeal === 'breakfast'} onClick={setSelectedRecipe} />
        <RecipeCard recipe={meals?.lunch} cost={perMealCost?.Lunch} pantryUsed={pantryUsed} substitutions={planData.substitutions} onRefresh={handleRefresh} isRefreshing={refreshingMeal === 'lunch'} onClick={setSelectedRecipe} />
        <RecipeCard recipe={meals?.dinner} cost={perMealCost?.Dinner} pantryUsed={pantryUsed} substitutions={planData.substitutions} onRefresh={handleRefresh} isRefreshing={refreshingMeal === 'dinner'} onClick={setSelectedRecipe} />
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          initialServings={user?.preferences?.household || 2}
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
};

export default MealPlanView;
