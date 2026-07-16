import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';
import { useBranding } from '../../../src/context/BrandingContext';
import { useChild } from '../../../src/context/ChildContext';
import axiosInstance from '../../../src/api/axiosInstance';

type Fee = { _id: string; amount: number; status: string; dueDate: string; batchId: { name: string } };

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  due: 'danger',
};

export default function ParentFeesScreen() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { selectedChild } = useChild();
  const [fees, setFees] = useState<Fee[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFees = useCallback(async () => {
    if (!selectedChild) return;
    const { data } = await axiosInstance.get(`/fees/student/${selectedChild.id}`);
    setFees(data.data);
  }, [selectedChild]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={selectedChild ? `${selectedChild.name}'s Fees` : 'Fees'}
        tagline={branding.instituteName}
        bannerUrl={branding.bannerImageUrl || undefined}
      />
      <FlatList
        data={fees}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchFees();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={<Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>No fee records yet.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.batchId?.name}</Text>
              <Badge label={item.status} tone={STATUS_TONE[item.status] ?? 'neutral'} />
            </View>
            <Text style={[typography.stat, { color: colors.text, marginTop: spacing.sm }]}>₹{item.amount}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
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
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});