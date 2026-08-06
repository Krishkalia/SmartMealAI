import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const res = await register(name, email, password);
    setIsLoading(false);
    if (res.success) {
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } else {
      toast.error(res.message || 'Failed to register');
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
            <h1 className="font-h1 text-h1 text-primary mb-2">Create Account</h1>
            <p className="font-body-lg text-body-lg text-text-secondary">Start planning smarter meals today.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps uppercase text-text-secondary block">Name</label>
              <input 
                type="text" 
                required
                className="block w-full px-4 py-3 border border-border rounded-lg bg-surface text-on-background font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              className="w-full bg-primary hover:bg-primary-hover text-on-primary font-body-lg text-body-lg font-semibold py-3 px-6 rounded-full transition-colors shadow-sm hover:shadow-md mt-4 flex items-center justify-center disabled:opacity-70" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center font-body-sm text-body-sm text-text-secondary">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
