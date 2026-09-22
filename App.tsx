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
import { Ring1Screen } from './src/screen/Ring1Screen';
import { Ring2Screen } from './src/screen/Ring2Screen';
import { Ring3Screen } from './src/screen/Ring3Screen';
import { SealingElementScreen } from './src/screen/SealingElementScreen';
import { DoubleJacketScreen } from './src/screen/DoubleJacketScreen';

import { ScreenType, ScreenFormData, initialFormState } from './src/type/FormType';
import {
  submitProductionData,
  getRingProps,
  getSealingProps,
  getDoubleJacketProps,
  getLhpMasterCatalog,
  type LhpMasterCatalog,
} from './src/api/FormService';
import { authService } from './src/api/authService';

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
export type ExtendedScreenType = ScreenType | 'PROFIL';

const hasValue = (val: string | number | undefined | null): boolean => {
  if (val === null || val === undefined) return false;
  const str = String(val).trim();
  return str.length > 0;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ExtendedScreenType>('HOME');
  const [userToken, setUserToken] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const [lastActiveScreen, setLastActiveScreen] = useState<ScreenType | null>(null);

  const [formsData, setFormsData] = useState<Record<string, ScreenFormData>>({
    RING_1: { ...initialFormState },
    RING_2: { ...initialFormState },
    RING_3: { ...initialFormState },
    SEALING_ELEMENT: { ...initialFormState },
    DOUBLE_JACKETED: { ...initialFormState },
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
      return hasValue(form.nomorSO);
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
              (form: any) => hasValue(form.nomorSO)
            );

            if (hasAnyData) {
              setFormsData(draft.formsData);
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
    if (currentScreen !== 'HOME' && currentScreen !== 'PROFIL') {
      const activeData = formsData[currentScreen];

      const preservedOperator = activeData?.namaOperator || userName;
      const preservedSO = activeData?.nomorSO || '';
      const preservedClass = activeData?.classVal || '';
      const preservedSize = activeData?.size || '';
      const preservedMaterial = activeData?.materialNoted || '';

      setFormsData((prev) => ({
        ...prev,
        [currentScreen]: {
          ...initialFormState,
          namaOperator: String(preservedOperator),
          nomorSO: String(preservedSO),
          classVal: String(preservedClass),
          size: String(preservedSize),
          materialNoted: String(preservedMaterial),
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
    if (screen !== 'HOME' && screen !== 'PROFIL') {
      saveLastActiveScreen(screen as ScreenType);
    }
    setCurrentScreen(screen);
  }, [saveLastActiveScreen]);

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

  const formatHHMM = (time: number | null): string => {
    if (!time) return '';
    const date = new Date(time);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Timer lokal saja — entry tidak lagi terikat sesi kerja CS di server.
  const handleToggleStartStop = async () => {
    if (currentScreen === 'HOME' || currentScreen === 'PROFIL') return;
    const currentData = formsData[currentScreen];

    if (!currentData.isStarted) {
      updateFormField(currentScreen, 'startTimestamp', Date.now());
      updateFormField(currentScreen, 'stopTimestamp', null);
      updateFormField(currentScreen, 'isStarted', true);
    } else {
      updateFormField(currentScreen, 'stopTimestamp', Date.now());
      updateFormField(currentScreen, 'isStarted', false);
    }
  };

  const handleSimpan = async () => {
    if (currentScreen === 'HOME' || currentScreen === 'PROFIL') return;
    const activeData = formsData[currentScreen];

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
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const helperOptions = {
    userToken,
    formsData,
    updateFormField,
    handleToggleStartStop,
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
            activeScreen={activeScreen}
          />
        );

      case 'PROFIL':
        return (
          <ProfileScreen
            userName={userName}
            onBack={() => setCurrentScreen('HOME')}
            onLogout={handleLogoutSuccess}
          />
        );

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
