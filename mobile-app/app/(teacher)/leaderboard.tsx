import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type LeaderboardRow = { name: string; testsCount: number; averagePercentage: number };

const toneForPercentage = (pct: number) => {
  if (pct >= 75) return 'success' as const;
  if (pct >= 40) return 'warning' as const;
  return 'danger' as const;
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function TeacherLeaderboardScreen() {
  const { batchId, batchName } = useLocalSearchParams<{ batchId: string; batchName: string }>();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/results/leaderboard/${batchId}`);
      setRows(data.data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[typography.caption, { color: colors.textMuted, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
        {batchName} · best to worst average
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchLeaderboard}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              Abhi tak koi test attempt nahi hua is batch me.
            </Text>
          }
          renderItem={({ item, index }) => (
            <Card style={styles.row}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.textFaint, width: 28 }]}>
                  {MEDALS[index] || `#${index + 1}`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                    {item.testsCount} test{item.testsCount === 1 ? '' : 's'} attempted
                  </Text>
                </View>
                <Badge label={`${Math.round(item.averagePercentage)}%`} tone={toneForPercentage(item.averagePercentage)} />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  row: { marginBottom: spacing.sm },
});
