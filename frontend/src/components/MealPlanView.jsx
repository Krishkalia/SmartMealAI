import React from 'react';
import { usePlan } from '../context/PlanContext';

const MealPlanView = () => {
  const { planData } = usePlan();

  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 pt-6 md:pt-12 pb-8">
      {/* Header / Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-6">
        <div>
          <h2 className="font-hero-mobile md:font-hero text-hero-mobile md:text-hero text-on-background">Today's Menu</h2>
          <p className="font-body-lg text-body-lg text-text-secondary mt-2">Thursday, October 26th</p>
        </div>
        {/* Budget Summary Strip */}
        <div className="bg-surface rounded-xl p-4 md:p-6 shadow-sm border border-border flex flex-col md:flex-row gap-6 md:items-center w-full md:w-auto max-w-xl">
          <div className="w-full">
            <p className="font-label-caps text-label-caps text-text-secondary mb-2">AI Insights</p>
            <p className="font-body-sm text-body-sm text-on-surface italic">
              "{planData?.aiMessage || 'Welcome to your tailored SmartMeal plan.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Breakfast Card */}
        <article className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer group">
          <div className="h-48 w-full relative overflow-hidden bg-surface-alt">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-p437fUj5ehbb55M0gkkjxpcRDcJqhrT9RucMPMIkUok65tSgrCr3BimqgmXT8tlcZvOE7nEA9eh_ojKgWwT8M8QvzSb5pIMYub12eCyeJdXnyIYWcD6TNka_QEpEd-IXL9eUHnoxfGerNt_Mbzca85nQVW5sIc1USJtHVnDKW1s8xiJwKXrrRPx0LLeSRlk13eaXPkeJ1-LH-4g6MSyNqRFGoLAXzWMpX9I414m9jVhjEZtQC4YHWw"
              alt="Berry Almond Oatmeal"
            />
            <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
              <span className="font-label-caps text-label-caps text-on-background">$4.20</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-surface-alt text-text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps">Breakfast</span>
            </div>
            <h3 className="font-h2 text-h2 text-on-background mb-2 group-hover:text-primary transition-colors">Berry Almond Oatmeal</h3>
            <p className="font-body-sm text-body-sm text-text-secondary mb-6 line-clamp-2">A warming start to the day with steel-cut oats, fresh seasonal berries, and toasted almonds for crunch.</p>
            <div className="flex items-center gap-4 mb-6 border-y border-border py-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">skillet</span>
                <span className="font-body-sm text-body-sm">5m prep</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span className="font-body-sm text-body-sm">15m cook</span>
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-label-caps text-label-caps text-on-background mb-3">Ingredients</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 font-body-sm text-body-sm text-text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-success mt-0.5">check_circle</span>
                  <span>1/2 cup Steel-cut oats</span>
                </li>
                <li className="flex items-start gap-2 font-body-sm text-body-sm text-text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-success mt-0.5">check_circle</span>
                  <span>1 tbsp Honey</span>
                </li>
                <li className="flex items-start gap-2 font-body-sm text-body-sm text-on-background font-medium">
                  <span className="w-4 h-4 rounded border border-outline mt-0.5 inline-block"></span>
                  <span>1 cup Mixed berries</span>
                </li>
              </ul>
            </div>
          </div>
        </article>

        {/* Lunch Card */}
        <article className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer group">
          <div className="h-48 w-full relative overflow-hidden bg-surface-alt">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDziFrk9ut9OeXWin3gCq662IyteuGoGCj_wySSUhNtp-JVA5e25FWxvupoGGOA0FHa4FiXp0xb3eL60ROfqDfu6qhT4Pvwjtuqvt1RP-l0wBbubVWDgQwMR7EW4-8JDojFO3iyALuBWVGOWQ5LK0t44I0XA1ITk0nOfR72mfE7Ijki7WjdKejgFObADIdJbKQwYPLNBDjEiNXaKxKT5f49jUi_a5db1lSNay-2FRtNuhBcGDAz2oTimw"
              alt="Mediterranean Quinoa Bowl"
            />
            <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
              <span className="font-label-caps text-label-caps text-on-background">$7.50</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-surface-alt text-text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps">Lunch</span>
              <span className="bg-surface-alt text-text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps">Prep Ahead</span>
            </div>
            <h3 className="font-h2 text-h2 text-on-background mb-2 group-hover:text-primary transition-colors">Mediterranean Quinoa Bowl</h3>
            <p className="font-body-sm text-body-sm text-text-secondary mb-6 line-clamp-2">A crisp, refreshing bowl packed with plant-based protein, cucumber, tomatoes, and a bright lemon vinaigrette.</p>
            <div className="flex items-center gap-4 mb-6 border-y border-border py-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">skillet</span>
                <span className="font-body-sm text-body-sm">15m prep</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span className="font-body-sm text-body-sm">0m cook</span>
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-label-caps text-label-caps text-on-background mb-3">Ingredients</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 font-body-sm text-body-sm text-text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-success mt-0.5">check_circle</span>
                  <span>1 cup Pre-cooked quinoa</span>
                </li>
                <li className="flex items-start gap-2 font-body-sm text-body-sm text-on-background font-medium">
                  <span className="w-4 h-4 rounded border border-outline mt-0.5 inline-block"></span>
                  <span>1/2 Cucumber, diced</span>
                </li>
              </ul>
            </div>
          </div>
        </article>

        {/* Dinner Card */}
        <article className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer group">
          <div className="h-48 w-full relative overflow-hidden bg-surface-alt">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfm1qO6y4n82FU1tkJ3-HZ3bmjwzFzfuOQrmSlzjqXa4pI5OQlsGz7MA8U4Xxl6Clk9BG7LnXpViPKUhMEtLvktNOOLPdr_EuZhsK2CdUxpbVLJe2MeWdN4TMQtxX16gRleYkcE9J8VJLaVwqWXZG1tk_dkJtKxHxDCg2Gv6f8AoDJCmtLxjGkb8smE-pbt80Hn3pN78SUicO-G_UJMBzHyduM8J9Sg0iw7ENijuy_M_lEKvoEilx4-w"
              alt="Pan-Seared Salmon"
            />
            <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
              <span className="font-label-caps text-label-caps text-on-background">$12.80</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-surface-alt text-text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps">Dinner</span>
            </div>
            <h3 className="font-h2 text-h2 text-on-background mb-2 group-hover:text-primary transition-colors">Pan-Seared Salmon</h3>
            <p className="font-body-sm text-body-sm text-text-secondary mb-6 line-clamp-2">Crispy skin salmon fillet served alongside blistered seasonal asparagus and a light dill sauce.</p>
            <div className="flex items-center gap-4 mb-6 border-y border-border py-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">skillet</span>
                <span className="font-body-sm text-body-sm">10m prep</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span className="font-body-sm text-body-sm">20m cook</span>
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-label-caps text-label-caps text-on-background mb-3">Ingredients</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 font-body-sm text-body-sm text-on-background font-medium">
                  <span className="w-4 h-4 rounded border border-outline mt-0.5 inline-block"></span>
                  <span>2x 6oz Salmon fillets</span>
                </li>
                <li className="flex items-start gap-2 font-body-sm text-body-sm text-on-background font-medium">
                  <span className="w-4 h-4 rounded border border-outline mt-0.5 inline-block"></span>
                  <span>1 bunch Asparagus</span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default MealPlanView;
