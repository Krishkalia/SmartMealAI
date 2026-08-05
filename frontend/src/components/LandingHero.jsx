import React from 'react';
import { Link } from 'react-router-dom';

const LandingHero = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg text-body-lg antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="bg-background dark:bg-on-background w-full sticky top-0 z-50 border-b border-border dark:border-outline-variant transition-all duration-200 ease-in-out">
        <div className="flex justify-between items-center px-margin py-4 max-w-max-width mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-h1 text-h1 font-bold text-primary dark:text-primary-fixed">SmartMeal AI</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">Home</a>
            <a className="text-on-surface-variant font-normal hover:text-primary-hover transition-colors" href="#">Features</a>
            <a className="text-on-surface-variant font-normal hover:text-primary-hover transition-colors" href="#">Testimonials</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-primary dark:text-inverse-primary hover:text-primary-hover transition-colors p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="text-primary dark:text-inverse-primary hover:text-primary-hover transition-colors p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col relative w-full h-full overflow-hidden">
        {/* Hero Section with Full Bleed Background */}
        <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center px-4 md:px-margin py-section-gap-sm md:py-section-gap-lg">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div 
              className="bg-cover bg-center w-full h-full" 
              data-alt="A sophisticated, high-end editorial food photography shot featuring a beautifully plated rustic meal" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSmC1P1VDxBlM9qfMEyG4g2Qq8vaYXm-Il0PfeqF1voF3qznwA99byyR0E4U1H2yzEmG12PR6f0yjCgHHDOsssngn4bkQDS-OWGi4lAmP_nCFRQOfbV3CHSJs3nzZ9CleUFCLR0RYWLRPEnHnkqNjXdDqIuxMyEGgEP1zXfC5G9xPXNkFB3Gwz0C30aTZ8gac1XZcEWVot22ku8n-7Gf0fykaNjXB2e-UOp7brHn211nSBXV7fmLtw8w')" }}
            ></div>
            {/* Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30 md:from-background/95 md:via-background/80 md:to-transparent"></div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 max-w-max-width w-full mx-auto flex flex-col md:flex-row items-center justify-between">
            {/* Text Content */}
            <div className="w-full md:w-3/5 lg:w-1/2 flex flex-col gap-6 md:gap-8">
              <h1 className="font-hero-mobile text-hero-mobile md:font-hero md:text-hero text-on-background max-w-2xl animate-fade-up">
                Your perfect day, plated.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl animate-fade-up animation-delay-100">
                Personalized meal plans that use what you have and respect your budget.
              </p>
              <div className="pt-4 animate-fade-up animation-delay-200">
                <Link to="/onboarding" className="inline-flex bg-primary hover:bg-primary-hover text-on-primary font-body-lg text-body-lg px-8 py-4 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-background items-center justify-center gap-2 group">
                  Plan My Day
                  <span className="material-symbols-outlined transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>
            {/* Spacer */}
            <div className="hidden md:block w-2/5 relative h-full"></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingHero;
