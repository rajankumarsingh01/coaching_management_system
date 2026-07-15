import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import axiosInstance from '../../src/api/axiosInstance';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type RowError = { row: number; errors: string[] };
type UploadResult = { insertedCount: number; failedCount: number; rowErrors: RowError[] };

export default function BulkUploadQuestionsScreen() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const [file, setFile] = useState<{ uri: string; name: string; mimeType?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const colors = useThemeColors();

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv',
        'application/csv',
      ],
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    setFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      const { data } = await axiosInstance.post(`/tests/${testId}/questions/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to upload file');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.infoCard}>
        <Text style={[typography.label, { color: colors.textMuted }]}>EXPECTED COLUMNS</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
          Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D), Topic (optional)
        </Text>
        <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.xs }]}>
          .xlsx ya .csv, max 2MB
        </Text>
      </Card>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>FILE</Text>
      <TouchableOpacity
        onPress={pickFile}
        style={[styles.filePicker, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <Text style={[typography.body, { color: file ? colors.text : colors.textFaint }]}>
          {file ? `📎 ${file.name}` : 'Tap to choose a file'}
        </Text>
      </TouchableOpacity>

      <Button
        label={submitting ? 'Uploading...' : 'Upload Questions'}
        onPress={handleUpload}
        loading={submitting}
        disabled={!file}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />

      {result ? (
        <Card style={styles.resultCard}>
          <Text style={[typography.bodyMedium, { color: colors.success }]}>
            ✓ {result.insertedCount} question{result.insertedCount === 1 ? '' : 's'} added
          </Text>
          {result.failedCount > 0 ? (
            <>
              <Text style={[typography.bodyMedium, { color: colors.danger, marginTop: spacing.sm }]}>
                ✕ {result.failedCount} row{result.failedCount === 1 ? '' : 's'} failed
              </Text>
              {result.rowErrors.map((rowError) => (
                <View key={rowError.row} style={{ marginTop: spacing.sm }}>
                  <Text style={[typography.caption, { color: colors.text }]}>Row {rowError.row}:</Text>
                  {rowError.errors.map((message, index) => (
                    <Text key={index} style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm }]}>
                      • {message}
                    </Text>
                  ))}
                </View>
              ))}
            </>
          ) : null}
          <Button
            label="Done"
            variant="outline"
            onPress={() => router.back()}
            fullWidth
            style={{ marginTop: spacing.lg }}
          />
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  infoCard: { marginBottom: spacing.lg },
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  filePicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  resultCard: { marginTop: spacing.xxl },
});