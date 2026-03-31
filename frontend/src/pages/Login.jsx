import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth(); // Import the login function from context
  const navigate = useNavigate(); // Hook for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Call the backend
      const { data } = await API.post('/auth/login', formData);
      
      // 2. Update the AuthContext state with the returned user
      // Assuming your backend returns { user: { ... }, message: "..." }
      login(data.user); 

      // 3. Redirect to the protected dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4">
      {/* The Glass Card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-white/50 text-sm mt-2">Enter your credentials to access your account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/80 text-xs uppercase tracking-widest font-semibold mb-1.5 ml-1">Email Address</label>
            <input 
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all placeholder:text-white/20"
              placeholder="name@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-xs uppercase tracking-widest font-semibold mb-1.5 ml-1">Password</label>
            <input 
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all placeholder:text-white/20"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg shadow-blue-500/30 
              ${isSubmitting ? 'bg-blue-800 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98]'}`}
          >
            {isSubmitting ? 'Verifying...' : 'Secure Sign In'}
          </button>
        </form>

        <p className="text-center text-white/60 mt-8 text-sm">
          Don't have an account? <Link to="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;