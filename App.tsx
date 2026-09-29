import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import { Alert } from './src/utils/appAlert';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LoginScreen } from './src/screen/LoginScreen';
import { HomeScreen } from './src/screen/HomeScreen';
import { ProfileScreen } from './src/screen/ProfileScreen';
import { AboutScreen } from './src/screen/AboutScreen';
import { Ring1Screen } from './src/screen/Ring1Screen';
import { Ring2Screen } from './src/screen/Ring2Screen';
import { Ring3Screen } from './src/screen/Ring3Screen';
import { SealingElementScreen } from './src/screen/SealingElementScreen';
import { DoubleJacketScreen } from './src/screen/DoubleJacketScreen';
import { GnmScreen } from './src/screen/GnmScreen';

import { ScreenType, ScreenFormData, initialFormState } from './src/type/FormType';
import {
  submitProductionData,
  getRingProps,
  getSealingProps,
  getDoubleJacketProps,
  getGnmProps,
  getLhpMasterCatalog,
  type LhpMasterCatalog,
} from './src/api/FormService';
import { authService } from './src/api/authService';
import {
  isValidTime,
  normalizeTimeInput,
  timestampToHHMM,
  timeStringToTimestamp,
} from './src/utils/time';

if ((Text as any).defaultProps) {
  (Text as any).defaultProps.allowFontScaling = false;
} else {
  (Text as any).defaultProps = { allowFontScaling: false };
}

if ((TextInput as any).defaultProps) {
  (TextInput as any).defaultProps.allowFontScaling = false;
} else {
  (TextInput as any).defaultProps = { allowFontScaling: false };
}

const DRAFT_KEY = '@app_form_draft_v4';
const LAST_SCREEN_KEY = '@app_last_active_screen';

/** The five production-area worksheets, in the plant's area order. */
export type ExtendedScreenType = ScreenType | 'PROFIL' | 'ABOUT';

/** Layar non-worksheet: tidak menyimpan draf, tidak punya timer, dsb. */
const isNonWorksheetScreen = (
  screen: ExtendedScreenType
): screen is 'HOME' | 'PROFIL' | 'ABOUT' =>
  screen === 'HOME' || screen === 'PROFIL' || screen === 'ABOUT';

const hasValue = (val: string | number | undefined | null): boolean => {
  if (val === null || val === undefined) return false;
  const str = String(val).trim();
  return str.length > 0;
};

/**
 * True when the operator has entered anything meaningful on a worksheet.
 * `namaOperator` is deliberately excluded: it is auto-filled from the logged-in
 * user, so counting it would mark every worksheet active and drafts would never clear.
 */
