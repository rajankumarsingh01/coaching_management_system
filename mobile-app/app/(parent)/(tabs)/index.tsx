// import { useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, FlatList } from 'react-native';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
// import { PressableCard } from '../../../src/components/ui/Card';
// import { useThemeColors } from '../../../src/theme/useThemeColors';
// import { spacing, typography, radius } from '../../../src/theme/tokens';
// import { useBranding } from '../../../src/context/BrandingContext';
// import { useChild } from '../../../src/context/ChildContext';
// import { usePushNotifications } from '../../../src/hooks/usePushNotifications';
// import { useAuth } from '../../../src/context/AuthContext';

// export default function ParentHome() {
//   const colors = useThemeColors();
//   const { branding } = useBranding();
//   const { children, selectedChild, setSelectedChild, loading } = useChild();
//   const { user } = useAuth();
//   const [pickerVisible, setPickerVisible] = useState(false);

//   usePushNotifications(!!user);

//   const quickLinks = [
//     { label: 'Attendance', icon: 'checkmark-done-outline' as const, onPress: () => router.push('/(parent)/(tabs)/attendance') },
//     { label: 'Fees', icon: 'cash-outline' as const, onPress: () => router.push('/(parent)/(tabs)/fees') },
//     { label: 'Homework', icon: 'clipboard-outline' as const, onPress: () => router.push('/(parent)/(tabs)/homework') },
//     { label: 'Results', icon: 'trophy-outline' as const, onPress: () => router.push('/(parent)/results') },
//   ];

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScreenHeader
//         title={`Welcome, ${user?.name ?? ''}`}
//         tagline={branding.instituteName}
//         bannerUrl={branding.bannerImageUrl || undefined}
//         logoUrl={branding.logoUrl || undefined}
//       />

//       <ScrollView contentContainerStyle={styles.content}>
//         {loading ? (
//           <Text style={{ color: colors.textMuted }}>Loading...</Text>
//         ) : children.length === 0 ? (
//           <PressableCard>
//             <Text style={[typography.body, { color: colors.textMuted }]}>
//               No children linked yet. Ask the institute admin to link your child's account.
//             </Text>
//           </PressableCard>
//         ) : (
//           <>
//             {/* Child switcher — only shown when there's actually a choice to make */}
//             {children.length > 1 && (
//               <TouchableOpacity
//                 style={[styles.switcher, { borderColor: colors.border, backgroundColor: colors.surface }]}
//                 onPress={() => setPickerVisible(true)}
//               >
//                 <View>
//                   <Text style={[typography.caption, { color: colors.textMuted }]}>Viewing</Text>
//                   <Text style={[typography.h2, { color: colors.text }]}>{selectedChild?.name}</Text>
//                 </View>
//                 <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
//               </TouchableOpacity>
//             )}

//             {selectedChild && (
//               <PressableCard style={styles.childCard}>
//                 <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
//                   <Text style={[typography.h1, { color: colors.primary }]}>
//                     {selectedChild.name.charAt(0).toUpperCase()}
//                   </Text>
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={[typography.h2, { color: colors.text }]}>{selectedChild.name}</Text>
//                   <Text style={[typography.caption, { color: colors.textMuted }]}>{selectedChild.email}</Text>
//                 </View>
//               </PressableCard>
//             )}

//             <Text style={[typography.label, { color: colors.textMuted, marginTop: spacing.xl, marginBottom: spacing.md }]}>
//               QUICK ACCESS
//             </Text>
//             <View style={styles.grid}>
//               {quickLinks.map((link) => (
//                 <PressableCard key={link.label} style={styles.gridItem} onPress={link.onPress}>
//                   <Ionicons name={link.icon} size={22} color={colors.primary} />
//                   <Text style={[typography.bodyMedium, { color: colors.text, marginTop: spacing.sm }]}>
//                     {link.label}
//                   </Text>
//                 </PressableCard>
//               ))}
//             </View>
//           </>
//         )}
//       </ScrollView>

