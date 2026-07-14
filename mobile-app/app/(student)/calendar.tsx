import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';

type CalendarEvent = {
  _id: string;
  title: string;
  date: string;
  type: 'test' | 'holiday' | 'event';
  description: string;
};

const TYPE_COLORS: Record<string, string> = {
  test: '#2563eb',
  holiday: '#dc2626',
  event: '#16a34a',
};

const TYPE_ICONS: Record<string, string> = {
  test: '📝',
  holiday: '🎉',
  event: '📌',
};

export default function StudentCalendarScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await axiosInstance.get('/calendar/me');
      setEvents(data.data);
    };
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming events.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.icon}>{TYPE_ICONS[item.type]}</Text>
            <View style={styles.info}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            </View>
            <View style={[styles.typeTag, { backgroundColor: TYPE_COLORS[item.type] }]}>
              <Text style={styles.typeTagText}>{item.type}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  icon: { fontSize: 24, marginRight: 12 },
  info: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  description: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  typeTag: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  typeTagText: { fontSize: 10, color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});