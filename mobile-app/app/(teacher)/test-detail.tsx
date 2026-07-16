import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useSocket } from '../../src/context/SocketContext';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Question = {
  _id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  topic: string;
};

type TestDetail = {
  _id: string;
  title: string;
  durationMinutes: number;
  isPublished: boolean;
  batchId: string;
  questions: Question[];
};

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const colors = useThemeColors();
  const { socket } = useSocket();

  const fetchTest = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/tests/${id}/edit`);
      setTest(data.data);

      // agar published hai to live "kitno ne submit kiya" counter ke liye starting count
      if (data.data.isPublished) {
        try {
          const resultsRes = await axiosInstance.get(`/results/test/${id}`);
          setSubmissionCount(resultsRes.data.data.length);
        } catch {
          // non-fatal — counter bas 0 se start ho jayega
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load test', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // Real-time — same test ka question count kisi doosre tab/device se add
  // hote hi turant yahan bhi dikh jaye, live submission counter, aur agar
  // ye test kahin aur se delete ho jaye to wapas list pe bhej do
  useEffect(() => {
    if (!socket || !id) return;

    const handleQuestionAdded = (payload: { testId: string; questionCount: number }) => {
      if (payload.testId !== id) return;
      // question ka poora content sirf REST se milta hai (socket sirf count bhejta
      // hai, privacy/size ki wajah se) — isliye halka refetch
      fetchTest();
    };

    const handleSubmission = (payload: { testId: string }) => {
      if (payload.testId !== id) return;
      setSubmissionCount((count) => count + 1);
    };

    const handleDeleted = (payload: { testId: string }) => {
      if (payload.testId !== id) return;
      Alert.alert('Test Removed', 'Ye test kisi aur ne delete kar diya hai.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    };

    socket.on('test:questionAdded', handleQuestionAdded);
    socket.on('test:submission', handleSubmission);
    socket.on('test:deleted', handleDeleted);

    return () => {
      socket.off('test:questionAdded', handleQuestionAdded);
      socket.off('test:submission', handleSubmission);
      socket.off('test:deleted', handleDeleted);
    };
  }, [socket, id, fetchTest]);

  const handlePublish = async () => {
    if (!test) return;
    setPublishing(true);
    try {
      const { data } = await axiosInstance.patch(`/tests/${test._id}/publish`);
      setTest(data.data);
      Alert.alert('Published', 'Students ko is test ka notification chala gaya hai');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to publish test');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = () => {
    if (!test) return;
    Alert.alert('Delete Test', `"${test.title}" delete karna hai? Ye action wapas nahi ho sakta.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await axiosInstance.delete(`/tests/${test._id}`);
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete test');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading || !test) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const optionLabels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleRow}>
        <Text style={[typography.h1, { color: colors.text, flex: 1 }]}>{test.title}</Text>
        <Badge label={test.isPublished ? 'Published' : 'Draft'} tone={test.isPublished ? 'success' : 'warning'} />
      </View>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
        {test.durationMinutes} minutes · {test.questions.length} question{test.questions.length === 1 ? '' : 's'}
      </Text>

      {test.isPublished ? (
        <View style={styles.liveRow}>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {submissionCount} student{submissionCount === 1 ? '' : 's'} submitted so far
          </Text>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Button
          label="+ Add Question"
          size="sm"
          variant="outline"
          onPress={() => router.push({ pathname: '/(teacher)/add-question', params: { testId: test._id } })}
        />
        <Button
          label="+ Bulk Upload"
          size="sm"
          variant="outline"
          onPress={() => router.push({ pathname: '/(teacher)/bulk-upload-questions', params: { testId: test._id } })}
        />
<Button
  label="🤖 Generate with AI"
  size="sm"
  variant="outline"
  onPress={() => router.push({ pathname: '/(teacher)/generate-questions', params: { testId: test._id } })}
/>

        {test.isPublished ? (
          <Button
            label="📊 View Results"
            size="sm"
            variant="outline"
            onPress={() => router.push({ pathname: '/(teacher)/test-results', params: { id: test._id, title: test.title } })}
          />
        ) : null}
      </View>

      {!test.isPublished ? (
        <Button
          label={publishing ? 'Publishing...' : 'Publish Test'}
          onPress={handlePublish}
          loading={publishing}
          disabled={test.questions.length === 0}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      ) : null}
      {!test.isPublished && test.questions.length === 0 ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
          Kam se kam 1 question add karo publish karne ke liye
        </Text>
      ) : null}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
        QUESTIONS ({test.questions.length})
      </Text>

      {test.questions.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
          Abhi koi question nahi hai. Upar se add karo.
        </Text>
      ) : (
        test.questions.map((q, index) => (
          <Card key={q._id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>
                {index + 1}. {q.questionText}
              </Text>
              {q.topic ? <Badge label={q.topic} tone="info" /> : null}
            </View>
            {optionLabels.map((letter) => {
              const optionText = q[`option${letter}` as 'optionA'];
              const isCorrect = q.correctAnswer === letter;
              return (
                <View
                  key={letter}
                  style={[
                    styles.optionRow,
                    isCorrect && { backgroundColor: colors.successBg, borderRadius: radius.sm },
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      { color: isCorrect ? colors.success : colors.textMuted },
                      isCorrect && { fontWeight: '700' },
                    ]}
                  >
                    {letter}. {optionText} {isCorrect ? '✓' : ''}
                  </Text>
                </View>
              );
            })}
          </Card>
        ))
      )}

      <Button
        label={deleting ? 'Deleting...' : 'Delete Test'}
        variant="danger"
        onPress={handleDelete}
        loading={deleting}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  sectionLabel: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  questionCard: { marginBottom: spacing.md },
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  optionRow: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
});