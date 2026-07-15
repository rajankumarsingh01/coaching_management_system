import { useEffect, useState } from 'react';
import { View, Text, FlatList, Linking, StyleSheet } from 'react-native';
import { useBatch } from '../../../src/context/BatchContext';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

type Note = { _id: string; title: string; fileUrl: string; fileType: string; uploadedBy: { name: string } };

export default function StudentNotesScreen() {
  const { selectedBatch } = useBatch();
  const [notes, setNotes] = useState<Note[]>([]);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedBatch) return;
      const { data } = await axiosInstance.get(`/notes/batch/${selectedBatch._id}`);
      setNotes(data.data);
    };
    fetchNotes();
  }, [selectedBatch]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Notes" tagline={selectedBatch?.name} />

      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
            No notes uploaded yet.
          </Text>
        }
        renderItem={({ item }) => (
          <PressableCard style={styles.card} onPress={() => Linking.openURL(item.fileUrl)}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>📄 {item.title}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              {item.fileType.toUpperCase()} · by {item.uploadedBy?.name}
            </Text>
          </PressableCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.sm },
});