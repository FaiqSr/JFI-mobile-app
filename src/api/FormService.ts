import { Alert } from 'react-native';
import { ScreenType, ScreenFormData, initialFormState } from '../type/FormType';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const buildPayload = (currentScreen: string, activeData: any, strStart: string, strEnd: string) => {
  switch (currentScreen) {
    case 'DOUBLE_JACKETED':
      return {
        endpoint: 'djg',
        payload: {
          namaOperator: activeData.namaOperator?.trim() || '',
          soNo: activeData.nomorSO?.trim() || '',
          productName: (activeData.product || activeData.productName || '').trim(),
          typeProduct: activeData.workType ? activeData.workType.trim() : null,
          jobDescription: activeData.jobDescription?.trim() || '',
          notedJobdesc: activeData.jobNoted ? activeData.jobNoted.trim() : null,
          innerDiameter: activeData.idVal?.trim() || '',
          outerDiameter: activeData.odVal?.trim() || '',
          thickness: activeData.thickness ? activeData.thickness.trim() : null,
          notedSize: activeData.notedSize ? activeData.notedSize.trim() : null,
          timeStart: strStart,
          timeEnd: strEnd,
          gantiOrderA: Number(activeData.gantiOrder) || 0,
          repairB: Number(activeData.repair) || 0,
          materialTungguC: Number(activeData.materialTunggu) || 0,
          operatorD: Number(activeData.operatorTime) || 0,
          maintenanceE: Number(activeData.maintenance) || 0,
          checkingF: Number(activeData.checking) || 0,
          noteTimeActivities: activeData.noteTimeActivities ? activeData.noteTimeActivities.trim() : null, 
          fg: Number(activeData.finishGood) || 0,
          metal: String(activeData.metal || '').trim(),
          filler: String(activeData.filler || '').trim(),
          materialNoted: activeData.materialNoted ? activeData.materialNoted.trim() : null,
          rework: Number(activeData.rework) || 0,
        },
      };

    case 'SEALING_ELEMENT':
      return {
        endpoint: 'se',
        payload: {
          namaOperator: activeData.namaOperator?.trim() || '',
          soNo: activeData.nomorSO?.trim() || '',
          jobDescription: activeData.jobDescription?.trim() || '',
          notedJobdesc: activeData.jobNoted ? activeData.jobNoted.trim() : null,
          size: activeData.size?.trim() || '',
          notedSize: activeData.notedSize ? activeData.notedSize.trim() : null,
          class: activeData.classVal?.trim() || '',
          thickness: activeData.thickness ? activeData.thickness.trim() : null,
          hoop: activeData.hoop?.trim() || '',
          filler: activeData.filler?.trim() || '',
          innerRing: activeData.ir?.trim() || '',
          outerRing: activeData.orVal?.trim() || '',
          materialNoted: activeData.materialNoted ? activeData.materialNoted.trim() : null,
          timeStart: strStart,
          timeEnd: strEnd,
          gantiOrderA: Number(activeData.gantiOrder) || 0,
          repairB: Number(activeData.repair) || 0,
          materialTungguC: Number(activeData.materialTunggu) || 0,
          operatorD: Number(activeData.operatorTime) || 0,
          maintenanceE: Number(activeData.maintenance) || 0,
          checkingF: Number(activeData.checking) || 0,
          noteTimeActivities: activeData.noteTimeActivities ? activeData.noteTimeActivities.trim() : null, 
          finishGoodFG: Number(activeData.finishGood) || 0,
        },
      };

    case 'RING_1':
    case 'RING_2':
    case 'RING_3':
      const ringEndpoints: Record<string, string> = {
        RING_1: 'ring-satu',
        RING_2: 'ring-dua',
        RING_3: 'ring-tiga',
      };
      return {
        endpoint: ringEndpoints[currentScreen],
        payload: {
          namaOperator: activeData.namaOperator?.trim() || '',
          jobDescription: activeData.jobDescription?.trim() || '',
          notedJobdesc: activeData.jobNoted ? activeData.jobNoted.trim() : null,
          soNo: activeData.nomorSO?.trim() || '',
          materialType: activeData.materialType?.trim() || '',
          materialNoted: activeData.materialNoted ? activeData.materialNoted.trim() : null,
          productName: (activeData.product || activeData.productName || '').trim(),
          size: activeData.size?.trim() || '',
          notedSize: activeData.notedSize ? activeData.notedSize.trim() : null,
          thickness: activeData.thickness ? activeData.thickness.trim() : null,
          notedSizeOdId: activeData.notedSize ? activeData.notedSize.trim() : null,
          class: activeData.classVal?.trim() || '',
          timeStart: strStart,
          timeEnd: strEnd,
          gantiOrderA: Number(activeData.gantiOrder) || 0,
          repairB: Number(activeData.repair) || 0,
          materialTungguC: Number(activeData.materialTunggu) || 0,
          operatorD: Number(activeData.operatorTime) || 0,
          maintenanceE: Number(activeData.maintenance) || 0,
          checkingF: Number(activeData.checking) || 0,
          noteTimeActivities: activeData.noteTimeActivities ? activeData.noteTimeActivities.trim() : null, 
          finishGoodFG: Number(activeData.finishGood) || 0,
        },
      };

    default:
      return null;
  }
};

