import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Teacher = { _id: string; name: string; email: string };

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function CreateSalaryScreen() {
  const today = new Date();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(String(today.getFullYear()));
  const [baseSalary, setBaseSalary] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data } = await axiosInstance.get('/users', { params: { role: 'teacher' } });
        setTeachers(data.data);
      } catch (err) {
        console.error('Failed to load teachers', err);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const isValid = !!selectedTeacherId && Number(year) >= 2000 && Number(baseSalary) >= 0 && baseSalary !== '';

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/salaries', {
        teacherId: selectedTeacherId,
        month,
        year: Number(year),
        baseSalary: Number(baseSalary),
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Success', 'Salary record created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create salary record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SELECT TEACHER</Text>
      {loadingTeachers ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : teachers.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No teachers found.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {teachers.map((t) => {
            const active = t._id === selectedTeacherId;
            return (
              <PressableCard
                key={t._id}
                onPress={() => setSelectedTeacherId(t._id)}
                style={[
                  styles.teacherRow,
                  { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryMuted : colors.background },
                ]}
              >
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{t.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{t.email}</Text>
              </PressableCard>
            );
          })}
        </View>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>MONTH</Text>
      <View style={styles.chipWrap}>
        {MONTH_NAMES.map((label, idx) => {
          const active = idx + 1 === month;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => setMonth(idx + 1)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>YEAR</Text>
      <TextInput
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>BASE SALARY (₹)</Text>
      <TextInput
        placeholder="e.g. 25000"
        placeholderTextColor={colors.textFaint}
        value={baseSalary}
        onChangeText={setBaseSalary}
        keyboardType="numeric"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>REMARKS (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. July salary"
        placeholderTextColor={colors.textFaint}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Salary Record'}
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
  teacherRow: { borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});