import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  batchIds: string[];
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const colors = useThemeColors();

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/users/${id}`);
      setUser(data.data);
      setName(data.data.name);
      setEmail(data.data.email);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load user', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const hasChanges = user ? name.trim() !== user.name || email.trim() !== user.email : false;

  const handleSave = async () => {
    if (!user || !hasChanges) return;
    const payload: Record<string, string> = {};
    if (name.trim() !== user.name) payload.name = name.trim();
    if (email.trim() !== user.email) payload.email = email.trim();

    setSaving(true);
    try {
      const { data } = await axiosInstance.patch(`/users/${id}`, payload);
      setUser((prev) => (prev ? { ...prev, ...data.data } : prev));
      Alert.alert('Saved', 'User details updated');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = () => {
    if (!user) return;
    const activating = !user.isActive;
    Alert.alert(
      activating ? 'Reactivate User' : 'Deactivate User',
      activating
        ? `${user.name} will be able to log in again.`
        : `${user.name} will no longer be able to log in. Their records are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: activating ? 'Reactivate' : 'Deactivate',
          style: activating ? 'default' : 'destructive',
          onPress: async () => {
            setTogglingStatus(true);
            try {
              if (activating) {
                await axiosInstance.patch(`/users/${id}/reactivate`);
              } else {
                await axiosInstance.delete(`/users/${id}`);
              }
              await fetchUser();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
            } finally {
              setTogglingStatus(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.badgeRow}>
        <Badge label={capitalize(user.role)} tone="info" />
        <Badge label={user.isActive ? 'Active' : 'Inactive'} tone={user.isActive ? 'success' : 'danger'} />
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>EMAIL</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.lg }]}>
        {user.role !== 'parent' ? `Enrolled in ${user.batchIds.length} batch(es) · ` : ''}
        Joined {new Date(user.createdAt).toLocaleDateString()}
      </Text>

      <Button
        label={saving ? 'Saving...' : 'Save Changes'}
        onPress={handleSave}
        loading={saving}
        disabled={!hasChanges}
        fullWidth
        style={{ marginTop: spacing.xl }}
      />

      <Button
        label={togglingStatus ? 'Please wait...' : user.isActive ? 'Deactivate User' : 'Reactivate User'}
        onPress={handleToggleStatus}
        loading={togglingStatus}
        variant={user.isActive ? 'danger' : 'outline'}
        fullWidth
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
});