import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';

export default function StudentHome() {
  const [summary, setSummary] = useState<{ percentage: number; total: number; present: number } | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await axiosInstance.get('/attendance/me');
        setSummary(data.data);
      } catch (err) {
        console.error('Failed to load attendance', err);
      }
    };
    fetchAttendance();
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
  },
  cardLabel: { fontSize: 14, color: '#6b7280' },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },
  cardSub: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
});