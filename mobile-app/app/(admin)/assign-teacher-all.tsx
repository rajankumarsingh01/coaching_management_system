import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type TeacherRow = { id: string; name: string; email: string; isActive: boolean };

export default function AssignTeacherAllScreen() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const colors = useThemeColors();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/users', { params: { role: 'teacher' } });
      setTeachers(data.data);
    } catch (err) {
      console.error('Failed to load teachers', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Sirf active teachers dikhao — deactivated account ko batches assign
  // karna useful nahi hai.
  const active = useMemo(() => teachers.filter((t) => t.isActive), [teachers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return active;
    const q = search.trim().toLowerCase();
    return active.filter((t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
  }, [active, search]);

  const confirmAssign = (teacher: TeacherRow) => {
    Alert.alert(
      'Assign to All Batches',
      `${teacher.name} ko institute ke saare active batches me teacher ke roop me assign kar diya jaayega. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Assign', onPress: () => handleAssign(teacher) },
      ]
    );
  };

  const handleAssign = async (teacher: TeacherRow) => {
    setAssigningId(teacher.id);
    try {
      const { data } = await axiosInstance.post('/batches/assign-teacher-all', { userId: teacher.id });
      Alert.alert('Success', `${teacher.name} assigned to ${data.data.assignedBatchCount} batch(es).`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to assign teacher to all batches');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search teacher by name or email"
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
            {loading ? 'Loading...' : 'No active teachers found.'}
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard
            style={styles.row}
            disabled={assigningId === item.id}
            onPress={() => confirmAssign(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{item.email}</Text>
            </View>
            {assigningId === item.id ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={[typography.label, { color: colors.primary }]}>Assign to All</Text>
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