import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  BackHandler,
  Alert,
  ActivityIndicator,
  View,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LoginScreen } from './src/screen/LoginScreen';
import { HomeScreen } from './src/screen/HomeScreen';
import { CsScreen } from './src/screen/CsScreen';
import { ProfileScreen } from './src/screen/ProfileScreen';
import { Ring1Screen } from './src/screen/Ring1Screen';
import { Ring2Screen } from './src/screen/Ring2Screen';
import { Ring3Screen } from './src/screen/Ring3Screen';
import { SealingElementScreen } from './src/screen/SealingElementScreen';
import { DoubleJacketScreen } from './src/screen/DoubleJacketScreen';

import { ScreenType, ScreenFormData, initialFormState } from './src/type/FormType';
import { OpenTaskItem, WorkQueueTask } from './src/type/csType';
import {
  submitProductionData,
  getRingProps,
  getSealingProps,
  getDoubleJacketProps,
} from './src/api/FormService';
import { authService } from './src/api/authService';
import { getItemModule, getItemSoNo } from './src/utils/csHelpers';

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

const DRAFT_KEY = '@app_form_draft_v3';
const LAST_SCREEN_KEY = '@app_last_active_screen';

export type ExtendedScreenType = ScreenType | 'PEKERJAAN_CS' | 'PROFIL';

