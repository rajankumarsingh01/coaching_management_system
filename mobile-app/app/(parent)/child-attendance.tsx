import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

type Record = { _id: string; date: string; status: string };

export default function ChildAttendanceScreen() {
  const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName: string }>();
  const [percentage, setPercentage] = useState<number | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) return;
      setError('');
      try {
        const { data } = await axiosInstance.get(`/attendance/student/${studentId}`);
        setPercentage(data.data.percentage);
        setRecords(data.data.records || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load attendance');
      }
    };
    fetchAttendance();
  }, [studentId]);

  const STATUS_COLORS: Record<string, string> = {
    present: '#16a34a',
    absent: '#dc2626',
    late: '#ca8a04',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{studentName}'s Attendance</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {percentage !== null && <Text style={styles.percentage}>{percentage}% overall</Text>}

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No attendance records yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  percentage: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
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