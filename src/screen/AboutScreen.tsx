import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Updates from 'expo-updates';
import { Alert } from '../utils/appAlert';

const appJson = require('../../app.json');
const APP_VERSION: string = appJson?.expo?.version ?? '-';

type UpdateStatus = 'idle' | 'checking' | 'available' | 'up-to-date' | 'unavailable';

interface AboutScreenProps {
  onBack: () => void;
}

/** Potong updateId UUID jadi 8 karakter pertama supaya ringkas ditampilkan. */
const shortId = (id?: string | null): string =>
  id ? id.slice(0, 8) : '-';

const formatDate = (date?: Date | null): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(
    d.getHours()
  )}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
};

/**
 * Halaman "Tentang Aplikasi": menampilkan versi aplikasi & informasi update OTA,
 * plus tombol untuk memasang update terbaru secara manual (update tidak otomatis).
 */
export const AboutScreen = ({ onBack }: AboutScreenProps) => {
  const updatesEnabled = Updates.isEnabled;

  const [status, setStatus] = useState<UpdateStatus>(
    updatesEnabled ? 'checking' : 'unavailable'
  );
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (!updatesEnabled) {
      setStatus('unavailable');
      return;
    }
    setChecking(true);
    setStatus('checking');
    try {
      const result = await Updates.checkForUpdateAsync();
      setStatus(result.isAvailable ? 'available' : 'up-to-date');
    } catch (err) {
      console.error('Gagal memeriksa update:', err);
      setStatus('unavailable');
    } finally {
      setChecking(false);
    }
  }, [updatesEnabled]);

  // Cek ketersediaan update otomatis begitu halaman dibuka.
  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  const handleInstallUpdate = async () => {
    if (!updatesEnabled) return;
    setInstalling(true);
    try {
      const result = await Updates.fetchUpdateAsync();
      if (!result.isNew) {
        setStatus('up-to-date');
        Alert.alert('Info', 'Tidak ada update baru untuk diunduh.');
        return;
      }
      setStatus('available');
      Alert.alert(
        'Update Siap',
        'Update berhasil diunduh. Muat ulang aplikasi sekarang untuk memakai versi terbaru?',
        [
          { text: 'Nanti', style: 'cancel' },
          {
            text: 'Muat Ulang',
            onPress: async () => {
              try {
                await Updates.reloadAsync();
              } catch (err) {
                console.error('Gagal memuat ulang:', err);
                Alert.alert('Gagal', 'Tidak dapat memuat ulang aplikasi.');
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error('Gagal mengunduh update:', err);
      Alert.alert('Gagal', 'Gagal mengunduh update. Silakan coba lagi.');
    } finally {
      setInstalling(false);
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'checking':
        return (
          <View style={[styles.statusBadge, styles.statusChecking]}>
            <Text style={[styles.statusBadgeText, styles.statusCheckingText]}>
              Memeriksa update…
            </Text>
          </View>
        );
      case 'available':
        return (
          <View style={[styles.statusBadge, styles.statusAvailable]}>
            <Text style={[styles.statusBadgeText, styles.statusAvailableText]}>
              Update tersedia
            </Text>
          </View>
        );
      case 'up-to-date':
        return (
          <View style={[styles.statusBadge, styles.statusUpToDate]}>
            <Text style={[styles.statusBadgeText, styles.statusUpToDateText]}>
              Sudah versi terbaru
            </Text>
          </View>
        );
      case 'unavailable':
        return (
          <View style={[styles.statusBadge, styles.statusUnavailable]}>
            <Text style={[styles.statusBadgeText, styles.statusUnavailableText]}>
              OTA tidak tersedia pada build ini
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const canInstall = status === 'available' && !installing;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Tentang Aplikasi</Text>
        <Text style={styles.subtitle}>
          Informasi versi dan pembaruan aplikasi (update OTA).
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Versi</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versi aplikasi</Text>
            <Text style={styles.infoValueBold}>v{APP_VERSION}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Runtime version</Text>
            <Text style={styles.infoValueBold}>
              {Updates.runtimeVersion ?? '-'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Update terpasang</Text>
            <Text style={styles.infoValueBold}>
              {Updates.updateId
                ? shortId(Updates.updateId)
                : 'Bawaan (build awal)'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Channel</Text>
            <Text style={styles.infoValueBold}>{Updates.channel ?? '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal update</Text>
            <Text style={styles.infoValueBold}>
              {formatDate(Updates.createdAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status OTA</Text>
            <Text style={styles.infoValueBold}>
              {updatesEnabled ? 'Aktif' : 'Tidak aktif'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update OTA</Text>
          <Text style={styles.cardDescription}>
            Aplikasi tidak diperbarui otomatis. Tekan tombol di bawah untuk
            memeriksa dan memasang versi terbaru.
          </Text>

          <View style={styles.statusRow}>{renderStatusBadge()}</View>

          <TouchableOpacity
            style={[styles.blackBtn, !canInstall && styles.btnDisabled]}
            onPress={handleInstallUpdate}
            disabled={!canInstall}
            activeOpacity={0.8}
          >
            {installing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.blackBtnText}>Update Sekarang</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineBtn, checking && styles.btnDisabled]}
            onPress={checkForUpdate}
            disabled={checking || installing}
            activeOpacity={0.8}
          >
            {checking ? (
              <ActivityIndicator color="#0F172A" size="small" />
            ) : (
              <Text style={styles.outlineBtnText}>Cek Ulang</Text>
            )}
          </TouchableOpacity>
        </View>
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
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  statusRow: {
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusChecking: {
    backgroundColor: '#E2E8F0',
  },
  statusCheckingText: {
    color: '#475569',
  },
  statusAvailable: {
    backgroundColor: '#FEF3C7',
  },
  statusAvailableText: {
    color: '#B45309',
  },
  statusUpToDate: {
    backgroundColor: '#DCFCE7',
  },
  statusUpToDateText: {
    color: '#15803D',
  },
  statusUnavailable: {
    backgroundColor: '#FEE2E2',
  },
  statusUnavailableText: {
    color: '#B91C1C',
  },
  blackBtn: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  blackBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  outlineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
