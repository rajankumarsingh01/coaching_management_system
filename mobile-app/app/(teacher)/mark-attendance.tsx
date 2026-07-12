import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';

type Student = { _id: string; name: string; email: string };
type StatusMap = Record<string, 'present' | 'absent' | 'late'>;

const todayISO = () => new Date().toISOString().split('T')[0];

export default function MarkAttendanceScreen() {
  const { selectedBatch } = useBatch();
  const [students, setStudents] = useState<Student[]>([]);
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [saving, setSaving] = useState(false);

useEffect(() => {
  const fetchBatchDetail = async () => {
    if (!selectedBatch) return;
    const { data } = await axiosInstance.get(`/batches/${selectedBatch._id}`);
    const rawStudents: Student[] = data.data.studentIds || [];

    // De-duplicate by _id in case of any stale/duplicate assignment data,
    // and guard against any record missing an _id.
    const seen = new Set<string>();
    const batchStudents = rawStudents.filter((s) => {
      if (!s._id || seen.has(String(s._id))) return false;
      seen.add(String(s._id));
      return true;
    });

    setStudents(batchStudents);
    const initial: StatusMap = {};
    batchStudents.forEach((s) => {
      initial[s._id] = 'present';
    });
    setStatusMap(initial);
  };
  fetchBatchDetail();
}, [selectedBatch]);

  const setStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedBatch) return;
    setSaving(true);
    try {
      const records = Object.entries(statusMap).map(([studentId, status]) => ({ studentId, status }));
      await axiosInstance.post('/attendance', {
        batchId: selectedBatch._id,
        date: todayISO(),
        records,
      });
      Alert.alert('Success', 'Attendance saved', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    present: '#16a34a',
    absent: '#dc2626',
    late: '#ca8a04',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{selectedBatch?.name} — {todayISO()}</Text>

      <FlatList
        data={students}
        keyExtractor={(item, index) => String(item._id ?? index)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.statusButtons}>
              {(['present', 'absent', 'late'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setStatus(item._id, status)}
                  style={[
                    styles.statusChip,
                    statusMap[item._id] === status && { backgroundColor: STATUS_COLORS[status] },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      statusMap[item._id] === status && { color: '#fff' },
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No students in this batch.</Text>}
      />

      {students.length > 0 && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Attendance'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  studentName: { fontSize: 14, flex: 1 },
  statusButtons: { flexDirection: 'row', gap: 6 },
  statusChip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusChipText: { fontSize: 12, color: '#374151', textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});