import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ExtendedScreenType } from '../../App';
import { UserHeader } from '../component/common/UserHeader';

interface HomeScreenProps {
  userName?: string;
  onNavigate: (screen: ExtendedScreenType) => void;
  onLogout: () => void;
  activeScreen?: ExtendedScreenType | null;
}

/** The five production-area worksheets, in the plant's area order. */
const WORKSHEETS: { screen: ExtendedScreenType; label: string; badge: string }[] = [
  { screen: 'RING_1', label: 'Ring 1', badge: 'R1' },
  { screen: 'RING_2', label: 'Ring 2', badge: 'R2' },
  { screen: 'RING_3', label: 'Ring 3', badge: 'R3' },
  { screen: 'SEALING_ELEMENT', label: 'Sealing Element', badge: 'SE' },
  { screen: 'DOUBLE_JACKETED', label: 'Double Jacketed Gasket', badge: 'DJG' },
];

/**
 * Home screen: one worksheet entry per production area (Ring 1/2/3, Sealing
 * Element, Double Jacketed Gasket) plus the profile. Entry is flat data input —
 * there is no CS/SO task to pick first.
 */
export const HomeScreen = ({
  userName = '',
  onNavigate,
  onLogout,
  activeScreen,
}: HomeScreenProps) => {
  const isTaskActive = Boolean(
    activeScreen && activeScreen !== 'HOME' && activeScreen !== 'PROFIL'
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <UserHeader userName={userName} onLogout={onLogout} />

        <View style={styles.centerSection}>
          <Image
            source={require('../../assets/logoapps.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.worksheetBadge}>
            <Text style={styles.worksheetText}>WORK SHEET JFI</Text>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.yellowDot} />
            <View style={styles.dividerLine} />
          </View>
        </View>

        <View style={styles.menuContainer}>
          {WORKSHEETS.map((sheet) => (
            <TouchableOpacity
              key={sheet.screen}
              style={styles.cardBtn}
              onPress={() => onNavigate(sheet.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardLabel}>{sheet.label}</Text>
              <View style={[styles.badgeTag, styles.areaBadge]}>
                <Text style={styles.areaBadgeText}>{sheet.badge}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.cardBtn}
            onPress={() => onNavigate('PROFIL')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardLabel}>Profil Saya</Text>
            <View style={[styles.badgeTag, styles.akunBadge]}>
              <Text style={styles.akunBadgeText}>AKUN</Text>
            </View>
          </TouchableOpacity>
        </View>

        {isTaskActive && (
          <Text style={styles.activeHint}>
            Ada isian yang belum disimpan pada salah satu worksheet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  centerSection: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  worksheetBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  worksheetText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 1.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '65%',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  yellowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAB308',
    marginHorizontal: 8,
  },
  menuContainer: {
    width: '100%',
    gap: 16,
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  areaBadge: {
    backgroundColor: '#0F172A',
  },
  areaBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  akunBadge: {
    backgroundColor: '#E2E8F0',
  },
  akunBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  activeHint: {
    marginTop: 20,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
