import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type DraftQuestion = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  topic: string;
  _accepted: boolean; // client-side only — controls the checkbox/discard state
};

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export default function GenerateQuestionsScreen() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('5');
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('medium');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const colors = useThemeColors();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Topic required', 'Please enter a topic first');
      return;
    }
    setGenerating(true);
    setDrafts([]);
    try {
      const { data } = await axiosInstance.post(`/tests/${testId}/generate-questions`, {
        topic: topic.trim(),
        count: Math.min(Math.max(parseInt(count, 10) || 1, 1), 10),
        difficulty,
      });
      setDrafts(data.data.map((q: any) => ({ ...q, _accepted: true })));
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const toggleAccept = (index: number) => {
    setDrafts((prev) => prev.map((q, i) => (i === index ? { ...q, _accepted: !q._accepted } : q)));
  };

  const updateField = (index: number, field: keyof DraftQuestion, value: string) => {
    setDrafts((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const handleSave = async () => {
    const accepted = drafts.filter((q) => q._accepted);
    if (accepted.length === 0) {
      Alert.alert('Nothing selected', 'Accept at least one question to add it to the test');
      return;
    }
    setSaving(true);
    try {
      const payload = accepted.map(({ _accepted, ...rest }) => rest);
      await axiosInstance.post(`/tests/${testId}/questions/add-generated`, { questions: payload });
      Alert.alert('Added', `${accepted.length} question(s) added to the test`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }]}>TOPIC</Text>
      <TextInput
        value={topic}
        onChangeText={setTopic}
        placeholder="e.g. Trigonometry"
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, { marginTop: spacing.lg }]}>NUMBER OF QUESTIONS (max 10)</Text>
      <TextInput
        value={count}
        onChangeText={setCount}
        keyboardType="number-pad"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, { marginTop: spacing.lg }]}>DIFFICULTY</Text>
      <View style={styles.difficultyRow}>
        {DIFFICULTIES.map((d) => (
          <Button
            key={d}
            label={d.charAt(0).toUpperCase() + d.slice(1)}
            size="sm"
            variant={difficulty === d ? 'primary' : 'outline'}
            onPress={() => setDifficulty(d)}
          />
        ))}
      </View>

      <Button
        label={generating ? 'Generating...' : '🤖 Generate Questions'}
        onPress={handleGenerate}
        loading={generating}
        fullWidth
        style={{ marginTop: spacing.xl }}
      />

      {drafts.length > 0 && (
        <>
          <Text style={[typography.label, { color: colors.textMuted, marginTop: spacing.xxl }]}>
            REVIEW ({drafts.filter((q) => q._accepted).length}/{drafts.length} selected)
          </Text>
          {drafts.map((q, index) => (
            <Card key={index} style={[styles.draftCard, !q._accepted && { opacity: 0.4 }]}>
              <TextInput
                value={q.questionText}
                onChangeText={(v) => updateField(index, 'questionText', v)}
                multiline
                style={[typography.bodyMedium, { color: colors.text }]}
              />
              {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                <View key={letter} style={styles.optionRow}>
                  <Text style={[typography.caption, { color: colors.textMuted, width: 20 }]}>{letter}.</Text>
                  <TextInput
                    value={q[`option${letter}` as 'optionA']}
                    onChangeText={(v) => updateField(index, `option${letter}` as 'optionA', v)}
                    style={[typography.body, { color: q.correctAnswer === letter ? colors.success : colors.text, flex: 1 }]}
                  />
                </View>
              ))}
              <View style={styles.cardFooter}>
                <Button
                  label={q._accepted ? '✓ Accepted' : 'Rejected'}
                  size="sm"
                  variant={q._accepted ? 'secondary' : 'outline'}
                  onPress={() => toggleAccept(index)}
                />
                <Button label="🗑 Drop" size="sm" variant="danger" onPress={() => setDrafts((prev) => prev.filter((_, i) => i !== index))} />
              </View>
            </Card>
          ))}

          <Button
            label={saving ? 'Saving...' : 'Add Selected to Test'}
            onPress={handleSave}
            loading={saving}
            disabled={drafts.filter((q) => q._accepted).length === 0}
            fullWidth
            style={{ marginTop: spacing.lg, marginBottom: spacing.xxxl }}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  input: { borderWidth: 1, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 15, marginTop: spacing.sm },
  difficultyRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  draftCard: { marginTop: spacing.md },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  cardFooter: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});