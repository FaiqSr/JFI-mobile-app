import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface CustomInputProps extends TextInputProps {
  label?: string;
  unit?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  unit,
  style,
  ...restProps
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}

      {unit ? (
        <View style={styles.minuteInputContainer}>
          <TextInput
            style={[styles.minuteTextInput, style]}
            placeholderTextColor="#A0A0A0"
            {...restProps}
          />
          <Text style={styles.minuteUnitText}>{unit}</Text>
        </View>
      ) : (
        <TextInput
          style={[styles.textInput, style]}
          placeholderTextColor="#A0A0A0"
          {...restProps}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  inputLabel: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#344054',
    marginBottom: 6,s
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: RFValue(13),
    color: '#101828',
  },
  minuteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  minuteTextInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: RFValue(13),
    color: '#101828',
  },
  minuteUnitText: {
    fontSize: RFValue(12),
    color: '#667085',
  },
});