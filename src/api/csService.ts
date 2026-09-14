import { Alert } from 'react-native';
import { 
  ProgressTaskPayload, 
  QcApprovePayload, 
  RingRequest, 
  RingDuaRequest, 
  RingTigaRequest, 
  DjgRequest, 
  SeRequest 
} from '../type/csType';
import { authService } from './authService';
 
export const BASE_URL_CS = (
  process.env.EXPO_PUBLIC_CS_BASE_URL ||
  ''
).replace(/\/+$/, '');

export const BASE_URL_PROD = (
  process.env.EXPO_PUBLIC_PRODUCTION_BASE_URL ||
  ''
).replace(/\/+$/, '');

let isHandling401 = false;

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
  console.error(`❌ [Network/Service Error] ${context}`);
  if (status) {
    console.error(`   👉 Status: ${getStatusLabel(status)}`);
  }
  if (responseData) {
    console.error(`   👉 Response Body:`, JSON.stringify(responseData, null, 2));
  }
  console.error(`   👉 Exception Message:`, error?.message || error);

  if (
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('ConnectException') ||
    error?.message?.includes('MalformedURLException')
  ) {
    Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server. Pastikan koneksi internet atau server backend aktif.');
  } else if (status === 405 || error?.message?.includes('405')) {
    Alert.alert('Kesalahan Server (405)', 'Method HTTP atau rute API tidak diizinkan oleh server.');
  } else if (status === 403) {
    console.warn('⚠️ [API 403] Akses ditolak untuk endpoint ini.');
  } else {
    Alert.alert('Pemberitahuan', responseData?.message || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
  }
};

const handleUnauthorized = async (retryCallback: (newToken: string) => Promise<any>) => {
  if (isHandling401) {
    return { success: false, data: [], isUnauthorized: true };
  }

  isHandling401 = true;

  try {
    const newToken = await authService.refreshAccessToken();

    if (newToken) {
      console.log('🔄 [API Retry] Mengulang permintaan API dengan Token baru...');
      isHandling401 = false;
      return await retryCallback(newToken);
    }
    await authService.logout();
  } catch (e) {
    console.error('Gagal auto logout:', e);
  } finally {
    setTimeout(() => {
      isHandling401 = false;
    }, 3000);
  }

  return { success: false, data: [], isUnauthorized: true };
};

