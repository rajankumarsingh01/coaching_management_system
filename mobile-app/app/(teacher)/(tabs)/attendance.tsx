import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';

type Batch = { _id: string; name: string; subject: string };
type Student = { _id: string; name: string; email: string };
type Status = 'present' | 'absent' | 'late';
type StatusMap = Record<string, Status>;

const STATUS_COLORS: Record<Status, string> = {
  present: '#16A34A',
  absent: '#DC2626',
  late: '#CA8A04',
};

const STATUSES: Status[] = ['present', 'absent', 'late'];

const todayISO = () => new Date().toISOString().split('T')[0];

export default function TeacherAttendanceScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
        if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const fetchStudentsAndAttendance = useCallback(async () => {
    if (!selectedBatchId) return;
    setLoadingStudents(true);
    try {
      const [batchRes, attendanceRes] = await Promise.all([
        axiosInstance.get(`/batches/${selectedBatchId}`),
        axiosInstance.get(`/attendance/batch/${selectedBatchId}`, { params: { date: todayISO() } }),
      ]);

      const rawStudents: Student[] = batchRes.data.data.studentIds || [];
      const seen = new Set<string>();
      const batchStudents = rawStudents.filter((s) => {
        if (!s._id || seen.has(String(s._id))) return false;
        seen.add(String(s._id));
        return true;
      });
      setStudents(batchStudents);

      const existing: StatusMap = {};
      (attendanceRes.data.data as { studentId: { _id: string }; status: Status }[]).forEach((rec) => {
        if (rec.studentId?._id) existing[rec.studentId._id] = rec.status;
      });

      const initial: StatusMap = {};
      batchStudents.forEach((s) => {
        initial[s._id] = existing[s._id] || 'present';
      });
      setStatusMap(initial);
    } catch (err) {
      console.error('Failed to load attendance', err);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [fetchStudentsAndAttendance]);

  const setStatus = (studentId: string, status: Status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedBatchId) return;
    setSaving(true);
    try {
      const records = Object.entries(statusMap).map(([studentId, status]) => ({ studentId, status }));
      await axiosInstance.post('/attendance', {
        batchId: selectedBatchId,
        date: todayISO(),
        records,
      });
      Alert.alert('Success', 'Attendance saved');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const selectedBatch = batches.find((b) => b._id === selectedBatchId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Attendance"
        tagline={`Today · ${todayISO()}`}
        rightLabel="Report"
        onRightPress={() => router.push('/(teacher)/attendance-report')}
      />

      {loadingBatches ? (
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          Loading batches...
        </Text>
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          Koi batch assign nahi hui hai abhi tak.
        </Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {batches.map((batch) => {
              const active = batch._id === selectedBatchId;
              return (
                <TouchableOpacity
                  key={batch._id}
                  onPress={() => setSelectedBatchId(batch._id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>
                    {batch.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <FlatList
            data={students}
            keyExtractor={(item, index) => String(item._id ?? index)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              loadingStudents ? (
                <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                  Loading students...
                </Text>
              ) : (
                <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                  No students in {selectedBatch?.name}.
                </Text>
              )
            }
            renderItem={({ item }) => (
              <Card style={styles.row}>
                <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>{item.name}</Text>
                <View style={styles.statusRow}>
                  {STATUSES.map((status) => {
                    const active = statusMap[item._id] === status;
                    return (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setStatus(item._id, status)}
                        style={[
                          styles.statusChip,
                          {
                            borderColor: active ? STATUS_COLORS[status] : colors.border,
                            backgroundColor: active ? STATUS_COLORS[status] : colors.surface,
                          },
                        ]}
                      >
                        <Text style={[typography.caption, { color: active ? '#FFFFFF' : colors.textMuted, textTransform: 'capitalize' }]}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            )}
          />

          {students.length > 0 ? (
            <View style={styles.saveWrap}>
              <Button
                label={saving ? 'Saving...' : 'Save Attendance'}
                onPress={handleSave}
                loading={saving}
                fullWidth
              />
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  statusRow: { flexDirection: 'row', gap: spacing.xs },
  statusChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  saveWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
