import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useSocket } from '../../src/context/SocketContext';
import { PressableCard } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type TestRow = {
  _id: string;
  title: string;
  durationMinutes: number;
  isPublished: boolean;
  questions: unknown[];
};

export default function BatchTestsScreen() {
  const { batchId, batchName } = useLocalSearchParams<{ batchId: string; batchName: string }>();
  const [tests, setTests] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();
  const { socket } = useSocket();

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/tests/batch/${batchId}`);
      setTests(data.data);
    } catch (err) {
      console.error('Failed to load tests', err);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Real-time — koi bhi test create/publish/delete kare, ya kisi test me
  // question add ho, isi batch ka list turant refresh, bina manual pull-to-refresh
  useEffect(() => {
    if (!socket || !batchId) return;

    const isThisBatch = (payload: { batchId?: string }) => payload?.batchId === batchId;

    const handleCreated = (payload: { batchId: string }) => {
      if (isThisBatch(payload)) fetchTests();
    };
    const handleQuestionAdded = (payload: { batchId: string }) => {
      if (isThisBatch(payload)) fetchTests();
    };
    const handlePublished = (payload: { batchId: string }) => {
      if (isThisBatch(payload)) fetchTests();
    };
    const handleDeleted = (payload: { batchId: string }) => {
      if (isThisBatch(payload)) fetchTests();
    };

    socket.on('test:created', handleCreated);
    socket.on('test:questionAdded', handleQuestionAdded);
    socket.on('test:new', handlePublished);
    socket.on('test:deleted', handleDeleted);

    return () => {
      socket.off('test:created', handleCreated);
      socket.off('test:questionAdded', handleQuestionAdded);
      socket.off('test:new', handlePublished);
      socket.off('test:deleted', handleDeleted);
    };
  }, [socket, batchId, fetchTests]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{batchName}</Text>
        <Button
          label="+ Create Test"
          size="sm"
          onPress={() => router.push({ pathname: '/(teacher)/create-test', params: { batchId, batchName } })}
        />
      </View>

      <FlatList
        data={tests}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchTests}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            {loading ? 'Loading...' : 'No tests yet for this batch.'}
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard style={styles.row} onPress={() => router.push({ pathname: '/(teacher)/test-detail', params: { id: item._id } })}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.title}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                {item.questions.length} question{item.questions.length === 1 ? '' : 's'} · {item.durationMinutes} min
              </Text>
            </View>
            <Badge label={item.isPublished ? 'Published' : 'Draft'} tone={item.isPublished ? 'success' : 'warning'} />
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