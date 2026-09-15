import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Alert } from '../utils/appAlert';
import { downloadAndOpenCsPdf, generateCsWorkOrderPDF } from '../utils/pdfHandler';
import { TaskSession } from '../type/csType';
import { TaskCard } from '../component/cs/TaskCard';
import { CsFilterBox, DatePresetType } from '../component/cs/CsFilterBox';
import { CsDetailModal } from '../component/cs/DetailModal';
import { SessionTable } from '../component/cs/SessionTable';
import { HistoryTable } from '../component/cs/HistoryTable';
import { TaskCardSkeleton, SessionTableSkeleton, HistoryTableSkeleton } from '../component/cs/CsSkeleton';
import { UserHeader } from '../component/common/UserHeader';
import { useCsData } from '../hooks/useCsData';

import {
  getItemWoNo,
  getItemSoNo,
  getItemCsNo,
  getItemModule,
  getItemStatus,
  getItemQty,
  getItemProduct,
  getItemJobDesc,
  getItemSizeClass,
  getItemStartTime,
  getItemEndTime,
  formatDate,
  formatTimeRange,
} from '../utils/csHelpers';

const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extractWorkDateString = (item: any): string => {
  if (!item) return '';
  const dateVal =
    item.work_date ||
    item.workDate ||
    item.created_at ||
    item.createdAt ||
    item.start_time ||
    item.startTime ||
    item.date;

  if (!dateVal) return '';

  if (typeof dateVal === 'string') {
    return dateVal.slice(0, 10);
  }
  if (dateVal instanceof Date) {
    return getLocalDateString(dateVal);
  }
  return '';
};

