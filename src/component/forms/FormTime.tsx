import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CustomInput } from '../common/CustomInput';

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
  noteTimeActivities?: string;
  setNoteTimeActivities?: (v: string) => void;
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
  noteTimeActivities = '',
  setNoteTimeActivities,
}) => {
  const isEnded = startTimestamp !== null && stopTimestamp !== null;

  let buttonLabel = 'START';
  let buttonStyle = styles.startButtonStyle;

  if (isEnded) {
    buttonLabel = 'END';
    buttonStyle = styles.endButtonStyle;
  } else if (isStarted) {
    buttonLabel = 'STOP';
    buttonStyle = styles.stopButtonStyle;
  }

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
        style={[styles.startStopButton, buttonStyle]}
        onPress={handleToggleStartStop}
        disabled={isEnded}
        activeOpacity={0.8}
      >
        <Text style={styles.startStopButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Ganti Order - A"
            unit="menit"
            keyboardType="number-pad"
            value={gantiOrder === 0 ? '' : String(gantiOrder)}
            placeholder="0"
            onChangeText={(v: string) => setGantiOrder(parseIntegerInput(v))}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Repair - B"
            unit="menit"
            keyboardType="number-pad"
            value={repair === 0 ? '' : String(repair)}
            placeholder="0"
            onChangeText={(v: string) => setRepair(parseIntegerInput(v))}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Material Tunggu - C"
            unit="menit"
            keyboardType="number-pad"
            value={materialTunggu === 0 ? '' : String(materialTunggu)}
            placeholder="0"
            onChangeText={(v: string) => setMaterialTunggu(parseIntegerInput(v))}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Operator - D"
            unit="menit"
            keyboardType="number-pad"
            value={operatorTime === 0 ? '' : String(operatorTime)}
            placeholder="0"
            onChangeText={(v: string) => setOperatorTime(parseIntegerInput(v))}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <CustomInput
            label="Maintenance - E"
            unit="menit"
            keyboardType="number-pad"
            value={maintenance === 0 ? '' : String(maintenance)}
            placeholder="0"
            onChangeText={(v: string) => setMaintenance(parseIntegerInput(v))}
          />
        </View>
        <View style={styles.col}>
          <CustomInput
            label="Checking - F"
            unit="menit"
            keyboardType="number-pad"
            value={checking === 0 ? '' : String(checking)}
            placeholder="0"
            onChangeText={(v: string) => setChecking(parseIntegerInput(v))}
          />
        </View>
      </View>

      {Boolean(setNoteTimeActivities) && (
        <View style={styles.noteContainer}>
          <CustomInput
            label="Note time"
            placeholder="Enter note"
            value={noteTimeActivities}
            onChangeText={(v: string) => setNoteTimeActivities?.(v)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAECF0' },
  cardTitle: { fontSize: RFValue(18),  color: '#101828', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  startStopButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  startButtonStyle: { backgroundColor: '#000000' },
  stopButtonStyle: { backgroundColor: '#D92D20' },
  endButtonStyle: { backgroundColor: '#667085' },
  startStopButtonText: { color: '#FFFFFF',  fontSize: RFValue(15), letterSpacing: 1 },
  noteContainer: { marginTop: 8 },
});