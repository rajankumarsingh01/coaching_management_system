import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBranding } from '../../src/context/BrandingContext';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

const SOCIAL_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  website: { icon: 'globe-outline', label: 'Website' },
  instagram: { icon: 'logo-instagram', label: 'Instagram' },
  facebook: { icon: 'logo-facebook', label: 'Facebook' },
  youtube: { icon: 'logo-youtube', label: 'YouTube' },
};

// Institute ke naam se initials nikalta hai — logo upload na ho to
// medallion me khaali circle ki jagah ye dikhta hai.
function getInitials(name: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

export default function TeacherAboutInstituteScreen() {
  const { branding } = useBranding();
  const colors = useThemeColors();

  const title = branding.displayName || branding.instituteName;
  const socialEntries = Object.entries(branding.socialLinks || {}).filter(([, url]) => !!url);

  // Sirf wahi contact rows banti hain jinka data actually maujood hai —
  // koi khaali/broken row kabhi nahi dikhti.
  const contactRows = [
    branding.contactPhone && {
      icon: 'call-outline' as const,
      label: 'Phone',
      value: branding.contactPhone,
      onPress: () => Linking.openURL(`tel:${branding.contactPhone}`),
    },
    branding.contactEmail && {
      icon: 'mail-outline' as const,
      label: 'Email',
      value: branding.contactEmail,
      onPress: () => Linking.openURL(`mailto:${branding.contactEmail}`),
    },
    branding.contactAddress && {
      icon: 'location-outline' as const,
      label: 'Address',
      value: branding.contactAddress,
      onPress: () =>
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branding.contactAddress)}`
        ),
    },
  ].filter(Boolean) as { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress: () => void }[];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={[styles.logoRing, { borderColor: colors.background }]}>
          {branding.logoUrl ? (
            <Image source={{ uri: branding.logoUrl }} style={styles.logo} resizeMode="cover" />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: colors.background }]}>
              <Text style={[styles.logoInitials, { color: colors.primary }]}>{getInitials(title)}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.identityBlock}>
        <Text style={[typography.display, { color: colors.text, textAlign: 'center' }]} numberOfLines={2}>
          {title}
        </Text>
        {branding.tagline ? (
          <View style={[styles.taglinePill, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[typography.label, { color: colors.primary }]}>{branding.tagline}</Text>
          </View>
        ) : null}
      </View>

      {branding.aboutText ? (
        <View style={styles.section}>
          <Text style={[typography.label, { color: colors.textFaint }]}>ABOUT THE INSTITUTE</Text>
          <Text style={[typography.body, { color: colors.text, marginTop: spacing.sm, lineHeight: 22 }]}>
            {branding.aboutText}
          </Text>
        </View>
      ) : null}

      {contactRows.length > 0 ? (
        <View style={styles.section}>
          <Text style={[typography.label, { color: colors.textFaint, marginBottom: spacing.sm }]}>
            GET IN TOUCH
          </Text>
          <View style={[styles.card, { borderColor: colors.border }]}>
            {contactRows.map((row, index) => (
              <TouchableOpacity
                key={row.label}
                activeOpacity={0.7}
                onPress={row.onPress}
                style={[
                  styles.contactRow,
                  index < contactRows.length - 1 && [styles.contactRowDivider, { borderBottomColor: colors.border }],
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryMuted }]}>
                  <Ionicons name={row.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{row.label}</Text>
                  <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 2 }]}>{row.value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {socialEntries.length > 0 ? (
        <View style={styles.section}>
          <Text style={[typography.label, { color: colors.textFaint, marginBottom: spacing.sm }]}>FOLLOW US</Text>
          <View style={styles.socialRow}>
            {socialEntries.map(([key, url]) => {
              const meta = SOCIAL_META[key] || { icon: 'link-outline' as const, label: key };
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.7}
                  onPress={() => Linking.openURL(url as string)}
                  style={[styles.socialButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Ionicons name={meta.icon} size={20} color={colors.primary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  hero: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    overflow: 'hidden',
    marginBottom: -48,
    backgroundColor: '#fff',
  },
  logo: { width: '100%', height: '100%' },
  logoFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  logoInitials: { fontSize: 32, fontWeight: '800' },
  identityBlock: { alignItems: 'center', marginTop: 56, paddingHorizontal: spacing.xl },
  taglinePill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl },
  card: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  contactRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});