import axios from 'axios';

/**
 * baseURL Logic:
 * 1. Prioritize the Vercel Environment Variable (VITE_API_URL).
 * 2. If not set, use the production URL with the mandatory '/api' suffix.
 * 3. Default to localhost for local development.
 */
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD 
                    ? 'https://bank-o2xx.vercel.app/api' 
                    : 'http://localhost:5000/api');

const API = axios.create({
    baseURL: baseURL, 
    withCredentials: true, // Required for cross-site cookie/session handling
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Response Interceptor:
 * Automatically handles expired sessions. If the backend returns 401 (Unauthorized),
 * the user is redirected to the login page, unless they are already there or signing up.
 */
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');

        // Redirect to login only if unauthorized and not already on an auth-related page
        if (error.response?.status === 401 && !isAuthPage) {
            // Optional: Clear local user data if you store it in localStorage
            localStorage.removeItem('user'); 
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default API;