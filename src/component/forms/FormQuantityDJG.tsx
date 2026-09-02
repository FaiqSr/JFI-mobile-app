import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface FormQuantityDJGProps {
  finishGood: number;
  setFinishGood: (val: number) => void;
  rework: number;
  setRework: (val: number) => void;
  parseIntegerInput: (text: string) => number;
}

export const FormQuantityDJG: React.FC<FormQuantityDJGProps> = ({
  finishGood,
  setFinishGood,
  rework,
  setRework,
  parseIntegerInput,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Quantity</Text>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Finish Good</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#98A2B3"
            keyboardType="numeric"
            value={finishGood ? String(finishGood) : ''}
            onChangeText={(text) => setFinishGood(parseIntegerInput(text))}
          />
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>Rework</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#98A2B3"
            keyboardType="numeric"
            value={rework ? String(rework) : ''}
            onChangeText={(text) => setRework(parseIntegerInput(text))}
          />
        </View>
      </View>
    </View>
  );
};

export default FormQuantityDJG;

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  column: {
    flex: 1,
  },
});