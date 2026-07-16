import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { StatCard } from '../../../src/components/ui/StatCard';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

type Institute = {
  _id: string;
  name: string;
  code: string;
  subscriptionStatus: string;
  billingStatus: string;
  isActive: boolean;
};

export default function SuperAdminInstitutesScreen() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actioningAction, setActioningAction] = useState<'remind' | 'block' | null>(null);
  const colors = useThemeColors();

  const fetchInstitutes = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/institutes');
      setInstitutes(data.data);
    } catch (err) {
      console.error('Failed to load institutes', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInstitutes();
  }, [fetchInstitutes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInstitutes();
  };

  const confirmSendReminders = () => {
    Alert.alert(
      'Send Fee Reminders',
      'Ye action platform ke saare institutes me due/overdue fees wale students ko push notification bhejega. Continue?',
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

  const confirmTrialReminder = (item: Institute) => {
    Alert.alert(
      'Send Trial Reminder',
      `"${item.name}" ke admin(s) ko trial-ending reminder bhejna hai?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => sendTrialReminder(item) },
      ]
    );
  };

  const sendTrialReminder = async (item: Institute) => {
    setActioningId(item._id);
    setActioningAction('remind');
    try {
      const { data } = await axiosInstance.post(`/institutes/${item._id}/send-trial-reminder`);
      Alert.alert('Done', `Notified ${data.data.notifiedAdmins} admin(s) of "${item.name}".`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send reminder');
    } finally {
      setActioningId(null);
      setActioningAction(null);
    }
  };

  const confirmBlockToggle = (item: Institute) => {
    const willBlock = item.isActive;
    Alert.alert(
      willBlock ? 'Block Institute' : 'Unblock Institute',
      willBlock
        ? `"${item.name}" ke SAARE users (admin/teacher/student/parent) turant login/access khoo denge, chahe already logged in hi kyu na ho. Continue?`
        : `"${item.name}" ka access wapas normal ho jaayega. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: willBlock ? 'Block' : 'Unblock',
          style: willBlock ? 'destructive' : 'default',
          onPress: () => toggleBlock(item),
        },
      ]
    );
  };

  const toggleBlock = async (item: Institute) => {
    setActioningId(item._id);
    setActioningAction('block');
    try {
      const endpoint = item.isActive ? 'block' : 'unblock';
      await axiosInstance.patch(`/institutes/${item._id}/${endpoint}`);
      setInstitutes((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isActive: !item.isActive } : i))
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update institute status');
    } finally {
      setActioningId(null);
      setActioningAction(null);
    }
  };

  const total = institutes.length;
  const active = institutes.filter((i) => i.isActive).length;
  const blocked = total - active;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Institutes" tagline="Platform overview & controls" />

      <FlatList
        data={institutes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            {loading ? (
              <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                Loading...
              </Text>
            ) : (
              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <StatCard label="Total Institutes" value={String(total)} icon="🎓" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Active" value={String(active)} icon="✅" tone="success" />
                </View>
                <View style={styles.statItem}>
                  <StatCard label="Blocked" value={String(blocked)} icon="⚠️" tone={blocked > 0 ? 'danger' : 'neutral'} />
                </View>
              </View>
            )}

            <View style={styles.actionsCol}>
              <Button
                label="+ Onboard New Institute"
                onPress={() => router.push('/(superadmin)/(tabs)/onboard')}
                fullWidth
              />
              <Button
                label={sendingReminders ? 'Sending...' : '📣 Send Fee Reminders'}
                variant="secondary"
                onPress={confirmSendReminders}
                disabled={sendingReminders}
                loading={sendingReminders}
                fullWidth
              />
            </View>

            <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
              ALL INSTITUTES
            </Text>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              No institutes yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const isActioning = actioningId === item._id;
          return (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={[typography.h2, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Badge label={item.isActive ? 'Active' : 'Blocked'} tone={item.isActive ? 'success' : 'danger'} />
              </View>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                Code: {item.code}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Subscription: {item.subscriptionStatus}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Billing: {item.billingStatus}
              </Text>

              <View style={styles.cardActionsRow}>
                <Button
                  label="📩 Remind"
                  size="sm"
                  variant="outline"
                  onPress={() => confirmTrialReminder(item)}
                  disabled={isActioning}
                  loading={isActioning && actioningAction === 'remind'}
                  style={styles.flexBtn}
                />
                <Button
                  label={item.isActive ? '🚫 Block' : '✅ Unblock'}
                  size="sm"
                  variant={item.isActive ? 'danger' : 'primary'}
                  onPress={() => confirmBlockToggle(item)}
                  disabled={isActioning}
                  loading={isActioning && actioningAction === 'block'}
                  style={[styles.flexBtn, !item.isActive && { backgroundColor: colors.success }]}
                />
              </View>
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
  },
  statItem: { width: '31%' },
  actionsCol: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  listContent: { paddingBottom: spacing.xxxl },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardActionsRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  flexBtn: { flex: 1 },
});