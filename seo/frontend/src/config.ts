// Centralized API configuration for Scalnex Frontend
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';
export const ML_API_BASE_URL = (import.meta as any).env?.VITE_ML_API_URL || 'http://127.0.0.1:8000';
