import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, TurboModuleRegistry, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CsPdfRequest, closeCsPdfViewer, subscribeToCsPdf } from '../../utils/csPdf';
import { downloadCsPdfFile } from '../../utils/pdfHandler';

/**
 * `react-native-pdf` is a NATIVE module whose entry imports
 * `react-native-blob-util`, and that package throws from MODULE SCOPE when the
 * native side is absent (`utils/nativeModule.js` → "the native module is not
 * available"). A static import here would therefore kill the whole JS runtime on
 * any build that predates the module — or on an Expo Update pushed to such a
 * build: the app would not even boot. It is loaded lazily below and the modal
 * degrades to an Indonesian "update the app" message instead.
 */
interface CsPdfViewProps {
  source: { uri: string };
  style?: unknown;
  trustAllCerts?: boolean;
  onLoadComplete?: (numberOfPages: number) => void;
  onPageChanged?: (page: number, numberOfPages: number) => void;
  onError?: (error: unknown) => void;
}

const NATIVE_PDF_MISSING =
  'Penampil PDF belum tersedia di versi aplikasi ini. Pasang build aplikasi terbaru, lalu buka lagi dokumen CS.';

/** PDFium must report a loaded document within this window; otherwise the modal
 *  would sit on a spinner with no explanation of what stalled. */
const RENDER_TIMEOUT_MS = 20_000;

interface ViewerState {
  loading: boolean;
  error: string | null;
  uri: string | null;
}

const EMPTY: ViewerState = { loading: false, error: null, uri: null };

/**
 * Renders the original CS/SO PDF of the task opened via `openCsPdfViewer()` in a
 * full-screen modal — the mobile equivalent of the dashboard's PDF preview
 * overlay. Mounted once, as a sibling of <App /> in `index.js`, so it survives
 * App's loading / login / logged-in early returns.
 */
