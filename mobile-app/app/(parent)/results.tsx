import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';
import { useBranding } from '../../src/context/BrandingContext';
import { useChild } from '../../src/context/ChildContext';
import axiosInstance from '../../src/api/axiosInstance';

type ResultRecord = { _id: string; score: number; totalQuestions: number; percentage: number; createdAt: string };
type WeakTopic = { topic: string; correct: number; total: number; percentage: number };

export default function ParentResultsScreen() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { selectedChild } = useChild();
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedChild) return;
      setError('');
      try {
        const [resultsRes, weakRes] = await Promise.all([
          axiosInstance.get(`/results/student/${selectedChild.id}`),
          axiosInstance.get(`/results/weak-topics/student/${selectedChild.id}`),
        ]);
        setResults(resultsRes.data.data || []);
        setWeakTopics(weakRes.data.data.weakTopics || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load results');
      }
    };
    fetchData();
  }, [selectedChild]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={selectedChild ? `${selectedChild.name}'s Results` : 'Results'} tagline={branding.instituteName} />

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          weakTopics.length > 0 ? (
            <Card style={[styles.weakBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBg }]}>
              <Text style={[typography.bodyMedium, { color: colors.danger, marginBottom: spacing.xs }]}>Weak Topics</Text>
              {weakTopics.map((t) => (
                <Text key={t.topic} style={[typography.caption, { color: colors.danger, marginTop: 2 }]}>
                  {t.topic} — {t.percentage}% ({t.correct}/{t.total} correct)
                </Text>
              ))}
            </Card>
          ) : null
        }
        ListEmptyComponent={<Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>{error || 'No test results yet.'}</Text>}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <Text style={[typography.body, { color: colors.text }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>
              {item.score}/{item.totalQuestions} ({item.percentage}%)
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.lg },
  weakBox: { marginBottom: spacing.lg, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
});