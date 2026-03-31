import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the latest user profile and balance from the backend.
   * Returns the updated user object so components can react immediately.
   */
  const checkUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data);
      return data; // Return data so callers can await the actual result
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manual login function
   */
  const login = (userData) => {
    setUser(userData);
  };

  /**
   * Logs the user out and clears state
   */
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error("Logout failed, clearing local state.");
    } finally {
      setUser(null);
      window.location.replace('/login');
    }
  };

  // Initial check on mount
  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      checkUser, // Make sure checkUser is exported in the value!
      login, 
      loading, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};