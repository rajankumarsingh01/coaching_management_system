import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

type HomeworkItem = { _id: string; title: string; description: string; dueDate: string };

export default function ChildHomeworkScreen() {
  const { studentId, studentName, batchId } = useLocalSearchParams<{
    studentId: string;
    studentName: string;
    batchId: string;
  }>();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomework = async () => {
      // agar child ek se zyada batch me hai to abhi single-batch flow hi support hai —
      // is version me batchId index screen se already resolve karke bheja jaata hai
      if (!batchId) return;
      setError('');
      try {
        const { data } = await axiosInstance.get(`/homework/batch/${batchId}`);
        setHomework(data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load homework');
      }
    };
    fetchHomework();
  }, [batchId]);

  if (!batchId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{studentName}'s Homework</Text>
        <Text style={styles.empty}>
          This child is in multiple batches. Multi-batch selection isn't available in this version yet —
          please check with the institute admin.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{studentName}'s Homework</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={homework}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No homework assigned yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.description ? <Text style={styles.cardSub}>{item.description}</Text> : null}
            <Text style={styles.due}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  due: { fontSize: 12, color: '#b45309', marginTop: 6, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});