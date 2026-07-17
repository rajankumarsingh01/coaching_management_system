import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type CalendarEvent = { _id: string; title: string; date: string; type: 'test' | 'holiday' | 'event'; description: string };

const TYPE_TONE: Record<string, 'info' | 'danger' | 'success'> = { test: 'info', holiday: 'danger', event: 'success' };
const TYPE_ICONS: Record<string, string> = { test: '📝', holiday: '🎉', event: '📌' };

export default function StudentCalendarScreen() {
  const colors = useThemeColors();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await axiosInstance.get('/calendar/me');
      setEvents(data.data);
    };
    fetchEvents();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Calendar" tagline="Upcoming tests, holidays & events" />
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            No upcoming events.
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.icon}>{TYPE_ICONS[item.type]}</Text>
              <View style={styles.info}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.title}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
                {item.description ? (
                  <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.xs }]}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Badge label={item.type.charAt(0).toUpperCase() + item.type.slice(1)} tone={TYPE_TONE[item.type]} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, marginRight: spacing.md },
  info: { flex: 1, marginRight: spacing.sm },
});