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

export interface FormProductRing3Props {
  product: string;
  setProduct: (v: string) => void;
  materialType: string;
  setMaterialType: (v: string) => void;
  materialNoted?: string;
  setMaterialNoted?: (v: string) => void;
  thickness?: string;
  setThickness?: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  notedSize?: string;
  setNotedSize?: (v: string) => void;
  machineSizes?: string[];
}

export const FormProductRing3: React.FC<FormProductRing3Props> = ({
  product,
  setProduct,
  materialType,
  setMaterialType,
  materialNoted: externalMaterialNoted,
  setMaterialNoted: externalSetMaterialNoted,
  thickness: externalThickness,
  setThickness: externalSetThickness,
  size,
  setSize,
  classVal,
  setClassVal,
  notedSize: externalNotedSize,
  setNotedSize: externalSetNotedSize,
  machineSizes = [],
}) => {
  const [activeModal, setActiveModal] = useState<
    'product' | 'material' | 'thickness' | null
  >(null);

  const [internalMaterialNoted, setInternalMaterialNoted] = useState('');
  const [internalNotedSize, setInternalNotedSize] = useState('');
  const [internalThickness, setInternalThickness] = useState('');

  const materialNotedVal =
    externalMaterialNoted !== undefined
      ? externalMaterialNoted
      : internalMaterialNoted;
  const handleMaterialNotedChange = (text: string) => {
    if (externalSetMaterialNoted) externalSetMaterialNoted(text);
    setInternalMaterialNoted(text);
  };

  const notedSizeVal =
    externalNotedSize !== undefined ? externalNotedSize : internalNotedSize;
  const handleNotedSizeChange = (text: string) => {
    if (externalSetNotedSize) externalSetNotedSize(text);
    setInternalNotedSize(text);
  };

  const thicknessVal =
    externalThickness !== undefined ? externalThickness : internalThickness;
  const handleThicknessSelect = (val: string) => {
    if (externalSetThickness) externalSetThickness(val);
    setInternalThickness(val);
  };

  const productOptions = [
    '*Tidak ada pilihan',
    'IR',
    'OR',
    'SOLID',
    'NON STANDARD',
  ];

  const materialTypeOptions = [
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
    'COOPER',
  ];

  const thicknessOptions = [
    '*Tidak ada pilihan',
    '0',
    '0.5 mm',
    '1 mm',
    '2 mm',
    '3 mm',
    '4 mm',
    '5 mm',
  ];

  const isNoProduct =
    product === 'Tidak Ada Pilihan' || product === '*Tidak ada pilihan';
  const isNoMaterialType =
    materialType === 'Tidak Ada Pilihan' || materialType === '*Tidak ada pilihan';
  const isNoChoiceMaterialNoted = isNoProduct || isNoMaterialType;
  const isNoThickness =
    thicknessVal === 'Tidak Ada Pilihan' || thicknessVal === '*Tidak ada pilihan';

  const getModalConfig = () => {
    switch (activeModal) {
      case 'product':
        return {
          title: 'Pilih Product',
          data: productOptions,
          onSelect: setProduct,
          selected: product,
        };
      case 'material':
        return {
          title: 'Pilih Material Type',
          data: materialTypeOptions,
          onSelect: setMaterialType,
          selected: materialType,
        };
      case 'thickness':
        return {
          title: 'Pilih Thickness',
          data: thicknessOptions,
          onSelect: handleThicknessSelect,
          selected: thicknessVal,
        };
      default:
        return {
          title: '',
          data: [],
          onSelect: (_v: string) => {},
          selected: '',
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Product</Text>

      <Text style={styles.label}>
        Product <Text style={styles.asterisk}>*</Text>
      </Text>
      <TouchableOpacity
        style={styles.dropdownInput}
        activeOpacity={0.7}
        onPress={() => setActiveModal('product')}
      >
        <Text style={[styles.dropdownText, !product && styles.placeholderText]}>
          {product || 'Select product'}
        </Text>
        <Text style={styles.arrowIcon}>▼</Text>
      </TouchableOpacity>
      {isNoProduct && (
        <Text style={styles.warningText}>Material Noted wajib diisi</Text>
      )}

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>
            Material Type <Text style={styles.asterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={() => setActiveModal('material')}
          >
            <Text
              style={[
                styles.dropdownText,
                !materialType && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {materialType || 'Select type'}
            </Text>
            <Text style={styles.arrowIcon}>▼</Text>
          </TouchableOpacity>
          {isNoMaterialType && (
            <Text style={styles.warningText}>Material Noted wajib diisi</Text>
          )}
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>
            Material Noted <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Cert No. Material: -"
            placeholderTextColor="#98A2B3"
            value={materialNotedVal}
            onChangeText={handleMaterialNotedChange}
          />
          {machineSizes.length > 0 && <View style={styles.row}>{machineSizes.map((value) => <TouchableOpacity key={value} onPress={() => setSize(value)}><Text>{value}</Text></TouchableOpacity>)}</View>}
          {isNoChoiceMaterialNoted && (
            <Text style={styles.warningText}>
              Wajib diisi karena Product/Material Type 'Tidak Ada Pilihan'
            </Text>
          )}
        </View>
      </View>

      
      <Text style={styles.label}>Thickness</Text>
      <TouchableOpacity
        style={styles.dropdownInput}
        activeOpacity={0.7}
        onPress={() => setActiveModal('thickness')}
      >
        <Text
          style={[
            styles.dropdownText,
            !thicknessVal && styles.placeholderText,
          ]}
        >
          {thicknessVal || 'Select thickness'}
        </Text>
        <Text style={styles.arrowIcon}>▼</Text>
      </TouchableOpacity>
      {isNoThickness && (
        <Text style={styles.warningText}>Noted Size wajib diisi</Text>
      )}

      
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>
            Size <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder='1"'
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
            placeholder="#150"
            placeholderTextColor="#98A2B3"
            value={classVal}
            onChangeText={setClassVal}
          />
        </View>
      </View>

      
      <Text style={styles.label}>
        Noted Size (OD/ID) <Text style={styles.asterisk}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter size note"
        placeholderTextColor="#98A2B3"
        value={notedSizeVal}
        onChangeText={handleNotedSizeChange}
      />
      {isNoThickness && (
        <Text style={styles.warningText}>
          Wajib diisi karena Thickness 'Tidak Ada Pilihan'
        </Text>
      )}

      
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
                  onPress={() => {
                    modalConfig.onSelect(item);
                    setActiveModal(null);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === modalConfig.selected && styles.selectedItemText,
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

export default FormProductRing3;

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
    marginBottom: 16,
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
    marginBottom: 4,
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
    marginBottom: 4,
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
  warningText: {
    fontSize: RFValue(11),
    color: '#D97706',
    
    marginTop: 2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  column: {
    flex: 1,
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