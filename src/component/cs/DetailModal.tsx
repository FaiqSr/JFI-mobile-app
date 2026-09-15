import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskSession, WorkQueueSession, formatDateTime, translateStatus } from '../../type/csType';

interface CsDetailModalProps {
  visible: boolean;
  selectedDetail: TaskSession | null;
  onClose: () => void;
  onOpenPdf: (item: TaskSession | null) => void;
  isPekerjaanTerbuka: boolean;
}

export const CsDetailModal: React.FC<CsDetailModalProps> = ({
  visible,
  selectedDetail,
  onClose,
  onOpenPdf,
  isPekerjaanTerbuka,
}) => {
  if (!selectedDetail) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalModuleName}>
              {(selectedDetail.component_module || 'RING 1').replace('_', ' ').toUpperCase()}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalWoText}>{selectedDetail.wo_no || '-'}</Text>

          <View style={styles.statusBadgeYellowModal}>
            <Text style={styles.statusBadgeYellowText}>
              {translateStatus(selectedDetail.status)}
            </Text>
          </View>

          <View style={styles.modalDivider} />

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nomor SO</Text>
              <Text style={styles.detailValueBold}>{selectedDetail.so_no || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nomor CS</Text>
              <Text style={styles.detailValueBold}>{selectedDetail.slip_no || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValueCustomer} numberOfLines={2}>
                {selectedDetail.customer || '-'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ukuran</Text>
              <Text style={styles.detailValueBold}>{selectedDetail.size || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Class</Text>
              <Text style={styles.detailValueBold}>{selectedDetail.class || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cert No. Material</Text>
              <Text style={styles.detailValueBold}>{selectedDetail.cert_no_material || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal Dibuat</Text>
              <Text style={styles.detailValueBold}>
                {formatDateTime(selectedDetail.created_at)}
              </Text>
            </View>

            <View style={styles.detailRowNoBorder}>
              <Text style={styles.detailLabel}>Dokumen</Text>
              <Text style={styles.detailValueBold} numberOfLines={1}>
                {selectedDetail.cs_file_name || '-'}
              </Text>
            </View>

            {!isPekerjaanTerbuka && (
              <>
                <Text style={styles.sectionSubHeader}>SESI KERJA</Text>
                {Array.isArray(selectedDetail.worker_sessions) && selectedDetail.worker_sessions.length > 0 ? (
                  selectedDetail.worker_sessions.map((sesi: WorkQueueSession) => (
                    <View key={sesi.id} style={styles.sesiCard}>
                      <View style={styles.sesiCardHeader}>
                        <Text style={styles.sesiQtyText}>Qty: {sesi.actual_qty ?? 0}</Text>
                        <View style={styles.statusBadgeGrey}>
                          <Text style={styles.statusBadgeGreyText}>
                            {translateStatus(sesi.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.sesiTimeText}>
                        Mulai: {formatDateTime(sesi.started_at)} · Selesai:{' '}
                        {formatDateTime(sesi.ended_at)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.sesiCard}>
                    <View style={styles.sesiCardHeader}>
                      <Text style={styles.sesiQtyText}>Qty: 0</Text>
                      <View style={styles.statusBadgeGrey}>
                        <Text style={styles.statusBadgeGreyText}>MENUNGGU</Text>
                      </View>
                    </View>
                    <Text style={styles.sesiTimeText}>-</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.pdfBtn} onPress={() => onOpenPdf(selectedDetail)}>
            <Text style={styles.pdfBtnText}>Lihat CS (PDF)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalModuleName: { fontSize: 12,  fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
  closeBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14 },
  closeBtnText: { fontSize: 12,  fontWeight: 'bold', color: '#334155' },
  modalWoText: { fontSize: 18,  fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  statusBadgeYellowModal: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusBadgeYellowText: { color: '#D97706', fontSize: 11,  fontWeight: '800' },
  modalDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 8 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailRowNoBorder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  detailLabel: { fontSize: 13,  color: '#94A3B8' },
  detailValueBold: { fontSize: 13,  fontWeight: '700', color: '#0F172A', textAlign: 'right' },
  detailValueCustomer: { fontSize: 13,  fontWeight: '800', color: '#0F172A', textAlign: 'right', maxWidth: 200, lineHeight: 18 },
  sectionSubHeader: { fontSize: 11,  fontWeight: 'bold', color: '#94A3B8', marginTop: 16, marginBottom: 10 },
  sesiCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 12 },
  sesiCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sesiQtyText: { fontSize: 13,  fontWeight: 'bold', color: '#0F172A' },
  statusBadgeGrey: { backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusBadgeGreyText: { fontSize: 10,  fontWeight: 'bold', color: '#475569' },
  sesiTimeText: { fontSize: 12,  color: '#64748B' },
  pdfBtn: { backgroundColor: '#111827', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  pdfBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});