export const submitProductionData = async (
  currentScreen: string,
  activeData: any,
  strStart: string,
  strEnd: string
) => {
  if (!BASE_URL) {
    Alert.alert('Gagal', 'Terjadi kesalahan sistem. Konfigurasi server belum siap.');
    return false;
  }

  const config = buildPayload(currentScreen, activeData, strStart, strEnd);

  if (!config) {
    Alert.alert('Gagal', 'Tampilan atau data form tidak valid. Silakan muat ulang halaman.');
    return false;
  }

  const { endpoint, payload } = config;
  const cleanBase = BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');
  const targetUrl = `${cleanBase}/${cleanEndpoint}`;

  console.log('--- TARGET URL ---', targetUrl);
  console.log('--- PAYLOAD SENT ---', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    
    console.log('--- RESPONSE STATUS ---', response.status);
    console.log('--- RAW RESPONSE SERVER ---', rawText);

    let result: any = {};

    try {
      result = JSON.parse(rawText);
    } catch (e) {
      Alert.alert(
        'Gagal Menyimpan Data',
        'Terjadi Gangguan pada sistem, silahkan coba beberapa saat lagi.'
      );
      return false;
    }

    if (response.status === 201 || response.ok) {
      Alert.alert('Sukses', result.message || 'Data berhasil disimpan.');
      return true;
    } else {
      const detailedError = result.errors
        ? Object.values(result.errors).flat().join('\n')
        : result.message || 'Data yang diisi belum lengkap atau format salah.';

      Alert.alert('Isian Form', detailedError);
      return false;
    }
  } catch (error: any) {
    console.error('--- NETWORK ERROR ---', error);

    let userMessage = 'Tidak dapat terhubung ke server.';

    if (error?.message === 'Network request failed' || error?.name === 'TypeError') {
      userMessage = 'Gagal terhubung ke server. Pastikan HP tersambung ke jaringan internet/Wi-Fi yang benar.';
    } else if (error?.message) {
      userMessage = error.message;
    }

    Alert.alert('Koneksi Terputus', userMessage);
    return false;
  }
};

interface HelperOptions {
  formsData: Record<string, ScreenFormData>;
  updateFormField: <K extends keyof ScreenFormData>(
    screen: ScreenType,
    field: K,
    value: ScreenFormData[K]
  ) => void;
  handleToggleStartStop: () => void;
  formatHHMM: (time: number | null) => string;
  parseIntegerInput: (text: string) => number;
  handleNavigate: (screen: ScreenType) => void;
  handleSimpan: () => void;
  handleClear: () => void;
}

const confirmClearAlert = (onConfirm: () => void) => {
  Alert.alert(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus semua isian form ini?',
    [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: onConfirm },
    ],
    { cancelable: true }
  );
};

