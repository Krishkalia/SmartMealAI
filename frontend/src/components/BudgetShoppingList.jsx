import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';
import GuidedTour from './GuidedTour';

const MySwal = withReactContent(Swal);

const BudgetShoppingList = () => {
  const { planData, fetchSubstituteOptions, swapIngredient, addManualItem } = usePlan();
  const [checkedItems, setCheckedItems] = useState({});
  const [swappingItem, setSwappingItem] = useState(null);
  const [manualItemText, setManualItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [parentRef] = useAutoAnimate();

  const handleSwap = async (e, item) => {
    e.stopPropagation();
    
    // 1. Show loading modal
    MySwal.fire({
      title: 'Finding Alternatives...',
      html: `Looking for the best substitutes for <b>${item.ingredientName}</b>.`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        MySwal.showLoading();
      },
      customClass: {
        popup: 'rounded-2xl border border-border shadow-large bg-surface',
        title: 'font-h2 text-h2 font-bold text-on-background',
        htmlContainer: 'font-body-lg text-text-secondary mt-2',
      }
    });

    // 2. Fetch options from backend
    const options = await fetchSubstituteOptions(item.ingredientName, item.qty, item.unit);

    // 3. Close if failed
    if (!options || options.length === 0) {
      MySwal.fire({
        title: 'No Alternatives Found',
        text: 'We couldn\'t find a safe substitute for this ingredient.',
        icon: 'error',
        confirmButtonText: 'Close',
        customClass: {
          popup: 'rounded-2xl border border-border shadow-large bg-surface',
          confirmButton: 'bg-primary hover:bg-primary-hover text-on-primary font-label-caps text-label-caps rounded-full px-6 py-2.5',
        }
      });
      return;
    }

    // 4. Show options to user
    const result = await MySwal.fire({
      title: 'Select a Substitute',
      html: `
        <div class="text-left space-y-3 mt-4">
          ${options.map((opt, idx) => `
            <div class="p-4 border border-border rounded-lg bg-surface-alt hover:bg-surface-variant cursor-pointer transition-colors option-card flex flex-col gap-2" data-index="${idx}">
              <div class="flex justify-between items-start">
                <div class="font-body-lg font-medium text-on-surface">${opt.substitute}</div>
                <div class="font-body-lg font-bold text-primary">₹${opt.estimatedPrice}</div>
              </div>
              <div class="text-body-sm text-text-secondary flex flex-col gap-1">
                <span><strong class="font-medium">Qty:</strong> ${opt.replacementQty}</span>
                <span class="italic text-text-secondary">${opt.notes}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-2xl border border-border shadow-large bg-surface max-w-lg',
        title: 'font-h2 text-h2 font-bold text-on-background',
        cancelButton: 'bg-surface-variant hover:bg-border text-on-surface-variant font-label-caps text-label-caps rounded-full px-6 py-2.5 mt-4',
      },
      didOpen: () => {
        // Add click listeners to the custom HTML cards
        const cards = document.querySelectorAll('.option-card');
        cards.forEach(card => {
          card.addEventListener('click', () => {
            const index = card.getAttribute('data-index');
            MySwal.clickConfirm(); // Triggers resolution
            MySwal.selectedOptionIndex = index; // Store selected index temporarily
          });
        });
      }
    });

    if (result.isConfirmed && MySwal.selectedOptionIndex !== undefined) {
      const selectedSub = options[MySwal.selectedOptionIndex];
      setSwappingItem(item.ingredientName); // Show local spinner
      
      const success = await swapIngredient(planData._id, item.ingredientName, selectedSub);
      
      if (success) {
        setSwappingItem(null);
        // Optional: show a small toast, but updating the UI is usually enough
      } else {
        setSwappingItem(null);
        MySwal.fire({
          title: 'Error',
          text: 'Failed to apply substitute.',
          icon: 'error',
          customClass: {
            popup: 'rounded-2xl border border-border shadow-large bg-surface',
          }
        });
      }
    }
  };

  const handleAddManualItem = async (e) => {
    e.preventDefault();
    if (!manualItemText.trim()) return;
    
    setIsAddingItem(true);
    const success = await addManualItem(planData._id || planData.planId, manualItemText.trim());
    if (success) {
      setManualItemText('');
      toast.success('Item added to shopping list!');
    } else {
      toast.error('Failed to add item.');
    }
    setIsAddingItem(false);
  };

  const handleExport = async () => {
    if (!planData || !planData.shoppingList) {
      toast.error('Nothing to export!');
      return;
    }

    let text = `🛒 SmartMeal AI Shopping List\nEstimated Total: ₹${planData.totalCost?.toFixed(2) || '0.00'}\n\n`;

    const uncheckedItemsByCategory = {};
    const completedItems = [];
    
    Object.entries(planData.shoppingList).forEach(([category, items]) => {
      items.forEach(item => {
        if (checkedItems[item.ingredientName]) {
          completedItems.push({ ...item, category });
        } else {
          if (!uncheckedItemsByCategory[category]) uncheckedItemsByCategory[category] = [];
          uncheckedItemsByCategory[category].push(item);
        }
      });
    });

    Object.entries(uncheckedItemsByCategory).forEach(([category, items]) => {
      text += `--- ${category.toUpperCase()} ---\n`;
      items.forEach(item => {
        const sub = planData.substitutions?.[item.ingredientName];
        const name = sub?.substitute || item.ingredientName;
        const qty = sub?.replacementQty || `${item.qty} ${item.unit}`;
        text += `[ ] ${name} (${qty})\n`;
      });
      text += '\n';
    });

    if (completedItems.length > 0) {
      text += `--- ALREADY COMPLETED ---\n`;
      completedItems.forEach(item => {
        const sub = planData.substitutions?.[item.ingredientName];
        const name = sub?.substitute || item.ingredientName;
        text += `[x] ${name}\n`;
      });
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My SmartMeal Shopping List',
          text: text
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Shopping list copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

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

  const validSubstitutions = substitutions ? Object.entries(substitutions).filter(([_, sub]) => sub && (sub.substitute || sub.substitutedWith)) : [];
  const hasSubstitutions = validSubstitutions.length > 0;
  const hasShoppingList = shoppingList && Object.keys(shoppingList).length > 0;

  const uncheckedItemsByCategory = {};
  const completedItems = [];
  let totalItemsCount = 0;

  if (hasShoppingList) {
    Object.entries(shoppingList).forEach(([category, items]) => {
      items.forEach(item => {
        totalItemsCount++;
        if (checkedItems[item.ingredientName]) {
          completedItems.push({ ...item, category });
        } else {
          if (!uncheckedItemsByCategory[category]) uncheckedItemsByCategory[category] = [];
          uncheckedItemsByCategory[category].push(item);
        }
      });
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full flex-1 space-y-8 pt-6 md:pt-10 pb-40 bg-gradient-to-br from-amber-50/40 via-sky-50/20 to-indigo-50/40 min-h-full relative z-0">
      <GuidedTour 
        tourKey="shopping"
        steps={[
          {
            target: '.tour-smart-swap',
            title: 'Smart Swaps',
            content: 'Missing an ingredient or is it too expensive? Click this button to have AI find safe substitutes and instantly swap it out.',
            placement: 'left',
          },
          {
            target: '.tour-custom-item',
            title: 'Add Custom Items',
            content: 'Need paper towels or something else? Add any manual items to your list here so you don\'t forget them.',
            placement: 'top',
          }
        ]} 
      />
      {/* TOP SECTION: Budget & Substitutions (Bento Grid) */}
      <section className={`grid grid-cols-1 ${budget ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
        {/* Budget Analysis Card */}
        {budget && (
        <article className={`col-span-1 lg:col-span-2 bg-surface rounded-2xl border ${isOverBudget ? 'border-warning' : 'border-border'} p-6 md:p-8 shadow-md hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
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
        <aside className={`${!budget ? 'col-span-1 lg:col-span-2' : ''} bg-surface rounded-2xl border border-border p-6 md:p-8 flex flex-col shadow-md hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <span className="material-symbols-outlined text-tertiary-container">lightbulb</span>
            <h3 className="font-h2 text-h2 text-on-surface">Smart Swaps</h3>
          </div>
          
          {hasSubstitutions ? (
            <>
              <p className="font-body-sm text-body-sm text-text-secondary mb-6">Suggested substitutions to meet constraints.</p>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px]">
                {validSubstitutions.map(([original, sub], idx) => (
                  <div key={idx} className="bg-surface rounded-lg p-4 border border-outline-variant flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-body-sm text-body-sm text-text-secondary line-through">{original}</p>
                        <p className="font-body-lg text-body-lg font-medium mt-1 text-on-surface">{sub.substitute || sub.substitutedWith}</p>
                      </div>
                      <span className="material-symbols-outlined text-outline mx-2">arrow_forward</span>
                    </div>
                    {sub.rationale && <p className="text-body-sm text-text-secondary italic mt-1">{sub.rationale}</p>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-3">check_circle</span>
              <p className="font-body-lg text-body-lg font-medium text-on-surface mb-1">No smart swap needed</p>
              <p className="font-body-sm text-body-sm text-text-secondary">Your current meal plan perfectly fits your budget and pantry!</p>
            </div>
          )}
        </aside>
      </section>

      {/* BOTTOM SECTION: Shopping List */}
      <section className="pb-[100px]">
        <div className="flex justify-between items-end border-b border-border pb-4 mb-8">
          <h2 className="font-h1 text-h1 text-on-surface">Shopping List</h2>
          <span className="font-body-sm text-body-sm text-text-secondary">{totalItemsCount} Items</span>
        </div>
        
        <div ref={parentRef} className="space-y-12">
          {hasShoppingList ? (
            <>
              {Object.entries(uncheckedItemsByCategory).map(([category, items]) => (
                <div key={`category-${category}`}>
                  <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-4 bg-surface-alt inline-block px-3 py-1 rounded-full">{category}</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((item, itemIdx) => {
                      const sub = planData.substitutions?.[item.ingredientName];
                      const itemCost = (sub?.estimatedPrice ?? item.estimatedCost).toFixed(2);
                      
                      let displayQty = `${item.qty} ${item.unit}`;
                      if (sub) {
                        if (sub.replacementQty) {
                          displayQty = `${sub.replacementQty} ${sub.replacementUnit || ''}`;
                        } else if (sub.ratio && !sub.ratio.includes(':') && !sub.ratio.includes('x')) {
                          displayQty = sub.ratio.replace(/use/i, '').trim();
                        } else if (sub.ratio && sub.ratio.includes('x')) {
                          const multiplier = parseFloat(sub.ratio.replace('x', ''));
                          if (!isNaN(multiplier)) displayQty = `${item.qty * multiplier} ${item.unit}`;
                        }
                      }
                      
                      return (
                        <li key={item.ingredientName} onClick={() => toggleCheck(item.ingredientName)} className="group bg-surface hover:bg-surface-bright border border-transparent hover:border-border rounded-lg p-3 md:p-4 transition-colors shadow-sm hover:shadow-md cursor-pointer flex flex-col">
                          <div className="flex items-center justify-between w-full">
                            <label className="flex items-center gap-4 cursor-pointer flex-1">
                              <input className="peer sr-only" type="checkbox" checked={false} readOnly />
                              <div className="w-6 h-6 border-2 border-outline-variant rounded-md flex items-center justify-center transition-colors bg-surface peer-checked:bg-primary peer-checked:border-primary">
                                <span className="material-symbols-outlined text-on-primary text-sm opacity-0 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              </div>
                              <span className="font-body-lg text-body-lg text-on-surface transition-all flex flex-col">
                                <span>{planData.substitutions?.[item.ingredientName]?.substitute || item.ingredientName}</span>
                                {sub && (
                                  <span className="text-body-sm text-text-secondary mt-0.5">
                                    Instead of {item.ingredientName}
                                  </span>
                                )}
                              </span>
                            </label>
                            <div className="flex items-center gap-4 text-right">
                              <span className="font-body-sm text-body-sm text-text-secondary hidden sm:inline">{displayQty}</span>
                              <span className="font-body-lg text-body-lg font-medium w-12 sm:w-16">₹{itemCost}</span>
                              
                              {/* Swap Button */}
                              <button 
                                onClick={(e) => handleSwap(e, item)}
                                disabled={swappingItem === item.ingredientName}
                                className="tour-smart-swap w-8 h-8 rounded hover:bg-surface-variant flex items-center justify-center text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
                                title="Find a substitute"
                              >
                                {swappingItem === item.ingredientName ? (
                                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                                )}
                              </button>
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
              ))}

              {completedItems.length > 0 && (
                <div key="completed-items" className="pt-6 border-t border-border mt-12">
                  <h3 className="font-label-caps text-label-caps text-success uppercase tracking-widest mb-4 bg-success/10 inline-block px-3 py-1 rounded-full">Completed Items</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 opacity-60">
                    {completedItems.map((item, itemIdx) => {
                      const sub = planData.substitutions?.[item.ingredientName];
                      const itemCost = (sub?.estimatedPrice ?? item.estimatedCost).toFixed(2);
                      
                      let displayQty = `${item.qty} ${item.unit}`;
                      if (sub) {
                        if (sub.replacementQty) {
                          displayQty = `${sub.replacementQty} ${sub.replacementUnit || ''}`;
                        } else if (sub.ratio && !sub.ratio.includes(':') && !sub.ratio.includes('x')) {
                          displayQty = sub.ratio.replace(/use/i, '').trim();
                        } else if (sub.ratio && sub.ratio.includes('x')) {
                          const multiplier = parseFloat(sub.ratio.replace('x', ''));
                          if (!isNaN(multiplier)) displayQty = `${item.qty * multiplier} ${item.unit}`;
                        }
                      }
                      
                      return (
                        <li key={item.ingredientName} onClick={() => toggleCheck(item.ingredientName)} className="group bg-surface-variant border border-transparent rounded-lg p-3 md:p-4 transition-colors cursor-pointer flex flex-col">
                          <div className="flex items-center justify-between w-full">
                            <label className="flex items-center gap-4 cursor-pointer flex-1">
                              <input className="peer sr-only" type="checkbox" checked={true} readOnly />
                              <div className="w-6 h-6 border-2 border-primary bg-primary rounded-md flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-on-primary text-sm opacity-100" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              </div>
                              <span className="font-body-lg text-body-lg text-text-secondary line-through transition-all flex flex-col">
                                <span>{planData.substitutions?.[item.ingredientName]?.substitute || item.ingredientName}</span>
                                {sub && (
                                  <span className="text-body-sm text-text-secondary mt-0.5 line-through">
                                    Instead of {item.ingredientName}
                                  </span>
                                )}
                              </span>
                            </label>
                            <div className="flex items-center gap-6 text-right">
                              <span className="font-body-sm text-body-sm text-text-secondary line-through">{displayQty}</span>
                              <span className="font-body-lg text-body-lg font-medium text-text-secondary w-16 line-through">₹{itemCost}</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-text-secondary">Your pantry has everything you need! No shopping required.</p>
          )}
        </div>

        {/* Manual Item Add */}
        {planData && (
          <div className="tour-custom-item mt-12 bg-surface-alt p-6 rounded-xl border border-border shadow-sm max-w-2xl">
            <h3 className="font-h2 text-h2 text-on-surface mb-2">Need something else?</h3>
            <p className="font-body-sm text-text-secondary mb-4">Add custom items to your shopping list.</p>
            <form onSubmit={handleAddManualItem} className="flex gap-3">
              <input 
                type="text" 
                placeholder="e.g. Paper towels, extra milk..." 
                value={manualItemText}
                onChange={(e) => setManualItemText(e.target.value)}
                className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isAddingItem}
              />
              <button 
                type="submit" 
                disabled={isAddingItem || !manualItemText.trim()}
                className="bg-primary text-on-primary hover:bg-primary-hover px-6 py-2 rounded-lg font-label-caps text-label-caps flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isAddingItem ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">add</span>
                )}
                Add Item
              </button>
            </form>
          </div>
        )}
      </section>
      
      {/* STICKY TOTAL BAR */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-surface/95 backdrop-blur-sm border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40 px-6 py-4 md:py-6 flex justify-between items-center transition-all">
        <div>
          <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Estimated Total</p>
          <p className="font-h2 text-h2 text-on-surface">₹{totalCost?.toFixed(2) || '0.00'}</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-primary hover:bg-primary-hover text-on-primary rounded-full px-6 py-3 font-body-lg text-body-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">ios_share</span>
          <span className="hidden sm:inline">Export List</span>
        </button>
      </div>
    </div>
  );
};

export default BudgetShoppingList;

