import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useBranding } from '../../src/context/BrandingContext';

export default function AboutInstituteScreen() {
  const { branding } = useBranding();

  const socialEntries = Object.entries(branding.socialLinks || {}).filter(([, url]) => !!url);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {branding.logoUrl ? (
        <Image source={{ uri: branding.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : null}

      <Text style={styles.name}>{branding.displayName || branding.instituteName}</Text>
      {branding.tagline ? <Text style={styles.tagline}>{branding.tagline}</Text> : null}

      {branding.aboutText ? <Text style={styles.about}>{branding.aboutText}</Text> : null}

      <View style={styles.contactSection}>
        {branding.contactPhone ? (
          <Text style={styles.contactRow} onPress={() => Linking.openURL(`tel:${branding.contactPhone}`)}>
            📞 {branding.contactPhone}
          </Text>
        ) : null}
        {branding.contactEmail ? (
          <Text style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${branding.contactEmail}`)}>
            ✉️ {branding.contactEmail}
          </Text>
        ) : null}
        {branding.contactAddress ? <Text style={styles.contactRow}>📍 {branding.contactAddress}</Text> : null}
      </View>

      {socialEntries.length > 0 && (
        <View style={styles.socialSection}>
          {socialEntries.map(([key, url]) => (
            <TouchableOpacity key={key} onPress={() => Linking.openURL(url as string)}>
              <Text style={[styles.contactRow, { color: branding.primaryColor }]}>
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
  container: { padding: 20, alignItems: 'center' },
  logo: { width: 90, height: 90, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  tagline: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  about: { fontSize: 14, color: '#374151', marginTop: 20, textAlign: 'center', lineHeight: 20 },
  contactSection: { marginTop: 24, width: '100%' },
  contactRow: { fontSize: 14, color: '#374151', marginBottom: 10, textAlign: 'center' },
  socialSection: { marginTop: 16, width: '100%' },
});