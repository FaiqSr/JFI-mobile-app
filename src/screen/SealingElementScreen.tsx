import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { FormInformationSE } from '../component/forms/FormInformationSE';
import { FormSealingElement } from '../component/forms/FormSealingElement';
import { FormTime } from '../component/forms/FormTime';
import { FormQuantity } from '../component/forms/FormQuantity';

export interface SealingElementScreenProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted: string;
  setJobNoted: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  notedSize: string;
  setNotedSize: (v: string) => void;
  hoop: string;
  setHoop: (v: string) => void;
  thickness: string;
  setThickness: (val: string) => void;
  filler: string;
  setFiller: (v: string) => void;
  ir: string;
  setIr: (v: string) => void;
  orVal: string;
  setOrVal: (v: string) => void;
  materialNoted: string;
  setMaterialNoted: (v: string) => void;
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
  noteTimeActivities?: string;
  setNoteTimeActivities?: (v: string) => void;
  finishGood: number;
  setFinishGood: (v: number) => void;
  parseIntegerInput: (text: string) => number;
  onBack: () => void;
  onSave: () => void;
  onClear: () => void;
}

export const SealingElementScreen: React.FC<SealingElementScreenProps> = (props) => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
    >
      <Text style={styles.pageTitle}>Production Sealing Element</Text>
      <Text style={styles.pageSubtitle}>
        Fill in the required information, product details, and production quantities.
      </Text>

      <FormInformationSE
        namaOperator={props.namaOperator}
        setNamaOperator={props.setNamaOperator}
        nomorSO={props.nomorSO}
        setNomorSO={props.setNomorSO}
        jobDescription={props.jobDescription}
        setJobDescription={props.setJobDescription}
        jobNoted={props.jobNoted}
        setJobNoted={props.setJobNoted}
      />

      <FormSealingElement
        size={props.size}
        setSize={props.setSize}
        className={props.classVal}
        setClassName={props.setClassVal}
        thickness={props.thickness}
        setThickness={props.setThickness}
        notedSize={props.notedSize}
        setNotedSize={props.setNotedSize}
        hoop={props.hoop}
        setHoop={props.setHoop}
        filler={props.filler}
        setFiller={props.setFiller}
        ir={props.ir}
        setIr={props.setIr}
        orVal={props.orVal}
        setOrVal={props.setOrVal}
        materialNoted={props.materialNoted}
        setMaterialNoted={props.setMaterialNoted}
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
        noteTimeActivities={props.noteTimeActivities}
        setNoteTimeActivities={props.setNoteTimeActivities}
      />

      <FormQuantity
        finishGood={props.finishGood}
        setFinishGood={props.setFinishGood}
        parseIntegerInput={props.parseIntegerInput}
      />

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
  scrollContent: { padding: 20, paddingTop: 15, paddingBottom: 40, backgroundColor: '#F8F9FA' },
  pageTitle: { fontSize: 26, fontFamily: 'Hanuman', color: '#101828', marginBottom: 6 },
  pageSubtitle: { fontSize: 13, color: '#667085', fontFamily: 'Hanuman', marginBottom: 20, lineHeight: 18 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  actionButtonHalf: { backgroundColor: '#000000', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '48%' },
  clearButtonFull: { backgroundColor: '#CC0000', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%' },
  actionButtonText: { color: '#FFFFFF', fontFamily: 'Hanuman', fontSize: 15 },
});