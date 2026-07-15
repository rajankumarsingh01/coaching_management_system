import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

export default function CreateTestScreen() {
  const { batchId, batchName } = useLocalSearchParams<{ batchId: string; batchName: string }>();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const colors = useThemeColors();

  const durationNum = Number(duration);
  const isValid = title.trim().length >= 2 && duration.trim().length > 0 && durationNum > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/tests', {
        title: title.trim(),
        batchId,
        durationMinutes: durationNum,
      });
      Alert.alert('Success', 'Test created. Ab questions add karo.', [
        {
          text: 'OK',
          onPress: () => router.replace({ pathname: '/(teacher)/test-detail', params: { id: data.data._id } }),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create test');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>Batch: {batchName}</Text>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>TITLE</Text>
      <TextInput
        placeholder="e.g. Unit Test 1 - Algebra"
        placeholderTextColor={colors.textFaint}
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DURATION (MINUTES)</Text>
      <TextInput
        placeholder="e.g. 30"
        placeholderTextColor={colors.textFaint}
        value={duration}
        onChangeText={(text) => setDuration(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Test'}
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