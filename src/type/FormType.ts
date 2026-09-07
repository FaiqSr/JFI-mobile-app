export type ScreenType =
  | 'HOME'
  | 'RING_1'
  | 'RING_2'
  | 'RING_3'
  | 'SEALING_ELEMENT'
  | 'DOUBLE_JACKETED';

export interface ScreenFormData {
  namaOperator: string;
  nomorSO: string;
  jobDescription: string;
  jobNoted: string;
  product: string;
  productName: string;
  materialType: string;
  materialNoted: string;
  notedSize: string;
  size: string;
  classVal: string;
  workType: string;
  startTimestamp: number | null;
  stopTimestamp: number | null;
  isStarted: boolean;
  gantiOrder: number;
  repair: number;
  materialTunggu: number;
  operatorTime: number;
  maintenance: number;
  checking: number;
  finishGood: number;
  hoop: string;
  filler: string;
  ir: string;
  orVal: string;
  idVal: string;
  odVal: string;
  thickness: string;
  metal: string;
  rework: number;
  noteTimeActivities: string;
}

export const initialFormState: ScreenFormData = {
  namaOperator: '',
  nomorSO: '',
  jobDescription: '',
  jobNoted: '',
  product: '',
  productName: '',
  materialType: '',
  materialNoted: '',
  notedSize: '',
  size: '',
  classVal: '',
  workType: '',
  startTimestamp: null,
  stopTimestamp: null,
  isStarted: false,
  gantiOrder: 0,
  repair: 0,
  materialTunggu: 0,
  operatorTime: 0,
  maintenance: 0,
  checking: 0,
  finishGood: 0,
  hoop: '',
  filler: '',
  ir: '',
  orVal: '',
  idVal: '',
  odVal: '',
  thickness: '',
  metal: '',
  rework: 0,
  noteTimeActivities: '',
};