import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { StatCard } from '../../../src/components/ui/StatCard';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';

type FeeRecord = {
  _id: string;
  studentId: { _id: string; name: string; email: string } | null;
  batchId: { _id: string; name: string } | null;
  amount: number;
  status: 'paid' | 'pending' | 'due';
  dueDate: string;
  paidDate: string | null;
};

type FeeOverview = {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  pendingCount: number;
  dueCount: number;
  collectionPercentage: number;
  records: FeeRecord[];
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

export default function AdminFeesScreen() {
  const [overview, setOverview] = useState<FeeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const [sendingReminders, setSendingReminders] = useState(false);

  const colors = useThemeColors();




  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/fees/overview');
      setOverview(data.data);
    } catch (err) {
      console.error('Failed to load fee overview', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  const filteredRecords = useMemo(() => {
    if (!overview) return [];
    return overview.records.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch =
        search.trim() === '' ||
        r.studentId?.name?.toLowerCase().includes(search.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [overview, statusFilter, search]);

  const handleMarkPaid = (feeId: string, studentName?: string) => {
    Alert.alert(
      'Mark as Paid',
      `Mark ${studentName || 'this fee'}'s payment as received (cash/manual)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            setMarkingId(feeId);
            try {
              await axiosInstance.patch(`/fees/${feeId}/mark-paid`, {});
              await fetchOverview();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to mark fee as paid');
            } finally {
              setMarkingId(null);
            }
          },
        },
      ]
    );
  };


  const confirmSendReminders = () => {
  Alert.alert(
    'Send Fee Reminders',
    'Ye action aapke institute ke saare due/overdue fees wale students ko push notification bhejega. Continue?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', style: 'destructive', onPress: sendReminders },
    ]
  );
};

const sendReminders = async () => {
  setSendingReminders(true);
  try {
    const { data } = await axiosInstance.post('/fees/send-reminders');
    Alert.alert('Done', `Reminders sent to ${data.data.sentCount} student(s).`);
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Failed to send reminders');
  } finally {
    setSendingReminders(false);
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Fees"
        tagline="Institute-wide fee records"
        rightLabel="+ Add Fee"
        onRightPress={() => router.push('/(admin)/create-fee')}
      />

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            {loading ? (
              <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                Loading fees...
              </Text>
            ) : overview ? (
              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <StatCard
                    label="Collected"
                    value={`${overview.collectionPercentage}%`}
                    icon="💰"
                    tone={overview.collectionPercentage < 60 ? 'warning' : 'success'}
                  />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Total Amount" value={`₹${overview.totalAmount}`} icon="📄" />
                </View>
                <View style={styles.statItem}>
                  <StatCard
                    label="Pending"
                    value={String(overview.pendingCount)}
                    icon="⏳"
                    tone={overview.pendingCount > 0 ? 'warning' : 'neutral'}
                  />
                </View>
                <View style={styles.statItem}>
                  <StatCard
                    label="Overdue"
                    value={String(overview.dueCount)}
                    icon="⚠️"
                    tone={overview.dueCount > 0 ? 'danger' : 'neutral'}
                  />
                </View>
              </View>






            ) : null}

            <View style={styles.reminderWrap}>
  <Button
    label={sendingReminders ? 'Sending...' : '📣 Send Fee Reminders'}
    onPress={confirmSendReminders}
    loading={sendingReminders}
    variant="secondary"
    fullWidth
  />
</View>

            <View style={styles.searchWrap}>
              <TextInput
                placeholder="Search by student name"
                placeholderTextColor={colors.textFaint}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
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
          !loading ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              No fee records match this filter.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.studentId?.name || 'Unknown student'}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {item.batchId?.name || '—'}
                </Text>
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

            {item.status !== 'paid' && (
              <Button
                label={markingId === item._id ? 'Marking...' : 'Mark Paid'}
                onPress={() => handleMarkPaid(item._id, item.studentId?.name)}
                loading={markingId === item._id}
                variant="outline"
                size="sm"
                style={{ marginTop: spacing.md }}
              />
            )}
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
  searchWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  searchInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  listContent: { paddingBottom: spacing.xxxl },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  reminderWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
});