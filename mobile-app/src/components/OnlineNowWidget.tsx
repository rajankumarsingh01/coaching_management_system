// src/components/OnlineNowWidget.tsx
//
// Admin dashboard ka live "Online Now" widget — GET /presence/online-summary
// (route ADMIN-only hai, super_admin bhi bypass kar leta hai).

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axiosInstance from '../api/axiosInstance';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, typography } from '../theme/tokens';

type OnlineSummary = {
  total: number;
  byRole: Record<string, number>;
  users: { id: string; name: string; role: string }[];
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

// Har 20 second me refresh — socket events use nahi kiye kyunki app me
// abhi koi socket.io-client setup nahi hai, isliye simple polling.
const POLL_INTERVAL_MS = 20000;

export function OnlineNowWidget() {
  const [summary, setSummary] = useState<OnlineSummary | null>(null);
  const colors = useThemeColors();

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/presence/online-summary');
      setSummary(data.data);
    } catch (err) {
      // Silent fail — ye ek "nice to have" live widget hai, isse poore
      // dashboard par error banner nahi dikhana chahiye.
      console.error('Failed to load online summary', err);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  if (!summary) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.liveDotRow}>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          <Text style={[typography.label, { color: colors.textMuted }]}>ONLINE NOW</Text>
        </View>
        <Text style={[typography.h1, { color: colors.text }]}>{summary.total}</Text>
      </View>

      {summary.total === 0 ? (
        <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.sm }]}>
          Abhi koi bhi online nahi hai.
        </Text>
      ) : (
        <>
          <View style={styles.badgeRow}>
            {Object.entries(summary.byRole).map(([role, count]) => (
              <Badge key={role} label={`${ROLE_LABELS[role] || role} · ${count}`} tone="info" />
            ))}
          </View>

          <View style={styles.namesWrap}>
            {summary.users.slice(0, 6).map((u) => (
              <Text key={u.id} style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
                • {u.name} ({ROLE_LABELS[u.role] || u.role})
              </Text>
            ))}
            {summary.users.length > 6 ? (
              <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.xs }]}>
                +{summary.users.length - 6} more
              </Text>
            ) : null}
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveDotRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  namesWrap: { marginTop: spacing.md, gap: spacing.xs },
});