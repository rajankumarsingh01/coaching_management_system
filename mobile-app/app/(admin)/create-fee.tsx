import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type Student = { _id: string; name: string; email: string };

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateFeeScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const selectBatch = useCallback(async (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(null);
    setStudents([]);
    setLoadingStudents(true);
    try {
      const { data } = await axiosInstance.get(`/batches/${batchId}`);
      setStudents(data.data.studentIds || []);
    } catch (err) {
      console.error('Failed to load batch students', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const isValid =
    !!selectedBatchId && !!selectedStudentId && Number(amount) > 0 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudentId,
        batchId: selectedBatchId,
        amount: Number(amount),
        dueDate,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Fee record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT BATCH</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No batches yet.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => selectBatch(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedBatchId && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT STUDENT</Text>
          {loadingStudents ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : students.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No students enrolled in this batch.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {students.map((s) => {
                const active = s._id === selectedStudentId;
                return (
                  <PressableCard
                    key={s._id}
                    onPress={() => setSelectedStudentId(s._id)}
                    style={[
                      styles.studentRow,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
                  </PressableCard>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>AMOUNT (₹)</Text>
      <TextInput
        placeholder="e.g. 2500"
        placeholderTextColor={colors.textFaint}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. August tuition fee"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Fee Record'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  studentRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});