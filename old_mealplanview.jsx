import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { useNavigate } from 'react-router-dom';
import RecipeDetailModal from './RecipeDetailModal';
import { useAuth } from '../context/AuthContext';

const RecipeCard = ({ recipe, cost, pantryUsed, onRefresh, isRefreshing, onClick }) => {
  if (!recipe) return null;

  const isIngredientInPantry = (ingName) => {
    return pantryUsed?.some(p => p.name.toLowerCase() === ingName.toLowerCase());
  };

  const defaultImage = "https://images.unsplash.com/photo-149883716733f-56516b530f4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  // Generate a dynamic AI image based on the recipe name
  const dynamicImage = `https://image.pollinations.ai/prompt/delicious%20food%20dish%20${encodeURIComponent(recipe.name)}?width=800&height=600&nologo=true`;

  return (
    <article 
      onClick={() => onClick && onClick(recipe)}
      className="bg-surface rounded-lg border border-border shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer group h-full"
    >
      <div className="w-full h-48 sm:h-56 relative overflow-hidden bg-surface-alt shrink-0">
        <img 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          src={recipe.imageUrl || dynamicImage || defaultImage}
          alt={recipe.name}
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded border border-border">
          <span className="font-body-sm text-xs font-medium text-on-background">Γé╣{cost?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-grow relative">
        {/* Refresh Button */}
        {onRefresh && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRefresh(recipe.mealType.toLowerCase()); }}
            disabled={isRefreshing}
            className="absolute top-4 right-4 p-2 rounded-full bg-surface-variant text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            title="Get a different meal for this slot"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        )}

        <div className="flex items-center gap-2 mb-3 pr-10">
          <span className="bg-surface-alt text-text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps">{recipe.mealType}</span>
          {(recipe.prepTime === 0 || recipe.cookTime === 0) && (
            <span className="bg-surface-alt text-text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps">Prep Ahead</span>
          )}
        </div>
        <h3 className="font-h2 text-xl font-bold text-on-background mb-2 group-hover:text-primary transition-colors pr-10">{recipe.name}</h3>
        <p className="font-body-sm text-body-sm text-text-secondary mb-4 line-clamp-2">{recipe.description || 'A delicious and healthy meal.'}</p>
        <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
          <div className="flex items-center gap-1.5 text-text-secondary bg-surface-alt px-2 py-1 rounded">
            <span className="material-symbols-outlined text-[16px]">skillet</span>
            <span className="font-body-sm text-xs font-medium">{recipe.prepTime || 0}m prep</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary bg-surface-alt px-2 py-1 rounded">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span className="font-body-sm text-xs font-medium">{recipe.cookTime || 0}m cook</span>
          </div>
        </div>
        <div className="flex-grow">
          <h4 className="font-label-caps text-label-caps text-on-background mb-3">Ingredients</h4>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ing, idx) => {
              const inPantry = isIngredientInPantry(ing.name);
              return (
                <li key={idx} className="flex items-start gap-2 font-body-sm text-body-sm text-text-secondary">
                  {inPantry ? (
                    <span className="material-symbols-outlined text-[16px] text-success mt-0.5">check_circle</span>
                  ) : (
                    <span className="w-4 h-4 rounded border border-outline mt-0.5 inline-block"></span>
                  )}
                  <span className={!inPantry ? "text-on-background font-medium" : ""}>
                    {ing.qty} {ing.unit} {ing.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
};

const MealPlanView = () => {
  const { planData, refreshMeal } = usePlan();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshingMeal, setRefreshingMeal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleRefresh = async (mealType) => {
    setRefreshingMeal(mealType);
    await refreshMeal(planData._id || planData.planId, mealType);
    setRefreshingMeal(null);
  };

  if (!planData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-margin flex-1 text-center h-full min-h-[60vh]">
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
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 pt-6 md:pt-12 pb-8">
      {/* Header / Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-6">
        <div className="flex flex-row items-center justify-between md:flex-col md:items-start gap-4 w-full md:w-auto">
          <div>
            <h2 className="font-hero-mobile md:font-hero text-hero-mobile md:text-hero text-on-background">Today's Menu</h2>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">{today}</p>
          </div>
          <button 
            onClick={() => navigate('/onboarding')}
            className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-caps text-label-caps hover:bg-primary-container hover:text-primary transition-colors"
          >
            New Plan
          </button>
        </div>
        {/* Budget Summary Strip */}
        <div className="bg-surface rounded-xl p-4 md:p-6 shadow-sm border border-border flex flex-col md:flex-row gap-6 md:items-center w-full md:w-auto max-w-xl">
          <div className="w-full">
            <p className="font-label-caps text-label-caps text-text-secondary mb-2">AI Insights</p>
            <p className="font-body-sm text-body-sm text-on-surface italic">
              "{aiMessage || 'Welcome to your tailored SmartMeal plan.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecipeCard recipe={meals?.breakfast} cost={perMealCost?.Breakfast} pantryUsed={pantryUsed} onRefresh={handleRefresh} isRefreshing={refreshingMeal === 'breakfast'} onClick={setSelectedRecipe} />
        <RecipeCard recipe={meals?.lunch} cost={perMealCost?.Lunch} pantryUsed={pantryUsed} onRefresh={handleRefresh} isRefreshing={refreshingMeal === 'lunch'} onClick={setSelectedRecipe} />
        <RecipeCard recipe={meals?.dinner} cost={perMealCost?.Dinner} pantryUsed={pantryUsed} onRefresh={handleRefresh} isRefreshing={refreshingMeal === 'dinner'} onClick={setSelectedRecipe} />
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
