import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import heroImage from '../assets/dashboard-demo.png';

const LandingHero = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    toast.success('Successfully logged out');
  };

  return (
    <div className="min-h-screen flex flex-col font-body-lg text-body-lg antialiased bg-white selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation */}
      <header className="w-full z-50 bg-white">
        <div className="flex justify-between items-center px-4 md:px-margin py-4 max-w-max-width mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">restaurant_menu</span>
            <span className="font-h2 text-xl font-bold text-slate-800">SmartMeal AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-primary transition-colors"
            >
              Features
            </a>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-slate-500 hover:text-primary transition-colors p-2 rounded-full flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-2xl">account_circle</span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 font-body-sm text-body-sm text-slate-700">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-slate-500 text-xs truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-2 hover:bg-slate-50 transition-colors">
                        Dashboard
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 hover:bg-slate-50 transition-colors">
                        Log In
                      </Link>
                      <Link to="/signup" className="block px-4 py-2 hover:bg-slate-50 transition-colors">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-white relative pt-12 md:pt-24 pb-0">
        <div className="max-w-max-width mx-auto px-4 md:px-margin text-center md:text-left flex flex-col items-center md:items-start z-10 relative">
          <h1 className="font-hero-mobile text-5xl md:text-6xl font-black text-slate-900 leading-tight max-w-3xl tracking-tight">
            AI-Powered Meal Planning <br className="hidden md:block" />
            <span className="text-primary">For The Modern Household</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl leading-relaxed">
            SmartMeal AI is an intuitive meal planner. It's designed to make your life easier by generating personalized recipes based on your pantry, budget, and dietary needs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-medium px-8 py-3.5 rounded transition-colors text-center shadow-sm">
              Get started
            </Link>
            <Link to="/signup" className="w-full sm:w-auto bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary font-medium px-8 py-3.5 rounded transition-colors text-center shadow-sm">
              Live demo
            </Link>
          </div>
        </div>
        
        {/* Swoosh SVG Separator */}
        <div className="w-full overflow-hidden leading-none mt-16 md:mt-24 pointer-events-none translate-y-[2px]">
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[150px] md:h-[250px]">
            <path fill="#111827" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Dark Content Wrapper */}
      <div className="bg-[#111827] flex-grow flex flex-col">
        
        {/* Core Features Section */}
        <section id="features" className="w-full py-16 border-b border-slate-800">
          <div className="max-w-max-width mx-auto px-4 md:px-margin">
            <h2 className="text-2xl font-bold text-white text-center mb-16">Core Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-teal-500">
                  <span className="material-symbols-outlined">kitchen</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Pantry Integrated</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    SmartMeal AI is pantry-aware, meaning you can generate recipes that prioritize what you already have to reduce food waste.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-blue-400">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Budget Conscious</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Set a daily budget and watch as the AI crafts a full day of meals that adhere strictly to your financial constraints.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-rose-400">
                  <span className="material-symbols-outlined">health_and_safety</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Allergy Safe</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    An intelligent engine that's familiar with severe allergies and dietary restrictions, ensuring every meal is safe for your family.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Showcase Section */}
        <section className="w-full py-24 border-b border-slate-800 overflow-hidden">
          <div className="max-w-max-width mx-auto px-4 md:px-margin flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Beautiful, Personalized Plans</h2>
            <p className="text-slate-400 text-center max-w-2xl leading-relaxed mb-16">
              When you generate a plan, you'll see a clean, organized dashboard containing your daily meals, a consolidated shopping list, and an interactive cooking timeline. Find exactly what's for dinner today and the rest of the week.
            </p>
            
            <div className="w-full max-w-5xl rounded-lg overflow-hidden shadow-2xl border border-slate-700 relative">
              {/* Fake browser header */}
              <div className="w-full h-8 bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <img 
                src={heroImage} 
                alt="SmartMeal AI Dashboard" 
                className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-500 object-cover"
                style={{ maxHeight: '600px', objectPosition: 'top' }}
              />
            </div>
          </div>
        </section>

        {/* More Features Grid */}
        <section className="w-full py-24">
          <div className="max-w-max-width mx-auto px-4 md:px-margin">
            <div className="text-center mb-20">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">Tons of Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">More Than You'll Ever Need</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
                SmartMeal AI has a whole host of features that you'll love. From the ability to swap ingredients on the fly, to consolidated grocery lists, you'll find what you need.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-16 max-w-4xl mx-auto">
              {/* Grid Item 1 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">swap_horiz</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Interactive Smart Swaps</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Easily swap ingredients from recipes using our intelligent AI options that respect your budget and dietary constraints.
                  </p>
                </div>
              </div>

              {/* Grid Item 2 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">checklist</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Consolidated Shopping List</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Automatically combine identical ingredients across multiple meals into a single, easy-to-read shopping checklist.
                  </p>
                </div>
              </div>

              {/* Grid Item 3 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Cooking Timeline</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Schedule and overlap your prep and cook times efficiently with a visual timeline of your daily meals.
                  </p>
                </div>
              </div>

              {/* Grid Item 4 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">currency_rupee</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Local Price Dataset</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Accurate cost estimations powered by a local database of standard ingredient prices for budget tracking.
                  </p>
                </div>
              </div>

              {/* Grid Item 5 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">group_add</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Customizable Servings</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Instantly scale recipes up or down; all ingredient quantities automatically recalculate.
                  </p>
                </div>
              </div>

              {/* Grid Item 6 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">design_services</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Beautiful Interface</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    A gorgeous, highly polished UI utilizing SweetAlerts, fluid animations, and premium typography.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-[#0a0f18] py-8 border-t-2 border-primary">
          <div className="max-w-max-width mx-auto px-4 md:px-margin flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
              <a href="#" className="hover:text-white transition-colors">Jobs</a>
              <a href="#" className="hover:text-white transition-colors">Press</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
              <a href="#" className="hover:text-white transition-colors">Partners</a>
            </div>
            <div className="text-slate-500 text-sm text-center mt-2">
              © {new Date().getFullYear()} SmartMeal AI, Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingHero;
