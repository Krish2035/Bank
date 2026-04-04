import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches latest user profile/balance. 
   * Call this after transactions to update UI.
   */
  const checkUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error("Logout request failed, clearing local state.");
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkUser, login, loading, logout }}>
      {!loading ? children : (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-blue-500 animate-pulse font-mono text-xl">
                &gt; ESTABLISHING_SECURE_CONNECTION...
            </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};