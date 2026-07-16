import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';
import { useThemeColors } from '../../src/theme/useThemeColors';

type Institute = {
  _id: string;
  name: string;
  code: string;
  subscriptionStatus: string;
  billingStatus: string;
  isActive: boolean;
};

export default function SuperAdminHome() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { logout } = useAuth();
  const colors = useThemeColors();

  const fetchInstitutes = async () => {
    try {
      const { data } = await axiosInstance.get('/institutes');
      setInstitutes(data.data);
    } catch (err) {
      console.error('Failed to load institutes', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

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
    try {
      const { data } = await axiosInstance.post(`/institutes/${item._id}/send-trial-reminder`);
      Alert.alert('Done', `Notified ${data.data.notifiedAdmins} admin(s) of "${item.name}".`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send reminder');
    } finally {
      setActioningId(null);
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
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>All Institutes</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={[styles.logout, { color: colors.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(superadmin)/create-institute')}
      >
        <Text style={[styles.createButtonText, { color: colors.onPrimary }]}>+ Onboard New Institute</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reminderButton, { backgroundColor: colors.warning }, sendingReminders && styles.disabledButton]}
        onPress={confirmSendReminders}
        disabled={sendingReminders}
      >
        {sendingReminders ? (
          <ActivityIndicator color={colors.onPrimary} size="small" />
        ) : (
          <Text style={[styles.createButtonText, { color: colors.onPrimary }]}>📣 Send Fee Reminders</Text>
        )}
      </TouchableOpacity>

      {loading ? (
        <Text style={[styles.empty, { color: colors.textFaint }]}>Loading...</Text>
      ) : (
        <FlatList
          data={institutes}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={[styles.empty, { color: colors.textFaint }]}>No institutes yet.</Text>}
          renderItem={({ item }) => {
            const isActioning = actioningId === item._id;
            return (
              <View style={[styles.card, { borderColor: colors.border }]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: item.isActive ? colors.successBg : colors.dangerBg },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: colors.text }]}>
                      {item.isActive ? 'Active' : 'Blocked'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>Code: {item.code}</Text>
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>Subscription: {item.subscriptionStatus}</Text>
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>Billing: {item.billingStatus}</Text>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[styles.cardActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => confirmTrialReminder(item)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <ActivityIndicator color={colors.onPrimary} size="small" />
                    ) : (
                      <Text style={[styles.cardActionText, { color: colors.onPrimary }]}>📩 Remind</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardActionBtn,
                      { backgroundColor: item.isActive ? colors.danger : colors.success },
                    ]}
                    onPress={() => confirmBlockToggle(item)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <ActivityIndicator color={colors.onPrimary} size="small" />
                    ) : (
                      <Text style={[styles.cardActionText, { color: colors.onPrimary }]}>
                        {item.isActive ? '🚫 Block' : '✅ Unblock'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  logout: { fontWeight: '600' },
  createButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: { opacity: 0.6 },
  createButtonText: { fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 40 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  cardActionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  cardActionBtn: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cardActionText: { fontWeight: '600', fontSize: 13 },
});