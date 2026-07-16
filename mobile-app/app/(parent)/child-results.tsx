import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

type ResultRecord = { _id: string; testId: string; score: number; totalQuestions: number; percentage: number; createdAt: string };
type WeakTopic = { topic: string; correct: number; total: number; percentage: number };

export default function ChildResultsScreen() {
  const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName: string }>();
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;
      setError('');
      try {
        const [resultsRes, weakRes] = await Promise.all([
          axiosInstance.get(`/results/student/${studentId}`),
          axiosInstance.get(`/results/weak-topics/student/${studentId}`),
        ]);
        setResults(resultsRes.data.data || []);
        setWeakTopics(weakRes.data.data.weakTopics || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load results');
      }
    };
    fetchData();
  }, [studentId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{studentName}'s Results</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {weakTopics.length > 0 && (
        <View style={styles.weakBox}>
          <Text style={styles.weakTitle}>⚠️ Weak Topics</Text>
          {weakTopics.map((t) => (
            <Text key={t.topic} style={styles.weakItem}>
              {t.topic} — {t.percentage}% ({t.correct}/{t.total} correct)
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionLabel}>Test History</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No test results yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.score}>
              {item.score}/{item.totalQuestions} ({item.percentage}%)
            </Text>
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
  weakBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  weakTitle: { fontSize: 14, fontWeight: '700', color: '#b91c1c', marginBottom: 6 },
  weakItem: { fontSize: 13, color: '#7f1d1d', marginBottom: 2 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  date: { fontSize: 14, color: '#374151' },
  score: { fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});