import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import axiosInstance from '../../../src/api/axiosInstance';
import { useAuth } from '../../../src/context/AuthContext';
import { usePushNotifications } from '../../../src/hooks/usePushNotifications';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { StatCard } from '../../../src/components/ui/StatCard';
import { Badge } from '../../../src/components/ui/Badge';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

type DashboardOverview = {
  totalStudents: number;
  totalTeachers: number;
  totalBatches: number;
  attendance: {
    today: { presentPercent: number | null };
    last30Days: { presentPercent: number | null };
  };
  fees: {
    thisMonth: { collectionPercent: number | null };
  };
  testsPublishedThisWeek: number;
};

type BatchBreakdown = {
  batchId: string;
  batchName: string;
  studentCount: number;
  attendanceLast30DaysPercent: number | null;
  feeCollectionPercentThisMonth: number | null;
};

const pct = (v: number | null) => (v === null ? '—' : `${v}%`);

export default function AdminDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [batchBreakdown, setBatchBreakdown] = useState<BatchBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const colors = useThemeColors();

  usePushNotifications(!!user);

  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, breakdownRes] = await Promise.all([
        axiosInstance.get('/analytics/dashboard'),
        axiosInstance.get('/analytics/batch-wise'),
      ]);
      setOverview(overviewRes.data.data);
      setBatchBreakdown(breakdownRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={`Welcome, ${user?.name || ''}`} tagline="Admin Dashboard" />

      <FlatList
        data={batchBreakdown}
        keyExtractor={(item) => item.batchId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            {loading ? (
              <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                Loading dashboard...
              </Text>
            ) : overview ? (
              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <StatCard label="Students" value={String(overview.totalStudents)} icon="🎓" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Teachers" value={String(overview.totalTeachers)} icon="🧑‍🏫" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Batches" value={String(overview.totalBatches)} icon="📚" />
                </View>
                <View style={styles.statItem}>
                  <StatCard
                    label="Attendance Today"
                    value={pct(overview.attendance.today.presentPercent)}
                    icon="📊"
                    tone={
                      overview.attendance.today.presentPercent !== null && overview.attendance.today.presentPercent < 75
                        ? 'danger'
                        : 'success'
                    }
                  />
                </View>
                <View style={styles.statItem}>
                  <StatCard
                    label="Fees Collected (Month)"
                    value={pct(overview.fees.thisMonth.collectionPercent)}
                    icon="💰"
                    tone={
                      overview.fees.thisMonth.collectionPercent !== null && overview.fees.thisMonth.collectionPercent < 60
                        ? 'warning'
                        : 'success'
                    }
                  />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Tests (7d)" value={String(overview.testsPublishedThisWeek)} icon="📝" />
                </View>
              </View>
            ) : null}

            <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
              BATCH-WISE BREAKDOWN (LAST 30 DAYS)
            </Text>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              No batches yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.batchName}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              {item.studentCount} students
            </Text>
            <View style={styles.badgeRow}>
              <Badge label={`Attendance ${pct(item.attendanceLast30DaysPercent)}`} tone="info" />
              <Badge label={`Fees ${pct(item.feeCollectionPercentThisMonth)}`} tone="neutral" />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statItem: { width: '47%' },
  sectionLabel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.sm },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});