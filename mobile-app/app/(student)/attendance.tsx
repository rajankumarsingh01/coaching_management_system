import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';

type Record = { _id: string; date: string; status: string };

export default function StudentAttendanceHistory() {
  const [records, setRecords] = useState<Record[]>([]);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      const { data } = await axiosInstance.get('/attendance/me');
      setRecords(data.data.records || []);
      setPercentage(data.data.percentage || 0);
    };
    fetchAttendance();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    present: '#16a34a',
    absent: '#dc2626',
    late: '#ca8a04',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance History</Text>
      <Text style={styles.percentage}>{percentage}% overall</Text>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No attendance records yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  percentage: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  date: { fontSize: 14, color: '#374151' },
  status: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});