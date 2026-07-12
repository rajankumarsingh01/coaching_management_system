import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';

type Batch = {
  _id: string;
  name: string;
  subject: string;
  studentIds: unknown[];
  teacherIds: unknown[];
};

export default function AdminHome() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();

  const fetchBatches = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBatches();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome, {user?.name}</Text>
          <Text style={styles.subtitle}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(admin)/create-user')}
      >
        <Text style={styles.createButtonText}>+ Create Teacher / Student / Parent</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Batches</Text>

      {loading ? (
        <Text style={styles.empty}>Loading batches...</Text>
      ) : (
        <FlatList
          data={batches}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No batches yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.subject || 'No subject set'}</Text>
              <Text style={styles.cardMeta}>
                {item.studentIds?.length || 0} students · {item.teacherIds?.length || 0} teachers
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#6b7280' },
  logout: { color: '#dc2626', fontWeight: '600' },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: { color: '#fff', fontWeight: '600' },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, color: '#6b7280' },
  cardMeta: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
});