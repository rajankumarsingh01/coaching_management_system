import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type BatchRow = {
  _id: string;
  name: string;
  subject: string;
  isActive: boolean;
  teacherIds: { _id: string; name: string }[];
  studentIds: { _id: string; name: string }[];
};

export default function AdminBatchesScreen() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const colors = useThemeColors();

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const filtered = useMemo(() => {
    if (!search.trim()) return batches;
    const q = search.trim().toLowerCase();
    return batches.filter(
      (b) => b.name.toLowerCase().includes(q) || (b.subject || '').toLowerCase().includes(q)
    );
  }, [batches, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Batches"
        tagline="Manage batches, teachers & students"
        rightLabel="+ Create Batch"
        onRightPress={() => router.push('/(admin)/create-batch')}
      />

      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search by name or subject"
          placeholderTextColor={colors.textFaint}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
      </View>

      <TouchableOpacity
        style={[styles.bulkAssignBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => router.push('/(admin)/assign-teacher-all')}
      >
        <Text style={[typography.bodyMedium, { color: colors.primary }]}>
          🧑‍🏫 Bulk-Assign Teacher to All Batches
        </Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchBatches}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            {loading ? 'Loading...' : 'No batches yet. Tap "+ Create Batch" to add one.'}
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard
            style={styles.row}
            onPress={() => router.push({ pathname: '/(admin)/batch-detail', params: { id: item._id } })}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                {item.subject ? `${item.subject} · ` : ''}
                {item.teacherIds.length} teacher(s) · {item.studentIds.length} student(s)
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Badge label={item.isActive ? 'Active' : 'Inactive'} tone={item.isActive ? 'success' : 'danger'} />
              <Text style={[typography.body, { color: colors.textFaint, marginLeft: spacing.sm }]}>{'\u203a'}</Text>
            </View>
          </PressableCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  searchInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  bulkAssignBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
});