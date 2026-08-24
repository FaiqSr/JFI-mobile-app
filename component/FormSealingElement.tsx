import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomInput } from './CustomInput';

interface FormSealingElementProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  hoop: string;
  setHoop: (v: string) => void;
  filler: string;
  setFiller: (v: string) => void;
  ir: string;
  setIr: (v: string) => void;
  orVal: string;
  setOrVal: (v: string) => void;
}

export const FormSealingElement: React.FC<FormSealingElementProps> = (props) => {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Information</Text>
        <CustomInput
          label="Operator Name"
          placeholder="Enter operator name"
          value={props.namaOperator}
          onChangeText={props.setNamaOperator}
        />
        <CustomInput
          label="SO Number"
          placeholder="Enter SO number"
          value={props.nomorSO}
          onChangeText={props.setNomorSO}
        />
        <CustomInput
          label="Job Description"
          placeholder="Description"
          value={props.jobDescription}
          onChangeText={props.setJobDescription}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Type</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="Size"
              placeholder="Enter size"
              value={props.size}
              onChangeText={props.setSize}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="Class"
              placeholder="Enter class"
              value={props.classVal}
              onChangeText={props.setClassVal}
            />
          </View>
        </View>
      </View>

      {/* Material Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Material</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="HOOP"
              placeholder="Select material type"
              value={props.hoop}
              onChangeText={props.setHoop}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="FILLER"
              placeholder="Select material type"
              value={props.filler}
              onChangeText={props.setFiller}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="IR"
              placeholder="Select material type"
              value={props.ir}
              onChangeText={props.setIr}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="OR"
              placeholder="Select material type"
              value={props.orVal}
              onChangeText={props.setOrVal}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAECF0' },
  cardTitle: { fontSize: 18, fontFamily: 'Hanuman', color: '#101828', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
});