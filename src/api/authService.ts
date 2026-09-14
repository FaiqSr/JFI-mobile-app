import { Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 
  process.env.EXPO_PUBLIC_AUTH_BASE_URL || 
  ''
).replace(/\/+$/, '');

let isLoggingOut = false;

export const authService = {
  login: async (username: string, password: string) => {
    const url = `${BASE_URL}/user/login`;
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
    if (!isLoggingOut) {
      isLoggingOut = true;
      console.warn('[Auth Warning] Token kadaluarsa (401). Mengarahkan user kembali ke Login...');
      await authService.logout();

      setTimeout(() => {
        isLoggingOut = false;
      }, 3000);
    }
    return null;
  },

  getProfile: async (token?: string) => {
    const url = `${BASE_URL}/user/now`;
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

      if (res.status === 401) {
        await authService.refreshAccessToken();
      }

      return { success: false };
    } catch (error: any) {
      console.error('[Auth Error] Get Profile:', error?.message || error);
      return { success: false };
    }
  },

  updateProfile: async (payload: { full_name?: string; password?: string }) => {
    const url = `${BASE_URL}/user/now`;
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
        if (res.status === 401) {
          await authService.refreshAccessToken();
        } else {
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
      await AsyncStorage.multiRemove([
        'userToken',
        'refreshToken',
        'userId',
        'userName',
        'userRole',
        'userPermissions',
      ]);
    } catch (e) {
      console.error('[Auth Error] Logout:', e);
    } finally {
      DeviceEventEmitter.emit('FORCE_LOGOUT');
    }
  }
};