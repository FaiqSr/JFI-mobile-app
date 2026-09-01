import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';

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

export const FormInformationSE: React.FC<FormInformationProps> = ({
  namaOperator,
  setNamaOperator,
  nomorSO,
  setNomorSO,
  jobDescription,
  setJobDescription,
  jobNoted,
  setJobNoted,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const jobOptions = [
    '*Tidak Ada Pilihan',
    'MARKING',
    'WINDING 01',
    'WINDING 03',
    'WINDING 05',
    'WINDING 06',
    'WINDING 07',
    'WINDING 09',
    'WINDING 11',
    'WINDING 13',
    'SHAPING',
    'ASSY MANUAL',
    'ASSY MACHINE',
    'CUT HOOP',
    'CLEANING',
    'ROLLING',
    'PACKAGING',
  ];

  return (
    <View style={styles.container}>
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
          <Text
            style={[
              styles.dropdownText,
              !jobDescription && styles.placeholderText,
            ]}
          >
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
                    <Text
                      style={[
                        styles.modalItemText,
                        item === jobDescription && styles.selectedItemText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

export default FormInformationSE;

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  headerContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: RFValue(22), 
    fontWeight: '700',
    color: '#101828',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: RFValue(13), 
    color: '#667085',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
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
    color: '#101828',
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
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: RFValue(13), 
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
    fontWeight: 'bold',
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
    color: '#344054',
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#000000',
  },
});