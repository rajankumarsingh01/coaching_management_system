import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { useAuth } from '../../../src/context/AuthContext';
import { useBranding } from '../../../src/context/BrandingContext';
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
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const colors = useThemeColors();

  usePushNotifications(!!user);

  const fetchData = useCallback(async () => {
    try {
      const [attendanceRes, feesRes] = await Promise.all([
        axiosInstance.get('/attendance/me'),
        axiosInstance.get('/fees/me'),
      ]);
      setSummary(attendanceRes.data.data);
      const unpaid = feesRes.data.data.filter((f: any) => f.status !== 'paid');
      setPendingFees(unpaid.length);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, []);

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

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
        QUICK ACCESS
      </Text>

      <View style={styles.grid}>
        <PressableCard style={styles.gridItem} onPress={() => router.push('/(student)/lectures')}>
          <Text style={styles.gridIcon}>▶️</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Lectures</Text>
        </PressableCard>
        <PressableCard style={styles.gridItem} onPress={() => router.push('/(student)/homework')}>
          <Text style={styles.gridIcon}>📚</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Homework</Text>
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