export const csService = {
  getOpenTasks: async (token: string, category?: string): Promise<any> => {
    const queryParam = category ? `?category=${encodeURIComponent(category)}` : '';
    const url = `${BASE_URL_CS}/tasks/open${queryParam}`;
    console.log(`🌐 [API Request] GET -> ${url}`);

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
    console.log(`🌐 [API Request] GET -> ${url}`);

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

  startTask: async (taskId: number, token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/tasks/${taskId}/start`;
    console.log(`🌐 [API Request] POST -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) => csService.startTask(taskId, newToken));
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`POST -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false };
      }

      return { success: true, ...json };
    } catch (error: any) {
      handleError(`POST -> ${url}`, error);
      return { success: false };
    }
  },

  submitProgress: async (taskId: number, payload: ProgressTaskPayload, token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/tasks/${taskId}/progress`;
    console.log(`🌐 [API Request] POST -> ${url}`, { payload });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_name: payload.product_name,
          job_description: payload.job_description,
          qty: Number(payload.qty),
        }),
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) => csService.submitProgress(taskId, payload, newToken));
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`POST -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false };
      }

      return { success: true, ...json };
    } catch (error: any) {
      handleError(`POST -> ${url}`, error);
      return { success: false };
    }
  },

  stopTask: async (taskId: number, token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/tasks/${taskId}/stop`;
    console.log(`🌐 [API Request] POST -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) => csService.stopTask(taskId, newToken));
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`POST -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false };
      }

      return { success: true, ...json };
    } catch (error: any) {
      handleError(`POST -> ${url}`, error);
      return { success: false };
    }
  },

  getTaskCsPdf: async (taskId: number, token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/tasks/${taskId}/cs`;
    console.log(`🌐 [API Request] GET -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) => csService.getTaskCsPdf(taskId, newToken));
      }

      if (!res.ok) {
        handleError(`GET -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status);
        return { success: false };
      }

      const blob = await res.blob();
      return { success: true, data: blob };
    } catch (error: any) {
      handleError(`GET -> ${url}`, error);
      return { success: false };
    }
  },

  submitWorkOrderToOperators: async (workOrderId: number, token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/work-orders/${workOrderId}/submit`;
    console.log(`🌐 [API Request] POST -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return await handleUnauthorized((newToken) => csService.submitWorkOrderToOperators(workOrderId, newToken));
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        handleError(`POST -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false };
      }
      return { success: true, ...json };
    } catch (error: any) {
      handleError(`POST -> ${url}`, error);
      return { success: false };
    }
  },

  closeTask: async (taskId: number, token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/tasks/${taskId}/close`;
    console.log(`🌐 [API Request] POST -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return await handleUnauthorized((newToken) => csService.closeTask(taskId, newToken));
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        handleError(`POST -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false };
      }
      return { success: true, ...json };
    } catch (error: any) {
      handleError(`POST -> ${url}`, error);
      return { success: false };
    }
  },

  qcApprove: async (workOrderId: number, payload: QcApprovePayload, token: string): Promise<any> => {
    const url = `${BASE_URL_CS}/work-orders/${workOrderId}/qc-approve`;
    console.log(`🌐 [API Request] POST -> ${url}`, { payload });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) return await handleUnauthorized((newToken) => csService.qcApprove(workOrderId, payload, newToken));
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        handleError(`POST -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false };
      }
      return { success: true, ...json };
    } catch (error: any) {
      handleError(`POST -> ${url}`, error);
      return { success: false };
    }
  },

  submitProductionData: async (
    endpoint: 'ring-satu' | 'ring-dua' | 'ring-tiga' | 'djg' | 'se',
    payload: RingRequest | RingDuaRequest | RingTigaRequest | DjgRequest | SeRequest | any,
    token: string
  ): Promise<any> => {
    const url = `${BASE_URL_PROD}/${endpoint}`;
    
    const sanitizedPayload = { ...payload };
    if (endpoint === 'ring-dua' && 'workType' in sanitizedPayload) {
      delete sanitizedPayload.workType;
    }

    console.log(`🌐 [API Request] POST -> ${url}`, { payload: sanitizedPayload });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedPayload),
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) =>
          csService.submitProductionData(endpoint, sanitizedPayload, newToken)
        );
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`POST -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false, errors: json?.errors };
      }

      return { success: true, message: json?.message || 'Data berhasil disimpan.' };
    } catch (error: any) {
      handleError(`POST -> ${url}`, error);
      return { success: false };
    }
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
    console.log(`🌐 [API Request] GET -> ${url}`);

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

  getProductionHistory: async (
    endpoint: 'ring-satu' | 'ring-dua' | 'ring-tiga' | 'djg' | 'se',
    token: string,
    params?: { search?: string; dateFrom?: string; dateTo?: string }
  ): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const url = `${BASE_URL_PROD}/${endpoint}${queryString}`;
    console.log(`🌐 [API Request] GET -> ${url}`);

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
          csService.getProductionHistory(endpoint, newToken, params)
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

  getAllProductionHistory: async (
    endpoint: 'ring-satu' | 'ring-dua' | 'ring-tiga' | 'djg' | 'se',
    token: string,
    params?: { search?: string; dateFrom?: string; dateTo?: string }
  ): Promise<any> => {
    return await csService.getProductionHistory(endpoint, token, params);
  },

  getAllProductionData: async (token: string): Promise<any> => {
    const url = `${BASE_URL_PROD}/dashboard/all-data`;
    console.log(`🌐 [API Request] GET -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        return await handleUnauthorized((newToken) => csService.getAllProductionData(newToken));
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        handleError(`GET -> ${url}`, new Error(`HTTP Error ${res.status}`), res.status, json);
        return { success: false, data: [] };
      }

      return { success: true, data: json?.data || json };
    } catch (error: any) {
      handleError(`GET -> ${url}`, error);
      return { success: false, data: [] };
    }
  },
};