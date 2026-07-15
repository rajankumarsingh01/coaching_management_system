import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { StatCard } from '../../../src/components/ui/StatCard';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';

type Batch = { _id: string; name: string; subject: string };

type FeeRecord = {
  _id: string;
  studentId: { _id: string; name: string; email: string } | null;
  amount: number;
  status: 'paid' | 'pending' | 'due';
  dueDate: string;
  paidDate: string | null;
};

type StatusFilter = 'all' | 'paid' | 'pending' | 'due';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  due: 'danger',
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'due', label: 'Due' },
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TeacherFeesScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingFees, setLoadingFees] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const colors = useThemeColors();

  useEffect(() => {
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
  }, []);

  const fetchFees = useCallback(async () => {
    if (!selectedBatchId) return;
    setLoadingFees(true);
    try {
      const { data } = await axiosInstance.get(`/fees/batch/${selectedBatchId}`);
      setRecords(data.data);
    } catch (err) {
      console.error('Failed to load fees', err);
    } finally {
      setLoadingFees(false);
      setRefreshing(false);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFees();
  };

  const summary = useMemo(() => {
    const total = records.reduce((sum, r) => sum + r.amount, 0);
    const paid = records.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
    const pendingCount = records.filter((r) => r.status === 'pending').length;
    const dueCount = records.filter((r) => r.status === 'due').length;
    const collectionPercentage = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, pendingCount, dueCount, collectionPercentage };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (statusFilter === 'all') return records;
    return records.filter((r) => r.status === statusFilter);
  }, [records, statusFilter]);

  const selectedBatch = batches.find((b) => b._id === selectedBatchId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Fees" tagline="View-only fee records for your batches" />

      {loadingBatches ? (
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          Loading batches...
        </Text>
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          Koi batch assign nahi hui hai abhi tak.
        </Text>
      ) : (
        <>
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

          <FlatList
            data={filteredRecords}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListHeaderComponent={
              <>
                {loadingFees ? (
                  <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
                    Loading fees...
                  </Text>
                ) : (
                  <View style={styles.statGrid}>
                    <View style={styles.statItem}>
                      <StatCard
                        label="Collected"
                        value={`${summary.collectionPercentage}%`}
                        icon="💰"
                        tone={summary.collectionPercentage < 60 ? 'warning' : 'success'}
                      />
                    </View>
                    <View style={styles.statItem}>
                      <StatCard label="Total Amount" value={`₹${summary.total}`} icon="📄" />
                    </View>
                    <View style={styles.statItem}>
                      <StatCard
                        label="Pending"
                        value={String(summary.pendingCount)}
                        icon="⏳"
                        tone={summary.pendingCount > 0 ? 'warning' : 'neutral'}
                      />
                    </View>
                    <View style={styles.statItem}>
                      <StatCard
                        label="Overdue"
                        value={String(summary.dueCount)}
                        icon="⚠️"
                        tone={summary.dueCount > 0 ? 'danger' : 'neutral'}
                      />
                    </View>
                  </View>
                )}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                  {FILTERS.map((f) => {
                    const active = f.key === statusFilter;
                    return (
                      <TouchableOpacity
                        key={f.key}
                        onPress={() => setStatusFilter(f.key)}
                        style={[
                          styles.chip,
                          { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                        ]}
                      >
                        <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{f.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            }
            ListEmptyComponent={
              !loadingFees ? (
                <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                  No fee records for {selectedBatch?.name}.
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.studentId?.name || 'Unknown student'}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{item.studentId?.email || '—'}</Text>
                  </View>
                  <Badge label={capitalize(item.status)} tone={STATUS_TONE[item.status] ?? 'neutral'} />
                </View>
                <View style={styles.cardBottomRow}>
                  <Text style={[typography.h2, { color: colors.text }]}>₹{item.amount}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {item.status === 'paid' && item.paidDate
                      ? `Paid: ${new Date(item.paidDate).toLocaleDateString()}`
                      : `Due: ${new Date(item.dueDate).toLocaleDateString()}`}
                  </Text>
                </View>
              </Card>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  statItem: { width: '47%' },
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  filterRow: { paddingVertical: spacing.sm, gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.sm },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
});
