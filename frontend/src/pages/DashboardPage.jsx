import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { usePlan } from '../context/PlanContext';
import MealPlanView from '../components/MealPlanView';
import BudgetShoppingList from '../components/BudgetShoppingList';
import CookingTimeline from '../components/CookingTimeline';
import PlanHistory from '../components/PlanHistory';
import PantryInventory from '../components/PantryInventory';

import ProfileSettings from '../components/ProfileSettings';

const DashboardPage = () => {
  const [currentTab, setCurrentTab] = useState('planner');
  const { planData, checkAndLoadTodayPlan } = usePlan();

  useEffect(() => {
    if (!planData && checkAndLoadTodayPlan) {
      checkAndLoadTodayPlan();
    }
  }, []);

  return (
    <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === 'planner' && <MealPlanView setCurrentTab={setCurrentTab} />}
      {currentTab === 'shopping' && <BudgetShoppingList />}
      {currentTab === 'timeline' && <CookingTimeline />}
      {currentTab === 'history' && <PlanHistory />}
      {currentTab === 'pantry' && <PantryInventory />}
      {currentTab === 'profile' && <ProfileSettings />}
    </DashboardLayout>
  );
};

export default DashboardPage;
