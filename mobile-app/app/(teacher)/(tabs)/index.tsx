import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { useAuth } from '../../../src/context/AuthContext';
import { usePushNotifications } from '../../../src/hooks/usePushNotifications';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { StatCard } from '../../../src/components/ui/StatCard';
import { Badge } from '../../../src/components/ui/Badge';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

type BatchRow = {
  _id: string;
  name: string;
  subject: string;
  isActive: boolean;
  teacherIds: unknown[];
  studentIds: unknown[];
};

const QUICK_ACTIONS = [
  { icon: '📝', label: 'Notes & Lectures', route: '/(teacher)/content-batches' },
  { icon: '🧪', label: 'Tests & Quizzes', route: '/(teacher)/test-batches' },
  { icon: '📋', label: 'Homework', route: '/(teacher)/homework-batches' },
  { icon: '🗓️', label: 'Calendar', route: '/(teacher)/calendar-events' },
] as const;

export default function TeacherDashboard() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const colors = useThemeColors();

  usePushNotifications(!!user);

  const fetchBatches = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBatches();
  };

  const totalStudents = batches.reduce((sum, b) => sum + (b.studentIds?.length || 0), 0);
  const activeBatches = batches.filter((b) => b.isActive).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={`Welcome, ${user?.name || ''}`} tagline="Teacher Dashboard" />

      <FlatList
        data={batches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            {loading ? (
              <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                Loading dashboard...
              </Text>
            ) : (
              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <StatCard label="My Batches" value={String(batches.length)} icon="📚" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Active Batches" value={String(activeBatches)} icon="✅" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Total Students" value={String(totalStudents)} icon="🎓" />
                </View>
                <View style={styles.statItem}>
                  <StatCard
                    label="Mark Attendance"
                    value="Today"
                    icon="📊"
                    onPress={() => router.push('/(teacher)/(tabs)/attendance')}
                  />
                </View>
              </View>
            )}

            <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>QUICK ACTIONS</Text>
            <View style={styles.quickRow}>
              {QUICK_ACTIONS.map((item) => (
                <PressableCard
                  key={item.route}
                  style={styles.quickItem}
                  onPress={() => router.push(item.route as any)}
                >
                  <Text style={styles.quickIcon}>{item.icon}</Text>
                  <Text style={[typography.caption, { color: colors.text, textAlign: 'center' }]}>{item.label}</Text>
                </PressableCard>
              ))}
            </View>

            <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
              MY BATCHES
            </Text>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              Koi batch assign nahi hui hai abhi tak.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <PressableCard
            style={styles.card}
            onPress={() => router.push({ pathname: '/(teacher)/batch-detail', params: { id: item._id } })}
          >
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {item.subject ? `${item.subject} · ` : ''}
                  {item.studentIds?.length || 0} student(s)
                </Text>
              </View>
              <Badge label={item.isActive ? 'Active' : 'Inactive'} tone={item.isActive ? 'success' : 'danger'} />
            </View>
          </PressableCard>
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
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  quickItem: { width: '22%', alignItems: 'center', paddingVertical: spacing.md },
  quickIcon: { fontSize: 22, marginBottom: spacing.xs },
  sectionLabel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
