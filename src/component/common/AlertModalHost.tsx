import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  AlertRequest,
  dismissAlert,
  resolveAlert,
  subscribeToAlert,
} from '../../utils/appAlert';

/**
 * Renders one alert at a time from the appAlert store.
 * Mounted once, as a sibling of <App /> in `index.js`, so it stays alive for the
 * loading / login / logged-in states of App (which early-returns).
 */
export const AlertModalHost: React.FC = () => {
  const [request, setRequest] = useState<AlertRequest | null>(null);

  useEffect(() => subscribeToAlert(setRequest), []);

  if (!request) return null;

  const isCancelable = request.options.cancelable !== false;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (isCancelable) dismissAlert();
      }}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            if (isCancelable) dismissAlert();
          }}
        />

        <View style={styles.card}>
          <Text style={styles.title}>{request.title}</Text>
          {!!request.message && <Text style={styles.message}>{request.message}</Text>}

          <View style={styles.buttonColumn}>
            {request.buttons.map((button, index) => (
              <TouchableOpacity
                key={`${request.id}-${index}`}
                style={[styles.button, styles[button.style ?? 'default']]}
                activeOpacity={0.8}
                onPress={() => resolveAlert(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                  ]}
                >
                  {button.text || 'OK'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  title: { fontSize: RFValue(18), fontWeight: '800', color: '#0F172A' },
  message: {
    fontSize: RFValue(13),
    color: '#475569',
    lineHeight: RFValue(19),
    marginTop: 8,
  },
  buttonColumn: { marginTop: 20 },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  default: { backgroundColor: '#111827' },
  cancel: { backgroundColor: '#111827ce' },
  destructive: { backgroundColor: '#111827c7' },
  buttonText: { fontSize: RFValue(14), fontWeight: 'bold', color: '#FFFFFF' },
});
