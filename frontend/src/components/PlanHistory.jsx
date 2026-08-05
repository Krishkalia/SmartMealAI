import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';

const PlanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { setPlanData } = usePlan();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/plan/user/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const loadPlan = (plan) => {
    setPlanData(plan);
    // Ideally this would switch the tab to 'planner', but that state is held in DashboardPage.
    // In a real app we'd pass a callback or elevate the state.
    // For now, it will load into context, and user can click 'Meal Planner' to see it.
    alert('Plan loaded! Click "Meal Planner" tab to view it.');
  };

  if (loading) {
    return <div className="p-margin text-center text-text-secondary">Loading history...</div>;
  }

  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 pt-6 md:pt-12">
      <div className="mb-8 border-b border-border pb-4">
        <h2 className="font-h1 text-h1 text-on-surface">Your Profile & History</h2>
        <p className="font-body-sm text-body-sm text-text-secondary mt-1">Review and reload your past meal plans.</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">calendar_month</span>
          <p className="font-body-lg text-body-lg text-text-secondary">No saved plans yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(plan => (
            <div key={plan._id} className="bg-surface rounded-xl border border-border p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-h2 text-h2 text-on-surface mb-1">
                  Plan for {new Date(plan.createdAt).toLocaleDateString()}
                </h3>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Budget: ${plan.budget} | Total Cost: ${plan.totalCost.toFixed(2)}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-surface-alt rounded font-label-caps text-[10px] uppercase text-text-secondary">
                    {plan.meals?.breakfast?.name || 'Breakfast'}
                  </span>
                  <span className="px-2 py-1 bg-surface-alt rounded font-label-caps text-[10px] uppercase text-text-secondary">
                    {plan.meals?.lunch?.name || 'Lunch'}
                  </span>
                  <span className="px-2 py-1 bg-surface-alt rounded font-label-caps text-[10px] uppercase text-text-secondary">
                    {plan.meals?.dinner?.name || 'Dinner'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => loadPlan(plan)}
                className="mt-4 md:mt-0 px-4 py-2 bg-primary-container/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg font-body-sm transition-colors border border-primary/20"
              >
                Reload Plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanHistory;
