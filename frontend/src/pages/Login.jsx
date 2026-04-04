import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a success message was passed from the Signup page
  const successMsg = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      /**
       * Backend returns: { message: "...", user: { ... } }
       * The cookie is handled automatically by the browser because of withCredentials: true
       */
      const { data } = await API.post('/auth/login', formData);
      
      // Update the AuthContext state
      login(data.user); 

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-white/50 text-sm mt-2">Enter your credentials to access your account</p>
        </div>
        
        {/* Success Message from Signup */}
        {successMsg && !error && (
          <div className="mb-6 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm text-center">
            {successMsg}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/80 text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ml-1">
              Email Address
            </label>
            <input 
              type="email"
              value={formData.email}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all placeholder:text-white/10"
              placeholder="name@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ml-1">
              Password
            </label>
            <input 
              type="password"
              value={formData.password}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all placeholder:text-white/10"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 shadow-lg 
              ${isSubmitting 
                ? 'bg-blue-800 cursor-not-allowed opacity-70' 
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.98]'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : 'Secure Sign In'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-white/40 text-sm">
            Don't have an account? <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors ml-1">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;