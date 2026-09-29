import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface FormMaterialGNMProps {
  materialNoted?: string;
  setMaterialNoted?: (v: string) => void;
}

export const FormMaterialGNM: React.FC<FormMaterialGNMProps> = ({
  materialNoted: externalMaterialNoted,
  setMaterialNoted: externalSetMaterialNoted,
}) => {
  const [internalMaterialNoted, setInternalMaterialNoted] = useState('');

  const materialNotedVal =
    externalMaterialNoted !== undefined
      ? externalMaterialNoted
      : internalMaterialNoted;

  const handleMaterialNotedChange = (text: string) => {
    if (externalSetMaterialNoted) externalSetMaterialNoted(text);
    setInternalMaterialNoted(text);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Material</Text>

      <Text style={styles.label}>MATERIAL NOTED</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter material noted"
        placeholderTextColor="#98A2B3"
        value={materialNotedVal}
        onChangeText={handleMaterialNotedChange}
      />
    </View>
  );
};

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
    fontWeight: '700',

    color: '#101828',
    marginBottom: 14,
  },
  label: {
    fontSize: RFValue(12),
    fontWeight: '600',
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

    color: '#101828',
    backgroundColor: '#FFFFFF',
  },
});
