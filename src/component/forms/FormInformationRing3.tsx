import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface FormInformationProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted?: string;
  setJobNoted?: (v: string) => void;
}

export const FormInformationRing3: React.FC<FormInformationProps> = ({
  namaOperator,
  setNamaOperator,
  nomorSO,
  setNomorSO,
  jobDescription,
  setJobDescription,
  jobNoted = '',
  setJobNoted = () => {},
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const jobOptions = [
    '*Tidak ada pilihan',
    'LASER CUTTING', 
    'CUT STRIP', 
    'STRAIGHTENING', 
    'BENDING (automatic)', 
    'BENDING (manual)', 
    'FLATTENING', 
    'CUT RING', 
    'WELDING', 
    'GRINDING', 
    'GRINDING (welding)', 
    'GRINDING(solid)', 
    'ANGLING IR', 
    'GROVE OR', 
    'POLESHING', 
    'BUBUT', 
    'PAINTING', 
    'POWDER COATING'
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Information</Text>

      <Text style={styles.label}>Operator Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter operator name"
        placeholderTextColor="#98A2B3"
        value={namaOperator}
        onChangeText={setNamaOperator}
      />

      <Text style={styles.label}>SO Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter SO number"
        placeholderTextColor="#98A2B3"
        value={nomorSO}
        onChangeText={setNomorSO}
      />

      <Text style={styles.label}>Job Description</Text>
      <TouchableOpacity
        style={styles.dropdownInput}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownText, !jobDescription && styles.placeholderText]}>
          {jobDescription || 'Select job description'}
        </Text>
        <Text style={styles.arrowIcon}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Job Noted</Text>
      <TextInput
        style={styles.input}
        placeholder="Notes"
        placeholderTextColor="#98A2B3"
        value={jobNoted}
        onChangeText={setJobNoted}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Job Description</Text>
            <FlatList
              data={jobOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setJobDescription(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, item === jobDescription && styles.selectedItemText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default FormInformationRing3;

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
    marginBottom: 12,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: RFValue(13),
    fontFamily: 'Hanuman',
    color: '#101828',
  },
  placeholderText: {
    color: '#98A2B3',
  },
  arrowIcon: {
    fontSize: RFValue(10),
    color: '#667085',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: RFValue(16),
    fontWeight: 'normal',
    fontFamily: 'Hanuman',
    color: '#101828',
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  modalItemText: {
    fontSize: RFValue(14),
    fontFamily: 'Hanuman',
    color: '#344054',
  },
  selectedItemText: {
    fontWeight: 'normal',
    color: '#000000',
  },
});