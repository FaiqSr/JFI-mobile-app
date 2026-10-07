import { Alert } from '../utils/appAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenType, ScreenFormData, initialFormState } from '../type/FormType';
import { authService } from './authService';
import { PRODUCTION_BASE_URL } from './apiConfig';
import {
  RING1_JOB_DESC,
  RING2_JOB_DESC,
  RING3_JOB_DESC,
  SE_JOB_DESC,
} from '../constants/jobDescOptions';
import { resolveMachineSizes } from '../constants/jobDescToNamaMc';

const BASE_URL = PRODUCTION_BASE_URL;

/** Sentinel pertama pada daftar Job Description; wajib tetap bisa dipilih. */
const JOB_DESC_SENTINEL = 'Tidak Ada Pilihan';

export interface LhpMasterCatalog {
  area: string;
  machines: { namaMc: string; sizes: string[] }[];
}

export const getLhpMasterCatalog = async (area: string, retry = true): Promise<LhpMasterCatalog | null> => {
  const token = await AsyncStorage.getItem('userToken');
  try {
    const response = await fetch(`${BASE_URL.replace(/\/+$/, '')}/lhp/master-catalog?area=${encodeURIComponent(area)}`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (response.status === 401 && retry) {
      if (await authService.refreshAccessToken()) return getLhpMasterCatalog(area, false);
      return null;
    }
    return response.ok ? (await response.json() as LhpMasterCatalog) : null;
  } catch {
    return null;
  }
};

/**
 * Daftar Job Description dinamis dari master `cs_mesin_alias` (distinct `jobdesc_norm`).
 * Mengembalikan `null` bila gagal / tidak ada data; pemanggil memakai konstanta statis
 * sebagai fallback. Daftar API TIDAK memuat sentinel, jadi sentinel disisipkan di sini.
 */
export const getJobDescOptions = async (area: string, retry = true): Promise<string[] | null> => {
  const token = await AsyncStorage.getItem('userToken');
  try {
    const response = await fetch(`${BASE_URL.replace(/\/+$/, '')}/lhp/master/jobdesc-options?area=${encodeURIComponent(area)}`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (response.status === 401 && retry) {
      if (await authService.refreshAccessToken()) return getJobDescOptions(area, false);
      return null;
    }
    if (!response.ok) return null;
    const body: any = await response.json();
    return Array.isArray(body?.data) ? (body.data as string[]) : null;
  } catch {
    return null;
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
    shift: activeData.shift ?? null,
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

    case 'GNM':
      return {
        endpoint: 'gnm',
        payload: {
          soNo: activeData.nomorSO?.trim() || '',
          jobDescription,
          size: activeData.size?.trim() || '',
          class: activeData.classVal?.trim() || '',
          type1: activeData.type1 ? activeData.type1.trim() : null,
          type2: activeData.type2 ? activeData.type2.trim() : null,
          thickness: activeData.thickness ? activeData.thickness.trim() : null,
          materialNoted: activeData.materialNoted
            ? activeData.materialNoted.trim()
            : null,
          notedJobdesc: activeData.jobNoted ? activeData.jobNoted.trim() : null,
          notedSizeOdId: activeData.notedSizeOdId
            ? activeData.notedSizeOdId.trim()
            : activeData.notedSize
            ? activeData.notedSize.trim()
            : null,
          ...commonTime,
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
  formsData: Record<string, ScreenFormData>;
  updateFormField: <K extends keyof ScreenFormData>(
    screen: ScreenType,
    field: K,
    value: ScreenFormData[K]
  ) => void;
  handleChangeStartTime: (text: string) => void;
  handleChangeStopTime: (text: string) => void;
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

export const getRingProps = (
  screen: 'RING_1' | 'RING_2' | 'RING_3',
  options: HelperOptions,
  catalog?: LhpMasterCatalog,
  jobDescOptions?: string[]
) => {
  const {
    formsData,
    updateFormField,
    handleChangeStartTime,
    handleChangeStopTime,
    parseIntegerInput,
    handleNavigate,
    handleSimpan,
    handleClear,
  } = options;
  const curData = formsData[screen] || initialFormState;

  const ringJobDescOptions: Record<'RING_1' | 'RING_2' | 'RING_3', string[]> = {
    RING_1: RING1_JOB_DESC,
    RING_2: RING2_JOB_DESC,
    RING_3: RING3_JOB_DESC,
  };

  // Opsi dinamis dari API menang; jika kosong/gagal pakai konstanta statis.
  // Sentinel selalu di posisi pertama agar tetap bisa dipilih.
  const machineOptions = jobDescOptions && jobDescOptions.length
    ? [JOB_DESC_SENTINEL, ...jobDescOptions.filter((item) => item !== JOB_DESC_SENTINEL)]
    : ringJobDescOptions[screen];

  const setProductBoth = (val: string) => {
    updateFormField(screen, 'product', val);
    updateFormField(screen, 'productName', val);
  };

  return {
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField(screen, 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField(screen, 'nomorSO', val),
    jobDescription: curData.jobDescription,
    setJobDescription: (val: string) => updateFormField(screen, 'jobDescription', val),
    jobNoted: curData.jobNoted,
    setJobNoted: (val: string) => updateFormField(screen, 'jobNoted', val),
    product: curData.product || curData.productName || '',
    setProduct: setProductBoth,
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
    startTimeText: curData.startTimeText,
    stopTimeText: curData.stopTimeText,
    handleChangeStartTime,
    handleChangeStopTime,
    shift: curData.shift,
    setShift: (val: number | null) => updateFormField(screen, 'shift', val),
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
    machineOptions,
    machineSizes: resolveMachineSizes(catalog, screen, curData.jobDescription),
  };
};

export const getSealingProps = (options: HelperOptions, catalog?: LhpMasterCatalog, jobDescOptions?: string[]) => {
  const {
    formsData,
    updateFormField,
    handleChangeStartTime,
    handleChangeStopTime,
    parseIntegerInput,
    handleNavigate,
    handleSimpan,
    handleClear,
  } = options;
  const curData = formsData['SEALING_ELEMENT'] || initialFormState;

  // Opsi dinamis dari API menang; jika kosong/gagal pakai konstanta statis.
  // Sentinel selalu di posisi pertama agar tetap bisa dipilih.
  const machineOptions = jobDescOptions && jobDescOptions.length
    ? [JOB_DESC_SENTINEL, ...jobDescOptions.filter((item) => item !== JOB_DESC_SENTINEL)]
    : SE_JOB_DESC;

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
    startTimeText: curData.startTimeText,
    stopTimeText: curData.stopTimeText,
    handleChangeStartTime,
    handleChangeStopTime,
    shift: curData.shift,
    setShift: (val: number | null) => updateFormField('SEALING_ELEMENT', 'shift', val),
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
    machineOptions,
    machineSizes: resolveMachineSizes(catalog, 'SE', curData.jobDescription),
  };
};

export const getDoubleJacketProps = (options: HelperOptions) => {
  const {
    formsData,
    updateFormField,
    handleChangeStartTime,
    handleChangeStopTime,
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
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField('DOUBLE_JACKETED', 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField('DOUBLE_JACKETED', 'nomorSO', val),
    productName: curData.productName || curData.product || '',
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
    startTimeText: curData.startTimeText,
    stopTimeText: curData.stopTimeText,
    handleChangeStartTime,
    handleChangeStopTime,
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

export const getGnmProps = (options: HelperOptions) => {
  const {
    formsData,
    updateFormField,
    handleChangeStartTime,
    handleChangeStopTime,
    parseIntegerInput,
    handleNavigate,
    handleSimpan,
    handleClear,
  } = options;
  const curData = formsData['GNM'] || initialFormState;

  return {
    namaOperator: curData.namaOperator,
    setNamaOperator: (val: string) => updateFormField('GNM', 'namaOperator', val),
    nomorSO: curData.nomorSO,
    setNomorSO: (val: string) => updateFormField('GNM', 'nomorSO', val),
    jobDescription: curData.jobDescription,
    setJobDescription: (val: string) => updateFormField('GNM', 'jobDescription', val),
    jobNoted: curData.jobNoted,
    setJobNoted: (val: string) => updateFormField('GNM', 'jobNoted', val),
    size: curData.size,
    setSize: (val: string) => updateFormField('GNM', 'size', val),
    classVal: curData.classVal,
    setClassVal: (val: string) => updateFormField('GNM', 'classVal', val),
    type1: curData.type1,
    setType1: (val: string) => updateFormField('GNM', 'type1', val),
    type2: curData.type2,
    setType2: (val: string) => updateFormField('GNM', 'type2', val),
    thickness: curData.thickness,
    setThickness: (val: string) => updateFormField('GNM', 'thickness', val),
    notedSize: curData.notedSize,
    setNotedSize: (val: string) => updateFormField('GNM', 'notedSize', val),
    materialNoted: curData.materialNoted,
    setMaterialNoted: (val: string) => updateFormField('GNM', 'materialNoted', val),
    shift: curData.shift,
    setShift: (val: number | null) => updateFormField('GNM', 'shift', val),
    startTimeText: curData.startTimeText,
    stopTimeText: curData.stopTimeText,
    handleChangeStartTime,
    handleChangeStopTime,
    gantiOrder: curData.gantiOrder,
    setGantiOrder: (val: number) => updateFormField('GNM', 'gantiOrder', Number(val)),
    repair: curData.repair,
    setRepair: (val: number) => updateFormField('GNM', 'repair', Number(val)),
    materialTunggu: curData.materialTunggu,
    setMaterialTunggu: (val: number) => updateFormField('GNM', 'materialTunggu', Number(val)),
    operatorTime: curData.operatorTime,
    setOperatorTime: (val: number) => updateFormField('GNM', 'operatorTime', Number(val)),
    maintenance: curData.maintenance,
    setMaintenance: (val: number) => updateFormField('GNM', 'maintenance', Number(val)),
    checking: curData.checking,
    setChecking: (val: number) => updateFormField('GNM', 'checking', Number(val)),
    noteTimeActivities: curData.noteTimeActivities,
    setNoteTimeActivities: (val: string) => updateFormField('GNM', 'noteTimeActivities', val),
    finishGood: curData.finishGood,
    setFinishGood: (val: number) => updateFormField('GNM', 'finishGood', Number(val)),
    parseIntegerInput,
    onBack: () => handleNavigate('HOME'),
    onSave: handleSimpan,
    onClear: () => confirmClearAlert(handleClear),
  };
};
