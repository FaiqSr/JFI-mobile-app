import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

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
      <Text style={styles.inputLabel}>Finish Good</Text>
      <TextInput
        style={styles.textInput}
        keyboardType="number-pad"
        value={String(finishGood)}
        onChangeText={(v) => setFinishGood(parseIntegerInput(v))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Hanuman',
    color: '#101828',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Hanuman',
    color: '#344054',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Hanuman',
    color: '#101828',
  },
});