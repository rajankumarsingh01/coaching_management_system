import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { useBatch } from '../../../src/context/BatchContext';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

type Test = { _id: string; title: string; durationMinutes: number; questions: unknown[] };

export default function StudentTestsScreen() {
  const { selectedBatch } = useBatch();
  const [tests, setTests] = useState<Test[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
  const colors = useThemeColors();

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBatch) return;
      const [testsRes, resultsRes] = await Promise.all([
        axiosInstance.get(`/tests/batch/${selectedBatch._id}`),
        axiosInstance.get('/results/me'),
      ]);
      setTests(testsRes.data.data);
      // testId can populate as null if the test was deleted after the
      // student attempted it — guard against that instead of crashing.
      setAttemptedIds(
        new Set(
          resultsRes.data.data
            .filter((r: any) => r.testId)
            .map((r: any) => r.testId._id || r.testId)
        )
      );
    };
    fetchData();
  }, [selectedBatch]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Tests" tagline={selectedBatch?.name} />

      <FlatList
        data={tests}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
            No tests available yet.
          </Text>
        }
        renderItem={({ item }) => {
          const attempted = attemptedIds.has(item._id);
          return (
            <PressableCard
              style={styles.card}
              disabled={attempted}
              onPress={() => router.push({ pathname: '/(student)/attempt-test', params: { testId: item._id } })}
            >
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.title}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                {item.questions.length} questions · {item.durationMinutes} min
              </Text>
              {attempted && (
                <View style={{ marginTop: spacing.sm }}>
                  <Badge label="✅ Already attempted" tone="success" />
                </View>
              )}
            </PressableCard>
          );
        }}
        ListFooterComponent={
          <View style={styles.footerLinks}>
            <PressableCard style={styles.linkRow} onPress={() => router.push('/(student)/weak-topics')}>
              <Text style={[typography.bodyMedium, { color: colors.primary }]}>📊 View Weak Topics</Text>
            </PressableCard>
            {selectedBatch && (
              <PressableCard
                style={styles.linkRow}
                onPress={() =>
                  router.push({ pathname: '/(student)/leaderboard', params: { batchId: selectedBatch._id } })
                }
              >
                <Text style={[typography.bodyMedium, { color: colors.primary }]}>🏆 View Leaderboard</Text>
              </PressableCard>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.sm },
  footerLinks: { marginTop: spacing.md, gap: spacing.sm },
  linkRow: { paddingVertical: spacing.md },
});