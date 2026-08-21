import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomInput } from './CustomInput';

interface FormTimeProps {
  startTimestamp: number | null;
  stopTimestamp: number | null;
  isStarted: boolean;
  handleToggleStartStop: () => void;
  formatHHMM: (time: number | null) => string;
  gantiOrder: number;
  setGantiOrder: (v: number) => void;
  repair: number;
  setRepair: (v: number) => void;
  materialTunggu: number;
  setMaterialTunggu: (v: number) => void;
  operatorTime: number;
  setOperatorTime: (v: number) => void;
  maintenance: number;
  setMaintenance: (v: number) => void;
  checking: number;
  setChecking: (v: number) => void;
  parseIntegerInput: (text: string) => number;
}

export const FormTime: React.FC<FormTimeProps> = ({
  startTimestamp,
  stopTimestamp,
  isStarted,
  handleToggleStartStop,
  formatHHMM,
  gantiOrder,
  setGantiOrder,
  repair,
  setRepair,
  materialTunggu,
  setMaterialTunggu,
  operatorTime,
  setOperatorTime,
  maintenance,
  setMaintenance,
  checking,
  setChecking,
  parseIntegerInput,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Time & Activities</Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Time Start"
            placeholder="HH:MM"
            editable={false}
            value={formatHHMM(startTimestamp)}
            style={{ textAlign: 'center' }}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Time Stop"
            placeholder="HH:MM"
            editable={false}
            value={formatHHMM(stopTimestamp)}
            style={{ textAlign: 'center' }}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startStopButton, isStarted ? styles.stopButtonStyle : styles.startButtonStyle]}
        onPress={handleToggleStartStop}
      >
        <Text style={styles.startStopButtonText}>{isStarted ? 'STOP' : 'START'}</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Ganti Order - A"
            unit="menit"
            keyboardType="number-pad"
            value={String(gantiOrder)}
            onChangeText={(v) => setGantiOrder(parseIntegerInput(v))}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Repair - B"
            unit="menit"
            keyboardType="number-pad"
            value={String(repair)}
            onChangeText={(v) => setRepair(parseIntegerInput(v))}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Material Tunggu - C"
            unit="menit"
            keyboardType="number-pad"
            value={String(materialTunggu)}
            onChangeText={(v) => setMaterialTunggu(parseIntegerInput(v))}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Operator - D"
            unit="menit"
            keyboardType="number-pad"
            value={String(operatorTime)}
            onChangeText={(v) => setOperatorTime(parseIntegerInput(v))}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Maintenance - E"
            unit="menit"
            keyboardType="number-pad"
            value={String(maintenance)}
            onChangeText={(v) => setMaintenance(parseIntegerInput(v))}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Checking - F"
            unit="menit"
            keyboardType="number-pad"
            value={String(checking)}
            onChangeText={(v) => setChecking(parseIntegerInput(v))}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAECF0' },
  cardTitle: { fontSize: 18, fontFamily: 'Hanuman', color: '#101828', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  startStopButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  startButtonStyle: { backgroundColor: '#000000' },
  stopButtonStyle: { backgroundColor: '#D92D20' },
  startStopButtonText: { color: '#FFFFFF', fontFamily: 'Hanuman', fontSize: 15, letterSpacing: 1 },
});