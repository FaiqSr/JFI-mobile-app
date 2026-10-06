import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Alert } from '../utils/appAlert';
import { UserHeader } from '../component/common/UserHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/authService';
import { useTranslation } from '../i18n';

interface ProfileScreenProps {
  userName?: string;
  onBack: () => void;
  onLogout?: () => void;
  onOpenAbout?: () => void;
  onUpdateUserName?: (newName: string) => void;
}

export const ProfileScreen = ({
  userName,
  onBack,
  onLogout,
  onOpenAbout,
  onUpdateUserName,
}: ProfileScreenProps) => {
  const { t } = useTranslation();
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
      Alert.alert(t('common.warning'), t('profile.errFullNameEmpty'));
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

        Alert.alert(t('common.success'), t('profile.successFullName'));
        loadProfile();
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('profile.errSaveFullName'));
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(t('common.warning'), t('profile.errPasswordEmpty'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('common.warning'), t('profile.errPasswordShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.warning'), t('profile.errPasswordMismatch'));
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.updateProfile({ password: newPassword });
      if (res.success) {
        Alert.alert(t('common.success'), t('profile.successPassword'));
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('profile.errSavePassword'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <UserHeader
          userName={fullName || username || userName || '...'}
          onLogout={onLogout}
          onOpenAbout={onOpenAbout}
        />

        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('profile.title')}</Text>
        <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>

        {loadingProfile ? (
          <ActivityIndicator size="large" color="#000000" style={{ marginTop: 40 }} />
        ) : (
          <>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('profile.accountInfo')}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.username')}</Text>
                <Text style={styles.infoValueBold}>{username || '-'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.role')}</Text>
                <Text style={styles.infoValueBold}>{role ? role.toUpperCase() : '-'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.accountCreated')}</Text>
                <Text style={styles.infoValueBold}>{createdAt}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.lastUpdated')}</Text>
                <Text style={styles.infoValueBold}>{updatedAt}</Text>
              </View>
            </View>

            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('profile.fullName')}</Text>
              <Text style={styles.cardDescription}>
                {t('profile.fullNameDescription')}
              </Text>

              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('profile.fullNamePlaceholder')}
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
                  <Text style={styles.blackBtnText}>{t('profile.saveFullName')}</Text>
                )}
              </TouchableOpacity>
            </View>

            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('profile.password')}</Text>
              <Text style={styles.cardDescription}>{t('profile.passwordDescription')}</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('profile.newPassword')}</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t('profile.newPasswordPlaceholder')}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('profile.confirmPassword')}</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('profile.confirmPasswordPlaceholder')}
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
                  <Text style={styles.blackBtnText}>{t('profile.savePassword')}</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
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
    borderRadius: 14,
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