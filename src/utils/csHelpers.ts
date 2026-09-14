export const parseJwtUsername = (token: string): string => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return 'Operator';
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded?.username || 'Operator';
  } catch {
    return 'Operator';
  }
};

export const getFirstValidString = (...candidates: unknown[]): string => {
  for (const cand of candidates) {
    if (cand === undefined || cand === null) continue;
    if (typeof cand === 'string' && cand.trim() !== '' && cand.trim() !== '-') return cand.trim();
    if (typeof cand === 'number') return String(cand);
    if (typeof cand === 'object' && cand !== null) {
      const obj = cand as Record<string, unknown>;
      const val =
        obj.name ||
        obj.product_name ||
        obj.productName ||
        obj.product_type ||
        obj.process_name ||
        obj.title ||
        obj.description ||
        obj.so_number ||
        obj.so_no ||
        obj.soNo ||
        obj.job_desk ||
        obj.jobDescription;
      if (val && typeof val === 'string' && val.trim() !== '' && val.trim() !== '-') {
        return val.trim();
      }
    }
  }
  return '-';
};

export const getItemWoNo = (item: any) =>
  getFirstValidString(
    item?.wo_no,
    item?.wo_number,
    item?.work_order_no,
    item?.no_wo,
    item?.work_order?.wo_no,
    item?.work_order?.wo_number,
    item?.parent_item?.wo_no,
    item?.parent_item?.wo_number,
    item?.wo_line_item?.work_order?.wo_number,
    item?.wo_line_item?.work_order?.wo_no
  );

export const getItemSoNo = (item: any) =>
  getFirstValidString(
    item?.soNo,
    item?.so_no,
    item?.so_number,
    item?.sales_order_no,
    item?.sales_order_number,
    item?.no_so,
    item?.so,
    item?.sales_order?.so_number,
    item?.sales_order?.so_no,
    item?.work_order?.so_no,
    item?.work_order?.so_number,
    item?.work_order?.sales_order?.so_number,
    item?.parent_item?.so_no,
    item?.parent_item?.so_number,
    item?.parent_item?.sales_order_number,
    item?.wo_line_item?.work_order?.sales_order?.so_number,
    item?.wo_line_item?.work_order?.so_number
  );

export const getItemCsNo = (item: any) =>
  getFirstValidString(
    item?.slip_no,
    item?.cs_no,
    item?.cs_number,
    item?.no_cs,
    item?.cs_file_name,
    item?.cs_document_id,
    item?.parent_item?.slip_no,
    item?.parent_item?.cs_no
  );

export const getItemModule = (item: any) => {
  const specificMod = getFirstValidString(
    item?.component_module,
    item?.ring_type,
    item?.modul_name,
    item?.work_order?.component_module,
    item?.parent_item?.component_module,
    item?.wo_line_item?.component_module
  );

  const generalMod = getFirstValidString(
    item?.module,
    item?.modul,
    item?.module_type,
    item?.materialType,
    item?.parent_item?.module,
    item?.wo_line_item?.module
  );

  let chosen = specificMod !== '-' ? specificMod : generalMod;
  
  if (chosen.toUpperCase() === 'RING' && specificMod !== '-' && specificMod !== chosen) {
    chosen = specificMod;
  }

  return String(chosen).replace(/_/g, ' ').toUpperCase();
};

export const getItemStatus = (item: any) =>
  item?.status ||
  item?.session_status ||
  item?.parent_item?.status ||
  (item?.timeEnd || item?.ended_at || item?.completed_at || item?.finish_time ? 'DONE' : 'IN_PROGRESS');

export const getItemQty = (item: any): number => {
  const candidates = [
    item?.finishGoodFG,
    item?.finishGood,
    item?.fg,
    item?.qty_good,
    item?.good_qty,
    item?.actual_qty,
    item?.qty_pcs,
    item?.quantity,
    item?.qty,
    item?.recorded_qty,
    item?.qty_done,
    item?.result_qty,
    item?.output_qty,
    item?.total_qty,
    item?.planned_qty,
    item?.jumlah,
    item?.hasil_produksi,
    item?.total_pcs,
    item?.parent_item?.good_qty,
    item?.parent_item?.actual_qty,
    item?.parent_item?.quantity,
    item?.parent_item?.qty,
    item?.parent_item?.qty_pcs,
  ];
  for (const val of candidates) {
    if (val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (!isNaN(num)) return num;
    }
  }
  return 0;
};

