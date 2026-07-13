import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

type Fee = {
  _id: string;
  amount: number;
  status: string;
  dueDate: string;
  batchId: { name: string };
};

const STATUS_COLORS: Record<string, string> = {
  paid: '#16a34a',
  pending: '#ca8a04',
  due: '#dc2626',
};

export default function ChildFeesScreen() {
  const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName: string }>();
  const [fees, setFees] = useState<Fee[]>([]);

  useEffect(() => {
    const fetchFees = async () => {
      if (!studentId) return;
      const { data } = await axiosInstance.get(`/fees/student/${studentId}`);
      setFees(data.data);
    };
    fetchFees();
  }, [studentId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{studentName}'s Fees</Text>

      <FlatList
        data={fees}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No fee records yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.batchName}>{item.batchId?.name}</Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
            <Text style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  batchName: { fontSize: 14, fontWeight: '600' },
  amount: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  dueDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  status: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});