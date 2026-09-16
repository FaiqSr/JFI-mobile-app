const API_ORIGIN = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');

export const AUTH_BASE_URL = `${API_ORIGIN}/api/auth`;
export const CS_BASE_URL = `${API_ORIGIN}/api/cs`;
export const PRODUCTION_BASE_URL = `${API_ORIGIN}/api/cs/produksi`;