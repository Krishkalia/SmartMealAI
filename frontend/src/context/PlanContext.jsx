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

  return (
    <PlanContext.Provider value={{ planData, setPlanData, generatePlan, isLoading }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);
