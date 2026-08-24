import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomInput } from './CustomInput';

interface FormProductRing2Props {
  product: string;
  setProduct: (v: string) => void;
  materialType: string;
  setMaterialType: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  workType: string;
  setWorkType: (v: string) => void;
}

export const FormProductRing2: React.FC<FormProductRing2Props> = ({
  product,
  setProduct,
  materialType,
  setMaterialType,
  size,
  setSize,
  classVal,
  setClassVal,
  workType,
  setWorkType,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Product</Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Product"
            placeholder="Enter product"
            value={product}
            onChangeText={setProduct}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Material Type"
            placeholder="Enter material type"
            value={materialType}
            onChangeText={setMaterialType}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Size"
            placeholder="Enter size"
            value={size}
            onChangeText={setSize}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Class"
            placeholder="Select class"
            value={classVal}
            onChangeText={setClassVal}
          />
        </View>
      </View>

      <CustomInput
        label="Work Type"
        placeholder="Enter work type"
        value={workType}
        onChangeText={setWorkType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAECF0' },
  cardTitle: { fontSize: 18, fontFamily: 'Hanuman', color: '#101828', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
});