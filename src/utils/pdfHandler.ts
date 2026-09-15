import { Alert } from './appAlert';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { TaskSession } from '../type/csType';

const API_BASE_URL = (process.env.EXPO_PUBLIC_CS_BASE_URL || '').replace(/\/+$/, '');

let isDownloading = false;

export const downloadAndOpenCsPdf = async (
  taskId: string | number,
  token: string
): Promise<void> => {
  if (!API_BASE_URL) {
    Alert.alert('Gagal', 'Konfigurasi URL belum diatur.');
    console.error('❌ [PDF Error] API_BASE_URL kosong.');
    return;
  }

  if (isDownloading) {
    console.warn('⚠️ [PDF Handler] Proses unduh sedang berjalan, mengabaikan request ganda.');
    return;
  }

  isDownloading = true;

  try {
    const downloadUrl = `${API_BASE_URL}/tasks/${taskId}/cs`;
    const fileName = `CS_WorkOrder_${taskId}.pdf`;
    const localUri = `${FileSystem.cacheDirectory}${fileName}`;

    console.log(`🌐 [PDF Request] Download dari: ${downloadUrl}`);

    const downloadResult = await FileSystem.downloadAsync(downloadUrl, localUri, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      },
    });

    console.log(`📡 [PDF Response] Status: ${downloadResult.status}`);

    if (downloadResult.status === 200) {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Buka Dokumen PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Informasi', 'Fitur membuka PDF tidak didukung di perangkat ini.');
      }
    } else {
      console.error(`❌ [PDF Error Status ${downloadResult.status}] Gagal unduh PDF Task ID: ${taskId}`);
      Alert.alert(
        'Dokumen Tidak Ditemukan',
        'File untuk pekerjaan belum tersedia.'
      );
    }
  } catch (error: any) {
    console.error('❌ Error download PDF:', error?.message || error);
    Alert.alert('Gagal', 'Terjadi kesalahan saat mengunduh berkas PDF.');
  } finally {
    isDownloading = false;
  }
};

export const generateCsWorkOrderPDF = async (item: TaskSession): Promise<void> => {
  if (isDownloading) return;
  isDownloading = true;

  try {
    const fileName = `CS_Summary_${item.wo_no || 'Draft'}.txt`;
    const localUri = `${FileSystem.cacheDirectory}${fileName}`;

    const content = `WORK ORDER / CS SUMMARY
========================================
No WO         : ${item.wo_no || '-'}
No SO         : ${item.so_no || '-'}
No Slip CS    : ${item.slip_no || '-'}
Customer      : ${item.customer || '-'}
Module        : ${item.component_module || '-'}
Ukuran / Class: ${item.size || '-'} / ${item.class || '-'}
Status        : ${item.status || '-'}
========================================
Generated on  : ${new Date().toLocaleString()}
`;

    await FileSystem.writeAsStringAsync(localUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(localUri, {
        dialogTitle: 'Buka Ringkasan CS',
      });
    } else {
      Alert.alert('Informasi', 'Fitur preview file tidak didukung di perangkat ini.');
    }
  } catch (error: any) {
    console.error('❌ Error generate PDF:', error?.message || error);
    Alert.alert('Gagal', 'Gagal membuat dokumen lokal.');
  } finally {
    isDownloading = false;
  }
};