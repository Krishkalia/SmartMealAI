import React from 'react';

const CookingTimeline = () => {
  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 pt-6 md:pt-12">
      {/* Header Section */}
      <div className="mb-section-gap-sm md:mb-section-gap-lg text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="font-hero-mobile text-hero-mobile md:font-hero md:text-h1 text-primary mb-2">Today's Timeline</h1>
          <p className="text-text-secondary font-body-lg text-body-lg max-w-2xl">Your beautifully orchestrated schedule for today's meals. Follow along for perfect timing.</p>
        </div>
        <div className="w-full md:w-64 bg-surface rounded-full p-1 border border-border shadow-sm flex items-center">
          <div className="h-2 bg-success rounded-full w-1/3 ml-1"></div>
          <span className="font-label-caps text-label-caps text-text-secondary ml-3 mr-4">33% COMPLETED</span>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative max-w-4xl mx-auto">
        {/* The line */}
        <div className="absolute left-[20px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-border z-0"></div>

        {/* Timeline Item 1 - Breakfast Prep */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 group">
          <div className="hidden md:block w-5/12 text-right pr-8">
            <div className="font-h2 text-h2 text-on-background mb-1">Overnight Oats Prep</div>
            <p className="text-text-secondary text-body-sm">Mix oats, chia, and almond milk.</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success text-on-primary border-4 border-background shadow-sm flex-shrink-0 mb-4 md:mb-0 ml-[2px] md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-body-lg">done</span>
          </div>
          <div className="w-full md:w-5/12 pl-12 md:pl-8 -mt-12 md:mt-0">
            <div className="md:hidden font-h2 text-h2 text-on-background mb-1">Overnight Oats Prep</div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-label-caps text-label-caps text-success font-bold">07:00 AM</span>
              <span className="px-2 py-1 rounded-full bg-surface-alt text-text-secondary font-label-caps text-label-caps">Breakfast</span>
            </div>
            <p className="md:hidden text-text-secondary text-body-sm bg-surface p-4 rounded-lg border border-border shadow-sm mt-2">Mix oats, chia, and almond milk.</p>
          </div>
        </div>

        {/* Timeline Item 2 - Breakfast Active */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 group">
          <div className="hidden md:block w-5/12 text-right pr-8">
            <div className="flex items-center justify-end gap-3 mb-2">
              <span className="px-2 py-1 rounded-full bg-surface-alt text-text-secondary font-label-caps text-label-caps">Breakfast</span>
              <span className="font-label-caps text-label-caps text-primary font-bold">07:30 AM</span>
            </div>
            <div className="font-h2 text-h2 text-on-background mb-1">Assemble & Serve</div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary border-4 border-background shadow-sm flex-shrink-0 mb-4 md:mb-0 ml-[2px] md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-body-lg animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
          <div className="w-full md:w-5/12 pl-12 md:pl-8 -mt-12 md:mt-0">
            <div className="md:hidden font-h2 text-h2 text-on-background mb-1">Assemble & Serve</div>
            <div className="md:hidden flex items-center gap-3 mb-2">
              <span className="font-label-caps text-label-caps text-primary font-bold">07:30 AM</span>
              <span className="px-2 py-1 rounded-full bg-surface-alt text-text-secondary font-label-caps text-label-caps">Breakfast</span>
            </div>
            <div className="bg-surface p-4 md:p-6 rounded-xl border border-primary shadow-sm transition-shadow hover:shadow-md">
              <img 
                className="w-full h-32 md:h-48 object-cover rounded-lg mb-4" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-U0kNWgiKuw4oDrtdlDGkDlNcIbySm3v1IrbEFESugi8yHhtFtSFuTJktUE4TL4YjCgGLCFHoWNoWUbIgNQ11FxUr5D1CyRLQZaVJe60PZpknnZvWZILU5p3p8uc8HzKB3_eGbPrd_g400Gh4TK5cu8dyhcynUHkCS2bgFXuWrwaxYFUBn33XTtAbzUcoWfKMFGbSRrTJlY0w8PHJ29z9beixErvRa835NehShi48JVw67UVbTJ_Qpw" 
                alt="Oats"
              />
              <p className="text-text-secondary text-body-sm">Top with fresh berries, sliced almonds, and a drizzle of honey. Enjoy!</p>
            </div>
          </div>
        </div>

        {/* Timeline Item 3 - Lunch Prep */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 group">
          <div className="hidden md:block w-5/12 text-right pr-8">
            <div className="font-h2 text-h2 text-on-background mb-1">Marinate Chicken</div>
            <p className="text-text-secondary text-body-sm">Prepare lemon-herb marinade and set chicken aside in the fridge.</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface text-text-secondary border-4 border-background shadow-sm flex-shrink-0 mb-4 md:mb-0 ml-[2px] md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-body-lg">kitchen</span>
          </div>
          <div className="w-full md:w-5/12 pl-12 md:pl-8 -mt-12 md:mt-0">
            <div className="md:hidden font-h2 text-h2 text-on-background mb-1">Marinate Chicken</div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-label-caps text-label-caps text-text-secondary font-bold">11:00 AM</span>
              <span className="px-2 py-1 rounded-full bg-surface-alt text-text-secondary font-label-caps text-label-caps">Lunch</span>
            </div>
            <p className="md:hidden text-text-secondary text-body-sm bg-surface p-4 rounded-lg border border-border shadow-sm mt-2">Prepare lemon-herb marinade and set chicken aside in the fridge.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingTimeline;
