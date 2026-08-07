import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';
import GuidedTour from './GuidedTour';

const MySwal = withReactContent(Swal);

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
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const loadPlan = async (plan) => {
    const result = await MySwal.fire({
      title: 'Reload this plan?',
      text: "This will overwrite your current meal plan in the planner.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9f2c05',
      cancelButtonColor: '#8c7169',
      confirmButtonText: 'Yes, load it!'
    });

    if (result.isConfirmed) {
      setPlanData(plan);
      toast.success('Plan loaded! Click "Meal Planner" tab to view it.');
    }
  };

  if (loading) {
    return (
      <div className="p-margin flex flex-col items-center justify-center text-primary h-64">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-body-lg text-body-lg">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1 pt-6 md:pt-12">
      <GuidedTour 
        tourKey="history"
        steps={[
          {
            target: '.tour-reload-plan',
            title: 'Reload Past Plans',
            content: 'Loved a plan from a few days ago? Click this button to instantly overwrite your current plan with this past one!',
            placement: 'top',
          }
        ]} 
      />
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {history.map(plan => (
            <div key={plan._id} className="bg-surface rounded-xl border border-border p-4 md:p-6 flex flex-col justify-between items-start shadow-sm hover:shadow-md transition-shadow h-full">
              <div className="w-full">
                <h3 className="font-h2 text-h2 text-on-surface mb-1">
                  Plan for {new Date(plan.createdAt).toLocaleDateString()}
                </h3>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Budget: ₹{plan.budget} | Total Cost: ₹{plan.totalCost.toFixed(2)}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
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
                className="tour-reload-plan mt-6 w-full px-4 py-2 bg-primary-container/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg font-body-sm transition-colors border border-primary/20"
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
