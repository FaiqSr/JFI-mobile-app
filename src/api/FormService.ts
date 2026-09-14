import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenType, ScreenFormData, initialFormState } from '../type/FormType';
import { authService } from './authService';

const BASE_URL = process.env.EXPO_PUBLIC_PRODUCTION_BASE_URL || '';
const CS_BASE_URL = process.env.EXPO_PUBLIC_CS_BASE_URL || '';

export interface PdfCheckResponse {
  success: boolean;
  pdfUrl?: string;
  errorCode?: number | string;
  message?: string;
}

export const checkCsPdfAvailabilityService = async (
  taskId: string | number,
  retryWithNewToken = true
): Promise<PdfCheckResponse> => {
  if (!CS_BASE_URL) {
    return {
      success: false,
      errorCode: 'ERR_CONFIG_MISSING',
      message: 'Konfigurasi URL CS belum disetting.',
    };
  }

  const cleanCsUrl = CS_BASE_URL.replace(/\/+$/, '');
  const targetUrl = `${cleanCsUrl}/download/${taskId}`;

  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(targetUrl, {
      method: 'HEAD',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 401 && retryWithNewToken) {
      const newToken = await authService.refreshAccessToken();
      if (newToken) return await checkCsPdfAvailabilityService(taskId, false);
      return {
        success: false,
        errorCode: 401,
        message: 'ERR_401: Sesi login Anda telah habis.',
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        errorCode: 404,
        message: 'ERR_404: Dokumen CS (PDF) tidak ditemukan di server.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        errorCode: response.status,
        message: `ERR_${response.status}: Server mengalami kendala saat mengambil dokumen.`,
      };
    }

    return {
      success: true,
      pdfUrl: targetUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      errorCode: 'ERR_NETWORK',
      message: 'ERR_NETWORK: Gagal terhubung ke server (Koneksi Terputus).',
    };
  }
};

export const fetchCsTasksService = async (
  retryWithNewToken = true
): Promise<{ success: boolean; data?: any[] }> => {
  if (!CS_BASE_URL) return { success: false, data: [] };

  const targetUrl = `${CS_BASE_URL.replace(/\/+$/, '')}/tasks`;

  try {
    const token = await AsyncStorage.getItem('userToken');

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 401 && retryWithNewToken) {
      const newToken = await authService.refreshAccessToken();
      if (newToken) return await fetchCsTasksService(false);
      return { success: false, data: [] };
    }

    const rawText = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      return { success: false, data: [] };
    }

    if (response.ok) {
      return {
        success: true,
        data: Array.isArray(result) ? result : result.data || [],
      };
    }
    return { success: false, data: [] };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const fetchCsDetailService = async (
  taskId: string | number,
  retryWithNewToken = true
): Promise<{ success: boolean; data?: any }> => {
  if (!CS_BASE_URL) return { success: false };

  const targetUrl = `${CS_BASE_URL.replace(/\/+$/, '')}/detail/${taskId}`;

  try {
    const token = await AsyncStorage.getItem('userToken');

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 401 && retryWithNewToken) {
      const newToken = await authService.refreshAccessToken();
      if (newToken) return await fetchCsDetailService(taskId, false);
      return { success: false };
    }

    const rawText = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      return { success: false };
    }

    if (response.ok) {
      return { success: true, data: result.data || result };
    }
    return { success: false };
  } catch (error: any) {
    return { success: false };
  }
};

const formatIsoString = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return new Date(val).toISOString();
  if (val instanceof Date) return val.toISOString();
  return String(val);
};

