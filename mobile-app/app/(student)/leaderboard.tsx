import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type Entry = { name: string; testsCount: number; averagePercentage: number };

export default function LeaderboardScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const { selectedBatch } = useBatch();
  const colors = useThemeColors();
  const [leaderboard, setLeaderboard] = useState<Entry[]>([]);

  // Falls back to the globally-selected batch when opened without a
  // batchId param (dashboard / profile menu) instead of showing empty.
  const effectiveBatchId = batchId || selectedBatch?._id;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!effectiveBatchId) return;
      const { data } = await axiosInstance.get(`/results/leaderboard/${effectiveBatchId}`);
      setLeaderboard(data.data);
    };
    fetchLeaderboard();
  }, [effectiveBatchId]);

  const getMedal = (idx: number) => (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Leaderboard" tagline={selectedBatch ? selectedBatch.name : undefined} />
      <FlatList
        data={leaderboard}
        keyExtractor={(item, idx) => item.name + idx}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            No results yet.
          </Text>
        }
        renderItem={({ item, index }) => (
          <Card style={styles.row} padded={false}>
            <View style={styles.rowInner}>
              <Text style={[typography.h2, { color: colors.text, width: 40 }]}>{getMedal(index)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>{item.testsCount} tests taken</Text>
              </View>
              <Text style={[typography.h2, { color: colors.primary }]}>{item.averagePercentage}%</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  row: { marginBottom: spacing.sm },
  rowInner: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
});