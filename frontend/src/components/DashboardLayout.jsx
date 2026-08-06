import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';

const MySwal = withReactContent(Swal);

const DashboardLayout = ({ children, currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const { generatePlan, isLoading } = usePlan();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'planner', icon: 'calendar_today', label: 'Meal Planner' },
    { id: 'pantry', icon: 'inventory_2', label: 'Pantry' },
    { id: 'shopping', icon: 'shopping_cart', label: 'Shopping List' },
    { id: 'timeline', icon: 'schedule', label: 'Cooking Timeline' },
    { id: 'history', icon: 'history', label: 'History' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  const handleNewPlan = async () => {
    if (user?.preferences && Object.keys(user.preferences).length > 0 && user.preferences.dietaryPreferences?.length > 0) {
      const result = await MySwal.fire({
        title: 'Generate New Plan?',
        text: "We'll use your saved profile preferences.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, generate it!',
        cancelButtonText: 'Cancel',
        buttonsStyling: false,
        customClass: {
          container: 'font-sans',
          popup: 'rounded-2xl border border-border shadow-large bg-surface',
          title: 'font-h2 text-h2 font-bold text-on-background',
          htmlContainer: 'font-body-lg text-text-secondary mt-2',
          confirmButton: 'bg-primary hover:bg-primary-hover text-on-primary font-label-caps text-label-caps rounded-full px-6 py-2.5 transition-colors shadow-sm',
          cancelButton: 'bg-surface-variant hover:bg-border text-on-surface-variant font-label-caps text-label-caps rounded-full px-6 py-2.5 transition-colors ml-3',
          icon: 'text-primary border-primary'
        }
      });

      if (result.isConfirmed) {
        toast.loading('Generating plan...', { id: 'genPlan' });
        const success = await generatePlan(user.preferences);
        if (success) {
          toast.success('Meal plan generated!', { id: 'genPlan' });
          setCurrentTab('planner');
        } else {
          toast.error('Failed to generate plan.', { id: 'genPlan' });
        }
      }
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="font-body-lg text-body-lg antialiased min-h-screen flex flex-col md:flex-row bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* Desktop SideNav */}
      <nav className="hidden md:flex flex-col h-full w-64 fixed left-0 top-0 bg-surface border-r border-border shadow-sm py-8 px-4 z-40">
        <div className="mb-12 px-2">
          <h2 className="font-h2 text-h2 font-semibold text-primary">SmartMeal AI</h2>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1">Modern Editorial Planning</p>
        </div>
        
        <ul className="flex flex-col gap-1 flex-grow overflow-y-auto">
          {tabs.map(tab => (
            <li key={tab.id}>
              <button 
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors font-body-sm font-medium ${currentTab === tab.id ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-primary hover:bg-surface-variant'}`}
              >
                <span className="material-symbols-outlined" style={currentTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto pt-8 border-t border-border">
          <button 
            onClick={handleNewPlan}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded-full font-label-caps text-label-caps hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>}
            New Plan
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow md:ml-64 pb-24 md:pb-0 flex flex-col min-h-screen">
        {/* Mobile TopAppBar */}
        <header className="md:hidden w-full sticky top-0 z-50 bg-background border-b border-border flex justify-between items-center px-4 py-4">
          <h1 className="font-h1 text-h1 font-bold text-primary">SmartMeal AI</h1>
          <button onClick={() => setCurrentTab('profile')} className="text-primary hover:text-primary-hover transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </header>

        {/* Desktop TopAppBar */}
        <header className="hidden md:flex w-full sticky top-0 z-40 bg-background/90 backdrop-blur-sm justify-between items-center px-margin py-4 max-w-max-width mx-auto transition-all duration-200 ease-in-out border-b border-border">
          <h2 className="font-h2 text-h2 text-on-surface font-semibold capitalize">{tabs.find(t => t.id === currentTab)?.label || 'Dashboard'}</h2>
          
          <div className="flex-1 max-w-md mx-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-secondary text-[20px]">search</span>
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-surface-alt border border-border rounded-md py-2 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-colors font-body-sm text-body-sm text-on-background placeholder:text-text-secondary"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block border border-border rounded px-2 text-xs font-sans text-text-secondary bg-surface">/</kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-text-secondary font-body-sm hidden lg:block">
              {user?.name || 'Chef'}
            </span>
            <button 
              title="Logout"
              onClick={handleLogout}
              className="text-text-secondary hover:text-danger transition-colors p-2 rounded-full flex items-center justify-center hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-surface rounded-t-xl shadow-large border-t border-border">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg scale-95 active:scale-90 transition-all ${currentTab === tab.id ? 'bg-primary-fixed text-on-primary-fixed rounded-full px-4' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined" style={currentTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
            <span className="font-label-caps text-label-caps mt-1 text-[10px] sm:text-xs">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardLayout;
