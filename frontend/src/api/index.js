import axios from 'axios';

/**
 * baseURL Logic:
 * 1. Prioritize the Vercel Environment Variable (VITE_API_URL).
 * 2. Fallback to the production backend URL with the mandatory /api suffix.
 * 3. Default to localhost for local development.
 */
const rawBaseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD 
                    ? 'https://bank-o2xx.vercel.app/api' 
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
        if (error.response?.status === 401 && !isAuthPage) {
            // Clear local user data to stay in sync with the server
            localStorage.removeItem('user'); 
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default API;