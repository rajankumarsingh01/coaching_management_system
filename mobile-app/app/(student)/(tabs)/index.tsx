import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { useAuth } from '../../../src/context/AuthContext';
import { useBranding } from '../../../src/context/BrandingContext';
import { useBatch } from '../../../src/context/BatchContext';
import { usePushNotifications } from '../../../src/hooks/usePushNotifications';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { StatCard } from '../../../src/components/ui/StatCard';
import { PressableCard } from '../../../src/components/ui/Card';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

type AttendanceSummary = { percentage: number; total: number; present: number };

export default function StudentHome() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [pendingFees, setPendingFees] = useState(0);
  const [homeworkPending, setHomeworkPending] = useState<number | null>(null);
  const [weakTopicsCount, setWeakTopicsCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const { selectedBatch } = useBatch();
  const colors = useThemeColors();

  usePushNotifications(!!user);

  const fetchData = useCallback(async () => {
    try {
      const [attendanceRes, feesRes, weakTopicsRes] = await Promise.all([
        axiosInstance.get('/attendance/me'),
        axiosInstance.get('/fees/me'),
        axiosInstance.get('/results/weak-topics/me'),
      ]);
      setSummary(attendanceRes.data.data);
      const unpaid = feesRes.data.data.filter((f: any) => f.status !== 'paid');
      setPendingFees(unpaid.length);
      setWeakTopicsCount(weakTopicsRes.data.data.weakTopics.length);

      // Homework needs a batch context — only fetch once one's resolved,
      // so this doesn't block/blank the other stats while batches load.
      if (selectedBatch) {
        const [hwRes, subsRes] = await Promise.all([
          axiosInstance.get(`/homework/batch/${selectedBatch._id}`),
          axiosInstance.get('/submissions/me'),
        ]);
        const submittedIds = new Set(subsRes.data.data.map((s: any) => s.homeworkId._id || s.homeworkId));
        const pending = hwRes.data.data.filter((h: any) => !submittedIds.has(h._id)).length;
        setHomeworkPending(pending);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, [selectedBatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <ScreenHeader
        title={`${branding?.displayName || 'Welcome'}, ${user?.name || ''}`}
        tagline={branding?.tagline}
        bannerUrl={branding?.bannerImageUrl}
        rightLabel="Logout"
        onRightPress={logout}
      />

      <View style={styles.statRow}>
        <StatCard
          label="Attendance"
          value={summary ? `${summary.percentage}%` : '—'}
          subtext={summary ? `${summary.present}/${summary.total} days` : undefined}
          icon="📊"
          tone={summary && summary.percentage < 75 ? 'danger' : 'success'}
          onPress={() => router.push('/(student)/attendance')}
        />
        <StatCard
          label="Fees"
          value={pendingFees > 0 ? `${pendingFees} pending` : 'All clear'}
          icon="💰"
          tone={pendingFees > 0 ? 'warning' : 'success'}
          onPress={() => router.push('/(student)/fees')}
        />
      </View>

      <View style={styles.statRow}>
        <StatCard
          label="Homework"
          value={homeworkPending !== null ? (homeworkPending > 0 ? `${homeworkPending} pending` : 'All done') : '—'}
          icon="📚"
          tone={homeworkPending && homeworkPending > 0 ? 'warning' : 'success'}
          onPress={() => router.push('/(student)/homework')}
        />
        <StatCard
          label="Weak Topics"
          value={weakTopicsCount !== null ? String(weakTopicsCount) : '—'}
          subtext={weakTopicsCount === 0 ? 'Great job!' : undefined}
          icon="⚠️"
          tone={weakTopicsCount && weakTopicsCount > 0 ? 'danger' : 'success'}
          onPress={() => router.push('/(student)/weak-topics')}
        />
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
        QUICK ACCESS
      </Text>

      <View style={styles.grid}>
        <PressableCard style={styles.gridItem} onPress={() => router.push('/(student)/lectures')}>
          <Text style={styles.gridIcon}>▶️</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Lectures</Text>
        </PressableCard>
        <PressableCard style={styles.gridItem} onPress={() => router.push('/(student)/leaderboard')}>
          <Text style={styles.gridIcon}>🏆</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Leaderboard</Text>
        </PressableCard>
        <PressableCard style={styles.gridItem} onPress={() => router.push('/(student)/calendar')}>
          <Text style={styles.gridIcon}>📅</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Calendar</Text>
        </PressableCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionLabel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  gridIcon: { fontSize: 24, marginBottom: spacing.xs },
});