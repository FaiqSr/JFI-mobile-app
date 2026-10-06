import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Alert } from '../../utils/appAlert';
import { useTranslation } from '../../i18n';

interface UserHeaderProps {
  userName?: string;
  onLogout?: () => void;
  onOpenAbout?: () => void;
}

/**
 * Header bersama: badge nama pengguna + tombol titik tiga (⋯) yang membuka
 * dropdown berisi "Tentang Aplikasi" dan "Keluar". Dirancang untuk diletakkan
 * di dalam ScrollView agar ikut ter-scroll.
 */
export const UserHeader = ({
  userName = '',
  onLogout,
  onOpenAbout,
}: UserHeaderProps) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoutPress = () => {
    setMenuOpen(false);
    Alert.alert(t('common.confirm'), t('home.confirmLogout'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.logout'), style: 'destructive', onPress: onLogout },
    ]);
  };

  const handleAboutPress = () => {
    setMenuOpen(false);
    if (onOpenAbout) onOpenAbout();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerBar}>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>{userName}</Text>
        </View>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setMenuOpen((v) => !v)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.menuBtnText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleAboutPress}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownItemText}>{t('common.aboutApp')}</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownItemText, styles.dropdownItemDanger]}>
                {t('common.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  headerBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  userBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  userBadgeText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  menuBtn: {
    backgroundColor: '#0F172A',
    width: 44,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: -4,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 62,
    right: 0,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownItemDanger: {
    color: '#DC2626',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
});
