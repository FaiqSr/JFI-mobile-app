import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  BackHandler,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HomeScreen } from './src/screen/HomeScreen';
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
} from './src/api/FormService';

const DRAFT_KEY = '@app_form_draft_v3';

export default function App() {
  const [fontsLoaded] = useFonts({
    IrishGrover: require('./assets/IrishGrover-Regular.ttf'),
    Hanuman: require('./assets/Hanuman-Regular.ttf'),
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [formsData, setFormsData] = useState<Record<string, ScreenFormData>>({
    RING_1: { ...initialFormState },
    RING_2: { ...initialFormState },
    RING_3: { ...initialFormState },
    SEALING_ELEMENT: { ...initialFormState },
    DOUBLE_JACKETED: { ...initialFormState },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

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
        if (jsonDraft !== null) {
          const draft = JSON.parse(jsonDraft);
          if (draft.currentScreen) setCurrentScreen(draft.currentScreen);
          if (draft.formsData) setFormsData(draft.formsData);
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
        const draftData = { currentScreen, formsData };
        await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      } catch (e) {
        console.error('Gagal menyimpan draf:', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isRestored, currentScreen, formsData]);

  const handleClear = useCallback(() => {
    if (currentScreen === 'HOME') return;

    setFormsData((prev) => ({
      ...prev,
      [currentScreen]: { ...initialFormState },
    }));
  }, [currentScreen]);

  const handleNavigate = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen);
  }, []);

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
    if (currentScreen === 'HOME') return;
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
    if (currentScreen === 'HOME') return;
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
        handleClear();
      }
    } catch (error) {
      Alert.alert('Kendala Jaringan', `${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded || !isRestored) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const helperOptions = {
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
        return <HomeScreen onNavigate={handleNavigate} />;

      case 'RING_1':
        return <Ring1Screen {...getRingProps('RING_1', helperOptions)} />;

      case 'RING_2':
        return <Ring2Screen {...getRingProps('RING_2', helperOptions)} />;

      case 'RING_3':
        return <Ring3Screen {...getRingProps('RING_3', helperOptions)} />;

      case 'SEALING_ELEMENT':
        return <SealingElementScreen {...getSealingProps(helperOptions)} />;

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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});