import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type Topic = { topic: string; correct: number; total: number; percentage: number };

export default function WeakTopicsScreen() {
  const colors = useThemeColors();
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Weak Topics" tagline="Topics below 50% accuracy — focus here!" />

      <FlatList
        data={weakTopics}
        keyExtractor={(item) => item.topic}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            No weak topics detected yet — either great job, or attempt more tests for data!
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
            <Text style={[typography.bodyMedium, { color: colors.danger }]}>{item.topic}</Text>
            <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.xs }]}>
              {item.correct}/{item.total} correct — {item.percentage}%
            </Text>
          </Card>
        )}
        ListFooterComponent={
          allTopics.length > 0 ? (
            <>
              <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
                ALL TOPICS
              </Text>
              <Card padded={false}>
                {allTopics.map((item, index) => (
                  <View
                    key={item.topic + '-all'}
                    style={[
                      styles.rowAll,
                      index < allTopics.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[typography.body, { color: colors.text }]}>{item.topic}</Text>
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.percentage}%</Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  card: { borderWidth: 1, marginBottom: spacing.sm },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  rowAll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});