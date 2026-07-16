import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Card, PressableCard } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string; subject: string };
type Status = 'present' | 'absent' | 'late';
type RawRecord = { _id: string; studentId: { _id: string; name: string; email: string }; status: Status; date: string };

type StudentSummary = {
  studentId: string;
  name: string;
  email: string;
  present: number;
  total: number;
  percentage: number;
};

const toneForPercentage = (pct: number) => {
  if (pct >= 75) return 'success' as const;
  if (pct >= 50) return 'warning' as const;
  return 'danger' as const;
};

const daysAgoISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export default function TeacherAttendanceReportScreen() {
  const params = useLocalSearchParams<{ batchId?: string; batchName?: string }>();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(params.batchId || null);
  const [startDate, setStartDate] = useState(daysAgoISO(30));
  const [endDate, setEndDate] = useState(daysAgoISO(0));
  const [records, setRecords] = useState<RawRecord[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(!params.batchId);
  const [loadingReport, setLoadingReport] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    if (params.batchId) return;
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
        if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, [params.batchId]);

  const fetchReport = useCallback(async () => {
    if (!selectedBatchId) return;
    setLoadingReport(true);
    try {
      const { data } = await axiosInstance.get(`/attendance/batch/${selectedBatchId}/report`, {
        params: { startDate, endDate },
      });
      setRecords(data.data);
    } catch (err) {
      console.error('Failed to load attendance report', err);
    } finally {
      setLoadingReport(false);
    }
  }, [selectedBatchId, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const summaries: StudentSummary[] = useMemo(() => {
    const byStudent = new Map<string, StudentSummary>();
    records.forEach((rec) => {
      const sid = rec.studentId?._id;
      if (!sid) return;
      if (!byStudent.has(sid)) {
        byStudent.set(sid, {
          studentId: sid,
          name: rec.studentId.name,
          email: rec.studentId.email,
          present: 0,
          total: 0,
          percentage: 0,
        });
      }
      const entry = byStudent.get(sid)!;
      entry.total += 1;
      if (rec.status === 'present' || rec.status === 'late') entry.present += 1;
    });
    return Array.from(byStudent.values())
      .map((e) => ({ ...e, percentage: e.total > 0 ? Math.round((e.present / e.total) * 100) : 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  const selectedBatch = batches.find((b) => b._id === selectedBatchId);
  const batchNameLabel = params.batchName || selectedBatch?.name || '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {!params.batchId && (
        <>
          {loadingBatches ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {batches.map((batch) => {
                const active = batch._id === selectedBatchId;
                return (
                  <TouchableOpacity
                    key={batch._id}
                    onPress={() => setSelectedBatchId(batch._id)}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{batch.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.xs }]}>START DATE</Text>
          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.xs }]}>END DATE</Text>
          <TextInput
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
        </View>
      </View>
      <View style={styles.applyWrap}>
        <Button label="Apply" size="sm" variant="secondary" onPress={fetchReport} />
      </View>

      <Text style={[typography.caption, { color: colors.textMuted, paddingHorizontal: spacing.lg }]}>
        {batchNameLabel} · {startDate} to {endDate}
      </Text>

      {loadingReport ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={summaries}
          keyExtractor={(item) => item.studentId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              Is date range me koi attendance record nahi mila.
            </Text>
          }
          renderItem={({ item }) => (
            <PressableCard
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: '/(teacher)/student-attendance',
                  params: { studentId: item.studentId, studentName: item.name },
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {item.present}/{item.total} days present
                </Text>
              </View>
              <Badge label={`${item.percentage}%`} tone={toneForPercentage(item.percentage)} />
            </PressableCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  dateRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  applyWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.sm, alignItems: 'flex-start' },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});
