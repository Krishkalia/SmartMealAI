import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';

const BudgetShoppingList = () => {
  const { planData } = planData || usePlan();
  const [checkedItems, setCheckedItems] = useState({});

  if (!planData) {
    return <div className="p-8 text-center text-text-secondary">No plan data available. Please generate a plan first.</div>;
  }

  const { budget, totalCost, perMealCost, substitutions, shoppingList } = planData;
  const budgetDifference = budget - totalCost;
  const percentUsed = Math.min(100, Math.round((totalCost / budget) * 100)) || 0;
  const isOverBudget = budgetDifference < 0;

  const toggleCheck = (itemName) => {
    setCheckedItems(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const hasSubstitutions = substitutions && Object.keys(substitutions).length > 0;
  const hasShoppingList = shoppingList && Object.keys(shoppingList).length > 0;

  let totalItemsCount = 0;
  if (hasShoppingList) {
    Object.values(shoppingList).forEach(list => {
      totalItemsCount += list.length;
    });
  }

  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 space-y-section-gap-sm md:space-y-section-gap-lg pt-6 md:pt-12">
      {/* TOP SECTION: Budget & Substitutions (Bento Grid) */}
      <section className={`grid grid-cols-1 ${hasSubstitutions && budget ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-gutter`}>
        {/* Budget Analysis Card */}
        {budget && (
        <article className={`${hasSubstitutions ? 'lg:col-span-2' : 'col-span-1 lg:col-span-2'} bg-surface rounded-xl border ${isOverBudget ? 'border-warning' : 'border-border'} p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6">
            <div>
              <h3 className="font-h2 text-h2 text-on-surface mb-1">Budget Analysis</h3>
              {isOverBudget && (
                <span className="bg-warning/20 text-warning px-2 py-1 rounded-md text-body-sm font-medium">Over Budget by ₹{Math.abs(budgetDifference).toFixed(2)}</span>
              )}
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <span className={`font-hero text-[40px] md:text-hero ${isOverBudget ? 'text-warning' : 'text-on-surface'} tracking-tight`}>
                ₹{totalCost?.toFixed(2) || '0.00'}
              </span>
              <span className="font-body-sm text-body-sm text-text-secondary block">of ₹{budget?.toFixed(2) || '0.00'} planned</span>
            </div>
          </div>
          
          {/* Budget Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between font-label-caps text-label-caps text-text-secondary mb-2 uppercase">
              <span>0%</span>
              <span>{percentUsed}% Used</span>
            </div>
            <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
              <div className={`h-full ${isOverBudget ? 'bg-warning' : 'bg-primary'} rounded-full transition-all duration-500 ease-out shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)]`} style={{ width: `${percentUsed}%` }}></div>
            </div>
          </div>
          
          {/* Per-Meal Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Breakfast</p>
              <p className="font-body-lg text-body-lg font-medium">₹{perMealCost?.Breakfast?.toFixed(2) || '0.00'} <span className="text-body-sm text-text-secondary">/meal</span></p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Lunch</p>
              <p className="font-body-lg text-body-lg font-medium">₹{perMealCost?.Lunch?.toFixed(2) || '0.00'} <span className="text-body-sm text-text-secondary">/meal</span></p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Dinner</p>
              <p className="font-body-lg text-body-lg font-medium">₹{perMealCost?.Dinner?.toFixed(2) || '0.00'} <span className="text-body-sm text-text-secondary">/meal</span></p>
            </div>
          </div>
        </article>
        )}

        {/* Substitutions Panel */}
        {hasSubstitutions && (
          <aside className={`${!budget ? 'col-span-1 lg:col-span-2' : ''} bg-surface-container-low rounded-xl border border-border p-6 flex flex-col shadow-sm`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-tertiary-container">lightbulb</span>
              <h3 className="font-h2 text-h2 text-on-surface">Smart Swaps</h3>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary mb-6">Suggested substitutions to meet constraints.</p>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px]">
              {Object.entries(substitutions).map(([original, sub], idx) => (
                <div key={idx} className="bg-surface rounded-lg p-4 border border-outline-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-body-sm text-body-sm text-text-secondary line-through">{original}</p>
                      <p className="font-body-lg text-body-lg font-medium mt-1 text-on-surface">{sub.substitutedWith}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline mx-2">arrow_forward</span>
                  </div>
                  {sub.rationale && <p className="text-body-sm text-text-secondary italic mt-1">{sub.rationale}</p>}
                </div>
              ))}
            </div>
          </aside>
        )}
      </section>

      {/* BOTTOM SECTION: Shopping List */}
      <section className="pb-[100px]">
        <div className="flex justify-between items-end border-b border-border pb-4 mb-8">
          <h2 className="font-h1 text-h1 text-on-surface">Shopping List</h2>
          <span className="font-body-sm text-body-sm text-text-secondary">{totalItemsCount} Items</span>
        </div>
        
        <div className="space-y-12">
          {hasShoppingList ? Object.entries(shoppingList).map(([category, items], idx) => (
            <div key={idx}>
              <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-4 bg-surface-alt inline-block px-3 py-1 rounded-full">{category}</h3>
              <ul className="space-y-2">
                {items.map((item, itemIdx) => {
                  const isChecked = checkedItems[item.ingredientName];
                  const itemCost = item.estimatedCost.toFixed(2);
                  return (
                    <li key={itemIdx} onClick={() => toggleCheck(item.ingredientName)} className="group bg-surface hover:bg-surface-bright border border-transparent hover:border-border rounded-lg p-3 md:p-4 transition-colors shadow-sm hover:shadow-md cursor-pointer flex flex-col">
                      <div className="flex items-center justify-between w-full">
                        <label className="flex items-center gap-4 cursor-pointer flex-1">
                          <input className="peer sr-only" type="checkbox" checked={!!isChecked} readOnly />
                          <div className="w-6 h-6 border-2 border-outline-variant rounded-md flex items-center justify-center transition-colors bg-surface peer-checked:bg-primary peer-checked:border-primary">
                            <span className={`material-symbols-outlined text-on-primary text-sm transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </div>
                          <span className={`font-body-lg text-body-lg text-on-surface transition-all ${isChecked ? 'line-through text-text-secondary' : ''}`}>
                            {item.ingredientName}
                          </span>
                        </label>
                        <div className="flex items-center gap-6 text-right">
                          <span className="font-body-sm text-body-sm text-text-secondary">{item.qty} {item.unit}</span>
                          <span className="font-body-lg text-body-lg font-medium w-16">₹{itemCost}</span>
                        </div>
                      </div>
                      {item.warning && (
                        <div className="ml-10 mt-2 text-warning flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          <span className="font-body-sm text-xs italic">{item.warning}</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )) : (
            <p className="text-text-secondary">Your pantry has everything you need! No shopping required.</p>
          )}
        </div>
      </section>
      
      {/* STICKY TOTAL BAR */}
      <div className="fixed bottom-[72px] md:bottom-0 left-0 md:left-64 right-0 bg-surface border-t border-border shadow-[0_-4px_20px_rgba(31,27,22,0.05)] z-40 px-4 md:px-margin py-4 md:py-6 flex justify-between items-center">
        <div>
          <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Estimated Total</p>
          <p className="font-h2 text-h2 text-on-surface">₹{totalCost?.toFixed(2) || '0.00'}</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-on-primary rounded-full px-6 py-3 font-body-lg text-body-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-xl">ios_share</span>
          <span className="hidden sm:inline">Export List</span>
        </button>
      </div>
    </div>
  );
};

export default BudgetShoppingList;

