const API_ORIGIN = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '') ?? 'https://jfi.faiqsr.my.id';

export const AUTH_BASE_URL = `${API_ORIGIN}/api/auth`;
export const PRODUCTION_BASE_URL = `${API_ORIGIN}/api/cs/produksi`;