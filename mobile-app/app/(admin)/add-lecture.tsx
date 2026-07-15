import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

export default function AddLectureScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const colors = useThemeColors();

  const isValid = title.trim().length >= 2 && YOUTUBE_URL_REGEX.test(youtubeUrl.trim());

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/lectures', {
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        batchId,
      });
      Alert.alert('Success', 'Lecture added', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add lecture');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>TITLE</Text>
      <TextInput
        placeholder="e.g. Newton's Laws - Full Lecture"
        placeholderTextColor={colors.textFaint}
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>YOUTUBE URL</Text>
      <TextInput
        placeholder="https://youtube.com/watch?v=..."
        placeholderTextColor={colors.textFaint}
        value={youtubeUrl}
        onChangeText={setYoutubeUrl}
        autoCapitalize="none"
        keyboardType="url"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />
      {youtubeUrl.trim().length > 0 && !YOUTUBE_URL_REGEX.test(youtubeUrl.trim()) ? (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.sm }]}>
          Must be a valid youtube.com or youtu.be link
        </Text>
      ) : null}

      <Button
        label={submitting ? 'Adding...' : 'Add Lecture'}
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