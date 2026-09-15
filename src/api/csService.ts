import { Alert } from '../utils/appAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

const BASE_URL_CS = (
  process.env.EXPO_PUBLIC_CS_BASE_URL ||
  ''
).replace(/\/+$/, '');

const BASE_URL_PROD = (
  process.env.EXPO_PUBLIC_PRODUCTION_BASE_URL ||
  ''
).replace(/\/+$/, '');

const getStatusLabel = (status: number): string => {
  switch (status) {
    case 200: return '200 OK';
    case 201: return '201 Created';
    case 204: return '204 No Content';
    case 400: return '400 Bad Request';
    case 401: return '401 Unauthorized';
    case 403: return '403 Forbidden';
    case 404: return '404 Not Found';
    case 405: return '405 Method Not Allowed';
    case 422: return '422 Unprocessable Entity';
    case 500: return '500 Internal Server Error';
    default: return `${status} Status`;
  }
};

const handleError = (context: string, error: any, status?: number, responseData?: any) => {
  console.error(`[Network/Service Error] ${context}`);
  if (status) {
    console.error(`  Status: ${getStatusLabel(status)}`);
  }
  if (responseData) {
    console.error(`  Response Body:`, JSON.stringify(responseData, null, 2));
  }
  console.error(`  Exception Message:`, error?.message || error);

  if (
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('ConnectException') ||
    error?.message?.includes('MalformedURLException')
  ) {
    Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server. Pastikan koneksi internet atau server backend aktif.');
  } else if (status === 405 || error?.message?.includes('405')) {
    Alert.alert('Kesalahan Server (405)', 'Method HTTP atau rute API tidak diizinkan oleh server.');
  } else if (status === 403) {
    console.warn('[API 403] Akses ditolak untuk endpoint ini.');
  } else {
    Alert.alert('Pemberitahuan', responseData?.message || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
  }
};

const handleUnauthorized = async (retryCallback: (newToken: string) => Promise<any>) => {
  const newToken = await authService.refreshAccessToken();

  if (newToken) {
    console.log('[API Retry] Mengulang permintaan API dengan Token baru...');
    return await retryCallback(newToken);
  }

  // Refresh gagal: authService.logout() sudah wipe storage + emit FORCE_LOGOUT.
  return { success: false, data: [], isUnauthorized: true };
};

// Helper bersama untuk POST /tasks/:id/start dan /tasks/:id/progress.
// Sengaja TIDAK memakai handleError: alert pesan server dimiliki App.tsx,
// supaya operator tidak mendapat dua dialog bertumpuk saat progress gagal.
const postTaskSession = async (
  taskId: string | number,
  action: 'start' | 'progress',
  body?: object,
  retryWithNewToken = true
): Promise<any> => {
  const url = `${BASE_URL_CS}/tasks/${taskId}/${action}`;
  console.log(`[API Request] POST -> ${url}`);

  try {
    const token = await AsyncStorage.getItem('userToken');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && retryWithNewToken) {
      const newToken = await authService.refreshAccessToken();
      if (!newToken) {
        return { success: false, message: 'Sesi login berakhir. Silakan masuk kembali.' };
      }
      return await postTaskSession(taskId, action, body, false);
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`[API Error] POST ${url} -> ${getStatusLabel(res.status)}`, json);
      return {
        success: false,
        message: json?.message || 'Gagal mengirim data ke server CS.',
      };
    }

    return { success: true, data: json?.data };
  } catch (error: any) {
    console.error(`[Network/Service Error] POST -> ${url}`, error);
    return {
      success: false,
      message: 'Tidak dapat terhubung ke server CS. Periksa koneksi internet.',
    };
  }
};

export const csService = {
  getOpenTasks: async (token: string, category?: string): Promise<any> => {
    const queryParam = category ? `?category=${encodeURIComponent(category)}` : '';
    const url = `${BASE_URL_CS}/tasks/open${queryParam}`;
    console.log(`[API Request] GET -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}` 
        },
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) => csService.getOpenTasks(newToken, category));
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`GET -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false, data: [] };
      }

      const taskList = json?.data?.items || json?.data || json?.tasks || (Array.isArray(json) ? json : []);
      return { success: true, data: taskList };
    } catch (error: any) {
      handleError(`GET -> ${url}`, error);
      return { success: false, data: [] };
    }
  },

  getMyTasks: async (token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/tasks/me`;
    console.log(`[API Request] GET -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}` 
        },
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) => csService.getMyTasks(newToken));
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`GET -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false, data: [] };
      }

      const taskList = json?.data?.items || json?.data || json?.tasks || (Array.isArray(json) ? json : []);
      return { success: true, data: taskList };
    } catch (error: any) {
      handleError(`GET -> ${url}`, error);
      return { success: false, data: [] };
    }
  },

  getMySessions: async (token: string): Promise<any> => {
    return await csService.getMyTasks(token);
  },

  getRecentHistoryMe: async (
    token: string,
    params?: { page?: number; pageSize?: number; dateFrom?: string; dateTo?: string }
  ): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const url = `${BASE_URL_PROD}/recent-history/me${queryString}`;
    console.log(`[API Request] GET -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) =>
          csService.getRecentHistoryMe(newToken, params)
        );
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`GET -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false, data: [] };
      }

      const list = json?.data?.items || json?.data || (Array.isArray(json) ? json : []);
      return { success: true, data: list };
    } catch (error: any) {
      handleError(`GET -> ${url}`, error);
      return { success: false, data: [] };
    }
  },

  // Operator memulai sesi kerja pada task (POST /tasks/:id/start).
  // Idempoten di server: sesi ACTIVE yang sudah ada dikembalikan apa adanya.
  startTask: async (taskId: string | number): Promise<any> => {
    return await postTaskSession(taskId, 'start', undefined, true);
  },

  // Operator melaporkan qty sesi (POST /tasks/:id/progress).
  // Server mewajibkan sesi ACTIVE (403) dan task IN_PROGRESS (409).
  progressTask: async (
    taskId: string | number,
    body: { qty: number; product_name?: string | null; job_description?: string | null }
  ): Promise<any> => {
    return await postTaskSession(taskId, 'progress', body, true);
  },


};