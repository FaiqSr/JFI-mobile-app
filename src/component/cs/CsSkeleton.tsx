import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';

/** Blok abu-abu yang berdenyut (fade 0.35 -> 1) — pengganti spinner saat initial load. */
const Pulse: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  return <Animated.View style={[{ opacity }, styles.pulse, style]} />;
};

const Bar: React.FC<{ width?: ViewStyle['width']; height?: number; style?: StyleProp<ViewStyle> }> = ({
  width,
  height = 12,
  style,
}) => <Pulse style={[{ width, height }, style]} />;

/** Skeleton daftar kartu tugas — meniru bentuk TaskCard. */
export const TaskCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.card}>
        <Bar width="25%" height={10} />
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Bar width="70%" height={14} style={{ marginBottom: 8 }} />
            <Bar width="55%" style={{ marginBottom: 6 }} />
            <Bar width="45%" style={{ marginBottom: 6 }} />
            <Bar width="60%" />
          </View>
          <View style={styles.cardRight}>
            <Bar width={90} height={20} style={{ borderRadius: 10, marginBottom: 10 }} />
            <Bar width={110} height={34} style={{ borderRadius: 10, marginBottom: 8 }} />
            <Bar width={110} height={30} style={{ borderRadius: 10 }} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

const TableSkeletonRow: React.FC<{ widths: number[] }> = ({ widths }) => (
  <View style={styles.tableDataRow}>
    {widths.map((w, i) => (
      <Bar key={i} width={w - 24} height={i === 0 || i === 1 ? 12 : 14} />
    ))}
  </View>
);

/** Skeleton tabel sesi — kolom sama dengan SessionTable. */
export const SessionTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <View style={styles.tableCard}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableHeaderRow}>
          {[145, 145, 195, 125, 125, 95, 55, 100, 70].map((w, i) => (
            <Bar key={i} width={w - 24} height={10} />
          ))}
        </View>
        {Array.from({ length: rows }).map((_, i) => (
          <TableSkeletonRow key={i} widths={[145, 145, 195, 125, 125, 95, 55, 100, 70]} />
        ))}
      </View>
    </ScrollView>
  </View>
);

/** Skeleton tabel riwayat — kolom sama dengan HistoryTable. */
export const HistoryTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <View style={styles.tableCard}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableHeaderRow}>
          {[120, 160, 140, 150, 160, 200, 90].map((w, i) => (
            <Bar key={i} width={w - 24} height={10} />
          ))}
        </View>
        {Array.from({ length: rows }).map((_, i) => (
          <TableSkeletonRow key={i} widths={[120, 160, 140, 150, 160, 200, 90]} />
        ))}
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  pulse: { backgroundColor: '#E2E8F0', borderRadius: 6 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cardLeft: { flex: 1, paddingRight: 16 },
  cardRight: { alignItems: 'flex-end', width: 120 },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
