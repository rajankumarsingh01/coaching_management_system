import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';

type Topic = { topic: string; correct: number; total: number; percentage: number };

export default function WeakTopicsScreen() {
  const [weakTopics, setWeakTopics] = useState<Topic[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchWeakTopics = async () => {
      const { data } = await axiosInstance.get('/results/weak-topics/me');
      setWeakTopics(data.data.weakTopics);
      setAllTopics(data.data.allTopics);
    };
    fetchWeakTopics();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weak Topics</Text>
      <Text style={styles.subtitle}>Topics below 50% accuracy — focus here!</Text>

      <FlatList
        data={weakTopics}
        keyExtractor={(item) => item.topic}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No weak topics detected yet — either great job, or attempt more tests for data!
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.topicName}>{item.topic}</Text>
            <Text style={styles.stat}>
              {item.correct}/{item.total} correct — {item.percentage}%
            </Text>
          </View>
        )}
      />

      {allTopics.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>All Topics</Text>
          <FlatList
            data={allTopics}
            keyExtractor={(item) => item.topic + '-all'}
            renderItem={({ item }) => (
              <View style={styles.rowAll}>
                <Text style={styles.rowAllText}>{item.topic}</Text>
                <Text style={styles.rowAllPct}>{item.percentage}%</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  topicName: { fontSize: 15, fontWeight: '600', color: '#991b1b' },
  stat: { fontSize: 12, color: '#b91c1c', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  rowAll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowAllText: { fontSize: 13, color: '#374151' },
  rowAllPct: { fontSize: 13, fontWeight: '600' },
});