import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  BackHandler,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { useFonts } from 'expo-font';
import { HomeScreen } from './component/HomeScreen';
import { Ring1Screen } from './component/Ring1Screen';
import { Ring2Screen } from './component/Ring2Screen';
import { Ring3Screen } from './component/Ring3Screen';
import { SealingElementScreen } from './component/SealingElementScreen';
import { DoubleJacketScreen } from './component/DoubleJacketScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    IrishGrover: require('./assets/IrishGrover-Regular.ttf'),
    Hanuman: require('./assets/Hanuman-Regular.ttf'),
  });

  const [currentScreen, setCurrentScreen] = useState<
    'HOME' | 'RING_1' | 'RING_2' | 'RING_3' | 'SEALING_ELEMENT' | 'DOUBLE_JACKETED'
  >('HOME');

  const [namaOperator, setNamaOperator] = useState('');
  const [nomorSO, setNomorSO] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobNoted, setJobNoted] = useState('');
  const [product, setProduct] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [size, setSize] = useState('');
  const [classVal, setClassVal] = useState('');
  const [workType, setWorkType] = useState('');

  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [stopTimestamp, setStopTimestamp] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const [gantiOrder, setGantiOrder] = useState<number>(0);
  const [repair, setRepair] = useState<number>(0);
  const [materialTunggu, setMaterialTunggu] = useState<number>(0);
  const [operatorTime, setOperatorTime] = useState<number>(0);
  const [maintenance, setMaintenance] = useState<number>(0);
  const [checking, setChecking] = useState<number>(0);
  const [finishGood, setFinishGood] = useState<number>(0);
  const [hoop, setHoop] = useState('');
  const [filler, setFiller] = useState('');
  const [ir, setIr] = useState('');
  const [orVal, setOrVal] = useState('');

  const [productName, setProductName] = useState('');
  const [idVal, setIdVal] = useState('');
  const [odVal, setOdVal] = useState('');
  const [thickness, setThickness] = useState('');
  const [metal, setMetal] = useState('');
  const [rework, setRework] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (currentScreen !== 'HOME') {
        setCurrentScreen('HOME');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
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
    if (!isStarted) {
      setStartTimestamp(Date.now());
      setStopTimestamp(null);
      setIsStarted(true);
    } else {
      setStopTimestamp(Date.now());
      setIsStarted(false);
    }
  };

  const handleClear = () => {
    setNamaOperator('');
    setNomorSO('');
    setJobDescription('');
    setJobNoted('');
    setProduct('');
    setMaterialType('');
    setSize('');
    setClassVal('');
    setWorkType('');
    setStartTimestamp(null);
    setStopTimestamp(null);
    setIsStarted(false);
    setGantiOrder(0);
    setRepair(0);
    setMaterialTunggu(0);
    setOperatorTime(0);
    setMaintenance(0);
    setChecking(0);
    setFinishGood(0);
    setHoop('');
    setFiller('');
    setIr('');
    setOrVal('');
    setProductName('');
    setIdVal('');
    setOdVal('');
    setThickness('');
    setMetal('');
    setRework(0);
  };

  const handleSimpan = async () => {
    const BASE_URL = 'http://192.168.30.188/produksi';

    let endpoint = '';
    let payload: any = {};

    const strStart = startTimestamp ? formatHHMM(startTimestamp) : '';
    const strEnd = stopTimestamp ? formatHHMM(stopTimestamp) : '';

    switch (currentScreen) {
      case 'RING_1':
        endpoint = '/api/ring-satu';
        payload = {
          namaOperator,
          jobDescription,
          notedJobdesc: jobNoted || '',
          soNo: nomorSO,
          materialType,
          productName: product || productName,
          size,
          class: classVal,
          timeStart: strStart,
          timeEnd: strEnd,
          gantiOrderA: gantiOrder,
          repairB: repair,
          materialTungguC: materialTunggu,
          operatorD: operatorTime,
          maintenanceE: maintenance,
          checkingF: checking,
          finishGoodFG: finishGood,
        };
        break;

      case 'RING_2':
        endpoint = '/api/ring-dua';
        payload = {
          namaOperator,
          jobDescription,
          notedJobdesc: jobNoted || '',
          soNo: nomorSO,
          workType,
          materialType,
          productName: product || productName,
          size,
          class: classVal,
          timeStart: strStart,
          timeEnd: strEnd,
          gantiOrderA: gantiOrder,
          repairB: repair,
          materialTungguC: materialTunggu,
          operatorD: operatorTime,
          maintenanceE: maintenance,
          checkingF: checking,
          finishGoodFG: finishGood,
        };
        break;

      case 'RING_3':
        endpoint = '/api/ring-tiga';
        payload = {
          namaOperator,
          jobDescription,
          notedJobdesc: jobNoted || '',
          productName: product || productName,
          materialType,
          size,
          class: classVal,
          thickness: thickness || '',
          notedSizeOrClass: '',
          timeStart: strStart,
          timeEnd: strEnd,
          gantiOrderA: gantiOrder,
          repairB: repair,
          materialTungguC: materialTunggu,
          operatorD: operatorTime,
          maintenanceE: maintenance,
          checkingF: checking,
          finishGoodFG: finishGood,
        };
        break;

      case 'DOUBLE_JACKETED':
        endpoint = '/api/djg';
        payload = {
          namaOperator,
          productName: product || productName,
          soNo: nomorSO,
          jobDescription,
          typeProduct: workType || '',
          innerDiameter: idVal,
          outerDiameter: odVal,
          thickness: thickness || '',
          timeStart: strStart,
          timeEnd: strEnd,
          fg: finishGood,
          metal: parseIntegerInput(metal),
          filler: parseIntegerInput(filler),
        };
        break;

      case 'SEALING_ELEMENT':
        endpoint = '/api/se';
        payload = {
          namaOperator,
          soNo: nomorSO,
          jobDescription,
          size,
          class: classVal,
          hoop,
          filler,
          innerRing: ir,
          outerRing: orVal,
          timeStart: strStart,
          timeEnd: strEnd,
          gantiOrderA: gantiOrder,
          repairB: repair,
          materialTungguC: materialTunggu,
          operatorD: operatorTime,
          maintenanceE: maintenance,
          checkingF: checking,
          finishGoodFG: finishGood,
        };
        break;

      default:
        Alert.alert('Error', 'Layar tidak dikenali.');
        return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let result: any = {};

      try {
        result = JSON.parse(rawText);
      } catch (e) {
        Alert.alert('Server Error', `Server mengembalikan format non-JSON (Status ${response.status})`);
        setIsLoading(false);
        return;
      }

      if (response.status === 201 || response.ok) {
        Alert.alert('Sukses', result.message || 'Data produksi berhasil disimpan.');
        handleClear();
      } else if (response.status === 400) {
        const errorDetails = result.errors
          ? result.errors.map((e: any) => `- ${e.field}: ${e.message}`).join('\n')
          : result.message;
        Alert.alert('Validasi Gagal (400)', errorDetails || 'Mohon periksa kembali inputan Anda.');
      } else {
        Alert.alert('Error', result.message || `Terjadi kesalahan server (${response.status})`);
      }
    } catch (error) {
      Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server backend.');
      console.error('Error POST API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'HOME' && (
        <HomeScreen onNavigate={(screen: any) => setCurrentScreen(screen)} />
      )}

      {currentScreen === 'RING_1' && (
        <Ring1Screen
          namaOperator={namaOperator}
          setNamaOperator={setNamaOperator}
          nomorSO={nomorSO}
          setNomorSO={setNomorSO}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          jobNoted={jobNoted}
          setJobNoted={setJobNoted}
          product={product}
          setProduct={setProduct}
          materialType={materialType}
          setMaterialType={setMaterialType}
          size={size}
          setSize={setSize}
          classVal={classVal}
          setClassVal={setClassVal}
          startTimestamp={startTimestamp}
          stopTimestamp={stopTimestamp}
          isStarted={isStarted}
          handleToggleStartStop={handleToggleStartStop}
          formatHHMM={formatHHMM}
          gantiOrder={gantiOrder}
          setGantiOrder={setGantiOrder}
          repair={repair}
          setRepair={setRepair}
          materialTunggu={materialTunggu}
          setMaterialTunggu={setMaterialTunggu}
          operatorTime={operatorTime}
          setOperatorTime={setOperatorTime}
          maintenance={maintenance}
          setMaintenance={setMaintenance}
          checking={checking}
          setChecking={setChecking}
          finishGood={finishGood}
          setFinishGood={setFinishGood}
          parseIntegerInput={parseIntegerInput}
          onBack={() => setCurrentScreen('HOME')}
          onSave={handleSimpan}
          onClear={handleClear}
        />
      )}

      {currentScreen === 'RING_2' && (
        <Ring2Screen
          namaOperator={namaOperator}
          setNamaOperator={setNamaOperator}
          nomorSO={nomorSO}
          setNomorSO={setNomorSO}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          jobNoted={jobNoted}
          setJobNoted={setJobNoted}
          product={product}
          setProduct={setProduct}
          materialType={materialType}
          setMaterialType={setMaterialType}
          size={size}
          setSize={setSize}
          classVal={classVal}
          setClassVal={setClassVal}
          workType={workType}
          setWorkType={setWorkType}
          startTimestamp={startTimestamp}
          stopTimestamp={stopTimestamp}
          isStarted={isStarted}
          handleToggleStartStop={handleToggleStartStop}
          formatHHMM={formatHHMM}
          gantiOrder={gantiOrder}
          setGantiOrder={setGantiOrder}
          repair={repair}
          setRepair={setRepair}
          materialTunggu={materialTunggu}
          setMaterialTunggu={setMaterialTunggu}
          operatorTime={operatorTime}
          setOperatorTime={setOperatorTime}
          maintenance={maintenance}
          setMaintenance={setMaintenance}
          checking={checking}
          setChecking={setChecking}
          finishGood={finishGood}
          setFinishGood={setFinishGood}
          parseIntegerInput={parseIntegerInput}
          onBack={() => setCurrentScreen('HOME')}
          onSave={handleSimpan}
          onClear={handleClear}
        />
      )}

      {currentScreen === 'RING_3' && (
        <Ring3Screen
          namaOperator={namaOperator}
          setNamaOperator={setNamaOperator}
          nomorSO={nomorSO}
          setNomorSO={setNomorSO}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          jobNoted={jobNoted}
          setJobNoted={setJobNoted}
          product={product}
          setProduct={setProduct}
          materialType={materialType}
          setMaterialType={setMaterialType}
          size={size}
          setSize={setSize}
          classVal={classVal}
          setClassVal={setClassVal}
          startTimestamp={startTimestamp}
          stopTimestamp={stopTimestamp}
          isStarted={isStarted}
          handleToggleStartStop={handleToggleStartStop}
          formatHHMM={formatHHMM}
          gantiOrder={gantiOrder}
          setGantiOrder={setGantiOrder}
          repair={repair}
          setRepair={setRepair}
          materialTunggu={materialTunggu}
          setMaterialTunggu={setMaterialTunggu}
          operatorTime={operatorTime}
          setOperatorTime={setOperatorTime}
          maintenance={maintenance}
          setMaintenance={setMaintenance}
          checking={checking}
          setChecking={setChecking}
          finishGood={finishGood}
          setFinishGood={setFinishGood}
          parseIntegerInput={parseIntegerInput}
          onBack={() => setCurrentScreen('HOME')}
          onSave={handleSimpan}
          onClear={handleClear}
        />
      )}

      {currentScreen === 'SEALING_ELEMENT' && (
        <SealingElementScreen
          namaOperator={namaOperator}
          setNamaOperator={setNamaOperator}
          nomorSO={nomorSO}
          setNomorSO={setNomorSO}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          jobNoted={jobNoted}
          setJobNoted={setJobNoted}
          product={product}
          setProduct={setProduct}
          materialType={materialType}
          setMaterialType={setMaterialType}
          size={size}
          setSize={setSize}
          classVal={classVal}
          setClassVal={setClassVal}
          hoop={hoop}
          setHoop={setHoop}
          filler={filler}
          setFiller={setFiller}
          ir={ir}
          setIr={setIr}
          orVal={orVal}
          setOrVal={setOrVal}
          startTimestamp={startTimestamp}
          stopTimestamp={stopTimestamp}
          isStarted={isStarted}
          handleToggleStartStop={handleToggleStartStop}
          formatHHMM={formatHHMM}
          gantiOrder={gantiOrder}
          setGantiOrder={setGantiOrder}
          repair={repair}
          setRepair={setRepair}
          materialTunggu={materialTunggu}
          setMaterialTunggu={setMaterialTunggu}
          operatorTime={operatorTime}
          setOperatorTime={setOperatorTime}
          maintenance={maintenance}
          setMaintenance={setMaintenance}
          checking={checking}
          setChecking={setChecking}
          finishGood={finishGood}
          setFinishGood={setFinishGood}
          parseIntegerInput={parseIntegerInput}
          onBack={() => setCurrentScreen('HOME')}
          onSave={handleSimpan}
          onClear={handleClear}
        />
      )}

      {currentScreen === 'DOUBLE_JACKETED' && (
        <DoubleJacketScreen
          namaOperator={namaOperator}
          setNamaOperator={setNamaOperator}
          nomorSO={nomorSO}
          setNomorSO={setNomorSO}
          productName={productName}
          setProductName={setProductName}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          workType={workType}
          setWorkType={setWorkType}
          idVal={idVal}
          setIdVal={setIdVal}
          odVal={odVal}
          setOdVal={setOdVal}
          thickness={thickness}
          setThickness={setThickness}
          metal={metal}
          setMetal={setMetal}
          filler={filler}
          setFiller={setFiller}
          startTimestamp={startTimestamp}
          stopTimestamp={stopTimestamp}
          isStarted={isStarted}
          handleToggleStartStop={handleToggleStartStop}
          formatHHMM={formatHHMM}
          gantiOrder={gantiOrder}
          setGantiOrder={setGantiOrder}
          repair={repair}
          setRepair={setRepair}
          materialTunggu={materialTunggu}
          setMaterialTunggu={setMaterialTunggu}
          operatorTime={operatorTime}
          setOperatorTime={setOperatorTime}
          maintenance={maintenance}
          setMaintenance={setMaintenance}
          checking={checking}
          setChecking={setChecking}
          finishGood={finishGood}
          setFinishGood={setFinishGood}
          rework={rework}
          setRework={setRework}
          parseIntegerInput={parseIntegerInput}
          onBack={() => setCurrentScreen('HOME')}
          onSave={handleSimpan}
          onClear={handleClear}
        />
      )}
    </SafeAreaView>
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
});