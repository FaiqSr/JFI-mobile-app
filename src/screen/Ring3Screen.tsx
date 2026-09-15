import React from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Alert } from '../utils/appAlert';
import { RFValue } from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FormInformationRing3 } from '../component/forms/FormInformationRing3';
import { FormProductRing3 } from '../component/forms/FormProductRing3';
import { FormTime } from '../component/forms/FormTime';
import { FormQuantity } from '../component/forms/FormQuantity';
import { downloadAndOpenCsPdf } from '../utils/pdfHandler';

interface Ring3ScreenProps {
  taskId?: string | number;
  pdfUrl?: string;
  userToken?: string;
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted?: string;
  setJobNoted?: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  materialType: string;
  setMaterialType: (v: string) => void;
  materialNoted?: string;
  setMaterialNoted?: (v: string) => void;
  thickness?: string;
  setThickness?: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  notedSize?: string;
  setNotedSize?: (v: string) => void;
  startTimestamp: number | null;
  setStartTimestamp?: (v: number | null) => void;
  stopTimestamp: number | null;
  setStopTimestamp?: (v: number | null) => void;
  isStarted: boolean;
  setIsStarted?: (v: boolean) => void;
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
  onClear?: () => void;
}

export const Ring3Screen: React.FC<Ring3ScreenProps> = (props) => {
  const handleClearForm = async () => {
    const activeOperator = props.namaOperator;
    const activeSO = props.nomorSO;

    props.setJobDescription('');
    if (props.setJobNoted) props.setJobNoted('');
    props.setProduct('');
    props.setMaterialType('');
    if (props.setMaterialNoted) props.setMaterialNoted('');
    if (props.setThickness) props.setThickness('');
    props.setSize('');
    props.setClassVal('');
    if (props.setNotedSize) props.setNotedSize('');

    if (props.setStartTimestamp) props.setStartTimestamp(null);
    if (props.setStopTimestamp) props.setStopTimestamp(null);
    if (props.setIsStarted) props.setIsStarted(false);

    props.setGantiOrder(0);
    props.setRepair(0);
    props.setMaterialTunggu(0);
    props.setOperatorTime(0);
    props.setMaintenance(0);
    props.setChecking(0);
    if (props.setNoteTimeActivities) {
      props.setNoteTimeActivities('');
    }

    props.setFinishGood(0);

    props.setNamaOperator(activeOperator);
    props.setNomorSO(activeSO);

    if (props.onClear) {
      props.onClear();
    }
  };

  const handleDownloadAndOpenPdf = async () => {
    const activeToken = (await AsyncStorage.getItem('userToken')) || props.userToken;

    console.log('\n================ [DEBUG DOWNLOAD CS PDF - RING 3] ================');
    console.log('1. taskId    :', props.taskId ?? '❌ UNDEFINED');
    console.log('2. userToken :', activeToken ? '✅ ADA' : '❌ UNDEFINED');
    console.log('===============================================================\n');

    if (!props.taskId) {
      Alert.alert('Informasi', 'ID Task CS tidak ditemukan.');
      return;
    }

    if (!activeToken) {
      Alert.alert('Informasi', 'Sesi login (token) tidak ditemukan.');
      return;
    }

    await downloadAndOpenCsPdf(props.taskId, activeToken);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        <Text style={styles.pageTitle}>Production Ring 3</Text>
        <Text style={styles.pageSubtitle}>
          Fill in the required information, product details, and production quantities.
        </Text>

        <FormInformationRing3
          namaOperator={props.namaOperator}
          setNamaOperator={props.setNamaOperator}
          nomorSO={props.nomorSO}
          setNomorSO={props.setNomorSO}
          jobDescription={props.jobDescription}
          setJobDescription={props.setJobDescription}
          jobNoted={props.jobNoted}
          setJobNoted={props.setJobNoted}
        />

        <FormProductRing3
          product={props.product}
          setProduct={props.setProduct}
          materialType={props.materialType}
          setMaterialType={props.setMaterialType}
          materialNoted={props.materialNoted}
          setMaterialNoted={props.setMaterialNoted}
          thickness={props.thickness}
          setThickness={props.setThickness}
          size={props.size}
          setSize={props.setSize}
          classVal={props.classVal}
          setClassVal={props.setClassVal}
          notedSize={props.notedSize}
          setNotedSize={props.setNotedSize}
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

        <TouchableOpacity style={styles.clearButtonFull} onPress={handleClearForm}>
          <Text style={styles.actionButtonText}>Clear</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingCsButton}
        onPress={handleDownloadAndOpenPdf}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingCsText}>Lihat CS (PDF)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 15,
    paddingBottom: 80,
    backgroundColor: '#F8F9FA',
  },
  pageTitle: {
    fontSize: RFValue(26),
    fontFamily: 'Hanuman',
    color: '#101828',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: RFValue(13),
    color: '#667085',
    fontFamily: 'Hanuman',
    marginBottom: 20,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButtonHalf: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
  },
  clearButtonFull: {
    backgroundColor: '#CC0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Hanuman',
    fontSize: RFValue(15),
  },
  floatingCsButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    backgroundColor: '#101828',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingCsText: {
    color: '#FFFFFF',
    fontFamily: 'Hanuman',
    fontWeight: '700',
    fontSize: RFValue(12),
  },
});