export const getItemProduct = (item: any): string =>
  getFirstValidString(
    item?.productName,
    item?.product_name,
    item?.product_type,
    item?.nama_produk,
    item?.product_code,
    item?.product,
    item?.item_name,
    item?.material_description,
    item?.part_name,
    item?.part,
    item?.description,
    item?.parent_item?.productName,
    item?.parent_item?.product_name,
    item?.parent_item?.product_type,
    item?.parent_item?.product,
    item?.work_order?.product_name,
    item?.work_order?.product_type,
    item?.work_order?.cs_line?.description,
    item?.cs_line?.description,
    item?.specifications?.product_type,
    item?.wo_line_item?.product_type,
    item?.wo_line_item?.product_name
  );

export const getItemJobDesc = (item: any): string =>
  getFirstValidString(
    item?.jobDescription,
    item?.job_description,
    item?.job_desc,
    item?.jobdesk,
    item?.job_name,
    item?.task_name,
    item?.name,
    item?.title,
    item?.process_name,
    item?.process,
    item?.work_type,
    item?.operation_name,
    item?.parent_item?.jobDescription,
    item?.parent_item?.job_description,
    item?.parent_item?.task_name,
    item?.parent_item?.job_desc,
    item?.parent_item?.process_name
  );

export const getItemSizeClass = (item: any): string => {
  if (item?.size_class) return String(item.size_class);
  if (item?.parent_item?.size_class) return String(item.parent_item.size_class);

  const size =
    item?.size ||
    item?.ukuran ||
    item?.dimension ||
    item?.work_order?.specifications?.size ||
    item?.parent_item?.size ||
    item?.wo_line_item?.size;

  const cls =
    item?.class ||
    item?.class_rating ||
    item?.kelas ||
    item?.work_order?.specifications?.class_rating ||
    item?.parent_item?.class_rating ||
    item?.wo_line_item?.class_rating;

  if (size && cls) {
    const formattedSize = String(size).includes('"') ? size : `${size}"`;
    const formattedClass = String(cls).startsWith('#') ? cls : `#${cls}`;
    return `${formattedSize} / ${formattedClass}`;
  }
  return String(size || cls || '-');
};

export const getItemStartTime = (item: any) =>
  getFirstValidString(
    item?.timeStart,
    item?.started_at,
    item?.start_time,
    item?.time_start,
    item?.start_at,
    item?.created_at,
    item?.clock_in,
    item?.check_in,
    item?.timestamp,
    item?.recorded_at,
    item?.waktu_mulai,
    item?.waktu,
    item?.date,
    item?.parent_item?.started_at,
    item?.parent_item?.created_at
  );

export const getItemEndTime = (item: any) =>
  getFirstValidString(
    item?.timeEnd,
    item?.ended_at,
    item?.completed_at,
    item?.end_time,
    item?.time_end,
    item?.end_at,
    item?.finish_time,
    item?.clock_out,
    item?.check_out,
    item?.waktu_selesai,
    item?.recorded_at,
    item?.updated_at,
    item?.parent_item?.ended_at
  );

export const parseToTimestamp = (dateStr?: string | null) => {
  if (!dateStr || dateStr === '-') return null;
  let timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) return timestamp;
  const cleanStr = String(dateStr).replace('.', ':').replace(',', '');
  timestamp = Date.parse(cleanStr);
  return isNaN(timestamp) ? null : timestamp;
};

export const formatDate = (dateStr?: string | null) => {
  if (!dateStr || dateStr === '-') return '-';
  const timestamp = parseToTimestamp(dateStr);
  if (!timestamp) return String(dateStr);

  const d = new Date(timestamp);
  const day = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}, ${hours}.${minutes}`;
};

export const formatTimeRange = (startStr?: string | null, endStr?: string | null) => {
  if (!startStr && !endStr) return '-';

  const cleanTime = (str?: string | null) => {
    if (!str || str === '-') return null;
    if (typeof str === 'string' && str.includes(':')) return str;
    const ts = parseToTimestamp(str);
    if (ts) {
      const d = new Date(ts);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
    return null;
  };

  const start = cleanTime(startStr);
  const end = cleanTime(endStr);

  if (start && end) return `${start} — ${end}`;
  return start || end || '-';
};