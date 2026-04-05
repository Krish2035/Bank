import axios from 'axios';

/**
 * baseURL Logic:
 * 1. Prioritize the Environment Variable (VITE_API_URL).
 * 2. Fallback to the production URL with the '/api' prefix.
 * 3. Fallback to localhost for development.
 */
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD 
                    ? 'https://bank-o2xx.vercel.app/api' 
                    : 'http://localhost:5000/api');

const API = axios.create({
    baseURL: baseURL, 
    withCredentials: true, // CRITICAL: Allows browser to store/send JWT cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Response Interceptor:
 * Automatically handles session expiration. If the backend returns 401 (Unauthorized),
 * it redirects the user to the login page.
 */
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect if we aren't already on the login or signup page
        const isAuthPage = window.location.pathname.includes('/login') || 
                           window.location.pathname.includes('/signup');

        if (error.response?.status === 401 && !isAuthPage) {
            // Clear any local storage if necessary
            localStorage.removeItem('user'); 
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default API;