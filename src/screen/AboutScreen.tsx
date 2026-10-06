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
import { useTranslation, type Language } from '../i18n';

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
  const { t, language, setLanguage } = useTranslation();
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
        Alert.alert(t('common.info'), t('about.noUpdate'));
        return;
      }
      setStatus('available');
      Alert.alert(
        t('about.updateReadyTitle'),
        t('about.updateReadyMessage'),
        [
          { text: t('about.later'), style: 'cancel' },
          {
            text: t('about.reload'),
            onPress: async () => {
              try {
                await Updates.reloadAsync();
              } catch (err) {
                console.error('Gagal memuat ulang:', err);
                Alert.alert(t('common.failed'), t('about.errReload'));
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error('Gagal mengunduh update:', err);
      Alert.alert(t('common.failed'), t('about.errDownload'));
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
              {t('about.statusChecking')}
            </Text>
          </View>
        );
      case 'available':
        return (
          <View style={[styles.statusBadge, styles.statusAvailable]}>
            <Text style={[styles.statusBadgeText, styles.statusAvailableText]}>
              {t('about.statusAvailable')}
            </Text>
          </View>
        );
      case 'up-to-date':
        return (
          <View style={[styles.statusBadge, styles.statusUpToDate]}>
            <Text style={[styles.statusBadgeText, styles.statusUpToDateText]}>
              {t('about.statusUpToDate')}
            </Text>
          </View>
        );
      case 'unavailable':
        return (
          <View style={[styles.statusBadge, styles.statusUnavailable]}>
            <Text style={[styles.statusBadgeText, styles.statusUnavailableText]}>
              {t('about.statusUnavailable')}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
    { value: 'id', label: t('about.indonesian') },
    { value: 'en', label: t('about.english') },
  ];

  const canInstall = status === 'available' && !installing;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('about.title')}</Text>
        <Text style={styles.subtitle}>
          {t('about.subtitle')}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('about.languageTitle')}</Text>
          <Text style={styles.cardDescription}>
            {t('about.languageDescription')}
          </Text>

          <View style={styles.segmentRow}>
            {LANGUAGE_OPTIONS.map((option) => {
              const active = language === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => setLanguage(option.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      active && styles.segmentBtnTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('about.versionInfo')}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('about.appVersion')}</Text>
            <Text style={styles.infoValueBold}>v{APP_VERSION}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('about.runtimeVersion')}</Text>
            <Text style={styles.infoValueBold}>
              {Updates.runtimeVersion ?? '-'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('about.installedUpdate')}</Text>
            <Text style={styles.infoValueBold}>
              {Updates.updateId
                ? shortId(Updates.updateId)
                : t('about.builtIn')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('about.channel')}</Text>
            <Text style={styles.infoValueBold}>{Updates.channel ?? '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('about.updateDate')}</Text>
            <Text style={styles.infoValueBold}>
              {formatDate(Updates.createdAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('about.otaStatus')}</Text>
            <Text style={styles.infoValueBold}>
              {updatesEnabled ? t('about.active') : t('about.inactive')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('about.otaUpdate')}</Text>
          <Text style={styles.cardDescription}>
            {t('about.otaDescription')}
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
              <Text style={styles.blackBtnText}>{t('about.updateNow')}</Text>
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
              <Text style={styles.outlineBtnText}>{t('about.recheck')}</Text>
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
  segmentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
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
