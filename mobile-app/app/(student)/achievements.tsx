import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import { useBranding } from '../../src/context/BrandingContext';

type Badge = { type: string; label: string; icon: string; earnedAt: string };

type Profile = {
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
};

export default function AchievementsScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { branding } = useBranding();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await axiosInstance.get('/gamification/me');
      setProfile(data.data);
    };
    fetchProfile();
  }, []);

  const primaryColor = branding?.primaryColor || '#2563EB';

  if (!profile) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.streakRow}>
        <View style={[styles.streakCard, { backgroundColor: primaryColor }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{profile.currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
        <View style={[styles.streakCard, { backgroundColor: '#6b7280' }]}>
          <Text style={styles.streakEmoji}>⚡</Text>
          <Text style={styles.streakNumber}>{profile.longestStreak}</Text>
          <Text style={styles.streakLabel}>Longest Streak</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Badges Earned ({profile.badges.length})</Text>

      <FlatList
        data={profile.badges}
        keyExtractor={(item) => item.type}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No badges yet — keep attending, submitting homework, and taking tests to earn some!
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>{item.icon}</Text>
            <Text style={styles.badgeLabel}>{item.label}</Text>
            <Text style={styles.badgeDate}>{new Date(item.earnedAt).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  loading: { textAlign: 'center', marginTop: 40, color: '#9ca3af' },
  streakRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  streakCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  streakEmoji: { fontSize: 28, marginBottom: 6 },
  streakNumber: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  streakLabel: { fontSize: 12, color: '#f3f4f6', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  badgeCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  badgeIcon: { fontSize: 32, marginBottom: 8 },
  badgeLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  badgeDate: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 20, paddingHorizontal: 20 },
});