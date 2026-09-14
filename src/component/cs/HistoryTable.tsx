import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TaskSession } from '../../type/csType';

interface HistoryTableProps {
  items: TaskSession[];
  getItemModule: (item: any) => string;
  getItemSoNo: (item: any) => string;
  getItemProduct: (item: any) => string;
  getItemJobDesc: (item: any) => string;
  getItemSizeClass: (item: any) => string;
  getItemStartTime: (item: any) => any;
  getItemEndTime: (item: any) => any;
  getItemQty: (item: any) => number | string;
  formatTimeRange: (startStr?: string | null, endStr?: string | null) => string;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  items,
  getItemModule,
  getItemSoNo,
  getItemProduct,
  getItemJobDesc,
  getItemSizeClass,
  getItemStartTime,
  getItemEndTime,
  getItemQty,
  formatTimeRange,
}) => (
  <View style={styles.tableCard}>
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.th, { width: 120 }]}>MODUL</Text>
          <Text style={[styles.th, { width: 160 }]}>NO. SO</Text>
          <Text style={[styles.th, { width: 140 }]}>PRODUK</Text>
          <Text style={[styles.th, { width: 150 }]}>JOB DESC</Text>
          <Text style={[styles.th, { width: 160 }]}>UKURAN / KELAS</Text>
          <Text style={[styles.th, { width: 200 }]}>WAKTU</Text>
          <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>QTY (PCS)</Text>
        </View>

        {items.map((item: any, idx) => (
          <View key={item.id ? `${item.id}_${idx}` : `history_${idx}`} style={styles.tableDataRow}>
            <Text style={[styles.td, styles.tdBold, { width: 120 }]}>{getItemModule(item)}</Text>
            <Text style={[styles.td, styles.tdBold, { width: 160 }]}>{getItemSoNo(item)}</Text>
            <Text style={[styles.td, { width: 140 }]}>{getItemProduct(item)}</Text>
            <Text style={[styles.td, { width: 150 }]}>{getItemJobDesc(item)}</Text>
            <Text style={[styles.td, { width: 160 }]}>{getItemSizeClass(item)}</Text>
            <Text style={[styles.td, { width: 200, color: '#4B5563' }]}>
              {formatTimeRange(getItemStartTime(item), getItemEndTime(item))}
            </Text>
            <Text style={[styles.td, styles.tdBold, { width: 90, textAlign: 'right' }]}>{getItemQty(item)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 14, paddingHorizontal: 16 },
  th: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.3 },
  tableDataRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center', backgroundColor: '#FFFFFF' },
  td: { fontSize: 13, color: '#374151' },
  tdBold: { fontWeight: '700', color: '#111827' },
});