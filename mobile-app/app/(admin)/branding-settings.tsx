import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';
import { useBranding } from '../../src/context/BrandingContext';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export default function BrandingSettingsScreen() {
  const { user } = useAuth();
  const { branding, refreshBranding } = useBranding();
  const colors = useThemeColors();

  const [displayName, setDisplayName] = useState(branding.displayName);
  const [tagline, setTagline] = useState(branding.tagline);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor);
  const [contactPhone, setContactPhone] = useState(branding.contactPhone);
  const [contactEmail, setContactEmail] = useState(branding.contactEmail);
  const [contactAddress, setContactAddress] = useState(branding.contactAddress);
  const [aboutText, setAboutText] = useState(branding.aboutText);
  const [website, setWebsite] = useState(branding.socialLinks?.website || '');
  const [instagram, setInstagram] = useState(branding.socialLinks?.instagram || '');
  const [facebook, setFacebook] = useState(branding.socialLinks?.facebook || '');
  const [youtube, setYoutube] = useState(branding.socialLinks?.youtube || '');

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const instituteId = user?.instituteId;

  const colorsValid =
    (primaryColor.trim() === '' || HEX_COLOR_REGEX.test(primaryColor.trim())) &&
    (secondaryColor.trim() === '' || HEX_COLOR_REGEX.test(secondaryColor.trim()));

  const handleSave = async () => {
    if (!instituteId || !colorsValid) return;
    setSaving(true);
    try {
      await axiosInstance.put(`/institutes/${instituteId}/branding`, {
        displayName: displayName.trim(),
        tagline: tagline.trim(),
        ...(primaryColor.trim() ? { primaryColor: primaryColor.trim() } : {}),
        ...(secondaryColor.trim() ? { secondaryColor: secondaryColor.trim() } : {}),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        contactAddress: contactAddress.trim(),
        aboutText: aboutText.trim(),
        socialLinks: {
          website: website.trim(),
          instagram: instagram.trim(),
          facebook: facebook.trim(),
          youtube: youtube.trim(),
        },
      });
      await refreshBranding();
      Alert.alert('Saved', 'Branding updated — applied across the app');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update branding');
    } finally {
      setSaving(false);
    }
  };

  const pickAndUpload = async (kind: 'logo' | 'banner') => {
    if (!instituteId) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    const setUploading = kind === 'logo' ? setUploadingLogo : setUploadingBanner;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'image/jpeg',
      } as any);

      await axiosInstance.post(`/institutes/${instituteId}/branding/${kind}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshBranding();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || `Failed to upload ${kind}`);
    } finally {
      setUploading(false);
    }
  };

  if (!instituteId) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Could not determine your institute. Try logging in again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>LOGO</Text>
      <View style={styles.imageRow}>
        {branding.logoUrl ? (
          <Image source={{ uri: branding.logoUrl }} style={styles.logoPreview} resizeMode="contain" />
        ) : (
          <View style={[styles.logoPreview, styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.textFaint }}>No logo</Text>
          </View>
        )}
        <Button
          label={uploadingLogo ? 'Uploading...' : 'Change Logo'}
          onPress={() => pickAndUpload('logo')}
          loading={uploadingLogo}
          variant="secondary"
          size="sm"
        />
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>BANNER</Text>
      {branding.bannerImageUrl ? (
        <Image source={{ uri: branding.bannerImageUrl }} style={styles.bannerPreview} resizeMode="cover" />
      ) : (
        <View style={[styles.bannerPreview, styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textFaint }}>No banner</Text>
        </View>
      )}
      <Button
        label={uploadingBanner ? 'Uploading...' : 'Change Banner'}
        onPress={() => pickAndUpload('banner')}
        loading={uploadingBanner}
        variant="secondary"
        size="sm"
        style={{ marginTop: spacing.sm }}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DISPLAY NAME</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={branding.instituteName}
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>TAGLINE</Text>
      <TextInput
        value={tagline}
        onChangeText={setTagline}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <View style={styles.colorRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>PRIMARY COLOR</Text>
          <TextInput
            value={primaryColor}
            onChangeText={setPrimaryColor}
            placeholder="#2563EB"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            style={[
              styles.input,
              { borderColor: HEX_COLOR_REGEX.test(primaryColor.trim()) || !primaryColor.trim() ? colors.border : colors.danger, color: colors.text, backgroundColor: colors.surface },
            ]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SECONDARY COLOR</Text>
          <TextInput
            value={secondaryColor}
            onChangeText={setSecondaryColor}
            placeholder="#1E40AF"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            style={[
              styles.input,
              { borderColor: HEX_COLOR_REGEX.test(secondaryColor.trim()) || !secondaryColor.trim() ? colors.border : colors.danger, color: colors.text, backgroundColor: colors.surface },
            ]}
          />
        </View>
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>CONTACT PHONE</Text>
      <TextInput
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>CONTACT EMAIL</Text>
      <TextInput
        value={contactEmail}
        onChangeText={setContactEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>CONTACT ADDRESS</Text>
      <TextInput
        value={contactAddress}
        onChangeText={setContactAddress}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>ABOUT TEXT</Text>
      <TextInput
        value={aboutText}
        onChangeText={setAboutText}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.h2, { color: colors.text }, styles.socialHeading]}>Social Links</Text>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>WEBSITE</Text>
      <TextInput
        value={website}
        onChangeText={setWebsite}
        autoCapitalize="none"
        placeholder="https://..."
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>INSTAGRAM</Text>
      <TextInput
        value={instagram}
        onChangeText={setInstagram}
        autoCapitalize="none"
        placeholder="https://instagram.com/..."
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>FACEBOOK</Text>
      <TextInput
        value={facebook}
        onChangeText={setFacebook}
        autoCapitalize="none"
        placeholder="https://facebook.com/..."
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>YOUTUBE</Text>
      <TextInput
        value={youtube}
        onChangeText={setYoutube}
        autoCapitalize="none"
        placeholder="https://youtube.com/..."
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      {!colorsValid ? (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md }]}>
          Color must be a valid hex code, e.g. #2563EB
        </Text>
      ) : null}

      <Button
        label={saving ? 'Saving...' : 'Save Branding'}
        onPress={handleSave}
        loading={saving}
        disabled={!colorsValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  logoPreview: { width: 72, height: 72, borderRadius: radius.md },
  bannerPreview: { width: '100%', height: 100, borderRadius: radius.md },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  colorRow: { flexDirection: 'row', gap: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  socialHeading: { marginTop: spacing.xxl },
});