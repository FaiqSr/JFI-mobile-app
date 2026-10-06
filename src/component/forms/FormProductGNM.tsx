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
}) => {
  const { t } = useTranslation();
  const [type1Modal, setType1Modal] = useState(false);
  const [type2Modal, setType2Modal] = useState(false);
  const [thicknessModal, setThicknessModal] = useState(false);
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

  const handleSelect = (
    item: string,
    setter: (v: string) => void,
    modalSetter: (v: boolean) => void
  ) => {
    const valueToSet = item.startsWith('*') ? '' : item;
    setter(valueToSet);
    modalSetter(false);
  };

  // Noted Size wajib diisi bila salah satu dari Size, Class, Type 1, atau
  // Type 2 kosong (termasuk pilihan "*Tidak Ada Pilihan" yang dikosongkan).
  const hasEmptyProductField =
    !size.trim() || !classVal.trim() || !type1.trim() || !type2.trim();

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('form.product')}</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>
              {t('form.size')} <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('form.sizePlaceholder')}
              placeholderTextColor="#98A2B3"
              value={size}
              onChangeText={setSize}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>
              {t('form.class')} <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('form.classPlaceholder')}
              placeholderTextColor="#98A2B3"
              value={classVal}
              onChangeText={setClassVal}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>
              {t('form.type1')} <Text style={styles.asterisk}>*</Text>
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
                {type1 || t('form.type1Placeholder')}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>
              {t('form.type2')} <Text style={styles.asterisk}>*</Text>
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
                {type2 || t('form.type2Placeholder')}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>
              {t('form.thickness')} <Text style={styles.asterisk}>*</Text>
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
                {thickness || t('form.thicknessPlaceholder')}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>
          {t('form.notedSizeShort')} {hasEmptyProductField && <Text style={styles.asterisk}>*</Text>}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('form.notedSizePlaceholderShort')}
          placeholderTextColor="#98A2B3"
          value={notedSizeVal}
          onChangeText={handleNotedSizeChange}
        />
        {hasEmptyProductField && (
          <Text style={styles.warningText}>
            {t('form.warnBecauseProductFields')}
          </Text>
        )}
      </View>

      <Modal visible={type1Modal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setType1Modal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('form.selectType1')}</Text>
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
            <Text style={styles.modalTitle}>{t('form.selectType2')}</Text>
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
  warningText: {
    fontSize: RFValue(11),
    color: '#D97706',
    marginTop: 2,
    marginBottom: 4,
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
