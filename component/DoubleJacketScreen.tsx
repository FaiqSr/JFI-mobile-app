import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { FormDoubleJacket } from './FormDoubleJacket';
import { FormTime } from './FormTime';
import { CustomInput } from './CustomInput';

interface DoubleJacketScreenProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  productName: string;
  setProductName: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  workType?: string;
  setWorkType?: (v: string) => void;
  idVal: string;
  setIdVal: (v: string) => void;
  odVal: string;
  setOdVal: (v: string) => void;
  thickness: string;
  setThickness: (v: string) => void;
  metal: string;
  setMetal: (v: string) => void;
  filler: string;
  setFiller: (v: string) => void;
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
  finishGood: number;
  setFinishGood: (v: number) => void;
  rework: number;
  setRework: (v: number) => void;
  parseIntegerInput: (text: string) => number;
  onBack: () => void;
  onSave: () => void;
  onClear: () => void;
}

export const DoubleJacketScreen: React.FC<DoubleJacketScreenProps> = (props) => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
    >
      <Text style={styles.pageTitle}>Production Double Jacket Gasket</Text>
      <Text style={styles.pageSubtitle}>
        Fill in the required information, product details, and production quantities.
      </Text>

      <FormDoubleJacket
        namaOperator={props.namaOperator}
        setNamaOperator={props.setNamaOperator}
        nomorSO={props.nomorSO}
        setNomorSO={props.setNomorSO}
        productName={props.productName}
        setProductName={props.setProductName}
        jobDescription={props.jobDescription}
        setJobDescription={props.setJobDescription}
        workType={props.workType}
        setWorkType={props.setWorkType}
        idVal={props.idVal}
        setIdVal={props.setIdVal}
        odVal={props.odVal}
        setOdVal={props.setOdVal}
        thickness={props.thickness}
        setThickness={props.setThickness}
        metal={props.metal}
        setMetal={props.setMetal}
        filler={props.filler}
        setFiller={props.setFiller}
      />

      <FormTime
        startTimestamp={props.startTimestamp}
        stopTimestamp={props.stopTimestamp}
        isStarted={props.isStarted}
        handleToggleStartStop={props.handleToggleStartStop}
        formatHHMM={props.formatHHMM}
        gantiOrder={props.gantiOrder}
        setGantiOrder={props.setGantiOrder}
        repair={props.repair}
        setRepair={props.setRepair}
        materialTunggu={props.materialTunggu}
        setMaterialTunggu={props.setMaterialTunggu}
        operatorTime={props.operatorTime}
        setOperatorTime={props.setOperatorTime}
        maintenance={props.maintenance}
        setMaintenance={props.setMaintenance}
        checking={props.checking}
        setChecking={props.setChecking}
        parseIntegerInput={props.parseIntegerInput}
      />

      {/* Card Quantity Khusus Double Jacket (Berampingan) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quantity</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="Finish Good"
              placeholder="0"
              value={props.finishGood === 0 ? '' : props.finishGood.toString()}
              onChangeText={(text) => props.setFinishGood(props.parseIntegerInput(text))}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="Rework"
              placeholder="0"
              value={props.rework === 0 ? '' : props.rework.toString()}
              onChangeText={(text) => props.setRework(props.parseIntegerInput(text))}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButtonHalf} onPress={props.onBack}>
          <Text style={styles.actionButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonHalf} onPress={props.onSave}>
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.clearButtonFull} onPress={props.onClear}>
        <Text style={styles.actionButtonText}>Clear</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingTop: 30, paddingBottom: 40, backgroundColor: '#F8F9FA' },
  pageTitle: { fontSize: 26, fontFamily: 'Hanuman', color: '#101828', marginBottom: 6 },
  pageSubtitle: { fontSize: 13, color: '#667085', fontFamily: 'Hanuman', marginBottom: 20, lineHeight: 18 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAECF0' },
  cardTitle: { fontSize: 18, fontFamily: 'Hanuman', color: '#101828', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  actionButtonHalf: { backgroundColor: '#000000', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '48%' },
  clearButtonFull: { backgroundColor: '#CC0000', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%' },
  actionButtonText: { color: '#FFFFFF', fontFamily: 'Hanuman', fontSize: 15 },
});