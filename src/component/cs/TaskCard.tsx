import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TaskSession, translateStatus } from '../../type/csType';

interface TaskCardProps {
  item: TaskSession;
  isSession?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onOpenDetail: (item: TaskSession) => void;
  onStartTask?: (item: TaskSession) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  item,
  isSession = false,
  isExpanded = false,
  onToggleExpand,
  onOpenDetail,
  onStartTask,
}) => {
  const woNo = item.wo_no || '-';
  const soNo = item.so_no || '-';
  const csNo = item.slip_no || '-';
  const cust = item.customer || '-';
  const size = item.size;
  const cls = item.class;
  const moduleName = (item.component_module || 'RING 1').replace('_', ' ');
  const statusText = translateStatus(item.status);

  if (!isSession) {
    return (
      <View style={styles.card}>
        <Text style={styles.moduleName}>{moduleName.toUpperCase()}</Text>

        <View style={styles.cardContentRow}>

          <View style={styles.leftColumn}>
            <Text style={styles.woText}>{woNo}</Text>
            <Text style={styles.subText}>SO: {soNo}</Text>
            <Text style={styles.subText}>CS: {csNo}</Text>
            <Text style={styles.customerText} numberOfLines={1}>
              {cust}
            </Text>

            {(size || cls) && (
              <Text style={styles.specText}>
                {[size, cls].filter(Boolean).join(' / ')}
              </Text>
            )}
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.statusBadgeBlue}>
              <Text style={styles.statusBadgeBlueText}>{statusText}</Text>
            </View>

            <TouchableOpacity
              style={styles.btnKerjakan}
              onPress={() => onStartTask && onStartTask(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnKerjakanText}>Kerjakan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnDetail}
              onPress={() => onOpenDetail(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnDetailText}>Detail</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.woText}>{woNo}</Text>
          <Text style={styles.subText}>SO: {soNo}</Text>
          <Text style={styles.subText}>CS: {csNo}</Text>
          <Text style={styles.customerText} numberOfLines={1}>
            {cust}
          </Text>
          {(size || cls) && (
            <Text style={styles.specText}>
              {[size, cls].filter(Boolean).join(' / ')}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.arrowCircle}
          onPress={onToggleExpand}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowIcon}>{isExpanded ? '˅' : '›'}</Text>
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <>
          <View style={styles.divider} />
          <View style={styles.cardBody}>
            <View style={styles.bodyHeader}>
              <Text style={styles.moduleName}>{moduleName.toUpperCase()}</Text>
              <View style={styles.statusBadgeGreen}>
                <Text style={styles.statusBadgeGreenText}>{statusText}</Text>
              </View>
            </View>

            <Text style={styles.qtySesiText}>
              Qty Saya: {item.actual_qty ?? 0} · {item.worker_sessions?.length || 1} sesi
            </Text>

            <TouchableOpacity onPress={() => onOpenDetail(item)} style={styles.detailBtn}>
              <Text style={styles.detailBtnText}>Detail</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    paddingRight: 10,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  woText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  customerText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  specText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },

  statusBadgeBlue: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusBadgeBlueText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },

  btnKerjakan: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  btnKerjakanText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnDetail: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  btnDetailText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  arrowCircle: {
    backgroundColor: '#F1F5F9',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 14,
    color: '#64748B',
    marginTop: -2,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBody: {
    marginTop: 2,
  },
  bodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeGreen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeGreenText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  qtySesiText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
    fontWeight: '500',
  },
  detailBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
});