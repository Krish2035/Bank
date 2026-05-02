import axios from 'axios';

/**
 * baseURL Logic:
 * 1. Prioritize the Vercel Environment Variable (VITE_API_URL).
 * 2. Fallback to the production backend URL with the mandatory /api suffix.
 * 3. Default to localhost for local development.
 */
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

const rawBaseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD || isVercel
                    ? '/api' 
                    : 'http://localhost:5000/api');

// Safety: Ensure there is no trailing slash at the end of the baseURL
// to prevent double slashes like .../api//auth/login
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

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
        // Added check for error.config.url to avoid redirecting if the login call itself fails (though that's usually 400/401)
        if (error.response?.status === 401 && !isAuthPage && !error.config.url.includes('/auth/login')) {
            console.warn("Unauthorized access detected. Redirecting to login...");
            localStorage.removeItem('user'); 
            
            // Avoid multiple redirects if one is already in progress
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }
        
        return Promise.reject(error);
    }
);

export default API;