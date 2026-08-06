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
      <div className="relative max-w-4xl mx-auto">
        {/* The line */}
        <div className="absolute left-[20px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-border z-0"></div>

        {timeline.map((step, idx) => {
          const isEven = idx % 2 === 0;
          const isLast = idx === timeline.length - 1;
          const timeLabel = `T + ${step.timeOffset}m`;

          return (
            <div key={idx} className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 group">
              {/* Left Side (Desktop) */}
              <div className={`hidden md:block w-5/12 ${isEven ? 'text-right pr-8' : 'order-last text-left pl-8'}`}>
                {isEven ? (
                  <>
                    <div className="font-h2 text-h2 text-on-background mb-1 capitalize">{getStepTitle(step.type)} ({step.mealType})</div>
                    <p className="text-text-secondary text-body-sm mb-3">{step.phrasedInstruction || step.instruction}</p>
                    <button 
                      onClick={() => handleOpenRecipe(step.mealType)}
                      className="text-primary hover:text-primary-hover font-label-caps text-label-caps text-sm flex items-center justify-end gap-1 w-full"
                    >
                      Detailed Recipe <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-start gap-3 mb-2">
                      <span className="font-label-caps text-label-caps text-primary font-bold">{timeLabel}</span>
                    </div>
                    <div className="font-h2 text-h2 text-on-background mb-1 capitalize">{getStepTitle(step.type)} ({step.mealType})</div>
                    <button 
                      onClick={() => handleOpenRecipe(step.mealType)}
                      className="text-primary hover:text-primary-hover font-label-caps text-label-caps text-sm flex items-center justify-start gap-1 w-full mt-3"
                    >
                      Detailed Recipe <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </button>
                  </>
                )}
              </div>

              {/* Center Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shadow-sm flex-shrink-0 mb-4 md:mb-0 ml-[2px] md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 transition-transform group-hover:scale-110 ${getColorForType(step.type)} ${isEven ? '' : 'order-2'}`}>
                <span className={`material-symbols-outlined text-body-lg ${step.type === 'cook' ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {getIconForType(step.type)}
                </span>
              </div>

              {/* Right Side (Desktop) & Full Content (Mobile) */}
              <div className={`w-full md:w-5/12 ${isEven ? 'pl-12 md:pl-8 -mt-12 md:mt-0' : 'pl-12 md:pr-8 md:pl-0 md:text-right -mt-12 md:mt-0 order-1 md:order-none'}`}>
                {/* Mobile specific headers */}
                <div className="md:hidden font-h2 text-h2 text-on-background mb-1 capitalize">{getStepTitle(step.type)} ({step.mealType})</div>
                <div className={`flex items-center gap-3 mb-2 ${isEven ? '' : 'md:hidden'}`}>
                  <span className={`font-label-caps text-label-caps font-bold ${isEven ? 'text-success' : 'text-primary'}`}>{timeLabel}</span>
                </div>
                
                {isEven ? (
                  <div className="md:hidden text-text-secondary text-body-sm bg-surface p-4 rounded-lg border border-border shadow-sm mt-2">
                    <p>{step.phrasedInstruction || step.instruction}</p>
                    <button 
                      onClick={() => handleOpenRecipe(step.mealType)}
                      className="text-primary hover:text-primary-hover font-label-caps text-label-caps text-sm flex items-center justify-start gap-1 w-full mt-3"
                    >
                      Detailed Recipe <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface p-4 md:p-6 rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md text-left md:text-right">
                    <p className="text-text-secondary text-body-sm">{step.phrasedInstruction || step.instruction}</p>
                    <p className="text-text-secondary text-body-sm mt-2 font-medium mb-3">{step.duration} min</p>
                    <button 
                      onClick={() => handleOpenRecipe(step.mealType)}
                      className="text-primary hover:text-primary-hover font-label-caps text-label-caps text-sm flex items-center justify-start md:justify-end gap-1 w-full"
                    >
                      Detailed Recipe <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </button>
                  </div>
                )}
                
                {/* When Even, show right side for desktop */}
                {isEven && (
                  <div className="hidden md:block">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-label-caps text-label-caps text-success font-bold">{timeLabel}</span>
                    </div>
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
