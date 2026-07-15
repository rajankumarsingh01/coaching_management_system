import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type HomeworkRow = {
  _id: string;
  title: string;
  dueDate: string;
  attachmentUrl: string;
};

export default function BatchHomeworkScreen() {
  const { batchId, batchName } = useLocalSearchParams<{ batchId: string; batchName: string }>();
  const [homework, setHomework] = useState<HomeworkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/homework/batch/${batchId}`);
      setHomework(data.data);
    } catch (err) {
      console.error('Failed to load homework', err);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{batchName}</Text>
        <Button
          label="+ Create Homework"
          size="sm"
          onPress={() => router.push({ pathname: '/(teacher)/create-homework', params: { batchId, batchName } })}
        />
      </View>

      <FlatList
        data={homework}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchHomework}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            {loading ? 'Loading...' : 'No homework yet for this batch.'}
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard
            style={styles.row}
            onPress={() => router.push({ pathname: '/(teacher)/homework-detail', params: { id: item._id, title: item.title } })}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.title}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                Due {new Date(item.dueDate).toLocaleDateString()} {item.attachmentUrl ? '· 📎 attached' : ''}
              </Text>
            </View>
            <Badge label={isOverdue(item.dueDate) ? 'Overdue' : 'Open'} tone={isOverdue(item.dueDate) ? 'danger' : 'info'} />
          </PressableCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});