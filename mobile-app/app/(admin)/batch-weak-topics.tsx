import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type TopicRow = { topic: string; correct: number; total: number; percentage: number };

const toneForPercentage = (pct: number) => {
  if (pct >= 75) return 'success' as const;
  if (pct >= 40) return 'warning' as const;
  return 'danger' as const;
};

export default function BatchWeakTopicsScreen() {
  const { batchId, batchName } = useLocalSearchParams<{ batchId: string; batchName: string }>();
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/results/weak-topics/batch/${batchId}`);
      // worst topics first — sabse zyada attention chahiye unhi ko upar dikhao
      setTopics([...data.data.allTopics].sort((a: TopicRow, b: TopicRow) => a.percentage - b.percentage));
    } catch (err) {
      console.error('Failed to load weak topics', err);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[typography.caption, { color: colors.textMuted, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
        {batchName} · topic-wise class accuracy (worst first)
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.topic}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchTopics}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              Abhi tak koi test attempt nahi hua is batch me.
            </Text>
          }
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.topic}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                    {item.correct}/{item.total} correct across the class
                  </Text>
                </View>
                <Badge label={`${item.percentage}%`} tone={toneForPercentage(item.percentage)} />
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