const hasMeaningfulData = (form: ScreenFormData | undefined): boolean => {
  if (!form) return false;

  const textFields: (keyof ScreenFormData)[] = [
    'nomorSO',
    'jobDescription',
    'jobNoted',
    'product',
    'productName',
    'materialType',
    'materialNoted',
    'size',
    'notedSize',
    'notedSizeOdId',
    'classVal',
    'workType',
    'thickness',
    'hoop',
    'filler',
    'ir',
    'orVal',
    'idVal',
    'odVal',
    'metal',
    'noteTimeActivities',
    'startTimeText',
    'stopTimeText',
    'type1',
    'type2',
  ];
  if (textFields.some((field) => hasValue(form[field] as string | undefined))) return true;

  const counters: (keyof ScreenFormData)[] = [
    'gantiOrder',
    'repair',
    'materialTunggu',
    'operatorTime',
    'maintenance',
    'checking',
    'finishGood',
    'rework',
  ];
  if (counters.some((field) => Number(form[field]) > 0)) return true;

  return hasValue(form.startTimestamp) || hasValue(form.stopTimestamp);
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ExtendedScreenType>('HOME');
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const [lastActiveScreen, setLastActiveScreen] = useState<ScreenType | null>(null);

  const [formsData, setFormsData] = useState<Record<string, ScreenFormData>>({
    RING_1: { ...initialFormState },
    RING_2: { ...initialFormState },
    RING_3: { ...initialFormState },
    SEALING_ELEMENT: { ...initialFormState },
    DOUBLE_JACKETED: { ...initialFormState },
    GNM: { ...initialFormState },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [lhpCatalogs, setLhpCatalogs] = useState<Record<string, LhpMasterCatalog>>({});

  useEffect(() => {
    if (!isLoggedIn || !userToken) return;
    let cancelled = false;
    Promise.all(['RING_1', 'RING_2', 'RING_3', 'SE'].map((area) => getLhpMasterCatalog(area).then((catalog) => [area, catalog] as const)))
      .then((entries) => { if (!cancelled) setLhpCatalogs(Object.fromEntries(entries.filter(([, catalog]) => catalog)) as Record<string, LhpMasterCatalog>); });
    return () => { cancelled = true; };
  }, [isLoggedIn, userToken]);

  // Ambil nama operator terbaru dari profil server (GET /user/now) saat app
  // dibuka / sesudah login, supaya worksheet tidak memakai nama yang basi.
  useEffect(() => {
    if (!isLoggedIn || !userToken) return;
    let cancelled = false;
    authService.syncUserName().then((name) => {
      if (!cancelled && name) setUserName(name);
    });
    return () => { cancelled = true; };
  }, [isLoggedIn, userToken]);

  // Nama operator pada setiap worksheet selalu diisi dari akun yang login dan
  // tidak boleh kosong. Field-nya read-only di UI, jadi ini satu-satunya sumber.
  useEffect(() => {
    if (!isRestored || !userName) return;
    setFormsData((prev) => {
      let changed = false;
      const next: Record<string, ScreenFormData> = { ...prev };
      Object.keys(next).forEach((key) => {
        const form = next[key];
        if (!form || form.namaOperator === userName) return;
        next[key] = { ...form, namaOperator: userName };
        changed = true;
      });
      return changed ? next : prev;
    });
  }, [isRestored, userName]);

  const saveLastActiveScreen = useCallback(async (screen: ScreenType | null) => {
    setLastActiveScreen(screen);
    try {
      if (screen) {
        await AsyncStorage.setItem(LAST_SCREEN_KEY, screen);
      } else {
        await AsyncStorage.removeItem(LAST_SCREEN_KEY);
      }
    } catch (e) {
      console.error('Gagal simpan/hapus last active screen:', e);
    }
  }, []);

  const activeScreen = useMemo(() => {
    const runningTimerKey = Object.keys(formsData).find((key) => {
      const form = formsData[key];
      return form && (form.isStarted || form.startTimestamp !== null);
    });
    if (runningTimerKey) return runningTimerKey as ScreenType;

    const activeTaskKey = Object.keys(formsData).find((key) => {
      const form = formsData[key];
      if (!form) return false;
      return hasMeaningfulData(form);
    });
    if (activeTaskKey) return activeTaskKey as ScreenType;

    return lastActiveScreen;
  }, [formsData, lastActiveScreen]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const savedUserName = await AsyncStorage.getItem('userName');
        if (token) {
          setUserToken(token);
          if (savedUserName) setUserName(savedUserName);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const updateFormField = <K extends keyof ScreenFormData>(
    screen: ScreenType,
    field: K,
    value: ScreenFormData[K]
  ) => {
    setFormsData((prev) => ({
      ...prev,
      [screen]: {
        ...prev[screen],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    const loadSavedDraft = async () => {
      try {
        const jsonDraft = await AsyncStorage.getItem(DRAFT_KEY);
        const savedLastScreen = await AsyncStorage.getItem(LAST_SCREEN_KEY);

        if (jsonDraft !== null) {
          const draft = JSON.parse(jsonDraft);
          if (draft.formsData) {
            const hasAnyData = Object.values(draft.formsData).some(
              (form: any) => hasMeaningfulData(form)
            );

            if (hasAnyData) {
              // Backfill fields added after the draft was written (e.g. the
              // manual time-entry text mirrors) so old drafts still hydrate.
              const hydratedForms: Record<string, ScreenFormData> = {};
              Object.entries(draft.formsData).forEach(([key, form]) => {
                const raw = (form ?? {}) as Partial<ScreenFormData>;
                hydratedForms[key] = {
                  ...initialFormState,
                  ...raw,
                  startTimeText:
                    raw.startTimeText ?? timestampToHHMM(raw.startTimestamp ?? null),
                  stopTimeText:
                    raw.stopTimeText ?? timestampToHHMM(raw.stopTimestamp ?? null),
                };
              });
              setFormsData(hydratedForms);
              if (savedLastScreen) {
                setLastActiveScreen(savedLastScreen as ScreenType);
              }
            } else {
              await AsyncStorage.removeItem(DRAFT_KEY);
              await AsyncStorage.removeItem(LAST_SCREEN_KEY);
            }
          }
        }
      } catch (e) {
        console.error('Gagal memuat draf:', e);
      } finally {
        setIsRestored(true);
      }
    };

    loadSavedDraft();
  }, []);

  useEffect(() => {
    if (!isRestored) return;

    const timer = setTimeout(async () => {
      try {
        if (!activeScreen) {
          await AsyncStorage.removeItem(DRAFT_KEY);
          await AsyncStorage.removeItem(LAST_SCREEN_KEY);
          return;
        }

        const draftData = { currentScreen, formsData };
        await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      } catch (e) {
        console.error('Gagal menyimpan draf:', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isRestored, currentScreen, formsData, activeScreen]);

  // Mengunci nama operator pada setiap form agar tidak hilang saat clear/simpan
  const handleClear = useCallback(async () => {
    if (!isNonWorksheetScreen(currentScreen)) {
      const activeData = formsData[currentScreen];

      const preservedOperator = activeData?.namaOperator || userName;

      setFormsData((prev) => ({
        ...prev,
        [currentScreen]: {
          ...initialFormState,
          namaOperator: String(preservedOperator),
        },
      }));

      saveLastActiveScreen(currentScreen as ScreenType);
    } else {
      setLastActiveScreen(null);
      const emptyForms: Record<string, ScreenFormData> = {
        RING_1: { ...initialFormState, namaOperator: userName },
        RING_2: { ...initialFormState, namaOperator: userName },
        RING_3: { ...initialFormState, namaOperator: userName },
        SEALING_ELEMENT: { ...initialFormState, namaOperator: userName },
        DOUBLE_JACKETED: { ...initialFormState, namaOperator: userName },
        GNM: { ...initialFormState, namaOperator: userName },
      };
      setFormsData(emptyForms);

      try {
        await AsyncStorage.removeItem(LAST_SCREEN_KEY);
        await AsyncStorage.removeItem(DRAFT_KEY);
      } catch (e) {
        console.error('Gagal membersihkan draf dari penyimpanan:', e);
      }
    }
  }, [currentScreen, formsData, userName, saveLastActiveScreen]);

  const handleNavigate = useCallback((screen: ExtendedScreenType) => {
    if (!isNonWorksheetScreen(screen)) {
      saveLastActiveScreen(screen as ScreenType);
      // Saat worksheet dibuka, kosongkan seluruh form kecuali nama operator.
      // Status timer (mulai/stop) tetap dipertahankan.
      setFormsData((prev) => {
        const existing = prev[screen];
        return {
          ...prev,
          [screen]: {
            ...initialFormState,
            namaOperator: existing?.namaOperator || userName,
            startTimestamp: existing?.startTimestamp ?? null,
            stopTimestamp: existing?.stopTimestamp ?? null,
            startTimeText: existing?.startTimeText ?? '',
            stopTimeText: existing?.stopTimeText ?? '',
            isStarted: existing?.isStarted ?? false,
          },
        };
      });
    }
    setCurrentScreen(screen);
  }, [saveLastActiveScreen, userName]);

  useEffect(() => {
    const backAction = () => {
      if (currentScreen !== 'HOME') {
        setCurrentScreen('HOME');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [currentScreen]);

  const parseIntegerInput = (text: string): number => {
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned === '' ? 0 : parseInt(cleaned, 10);
  };

  const formatHHMM = (time: number | null): string => timestampToHHMM(time);

  const nowHHMM = (): string => timestampToHHMM(Date.now());

  // Timer lokal saja — entry tidak lagi terikat sesi kerja CS di server.
  const handleToggleStartStop = async () => {
    if (isNonWorksheetScreen(currentScreen)) return;
    const currentData = formsData[currentScreen];

    if (!currentData.isStarted) {
      updateFormField(currentScreen, 'startTimestamp', Date.now());
      updateFormField(currentScreen, 'startTimeText', nowHHMM());
      updateFormField(currentScreen, 'stopTimestamp', null);
      updateFormField(currentScreen, 'stopTimeText', '');
      updateFormField(currentScreen, 'isStarted', true);
    } else {
      updateFormField(currentScreen, 'stopTimestamp', Date.now());
      updateFormField(currentScreen, 'stopTimeText', nowHHMM());
      updateFormField(currentScreen, 'isStarted', false);
    }
  };

  // Manual time entry: typing updates the text mirror immediately and the
  // timestamp whenever the text becomes a complete valid HH:MM. `isStarted`
  // (timer running) stays in sync = start set but stop not set yet.
  const handleChangeStartTime = (text: string) => {
    if (isNonWorksheetScreen(currentScreen)) return;
    const normalized = normalizeTimeInput(text);
    const startTs = isValidTime(normalized) ? timeStringToTimestamp(normalized) : null;
    const stopTs = formsData[currentScreen]?.stopTimestamp ?? null;
    updateFormField(currentScreen, 'startTimeText', normalized);
    updateFormField(currentScreen, 'startTimestamp', startTs);
    updateFormField(currentScreen, 'isStarted', startTs !== null && stopTs === null);
  };

  const handleChangeStopTime = (text: string) => {
    if (isNonWorksheetScreen(currentScreen)) return;
    const normalized = normalizeTimeInput(text);
    const stopTs = isValidTime(normalized) ? timeStringToTimestamp(normalized) : null;
    const startTs = formsData[currentScreen]?.startTimestamp ?? null;
    updateFormField(currentScreen, 'stopTimeText', normalized);
    updateFormField(currentScreen, 'stopTimestamp', stopTs);
    updateFormField(currentScreen, 'isStarted', startTs !== null && stopTs === null);
  };

  const handleSimpan = async () => {
    if (isNonWorksheetScreen(currentScreen)) return;
    const activeData = formsData[currentScreen];

    if (!hasValue(activeData.namaOperator)) {
      Alert.alert('Gagal', 'Nama operator tidak boleh kosong.');
      return;
    }
    if (!hasValue(activeData.nomorSO)) {
      Alert.alert('Gagal', 'Nomor SO wajib diisi.');
      return;
    }
    if (!activeData.startTimestamp) {
      Alert.alert('Gagal', 'Tombol START belum ditekan!');
      return;
    }
    if (activeData.isStarted || !activeData.stopTimestamp) {
      Alert.alert(
        'Gagal',
        'Tombol STOP belum ditekan! Silakan tekan STOP terlebih dahulu.'
      );
      return;
    }

    const strStart = formatHHMM(activeData.startTimestamp);
    const strEnd = formatHHMM(activeData.stopTimestamp);

    try {
      setIsLoading(true);
      const isSuccess = await submitProductionData(
        currentScreen,
        activeData,
        strStart,
        strEnd
      );

      if (isSuccess) {
        await handleClear();
      }
    } catch (error) {
      Alert.alert('Kendala Jaringan', `${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const savedUserName = await AsyncStorage.getItem('userName');
    if (token) setUserToken(token);
    if (savedUserName) setUserName(savedUserName);
    setIsLoggedIn(true);
  };

  const resetAuthState = useCallback(() => {
    setUserToken('');
    setUserName('');
    setIsLoggedIn(false);
    setCurrentScreen('HOME');
  }, []);

  const handleLogoutSuccess = useCallback(async () => {
    try {
      // logout() wipe storage + emit FORCE_LOGOUT -> resetAuthState via listener.
      await authService.logout();
    } catch (e) {
      console.error('Error saat logout:', e);
    }
  }, []);

  useEffect(() => {
    const logoutSub = DeviceEventEmitter.addListener('FORCE_LOGOUT', () => {
      resetAuthState();
    });
    const refreshSub = DeviceEventEmitter.addListener('TOKEN_REFRESHED', (newToken: string) => {
      setUserToken(newToken);
    });
    return () => {
      logoutSub.remove();
      refreshSub.remove();
    };
  }, [resetAuthState]);

  if (!isRestored || isLoggedIn === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!isLoggedIn) {
    if (showAbout) {
      return (
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <AboutScreen onBack={() => setShowAbout(false)} />
          </SafeAreaView>
        </SafeAreaProvider>
      );
    }
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onOpenAbout={() => setShowAbout(true)}
      />
    );
  }

  const helperOptions = {
    formsData,
    updateFormField,
    handleToggleStartStop,
    handleChangeStartTime,
    handleChangeStopTime,
    formatHHMM,
    parseIntegerInput,
    handleNavigate,
    handleSimpan,
    handleClear,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return (
          <HomeScreen
            userName={userName}
            onNavigate={handleNavigate}
            onLogout={handleLogoutSuccess}
            onOpenAbout={() => handleNavigate('ABOUT')}
            activeScreen={activeScreen}
          />
        );

      case 'PROFIL':
        return (
          <ProfileScreen
            userName={userName}
            onBack={() => setCurrentScreen('HOME')}
            onLogout={handleLogoutSuccess}
            onOpenAbout={() => handleNavigate('ABOUT')}
            onUpdateUserName={setUserName}
          />
        );

      case 'ABOUT':
        return <AboutScreen onBack={() => setCurrentScreen('HOME')} />;

      case 'RING_1':
        return <Ring1Screen {...getRingProps('RING_1', helperOptions, lhpCatalogs.RING_1)} />;

      case 'RING_2':
        return <Ring2Screen {...getRingProps('RING_2', helperOptions, lhpCatalogs.RING_2)} />;

      case 'RING_3':
        return <Ring3Screen {...getRingProps('RING_3', helperOptions, lhpCatalogs.RING_3)} />;

      case 'SEALING_ELEMENT':
        return <SealingElementScreen {...getSealingProps(helperOptions, lhpCatalogs.SE)} />;

      case 'DOUBLE_JACKETED':
        return <DoubleJacketScreen {...getDoubleJacketProps(helperOptions)} />;

      case 'GNM':
        return <GnmScreen {...getGnmProps(helperOptions)} />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {renderScreen()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
