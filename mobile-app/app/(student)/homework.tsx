import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type Homework = {
  _id: string;
  title: string;
  dueDate: string;
  attachmentUrl: string;
  createdBy: { name: string };
};

export default function StudentHomeworkScreen() {
  const { selectedBatch } = useBatch();
  const colors = useThemeColors();
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedBatch) return;
    const [hwRes, subsRes] = await Promise.all([
      axiosInstance.get(`/homework/batch/${selectedBatch._id}`),
      axiosInstance.get('/submissions/me'),
    ]);
    setHomeworkList(hwRes.data.data);
    setSubmittedIds(new Set(subsRes.data.data.map((s: any) => s.homeworkId._id || s.homeworkId)));
    setRefreshing(false);
  }, [selectedBatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Homework" tagline={selectedBatch ? selectedBatch.name : undefined} />

      <FlatList
        data={homeworkList}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
            No homework assigned yet.
          </Text>
        }
        renderItem={({ item }) => {
          const submitted = submittedIds.has(item._id);
          const overdue = isOverdue(item.dueDate);
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(student)/submit-homework',
                  params: { homeworkId: item._id, title: item.title },
                })
              }
            >
              <Card style={styles.card}>
                <View style={styles.headerRow}>
                  <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {submitted ? (
                    <Badge label="Submitted" tone="success" />
                  ) : overdue ? (
                    <Badge label="Overdue" tone="danger" />
                  ) : null}
                </View>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  by {item.createdBy?.name}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: overdue && !submitted ? colors.danger : colors.textMuted, marginTop: spacing.sm },
                  ]}
                >
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});