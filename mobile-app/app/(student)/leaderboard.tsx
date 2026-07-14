import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

type Entry = { name: string; testsCount: number; averagePercentage: number };

export default function LeaderboardScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const [leaderboard, setLeaderboard] = useState<Entry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!batchId) return;
      const { data } = await axiosInstance.get(`/results/leaderboard/${batchId}`);
      setLeaderboard(data.data);
    };
    fetchLeaderboard();
  }, [batchId]);

  const getMedal = (idx: number) => (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item, idx) => item.name + idx}
        ListEmptyComponent={<Text style={styles.empty}>No results yet.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{getMedal(index)}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.testsCount} tests taken</Text>
            </View>
            <Text style={styles.percentage}>{item.averagePercentage}%</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rank: { fontSize: 18, fontWeight: 'bold', width: 40 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, color: '#6b7280' },
  percentage: { fontSize: 16, fontWeight: '700', color: '#2563eb' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});