import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface SealingElementScreenProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted?: string;
  setJobNoted?: (v: string) => void;
  product?: string;
  setProduct?: (v: string) => void;
  materialType?: string;
  setMaterialType?: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
  hoop: string;
  setHoop?: (v: string) => void;
  filler?: string;
  setFiller?: (v: string) => void;
  ir?: string;
  setIr?: (v: string) => void;
  orVal?: string;
  setOrVal?: (v: string) => void;
  startTimestamp: number | null;
  stopTimestamp: number | null;
  isStarted: boolean;
  handleToggleStartStop: () => void;
  formatHHMM: (t: number | null) => string;
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
  parseIntegerInput: (text: string) => number;
  onBack: () => void;
  onSave: () => void;
  onClear: () => void;
}

export const SealingElementScreen: React.FC<SealingElementScreenProps> = ({
  namaOperator,
  setNamaOperator,
  nomorSO,
  setNomorSO,
  jobDescription,
  setJobDescription,
  jobNoted,
  setJobNoted,
  product,
  setProduct,
  materialType,
  setMaterialType,
  size,
  setSize,
  classVal,
  setClassVal,
  hoop,
  setHoop,
  filler,
  setFiller,
  ir,
  setIr,
  orVal,
  setOrVal,
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
  finishGood,
  setFinishGood,
  parseIntegerInput,
  onBack,
  onSave,
  onClear,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* HEADER */}
      <Text style={styles.headerTitle}>Production Sealing Element</Text>
      <Text style={styles.headerSubtitle}>
        Fill in the required information, product details, and production quantities.
      </Text>

      {/* CARD 1: INFORMATION */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Operator Name</Text>
          <TextInput
            style={styles.input}
            value={namaOperator}
            onChangeText={setNamaOperator}
            placeholder="Enter operator name"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SO Number</Text>
          <TextInput
            style={styles.input}
            value={nomorSO}
            onChangeText={setNomorSO}
            placeholder="Enter SO number"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Description</Text>
          <TextInput
            style={styles.input}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Description"
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      {/* CARD 2: TYPE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Type</Text>
        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Size</Text>
            <TextInput
              style={styles.input}
              value={size}
              onChangeText={setSize}
              placeholder="Enter size"
              placeholderTextColor="#A0AEC0"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Class</Text>
            <TextInput
              style={styles.input}
              value={classVal}
              onChangeText={setClassVal}
              placeholder="Enter class"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>
      </View>

      {/* CARD 3: MATERIAL */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Material</Text>

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.labelCaps}>HOOP</Text>
            <TextInput
              style={styles.input}
              value={hoop || ''}
              onChangeText={setHoop}
              placeholder="Select material type"
              placeholderTextColor="#A0AEC0"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.labelCaps}>FILLER</Text>
            <TextInput
              style={styles.input}
              value={filler || ''}
              onChangeText={setFiller}
              placeholder="Select material type"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.labelCaps}>IR</Text>
            <TextInput
              style={styles.input}
              value={ir || ''}
              onChangeText={setIr}
              placeholder="Select material type"
              placeholderTextColor="#A0AEC0"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.labelCaps}>OR</Text>
            <TextInput
              style={styles.input}
              value={orVal || ''}
              onChangeText={setOrVal}
              placeholder="Select material type"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>
      </View>

      {/* CARD 4: TIME & ACTIVITIES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Time & Activities</Text>

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Time Start</Text>
            <View style={styles.timeDisplay}>
              <Text style={[styles.timeText, startTimestamp ? styles.timeTextActive : null]}>
                {startTimestamp ? formatHHMM(startTimestamp) : 'HH:MM'}
              </Text>
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Time Stop</Text>
            <View style={styles.timeDisplay}>
              <Text style={[styles.timeText, stopTimestamp ? styles.timeTextActive : null]}>
                {stopTimestamp ? formatHHMM(stopTimestamp) : 'HH:MM'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startStopBtn, isStarted ? styles.stopStateBtn : styles.startStateBtn]}
          onPress={handleToggleStartStop}
        >
          <Text style={styles.startStopBtnText}>
            {isStarted ? 'STOP' : 'START'}
          </Text>
        </TouchableOpacity>

        {/* DOWNTIME FIELDS */}
        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Ganti Order - A</Text>
            <View style={styles.unitInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={gantiOrder ? String(gantiOrder) : ''}
                onChangeText={(t) => setGantiOrder(parseIntegerInput(t))}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.unitText}>menit</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Repair - B</Text>
            <View style={styles.unitInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={repair ? String(repair) : ''}
                onChangeText={(t) => setRepair(parseIntegerInput(t))}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.unitText}>menit</Text>
            </View>
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Material Tunggu - C</Text>
            <View style={styles.unitInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={materialTunggu ? String(materialTunggu) : ''}
                onChangeText={(t) => setMaterialTunggu(parseIntegerInput(t))}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.unitText}>menit</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Operator - D</Text>
            <View style={styles.unitInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={operatorTime ? String(operatorTime) : ''}
                onChangeText={(t) => setOperatorTime(parseIntegerInput(t))}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.unitText}>menit</Text>
            </View>
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Maintenance - E</Text>
            <View style={styles.unitInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={maintenance ? String(maintenance) : ''}
                onChangeText={(t) => setMaintenance(parseIntegerInput(t))}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.unitText}>menit</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Checking - F</Text>
            <View style={styles.unitInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={checking ? String(checking) : ''}
                onChangeText={(t) => setChecking(parseIntegerInput(t))}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.unitText}>menit</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CARD 5: QUANTITY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quantity</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Finish Good</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={finishGood ? String(finishGood) : ''}
            onChangeText={(t) => setFinishGood(parseIntegerInput(t))}
            placeholder="0"
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      {/* BOTTOM BUTTONS */}
      <View style={styles.actionRowTwo}>
        <TouchableOpacity style={styles.blackBtn} onPress={onBack}>
          <Text style={styles.actionBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.blackBtn} onPress={onSave}>
          <Text style={styles.actionBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
        <Text style={styles.actionBtnText}>Clear</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontFamily: 'Hanuman',
    fontSize: 24,
    color: '#0F172A',
    marginBottom: 4,
    marginTop: 16,
  },
  headerSubtitle: {
    fontFamily: 'Hanuman',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Hanuman',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Hanuman',
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  labelCaps: {
    fontFamily: 'Hanuman',
    fontSize: 12,
    color: '#1E293B',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Hanuman',
    fontSize: 14,
    color: '#0F172A',
  },
  rowTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
  },
  timeText: {
    color: '#A0AEC0',
    fontFamily: 'Hanuman',
    fontSize: 14,
  },
  timeTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  startStopBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  startStateBtn: {
    backgroundColor: '#000000',
  },
  stopStateBtn: {
    backgroundColor: '#DC2626',
  },
  startStopBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Hanuman',
    fontSize: 15,
    letterSpacing: 1,
  },
  unitInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  unitText: {
    position: 'absolute',
    right: 12,
    color: '#1E293B',
    fontFamily: 'Hanuman',
    fontSize: 13,
  },
  actionRowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  blackBtn: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: '#CC0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Hanuman',
    fontSize: 15,
  },
});

export default SealingElementScreen;