const hasValue = (val: string | number | undefined | null): boolean => {
  if (val === null || val === undefined) return false;
  const str = String(val).trim();
  return str.length > 0;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    IrishGrover: require('./assets/IrishGrover-Regular.ttf'),
    Hanuman: require('./assets/Hanuman-Regular.ttf'),
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ExtendedScreenType>('HOME');
  const [userToken, setUserToken] = useState<string>(''); 
  const [userName, setUserName] = useState<string>('');
  const [selectedCsTask, setSelectedCsTask] = useState<OpenTaskItem | WorkQueueTask | null>(null);
  
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

  // Simpan/hapus lastActiveScreen ke AsyncStorage
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

  // LOGIKA ACTIVESCREEN UTAMA
  const activeScreen = useMemo(() => {
    // 1. Cek jika ada timer berjalan
    const runningTimerKey = Object.keys(formsData).find((key) => {
      const form = formsData[key];
      return form && (form.isStarted || form.startTimestamp !== null);
    });
    if (runningTimerKey) return runningTimerKey as ScreenType;

    // 2. Cek jika ada data form terisi (mempunyai taskId atau nomorSO)
    const activeTaskKey = Object.keys(formsData).find((key) => {
      const form = formsData[key];
      if (!form) return false;
      return hasValue(form.taskId) || hasValue(form.nomorSO);
    });
    if (activeTaskKey) return activeTaskKey as ScreenType;

    // 3. Fallback ke lastActiveScreen jika ada
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

  // 1. MEMUAT DRAF SAAT APLIKASI PERTAMA DI BUKA
  useEffect(() => {
    const loadSavedDraft = async () => {
      try {
        const jsonDraft = await AsyncStorage.getItem(DRAFT_KEY);
        const savedLastScreen = await AsyncStorage.getItem(LAST_SCREEN_KEY);
        
        if (jsonDraft !== null) {
          const draft = JSON.parse(jsonDraft);
          if (draft.formsData) {
            // Pastikan beneran ada isi data di salah satu form
            const hasAnyData = Object.values(draft.formsData).some(
              (form: any) => hasValue(form.taskId) || hasValue(form.nomorSO)
            );

            if (hasAnyData) {
              setFormsData(draft.formsData);
              if (savedLastScreen) {
                setLastActiveScreen(savedLastScreen as ScreenType);
              }
            } else {
              // Jika isinya kosong semua, hapus draf bekas
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

  // 2. AUTO-SAVE DRAF KE ASYNCSTORAGE (HANYA JIKA ADA FORM AKTIF)
  useEffect(() => {
    if (!isRestored) return;

    const timer = setTimeout(async () => {
      try {
        // Jika activeScreen null (kosong), bersihkan AsyncStorage agar tidak overwrite
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

  // 3. FUNGSI CLEAR FORM DAN RESET TOTAL DRAF & MODUL AKTIF
  const handleClear = useCallback(async () => {
    // Reset state lastActiveScreen ke null
    setLastActiveScreen(null);

    // Reset SEMUA modul ke initialFormState
    const emptyForms: Record<string, ScreenFormData> = {
      RING_1: { ...initialFormState, namaOperator: userName },
      RING_2: { ...initialFormState, namaOperator: userName },
      RING_3: { ...initialFormState, namaOperator: userName },
      SEALING_ELEMENT: { ...initialFormState, namaOperator: userName },
      DOUBLE_JACKETED: { ...initialFormState, namaOperator: userName },
    };
    setFormsData(emptyForms);

    // Hapus total penyimpanan di AsyncStorage
    try {
      await AsyncStorage.removeItem(LAST_SCREEN_KEY);
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      console.error('Gagal membersihkan draf dari penyimpanan:', e);
    }
  }, [userName]);

  const handleNavigate = useCallback((screen: ExtendedScreenType) => {
    if (
      screen !== 'HOME' &&
      screen !== 'PEKERJAAN_CS' &&
      screen !== 'PROFIL'
    ) {
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

  const handleToggleStartStop = () => {
    if (currentScreen === 'HOME' || currentScreen === 'PEKERJAAN_CS' || currentScreen === 'PROFIL') return;
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
    if (currentScreen === 'HOME' || currentScreen === 'PEKERJAAN_CS' || currentScreen === 'PROFIL') return;
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

  const handleSelectCsTask = (task: any) => {
    setSelectedCsTask(task);

    const taskObj = task?.item || task?.task || task;
    const helperMod = getItemModule(task);
    const directMod = getItemModule(taskObj);
    const combinedStr = `${helperMod} ${directMod} ${JSON.stringify(taskObj)}`.toUpperCase();

    let targetScreen: ScreenType | null = null;
    
    if (combinedStr.includes('DJG') || combinedStr.includes('DOUBLE')) {
      targetScreen = 'DOUBLE_JACKETED';
    } else if (combinedStr.includes('SEALING') || combinedStr.includes('SE_')) {
      targetScreen = 'SEALING_ELEMENT';
    } else if (
      combinedStr.includes('RING 2') || 
      combinedStr.includes('RING_2') || 
      combinedStr.includes('RING2')
    ) {
      targetScreen = 'RING_2';
    } else if (
      combinedStr.includes('RING 3') || 
      combinedStr.includes('RING_3') || 
      combinedStr.includes('RING3')
    ) {
      targetScreen = 'RING_3';
    } else if (
      combinedStr.includes('RING 1') || 
      combinedStr.includes('RING_1') || 
      combinedStr.includes('RING1')
    ) {
      targetScreen = 'RING_1';
    } else if (helperMod.includes('RING') || directMod.includes('RING')) {
      targetScreen = 'RING_1';
    }

    if (targetScreen) {
      const taskIdVal = String(
        taskObj.taskId || taskObj.task_id || taskObj.id_task || taskObj.id || task.id || ''
      );

      const operatorName = 
        userName || taskObj.operator_name || taskObj.operator || taskObj.nama_operator || taskObj.pic || '-';

      const detectedSo = getItemSoNo(taskObj);
      const soNum = detectedSo !== '-' ? detectedSo : (taskObj.so_no || taskObj.so_number || taskObj.nomor_so || '-');
      
      const classVal = 
        taskObj.class !== undefined && taskObj.class !== null ? String(taskObj.class) :
        taskObj.class_val !== undefined && taskObj.class_val !== null ? String(taskObj.class_val) :
        taskObj.rating !== undefined && taskObj.rating !== null ? String(taskObj.rating) :
        taskObj.class_rating !== undefined && taskObj.class_rating !== null ? String(taskObj.class_rating) : '';

      const sizeVal = 
        taskObj.size !== undefined && taskObj.size !== null ? String(taskObj.size) :
        taskObj.ukuran !== undefined && taskObj.ukuran !== null ? String(taskObj.ukuran) :
        taskObj.dimension !== undefined && taskObj.dimension !== null ? String(taskObj.dimension) : '';

      const certNo = taskObj.cert_no_material || taskObj.cert_no || taskObj.material_cert_no || '-';

      const updatedForms = {
        ...formsData,
        [targetScreen]: {
          ...initialFormState,
          taskId: taskIdVal,
          namaOperator: String(operatorName),
          nomorSO: String(soNum),
          classVal: classVal,
          size: sizeVal,
          materialNoted: `Cert No. Material: ${certNo}`,
        },
      };

      setFormsData(updatedForms);
      saveLastActiveScreen(targetScreen);

      setCurrentScreen(targetScreen);
    } else {
      Alert.alert('Peringatan', `Modul "${helperMod}" tidak terdeteksi.`);
    }
  };

  const handleLoginSuccess = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const savedUserName = await AsyncStorage.getItem('userName');
    if (token) setUserToken(token);
    if (savedUserName) setUserName(savedUserName);
    setIsLoggedIn(true);
  };

  const handleLogoutSuccess = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Error saat logout:', e);
    } finally {
      setUserToken('');
      setUserName('');
      setIsLoggedIn(false);
      setCurrentScreen('HOME');
    }
  };

  if (!fontsLoaded || !isRestored || isLoggedIn === null) {
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

      case 'PEKERJAAN_CS':
        return (
          <CsScreen
            onBack={() => setCurrentScreen('HOME')}
            onSelectTask={handleSelectCsTask}
            onLogout={handleLogoutSuccess}
            userToken={userToken}
            userName={userName}
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
        return (
          <Ring1Screen
            {...getRingProps('RING_1', helperOptions)}
            taskId={formsData.RING_1.taskId}
            userToken={userToken}
          />
        );

      case 'RING_2':
        return (
          <Ring2Screen
            {...getRingProps('RING_2', helperOptions)}
            taskId={formsData.RING_2.taskId}
            userToken={userToken}
          />
        );

      case 'RING_3':
        return (
          <Ring3Screen
            {...getRingProps('RING_3', helperOptions)}
            taskId={formsData.RING_3.taskId}
            userToken={userToken}
          />
        );

      case 'SEALING_ELEMENT':
        return (
          <SealingElementScreen
            {...getSealingProps(helperOptions)}
            taskId={formsData.SEALING_ELEMENT.taskId}
            userToken={userToken}
          />
        );

      case 'DOUBLE_JACKETED':
        return (
          <DoubleJacketScreen
            {...getDoubleJacketProps(helperOptions)}
            taskId={formsData.DOUBLE_JACKETED.taskId}
            userToken={userToken}
          />
        );

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