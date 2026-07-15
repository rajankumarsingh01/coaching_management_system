import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type BatchRow = { _id: string; name: string; subject: string; isActive: boolean };

export default function ContentBatchesScreen() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[typography.caption, { color: colors.textMuted, padding: spacing.lg, paddingBottom: 0 }]}>
        Select a batch to manage its notes and lectures
      </Text>

      <FlatList
        data={batches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchBatches}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            {loading ? 'Loading...' : 'No batches yet. Create one from Batches first.'}
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard
            style={styles.row}
            onPress={() =>
              router.push({ pathname: '/(admin)/batch-content', params: { batchId: item._id, batchName: item.name } })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
              {item.subject ? (
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{item.subject}</Text>
              ) : null}
            </View>
            <Badge label={item.isActive ? 'Active' : 'Inactive'} tone={item.isActive ? 'success' : 'danger'} />
          </PressableCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});