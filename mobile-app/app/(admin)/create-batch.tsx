import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

export default function CreateBatchScreen() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const colors = useThemeColors();

  const isValid = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/batches', {
        name: name.trim(),
        subject: subject.trim() || undefined,
      });
      Alert.alert('Success', 'Batch created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>BATCH NAME</Text>
      <TextInput
        placeholder="e.g. JEE Morning Batch"
        placeholderTextColor={colors.textFaint}
        value={name}
        onChangeText={setName}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SUBJECT (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. Physics"
        placeholderTextColor={colors.textFaint}
        value={subject}
        onChangeText={setSubject}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.md }]}>
        Teachers and students can be assigned to this batch from the batch detail screen after it's created.
      </Text>

      <Button
        label={submitting ? 'Creating...' : 'Create Batch'}
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
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
});