//       <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
//         <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPickerVisible(false)}>
//           <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
//             <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.md }]}>Select Child</Text>
//             <FlatList
//               data={children}
//               keyExtractor={(item) => item.id}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.modalRow}
//                   onPress={() => {
//                     setSelectedChild(item);
//                     setPickerVisible(false);
//                   }}
//                 >
//                   <Text style={[typography.body, { color: colors.text }]}>{item.name}</Text>
//                   {selectedChild?.id === item.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
//   switcher: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: radius.md,
//     padding: spacing.md,
//     marginBottom: spacing.lg,
//   },
//   childCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
//   avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
//   grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
//   gridItem: { width: '47%', alignItems: 'flex-start' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
//   modalSheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '60%' },
//   modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
// });






import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { StatCard } from '../../../src/components/ui/StatCard';
import { PressableCard } from '../../../src/components/ui/Card';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';
import { useBranding } from '../../../src/context/BrandingContext';
import { useChild } from '../../../src/context/ChildContext';
import { usePushNotifications } from '../../../src/hooks/usePushNotifications';
import { useAuth } from '../../../src/context/AuthContext';
import axiosInstance from '../../../src/api/axiosInstance';

type Fee = { _id: string; amount: number; status: string; dueDate: string };
type ResultRecord = { _id: string; percentage: number; createdAt: string };

