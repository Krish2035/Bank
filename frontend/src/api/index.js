import axios from 'axios';

// Logic: If on Vercel/Netlify, we use the absolute path or relative /api
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD ? 'https://bank-cfwv.vercel.app' : 'http://localhost:5000');

const API = axios.create({
    baseURL: baseURL, // This will now point to https://bank-cfwv.vercel.app
    withCredentials: true,
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