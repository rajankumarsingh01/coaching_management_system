// src/components/ProfileAvatarEditor.tsx
//
// Tap karte hi photo change/remove karne ka option deta hai (expo-image-picker
// se photo chunta hai, POST /users/me/avatar pe upload karta hai; remove
// karne par DELETE /users/me/avatar call karta hai). Student aur Parent
// dono profile screens isi ek component ko reuse karte hain.

import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../api/axiosInstance';
import { Avatar } from './ui/Avatar';
import { useThemeColors } from '../theme/useThemeColors';

type Props = {
  avatarUrl?: string | null;
  name?: string;
  size?: number;
  onChange: (avatarUrl: string | null) => void;
};

export function ProfileAvatarEditor({ avatarUrl, name, size = 88, onChange }: Props) {
  const colors = useThemeColors();
  const [busy, setBusy] = useState(false);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission chahiye', 'Photo chunne ke liye gallery access allow karein.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('avatar', {
      uri: asset.uri,
      name: asset.fileName || 'avatar.jpg',
      type: asset.mimeType || 'image/jpeg',
    } as any);

    try {
      setBusy(true);
      const { data } = await axiosInstance.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.data.avatarUrl);
    } catch (err) {
      Alert.alert('Error', 'Profile picture upload nahi ho payi. Dobara try karein.');
    } finally {
      setBusy(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setBusy(true);
      await axiosInstance.delete('/users/me/avatar');
      onChange(null);
    } catch (err) {
      Alert.alert('Error', 'Profile picture remove nahi ho payi.');
    } finally {
      setBusy(false);
    }
  };

  const handlePress = () => {
    if (busy) return;

    if (avatarUrl) {
      Alert.alert('Profile Picture', undefined, [
        { text: 'Photo badlein', onPress: pickAndUpload },
        { text: 'Photo hatayein', style: 'destructive', onPress: removeAvatar },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      Alert.alert('Profile Picture', undefined, [
        { text: 'Photo chunein', onPress: pickAndUpload },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={busy}>
      <View>
        <Avatar uri={avatarUrl} name={name} size={size} />
        <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
          {busy ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons name="camera" size={14} color={colors.onPrimary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});