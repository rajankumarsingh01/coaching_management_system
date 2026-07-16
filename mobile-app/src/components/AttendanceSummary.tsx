// src/components/AttendanceSummary.tsx
//
// Shared "overall attendance" view — used by student (their own), parent
// (a linked child), and admin/teacher (any student they select). Coaching
// institutes here don't run a fixed subject/period timetable like a college
// timetable, so this is intentionally NOT a subject-wise table — attendance
// is marked per batch/session and rolled up into one overall percentage,
// same as what the backend's getStudentAttendanceSummary already returns.

import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, typography, radius } from '../theme/tokens';

export type AttendanceRecord = { _id: string; date: string; status: 'present' | 'absent' | 'late' };

type Props = {
  loading: boolean;
  error?: string;
  percentage: number;
  total: number;
  present: number; // present + late, as returned by the backend summary
  records: AttendanceRecord[];
  requiredPercentage?: number; // optional institute policy line, e.g. 75
};

// Same 75 / 50 thresholds already used on the teacher's attendance report,
// kept here too so the colour language means the same thing everywhere in
// the app.
const toneForPercentage = (pct: number) => {
  if (pct >= 75) return 'success' as const;
  if (pct >= 50) return 'warning' as const;
  return 'danger' as const;
};

const STATUS_LABEL: Record<string, string> = { present: 'Present', absent: 'Absent', late: 'Late' };

export function AttendanceSummary({ loading, error, percentage, total, present, records, requiredPercentage }: Props) {
  const colors = useThemeColors();
  const tone = toneForPercentage(percentage);
  const toneColor = { success: colors.success, warning: colors.warning, danger: colors.danger }[tone];
  const toneBg = { success: colors.successBg, warning: colors.warningBg, danger: colors.dangerBg }[tone];

  const absentCount = Math.max(total - present, 0);
  const lateCount = records.filter((r) => r.status === 'late').length;
  const presentOnlyCount = Math.max(present - lateCount, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={records}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View>
          <Card elevated style={[styles.heroCard, { backgroundColor: toneBg, borderColor: toneBg }]}>
            <Text style={[typography.label, { color: colors.textMuted }]}>OVERALL ATTENDANCE</Text>
            <Text style={[typography.display, { fontSize: 44, color: toneColor, marginTop: spacing.xs }]}>
              {percentage}%
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(Math.max(percentage, 0), 100)}%`, backgroundColor: toneColor },
                ]}
              />
            </View>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
              {present} / {total} sessions attended
              {requiredPercentage ? ` · ${requiredPercentage}% required` : ''}
            </Text>
          </Card>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={[typography.h2, { color: colors.success }]}>{presentOnlyCount}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Present</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[typography.h2, { color: colors.danger }]}>{absentCount}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Absent</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[typography.h2, { color: colors.warning }]}>{lateCount}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Late</Text>
            </Card>
          </View>

          <Text style={[typography.h2, { color: colors.text }, styles.historyHeader]}>Attendance History</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          No attendance records yet.
        </Text>
      }
      renderItem={({ item }) => (
        <Card style={styles.row}>
          <Text style={[typography.body, { color: colors.text }]}>
            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
          <Badge label={STATUS_LABEL[item.status] ?? item.status} tone={toneForStatus(item.status)} />
        </Card>
      )}
    />
  );
}

const toneForStatus = (status: string) => {
  if (status === 'present') return 'success' as const;
  if (status === 'late') return 'warning' as const;
  return 'danger' as const;
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxxl },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  heroCard: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.xxl, borderWidth: 1 },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  historyHeader: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});
