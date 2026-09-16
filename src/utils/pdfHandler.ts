import * as FileSystem from 'expo-file-system/legacy';
import { CS_BASE_URL } from '../api/apiConfig';
import { authService } from '../api/authService';
import {
  buildCsPdfUrl,
  csPdfCacheFileName,
  isCsPdfTaskId,
  isNonPdfBody,
} from './csPdf';

export type CsPdfFileResult =
  | { ok: true; uri: string }
  | { ok: false; error: string; unauthorized?: boolean };

let isDownloading = false;

/**
 * Downloads the original CS/SO PDF of a task into the app cache and returns its
 * local `file://` uri. The caller (`CsPdfModalHost`) renders it in-app — nothing
 * is ever handed to the OS share sheet again.
 *
 * Guards, in order: valid task id, no concurrent download, token present,
 * one refresh+retry on 401, non-200 reported as an Indonesian message, and a
 * body that is not `%PDF-` rejected and deleted. Any pre-existing file at the
 * target path is removed before downloading, so a stale document can never be
 * opened as the current task's CS.
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

    const deleteLocal = () => FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    await deleteLocal();

    const doDownload = (authToken: string) =>
      FileSystem.downloadAsync(url, localUri, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/pdf',
        },
      });

    let result = await doDownload(token);

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
      result = await doDownload(newToken);
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

    // A 200 whose body is HTML/JSON must never be shown as the CS.
    const head = await FileSystem.readAsStringAsync(result.uri, {
      encoding: 'utf8',
      position: 0,
      length: 5,
    }).catch(() => '');

    if (isNonPdfBody(head)) {
      await deleteLocal();
      console.error(`❌ [PDF Error] Berkas bukan PDF (head: ${JSON.stringify(head)}) Task ID ${taskId}`);
      return {
        ok: false,
        error: 'Berkas dari server bukan PDF. Dokumen CS tidak valid — hubungi admin.',
      };
    }

    return { ok: true, uri: result.uri };
  } catch (error: any) {
    console.error('❌ Error download PDF:', error?.message || error);
    return { ok: false, error: 'Terjadi kesalahan saat mengunduh berkas PDF.' };
  } finally {
    isDownloading = false;
  }
};
