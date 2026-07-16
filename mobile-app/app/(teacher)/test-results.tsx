import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useSocket } from '../../src/context/SocketContext';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type ResultRow = {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
};

const toneForPercentage = (pct: number) => {
  if (pct >= 75) return 'success' as const;
  if (pct >= 40) return 'warning' as const;
  return 'danger' as const;
};

export default function TestResultsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();
  const { socket } = useSocket();

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/results/test/${id}`);
      setResults(data.data);
    } catch (err) {
      console.error('Failed to load results', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Real-time — jaise hi koi student is test ko submit kare, list turant
  // (bina pull-to-refresh) naya attempt dikhaye
  useEffect(() => {
    if (!socket || !id) return;

    const handleSubmission = (payload: { testId: string }) => {
      if (payload.testId === id) fetchResults();
    };

    socket.on('test:submission', handleSubmission);
    return () => {
      socket.off('test:submission', handleSubmission);
    };
  }, [socket, id, fetchResults]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {title} · {results.length} attempt{results.length === 1 ? '' : 's'}
        </Text>
        <View style={styles.liveDotRow}>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          <Text style={[typography.caption, { color: colors.textFaint }]}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchResults}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              Koi student ne abhi tak ye test attempt nahi kiya.
            </Text>
          }
          renderItem={({ item, index }) => (
            <Card style={styles.row}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={[typography.bodyMedium, { color: colors.textFaint, width: 24 }]}>#{index + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.studentId.name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                    {item.studentId.email} · {item.score}/{item.totalQuestions} · {new Date(item.submittedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Badge label={`${Math.round(item.percentage)}%`} tone={toneForPercentage(item.percentage)} />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  liveDotRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  row: { marginBottom: spacing.sm },
});