import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Note = { _id: string; title: string; fileUrl: string; fileType: string; uploadedBy: { name: string } };
type Lecture = { _id: string; title: string; youtubeUrl: string; uploadedBy: { name: string } };
type Segment = 'notes' | 'lectures';

export default function TeacherBatchContentScreen() {
  const { batchId, batchName } = useLocalSearchParams<{ batchId: string; batchName: string }>();
  const [segment, setSegment] = useState<Segment>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const colors = useThemeColors();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [notesRes, lecturesRes] = await Promise.all([
        axiosInstance.get(`/notes/batch/${batchId}`),
        axiosInstance.get(`/lectures/batch/${batchId}`),
      ]);
      setNotes(notesRes.data.data);
      setLectures(lecturesRes.data.data);
    } catch (err) {
      console.error('Failed to load batch content', err);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteNote = (note: Note) => {
    Alert.alert('Delete Note', `Delete "${note.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(note._id);
          try {
            await axiosInstance.delete(`/notes/${note._id}`);
            setNotes((prev) => prev.filter((n) => n._id !== note._id));
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete note');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleDeleteLecture = (lecture: Lecture) => {
    Alert.alert('Delete Lecture', `Delete "${lecture.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(lecture._id);
          try {
            await axiosInstance.delete(`/lectures/${lecture._id}`);
            setLectures((prev) => prev.filter((l) => l._id !== lecture._id));
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete lecture');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[typography.caption, { color: colors.textMuted, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        {batchName}
      </Text>

      <View style={styles.segmentRow}>
        {(['notes', 'lectures'] as Segment[]).map((s) => {
          const active = s === segment;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setSegment(s)}
              style={[
                styles.segmentChip,
                { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>
                {s === 'notes' ? 'Notes' : 'Lectures'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.addButtonWrap}>
        <Button
          label={segment === 'notes' ? '+ Add Note' : '+ Add Lecture'}
          size="sm"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: segment === 'notes' ? '/(teacher)/upload-note' : '/(teacher)/add-lecture',
              params: { batchId },
            })
          }
        />
      </View>

      {segment === 'notes' ? (
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchAll}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              {loading ? 'Loading...' : 'No notes uploaded yet.'}
            </Text>
          }
          renderItem={({ item }) => (
            <PressableCard style={styles.row} onPress={() => Linking.openURL(item.fileUrl)}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>📄 {item.title}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {item.fileType.toUpperCase()} · by {item.uploadedBy?.name}
                </Text>
              </View>
              {deletingId === item._id ? (
                <ActivityIndicator color={colors.danger} size="small" />
              ) : (
                <TouchableOpacity onPress={() => handleDeleteNote(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
                </TouchableOpacity>
              )}
            </PressableCard>
          )}
        />
      ) : (
        <FlatList
          data={lectures}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchAll}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              {loading ? 'Loading...' : 'No lectures added yet.'}
            </Text>
          }
          renderItem={({ item }) => (
            <PressableCard style={styles.row} onPress={() => Linking.openURL(item.youtubeUrl)}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>▶️ {item.title}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  by {item.uploadedBy?.name}
                </Text>
              </View>
              {deletingId === item._id ? (
                <ActivityIndicator color={colors.danger} size="small" />
              ) : (
                <TouchableOpacity onPress={() => handleDeleteLecture(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
                </TouchableOpacity>
              )}
            </PressableCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  segmentChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  addButtonWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md, alignItems: 'flex-start' },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});
