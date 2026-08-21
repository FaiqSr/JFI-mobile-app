import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomInput } from './CustomInput';

interface FormInformationProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted: string;
  setJobNoted: (v: string) => void;
}

export const FormInformation: React.FC<FormInformationProps> = ({
  namaOperator,
  setNamaOperator,
  nomorSO,
  setNomorSO,
  jobDescription,
  setJobDescription,
  jobNoted,
  setJobNoted,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Information</Text>

      <CustomInput
        label="Operator Name"
        placeholder="Enter operator name"
        value={namaOperator}
        onChangeText={setNamaOperator}
      />

      <CustomInput
        label="SO Number"
        placeholder="Enter SO number"
        value={nomorSO}
        onChangeText={setNomorSO}
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Job Description"
            placeholder="Description"
            value={jobDescription}
            onChangeText={setJobDescription}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Job Noted"
            placeholder="Notes"
            value={jobNoted}
            onChangeText={setJobNoted}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAECF0' },
  cardTitle: { fontSize: 18, fontFamily: 'Hanuman', color: '#101828', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
});