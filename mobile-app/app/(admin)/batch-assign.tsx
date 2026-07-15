import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type UserRow = { id: string; name: string; email: string; isActive: boolean };
type AssignRole = 'teacher' | 'student';

export default function BatchAssignScreen() {
  const { batchId, role } = useLocalSearchParams<{ batchId: string; role: AssignRole }>();
  const [candidates, setCandidates] = useState<UserRow[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const colors = useThemeColors();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, batchRes] = await Promise.all([
        axiosInstance.get('/users', { params: { role } }),
        axiosInstance.get(`/batches/${batchId}`),
      ]);
      setCandidates(usersRes.data.data);
      const assignedField = role === 'teacher' ? 'teacherIds' : 'studentIds';
      const ids: string[] = batchRes.data.data[assignedField].map((p: { _id: string }) => p._id);
      setAssignedIds(new Set(ids));
    } catch (err) {
      console.error('Failed to load assign screen data', err);
    } finally {
      setLoading(false);
    }
  }, [batchId, role]);

  useEffect(() => {
    load();
  }, [load]);

  // Only active, not-yet-assigned users are shown — assigning a deactivated
  // account isn't useful, and already-assigned users don't need re-assigning.
  const available = useMemo(
    () => candidates.filter((u) => u.isActive && !assignedIds.has(u.id)),
    [candidates, assignedIds]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.trim().toLowerCase();
    return available.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [available, search]);

  const handleAssign = async (user: UserRow) => {
    setAssigningId(user.id);
    try {
      const endpoint = role === 'teacher' ? 'assign-teacher' : 'assign-student';
      await axiosInstance.post(`/batches/${batchId}/${endpoint}`, { userId: user.id });
      setAssignedIds((prev) => new Set(prev).add(user.id));
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to assign');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.searchWrap}>
        <TextInput
          placeholder={`Search ${role === 'teacher' ? 'teachers' : 'students'} by name or email`}
          placeholderTextColor={colors.textFaint}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            {loading ? 'Loading...' : `No unassigned ${role === 'teacher' ? 'teachers' : 'students'} found.`}
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard
            style={styles.row}
            disabled={assigningId === item.id}
            onPress={() => handleAssign(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{item.email}</Text>
            </View>
            {assigningId === item.id ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={[typography.label, { color: colors.primary }]}>Assign</Text>
            )}
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
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});