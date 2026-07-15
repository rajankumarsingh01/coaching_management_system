import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { StatCard } from '../../src/components/ui/StatCard';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type SalaryRecord = {
  _id: string;
  teacherId: { _id: string; name: string; email: string } | null;
  month: number;
  year: number;
  baseSalary: number;
  advanceTaken: number;
  amountPaid: number;
  status: 'pending' | 'partial' | 'paid';
  remarks: string;
};

type Overview = {
  totalBaseSalary: number;
  totalAdvanceGiven: number;
  totalPaid: number;
  totalPending: number;
  teacherCount: number;
  records: SalaryRecord[];
};

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  pending: 'danger',
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AdminSalariesScreen() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/salaries/overview', { params: { month, year } });
      setOverview(data.data);
    } catch (err) {
      console.error('Failed to load salary overview', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, year]);

  useEffect(() => {
    setLoading(true);
    fetchOverview();
  }, [fetchOverview]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  };

  const remaining = useMemo(() => {
    if (!overview) return 0;
    return overview.totalBaseSalary - overview.totalAdvanceGiven - overview.totalPaid;
  }, [overview]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Salaries"
        tagline="Teacher payroll"
        rightLabel="+ Add"
        onRightPress={() => router.push('/(admin)/create-salary')}
      />

      <FlatList
        data={overview?.records ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            <View style={styles.monthRow}>
              <TouchableOpacity onPress={() => shiftMonth(-1)} style={[styles.monthBtn, { borderColor: colors.border }]}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>‹</Text>
              </TouchableOpacity>
              <Text style={[typography.h2, { color: colors.text }]}>{MONTH_NAMES[month - 1]} {year}</Text>
              <TouchableOpacity onPress={() => shiftMonth(1)} style={[styles.monthBtn, { borderColor: colors.border }]}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>›</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                Loading salaries...
              </Text>
            ) : overview ? (
              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <StatCard label="Total Base" value={`₹${overview.totalBaseSalary}`} icon="💼" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Advance Given" value={`₹${overview.totalAdvanceGiven}`} icon="🤝" tone="warning" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Paid" value={`₹${overview.totalPaid}`} icon="✅" tone="success" />
                </View>
                <View style={styles.statItem}>
                  <StatCard
                    label="Pending"
                    value={`₹${remaining}`}
                    icon="⏳"
                    tone={remaining > 0 ? 'danger' : 'neutral'}
                  />
                </View>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              No salary records for this month yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const remainingAmt = item.baseSalary - item.advanceTaken - item.amountPaid;
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(admin)/salary-detail',
                  params: {
                    id: item._id,
                    teacherName: item.teacherId?.name || 'Unknown teacher',
                    teacherEmail: item.teacherId?.email || '',
                    month: String(item.month),
                    year: String(item.year),
                    baseSalary: String(item.baseSalary),
                    advanceTaken: String(item.advanceTaken),
                    amountPaid: String(item.amountPaid),
                    status: item.status,
                    remarks: item.remarks || '',
                  },
                })
              }
            >
              <Card style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>
                      {item.teacherId?.name || 'Unknown teacher'}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                      Base ₹{item.baseSalary} · Remaining ₹{remainingAmt}
                    </Text>
                  </View>
                  <Badge label={capitalize(item.status)} tone={STATUS_TONE[item.status] ?? 'neutral'} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statItem: { width: '47%' },
  listContent: { paddingBottom: spacing.xxxl },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, marginTop: spacing.md },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});