import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import RecipeDetailModal from './RecipeDetailModal';

const CookingTimeline = () => {
  const { planData } = usePlan();
  const { user } = useAuth();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  if (!planData) {
    return <div className="p-8 text-center text-text-secondary">No plan data available. Please generate a plan first.</div>;
  }

  const { timeline = [], activeTimeWarning } = planData;
  const completedPercent = 0; // Interactive completion not required yet but can be added

  const getIconForType = (type) => {
    switch (type) {
      case 'prep': return 'kitchen';
      case 'cook': return 'restaurant';
      case 'wait': return 'timer';
      default: return 'done';
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'prep': return 'bg-surface text-text-secondary border-background';
      case 'cook': return 'bg-primary text-on-primary border-background';
      case 'wait': return 'bg-secondary text-on-secondary border-background';
      default: return 'bg-success text-on-primary border-background';
    }
  };

  const getStepTitle = (type) => {
    if (type === 'prep') return 'Preparation Step';
    return `${type} Step`;
  };

  const handleOpenRecipe = (mealType) => {
    if (!mealType) return;
    const mealKey = mealType.toLowerCase();
    if (planData.meals && planData.meals[mealKey]) {
      setSelectedRecipe(planData.meals[mealKey]);
    }
  };

  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 pt-6 md:pt-12 pb-24">
      {/* Header Section */}
      <div className="mb-section-gap-sm md:mb-section-gap-lg text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="font-hero-mobile text-hero-mobile md:font-hero md:text-h1 text-primary mb-2">Today's Timeline</h1>
          <p className="text-text-secondary font-body-lg text-body-lg max-w-2xl">Your beautifully orchestrated schedule for today's meals. Follow along for perfect timing.</p>
        </div>
      </div>

      {activeTimeWarning && (
        <div className="mb-8 p-4 bg-warning/20 border border-warning rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-warning mt-0.5">warning</span>
          <div>
            <h4 className="font-label-caps text-label-caps text-warning mb-1 uppercase">High Active Time Warning</h4>
            <p className="font-body-sm text-body-sm text-on-surface">{activeTimeWarning}</p>
          </div>
        </div>
      )}

      {/* Timeline Container */}
      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        {/* The line */}
        <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-border z-0"></div>

        {timeline.map((step, idx) => {
          const isEven = idx % 2 === 0;
          const timeLabel = `T + ${step.timeOffset}m`;
          const isLastForMeal = timeline.slice(idx + 1).findIndex(s => s.mealType === step.mealType) === -1;

          return (
            <div key={idx} className="relative z-10 flex flex-row items-start md:items-center w-full mb-10 md:mb-12 group">
              
              {/* Left Content (Desktop Only) */}
              <div className="hidden md:flex w-1/2 justify-end pr-12">
                {isEven && (
                  <div className="text-right w-full flex flex-col items-end">
                    <div className="font-label-caps text-label-caps text-primary font-bold mb-2">{timeLabel}</div>
                    <div className="font-h2 text-h2 text-on-background mb-3 capitalize">{getStepTitle(step.type)} ({step.mealType})</div>
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow inline-block w-full max-w-sm text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -ml-4 -mt-4 pointer-events-none"></div>
                      <p className="text-text-secondary text-body-sm relative z-10">{step.phrasedInstruction || step.instruction}</p>
                      {step.duration > 0 && <p className="text-text-secondary text-body-sm mt-3 font-medium flex items-center gap-1 relative z-10"><span className="material-symbols-outlined text-[16px]">schedule</span> {step.duration} min</p>}
                    </div>
                    {isLastForMeal && (
                      <button onClick={() => handleOpenRecipe(step.mealType)} className="text-primary hover:text-primary-hover font-label-caps text-label-caps text-sm flex items-center justify-end gap-1 w-full mt-4">
                        Detailed Recipe <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Center Icon (Mobile & Desktop) */}
              <div className={`absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 shadow-sm flex-shrink-0 z-10 transition-transform group-hover:scale-110 md:mt-0 ${getColorForType(step.type)}`} style={{ marginTop: '2px' }}>
                <span className={`material-symbols-outlined text-[20px] ${step.type === 'cook' ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {getIconForType(step.type)}
                </span>
              </div>

              {/* Right Content (Desktop) & Full Content (Mobile) */}
              <div className="w-full md:w-1/2 pl-14 md:pl-12 flex justify-start">
                
                {/* Mobile View Content (Always shows here) */}
                <div className="block md:hidden w-full text-left">
                   <div className="font-label-caps text-label-caps text-primary font-bold mb-1.5">{timeLabel}</div>
                   <div className="font-h2 text-h2 text-on-background mb-3 capitalize leading-tight">{getStepTitle(step.type)} <br/><span className="text-body-sm font-normal text-text-secondary">({step.mealType})</span></div>
                   <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm w-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none"></div>
                      <p className="text-text-secondary text-body-sm relative z-10">{step.phrasedInstruction || step.instruction}</p>
                      {step.duration > 0 && <p className="text-text-secondary text-body-sm mt-3 font-medium flex items-center gap-1 relative z-10"><span className="material-symbols-outlined text-[16px]">schedule</span> {step.duration} min</p>}
                   </div>
                   {isLastForMeal && (
                      <button onClick={() => handleOpenRecipe(step.mealType)} className="text-primary hover:text-primary-hover font-label-caps text-label-caps text-sm flex items-center justify-start gap-1 w-full mt-4">
                        Detailed Recipe <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      </button>
                    )}
                </div>

                {/* Desktop View Right Content (Only shows on odd indexes) */}
                {!isEven && (
                  <div className="hidden md:flex text-left w-full flex-col items-start">
                    <div className="font-label-caps text-label-caps text-primary font-bold mb-2">{timeLabel}</div>
                    <div className="font-h2 text-h2 text-on-background mb-3 capitalize">{getStepTitle(step.type)} ({step.mealType})</div>
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow inline-block w-full max-w-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none"></div>
                      <p className="text-text-secondary text-body-sm relative z-10">{step.phrasedInstruction || step.instruction}</p>
                      {step.duration > 0 && <p className="text-text-secondary text-body-sm mt-3 font-medium flex items-center gap-1 relative z-10"><span className="material-symbols-outlined text-[16px]">schedule</span> {step.duration} min</p>}
                    </div>
                    {isLastForMeal && (
                      <button onClick={() => handleOpenRecipe(step.mealType)} className="text-primary hover:text-primary-hover font-label-caps text-label-caps text-sm flex items-center justify-start gap-1 w-full mt-4">
                        Detailed Recipe <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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

export default CookingTimeline;
