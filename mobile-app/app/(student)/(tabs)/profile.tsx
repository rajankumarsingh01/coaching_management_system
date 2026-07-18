import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { useBranding } from '../../../src/context/BrandingContext';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard, Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { ProfileAvatarEditor } from '../../../src/components/ProfileAvatarEditor';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

const MENU_ITEMS = [
  { icon: '📈', label: 'Leaderboard', route: '/(student)/leaderboard' },
  { icon: '🎯', label: 'Weak Topics', route: '/(student)/weak-topics' },
  { icon: '🏅', label: 'My Achievements', route: '/(student)/achievements' },
  { icon: '🏫', label: 'About Institute', route: '/(student)/about' },
  { icon: '⚙️', label: 'Settings / भाषा बदलें', route: '/(student)/settings' },
  { icon: '🤖', label: 'AI Doubt Solver', route: '/(student)/doubt-chat' },
] as const;

// NEW — /users/me se aane wala extra profile data (avatar, batch, parent)
type ProfileData = {
  avatarUrl: string | null;
  batches: { id: string; name: string; subject: string }[];
  parent: { name: string; email: string } | null;
};

export default function StudentProfile() {
  const { user, logout, updateUser } = useAuth();
  const { branding } = useBranding();
  const colors = useThemeColors();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/users/me');
      setProfile({
        avatarUrl: data.data.avatarUrl,
        batches: data.data.batches || [],
        parent: data.data.parent || null,
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Screen har baar focus hote hi refresh — avatar/batch update turant reflect ho
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleAvatarChange = (avatarUrl: string | null) => {
    setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
    updateUser({ avatarUrl });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={user?.name || 'Profile'}
        tagline={user?.email}
        bannerUrl={branding?.bannerImageUrl}
      />

      <View style={styles.avatarWrap}>
        <ProfileAvatarEditor
          avatarUrl={profile?.avatarUrl}
          name={user?.name}
          onChange={handleAvatarChange}
        />
      </View>

      <Card style={styles.infoCard}>
        <Text style={[typography.label, { color: colors.textMuted }]}>NAME</Text>
        <Text style={[typography.bodyMedium, { color: colors.text, marginBottom: spacing.sm }]}>
          {user?.name}
        </Text>

        <Text style={[typography.label, { color: colors.textMuted }]}>EMAIL</Text>
        <Text style={[typography.bodyMedium, { color: colors.text, marginBottom: spacing.sm }]}>
          {user?.email}
        </Text>

        <Text style={[typography.label, { color: colors.textMuted }]}>BATCH</Text>
        <Text
          style={[
            typography.bodyMedium,
            { color: colors.text, marginBottom: profile?.parent ? spacing.sm : 0 },
          ]}
        >
          {loading
            ? 'Loading...'
            : profile?.batches.length
            ? profile.batches.map((b) => b.name).join(', ')
            : 'Kisi batch me assign nahi hain'}
        </Text>

        {profile?.parent ? (
          <>
            <Text style={[typography.label, { color: colors.textMuted }]}>PARENT NAME</Text>
            <Text style={[typography.bodyMedium, { color: colors.text, marginBottom: spacing.sm }]}>
              {profile.parent.name}
            </Text>

            <Text style={[typography.label, { color: colors.textMuted }]}>PARENT EMAIL</Text>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{profile.parent.email}</Text>
          </>
        ) : null}
      </Card>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <PressableCard
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>{item.label}</Text>
              <Text style={{ color: colors.textFaint }}>›</Text>
            </View>
          </PressableCard>
        ))}
      </View>

      <View style={styles.logoutWrap}>
        <Button label="Logout" variant="danger" onPress={logout} fullWidth />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  infoCard: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
  menu: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  menuItem: { paddingVertical: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuIcon: { fontSize: 20 },
  logoutWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.xxxl },
});