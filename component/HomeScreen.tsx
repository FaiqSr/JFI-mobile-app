import React from 'react';
import { View, Text, Image, BackHandler, StyleSheet, ScrollView } from 'react-native';
import { MenuButton } from './ButtonMenu';

interface HomeScreenProps {
  onNavigate: (screenName: 'HOME' | 'RING_1' | 'RING_2' | 'RING_3' | 'SEALING_ELEMENT' | 'DOUBLE_JACKETED') => void;
}

export const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logoapps.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>WORK SHEET</Text>
      </View>
      
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>

      <View style={styles.menuContainer}>
        <MenuButton title="RING 1" onPress={() => onNavigate('RING_1')} />
        <MenuButton title="RING 2" onPress={() => onNavigate('RING_2')} />
        <MenuButton title="RING 3" onPress={() => onNavigate('RING_3')} />
        <MenuButton title="SEALING ELEMENT" onPress={() => onNavigate('SEALING_ELEMENT')} />
        <MenuButton title="DOUBLE JACKETED GASKET" onPress={() => onNavigate('DOUBLE_JACKETED')} />
        <MenuButton title="EXIT" onPress={() => BackHandler.exitApp()} isExit />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
  },
  logoContainer: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 20,
  },
  badgeText: {
    color: '#101828',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#98A2B3',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginHorizontal: 12,
  },
  menuContainer: {
    width: '100%',
  },
});