export const API_VERSION_V1: string = '/api/v1';
export const GATEWAY_URL: string = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : 'http://localhost:5153';
export const MAINTENANCE_MODE_ENABLED: boolean = String(import.meta.env.VITE_MAINTENANCE_MODE_ENABLED).toLowerCase() === 'true';