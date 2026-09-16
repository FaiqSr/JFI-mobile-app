import { DeviceEventEmitter } from 'react-native';
import { Alert } from '../utils/appAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_BASE_URL } from './apiConfig';

let refreshPromise: Promise<string | null> | null = null;

export const authService = {
  login: async (username: string, password: string) => {
    const url = `${AUTH_BASE_URL}/user/login`;
    console.log(`[Auth Request] POST -> ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      console.log(`[Auth Status] POST -> ${url} [${res.status}]`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert('Login Gagal', json?.message || 'Username atau password salah.');
        return { success: false };
      }

      const { accessToken, refreshToken } = json.data || {};

      if (!accessToken) {
        Alert.alert('Error', 'Token tidak ditemukan pada respons server.');
        return { success: false };
      }

      await AsyncStorage.setItem('userToken', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }

      const profile = await authService.getProfile(accessToken);
      if (profile.success && profile.data) {
        if (profile.data.id) {
          await AsyncStorage.setItem('userId', String(profile.data.id));
        }
        await AsyncStorage.setItem('userName', profile.data.full_name || profile.data.username);
        await AsyncStorage.setItem('userRole', profile.data.role_name || '');
        await AsyncStorage.setItem('userPermissions', JSON.stringify(profile.data.permissions || []));
      } else {
        await AsyncStorage.setItem('userName', username);
      }

      return { success: true, data: json.data };
    } catch (error: any) {
      console.error('[Auth Error] Login:', error?.message || error);
      Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server auth.');
      return { success: false };
    }
  },

  refreshAccessToken: async (): Promise<string | null> => {
    if (refreshPromise) return refreshPromise; // single-flight: pemanggil bersamaan await promise yang sama

    refreshPromise = (async (): Promise<string | null> => {
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          await authService.logout();
          return null;
        }

        const url = `${AUTH_BASE_URL}/user/now/refresh`;
        console.log(`[Auth Request] POST -> ${url}`);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        const json = await res.json().catch(() => ({}));
        const newToken = res.ok ? json?.data?.accessToken : null;

        if (!newToken) {
          console.warn('[Auth Warning] Refresh ditolak server. Mengarahkan user kembali ke Login...');
          await authService.logout();
          return null;
        }

        await AsyncStorage.setItem('userToken', newToken);
        DeviceEventEmitter.emit('TOKEN_REFRESHED', newToken);
        console.log('[Auth Success] Access token diperbarui via refresh token.');
        return newToken;
      } catch (error: any) {
        console.error('[Auth Error] Refresh:', error?.message || error);
        await authService.logout();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  getProfile: async (token?: string, retryWithNewToken = true): Promise<{ success: boolean; data?: any }> => {
    const url = `${AUTH_BASE_URL}/user/now`;
    try {
      const activeToken = token || (await AsyncStorage.getItem('userToken'));
      if (!activeToken) return { success: false };

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${activeToken}`,
        },
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.data) {
        return { success: true, data: json.data };
      }

      if (res.status === 401 && retryWithNewToken) {
        const newToken = await authService.refreshAccessToken();
        if (newToken) return await authService.getProfile(newToken, false);
      }

      return { success: false };
    } catch (error: any) {
      console.error('[Auth Error] Get Profile:', error?.message || error);
      return { success: false };
    }
  },

  updateProfile: async (payload: { full_name?: string; password?: string }, retryWithNewToken = true): Promise<{ success: boolean; data?: any }> => {
    const url = `${AUTH_BASE_URL}/user/now`;
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return { success: false };

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.data) {
        if (json.data.full_name) {
          await AsyncStorage.setItem('userName', json.data.full_name);
        }
        Alert.alert('Sukses', json.message || 'Profil berhasil diperbarui.');
        return { success: true, data: json.data };
      } else {
        if (res.status === 401 && retryWithNewToken) {
          const newToken = await authService.refreshAccessToken();
          if (newToken) return await authService.updateProfile(payload, false);
          return { success: false };
        } else if (res.status !== 401) {
          Alert.alert('Gagal Update', json?.message || 'Gagal memperbarui profil.');
        }
        return { success: false };
      }
    } catch (error: any) {
      console.error('[Auth Error] Update Profile:', error?.message || error);
      Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server.');
      return { success: false };
    }
  },

  logout: async () => {
    try {
      // Idempoten: kalau sesi sudah bersih, jangan wipe/emit lagi (hindari loop FORCE_LOGOUT).
      const existingToken = await AsyncStorage.getItem('userToken');
      if (!existingToken) return;

      await AsyncStorage.multiRemove([
        'userToken',
        'refreshToken',
        'userId',
        'userName',
        'userRole',
        'userPermissions',
      ]);
      DeviceEventEmitter.emit('FORCE_LOGOUT');
    } catch (e) {
      console.error('[Auth Error] Logout:', e);
    }
  }
};