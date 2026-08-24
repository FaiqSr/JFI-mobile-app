import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomInput } from './CustomInput';

interface FormDoubleJacketProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  productName: string;
  setProductName: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  workType?: string;
  setWorkType?: (v: string) => void;
  idVal: string;
  setIdVal: (v: string) => void;
  odVal: string;
  setOdVal: (v: string) => void;
  thickness: string;
  setThickness: (v: string) => void;
  metal: string;
  setMetal: (v: string) => void;
  filler: string;
  setFiller: (v: string) => void;
}

export const FormDoubleJacket: React.FC<FormDoubleJacketProps> = ({
  namaOperator,
  setNamaOperator,
  nomorSO,
  setNomorSO,
  productName,
  setProductName,
  jobDescription,
  setJobDescription,
  workType,
  setWorkType,
  idVal,
  setIdVal,
  odVal,
  setOdVal,
  thickness,
  setThickness,
  metal,
  setMetal,
  filler,
  setFiller,
}) => {
  return (
    <>
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
              label="Product Name"
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="Product Type"
              placeholder="Enter product type"
              value={workType || ''}
              onChangeText={setWorkType}
            />
          </View>
        </View>

        <CustomInput
          label="Job Description"
          placeholder="Enter job description"
          value={jobDescription}
          onChangeText={setJobDescription}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Size</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="ID"
              placeholder="Enter Inner Diameter"
              value={idVal}
              onChangeText={setIdVal}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="OD"
              placeholder="Enter out diamter"
              value={odVal}
              onChangeText={setOdVal}
            />
          </View>
        </View>

        <CustomInput
          label="Thickness"
          placeholder="Enter thickness"
          value={thickness}
          onChangeText={setThickness}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Material</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="METAL"
              placeholder="Enter metal type"
              value={metal}
              onChangeText={setMetal}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="FILLER"
              placeholder="Enter filler type"
              value={filler}
              onChangeText={setFiller}
            />
          </View>
        </View>
      </View>
    </>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
});