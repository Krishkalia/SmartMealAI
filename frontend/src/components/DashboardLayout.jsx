import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
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
  ];

  return (
    <div className="font-body-lg text-body-lg antialiased min-h-screen flex flex-col md:flex-row bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* Desktop SideNav */}
      <nav className="hidden md:flex flex-col h-full w-64 fixed left-0 top-0 bg-surface border-r border-border shadow-sm py-8 px-4 z-40">
        <div className="mb-12 px-2">
          <h2 className="font-h2 text-h2 font-semibold text-primary">SmartMeal AI</h2>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1">Modern Editorial Planning</p>
        </div>
        
        <ul className="flex flex-col gap-2 flex-grow">
          {tabs.map(tab => (
            <li key={tab.id}>
              <button 
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentTab === tab.id ? 'text-primary font-bold bg-primary-container/10 border-r-4 border-primary' : 'text-text-secondary hover:text-primary hover:bg-surface-variant'}`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto pt-8 border-t border-border">
          <button className="w-full py-3 px-4 bg-primary text-on-primary rounded-full font-label-caps text-label-caps hover:bg-primary-hover transition-colors">
            New Plan
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow md:ml-64 pb-24 md:pb-0 flex flex-col min-h-screen">
        {/* Mobile TopAppBar */}
        <header className="md:hidden w-full sticky top-0 z-50 bg-background border-b border-border flex justify-between items-center px-4 py-4">
          <h1 className="font-h1 text-h1 font-bold text-primary">SmartMeal AI</h1>
          <button className="text-primary hover:text-primary-hover transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </header>

        {/* Desktop TopAppBar */}
        <header className="hidden md:flex w-full sticky top-0 z-40 bg-background/90 backdrop-blur-sm justify-between items-center px-margin py-6 max-w-max-width mx-auto transition-all duration-200 ease-in-out">
          <h2 className="font-h1 text-h1 text-primary capitalize">{tabs.find(t => t.id === currentTab)?.label || 'Dashboard'}</h2>
          <div className="flex items-center gap-4">
            <span className="text-on-surface-variant font-body-sm hidden lg:block">
              Welcome, {user?.name || 'Chef'}
            </span>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">search</span>
            </button>
            <button 
              title="Logout"
              onClick={handleLogout}
              className="text-primary dark:text-inverse-primary hover:text-primary-hover transition-colors p-2 rounded-full flex items-center justify-center bg-surface hover:bg-surface-variant border border-border shadow-sm"
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
