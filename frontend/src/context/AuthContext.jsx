import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage to prevent "friction of second" flicker
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // If we have a saved user, we can start with loading: false to show the UI immediately
  const [loading, setLoading] = useState(() => !localStorage.getItem('user'));

  /**
   * Fetches latest user profile/balance. 
   * Call this after transactions to update UI.
   */
  const checkUser = useCallback(async () => {
    try {
      console.log("Checking user session...");
      const { data } = await API.get('/auth/me');
      console.log("Session check successful:", data.email);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn("Session check failed or expired.");
      setUser(null);
      localStorage.removeItem('user');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    console.log("Login state updating for:", userData.email);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error("Logout request failed, clearing local state.");
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkUser, login, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};