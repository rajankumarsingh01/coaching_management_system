import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';

type UserRow = { id: string; name: string; email: string; isActive: boolean };
type RoleFilter = 'teacher' | 'student' | 'parent';

const ROLE_TABS: { key: RoleFilter; label: string }[] = [
  { key: 'teacher', label: 'Teachers' },
  { key: 'student', label: 'Students' },
  { key: 'parent', label: 'Parents' },
];

export default function AdminUsersScreen() {
  const [role, setRole] = useState<RoleFilter>('student');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const colors = useThemeColors();

  const fetchUsers = useCallback(async (r: RoleFilter) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/users', { params: { role: r } });
      setUsers(data.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(role);
  }, [role, fetchUsers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Users"
        tagline="Manage teachers, students & parents"
        rightLabel="+ Add User"
        onRightPress={() => router.push('/(admin)/create-user')}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {ROLE_TABS.map((t) => {
          const active = t.key === role;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setRole(t.key)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search by name or email"
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
            {loading ? 'Loading...' : 'No users found.'}
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard
            style={styles.row}
            onPress={() => router.push({ pathname: '/(admin)/user-detail', params: { id: item.id, role } })}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{item.email}</Text>
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
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  searchWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  searchInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
});