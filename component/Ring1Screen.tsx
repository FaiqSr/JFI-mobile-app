import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface Ring1ScreenProps {
  namaOperator: string;
  setNamaOperator: (v: string) => void;
  nomorSO: string;
  setNomorSO: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  jobNoted: string;
  setJobNoted: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  materialType: string;
  setMaterialType: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  classVal: string;
  setClassVal: (v: string) => void;
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

export const Ring1Screen: React.FC<Ring1ScreenProps> = ({
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
      {/* HEADER SECTION */}
      <Text style={styles.headerTitle}>Production Ring 1</Text>
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

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Job Description</Text>
            <TextInput
              style={styles.input}
              value={jobDescription}
              onChangeText={setJobDescription}
              placeholder="Description"
              placeholderTextColor="#A0AEC0"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Job Noted</Text>
            <TextInput
              style={styles.input}
              value={jobNoted}
              onChangeText={setJobNoted}
              placeholder="Notes"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>
      </View>

      {/* CARD 2: PRODUCT */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Product</Text>

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={product}
              onChangeText={setProduct}
              placeholder="Enter product name"
              placeholderTextColor="#A0AEC0"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Material Type</Text>
            <TextInput
              style={styles.input}
              value={materialType}
              onChangeText={setMaterialType}
              placeholder="Select material type"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>

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
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Class</Text>
            <TextInput
              style={styles.input}
              value={classVal}
              onChangeText={setClassVal}
              placeholder="Select class"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>
      </View>

      {/* CARD 3: TIME & ACTIVITIES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Time & Activities</Text>

        <View style={styles.rowTwoCol}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Time Start</Text>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {startTimestamp ? formatHHMM(startTimestamp) : 'HH:MM'}
              </Text>
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Time Stop</Text>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
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

        {/* INPUT DOWNTIME ACTIVITIES */}
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

          <View style={[styles.inputGroup, { flex: 1 }]}>
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

          <View style={[styles.inputGroup, { flex: 1 }]}>
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

          <View style={[styles.inputGroup, { flex: 1 }]}>
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

      {/* CARD 4: QUANTITY */}
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
        <TouchableOpacity style={styles.backBtnNew} onPress={onBack}>
          <Text style={styles.actionBtnTextNew}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtnNew} onPress={onSave}>
          <Text style={styles.actionBtnTextNew}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.clearBtnNew} onPress={onClear}>
        <Text style={styles.actionBtnTextNew}>Clear</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
    marginTop: 8,
  },
  headerSubtitle: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
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
    alignItems: 'center',
  },
  timeText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  startStopBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
  },
  startStateBtn: {
    backgroundColor: '#000000',
  },
  stopStateBtn: {
    backgroundColor: '#DC2626',
  },
  startStopBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  unitInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  unitText: {
    position: 'absolute',
    right: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  actionRowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  backBtnNew: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveBtnNew: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  clearBtnNew: {
    backgroundColor: '#C50000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionBtnTextNew: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});