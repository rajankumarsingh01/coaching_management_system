import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Linking, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { PressableCard } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type Submission = {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  attachmentUrl: string;
  submittedAt: string;
  isLate: boolean;
};

export default function HomeworkDetailScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const colors = useThemeColors();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/submission/homework/${id}`);
      setSubmissions(data.data);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleDelete = () => {
    Alert.alert('Delete Homework', `"${title}" delete karna hai? Ye action wapas nahi ho sakta.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await axiosInstance.delete(`/homework/${id}`);
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete homework');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.label, { color: colors.textMuted }]}>
          SUBMISSIONS ({submissions.length})
        </Text>
        <Button label={deleting ? 'Deleting...' : 'Delete Homework'} variant="danger" size="sm" onPress={handleDelete} loading={deleting} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchSubmissions}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
              Koi submission nahi aayi abhi tak.
            </Text>
          }
          renderItem={({ item }) => (
            <PressableCard style={styles.row} onPress={() => Linking.openURL(item.attachmentUrl)}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.studentId.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {item.studentId.email} · {new Date(item.submittedAt).toLocaleDateString()}
                </Text>
              </View>
              <Badge label={item.isLate ? 'Late' : 'On Time'} tone={item.isLate ? 'danger' : 'success'} />
            </PressableCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
});