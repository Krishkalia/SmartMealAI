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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const handleNavigation = (tabId) => {
    setCurrentTab(tabId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

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
    <div className="font-body-lg text-body-lg antialiased h-screen flex flex-col bg-background text-on-background overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Top Navbar */}
      <header className="w-full sticky top-0 z-50 bg-primary text-on-primary flex justify-between items-center px-4 py-3 shadow-md h-[60px]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-on-primary hover:bg-black/10 p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">restaurant</span>
            <h1 className="font-h2 text-xl font-bold hidden sm:block">SmartMeal</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl px-4">
          <div className="relative w-full max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-primary/70 text-[20px]">search</span>
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-black/10 border-none rounded-md py-1.5 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-white focus:bg-black/20 transition-colors font-body-sm text-sm text-on-primary placeholder:text-on-primary/70"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block border border-white/20 rounded px-1.5 text-[10px] font-sans text-on-primary/70 bg-black/10">/</kbd>
            </div>
          </div>
          <button 
            title="Logout"
            onClick={handleLogout}
            className="text-on-primary hover:bg-black/10 p-2 rounded-md transition-colors flex items-center gap-2 font-body-sm text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop SideNav */}
        <nav className={`
          flex flex-col h-full fixed left-0 top-[60px] bg-surface text-on-surface border-r border-border z-40 transition-all duration-300 ease-in-out overflow-hidden
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'}
          lg:relative lg:top-0
        `}>
          {/* Profile Section */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="flex flex-col overflow-hidden pr-2">
                <span className="font-medium text-on-surface truncate">{user?.name || 'Chef'}</span>
                <span className="text-xs text-text-secondary truncate">{user?.email || 'Settings & Profile'}</span>
              </div>
            </div>
            <button 
              onClick={() => {
                handleNavigation('profile');
                setTimeout(() => {
                  document.getElementById('favorites-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors"
              title="View Favorites"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </button>
          </div>

          <div className="p-4">
            <button 
              onClick={handleNewPlan}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-on-primary rounded-md font-body-sm text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">add</span>
              )}
              Create Plan
            </button>
          </div>
          
          <ul className="flex flex-col gap-1 flex-grow overflow-y-auto px-3 pb-4">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button 
                  onClick={() => handleNavigation(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-body-sm text-sm ${currentTab === tab.id ? 'text-primary bg-primary-container' : 'text-text-secondary hover:text-primary hover:bg-surface-variant'}`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={currentTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto bg-background text-on-background w-full h-full relative">

          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