export const CsScreen: React.FC<{
  onBack: () => void;
  onSelectTask?: (task: TaskSession) => void;
  onLogout?: () => void;
  userToken: string;
  userName?: string;
}> = ({ onBack, onLogout, onSelectTask, userToken, userName }) => {
  const [mainTab, setMainTab] = useState<'Pekerjaan Terbuka' | 'Sesi Saya' | 'Riwayat Pencatatan'>('Pekerjaan Terbuka');
  const [subTab, setSubTab] = useState<'Semua' | 'Ring' | 'SE' | 'DJG'>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [datePreset, setDatePreset] = useState<DatePresetType>('Semua');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<TaskSession | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const { openTasks, sessions, history, loading, refreshing, fetchAllData } =
    useCsData(userToken);

  const displayName = userName || 'Operator';

  const toggleExpand = (id: string | number) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setDatePreset('Semua');
    setStartDate(null);
    setEndDate(null);
  };

  const handleSelectPreset = (preset: DatePresetType) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'Hari Ini') {
      setStartDate(now);
      setEndDate(now);
    } else if (preset === 'Seminggu Terakhir') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      setStartDate(start);
      setEndDate(now);
    } else if (preset === 'Sebulan Terakhir') {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      setStartDate(start);
      setEndDate(now);
    } else if (preset === 'Semua') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const currentFilteredList = useMemo(() => {
    let sourceData = mainTab === 'Pekerjaan Terbuka' ? openTasks : mainTab === 'Sesi Saya' ? sessions : history;

    if (subTab !== 'Semua') {
      sourceData = sourceData.filter((item: any) => getItemModule(item).includes(subTab.toUpperCase()));
    }

    if (mainTab !== 'Pekerjaan Terbuka') {
      sourceData = sourceData.filter((item: any) => {
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matches = [
            getItemWoNo(item),
            getItemSoNo(item),
            getItemCsNo(item),
            getItemProduct(item),
            getItemJobDesc(item),
          ].some((val) => String(val || '').toLowerCase().includes(q));

          if (!matches) return false;
        }

        if (datePreset !== 'Semua') {
          const itemDateStr = extractWorkDateString(item);

          if (!itemDateStr) return false;

          if (startDate) {
            const startStr = getLocalDateString(startDate);
            if (itemDateStr < startStr) return false;
          }

          if (endDate) {
            const endStr = getLocalDateString(endDate);
            if (itemDateStr > endStr) return false;
          }
        }

        return true;
      });
    }

    return sourceData;
  }, [mainTab, subTab, openTasks, sessions, history, searchQuery, datePreset, startDate, endDate]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAllData(true)} colors={['#0F172A']} />}
      >
        <UserHeader userName={displayName} onLogout={onLogout} />

        <View style={styles.headerSection}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Pekerjaan CS/SO</Text>
          <Text style={styles.pageSubtitle}>
            Kerjakan CS yang sedang berjalan. Anda memilih sendiri produk dan job desk saat merekam hasil.
          </Text>
        </View>

        <View style={styles.mainTabWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['Pekerjaan Terbuka', 'Sesi Saya', 'Riwayat Pencatatan'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.mainTabPill, mainTab === tab && styles.mainTabPillActive]}
                onPress={() => setMainTab(tab)}
              >
                <Text style={[styles.mainTabText, mainTab === tab && styles.mainTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {mainTab !== 'Riwayat Pencatatan' && (
          <View style={styles.filterContainer}>
            {(['Semua', 'Ring', 'SE', 'DJG'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSubTab(tab)}
                style={[styles.filterTab, subTab === tab && styles.filterTabActive]}
              >
                <Text style={[styles.filterTabText, subTab === tab && styles.filterTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading ? (
          <View style={styles.sectionContainer}>
            {mainTab === 'Pekerjaan Terbuka' ? (
              <TaskCardSkeleton />
            ) : mainTab === 'Sesi Saya' ? (
              <SessionTableSkeleton />
            ) : (
              <HistoryTableSkeleton />
            )}
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{mainTab}</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{currentFilteredList.length}</Text>
              </View>
            </View>

            {mainTab !== 'Pekerjaan Terbuka' && (
              <CsFilterBox
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                datePreset={datePreset}
                startDate={startDate}
                endDate={endDate}
                onSelectPreset={handleSelectPreset}
                onSelectCustomDate={(type, date) => {
                  setDatePreset('Kustom');
                  type === 'start' ? setStartDate(date) : setEndDate(date);
                }}
                onResetFilter={handleResetFilter}
                isFilterActive={searchQuery.trim() !== '' || datePreset !== 'Semua' || startDate !== null}
              />
            )}

            {currentFilteredList.length === 0 ? (
              <View style={styles.emptyDashedBox}>
                <Text style={styles.emptyText}>Tidak ada data.</Text>
              </View>
            ) : mainTab === 'Sesi Saya' ? (
              <SessionTable
                items={currentFilteredList}
                onOpenDetail={(detail) => {
                  setSelectedDetail(detail);
                  setIsModalVisible(true);
                }}
                getItemStartTime={getItemStartTime}
                getItemEndTime={getItemEndTime}
                getItemWoNo={getItemWoNo}
                getItemSoNo={getItemSoNo}
                getItemCsNo={getItemCsNo}
                getItemModule={getItemModule}
                getItemQty={getItemQty}
                getItemStatus={getItemStatus}
                formatDate={formatDate}
              />
            ) : mainTab === 'Riwayat Pencatatan' ? (
              <HistoryTable
                items={currentFilteredList}
                getItemModule={getItemModule}
                getItemSoNo={getItemSoNo}
                getItemProduct={getItemProduct}
                getItemJobDesc={getItemJobDesc}
                getItemSizeClass={getItemSizeClass}
                getItemStartTime={getItemStartTime}
                getItemEndTime={getItemEndTime}
                getItemQty={getItemQty}
                formatTimeRange={formatTimeRange}
              />
            ) : (
              currentFilteredList.map((item: any, idx: number) => {
                const itemId = item.id ? `${item.id}_${idx}` : `item_${idx}`;
                return (
                  <TaskCard
                    key={itemId}
                    item={item}
                    isSession={false}
                    isExpanded={!!expandedItems[itemId]}
                    onToggleExpand={() => toggleExpand(itemId)}
                    onOpenDetail={(detail) => {
                      setSelectedDetail(detail);
                      setIsModalVisible(true);
                    }}
                    onStartTask={(task) =>
                      onSelectTask ? onSelectTask(task) : Alert.alert('Kerjakan Task', `Mulai ${getItemWoNo(task)}`)
                    }
                  />
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      <CsDetailModal
        visible={isModalVisible}
        selectedDetail={selectedDetail}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedDetail(null);
        }}
        onOpenPdf={(item: any) => {
          if (!item) return;
          item.id ? downloadAndOpenCsPdf(item.id, userToken) : generateCsWorkOrderPDF(item);
        }}
        isPekerjaanTerbuka={mainTab === 'Pekerjaan Terbuka'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 16, maxWidth: 960, width: '100%', alignSelf: 'center' },
  headerSection: { marginBottom: 20 },
  backBtn: { marginBottom: 8, alignSelf: 'flex-start' },
  backText: { color: '#64748B', fontSize: 13,  fontWeight: '600' },
  pageTitle: { fontSize: 28,  fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  pageSubtitle: { fontSize: 13,  color: '#64748B', lineHeight: 20 },
  mainTabWrapper: { backgroundColor: '#EEF2F6', borderRadius: 12, padding: 4, marginBottom: 16 },
  mainTabPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  mainTabPillActive: { backgroundColor: '#FFFFFF', elevation: 1 },
  mainTabText: { fontSize: 13,  color: '#64748B', fontWeight: '600' },
  mainTabTextActive: { color: '#0F172A', fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 20 },
  filterTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  filterTabActive: { backgroundColor: '#FFFFFF', elevation: 1 },
  filterTabText: { fontSize: 13,  fontWeight: '600', color: '#64748B' },
  filterTabTextActive: { color: '#0F172A', fontWeight: 'bold' },
  sectionContainer: { width: '100%' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18,  fontWeight: 'bold', color: '#0F172A', marginRight: 8 },
  badgeCount: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 6 },
  badgeCountText: { fontSize: 12,  fontWeight: 'bold', color: '#475569' },
  emptyDashedBox: { borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 32, alignItems: 'center', backgroundColor: '#FFFFFF' },
  emptyText: { color: '#94A3B8', fontSize: 13 },
});