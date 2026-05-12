// Centralized API base URL — reads from Vite env variable.
// For local dev:    set VITE_API_URL=http://localhost:3000  in frontend/.env
// For Vercel prod:  set VITE_API_URL=https://drishya-0szb.onrender.com  in Vercel env settings
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
