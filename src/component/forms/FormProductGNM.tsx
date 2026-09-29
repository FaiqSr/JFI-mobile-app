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

interface FormProductGNMProps {
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  type1: string;
  setType1: (v: string) => void;
  type2: string;
  setType2: (v: string) => void;
  thickness: string;
  setThickness: (v: string) => void;
  notedSize?: string;
  setNotedSize?: (v: string) => void;
  shift: number | null;
  setShift: (v: number | null) => void;
}

export const FormProductGNM: React.FC<FormProductGNMProps> = ({
  size,
  setSize,
  classVal,
  setClassVal,
  type1,
  setType1,
  type2,
  setType2,
  thickness,
  setThickness,
  notedSize: externalNotedSize,
  setNotedSize: externalSetNotedSize,
  shift,
  setShift,
}) => {
  const [type1Modal, setType1Modal] = useState(false);
  const [type2Modal, setType2Modal] = useState(false);
  const [thicknessModal, setThicknessModal] = useState(false);
  const [shiftModal, setShiftModal] = useState(false);
  const [internalNotedSize, setInternalNotedSize] = useState('');

  const notedSizeVal =
    externalNotedSize !== undefined ? externalNotedSize : internalNotedSize;

  const handleNotedSizeChange = (text: string) => {
    if (externalSetNotedSize) externalSetNotedSize(text);
    setInternalNotedSize(text);
  };

  const type1Options = ['*Tidak Ada Pilihan', 'RF', 'FF'];

  const type2Options = [
    '*Tidak Ada Pilihan',
    'A',
    'B',
    'B1',
    'C',
    'D',
    'E',
    'E1',
    'F',
    'F1',
    'G',
    'H',
    'J',
    'J1',
    'K',
    'L',
    'M',
    'N',
    'N1',
    'P',
    'S',
    'T',
    'U',
    'Y',
    'Z',
    'Z1',
  ];

  const thicknessOptions = [
    '*Tidak Ada Pilihan',
    '0.5 mm',
    '1 mm',
    '1.5 mm',
    '2 mm',
    '3 mm',
    '4 mm',
    '5 mm',
    '6 mm',
    '7 mm',
    '8 mm',
  ];

  const shiftOptions = ['Shift 1', 'Shift 2'];

  const handleSelect = (
    item: string,
    setter: (v: string) => void,
    modalSetter: (v: boolean) => void
  ) => {
    const valueToSet = item.startsWith('*') ? '' : item;
    setter(valueToSet);
    modalSetter(false);
  };

  const handleSelectShift = (item: string) => {
    setShift(item === 'Shift 2' ? 2 : 1);
    setShiftModal(false);
  };

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Product</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>
              Size <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter size"
              placeholderTextColor="#98A2B3"
              value={size}
              onChangeText={setSize}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>
              Class <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter class"
              placeholderTextColor="#98A2B3"
              value={classVal}
              onChangeText={setClassVal}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>
              Type 1 <Text style={styles.asterisk}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setType1Modal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !type1 && styles.placeholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {type1 || 'Select type 1'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>
              Type 2 <Text style={styles.asterisk}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setType2Modal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !type2 && styles.placeholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {type2 || 'Select type 2'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>
              Thickness <Text style={styles.asterisk}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setThicknessModal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !thickness && styles.placeholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {thickness || 'Select thickness'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>
              Shift <Text style={styles.asterisk}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setShiftModal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !shift && styles.placeholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {shift ? `Shift ${shift}` : 'Select shift'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>NOTED SIZE</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter noted size"
          placeholderTextColor="#98A2B3"
          value={notedSizeVal}
          onChangeText={handleNotedSizeChange}
        />
      </View>

      <Modal visible={type1Modal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setType1Modal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Type 1</Text>
            <FlatList
              data={type1Options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelect(item, setType1, setType1Modal)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === type1 && styles.selectedItemText,
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

      <Modal visible={type2Modal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setType2Modal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Type 2</Text>
            <FlatList
              data={type2Options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelect(item, setType2, setType2Modal)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === type2 && styles.selectedItemText,
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

      <Modal visible={thicknessModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setThicknessModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Thickness</Text>
            <FlatList
              data={thicknessOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() =>
                    handleSelect(item, setThickness, setThicknessModal)
                  }
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === thickness && styles.selectedItemText,
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

      <Modal visible={shiftModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShiftModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Shift</Text>
            <FlatList
              data={shiftOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectShift(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === `Shift ${shift}` && styles.selectedItemText,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#344054',
    marginBottom: 6,
  },
  asterisk: {
    color: '#D92D20',
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
    marginBottom: 12,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: RFValue(12.5),

    color: '#101828',
    marginRight: 4,
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
    fontWeight: '600',

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
    fontWeight: '700',
    color: '#101828',
  },
});
