import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { csService } from './src/api/csService';
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

const DRAFT_KEY = '@app_form_draft_v4';
const LAST_SCREEN_KEY = '@app_last_active_screen';

export type ExtendedScreenType = ScreenType | 'PEKERJAAN_CS' | 'PROFIL';

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
      return hasValue(form.taskId) || hasValue(form.nomorSO);
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
              (form: any) => hasValue(form.taskId) || hasValue(form.nomorSO)
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

  // Validasi draf terhadap server: pastikan task "Lanjutkan Pekerjaan Aktif"
  // masih ada di board GET /tasks/open. Task yang sudah ditutup foreman tidak
  // muncul lagi di sana, jadi drafnya dibersihkan supaya tombol kembali KOSONG.
  // Hanya jalan sekali setelah restore+login; gagal jaringan = fail-open
  // (draf TIDAK dihapus, operator tidak kehilangan isian produksi).
  const draftValidatedRef = useRef(false);
  useEffect(() => {
    if (draftValidatedRef.current) return;
    if (!isRestored || !isLoggedIn || !userToken) return;

    const screen = activeScreen;
    if (!screen) return; // activeScreen selalu screen form atau null

    const form = formsData[screen as ScreenType];
    const draftTaskId = form?.taskId ? String(form.taskId).trim() : '';
    const draftSo =
      form?.nomorSO && String(form.nomorSO).trim() !== '-'
        ? String(form.nomorSO).trim()
        : '';
    if (!draftTaskId && !draftSo) return; // tidak ada kunci untuk diverifikasi

    draftValidatedRef.current = true;
    let cancelled = false;

    (async () => {
      const res = await csService.getOpenTasks(userToken);
      if (cancelled || !res?.success) return;

      const list: any[] = Array.isArray(res.data) ? res.data : [];
      const stillOpen = list.some((t: any) => {
        if (draftTaskId && String(t?.id ?? '') === draftTaskId) return true;
        if (draftSo && String(t?.so_no ?? '').trim() === draftSo) return true;
        return false;
      });

      if (!stillOpen) {
        setFormsData((prev) => ({
          ...prev,
          [screen]: { ...initialFormState, namaOperator: prev[screen]?.namaOperator || userName },
        }));
        saveLastActiveScreen(null);
        Alert.alert(
          'Pekerjaan Telah Ditutup',
          'Task aktif sudah ditutup di server, jadi draf pekerjaan dibersihkan. Silakan pilih task baru dari Pekerjaan CS.'
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // Sengaja tidak bergantung pada formsData/activeScreen: validasi ini
    // hanyalah pemeriksaan cold-start terhadap draf yang baru dimuat.
  }, [isRestored, isLoggedIn, userToken]);

  // FIX: Mengunci nomorSO dan header data agar tidak hilang saat clear/simpan
  const handleClear = useCallback(async () => {
    if (
      currentScreen !== 'HOME' &&
      currentScreen !== 'PEKERJAAN_CS' &&
      currentScreen !== 'PROFIL'
    ) {
      const activeData = formsData[currentScreen];

      // Ambil nilai fallback dari selectedCsTask jika di state form bernilai kosong
      const fallbackSo = selectedCsTask ? getItemSoNo(selectedCsTask) : '';
      const fallbackTaskObj = selectedCsTask
        ? ((selectedCsTask as any)?.item || (selectedCsTask as any)?.task || selectedCsTask)
        : null;

      const preservedTaskId =
        activeData?.taskId ||
        (fallbackTaskObj?.taskId || fallbackTaskObj?.task_id || fallbackTaskObj?.id || '');

      const preservedOperator = activeData?.namaOperator || userName;

      const preservedSO =
        activeData?.nomorSO ||
        (activeData as any)?.noSO ||
        (fallbackSo !== '-' ? fallbackSo : '') ||
        '';

      const preservedClass =
        activeData?.classVal ||
        (fallbackTaskObj?.class ? String(fallbackTaskObj.class) : '');

      const preservedSize =
        activeData?.size ||
        (fallbackTaskObj?.size ? String(fallbackTaskObj.size) : '');

      const preservedMaterial = activeData?.materialNoted || '';

      setFormsData((prev) => ({
        ...prev,
        [currentScreen]: {
          ...initialFormState,
          taskId: String(preservedTaskId),
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
      setSelectedCsTask(null);
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
  }, [currentScreen, formsData, userName, selectedCsTask, saveLastActiveScreen]);

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

  const handleToggleStartStop = async () => {
    if (currentScreen === 'HOME' || currentScreen === 'PEKERJAAN_CS' || currentScreen === 'PROFIL') return;
    const currentData = formsData[currentScreen];

    if (!currentData.isStarted) {
      // Mulai sesi kerja di server CS sebelum menyalakan timer lokal.
      // Server idempoten untuk sesi ACTIVE yang sudah ada.
      const taskId = currentData.taskId;
      if (!hasValue(taskId)) {
        Alert.alert('Gagal', 'Task CS tidak valid. Buka form dari daftar pekerjaan CS.');
        return;
      }

      try {
        setIsLoading(true);
        const res = await csService.startTask(taskId as string | number);
        if (!res?.success) {
          Alert.alert('Gagal Memulai', res?.message || 'Tidak dapat memulai sesi kerja.');
          return;
        }
        updateFormField(currentScreen, 'startTimestamp', Date.now());
        updateFormField(currentScreen, 'stopTimestamp', null);
        updateFormField(currentScreen, 'isStarted', true);
      } finally {
        setIsLoading(false);
      }
    } else {
      // STOP hanya menghentikan timer lokal; sesi server ditutup foreman saat task di-close.
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
        // Laporkan progress sesi ke server CS sebelum form dibersihkan.
        const productId = (activeData.productName || activeData.product || '').trim();
        const jobDesc = (activeData.jobDescription || '').trim();
        const progressRes = await csService.progressTask(
          activeData.taskId as string | number,
          {
            qty: Number(activeData.finishGood) || 0,
            product_name: productId || null,
            job_description: jobDesc || null,
          }
        );
        if (!progressRes?.success) {
          // Form TIDAK dibersihkan — draft tetap tersimpan, operator bisa retry Simpan.
          Alert.alert(
            'Progress Gagal Terkirim',
            progressRes?.message || 'Data produksi tersimpan, tapi progress ke task CS gagal. Silakan tekan Simpan lagi.'
          );
          return;
        }
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