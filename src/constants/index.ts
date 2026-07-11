export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Fintro';
export const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'app_theme',
  USER: 'auth_user',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  USERS: '/users',
  SETTINGS: '/settings',
  EXPENSES: '/expenses',
  LEDGER: '/ledger',
  ROOM: '/room',
  LOANS: '/loans',
  REPORTS: '/reports',
  UNAUTHORIZED: '/403',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
};
