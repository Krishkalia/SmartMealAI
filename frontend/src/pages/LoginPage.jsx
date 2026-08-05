import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body-lg antialiased bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <header className="w-full sticky top-0 z-50 bg-background flex justify-between items-center px-margin py-4 max-w-max-width mx-auto border-b border-border dark:border-outline-variant">
        <Link to="/" className="font-h1 text-h1 font-bold text-primary">SmartMeal AI</Link>
      </header>
      
      <main className="flex-grow flex items-center justify-center py-section-gap-sm px-4 md:px-margin max-w-max-width mx-auto w-full">
        <div className="w-full max-w-md bg-surface rounded-xl border border-border p-6 md:p-10 shadow-sm md:shadow-md">
          <div className="mb-8 text-center">
            <h1 className="font-h1 text-h1 text-primary mb-2">Welcome Back</h1>
            <p className="font-body-lg text-body-lg text-text-secondary">Log in to view your meal plans.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary block">Email</label>
              <input 
                type="email" 
                required
                className="block w-full px-4 py-3 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary block">Password</label>
              <input 
                type="password" 
                required
                className="block w-full px-4 py-3 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              className="w-full bg-primary hover:bg-primary-hover text-on-primary font-body-lg text-body-lg font-semibold py-3 px-6 rounded-full transition-colors shadow-sm hover:shadow-md mt-4" 
              type="submit"
            >
              Log In
            </button>
          </form>

          <p className="mt-8 text-center font-body-sm text-body-sm text-text-secondary">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