export const CsPdfModalHost: React.FC = () => {
  const [request, setRequest] = useState<CsPdfRequest | null>(null);
  const [state, setState] = useState<ViewerState>(EMPTY);
  const [pageInfo, setPageInfo] = useState<{ page: number; total: number }>({ page: 1, total: 0 });
  /** Task id whose file is already in the modal — reopening must not re-download. */
  const loadedTaskRef = useRef<number | null>(null);
  /** `null` until the native PDF component loaded (or failed to load). */
  const [PdfView, setPdfView] = useState<React.ComponentType<CsPdfViewProps> | null>(null);
  const [nativePdfMissing, setNativePdfMissing] = useState(false);
  /** `true` once the native view reported a loaded document. */
  const [rendered, setRendered] = useState(false);

  useEffect(() => subscribeToCsPdf(setRequest), []);

  // Dynamic import: on a build without the native module this must show a message
  // instead of crashing the runtime at startup (see the note on CsPdfViewProps).
  // The probe runs FIRST, so a build without native PDF support never evaluates
  // `react-native-pdf` / `react-native-blob-util` at all — importing them on such
  // a build prints the package's own uncaught ERROR
  // ("react-native-blob-util: the native module is not available…") to the device
  // log, and `react-native-pdf` reads `ReactNativeBlobUtil.fs.dirs.CacheDir` for
  // EVERY source (even a local file:// uri) — a read that throws inside an async
  // helper, so it never reaches `onError` and only the watchdog would reply.
  // Probing the exact module the viewer needs is what makes the honest Indonesian
  // message instant instead of a "Membuka CS..." spinner that cannot end.
  useEffect(() => {
    if (!TurboModuleRegistry.get('ReactNativeBlobUtil')) {
      console.warn('[PDF] penampil PDF native tidak tersedia di build ini');
      setNativePdfMissing(true);
      return;
    }

    let cancelled = false;
    import('react-native-pdf')
      .then((mod) => {
        if (cancelled) return;
        const Loaded = (mod as unknown as { default: React.ComponentType<CsPdfViewProps> }).default;
        setPdfView(() => Loaded);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('[PDF] react-native-pdf tidak bisa dimuat:', (error as Error)?.message);
        setNativePdfMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Watchdog over the native render phase: a PDFium load that never reports (and
  // never errors) must not be indistinguishable from an endless spinner.
  useEffect(() => {
    if (!state.uri || !PdfView || rendered || state.error) return;
    console.warn(`[PDF] render mulai uri=${state.uri}`);
    const timer = setTimeout(() => {
      console.warn(`[PDF] render timeout setelah ${RENDER_TIMEOUT_MS} ms uri=${state.uri}`);
      setState({
        loading: false,
        uri: null,
        error: 'Dokumen CS tidak bisa ditampilkan di perangkat ini. Perbarui aplikasi lalu coba lagi.',
      });
    }, RENDER_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state.uri, state.error, PdfView, rendered]);

  useEffect(() => {
    if (!request) {
      loadedTaskRef.current = null;
      setState(EMPTY);
      setRendered(false);
      setPageInfo({ page: 1, total: 0 });
      return;
    }
    if (loadedTaskRef.current === request.taskId) return;
    loadedTaskRef.current = request.taskId;
    setState({ loading: true, error: null, uri: null });
    setRendered(false);

    let cancelled = false;
    (async () => {
      const token = (await AsyncStorage.getItem('userToken')) || '';
      const res = await downloadCsPdfFile(request.taskId, token);
      if (cancelled) return;
      if (res.ok) {
        setState({ loading: false, error: null, uri: res.uri });
      } else {
        setState({ loading: false, error: res.error, uri: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [request]);

  if (!request) return null;

  const retry = () => {
    const current = request;
    loadedTaskRef.current = null;
    setState({ loading: true, error: null, uri: null });
    setRendered(false);
    setRequest({ ...current, id: current.id + 1 });
  };

  return (
    <Modal
      visible
      animationType="fade"
      onRequestClose={closeCsPdfViewer}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Dokumen CS / SO
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {request.fileLabel || `Pekerjaan #${request.taskId}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.8}
            onPress={closeCsPdfViewer}
          >
            <Text style={styles.closeText}>Tutup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {nativePdfMissing ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{NATIVE_PDF_MISSING}</Text>
            </View>
          ) : state.loading || (!!state.uri && !PdfView) ? (
            <View style={styles.centered}>
              <ActivityIndicator color="#0F172A" />
              <Text style={styles.hintText}>Membuka CS...</Text>
            </View>
          ) : state.error ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{state.error}</Text>
              <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85} onPress={retry}>
                <Text style={styles.retryText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : state.uri && PdfView ? (
            <PdfView
              source={{ uri: state.uri }}
              style={styles.pdf}
              trustAllCerts={false}
              onLoadComplete={(total) => {
                console.warn(`[PDF] loadComplete halaman=${total} uri=${state.uri}`);
                setRendered(true);
                setPageInfo({ page: 1, total });
              }}
              onPageChanged={(page, total) => setPageInfo({ page, total })}
              onError={(error) => {
                console.warn('[PDF] view error:', String(error));
                setState({
                  loading: false,
                  uri: null,
                  error: 'Gagal menampilkan berkas PDF. Coba lagi.',
                });
              }}
            />
          ) : null}
        </View>

        {!!state.uri && !nativePdfMissing && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Halaman {pageInfo.page} dari {pageInfo.total || 1}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: RFValue(10),
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTextWrap: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: RFValue(13), fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: RFValue(11), color: '#94A3B8', marginTop: RFValue(2) },
  closeBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: RFValue(16), paddingVertical: RFValue(6), borderRadius: RFValue(14) },
  closeText: { fontSize: RFValue(12), fontWeight: 'bold', color: '#334155' },
  body: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: RFValue(24), gap: RFValue(12) },
  hintText: { fontSize: RFValue(12), color: '#64748B' },
  errorText: { fontSize: RFValue(12), color: '#DC2626', textAlign: 'center' },
  retryBtn: { backgroundColor: '#0F172A', paddingHorizontal: RFValue(18), paddingVertical: RFValue(8), borderRadius: RFValue(16) },
  retryText: { color: '#FFFFFF', fontSize: RFValue(12), fontWeight: 'bold' },
  pdf: { flex: 1, width: '100%', backgroundColor: '#F8FAFC' },
  footer: { paddingVertical: RFValue(8), alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerText: { fontSize: RFValue(11), color: '#94A3B8' },
});
