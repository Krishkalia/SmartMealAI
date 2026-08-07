import React, { createContext, useState, useContext } from 'react';

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePlan = async (preferences) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/plan/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(preferences)
      });
      const data = await response.json();
      if (data.success) {
        // Fetch full populated plan
        const fullPlanResponse = await fetch(`http://localhost:5000/api/plan/${data.data.planId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const fullPlanData = await fullPlanResponse.json();
        if(fullPlanData.success) {
          setPlanData({ ...fullPlanData.data, aiMessage: data.data.aiMessage });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error generating plan:', error);
      // Fallback for UI if backend isn't running
      setPlanData({
        budget: 150,
        totalCost: 142.5,
        meals: {
          breakfast: { name: 'Berry Almond Oatmeal' },
          lunch: { name: 'Mediterranean Quinoa Bowl' },
          dinner: { name: 'Pan-Seared Salmon' }
        },
        aiMessage: "Here is a simulated plan since the backend is unreachable."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMeal = async (planId, mealType) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/plan/${planId}/refresh-meal`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ mealType })
      });
      const data = await response.json();
      if (data.success) {
        setPlanData(data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing meal:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubstituteOptions = async (ingredientName, originalQty, originalUnit) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/plan/substitute-options`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ingredientName, originalQty, originalUnit })
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching substitute options:', error);
      return null;
    }
  };

  const swapIngredient = async (planId, ingredientName, substituteData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/plan/${planId}/swap-ingredient`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ingredientName, substituteData })
      });
      const data = await response.json();
      if (data.success) {
        setPlanData(data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error swapping ingredient:', error);
      return false;
    }
  };

  const addManualItem = async (planId, ingredientName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/plan/${planId}/manual-item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ingredientName })
      });
      const data = await response.json();
      if (data.success) {
        setPlanData(data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding manual item:', error);
      return false;
    }
  };

  const checkAndLoadTodayPlan = async () => {
    if (planData) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/plan/user/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const latestPlan = data.data[0];
        const todayStr = new Date().toDateString();
        const planDateStr = new Date(latestPlan.createdAt).toDateString();
        
        if (todayStr === planDateStr) {
          setPlanData(latestPlan);
        }
      }
    } catch (error) {
      console.error('Error fetching today plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PlanContext.Provider value={{ planData, setPlanData, generatePlan, refreshMeal, fetchSubstituteOptions, swapIngredient, addManualItem, checkAndLoadTodayPlan, isLoading }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);