export default function ParentHome() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { children, selectedChild, setSelectedChild, loading } = useChild();
  const { user } = useAuth();

  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [attendanceDays, setAttendanceDays] = useState({ present: 0, total: 0 });
  const [pendingFeeAmount, setPendingFeeAmount] = useState(0);
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);
  const [overdueCount, setOverdueCount] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState<number | null>(null);
  const [latestScore, setLatestScore] = useState<number | null>(null);

  usePushNotifications(!!user);

  const quickLinks = [
    { label: 'Attendance', icon: 'checkmark-done-outline' as const, onPress: () => router.push('/(parent)/(tabs)/attendance') },
    { label: 'Fees', icon: 'cash-outline' as const, onPress: () => router.push('/(parent)/(tabs)/fees') },
    { label: 'Homework', icon: 'clipboard-outline' as const, onPress: () => router.push('/(parent)/(tabs)/homework') },
    { label: 'Results', icon: 'trophy-outline' as const, onPress: () => router.push('/(parent)/results') },
  ];

  const fetchStats = useCallback(async () => {
    if (!selectedChild) {
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    try {
      const batchId = selectedChild.batches?.length === 1 ? selectedChild.batches[0].id : null;

      const [attendanceRes, feesRes, resultsRes, homeworkRes] = await Promise.all([
        axiosInstance.get(`/attendance/student/${selectedChild.id}`),
        axiosInstance.get(`/fees/student/${selectedChild.id}`),
        axiosInstance.get(`/results/student/${selectedChild.id}`).catch(() => null),
        batchId ? axiosInstance.get(`/homework/batch/${batchId}`).catch(() => null) : Promise.resolve(null),
      ]);

      setAttendancePct(attendanceRes.data.data.percentage ?? 0);
      setAttendanceDays({
        present: attendanceRes.data.data.present ?? 0,
        total: attendanceRes.data.data.total ?? 0,
      });

      const fees: Fee[] = feesRes.data.data || [];
      const unpaid = fees.filter((f) => f.status !== 'paid');
      const totalPending = unpaid.reduce((sum, f) => sum + (f.amount || 0), 0);
      setPendingFeeAmount(totalPending);
      const overdue = unpaid.filter((f) => new Date(f.dueDate) < new Date());
      setOverdueCount(overdue.length);
      const upcoming = unpaid
        .slice()
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
      setNextDueDate(upcoming ? upcoming.dueDate : null);

      if (resultsRes) {
        const results: ResultRecord[] = resultsRes.data.data || [];
        const latest = results
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        setLatestScore(latest ? Math.round(latest.percentage) : null);
      } else {
        setLatestScore(null);
      }

      setHomeworkCount(homeworkRes ? (homeworkRes.data.data || []).length : null);
    } catch (err) {
      console.error('Failed to load parent dashboard stats', err);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={`Welcome, ${user?.name ?? ''}`}
        tagline={branding.instituteName}
        bannerUrl={branding.bannerImageUrl || undefined}
        logoUrl={branding.logoUrl || undefined}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {loading ? (
          <Text style={{ color: colors.textMuted }}>Loading...</Text>
        ) : children.length === 0 ? (
          <PressableCard>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              No children linked yet. Ask the institute admin to link your child's account.
            </Text>
          </PressableCard>
        ) : (
          <>
            {/* Child switcher — horizontal avatar chips, only shown when there's a choice */}
            {children.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: spacing.sm }}>
                {children.map((c) => {
                  const active = c.id === selectedChild?.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setSelectedChild(c)}
                      style={[
                        styles.childChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.chipAvatar, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : colors.primaryMuted }]}>
                        <Text style={[typography.label, { color: active ? colors.onPrimary : colors.primary }]}>
                          {c.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[typography.bodyMedium, { color: active ? colors.onPrimary : colors.text }]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Overdue fee alert — only shown when it matters */}
            {overdueCount > 0 && (
              <TouchableOpacity
                style={[styles.alertBanner, { backgroundColor: colors.dangerBg }]}
                onPress={() => router.push('/(parent)/(tabs)/fees')}
              >
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={[typography.bodyMedium, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
                  {overdueCount} fee payment{overdueCount > 1 ? 's' : ''} overdue for {selectedChild?.name}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.danger} />
              </TouchableOpacity>
            )}

            {/* Live stats grid */}
            <View style={styles.statRow}>
              <StatCard
                label="Attendance"
                value={statsLoading ? '—' : `${attendancePct ?? 0}%`}
                subtext={statsLoading ? undefined : `${attendanceDays.present}/${attendanceDays.total} days`}
                icon="📊"
                tone={!statsLoading && attendancePct !== null && attendancePct < 75 ? 'danger' : 'success'}
                onPress={() => router.push('/(parent)/(tabs)/attendance')}
              />
              <StatCard
                label="Fees Due"
                value={statsLoading ? '—' : pendingFeeAmount > 0 ? `₹${pendingFeeAmount.toLocaleString('en-IN')}` : 'All clear'}
                subtext={
                  statsLoading
                    ? undefined
                    : nextDueDate
                    ? `Next due ${new Date(nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : undefined
                }
                icon="💰"
                tone={pendingFeeAmount > 0 ? (overdueCount > 0 ? 'danger' : 'warning') : 'success'}
                onPress={() => router.push('/(parent)/(tabs)/fees')}
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                label="Homework"
                value={statsLoading ? '—' : homeworkCount !== null ? String(homeworkCount) : 'N/A'}
                subtext={homeworkCount !== null ? 'assigned' : undefined}
                icon="📚"
                tone="brand"
                onPress={() => router.push('/(parent)/(tabs)/homework')}
              />
              <StatCard
                label="Latest Score"
                value={statsLoading ? '—' : latestScore !== null ? `${latestScore}%` : 'No tests yet'}
                subtext={latestScore !== null ? 'most recent test' : undefined}
                icon="🎓"
                tone={latestScore !== null && latestScore < 40 ? 'danger' : 'success'}
                onPress={() => router.push('/(parent)/results')}
              />
            </View>

            <Text style={[typography.label, { color: colors.textMuted, marginTop: spacing.xl, marginBottom: spacing.md }]}>
              QUICK ACCESS
            </Text>
            <View style={styles.grid}>
              {quickLinks.map((link) => (
                <PressableCard key={link.label} style={styles.gridItem} onPress={link.onPress}>
                  <Ionicons name={link.icon} size={22} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.text, marginTop: spacing.sm }]}>
                    {link.label}
                  </Text>
                </PressableCard>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  chipRow: { marginBottom: spacing.lg },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chipAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '47%', alignItems: 'flex-start' },
});