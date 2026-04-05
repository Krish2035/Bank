import axios from 'axios';

// Check if we are in production or local development
const isProd = import.meta.env.PROD;

const API = axios.create({
    // IMPORTANT: Both URLs must end with /api
    baseURL: isProd 
        ? 'https://bank-o2xx.vercel.app/api' 
        : 'http://localhost:5000/api', 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to handle 401 Unauthorized errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;