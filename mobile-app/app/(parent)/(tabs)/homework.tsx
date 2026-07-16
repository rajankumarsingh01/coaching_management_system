import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';
import { useBranding } from '../../../src/context/BrandingContext';
import { useChild } from '../../../src/context/ChildContext';
import axiosInstance from '../../../src/api/axiosInstance';

type HomeworkItem = { _id: string; title: string; description: string; dueDate: string };

export default function ParentHomeworkScreen() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { selectedChild } = useChild();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [error, setError] = useState('');

  // A child with exactly one batch resolves automatically; multi-batch
  // selection isn't built yet (same known limitation as before).
  const batchId = selectedChild?.batches?.length === 1 ? selectedChild.batches[0].id : '';

  const fetchHomework = useCallback(async () => {
    if (!batchId) return;
    setError('');
    try {
      const { data } = await axiosInstance.get(`/homework/batch/${batchId}`);
      setHomework(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load homework');
    }
  }, [batchId]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={selectedChild ? `${selectedChild.name}'s Homework` : 'Homework'}
        tagline={branding.instituteName}
        bannerUrl={branding.bannerImageUrl || undefined}
      />
      <FlatList
        data={homework}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
            {!batchId
              ? 'This child is in multiple batches — please check with the institute admin.'
              : error || 'No homework assigned yet.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.title}</Text>
            {item.description ? (
              <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>{item.description}</Text>
            ) : null}
            <Text style={[typography.caption, { color: colors.warning, marginTop: spacing.sm }]}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, list: { padding: spacing.lg }, card: { marginBottom: spacing.md } });