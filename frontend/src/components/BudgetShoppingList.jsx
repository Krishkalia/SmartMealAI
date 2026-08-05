import React from 'react';

const BudgetShoppingList = () => {
  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 space-y-section-gap-sm md:space-y-section-gap-lg pt-6 md:pt-12">
      {/* TOP SECTION: Budget & Substitutions (Bento Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Budget Analysis Card */}
        <article className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6">
            <div>
              <h3 className="font-h2 text-h2 text-on-surface mb-1">Budget Analysis</h3>
              <p className="font-body-sm text-body-sm text-text-secondary">Week of Oct 12 – Oct 18</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <span className="font-hero text-[40px] md:text-hero text-on-surface tracking-tight">$142<span className="text-h2">.50</span></span>
              <span className="font-body-sm text-body-sm text-text-secondary block">of $150.00 planned</span>
            </div>
          </div>
          
          {/* Budget Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between font-label-caps text-label-caps text-text-secondary mb-2 uppercase">
              <span>0%</span>
              <span>95% Used</span>
            </div>
            <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[95%] transition-all duration-500 ease-out shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)]"></div>
            </div>
          </div>
          
          {/* Per-Meal Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-6">
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Breakfast</p>
              <p className="font-body-lg text-body-lg font-medium">$2.15 <span className="text-body-sm text-text-secondary">/meal</span></p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Lunch</p>
              <p className="font-body-lg text-body-lg font-medium">$4.30 <span className="text-body-sm text-text-secondary">/meal</span></p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Dinner</p>
              <p className="font-body-lg text-body-lg font-medium text-warning">$6.80 <span className="text-body-sm text-text-secondary">/meal</span></p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Snacks</p>
              <p className="font-body-lg text-body-lg font-medium">$1.10 <span className="text-body-sm text-text-secondary">/meal</span></p>
            </div>
          </div>
        </article>

        {/* Substitutions Panel */}
        <aside className="bg-surface-container-low rounded-xl border border-border p-6 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-tertiary-container">lightbulb</span>
            <h3 className="font-h2 text-h2 text-on-surface">Smart Swaps</h3>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary mb-6">Suggested substitutions to stay under your $150 budget.</p>
          <div className="space-y-4 flex-1">
            <div className="bg-surface rounded-lg p-4 border border-outline-variant flex items-center justify-between">
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-text-secondary line-through">Ribeye Steak</p>
                <p className="font-body-lg text-body-lg font-medium mt-1 text-on-surface">Flank Steak</p>
              </div>
              <span className="material-symbols-outlined text-outline mx-2">arrow_forward</span>
              <div className="text-right flex-1">
                <span className="inline-block bg-success/20 text-success font-label-caps text-label-caps px-2 py-1 rounded-full uppercase">Save $8.50</span>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-outline-variant flex items-center justify-between">
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-text-secondary line-through">Pine Nuts</p>
                <p className="font-body-lg text-body-lg font-medium mt-1 text-on-surface">Walnuts</p>
              </div>
              <span className="material-symbols-outlined text-outline mx-2">arrow_forward</span>
              <div className="text-right flex-1">
                <span className="inline-block bg-success/20 text-success font-label-caps text-label-caps px-2 py-1 rounded-full uppercase">Save $4.20</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* BOTTOM SECTION: Shopping List */}
      <section className="pb-[100px]">
        <div className="flex justify-between items-end border-b border-border pb-4 mb-8">
          <h2 className="font-h1 text-h1 text-on-surface">Shopping List</h2>
          <span className="font-body-sm text-body-sm text-text-secondary">24 Items</span>
        </div>
        
        <div className="space-y-12">
          {/* Category: Produce */}
          <div>
            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-4 bg-surface-alt inline-block px-3 py-1 rounded-full">Produce</h3>
            <ul className="space-y-2">
              <li className="group bg-surface hover:bg-surface-bright border border-transparent hover:border-border rounded-lg p-3 md:p-4 transition-colors flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer">
                <label className="flex items-center gap-4 cursor-pointer flex-1">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="w-6 h-6 border-2 border-outline-variant rounded-md flex items-center justify-center transition-colors bg-surface peer-checked:bg-primary peer-checked:border-primary">
                    <span className="material-symbols-outlined text-on-primary text-sm opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  <span className="font-body-lg text-body-lg text-on-surface peer-checked:line-through peer-checked:text-text-secondary transition-all">Organic Baby Spinach</span>
                </label>
                <div className="flex items-center gap-6 text-right">
                  <span className="font-body-sm text-body-sm text-text-secondary">2 bags</span>
                  <span className="font-body-lg text-body-lg font-medium w-16">$7.98</span>
                </div>
              </li>
              <li className="group bg-surface hover:bg-surface-bright border border-transparent hover:border-border rounded-lg p-3 md:p-4 transition-colors flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer">
                <label className="flex items-center gap-4 cursor-pointer flex-1">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="w-6 h-6 border-2 border-outline-variant rounded-md flex items-center justify-center transition-colors bg-surface peer-checked:bg-primary peer-checked:border-primary">
                    <span className="material-symbols-outlined text-on-primary text-sm opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  <span className="font-body-lg text-body-lg text-on-surface peer-checked:line-through peer-checked:text-text-secondary transition-all">Heirloom Tomatoes</span>
                </label>
                <div className="flex items-center gap-6 text-right">
                  <span className="font-body-sm text-body-sm text-text-secondary">3 lbs</span>
                  <span className="font-body-lg text-body-lg font-medium w-16">$12.50</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Category: Dairy & Refrigerated */}
          <div>
            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-4 bg-surface-alt inline-block px-3 py-1 rounded-full">Dairy & Refrigerated</h3>
            <ul className="space-y-2">
              <li className="group bg-surface hover:bg-surface-bright border border-transparent hover:border-border rounded-lg p-3 md:p-4 transition-colors flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer">
                <label className="flex items-center gap-4 cursor-pointer flex-1">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="w-6 h-6 border-2 border-outline-variant rounded-md flex items-center justify-center transition-colors bg-surface peer-checked:bg-primary peer-checked:border-primary">
                    <span className="material-symbols-outlined text-on-primary text-sm opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  <span className="font-body-lg text-body-lg text-on-surface peer-checked:line-through peer-checked:text-text-secondary transition-all">Oat Milk (Unsweetened)</span>
                </label>
                <div className="flex items-center gap-6 text-right">
                  <span className="font-body-sm text-body-sm text-text-secondary">1 carton</span>
                  <span className="font-body-lg text-body-lg font-medium w-16">$4.50</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* STICKY TOTAL BAR */}
      <div className="fixed bottom-[72px] md:bottom-0 left-0 md:left-64 right-0 bg-surface border-t border-border shadow-[0_-4px_20px_rgba(31,27,22,0.05)] z-40 px-4 md:px-margin py-4 md:py-6 flex justify-between items-center">
        <div>
          <p className="font-label-caps text-label-caps text-text-secondary uppercase mb-1">Estimated Total</p>
          <p className="font-h2 text-h2 text-on-surface">$142.50</p>
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
