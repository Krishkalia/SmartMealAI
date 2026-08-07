import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Set token on load if exists
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch('https://smartmealai.onrender.com/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('https://smartmealai.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.data.token);
      setUser(data.data);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password) => {
    const res = await fetch('https://smartmealai.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.data.token);
      setUser(data.data);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const updatePreferences = async (preferences) => {
    try {
      const res = await fetch('https://smartmealai.onrender.com/api/auth/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const toggleFavorite = async (recipe) => {
    try {
      const res = await fetch('https://smartmealai.onrender.com/api/auth/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipe })
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({ ...prev, favorites: data.data }));
        return { success: true, favorites: data.data };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updatePreferences, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
