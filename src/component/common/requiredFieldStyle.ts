import { TextStyle, ViewStyle } from 'react-native';

/**
 * Style penanda field WAJIB.
 *
 * Dipakai untuk menandai input yang harus diisi TANPA teks tambahan
 * (mis. tanpa tanda asterisk "*"): border lebih tebal + warna merah.
 * Terapkan ke input/dropdown lewat array style, mis:
 *   style={[styles.input, requiredFieldStyle]}
 *
 * Untuk field yang wajibnya KONDISIONAL (mis. "Noted" yang hanya wajib
 * bila kolom lain kosong), pasang secara bersyarat:
 *   style={[styles.input, normalFieldStyle, wajib && requiredFieldStyle]}
 */
export const requiredFieldStyle: ViewStyle & TextStyle = {
  borderWidth: 1.5,
  borderColor: '#D92D20',
};

/**
 * Border normal untuk field yang bisa berubah status wajib/tidak wajib.
 * Warna mengikuti border standar field lain (mis. Catatan Material),
 * dipakai bersama requiredFieldStyle agar border kembali normal saat
 * syarat wajib TIDAK terpenuhi / field sudah terisi.
 */
export const normalFieldStyle: ViewStyle & TextStyle = {
  borderWidth: 1,
  borderColor: '#EAECF0',
};
