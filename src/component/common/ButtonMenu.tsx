import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';

interface MenuButtonProps {
  title: string;
  onPress: () => void;
  isExit?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ title, onPress, isExit }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isExit ? styles.exitButton : styles.whiteButton]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isExit ? styles.exitText : styles.whiteText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  whiteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exitButton: {
    backgroundColor: '#C00000',
    marginTop: 4,
  },
  text: {
    fontSize: RFValue(14), 
    fontWeight: 'bold',
  },
  whiteText: {
    color: '#101828',
  },
  exitText: {
    color: '#FFFFFF',
  },
});