import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';

type Child = { id: string; name: string; email: string };

export default function ParentHome() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data } = await axiosInstance.get('/users/my-children');
        setChildren(data.data);
      } catch (err) {
        console.error('Failed to load children', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.name}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Your Children</Text>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No children linked yet. Ask the institute admin to link your child's account.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.email}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/(parent)/child-attendance',
                      params: { studentId: item.id, studentName: item.name },
                    })
                  }
                >
                  <Text style={styles.actionText}>Attendance →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/(parent)/child-fees',
                      params: { studentId: item.id, studentName: item.name },
                    })
                  }
                >
                  <Text style={styles.actionText}>Fees →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  logout: { color: '#dc2626', fontWeight: '600' },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, color: '#6b7280' },
  actionRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  actionText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});