const buildPayload = (
  currentScreen: string,
  activeData: any,
  strStart: string,
  strEnd: string
) => {
  const productName = (
    activeData.productName ||
    activeData.product ||
    ''
  ).trim();
  const jobDescription = (
    activeData.jobDescription ||
    activeData.jobDesc ||
    ''
  ).trim();

  const commonTime = {
    timeStart: formatIsoString(strStart),
    timeEnd: formatIsoString(strEnd),
    gantiOrderA: Number(activeData.gantiOrder) || 0,
    repairB: Number(activeData.repair) || 0,
    materialTungguC: Number(activeData.materialTunggu) || 0,
    operatorD: Number(activeData.operatorTime) || 0,
    maintenanceE: Number(activeData.maintenance) || 0,
    checkingF: Number(activeData.checking) || 0,
    finishGoodFG: Number(activeData.finishGood) || 0,
    timeNote: activeData.noteTimeActivities
      ? activeData.noteTimeActivities.trim()
      : null,
  };

  switch (currentScreen) {
    case 'DOUBLE_JACKETED':
      return {
        endpoint: 'djg',
        payload: {
          soNo: activeData.nomorSO?.trim() || '',
          productName,
          jobDescription,
          typeProduct: activeData.workType ? activeData.workType.trim() : '',
          innerDiameter: activeData.idVal ? activeData.idVal.trim() : '',
          outerDiameter: activeData.odVal ? activeData.odVal.trim() : '',
          thickness: activeData.thickness ? activeData.thickness.trim() : '',
          metal: activeData.metal ? activeData.metal.trim() : '',
          filler: activeData.filler ? activeData.filler.trim() : '',
          fg: Number(activeData.finishGood) || 0,
          rework: Number(activeData.rework) || 0,
          notedJobdesc: activeData.jobNoted ? activeData.jobNoted.trim() : null,
          notedSizeOdId: activeData.notedSizeOdId
            ? activeData.notedSizeOdId.trim()
            : activeData.notedSize
            ? activeData.notedSize.trim()
            : null,
          materialNoted: activeData.materialNoted
            ? activeData.materialNoted.trim()
            : null,
          ...commonTime,
        },
      };

    case 'SEALING_ELEMENT':
      return {
        endpoint: 'se',
        payload: {
          soNo: activeData.nomorSO?.trim() || '',
          jobDescription,
          size: activeData.size?.trim() || '',
          class: activeData.classVal?.trim() || '',
          hoop: activeData.hoop ? activeData.hoop.trim() : null,
          filler: activeData.filler ? activeData.filler.trim() : null,
          innerRing: activeData.ir ? activeData.ir.trim() : null,
          outerRing: activeData.orVal ? activeData.orVal.trim() : null,
          thickness: activeData.thickness ? activeData.thickness.trim() : null,
          notedMaterial: activeData.materialNoted
            ? activeData.materialNoted.trim()
            : null,
          notedSizeOdId: activeData.notedSizeOdId
            ? activeData.notedSizeOdId.trim()
            : activeData.notedSize
            ? activeData.notedSize.trim()
            : null,
          notedJobdesc: activeData.jobNoted ? activeData.jobNoted.trim() : null,
          ...commonTime,
        },
      };

    case 'RING_1':
    case 'RING_2':
    case 'RING_3': {
      const ringEndpoints: Record<string, string> = {
        RING_1: 'ring-satu',
        RING_2: 'ring-dua',
        RING_3: 'ring-tiga',
      };

      return {
        endpoint: ringEndpoints[currentScreen],
        payload: {
          soNo: activeData.nomorSO?.trim() || '',
          jobDescription,
          notedJobdesc: activeData.jobNoted ? activeData.jobNoted.trim() : null,
          materialType: activeData.materialType?.trim() || '',
          materialNoted: activeData.materialNoted
            ? activeData.materialNoted.trim()
            : null,
          productName,
          size: activeData.size?.trim() || '',
          class: activeData.classVal?.trim() || '',
          thickness: activeData.thickness ? activeData.thickness.trim() : null,
          notedSizeOdId: activeData.notedSizeOdId
            ? activeData.notedSizeOdId.trim()
            : activeData.notedSize
            ? activeData.notedSize.trim()
            : null,
          ...commonTime,
        },
      };
    }

    default:
      return null;
  }
};

export const submitProductionData = async (
  currentScreen: string,
  activeData: any,
  strStart: string,
  strEnd: string,
  retryWithNewToken = true
): Promise<boolean> => {
  if (!BASE_URL) {
    Alert.alert('Gagal', 'Konfigurasi server belum siap.');
    return false;
  }

  const config = buildPayload(currentScreen, activeData, strStart, strEnd);

  if (!config) {
    Alert.alert('Gagal', 'Tampilan atau data form tidak valid.');
    return false;
  }

  const { endpoint, payload } = config;
  const cleanBase = BASE_URL.replace(/\/+$/, '');
  const targetUrl = `${cleanBase}/${endpoint}`;

  try {
    const token = await AsyncStorage.getItem('userToken');

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 && retryWithNewToken) {
      const newToken = await authService.refreshAccessToken();
      if (newToken) {
        return await submitProductionData(
          currentScreen,
          activeData,
          strStart,
          strEnd,
          false
        );
      } else {
        Alert.alert(
          'Sesi Berakhir',
          'Sesi login Anda telah habis. Silakan masuk kembali.'
        );
        return false;
      }
    }

    const rawText = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      Alert.alert('Gagal Menyimpan Data', 'Format respon server tidak sesuai.');
      return false;
    }

    if (response.status === 201 || response.ok) {
      Alert.alert('Sukses', result.message || 'Data berhasil disimpan.');
      return true;
    } else {
      let detailedError = 'Data yang diisi belum lengkap atau format salah.';

      if (Array.isArray(result.errors)) {
        detailedError = result.errors
          .map((err: any) => (typeof err === 'string' ? err : `${err.field}: ${err.message}`))
          .join('\n');
      } else if (result.message) {
        detailedError = result.message;
      }

      Alert.alert('Isian Form', detailedError);
      return false;
    }
  } catch (error: any) {
    Alert.alert('Koneksi Terputus', 'Gagal terhubung ke server.');
    return false;
  }
};

