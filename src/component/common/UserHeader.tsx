import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Alert } from '../../utils/appAlert';

interface UserHeaderProps {
  userName?: string;
  onLogout?: () => void;
}

/**
 * Header bersama: badge nama pengguna + tombol "Keluar" (dengan konfirmasi).
 * Dirancang untuk diletakkan di dalam ScrollView agar ikut ter-scroll.
 */
export const UserHeader = ({ userName = '', onLogout }: UserHeaderProps) => {
  const handleLogoutPress = () => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={styles.headerBar}>
      <View style={styles.userBadge}>
        <Text style={styles.userBadgeText}>{userName}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
        <Text style={styles.logoutBtnText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  logoutBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    
    fontWeight: '600',
    fontSize: 14,
  },
});
