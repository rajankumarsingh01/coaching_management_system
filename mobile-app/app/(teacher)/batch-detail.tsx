import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type Person = { _id: string; name: string; email: string };

type BatchDetail = {
  _id: string;
  name: string;
  subject: string;
  isActive: boolean;
  teacherIds: Person[];
  studentIds: Person[];
};

export default function TeacherBatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  const fetchBatch = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/batches/${id}`);
      setBatch(data.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load batch', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  if (loading || !batch) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.badgeRow}>
        <Badge label={batch.isActive ? 'Active' : 'Inactive'} tone={batch.isActive ? 'success' : 'danger'} />
        {batch.subject ? <Badge label={batch.subject} tone="info" /> : null}
      </View>

      <Text style={[typography.h1, { color: colors.text, marginTop: spacing.sm }]}>{batch.name}</Text>

      <View style={styles.quickRow}>
        <Button
          label="📊 Attendance Report"
          size="sm"
          variant="outline"
          onPress={() => router.push({ pathname: '/(teacher)/attendance-report', params: { batchId: batch._id, batchName: batch.name } })}
        />
        <Button
          label="🏆 Leaderboard"
          size="sm"
          variant="outline"
          onPress={() => router.push({ pathname: '/(teacher)/leaderboard', params: { batchId: batch._id, batchName: batch.name } })}
        />
      </View>
      <View style={styles.quickRow}>
        <Button
          label="📝 Notes & Lectures"
          size="sm"
          variant="outline"
          onPress={() => router.push({ pathname: '/(teacher)/batch-content', params: { batchId: batch._id, batchName: batch.name } })}
        />
        <Button
          label="🧪 Tests"
          size="sm"
          variant="outline"
          onPress={() => router.push({ pathname: '/(teacher)/batch-tests', params: { batchId: batch._id, batchName: batch.name } })}
        />
        <Button
          label="📋 Homework"
          size="sm"
          variant="outline"
          onPress={() => router.push({ pathname: '/(teacher)/batch-homework', params: { batchId: batch._id, batchName: batch.name } })}
        />
      </View>

      <Text style={[typography.h2, { color: colors.text }, styles.sectionHeader]}>Teachers ({batch.teacherIds.length})</Text>
      {batch.teacherIds.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>No teachers assigned yet.</Text>
      ) : (
        batch.teacherIds.map((t) => (
          <Card key={t._id} style={styles.personRow}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{t.name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{t.email}</Text>
          </Card>
        ))
      )}

      <Text style={[typography.h2, { color: colors.text }, styles.sectionHeader]}>Students ({batch.studentIds.length})</Text>
      {batch.studentIds.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>No students assigned yet.</Text>
      ) : (
        batch.studentIds.map((s) => (
          <Card key={s._id} style={styles.personRow}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  badgeRow: { flexDirection: 'row', gap: spacing.sm },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  sectionHeader: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  personRow: { marginBottom: spacing.sm },
});
