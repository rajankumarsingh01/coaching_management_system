import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { StatCard } from '../../src/components/ui/StatCard';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type SalaryRecord = {
  _id: string;
  month: number;
  year: number;
  baseSalary: number;
  advanceTaken: number;
  amountPaid: number;
  status: 'pending' | 'partial' | 'paid';
};

type Summary = {
  totalBaseSalary: number;
  totalAdvanceTaken: number;
  totalPaid: number;
  monthsRecorded: number;
  monthsFullyPaid: number;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  pending: 'danger',
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TeacherSalaryScreen() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/salaries/me');
      setRecords(data.data.records);
      setSummary(data.data.summary);
    } catch (err) {
      console.error('Failed to load salary history', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="My Salary" tagline="Monthly payment history" />

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          loading ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              Loading...
            </Text>
          ) : summary ? (
            <View style={styles.statGrid}>
              <View style={styles.statItem}>
                <StatCard label="Total Earned" value={`₹${summary.totalAdvanceTaken + summary.totalPaid}`} icon="💰" tone="success" />
              </View>
              <View style={styles.statItem}>
                <StatCard label="Months Recorded" value={String(summary.monthsRecorded)} icon="🗓️" />
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
              No salary records yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const remaining = item.baseSalary - item.advanceTaken - item.amountPaid;
          return (
            <Card style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>
                  {MONTH_NAMES[item.month - 1]} {item.year}
                </Text>
                <Badge label={capitalize(item.status)} tone={STATUS_TONE[item.status] ?? 'neutral'} />
              </View>
              <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xs }]}>₹{item.baseSalary}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                Advance ₹{item.advanceTaken} · Paid ₹{item.amountPaid}
                {remaining > 0 ? ` · Remaining ₹${remaining}` : ''}
              </Text>
            </Card>
          );
        }}
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
    marginBottom: spacing.md,
  },
  statItem: { width: '47%' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.sm },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});