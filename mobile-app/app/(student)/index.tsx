import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';
import { useBatch } from '../../src/context/BatchContext';

export default function StudentHome() {
  const [summary, setSummary] = useState<{ percentage: number; total: number; present: number } | null>(null);
  const [pendingFees, setPendingFees] = useState(0);
  const { user, logout } = useAuth();
  const { selectedBatch } = useBatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, feesRes] = await Promise.all([
          axiosInstance.get('/attendance/me'),
          axiosInstance.get('/fees/me'),
        ]);
        setSummary(attendanceRes.data.data);
        const unpaid = feesRes.data.data.filter((f: any) => f.status !== 'paid');
        setPendingFees(unpaid.length);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.name}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/attendance')}>
        <Text style={styles.cardLabel}>Attendance</Text>
        <Text style={styles.cardValue}>{summary ? `${summary.percentage}%` : '—'}</Text>
        {summary && (
          <Text style={styles.cardSub}>
            {summary.present} / {summary.total} days present
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/fees')}>
        <Text style={styles.cardLabel}>Fees</Text>
        <Text style={[styles.cardValue, pendingFees > 0 && styles.cardValueWarning]}>
          {pendingFees > 0 ? `${pendingFees} pending` : 'All clear'}
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.smallCard, { marginRight: 8 }]}
          onPress={() => router.push('/(student)/notes')}
        >
          <Text style={styles.smallCardLabel}>📄 Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/(student)/lectures')}>
          <Text style={styles.smallCardLabel}>▶️ Lectures</Text>
        </TouchableOpacity>
      </View>

      {!selectedBatch && (
        <Text style={styles.hint}>No batch assigned yet — ask your admin to assign you to a batch.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  logout: { color: '#dc2626', fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 14, color: '#6b7280' },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },
  cardValueWarning: { color: '#dc2626', fontSize: 20 },
  cardSub: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 4 },
  smallCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  smallCardLabel: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center' },
});