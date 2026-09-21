import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface SearchableSizeInputProps {
  value: string;
  onChangeText: (value: string) => void;
  sizes?: string[];
  placeholder?: string;
}

export const SearchableSizeInput: React.FC<SearchableSizeInputProps> = ({
  value,
  onChangeText,
  sizes = [],
  placeholder = 'Ketik atau cari size',
}) => {
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    return Array.from(new Set(sizes.filter((size) => !query || size.toLowerCase().includes(query))));
  }, [sizes, value]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        value={value}
        onFocus={() => setFocused(true)}
        onChangeText={onChangeText}
      />
      {focused && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <ScrollView
            style={styles.suggestionList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.suggestionItem}
                onPress={() => {
                  onChangeText(item);
                  setFocused(false);
                }}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 1000,
    elevation: 1000,
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
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    height: 160,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 8,
    zIndex: 1001,
    elevation: 1001,
  },
  suggestionList: { flexGrow: 0 },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  suggestionText: { fontSize: RFValue(13), color: '#344054' },
});
