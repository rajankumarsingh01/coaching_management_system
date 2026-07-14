import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';

type Test = { _id: string; title: string; durationMinutes: number; questions: unknown[] };

export default function StudentTestsScreen() {
  const { selectedBatch } = useBatch();
  const [tests, setTests] = useState<Test[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBatch) return;
      const [testsRes, resultsRes] = await Promise.all([
        axiosInstance.get(`/tests/batch/${selectedBatch._id}`),
        axiosInstance.get('/results/me'),
      ]);
      setTests(testsRes.data.data);
      setAttemptedIds(new Set(resultsRes.data.data.map((r: any) => r.testId._id || r.testId)));
    };
    fetchData();
  }, [selectedBatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tests {selectedBatch ? `— ${selectedBatch.name}` : ''}</Text>

      <FlatList
        data={tests}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No tests available yet.</Text>}
        renderItem={({ item }) => {
          const attempted = attemptedIds.has(item._id);
          return (
            <TouchableOpacity
              style={styles.card}
              disabled={attempted}
              onPress={() => router.push({ pathname: '/(student)/attempt-test', params: { testId: item._id } })}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>
                {item.questions.length} questions · {item.durationMinutes} min
              </Text>
              {attempted && <Text style={styles.attemptedTag}>✅ Already attempted</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(student)/weak-topics')}>
        <Text style={styles.linkText}>📊 View Weak Topics</Text>
      </TouchableOpacity>
      {selectedBatch && (
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() =>
            router.push({ pathname: '/(student)/leaderboard', params: { batchId: selectedBatch._id } })
          }
        >
          <Text style={styles.linkText}>🏆 View Leaderboard</Text>
        </TouchableOpacity>
      )}
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
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  attemptedTag: { fontSize: 12, color: '#16a34a', marginTop: 6, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  linkRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  linkText: { fontSize: 14, fontWeight: '500', color: '#2563eb' },
});