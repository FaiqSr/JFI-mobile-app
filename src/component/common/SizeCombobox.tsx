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

interface SizeComboboxProps {
  value: string;
  onChange: (v: string) => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export const SizeCombobox: React.FC<SizeComboboxProps> = ({
  value,
  onChange,
  suggestions = [],
  placeholder,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const hasSuggestions = suggestions.length > 0;

  const handleSelect = (item: string) => {
    onChange(item);
    setOpen(false);
  };

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          value={value}
          onChangeText={onChange}
          editable={!disabled}
        />
        {hasSuggestions && !disabled && (
          <TouchableOpacity
            style={styles.arrowButton}
            activeOpacity={0.7}
            onPress={() => setOpen(true)}
          >
            <Text style={styles.arrowIcon}>▼</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('gnm.selectSize')}</Text>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === value && styles.selectedItemText,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: RFValue(13),
    color: '#101828',
    backgroundColor: '#FFFFFF',
  },
  arrowButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
