import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';

type Institute = {
  _id: string;
  name: string;
  code: string;
  subscriptionStatus: string;
  billingStatus: string;
  isActive: boolean;   // NEW
};

export default function SuperAdminHome() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null); // NEW — per-card action loading
  const { logout } = useAuth();

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

  // NEW — ek specific institute ko trial-ending reminder
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

  // NEW — block/unblock toggle
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Institutes</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(superadmin)/create-institute')}
      >
        <Text style={styles.createButtonText}>+ Onboard New Institute</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reminderButton, sendingReminders && styles.disabledButton]}
        onPress={confirmSendReminders}
        disabled={sendingReminders}
      >
        {sendingReminders ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.createButtonText}>📣 Send Fee Reminders</Text>
        )}
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : (
        <FlatList
          data={institutes}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No institutes yet.</Text>}
          renderItem={({ item }) => {
            const isActioning = actioningId === item._id;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={[styles.statusPill, item.isActive ? styles.pillActive : styles.pillBlocked]}>
                    <Text style={styles.statusPillText}>{item.isActive ? 'Active' : 'Blocked'}</Text>
                  </View>
                </View>
                <Text style={styles.cardSub}>Code: {item.code}</Text>
                <Text style={styles.cardSub}>Subscription: {item.subscriptionStatus}</Text>
                <Text style={styles.cardSub}>Billing: {item.billingStatus}</Text>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[styles.cardActionBtn, styles.remindBtn]}
                    onPress={() => confirmTrialReminder(item)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.cardActionText}>📩 Remind</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardActionBtn,
                      item.isActive ? styles.blockBtn : styles.unblockBtn,
                    ]}
                    onPress={() => confirmBlockToggle(item)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.cardActionText}>
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  logout: { color: '#dc2626', fontWeight: '600' },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderButton: {
    backgroundColor: '#CA8A04',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: { opacity: 0.6 },
  createButtonText: { color: '#fff', fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  cardSub: { fontSize: 13, color: '#6b7280' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pillActive: { backgroundColor: '#dcfce7' },
  pillBlocked: { backgroundColor: '#fee2e2' },
  statusPillText: { fontSize: 11, fontWeight: '700', color: '#111827' },
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
  remindBtn: { backgroundColor: '#2563eb' },
  blockBtn: { backgroundColor: '#dc2626' },
  unblockBtn: { backgroundColor: '#16a34a' },
  cardActionText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});