interface HelperOptions {
  userToken?: string;
  formsData: Record<string, ScreenFormData>;
  updateFormField: <K extends keyof ScreenFormData>(
    screen: ScreenType,
    field: K,
    value: ScreenFormData[K]
  ) => void;
  handleToggleStartStop: () => void;
  formatHHMM: (time: number | null) => string;
  parseIntegerInput: (text: string) => number;
  handleNavigate: (screen: any) => void;
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

const getPdfUrlByTaskId = (taskId?: string | number) => {
  if (!taskId || !CS_BASE_URL) return undefined;
  return `${CS_BASE_URL.replace(/\/+$/, '')}/download/${taskId}`;
};

export const getRingProps = (
  screen: 'RING_1' | 'RING_2' | 'RING_3',
  options: HelperOptions
) => {
  const {
    userToken,
    formsData,
    updateFormField,
    handleToggleStartStop,
    formatHHMM,
    parseIntegerInput,
    handleNavigate,
    handleSimpan,
    handleClear,
  } = options;
  const curData = formsData[screen] || initialFormState;

  const setProductBoth = (val: string) => {
    updateFormField(screen, 'product', val);
    updateFormField(screen, 'productName', val);
  };

  return {
    userToken,
    taskId: curData.taskId,
    pdfUrl: getPdfUrlByTaskId(curData.taskId),
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField(screen, 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField(screen, 'nomorSO', val),
    jobDescription: curData.jobDescription,
    setJobDescription: (val: string) => updateFormField(screen, 'jobDescription', val),
    jobNoted: curData.jobNoted,
    setJobNoted: (val: string) => updateFormField(screen, 'jobNoted', val),
    product: curData.product || curData.productName || '',
    productName: curData.productName || curData.product || '',
    setProduct: setProductBoth,
    setProductName: setProductBoth,
    materialType: curData.materialType,
    setMaterialType: (val: string) => updateFormField(screen, 'materialType', val),
    materialNoted: curData.materialNoted,
    setMaterialNoted: (val: string) => updateFormField(screen, 'materialNoted', val),
    size: curData.size,
    setSize: (val: string) => updateFormField(screen, 'size', val),
    notedSize: curData.notedSize,
    setNotedSize: (val: string) => updateFormField(screen, 'notedSize', val),
    notedSizeOdId: curData.notedSizeOdId,
    setNotedSizeOdId: (val: string) => updateFormField(screen, 'notedSizeOdId', val),
    classVal: curData.classVal,
    setClassVal: (val: string) => updateFormField(screen, 'classVal', val),
    thickness: curData.thickness,
    setThickness: (val: string) => updateFormField(screen, 'thickness', val),
    workType: curData.workType,
    setWorkType: (val: string) => updateFormField(screen, 'workType', val),
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
    onBack: () => handleNavigate('PEKERJAAN_CS'),
    onSave: handleSimpan,
    onClear: () => confirmClearAlert(handleClear),
  };
};

export const getSealingProps = (options: HelperOptions) => {
  const {
    userToken,
    formsData,
    updateFormField,
    handleToggleStartStop,
    formatHHMM,
    parseIntegerInput,
    handleNavigate,
    handleSimpan,
    handleClear,
  } = options;
  const curData = formsData['SEALING_ELEMENT'] || initialFormState;

  const setProductBoth = (val: string) => {
    updateFormField('SEALING_ELEMENT', 'product', val);
    updateFormField('SEALING_ELEMENT', 'productName', val);
  };

  return {
    userToken,
    taskId: curData.taskId,
    pdfUrl: getPdfUrlByTaskId(curData.taskId),
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField('SEALING_ELEMENT', 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField('SEALING_ELEMENT', 'nomorSO', val),
    product: curData.product || curData.productName || '',
    productName: curData.productName || curData.product || '',
    setProduct: setProductBoth,
    setProductName: setProductBoth,
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
    onBack: () => handleNavigate('PEKERJAAN_CS'),
    onSave: handleSimpan,
    onClear: () => confirmClearAlert(handleClear),
  };
};

export const getDoubleJacketProps = (options: HelperOptions) => {
  const {
    userToken,
    formsData,
    updateFormField,
    handleToggleStartStop,
    formatHHMM,
    parseIntegerInput,
    handleNavigate,
    handleSimpan,
    handleClear,
  } = options;
  const curData = formsData['DOUBLE_JACKETED'] || initialFormState;

  const setProductBoth = (val: string) => {
    updateFormField('DOUBLE_JACKETED', 'product', val);
    updateFormField('DOUBLE_JACKETED', 'productName', val);
  };

  return {
    userToken,
    taskId: curData.taskId,
    pdfUrl: getPdfUrlByTaskId(curData.taskId),
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField('DOUBLE_JACKETED', 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField('DOUBLE_JACKETED', 'nomorSO', val),
    product: curData.product || curData.productName || '',
    productName: curData.productName || curData.product || '',
    setProduct: setProductBoth,
    setProductName: setProductBoth,
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
    onBack: () => handleNavigate('PEKERJAAN_CS'),
    onSave: handleSimpan,
    onClear: () => confirmClearAlert(handleClear),
  };
};