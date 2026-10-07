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
import { useTranslation } from '../../i18n';
import {
  requiredFieldStyle,
  normalFieldStyle,
} from '../common/requiredFieldStyle';

interface FormDoubleJacketProps {
  idVal: string;
  setIdVal: (v: string) => void;
  odVal: string;
  setOdVal: (v: string) => void;
  productType: string;
  setProductType: (v: string) => void;
  thickness: string;
  setThickness: (v: string) => void;
  notedSize?: string;
  setNotedSize?: (v: string) => void;
  metal: string;
  setMetal: (v: string) => void;
  filler: string;
  setFiller: (v: string) => void;
  materialNoted?: string;
  setMaterialNoted?: (v: string) => void;
}

export const FormDoubleJacket: React.FC<FormDoubleJacketProps> = ({
  idVal,
  setIdVal,
  odVal,
  setOdVal,
  productType,
  setProductType,
  thickness,
  setThickness,
  notedSize: externalNotedSize,
  setNotedSize: externalSetNotedSize,
  metal,
  setMetal,
  filler,
  setFiller,
  materialNoted: externalMaterialNoted,
  setMaterialNoted: externalSetMaterialNoted,
}) => {

  const { t } = useTranslation();
  const [productTypeModal, setProductTypeModal] = useState(false);
  const [thicknessModal, setThicknessModal] = useState(false);
  const [metalModal, setMetalModal] = useState(false);
  const [fillerModal, setFillerModal] = useState(false);
  const [internalNotedSize, setInternalNotedSize] = useState('');
  const [internalMaterialNoted, setInternalMaterialNoted] = useState('');

  const notedSizeVal =
    externalNotedSize !== undefined ? externalNotedSize : internalNotedSize;
  const materialNotedVal =
    externalMaterialNoted !== undefined
      ? externalMaterialNoted
      : internalMaterialNoted;

  const handleNotedSizeChange = (text: string) => {
    if (externalSetNotedSize) externalSetNotedSize(text);
    setInternalNotedSize(text);
  };

  const handleMaterialNotedChange = (text: string) => {
    if (externalSetMaterialNoted) externalSetMaterialNoted(text);
    setInternalMaterialNoted(text);
  };

  const productTypeOptions = [
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
    '0 mm',
    '1 mm',
    '2 mm',
    '3 mm',
    '4 mm',
    '5 mm',
  ];

  const metalOptions = [
    '*Tidak Ada Pilihan',
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

  const fillerOptions = [
    '*Tidak Ada Pilihan',
    'GRAPHITE',
    'PTFE',
    'NON ASBESTOS',
    'Ceramic',
    'MICA',
    'VERMICULITE',
    'ASBESTOS',
  ];

  const handleSelect = (
    item: string,
    setter: (v: string) => void,
    modalSetter: (v: boolean) => void
  ) => {
    const valueToSet = item.startsWith('*') ? '' : item;
    setter(valueToSet);
    modalSetter(false);
  };

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('form.size')}</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{t('djf.id')}</Text>
            <TextInput
              style={[styles.input, normalFieldStyle, !idVal && requiredFieldStyle]}
              placeholder={t('djf.idPlaceholder')}
              placeholderTextColor="#98A2B3"
              value={idVal}
              onChangeText={setIdVal}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>{t('djf.od')}</Text>
            <TextInput
              style={[styles.input, normalFieldStyle, !odVal && requiredFieldStyle]}
              placeholder={t('djf.odPlaceholder')}
              placeholderTextColor="#98A2B3"
              value={odVal}
              onChangeText={setOdVal}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{t('djf.productType')}</Text>
            <TouchableOpacity
              style={[
                styles.dropdownInput,
                normalFieldStyle,
                !productType && requiredFieldStyle,
              ]}
              activeOpacity={0.7}
              onPress={() => setProductTypeModal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !productType && styles.placeholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {productType || t('djf.productTypePlaceholder')}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>{t('form.thickness')}</Text>
            <TouchableOpacity
              style={[
                styles.dropdownInput,
                normalFieldStyle,
                !thickness && requiredFieldStyle,
              ]}
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
                {thickness || t('form.thicknessPlaceholder')}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>{t('form.notedSizeShort')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('form.notedSizePlaceholderShort')}
          placeholderTextColor="#98A2B3"
          value={notedSizeVal}
          onChangeText={handleNotedSizeChange}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('form.material')}</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{t('djf.metal')}</Text>
            <TouchableOpacity
              style={[
                styles.dropdownInput,
                normalFieldStyle,
                !metal && requiredFieldStyle,
              ]}
              activeOpacity={0.7}
              onPress={() => setMetalModal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !metal && styles.placeholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {metal || t('djf.metalPlaceholder')}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>{t('djf.filler')}</Text>
            <TouchableOpacity
              style={[
                styles.dropdownInput,
                normalFieldStyle,
                !filler && requiredFieldStyle,
              ]}
              activeOpacity={0.7}
              onPress={() => setFillerModal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !filler && styles.placeholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {filler || t('djf.fillerPlaceholder')}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>{t('djf.materialNotedUpper')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('form.materialNotedPlaceholder')}
          placeholderTextColor="#98A2B3"
          value={materialNotedVal}
          onChangeText={handleMaterialNotedChange}
        />
      </View>

      <Modal visible={productTypeModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProductTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('djf.selectProductType')}</Text>
            <FlatList
              data={productTypeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() =>
                    handleSelect(item, setProductType, setProductTypeModal)
                  }
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === productType && styles.selectedItemText,
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
            <Text style={styles.modalTitle}>{t('form.selectThickness')}</Text>
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

      <Modal visible={metalModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMetalModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('djf.selectMetal')}</Text>
            <FlatList
              data={metalOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelect(item, setMetal, setMetalModal)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === metal && styles.selectedItemText,
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

      <Modal visible={fillerModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFillerModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('djf.selectFiller')}</Text>
            <FlatList
              data={fillerOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() =>
                    handleSelect(item, setFiller, setFillerModal)
                  }
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === filler && styles.selectedItemText,
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