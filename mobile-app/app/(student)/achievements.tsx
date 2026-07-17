import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type BadgeItem = { type: string; label: string; icon: string; earnedAt: string };
type Profile = { currentStreak: number; longestStreak: number; badges: BadgeItem[] };

export default function AchievementsScreen() {
  const colors = useThemeColors();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await axiosInstance.get('/gamification/me');
      setProfile(data.data);
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Achievements" />
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Achievements" tagline="Streaks & badges" />
      <FlatList
        data={profile.badges}
        keyExtractor={(item) => item.type}
        numColumns={2}
        columnWrapperStyle={styles.badgeRow}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.streakRow}>
              <View style={[styles.streakCard, { backgroundColor: colors.primary }]}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[typography.display, { color: colors.onPrimary }]}>{profile.currentStreak}</Text>
                <Text style={[typography.caption, { color: colors.onPrimary, marginTop: 2, opacity: 0.85 }]}>
                  Current Streak
                </Text>
              </View>
              <View style={[styles.streakCard, { backgroundColor: colors.secondary }]}>
                <Text style={styles.streakEmoji}>⚡</Text>
                <Text style={[typography.display, { color: colors.onPrimary }]}>{profile.longestStreak}</Text>
                <Text style={[typography.caption, { color: colors.onPrimary, marginTop: 2, opacity: 0.85 }]}>
                  Longest Streak
                </Text>
              </View>
            </View>
            <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
              BADGES EARNED ({profile.badges.length})
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.lg }]}>
            No badges yet — keep attending, submitting homework, and taking tests to earn some!
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>{item.icon}</Text>
            <Text style={[typography.label, { color: colors.text, textAlign: 'center' }]}>{item.label}</Text>
            <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.xs }]}>
              {new Date(item.earnedAt).toLocaleDateString()}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  streakRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  streakCard: { flex: 1, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  streakEmoji: { fontSize: 28, marginBottom: spacing.xs },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.sm },
  badgeRow: { gap: spacing.md },
  badgeCard: { flex: 1, alignItems: 'center' },
  badgeIcon: { fontSize: 32, marginBottom: spacing.sm },
});