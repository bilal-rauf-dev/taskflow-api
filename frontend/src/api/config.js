const configuredOrigin = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ORIGIN = configuredOrigin.replace(/\/$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;
