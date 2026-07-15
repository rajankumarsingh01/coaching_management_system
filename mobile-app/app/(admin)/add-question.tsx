import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;
type OptionKey = (typeof OPTION_KEYS)[number];

export default function AddQuestionScreen() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Record<OptionKey, string>>({ A: '', B: '', C: '', D: '' });
  const [correctAnswer, setCorrectAnswer] = useState<OptionKey | null>(null);
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const colors = useThemeColors();

  const isValid =
    questionText.trim().length >= 3 &&
    OPTION_KEYS.every((key) => options[key].trim().length > 0) &&
    !!correctAnswer;

  const resetForm = () => {
    setQuestionText('');
    setOptions({ A: '', B: '', C: '', D: '' });
    setCorrectAnswer(null);
    setTopic('');
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post(`/tests/${testId}/questions`, {
        questionText: questionText.trim(),
        optionA: options.A.trim(),
        optionB: options.B.trim(),
        optionC: options.C.trim(),
        optionD: options.D.trim(),
        correctAnswer,
        topic: topic.trim() || undefined,
      });
      setAddedCount((count) => count + 1);
      resetForm();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {addedCount > 0 ? (
        <Text style={[typography.caption, { color: colors.success, marginBottom: spacing.md }]}>
          ✓ {addedCount} question{addedCount === 1 ? '' : 's'} added is session me — done hone par back jao
        </Text>
      ) : null}

      <Text style={[typography.label, { color: colors.textMuted }]}>QUESTION</Text>
      <TextInput
        placeholder="Question text"
        placeholderTextColor={colors.textFaint}
        value={questionText}
        onChangeText={setQuestionText}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      {OPTION_KEYS.map((key) => (
        <View key={key}>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>OPTION {key}</Text>
          <TextInput
            placeholder={`Option ${key}`}
            placeholderTextColor={colors.textFaint}
            value={options[key]}
            onChangeText={(text) => setOptions((prev) => ({ ...prev, [key]: text }))}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
        </View>
      ))}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>CORRECT ANSWER</Text>
      <View style={styles.chipRow}>
        {OPTION_KEYS.map((key) => {
          const selected = correctAnswer === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setCorrectAnswer(key)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primaryMuted : colors.surface,
                },
              ]}
            >
              <Text style={[typography.bodyMedium, { color: selected ? colors.primary : colors.text }]}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>TOPIC (OPTIONAL)</Text>
      <TextInput
        placeholder="e.g. Algebra"
        placeholderTextColor={colors.textFaint}
        value={topic}
        onChangeText={setTopic}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Adding...' : 'Add Question'}
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});