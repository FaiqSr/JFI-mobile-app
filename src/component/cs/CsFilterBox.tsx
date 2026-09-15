import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Path, Rect } from 'react-native-svg';

export type DatePresetType = 'Hari Ini' | 'Seminggu Terakhir' | 'Sebulan Terakhir' | 'Semua' | 'Kustom';

interface CsFilterBoxProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  datePreset: DatePresetType;
  startDate: Date | null;
  endDate: Date | null;
  onSelectPreset: (preset: DatePresetType) => void;
  onSelectCustomDate: (type: 'start' | 'end', date: Date) => void;
  onResetFilter: () => void;
  isFilterActive: boolean;
}

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

export const CsFilterBox: React.FC<CsFilterBoxProps> = ({
  searchQuery,
  setSearchQuery,
  datePreset,
  startDate,
  endDate,
  onSelectPreset,
  onSelectCustomDate,
  onResetFilter,
  isFilterActive,
}) => {
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const formatDateLabel = (date: Date | null) => {
    if (!date) return 'yyyy-mm-dd';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const presets: { label: string; value: DatePresetType }[] = [
    { label: 'Hari Ini', value: 'Hari Ini' },
    { label: 'Seminggu', value: 'Seminggu Terakhir' },
    { label: 'Sebulan', value: 'Sebulan Terakhir' },
  ];

  return (
    <View style={styles.container}>
 
      <View style={styles.searchWrapper}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nomor WO / SO / CS..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.presetsRow}>
        {presets.map((item) => {
          const isActive = datePreset === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[styles.presetBtn, isActive && styles.presetBtnActive]}
              onPress={() => onSelectPreset(item.value)}
            >
              <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateGroup}>
          <Text style={styles.dateLabel}>Dari</Text>
          <TouchableOpacity
            style={styles.dateInputBtn}
            onPress={() => setShowPicker('start')}
          >
            <Text style={[styles.dateText, startDate && styles.dateTextSelected]}>
              {formatDateLabel(startDate)}
            </Text>
            <CalendarIcon />
          </TouchableOpacity>
        </View>

        <Text style={styles.rangeSeparator}>s/d</Text>

        <View style={styles.dateGroup}>
          <Text style={styles.dateLabel}>Sampai</Text>
          <TouchableOpacity
            style={styles.dateInputBtn}
            onPress={() => setShowPicker('end')}
          >
            <Text style={[styles.dateText, endDate && styles.dateTextSelected]}>
              {formatDateLabel(endDate)}
            </Text>
            <CalendarIcon />
          </TouchableOpacity>
        </View>
      </View>

      {isFilterActive && (
        <TouchableOpacity style={styles.resetBtn} onPress={onResetFilter}>
          <Text style={styles.resetText}>Hapus Filter</Text>
        </TouchableOpacity>
      )}

      {showPicker && (
        <DateTimePicker
          value={(showPicker === 'start' ? startDate : endDate) || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onValueChange={(_event, selectedDate) => {
            if (Platform.OS !== 'ios') setShowPicker(null);
            if (selectedDate) {
              onSelectCustomDate(showPicker, selectedDate);
            }
          }}
          onDismiss={() => setShowPicker(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  presetsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  presetBtnActive: {
    backgroundColor: '#0F172A',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  dateInputBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  dateTextSelected: {
    color: '#0F172A',
    fontWeight: '600',
  },
  rangeSeparator: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 16,
  },
  resetBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  resetText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});