import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';

type Batch = { _id: string; name: string; subject: string };
type AttendanceRecord = {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  status: 'present' | 'absent' | 'late';
};

const STATUS_TONE: Record<string, 'success' | 'danger' | 'warning'> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
};

const todayISO = () => new Date().toISOString().split('T')[0];

export default function AdminAttendanceScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
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

  const fetchAttendance = useCallback(async () => {
    if (!selectedBatchId) return;
    setLoadingRecords(true);
    try {
      const { data } = await axiosInstance.get(`/attendance/batch/${selectedBatchId}`, {
        params: { date: todayISO() },
      });
      setRecords(data.data);
    } catch (err) {
      console.error('Failed to load attendance', err);
    } finally {
      setLoadingRecords(false);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const selectedBatch = batches.find((b) => b._id === selectedBatchId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Attendance" tagline={`Today · ${todayISO()}`} />

      {loadingBatches ? (
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          Loading batches...
        </Text>
      ) : batches.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          No batches yet.
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
            data={records}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              loadingRecords ? (
                <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                  Loading attendance...
                </Text>
              ) : (
                <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
                  No attendance marked yet today for {selectedBatch?.name}.
                </Text>
              )
            }
            renderItem={({ item }) => (
              <Card style={styles.row}>
                <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>
                  {item.studentId?.name}
                </Text>
                <Badge
                  label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  tone={STATUS_TONE[item.status] ?? 'neutral'}
                />
              </Card>
            )}
          />
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
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});