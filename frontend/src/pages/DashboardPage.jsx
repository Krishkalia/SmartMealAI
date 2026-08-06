import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MealPlanView from '../components/MealPlanView';
import BudgetShoppingList from '../components/BudgetShoppingList';
import CookingTimeline from '../components/CookingTimeline';
import PlanHistory from '../components/PlanHistory';
import PantryInventory from '../components/PantryInventory';

const DashboardPage = () => {
  const [currentTab, setCurrentTab] = useState('planner');

  return (
    <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === 'planner' && <MealPlanView />}
      {currentTab === 'shopping' && <BudgetShoppingList />}
      {currentTab === 'timeline' && <CookingTimeline />}
      {currentTab === 'history' && <PlanHistory />}
      {currentTab === 'pantry' && <PantryInventory />}
    </DashboardLayout>
  );
};

export default DashboardPage;
