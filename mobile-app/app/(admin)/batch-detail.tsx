import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, PressableCard } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';
import { radius } from '../../src/theme/tokens';

type Person = { _id: string; name: string; email: string };

type BatchDetail = {
  _id: string;
  name: string;
  subject: string;
  isActive: boolean;
  teacherIds: Person[];
  studentIds: Person[];
};

export default function BatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const colors = useThemeColors();

  const fetchBatch = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/batches/${id}`);
      setBatch(data.data);
      setName(data.data.name);
      setSubject(data.data.subject || '');
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

  const hasChanges = batch ? name.trim() !== batch.name || subject.trim() !== (batch.subject || '') : false;

  const handleSave = async () => {
    if (!batch || !hasChanges) return;
    const payload: Record<string, string> = {};
    if (name.trim() !== batch.name) payload.name = name.trim();
    if (subject.trim() !== (batch.subject || '')) payload.subject = subject.trim();

    setSaving(true);
    try {
      await axiosInstance.patch(`/batches/${id}`, payload);
      await fetchBatch();
      Alert.alert('Saved', 'Batch details updated');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update batch');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = () => {
    if (!batch) return;
    const activating = !batch.isActive;
    Alert.alert(
      activating ? 'Reactivate Batch' : 'Deactivate Batch',
      activating
        ? `${batch.name} will become active again.`
        : `${batch.name} will be deactivated. Its records are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: activating ? 'Reactivate' : 'Deactivate',
          style: activating ? 'default' : 'destructive',
          onPress: async () => {
            setTogglingStatus(true);
            try {
              if (activating) {
                await axiosInstance.patch(`/batches/${id}`, { isActive: true });
              } else {
                await axiosInstance.delete(`/batches/${id}`);
              }
              await fetchBatch();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
            } finally {
              setTogglingStatus(false);
            }
          },
        },
      ]
    );
  };

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
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>BATCH NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SUBJECT</Text>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        placeholder="e.g. Physics"
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={saving ? 'Saving...' : 'Save Changes'}
        onPress={handleSave}
        loading={saving}
        disabled={!hasChanges}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />

      <View style={styles.sectionHeaderRow}>
        <Text style={[typography.h2, { color: colors.text }]}>Teachers ({batch.teacherIds.length})</Text>
        <Button
          label="+ Assign Teacher"
          size="sm"
          variant="secondary"
          onPress={() => router.push({ pathname: '/(admin)/batch-assign', params: { batchId: id, role: 'teacher' } })}
        />
      </View>
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

      <View style={styles.sectionHeaderRow}>
        <Text style={[typography.h2, { color: colors.text }]}>Students ({batch.studentIds.length})</Text>
        <Button
          label="+ Assign Student"
          size="sm"
          variant="secondary"
          onPress={() => router.push({ pathname: '/(admin)/batch-assign', params: { batchId: id, role: 'student' } })}
        />
      </View>
      {batch.studentIds.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>No students assigned yet.</Text>
      ) : (
        batch.studentIds.map((s) => (
          <PressableCard
            key={s._id}
            style={styles.personRow}
            onPress={() =>
              router.push({ pathname: '/(admin)/student-attendance', params: { studentId: s._id, studentName: s.name } })
            }
          >
            <View style={styles.personRowInner}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{s.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{s.email}</Text>
              </View>
              <Text style={{ color: colors.textFaint }}>›</Text>
            </View>
          </PressableCard>
        ))
      )}

      <Button
        label={togglingStatus ? 'Please wait...' : batch.isActive ? 'Deactivate Batch' : 'Reactivate Batch'}
        onPress={handleToggleStatus}
        loading={togglingStatus}
        variant={batch.isActive ? 'danger' : 'outline'}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  personRow: { marginBottom: spacing.sm },
  personRowInner: { flexDirection: 'row', alignItems: 'center' },
});