import axios from 'axios';

/**
 * Logic for Dynamic Base URL:
 * 1. If VITE_API_URL is provided in environment variables, use it.
 * 2. In Production (Vercel): If the frontend and backend are on the same domain,
 * we use '/api' to leverage the vercel.json rewrites.
 * 3. In Development: Falls back to your local server (localhost:5000).
 */
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const API = axios.create({
    baseURL: baseURL,
    withCredentials: true, // CRITICAL: Allows cookies (JWT) to be sent/received
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Global Response Interceptor
 * Useful for handling expired sessions (401 Unauthorized) 
 * without writing try/catch in every single component.
 */
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            // Option 1: Clear local storage/state and redirect to login
            console.warn("Unauthorized! Redirecting to login...");
            
            // Avoid redirecting if the user is already on the login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        if (status === 500) {
            console.error("Internal Server Error. Please check backend logs.");
        }

        return Promise.reject(error);
    }
);

export default API;