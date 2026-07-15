import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function CreateHomeworkScreen() {
  const { batchId, batchName } = useLocalSearchParams<{ batchId: string; batchName: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<{ uri: string; name: string; mimeType?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const colors = useThemeColors();

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
  };

  const isValid = title.trim().length >= 2 && DATE_REGEX.test(dueDate);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('batchId', batchId);
      formData.append('dueDate', dueDate);
      if (description.trim()) formData.append('description', description.trim());
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any);
      }

      await axiosInstance.post('/homework', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Homework created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create homework');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>Batch: {batchName}</Text>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>TITLE</Text>
      <TextInput
        placeholder="e.g. Chapter 3 Exercises"
        placeholderTextColor={colors.textFaint}
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DESCRIPTION (OPTIONAL)</Text>
      <TextInput
        placeholder="Instructions for students"
        placeholderTextColor={colors.textFaint}
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DUE DATE</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={dueDate}
        onChangeText={setDueDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>ATTACHMENT (OPTIONAL — PDF / JPG / PNG)</Text>
      <TouchableOpacity
        onPress={pickFile}
        style={[styles.filePicker, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <Text style={[typography.body, { color: file ? colors.text : colors.textFaint }]}>
          {file ? `📎 ${file.name}` : 'Tap to choose a file'}
        </Text>
      </TouchableOpacity>

      <Button
        label={submitting ? 'Creating...' : 'Create Homework'}
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
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  filePicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
});