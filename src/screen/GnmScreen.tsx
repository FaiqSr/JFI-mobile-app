import React from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import { FormInformationGNM } from '../component/forms/FormInformationGNM';
import { FormProductGNM } from '../component/forms/FormProductGNM';
import { FormMaterialGNM } from '../component/forms/FormMaterialGNM';
import { FormTime } from '../component/forms/FormTime';
import { FormQuantity } from '../component/forms/FormQuantity';
import { useTranslation } from '../i18n';

interface GnmScreenProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted?: string;
  setJobNoted?: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  type1: string;
  setType1: (v: string) => void;
  type2: string;
  setType2: (v: string) => void;
  thickness: string;
  setThickness: (v: string) => void;
  notedSize?: string;
  setNotedSize?: (v: string) => void;
  materialNoted?: string;
  setMaterialNoted?: (v: string) => void;
  shift: number | null;
  setShift: (v: number | null) => void;
  handleChangeStartTime: (text: string) => void;
  handleChangeStopTime: (text: string) => void;
  startTimeText: string;
  stopTimeText: string;
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

export const GnmScreen: React.FC<GnmScreenProps> = (props) => {
  const { t } = useTranslation();
  const handleClearForm = async () => {
    const activeOperator = props.namaOperator;

    props.setJobDescription('');
    if (props.setJobNoted) props.setJobNoted('');
    props.setSize('');
    props.setClassVal('');
    props.setType1('');
    props.setType2('');
    props.setThickness('');
    if (props.setNotedSize) props.setNotedSize('');
    if (props.setMaterialNoted) props.setMaterialNoted('');
    props.setShift(null);

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

    if (props.onClear) {
      props.onClear();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        <Text style={styles.pageTitle}>{t('screens.gnmTitle')}</Text>
        <Text style={styles.pageSubtitle}>
          {t('screens.ringSubtitle')}
        </Text>

        <FormInformationGNM
          namaOperator={props.namaOperator}
          setNamaOperator={props.setNamaOperator}
          nomorSO={props.nomorSO}
          setNomorSO={props.setNomorSO}
          jobDescription={props.jobDescription}
          setJobDescription={props.setJobDescription}
          jobNoted={props.jobNoted}
          setJobNoted={props.setJobNoted}
        />

        <FormProductGNM
          size={props.size}
          setSize={props.setSize}
          classVal={props.classVal}
          setClassVal={props.setClassVal}
          type1={props.type1}
          setType1={props.setType1}
          type2={props.type2}
          setType2={props.setType2}
          thickness={props.thickness}
          setThickness={props.setThickness}
          notedSize={props.notedSize}
          setNotedSize={props.setNotedSize}
        />

        <FormMaterialGNM
          materialNoted={props.materialNoted}
          setMaterialNoted={props.setMaterialNoted}
        />

        <FormTime
          handleChangeStartTime={props.handleChangeStartTime}
          handleChangeStopTime={props.handleChangeStopTime}
          startTimeText={props.startTimeText}
          stopTimeText={props.stopTimeText}
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
          shift={props.shift}
          setShift={props.setShift}
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
            <Text style={styles.actionButtonText}>{t('common.backShort')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonHalf} onPress={props.onSave}>
            <Text style={styles.actionButtonText}>{t('common.saveShort')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.clearButtonFull} onPress={handleClearForm}>
          <Text style={styles.actionButtonText}>{t('common.clearShort')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
    backgroundColor: '#F8F9FA',
  },
  pageTitle: {
    fontSize: RFValue(22),

    fontWeight: 'normal',
    color: '#101828',
    marginBottom: 6,
    lineHeight: RFValue(28),
  },
  pageSubtitle: {
    fontSize: RFValue(13),
    color: '#667085',

    fontWeight: 'normal',
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
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
  },
  clearButtonFull: {
    backgroundColor: '#CC0000',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  actionButtonText: {
    color: '#FFFFFF',

    fontWeight: 'normal',
    fontSize: RFValue(15),
  },
});