export const getRingProps = (
  screen: 'RING_1' | 'RING_2' | 'RING_3',
  options: HelperOptions
) => {
  const { formsData, updateFormField, handleToggleStartStop, formatHHMM, parseIntegerInput, handleNavigate, handleSimpan, handleClear } = options;
  const curData = formsData[screen] || initialFormState;

  return {
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField(screen, 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField(screen, 'nomorSO', val),
    jobDescription: curData.jobDescription,
    setJobDescription: (val: string) => updateFormField(screen, 'jobDescription', val),
    jobNoted: curData.jobNoted,
    setJobNoted: (val: string) => updateFormField(screen, 'jobNoted', val),
    product: curData.product,
    setProduct: (val: string) => updateFormField(screen, 'product', val),
    materialType: curData.materialType,
    setMaterialType: (val: string) => updateFormField(screen, 'materialType', val),
    materialNoted: curData.materialNoted,
    setMaterialNoted: (val: string) => updateFormField(screen, 'materialNoted', val),
    size: curData.size,
    setSize: (val: string) => updateFormField(screen, 'size', val),
    notedSize: curData.notedSize,
    setNotedSize: (val: string) => updateFormField(screen, 'notedSize', val),
    classVal: curData.classVal,
    setClassVal: (val: string) => updateFormField(screen, 'classVal', val),
    thickness: curData.thickness,
    setThickness: (val: string) => updateFormField(screen, 'thickness', val),
    startTimestamp: curData.startTimestamp,
    stopTimestamp: curData.stopTimestamp,
    isStarted: curData.isStarted,
    handleToggleStartStop,
    formatHHMM,
    gantiOrder: curData.gantiOrder,
    setGantiOrder: (val: number) => updateFormField(screen, 'gantiOrder', Number(val)),
    repair: curData.repair,
    setRepair: (val: number) => updateFormField(screen, 'repair', Number(val)),
    materialTunggu: curData.materialTunggu,
    setMaterialTunggu: (val: number) => updateFormField(screen, 'materialTunggu', Number(val)),
    operatorTime: curData.operatorTime,
    setOperatorTime: (val: number) => updateFormField(screen, 'operatorTime', Number(val)),
    maintenance: curData.maintenance,
    setMaintenance: (val: number) => updateFormField(screen, 'maintenance', Number(val)),
    checking: curData.checking,
    setChecking: (val: number) => updateFormField(screen, 'checking', Number(val)),
    noteTimeActivities: curData.noteTimeActivities, 
    setNoteTimeActivities: (val: string) => updateFormField(screen, 'noteTimeActivities', val), 
    finishGood: curData.finishGood,
    setFinishGood: (val: number) => updateFormField(screen, 'finishGood', Number(val)),
    parseIntegerInput,
    onBack: () => handleNavigate('HOME'),
    onSave: handleSimpan,
    onClear: () => confirmClearAlert(handleClear),
  };
};

export const getSealingProps = (options: HelperOptions) => {
  const { formsData, updateFormField, handleToggleStartStop, formatHHMM, parseIntegerInput, handleNavigate, handleSimpan, handleClear } = options;
  const curData = formsData['SEALING_ELEMENT'] || initialFormState;

  return {
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField('SEALING_ELEMENT', 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField('SEALING_ELEMENT', 'nomorSO', val),
    jobDescription: curData.jobDescription,
    setJobDescription: (val: string) => updateFormField('SEALING_ELEMENT', 'jobDescription', val),
    jobNoted: curData.jobNoted,
    setJobNoted: (val: string) => updateFormField('SEALING_ELEMENT', 'jobNoted', val),
    size: curData.size,
    setSize: (val: string) => updateFormField('SEALING_ELEMENT', 'size', val),
    notedSize: curData.notedSize,
    setNotedSize: (val: string) => updateFormField('SEALING_ELEMENT', 'notedSize', val),
    classVal: curData.classVal,
    setClassVal: (val: string) => updateFormField('SEALING_ELEMENT', 'classVal', val),
    thickness: curData.thickness,
    setThickness: (val: string) => updateFormField('SEALING_ELEMENT', 'thickness', val),
    hoop: curData.hoop,
    setHoop: (val: string) => updateFormField('SEALING_ELEMENT', 'hoop', val),
    filler: curData.filler,
    setFiller: (val: string) => updateFormField('SEALING_ELEMENT', 'filler', val),
    ir: curData.ir,
    setIr: (val: string) => updateFormField('SEALING_ELEMENT', 'ir', val),
    orVal: curData.orVal,
    setOrVal: (val: string) => updateFormField('SEALING_ELEMENT', 'orVal', val),
    materialNoted: curData.materialNoted,
    setMaterialNoted: (val: string) => updateFormField('SEALING_ELEMENT', 'materialNoted', val),
    startTimestamp: curData.startTimestamp,
    stopTimestamp: curData.stopTimestamp,
    isStarted: curData.isStarted,
    handleToggleStartStop,
    formatHHMM,
    gantiOrder: curData.gantiOrder,
    setGantiOrder: (val: number) => updateFormField('SEALING_ELEMENT', 'gantiOrder', Number(val)),
    repair: curData.repair,
    setRepair: (val: number) => updateFormField('SEALING_ELEMENT', 'repair', Number(val)),
    materialTunggu: curData.materialTunggu,
    setMaterialTunggu: (val: number) => updateFormField('SEALING_ELEMENT', 'materialTunggu', Number(val)),
    operatorTime: curData.operatorTime,
    setOperatorTime: (val: number) => updateFormField('SEALING_ELEMENT', 'operatorTime', Number(val)),
    maintenance: curData.maintenance,
    setMaintenance: (val: number) => updateFormField('SEALING_ELEMENT', 'maintenance', Number(val)),
    checking: curData.checking,
    setChecking: (val: number) => updateFormField('SEALING_ELEMENT', 'checking', Number(val)),
    noteTimeActivities: curData.noteTimeActivities, 
    setNoteTimeActivities: (val: string) => updateFormField('SEALING_ELEMENT', 'noteTimeActivities', val), 
    finishGood: curData.finishGood,
    setFinishGood: (val: number) => updateFormField('SEALING_ELEMENT', 'finishGood', Number(val)),
    parseIntegerInput,
    onBack: () => handleNavigate('HOME'),
    onSave: handleSimpan,
    onClear: () => confirmClearAlert(handleClear),
  };
};

export const getDoubleJacketProps = (options: HelperOptions) => {
  const { formsData, updateFormField, handleToggleStartStop, formatHHMM, parseIntegerInput, handleNavigate, handleSimpan, handleClear } = options;
  const curData = formsData['DOUBLE_JACKETED'] || initialFormState;

  return {
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField('DOUBLE_JACKETED', 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField('DOUBLE_JACKETED', 'nomorSO', val),
    productName: curData.productName,
    setProductName: (val: string) => updateFormField('DOUBLE_JACKETED', 'productName', val),
    productType: curData.workType,
    setProductType: (val: string) => updateFormField('DOUBLE_JACKETED', 'workType', val),
    jobDescription: curData.jobDescription,
    setJobDescription: (val: string) => updateFormField('DOUBLE_JACKETED', 'jobDescription', val),
    jobNoted: curData.jobNoted,
    setJobNoted: (val: string) => updateFormField('DOUBLE_JACKETED', 'jobNoted', val),
    idVal: curData.idVal,
    setIdVal: (val: string) => updateFormField('DOUBLE_JACKETED', 'idVal', val),
    odVal: curData.odVal,
    setOdVal: (val: string) => updateFormField('DOUBLE_JACKETED', 'odVal', val),
    thickness: curData.thickness,
    setThickness: (val: string) => updateFormField('DOUBLE_JACKETED', 'thickness', val),
    notedSize: curData.notedSize,
    setNotedSize: (val: string) => updateFormField('DOUBLE_JACKETED', 'notedSize', val),
    metal: curData.metal,
    setMetal: (val: string) => updateFormField('DOUBLE_JACKETED', 'metal', val),
    filler: curData.filler,
    setFiller: (val: string) => updateFormField('DOUBLE_JACKETED', 'filler', val),
    materialNoted: curData.materialNoted,
    setMaterialNoted: (val: string) => updateFormField('DOUBLE_JACKETED', 'materialNoted', val),
    startTimestamp: curData.startTimestamp,
    stopTimestamp: curData.stopTimestamp,
    isStarted: curData.isStarted,
    handleToggleStartStop,
    formatHHMM,
    gantiOrder: curData.gantiOrder,
    setGantiOrder: (val: number) => updateFormField('DOUBLE_JACKETED', 'gantiOrder', Number(val)),
    repair: curData.repair,
    setRepair: (val: number) => updateFormField('DOUBLE_JACKETED', 'repair', Number(val)),
    materialTunggu: curData.materialTunggu,
    setMaterialTunggu: (val: number) => updateFormField('DOUBLE_JACKETED', 'materialTunggu', Number(val)),
    operatorTime: curData.operatorTime,
    setOperatorTime: (val: number) => updateFormField('DOUBLE_JACKETED', 'operatorTime', Number(val)),
    maintenance: curData.maintenance,
    setMaintenance: (val: number) => updateFormField('DOUBLE_JACKETED', 'maintenance', Number(val)),
    checking: curData.checking,
    setChecking: (val: number) => updateFormField('DOUBLE_JACKETED', 'checking', Number(val)),
    noteTimeActivities: curData.noteTimeActivities,
    setNoteTimeActivities: (val: string) => updateFormField('DOUBLE_JACKETED', 'noteTimeActivities', val),
    finishGood: curData.finishGood,
    setFinishGood: (val: number) => updateFormField('DOUBLE_JACKETED', 'finishGood', Number(val)),
    rework: curData.rework,
    setRework: (val: number) => updateFormField('DOUBLE_JACKETED', 'rework', Number(val)),
    parseIntegerInput,
    onBack: () => handleNavigate('HOME'),
    onSave: handleSimpan,
    onClear: () => confirmClearAlert(handleClear),
  };
};