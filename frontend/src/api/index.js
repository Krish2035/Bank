import axios from 'axios';

// CRITICAL: Point this to your BACKEND deployment URL
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD ? 'https://bank-o2xx.vercel.app' : 'http://localhost:5000');

const API = axios.create({
    baseURL: baseURL, 
    withCredentials: true, // Required for JWT cookies across domains
    headers: {
        'Content-Type': 'application/json'
    }
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;