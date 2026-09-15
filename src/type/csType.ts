export type ModuleType = 'RING_1' | 'RING_2' | 'RING_3' | 'SE' | 'DJG';

export interface OpenTaskItem {
  id: number;
  work_order_id: number;
  wo_no: string;
  so_no: string;
  customer?: string | null;
  size?: string | null;
  class?: string | null;
  heat_no_material?: string | null;
  cert_no_material?: string | null;
  material?: string | null;
  cs_document_id?: number | null;
  cs_file_name?: string | null;
  component_module: ModuleType;
  planned_qty?: number | null;
  actual_qty?: number | null;
  status: 'PENDING' | 'IN_PROGRESS';
  created_at?: string;
}

export interface WorkQueueSession {
  id: number;
  started_at?: string | null;
  ended_at?: string | null;
  actual_qty: number;
  status: 'ACTIVE' | 'DONE';
}

export interface WorkQueueTask {
  id: number;
  work_order_id: number;
  wo_no: string;
  so_no: string;
  customer?: string | null;
  size?: string | null;
  class?: string | null;
  heat_no_material?: string | null;
  cert_no_material?: string | null;
  material?: string | null;
  component_module: ModuleType;
  planned_qty?: number | null;
  actual_qty?: number | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'QC_HOLD';
  is_open: boolean;
  cs_document_id?: number | null;
  cs_file_name?: string | null;
  worker_sessions: WorkQueueSession[];
  created_at?: string;
  completed_at?: string | null;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'QC_HOLD' | 'ACTIVE' | 'DONE' | string;

export type CsTaskItem = Omit<Partial<OpenTaskItem> & Partial<WorkQueueTask>, 'status'> & {
  status?: TaskStatus;
  slip_no?: string;
  pdf_url?: string;
};

export type TaskSession = CsTaskItem;

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

export const translateStatus = (status?: string): string => {
  if (!status) return 'MENUNGGU';
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'MENUNGGU';
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'SEDANG DIKERJAKAN';
    case 'COMPLETED':
    case 'DONE':
      return 'SELESAI';
    case 'QC_HOLD':
      return 'QC HOLD';
    default:
      return status;
  }
};