import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { AttendanceSummary, AttendanceRecord } from '../../../src/components/AttendanceSummary';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { useBranding } from '../../../src/context/BrandingContext';
import { useChild } from '../../../src/context/ChildContext';
import axiosInstance from '../../../src/api/axiosInstance';

export default function ParentAttendanceScreen() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { selectedChild } = useChild();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [total, setTotal] = useState(0);
  const [present, setPresent] = useState(0);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const fetchAttendance = useCallback(async () => {
    if (!selectedChild) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get(`/attendance/student/${selectedChild.id}`);
      setPercentage(data.data.percentage || 0);
      setTotal(data.data.total || 0);
      setPresent(data.data.present || 0);
      setRecords(data.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={selectedChild ? `${selectedChild.name}'s Attendance` : 'Attendance'}
        tagline={branding.instituteName}
        bannerUrl={branding.bannerImageUrl || undefined}
      />
      <AttendanceSummary loading={loading} error={error} percentage={percentage} total={total} present={present} records={records} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });