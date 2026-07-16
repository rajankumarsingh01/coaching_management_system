import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';
import { useBranding } from '../../../src/context/BrandingContext';
import { useChild } from '../../../src/context/ChildContext';
import { usePushNotifications } from '../../../src/hooks/usePushNotifications';
import { useAuth } from '../../../src/context/AuthContext';

export default function ParentHome() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { children, selectedChild, setSelectedChild, loading } = useChild();
  const { user } = useAuth();
  const [pickerVisible, setPickerVisible] = useState(false);

  usePushNotifications(!!user);

  const quickLinks = [
    { label: 'Attendance', icon: 'checkmark-done-outline' as const, onPress: () => router.push('/(parent)/(tabs)/attendance') },
    { label: 'Fees', icon: 'cash-outline' as const, onPress: () => router.push('/(parent)/(tabs)/fees') },
    { label: 'Homework', icon: 'clipboard-outline' as const, onPress: () => router.push('/(parent)/(tabs)/homework') },
    { label: 'Results', icon: 'trophy-outline' as const, onPress: () => router.push('/(parent)/results') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={`Welcome, ${user?.name ?? ''}`}
        tagline={branding.instituteName}
        bannerUrl={branding.bannerImageUrl || undefined}
        logoUrl={branding.logoUrl || undefined}
      />

      <ScrollView contentContainerStyle={styles.content}>
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
            {/* Child switcher — only shown when there's actually a choice to make */}
            {children.length > 1 && (
              <TouchableOpacity
                style={[styles.switcher, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => setPickerVisible(true)}
              >
                <View>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Viewing</Text>
                  <Text style={[typography.h2, { color: colors.text }]}>{selectedChild?.name}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            {selectedChild && (
              <PressableCard style={styles.childCard}>
                <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
                  <Text style={[typography.h1, { color: colors.primary }]}>
                    {selectedChild.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h2, { color: colors.text }]}>{selectedChild.name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{selectedChild.email}</Text>
                </View>
              </PressableCard>
            )}

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

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.md }]}>Select Child</Text>
            <FlatList
              data={children}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalRow}
                  onPress={() => {
                    setSelectedChild(item);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[typography.body, { color: colors.text }]}>{item.name}</Text>
                  {selectedChild?.id === item.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  switcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  childCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '47%', alignItems: 'flex-start' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '60%' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
});