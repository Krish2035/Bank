import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD 
                    ? 'https://bank-o2xx.vercel.app/api' 
                    : 'http://localhost:5000/api');

const API = axios.create({
    baseURL: baseURL, 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

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