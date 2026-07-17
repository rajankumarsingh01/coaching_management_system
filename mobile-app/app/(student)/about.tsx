import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useBranding } from '../../src/context/BrandingContext';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

export default function AboutInstituteScreen() {
  const { branding } = useBranding();
  const colors = useThemeColors();

  const socialEntries = Object.entries(branding.socialLinks || {}).filter(([, url]) => !!url);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {branding.logoUrl ? (
        <Image source={{ uri: branding.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : null}

      <Text style={[typography.h1, { color: colors.text, textAlign: 'center' }]}>
        {branding.displayName || branding.instituteName}
      </Text>
      {branding.tagline ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' }]}>
          {branding.tagline}
        </Text>
      ) : null}

      {branding.aboutText ? (
        <Text style={[typography.body, { color: colors.text, marginTop: spacing.xl, textAlign: 'center', lineHeight: 20 }]}>
          {branding.aboutText}
        </Text>
      ) : null}

      <View style={styles.contactSection}>
        {branding.contactPhone ? (
          <Text
            style={[typography.body, { color: colors.text, marginBottom: spacing.sm, textAlign: 'center' }]}
            onPress={() => Linking.openURL(`tel:${branding.contactPhone}`)}
          >
            📞 {branding.contactPhone}
          </Text>
        ) : null}
        {branding.contactEmail ? (
          <Text
            style={[typography.body, { color: colors.text, marginBottom: spacing.sm, textAlign: 'center' }]}
            onPress={() => Linking.openURL(`mailto:${branding.contactEmail}`)}
          >
            ✉️ {branding.contactEmail}
          </Text>
        ) : null}
        {branding.contactAddress ? (
          <Text style={[typography.body, { color: colors.text, marginBottom: spacing.sm, textAlign: 'center' }]}>
            📍 {branding.contactAddress}
          </Text>
        ) : null}
      </View>

      {socialEntries.length > 0 && (
        <View style={styles.socialSection}>
          {socialEntries.map(([key, url]) => (
            <TouchableOpacity key={key} onPress={() => Linking.openURL(url as string)}>
              <Text style={[typography.bodyMedium, { color: colors.primary, marginBottom: spacing.sm, textAlign: 'center' }]}>
                {key.charAt(0).toUpperCase() + key.slice(1)} →
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: 'center' },
  logo: { width: 90, height: 90, marginBottom: spacing.lg },
  contactSection: { marginTop: spacing.xxl, width: '100%' },
  socialSection: { marginTop: spacing.lg, width: '100%' },
});