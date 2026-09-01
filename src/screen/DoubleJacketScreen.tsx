import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { FormInformationDJG } from '../component/forms/FormInformationDJG';
import { FormDoubleJacket } from '../component/forms/FormDoubleJacket';
import { FormTime } from '../component/forms/FormTime';
import { FormQuantityDJG } from '../component/forms/FormQuantityDJG';

export interface DoubleJacketScreenProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted: string;
  setJobNoted: (v: string) => void;
  productName: string;
  setProductName: (v: string) => void;
  productType: string;
  setProductType: (v: string) => void;
  idVal: string;
  setIdVal: (v: string) => void;
  odVal: string;
  setOdVal: (v: string) => void;
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
      <Text style={styles.pageTitle}>Production Double Jacketed</Text>
      <Text style={styles.pageSubtitle}>
        Fill in the required information, product details, and production quantities.
      </Text>

      <FormInformationDJG
        namaOperator={props.namaOperator}
        setNamaOperator={props.setNamaOperator}
        nomorSO={props.nomorSO}
        setNomorSO={props.setNomorSO}
        productName={props.productName}
        setProductName={props.setProductName}
        jobDescription={props.jobDescription}
        setJobDescription={props.setJobDescription}
        jobNoted={props.jobNoted}
        setJobNoted={props.setJobNoted}
      />

      <FormDoubleJacket
        idVal={props.idVal}
        setIdVal={props.setIdVal}
        odVal={props.odVal}
        setOdVal={props.setOdVal}
        productType={props.productType}
        setProductType={props.setProductType}
        thickness={props.thickness}
        setThickness={props.setThickness}
        notedSize={props.notedSize}
        setNotedSize={props.setNotedSize}
        metal={props.metal}
        setMetal={props.setMetal}
        filler={props.filler}
        setFiller={props.setFiller}
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
      />

      <FormQuantityDJG
        finishGood={props.finishGood}
        setFinishGood={props.setFinishGood}
        rework={props.rework}
        setRework={props.setRework}
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