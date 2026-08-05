import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MealPlanView from '../components/MealPlanView';
import BudgetShoppingList from '../components/BudgetShoppingList';
import CookingTimeline from '../components/CookingTimeline';
import PlanHistory from '../components/PlanHistory';

const DashboardPage = () => {
  const [currentTab, setCurrentTab] = useState('planner');

  return (
    <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === 'planner' && <MealPlanView />}
      {currentTab === 'shopping' && <BudgetShoppingList />}
      {currentTab === 'timeline' && <CookingTimeline />}
      {currentTab === 'history' && <PlanHistory />}
      {currentTab === 'pantry' && (
        <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1">
          <h2 className="font-h1 text-h1 text-on-surface">Pantry Inventory</h2>
          <p className="mt-4 text-text-secondary">Pantry management view coming soon.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
