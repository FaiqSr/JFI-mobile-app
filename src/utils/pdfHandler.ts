import * as FileSystem from 'expo-file-system/legacy';
import { CS_BASE_URL } from '../api/apiConfig';
import { authService } from '../api/authService';
import {
  buildCsPdfUrl,
  csPdfCacheFileName,
  isCsPdfTaskId,
  isNonPdfContentType,
} from './csPdf';

export type CsPdfFileResult =
  | { ok: true; uri: string }
  | { ok: false; error: string; unauthorized?: boolean };

/**
 * Bounded waits. A native promise that never settles must surface as an
 * Indonesian error with a "Coba Lagi" button — never as an endless spinner.
 */
const DOWNLOAD_TIMEOUT_MS = 30_000;
const CLEANUP_TIMEOUT_MS = 5_000;

let isDownloading = false;

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} melewati batas waktu ${ms} ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

/**
 * Downloads the original CS/SO PDF of a task into the app cache and returns its
 * local `file://` uri. The caller (`CsPdfModalHost`) renders it in-app — nothing
 * is ever handed to the OS share sheet again.
 *
 * Guards, in order: valid task id, no concurrent download, token present,
 * one refresh+retry on 401, non-200 reported as an Indonesian message, and a
 * response whose DECLARED content type is not `application/pdf` rejected and
 * deleted. Any pre-existing file at the target path is removed before
 * downloading, so a stale document can never be opened as the current task's CS.
 *
 * Every native step is bounded by `withTimeout` and each phase logs with the
 * `[PDF]` prefix, so a device log pinpoints where a run stalls.
 */
export const downloadCsPdfFile = async (
  taskId: string | number,
  token: string
): Promise<CsPdfFileResult> => {
  if (!isCsPdfTaskId(taskId)) {
    return { ok: false, error: 'Nomor pekerjaan tidak dikenal, dokumen CS tidak bisa dibuka.' };
  }
  if (isDownloading) {
    return { ok: false, error: 'Proses unduh masih berjalan. Tunggu sebentar lalu coba lagi.' };
  }
  isDownloading = true;

  const url = buildCsPdfUrl(taskId, CS_BASE_URL);
  const localUri = `${FileSystem.cacheDirectory}${csPdfCacheFileName(taskId)}`;

  try {
    if (!token) {
      return {
        ok: false,
        error: 'Sesi login tidak ditemukan. Silakan masuk kembali.',
        unauthorized: true,
      };
    }

    // Best effort: a stale file at this path must never be served, but a failed
    // (or hung) delete must not block the download either.
    const deleteLocal = () =>
      withTimeout(
        FileSystem.deleteAsync(localUri, { idempotent: true }),
        CLEANUP_TIMEOUT_MS,
        'hapus berkas lama'
      ).catch(() => {});
    await deleteLocal();
    console.warn(`[PDF] unduh task=${taskId} dari ${url}`);

    const doDownload = (authToken: string) =>
      FileSystem.downloadAsync(url, localUri, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/pdf',
        },
      });

    let result = await withTimeout(doDownload(token), DOWNLOAD_TIMEOUT_MS, 'unduh CS');
    console.warn(`[PDF] status=${result.status} mime=${result.mimeType ?? '-'} task=${taskId}`);

    if (result.status === 401) {
      const newToken = await authService.refreshAccessToken();
      if (!newToken) {
        await deleteLocal();
        return {
          ok: false,
          error: 'Sesi login Anda telah habis. Silakan masuk kembali.',
          unauthorized: true,
        };
      }
      result = await withTimeout(doDownload(newToken), DOWNLOAD_TIMEOUT_MS, 'unduh CS (setelah refresh)');
      console.warn(`[PDF] status=${result.status} (setelah refresh) task=${taskId}`);
    }

    if (result.status !== 200) {
      await deleteLocal();
      if (result.status === 401) {
        return {
          ok: false,
          error: 'Sesi login Anda telah habis. Silakan masuk kembali.',
          unauthorized: true,
        };
      }
      if (result.status === 403) {
        return { ok: false, error: 'Akun Anda tidak berhak membuka dokumen tugas ini.' };
      }
      if (result.status === 404) {
        return { ok: false, error: 'Dokumen CS belum tersedia untuk pekerjaan ini.' };
      }
      console.error(`❌ [PDF Error] HTTP ${result.status} untuk Task ID ${taskId}`);
      return { ok: false, error: `Gagal membuka CS (HTTP ${result.status}).` };
    }

    // A 200 whose DECLARED type is HTML/JSON must never be shown as the CS. This
    // reads the download result's own metadata — the extra native byte-read it
    // replaces was the step that could leave the modal spinning forever.
    if (isNonPdfContentType(result.mimeType, result.headers)) {
      await deleteLocal();
      console.error(
        `❌ [PDF Error] content-type bukan PDF (${result.mimeType ?? '-'}) Task ID ${taskId}`
      );
      return {
        ok: false,
        error: 'Berkas dari server bukan PDF. Dokumen CS tidak valid — hubungi admin.',
      };
    }

    console.warn(`[PDF] siap uri=${result.uri} task=${taskId}`);
    return { ok: true, uri: result.uri };
  } catch (error: any) {
    const detail = error?.message || String(error);
    console.error('❌ Error download PDF:', detail);
    if (String(detail).includes('melewati batas waktu')) {
      return {
        ok: false,
        error: 'Gagal mengunduh berkas CS (waktu habis). Periksa koneksi lalu coba lagi.',
      };
    }
    return { ok: false, error: 'Terjadi kesalahan saat mengunduh berkas PDF.' };
  } finally {
    isDownloading = false;
  }
};
