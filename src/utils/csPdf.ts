/**
 * Pure helpers for the in-app CS/SO PDF viewer.
 *
 * Deliberately free of EVERY import (no expo-file-system, no react-native-pdf,
 * no `../api/apiConfig`) so it stays runnable under node's type-stripping —
 * this repo's only test mechanism, see `csPdf.check.mjs` / `npm run check:pdf`.
 * Plain node resolves ESM specifiers literally, so an extensionless app import
 * here would kill the check with ERR_MODULE_NOT_FOUND: the API base is a
 * REQUIRED parameter, passed by `pdfHandler.ts` (`CS_BASE_URL`), which is app
 * code and may import freely.
 */

/** Task ids are `cs_tasks.id`: positive integers only. The CS lists also carry
 *  synthetic row ids (`session_<task>_<session>`), which must never reach the API. */
export const isCsPdfTaskId = (taskId: unknown): boolean => {
  if (typeof taskId === 'number') return Number.isInteger(taskId) && taskId > 0;
  const raw = String(taskId ?? '').trim();
  if (!/^\d+$/.test(raw)) return false;
  return Number(raw) > 0;
};

/** The one endpoint that serves a task's original CS/SO PDF (same as entry-web).
 *  `base` is REQUIRED (no default) so this module keeps zero imports; callers
 *  pass `CS_BASE_URL` from `../api/apiConfig`. */
export const buildCsPdfUrl = (taskId: string | number, base: string): string =>
  `${base.replace(/\/+$/, '')}/tasks/${String(taskId).trim()}/cs`;

/** One cache file per task, so two tasks can never share a downloaded file. */
export const csPdfCacheFileName = (taskId: string | number): string =>
  `CS_WorkOrder_${String(taskId).trim()}.pdf`;

/** Case-insensitive `content-type` lookup in a response header bag. */
const headerContentType = (headers?: Record<string, string> | null): string => {
  if (!headers) return '';
  const key = Object.keys(headers).find((name) => name.toLowerCase() === 'content-type');
  return key ? String(headers[key] ?? '') : '';
};

/**
 * True only on POSITIVE evidence that the response is not a PDF: a declared
 * content type (from `mimeType` or the `content-type` header) that is not
 * `application/pdf`. An absent/unknown type is inconclusive and must not block a
 * valid download — the same "only positive evidence may reject" rule the
 * entry-web session guard uses.
 *
 * This replaced a magic-byte check that read the first bytes of the downloaded
 * file: that extra `readAsStringAsync({ position, length })` call was the only
 * step that could leave the modal spinning forever on device, and the declared
 * type is enough to catch the case it existed for (an nginx SPA/HTML page saved
 * as `….pdf`).
 */
export const isNonPdfContentType = (
  mimeType: string | null | undefined,
  headers?: Record<string, string> | null
): boolean => {
  const declared = String(mimeType ?? '').trim() || headerContentType(headers);
  if (!declared) return false;
  return !declared.toLowerCase().startsWith('application/pdf');
};

// --- Viewer store ---------------------------------------------------------
// Folded into this module (instead of living in its own file) for the same
// reason as above: a second module importing `./csPdf` extensionlessly cannot
// be resolved by plain node, so it could not have its own check script.
// `CsPdfModalHost` — a sibling of <App /> in `index.js` — subscribes here and
// renders the document, so every screen opens the PDF with one line:
// `openCsPdfViewer(taskId, fileName?)`.

export interface CsPdfRequest {
  /** Monotonic id: a new open always means a new download. */
  id: number;
  taskId: number;
  /** The CS document's file name (`cs_file_name`), shown in the modal header. */
  fileLabel: string | null;
}

type CsPdfListener = (request: CsPdfRequest | null) => void;

let current: CsPdfRequest | null = null;
let nextId = 1;
const listeners = new Set<CsPdfListener>();

const emit = (): void => {
  listeners.forEach((listener) => listener(current));
};

/** Host subscribes here; the current request is replayed so an open fired before
 *  the host mounted is still shown — same rule as `utils/appAlert.ts`. */
export const subscribeToCsPdf = (listener: CsPdfListener): (() => void) => {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
};

/** True when the viewer opened; false when the id is not a real task id (the
 *  screens turn that `false` into an alert). */
export const openCsPdfViewer = (taskId: string | number, fileLabel?: string | null): boolean => {
  if (!isCsPdfTaskId(taskId)) return false;
  current = { id: nextId++, taskId: Number(taskId), fileLabel: fileLabel ?? null };
  emit();
  return true;
};

export const closeCsPdfViewer = (): void => {
  current = null;
  emit();
};
