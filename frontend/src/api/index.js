import axios from 'axios';

/**
 * baseURL Logic:
 * 1. Prioritize the Vercel Environment Variable.
 * 2. Fallback to the production backend URL with /api.
 * 3. Default to localhost for development.
 */
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD 
                    ? 'https://bank-o2xx.vercel.app/api' 
                    : 'http://localhost:5000/api');

const API = axios.create({
    baseURL: baseURL, 
    withCredentials: true, // Crucial for sending JWT cookies across domains
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Response Interceptor:
 * Handles 401 Unauthorized errors by redirecting to login.
 */
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');

        if (error.response?.status === 401 && !isAuthPage) {
            localStorage.removeItem('user'); 
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default API;