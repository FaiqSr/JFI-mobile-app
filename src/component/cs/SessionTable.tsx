import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskSession } from '../../type/csType';

interface SessionTableProps {
  items: TaskSession[];
  onOpenDetail: (item: any) => void;
  getItemStartTime: (item: any) => any;
  getItemEndTime: (item: any) => any;
  getItemWoNo: (item: any) => string;
  getItemSoNo: (item: any) => string;
  getItemCsNo: (item: any) => string;
  getItemModule: (item: any) => string;
  getItemQty: (item: any) => number | string;
  getItemStatus: (item: any) => string;
  formatDate: (dateStr?: string | null) => string;
}

export const SessionTable: React.FC<SessionTableProps> = ({
  items,
  onOpenDetail,
  getItemStartTime,
  getItemEndTime,
  getItemWoNo,
  getItemSoNo,
  getItemCsNo,
  getItemModule,
  getItemQty,
  getItemStatus,
  formatDate,
}) => (
  <View style={styles.tableCard}>
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.th, { width: 145 }]}>MULAI</Text>
          <Text style={[styles.th, { width: 145 }]}>SELESAI</Text>
          <Text style={[styles.th, { width: 195 }]}>NO. WO</Text>
          <Text style={[styles.th, { width: 125 }]}>NO. SO</Text>
          <Text style={[styles.th, { width: 125 }]}>CS</Text>
          <Text style={[styles.th, { width: 95 }]}>MODUL</Text>
          <Text style={[styles.th, { width: 55, textAlign: 'center' }]}>QTY</Text>
          <Text style={[styles.th, { width: 100, textAlign: 'center' }]}>STATUS</Text>
          <Text style={[styles.th, { width: 70, textAlign: 'center' }]}>AKSI</Text>
        </View>

        {items.map((item: any, idx) => {
          const rawStatus = String(getItemStatus(item)).toUpperCase();
          const isSelesai = ['DONE', 'COMPLETED', 'SELESAI'].includes(rawStatus) || !!item?.ended_at || !!item?.completed_at;

          return (
            <View key={item.id ? `${item.id}_${idx}` : `session_${idx}`} style={styles.tableDataRow}>
              <Text style={[styles.td, { width: 145 }]}>{formatDate(getItemStartTime(item))}</Text>
              <Text style={[styles.td, { width: 145 }]}>{formatDate(getItemEndTime(item))}</Text>
              <Text style={[styles.td, styles.tdBold, { width: 195 }]}>{getItemWoNo(item)}</Text>
              <Text style={[styles.td, { width: 125 }]}>{getItemSoNo(item)}</Text>
              <Text style={[styles.td, { width: 125 }]}>{getItemCsNo(item)}</Text>
              <Text style={[styles.td, styles.tdBold, { width: 95 }]}>{getItemModule(item)}</Text>
              <Text style={[styles.td, { width: 55, textAlign: 'center', fontWeight: '500' }]}>{getItemQty(item)}</Text>
              <View style={{ width: 100, alignItems: 'center' }}>
                <View style={[styles.statusPill, isSelesai ? styles.statusSelesai : styles.statusAktif]}>
                  <Text style={[styles.statusText, isSelesai ? styles.statusSelesaiText : styles.statusAktifText]}>
                    {isSelesai ? 'SELESAI' : 'BERJALAN'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={{ width: 70, alignItems: 'center' }} onPress={() => onOpenDetail(item.parent_item || item)}>
                <Text style={styles.detailLink}>Detail</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 14, paddingHorizontal: 16 },
  th: { fontSize: 12,  fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.3 },
  tableDataRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center', backgroundColor: '#FFFFFF' },
  td: { fontSize: 13,  color: '#374151' },
  tdBold: { fontWeight: '700', color: '#111827' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusSelesai: { backgroundColor: '#D1FAE5' },
  statusSelesaiText: { color: '#059669' },
  statusAktif: { backgroundColor: '#FEF3C7' },
  statusAktifText: { color: '#D97706' },
  statusText: { fontWeight: '700', fontSize: 11,  letterSpacing: 0.3 },
  detailLink: { color: '#111827', fontWeight: '600', fontSize: 13,  textDecorationLine: 'underline' },
});