import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, BackHandler } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

type Question = {
  _id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  topic: string;
};

type Test = { _id: string; title: string; durationMinutes: number; questions: Question[] };

export default function AttemptTestScreen() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      const { data } = await axiosInstance.get(`/tests/${testId}/attempt`);
      setTest(data.data);
      setTimeLeft(data.data.durationMinutes * 60);
    };
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft === test?.durationMinutes! * 60]);

  // prevent accidental back-button exit mid-test
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Leave test?', 'Your progress will be lost if you leave now.', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', onPress: () => router.back() },
      ]);
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const selectAnswer = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!test || submitted) return;
    setSubmitting(true);
    try {
      const payload = test.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || null,
      }));
      const { data } = await axiosInstance.post(`/results/test/${testId}/submit`, { answers: payload });
      setSubmitted(true);
      Alert.alert(
        'Test Submitted',
        `Score: ${data.data.score}/${data.data.totalQuestions} (${data.data.percentage}%)`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (!test) return <Text style={styles.loading}>Loading test...</Text>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={styles.container}>
      <View style={styles.timerBar}>
        <Text style={styles.timerText}>
          ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
      </View>

      <ScrollView>
        {test.questions.map((q, idx) => (
          <View key={q._id} style={styles.questionCard}>
            <Text style={styles.questionText}>
              {idx + 1}. {q.questionText}
            </Text>
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.option, answers[q._id] === opt && styles.optionSelected]}
                onPress={() => selectAnswer(q._id, opt)}
              >
                <Text style={[styles.optionText, answers[q._id] === opt && styles.optionTextSelected]}>
                  {opt}. {q[`option${opt}` as 'optionA']}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Test'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { textAlign: 'center', marginTop: 40, color: '#9ca3af' },
  timerBar: { backgroundColor: '#fef3c7', padding: 10, alignItems: 'center' },
  timerText: { fontWeight: '700', color: '#92400e' },
  questionCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  questionText: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  option: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  optionSelected: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  optionText: { fontSize: 13, color: '#374151' },
  optionTextSelected: { color: '#1e40af', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});