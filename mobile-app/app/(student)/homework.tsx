import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';

type Homework = {
  _id: string;
  title: string;
  dueDate: string;
  attachmentUrl: string;
  createdBy: { name: string };
};

export default function StudentHomeworkScreen() {
  const { selectedBatch } = useBatch();
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedBatch) return;
    const [hwRes, subsRes] = await Promise.all([
      axiosInstance.get(`/homework/batch/${selectedBatch._id}`),
      axiosInstance.get('/submissions/me'),
    ]);
    setHomeworkList(hwRes.data.data);
    setSubmittedIds(new Set(subsRes.data.data.map((s: any) => s.homeworkId._id || s.homeworkId)));
    setRefreshing(false);
  }, [selectedBatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework {selectedBatch ? `— ${selectedBatch.name}` : ''}</Text>

      <FlatList
        data={homeworkList}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
        ListEmptyComponent={<Text style={styles.empty}>No homework assigned yet.</Text>}
        renderItem={({ item }) => {
          const submitted = submittedIds.has(item._id);
          const overdue = isOverdue(item.dueDate);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/(student)/submit-homework',
                  params: { homeworkId: item._id, title: item.title },
                })
              }
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>by {item.createdBy?.name}</Text>
              <Text style={[styles.dueDate, overdue && !submitted && styles.overdueText]}>
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </Text>
              {submitted ? (
                <Text style={styles.submittedTag}>✅ Submitted</Text>
              ) : overdue ? (
                <Text style={styles.overdueTag}>⚠️ Overdue — submit now</Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
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
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  dueDate: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  overdueText: { color: '#dc2626', fontWeight: '600' },
  submittedTag: { fontSize: 12, color: '#16a34a', marginTop: 6, fontWeight: '600' },
  overdueTag: { fontSize: 12, color: '#dc2626', marginTop: 6, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});