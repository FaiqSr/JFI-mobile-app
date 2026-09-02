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

export interface FormSealingElementProps {
  size: string;
  setSize: (v: string) => void;
  className: string;
  setClassName: (v: string) => void;
  thickness: string;
  setThickness: (v: string) => void;
  notedSize: string;
  setNotedSize: (v: string) => void;
  hoop: string;
  setHoop: (v: string) => void;
  filler: string;
  setFiller: (v: string) => void;
  ir: string;
  setIr: (v: string) => void;
  orVal: string;
  setOrVal: (v: string) => void;
  materialNoted: string;
  setMaterialNoted: (v: string) => void;
}

export const FormSealingElement: React.FC<FormSealingElementProps> = ({
  size,
  setSize,
  className,
  setClassName,
  thickness,
  setThickness,
  notedSize,
  setNotedSize,
  hoop,
  setHoop,
  filler,
  setFiller,
  ir,
  setIr,
  orVal,
  setOrVal,
  materialNoted,
  setMaterialNoted,
}) => {
  const [activeModal, setActiveModal] = useState<
    'thickness' | 'hoop' | 'filler' | 'ir' | 'or' | null
  >(null);

  const thicknessOptions = [
    '*Tidak ada pilihan', 
    '3.5 mm', 
    '4.5 mm', 
    '6.4 mm',
  ];
  
  const hoopOptions = [
    '*Tidak ada pilihan',
    'SS 304/304L',
    'SS 316/316L',
    'SS 321',
    'SS 347',
    'SS 317L',
    'DUPLEX 2205',
    'MONEL',
    'TITANIUM',
    'INCOLOY',
    'HASTELOY',
    'SS 410',
  ];
  
  const fillerOptions = [
    '*Tidak ada pilihan', 
    'GRAPHITE', 
    'PTFE',
    'NON ASBESTOS', 
    'Ceramic',
    'MICA',
    'VERMICULITE',
    'ASBESTOS',
  ];

  const irOptions = [
    '*Tidak ada pilihan',
    'CS',
    'SS 304/304L',
    'SS 316/316L',
    'SPCC',
    'SS 321',
    'SS 347',
    'SS 317L',
    'DUPLEX 2205',
    'MONEL',
    'TITANIUM',
    'INCOLOY',
    'HASTELOY',
    'ALUMINIUM',
    'BRASS',
    'COPPER',
  ];

  const orOptions = [
    '*Tidak ada pilihan',
    'CS',
    'SS 304/304L',
    'SS 316/316L',
    'SPCC',
    'SS 321',
    'SS 347',
    'SS 317L',
    'DUPLEX 2205',
    'MONEL',
    'TITANIUM',
    'INCOLOY',
    'HASTELOY',
    'ALUMINIUM',
    'BRASS',
    'COPPER',
  ];

  const handleSelectOption = (item: string, setter: (v: string) => void) => {
    if (item === '*Tidak ada pilihan') {
      setter(''); 
    } else {
      setter(item);
    }
    setActiveModal(null);
  };

  const getModalConfig = () => {
    switch (activeModal) {
      case 'thickness':
        return { title: 'Pilih Thickness', data: thicknessOptions, onSelect: setThickness, selected: thickness };
      case 'hoop':
        return { title: 'Pilih HOOP Material', data: hoopOptions, onSelect: setHoop, selected: hoop };
      case 'filler':
        return { title: 'Pilih FILLER Material', data: fillerOptions, onSelect: setFiller, selected: filler };
      case 'ir':
        return { title: 'Pilih IR Material', data: irOptions, onSelect: setIr, selected: ir };
      case 'or':
        return { title: 'Pilih OR Material', data: orOptions, onSelect: setOrVal, selected: orVal };
      default:
        return { title: '', data: [], onSelect: (_v: string) => {}, selected: '' };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Type</Text>
        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Size</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter size"
              placeholderTextColor="#98A2B3"
              value={size}
              onChangeText={setSize}
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Class</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter class"
              placeholderTextColor="#98A2B3"
              value={className}
              onChangeText={setClassName}
            />
          </View>
        </View>

        <Text style={styles.label}>Thickness</Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          activeOpacity={0.7}
          onPress={() => setActiveModal('thickness')}
        >
          <Text 
            style={[styles.dropdownText, !thickness && styles.placeholderText]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {thickness || 'Select thickness'}
          </Text>
          <Text style={styles.arrowIcon}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>NOTED SIZE</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter noted size"
          placeholderTextColor="#98A2B3"
          value={notedSize}
          onChangeText={setNotedSize}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Material</Text>
        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>HOOP</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setActiveModal('hoop')}
            >
              <Text 
                style={[styles.dropdownText, !hoop && styles.placeholderText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {hoop || 'Select hoop'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>FILLER</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setActiveModal('filler')}
            >
              <Text 
                style={[styles.dropdownText, !filler && styles.placeholderText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {filler || 'Select filler'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>IR</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setActiveModal('ir')}
            >
              <Text 
                style={[styles.dropdownText, !ir && styles.placeholderText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {ir || 'Select IR'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>OR</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.7}
              onPress={() => setActiveModal('or')}
            >
              <Text 
                style={[styles.dropdownText, !orVal && styles.placeholderText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {orVal || 'Select OR'}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Material Noted</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter material noted"
          placeholderTextColor="#98A2B3"
          value={materialNoted}
          onChangeText={setMaterialNoted}
        />
      </View>

      <Modal visible={activeModal !== null} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <FlatList
              data={modalConfig.data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectOption(item, modalConfig.onSelect)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      (item === modalConfig.selected || (item === '*Tidak ada pilihan' && !modalConfig.selected)) && styles.selectedItemText,
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
    </>
  );
};

export default FormSealingElement;

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: RFValue(16), fontWeight: 'normal', fontFamily: 'Hanuman', color: '#101828', marginBottom: 14 },
  label: { fontSize: RFValue(12), fontWeight: '600', fontFamily: 'Hanuman', color: '#344054', marginBottom: 6 },
  input: { 
    borderWidth: 1, 
    borderColor: '#EAECF0', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: RFValue(13), 
    fontFamily: 'Hanuman',
    fontWeight: 'normal',
    color: '#101828', 
    marginBottom: 12 
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
    flex: 1,
    fontSize: RFValue(13), 
    fontFamily: 'Hanuman', 
    color: '#101828',
    marginRight: 4,
  },
  placeholderText: { color: '#98A2B3' },
  arrowIcon: { fontSize: RFValue(10), color: '#667085' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInputContainer: { width: '48%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '60%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: RFValue(16), fontWeight: 'normal', fontFamily: 'Hanuman', color: '#101828', marginBottom: 12 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F7' },
  modalItemText: { fontSize: RFValue(14), fontFamily: 'Hanuman', color: '#344054' },
  selectedItemText: { fontWeight: 'normal', color: '#000000' },
});