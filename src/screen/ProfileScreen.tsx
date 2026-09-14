import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/authService';

interface ProfileScreenProps {
  userName?: string;
  onBack: () => void;
  onLogout?: () => void;
  onUpdateUserName?: (newName: string) => void;
}

export const ProfileScreen = ({
  userName,
  onBack,
  onLogout,
  onUpdateUserName,
}: ProfileScreenProps) => {
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [savingName, setSavingName] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}.${minutes}.${seconds}`;
  };

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await authService.getProfile();

      if (res.success && res.data) {
        const d = res.data;
        const fetchedUsername = d.username || d.email || userName || '-';
        const fetchedFullName = d.full_name || d.name || '';

        setUsername(fetchedUsername);
        setRole(d.role_name || d.role || '-');
        setCreatedAt(formatDate(d.created_at || d.createdAt));
        setUpdatedAt(formatDate(d.updated_at || d.updatedAt));
        setFullName(fetchedFullName);

        if (fetchedFullName) {
          await AsyncStorage.setItem('user_full_name', fetchedFullName);
        }
      }
    } catch (err: any) {
      console.error('Gagal memuat profil:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveFullName = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert('Peringatan', 'Nama lengkap tidak boleh kosong');
      return;
    }

    try {
      setSavingName(true);
      const res = await authService.updateProfile({ full_name: trimmedName });
      if (res.success) {

        await AsyncStorage.setItem('user_full_name', trimmedName);

        if (onUpdateUserName) {
          onUpdateUserName(trimmedName);
        }

        Alert.alert('Sukses', 'Nama lengkap berhasil diperbarui');
        loadProfile();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal menyimpan nama lengkap');
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Peringatan', 'Harap isi kata sandi baru dan konfirmasinya');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Peringatan', 'Kata sandi baru minimal 8 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Peringatan', 'Ulangi kata sandi tidak cocok');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.updateProfile({ password: newPassword });
      if (res.success) {
        Alert.alert('Sukses', 'Kata sandi berhasil diperbarui');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal memperbarui kata sandi');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerBar}>
        <View style={styles.userBadge}>
          
          <Text style={styles.userBadgeText}>{fullName || username || userName || '...'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Profil Saya</Text>
        <Text style={styles.subtitle}>Kelola informasi akun dan kata sandi Anda.</Text>

        {loadingProfile ? (
          <ActivityIndicator size="large" color="#000000" style={{ marginTop: 40 }} />
        ) : (
          <>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Informasi Akun</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama Pengguna</Text>
                <Text style={styles.infoValueBold}>{username || '-'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Peran</Text>
                <Text style={styles.infoValueBold}>{role ? role.toUpperCase() : '-'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Akun dibuat</Text>
                <Text style={styles.infoValueBold}>{createdAt}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Terakhir diperbarui</Text>
                <Text style={styles.infoValueBold}>{updatedAt}</Text>
              </View>
            </View>

            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Nama Lengkap</Text>
              <Text style={styles.cardDescription}>
                Dipakai sebagai nama operator pada lembar kerja produksi.
              </Text>

              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                style={[styles.blackBtn, savingName && { opacity: 0.7 }]}
                onPress={handleSaveFullName}
                disabled={savingName}
              >
                {savingName ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.blackBtnText}>Simpan Nama Lengkap</Text>
                )}
              </TouchableOpacity>
            </View>

            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Kata Sandi</Text>
              <Text style={styles.cardDescription}>Kata sandi baru minimal 8 karakter.</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Kata sandi baru</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Masukkan kata sandi baru"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Ulangi kata sandi</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Ulangi kata sandi baru"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <TouchableOpacity
                style={[styles.blackBtn, savingPassword && { opacity: 0.7 }]}
                onPress={handleSavePassword}
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.blackBtnText}>Simpan Kata Sandi</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  userBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userBadgeText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValueBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  blackBtn: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  blackBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});