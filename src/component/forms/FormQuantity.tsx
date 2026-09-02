import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface FormQuantityProps {
  finishGood: number;
  setFinishGood: (v: number) => void;
  parseIntegerInput: (text: string) => number;
}

export const FormQuantity: React.FC<FormQuantityProps> = ({
  finishGood,
  setFinishGood,
  parseIntegerInput,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Quantity</Text>

      <Text style={styles.label}>Finish Good</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#98A2B3"
        value={finishGood ? String(finishGood) : ''}
        onChangeText={(val) => setFinishGood(parseIntegerInput(val))}
      />
    </View>
  );
};

export default FormQuantity;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: RFValue(16),
    fontWeight: 'normal',
    fontFamily: 'Hanuman',
    color: '#101828',
    marginBottom: 14,
  },
  label: {
    fontSize: RFValue(12),
    fontWeight: '600',
    fontFamily: 'Hanuman',
    color: '#344054',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: RFValue(13),
    fontFamily: 'Hanuman',
    color: '#101828',
    backgroundColor: '#FFFFFF',
  },
});