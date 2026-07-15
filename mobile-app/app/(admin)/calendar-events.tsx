import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type EventRow = {
  _id: string;
  title: string;
  date: string;
  type: 'test' | 'holiday' | 'event';
  batchId: string | null;
  description: string;
};

type Batch = { _id: string; name: string };

const TYPE_TONE: Record<EventRow['type'], 'info' | 'warning' | 'neutral'> = {
  test: 'info',
  holiday: 'warning',
  event: 'neutral',
};

export default function CalendarEventsScreen() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [batchMap, setBatchMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const colors = useThemeColors();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, batchesRes] = await Promise.all([
        axiosInstance.get('/calendar/all'),
        axiosInstance.get('/batches'),
      ]);
      setEvents(eventsRes.data.data);
      const map: Record<string, string> = {};
      (batchesRes.data.data as Batch[]).forEach((b) => {
        map[b._id] = b.name;
      });
      setBatchMap(map);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = (event: EventRow) => {
    Alert.alert('Delete Event', `Delete "${event.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(event._id);
          try {
            await axiosInstance.delete(`/calendar/${event._id}`);
            setEvents((prev) => prev.filter((e) => e._id !== event._id));
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete event');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>All institute events</Text>
        <Button label="+ Add Event" size="sm" onPress={() => router.push('/(admin)/create-event')} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchAll}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              No events yet.
            </Text>
          }
          renderItem={({ item }) => (
            <PressableCard
              style={styles.row}
              disabled={deletingId === item._id}
              onPress={() => handleDelete(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.title}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {new Date(item.date).toLocaleDateString()} · {item.batchId ? batchMap[item.batchId] || 'Batch' : 'Institute-wide'}
                </Text>
              </View>
              <Badge label={item.type} tone={TYPE_TONE[item.type]} />
            </PressableCard>
          )}
        />
      )}

      <Text style={[typography.caption, { color: colors.textFaint, textAlign: 'center', marginBottom: spacing.lg }]}>
        Tap an event to delete it
      </Text>
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
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});