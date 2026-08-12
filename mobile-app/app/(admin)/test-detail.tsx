// import { useState, useEffect, useCallback } from 'react';
// import { View, Text, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import axiosInstance from '../../src/api/axiosInstance';
// import { Badge } from '../../src/components/ui/Badge';
// import { Button } from '../../src/components/ui/Button';
// import { Card } from '../../src/components/ui/Card';
// import { useThemeColors } from '../../src/theme/useThemeColors';
// import { spacing, typography, radius } from '../../src/theme/tokens';

// type Question = {
//   _id: string;
//   questionText: string;
//   optionA: string;
//   optionB: string;
//   optionC: string;
//   optionD: string;
//   correctAnswer: 'A' | 'B' | 'C' | 'D';
//   topic: string;
// };

// type TestDetail = {
//   _id: string;
//   title: string;
//   durationMinutes: number;
//   isPublished: boolean;
//   questions: Question[];
// };

// export default function TestDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const [test, setTest] = useState<TestDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [publishing, setPublishing] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const colors = useThemeColors();

//   const fetchTest = useCallback(async () => {
//     try {
//       const { data } = await axiosInstance.get(`/tests/${id}/edit`);
//       setTest(data.data);
//     } catch (err: any) {
//       Alert.alert('Error', err.response?.data?.message || 'Failed to load test', [
//         { text: 'OK', onPress: () => router.back() },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchTest();
//   }, [fetchTest]);

//   const handlePublish = async () => {
//     if (!test) return;
//     setPublishing(true);
//     try {
//       const { data } = await axiosInstance.patch(`/tests/${test._id}/publish`);
//       setTest(data.data);
//       Alert.alert('Published', 'Students ko is test ka notification chala gaya hai');
//     } catch (err: any) {
//       Alert.alert('Error', err.response?.data?.message || 'Failed to publish test');
//     } finally {
//       setPublishing(false);
//     }
//   };

//   const handleDelete = () => {
//     if (!test) return;
//     Alert.alert('Delete Test', `"${test.title}" delete karna hai? Ye action wapas nahi ho sakta.`, [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           setDeleting(true);
//           try {
//             await axiosInstance.delete(`/tests/${test._id}`);
//             router.back();
//           } catch (err: any) {
//             Alert.alert('Error', err.response?.data?.message || 'Failed to delete test');
//             setDeleting(false);
//           }
//         },
//       },
//     ]);
//   };

//   if (loading || !test) {
//     return (
//       <View style={[styles.centered, { backgroundColor: colors.background }]}>
//         <ActivityIndicator color={colors.primary} />
//       </View>
//     );
//   }

//   const optionLabels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

//   return (
//     <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.titleRow}>
//         <Text style={[typography.h1, { color: colors.text, flex: 1 }]}>{test.title}</Text>
//         <Badge label={test.isPublished ? 'Published' : 'Draft'} tone={test.isPublished ? 'success' : 'warning'} />
//       </View>
//       <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
//         {test.durationMinutes} minutes · {test.questions.length} question{test.questions.length === 1 ? '' : 's'}
//       </Text>

//       <View style={styles.actionRow}>
//         <Button
//           label="+ Add Question"
//           size="sm"
//           variant="outline"
//           onPress={() => router.push({ pathname: '/(admin)/add-question', params: { testId: test._id } })}
//         />
//         <Button
//           label="+ Bulk Upload"
//           size="sm"
//           variant="outline"
//           onPress={() => router.push({ pathname: '/(admin)/bulk-upload-questions', params: { testId: test._id } })}
//         />

//         <Button
//   label="🤖 Generate with AI"
//   size="sm"
//   variant="outline"
//   onPress={() => router.push({ pathname: '/(admin)/generate-questions', params: { testId: test._id } })}
// />

//         {test.isPublished ? (
//           <Button
//             label="📊 View Results"
//             size="sm"
//             variant="outline"
//             onPress={() => router.push({ pathname: '/(admin)/test-results', params: { id: test._id, title: test.title } })}
//           />
//         ) : null}
//       </View>

//       {!test.isPublished ? (
//         <Button
//           label={publishing ? 'Publishing...' : 'Publish Test'}
//           onPress={handlePublish}
//           loading={publishing}
//           disabled={test.questions.length === 0}
//           fullWidth
//           style={{ marginTop: spacing.lg }}
//         />
//       ) : null}
//       {!test.isPublished && test.questions.length === 0 ? (
//         <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
//           Kam se kam 1 question add karo publish karne ke liye
//         </Text>
//       ) : null}

//       <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
//         QUESTIONS ({test.questions.length})
//       </Text>

//       {test.questions.length === 0 ? (
//         <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
//           Abhi koi question nahi hai. Upar se add karo.
//         </Text>
//       ) : (
//         test.questions.map((q, index) => (
//           <Card key={q._id} style={styles.questionCard}>
//             <View style={styles.questionHeader}>
//               <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>
//                 {index + 1}. {q.questionText}
//               </Text>
//               {q.topic ? <Badge label={q.topic} tone="info" /> : null}
//             </View>
//             {optionLabels.map((letter) => {
//               const optionText = q[`option${letter}` as 'optionA'];
//               const isCorrect = q.correctAnswer === letter;
//               return (
//                 <View
//                   key={letter}
//                   style={[
//                     styles.optionRow,
//                     isCorrect && { backgroundColor: colors.successBg, borderRadius: radius.sm },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       typography.body,
//                       { color: isCorrect ? colors.success : colors.textMuted },
//                       isCorrect && { fontWeight: '700' },
//                     ]}
//                   >
//                     {letter}. {optionText} {isCorrect ? '✓' : ''}
//                   </Text>
//                 </View>
//               );
//             })}
//           </Card>
//         ))
//       )}

//       <Button
//         label={deleting ? 'Deleting...' : 'Delete Test'}
//         variant="danger"
//         onPress={handleDelete}
//         loading={deleting}
//         fullWidth
//         style={{ marginTop: spacing.xxl }}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
//   titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
//   actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
//   sectionLabel: { marginTop: spacing.xxl, marginBottom: spacing.sm },
//   questionCard: { marginBottom: spacing.md },
//   questionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
//   optionRow: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
// });



import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
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
  questions: Question[];
};

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colors = useThemeColors();

  const fetchTest = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/tests/${id}/edit`);
      setTest(data.data);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={[typography.h1, { color: colors.text, flex: 1 }]}>{test.title}</Text>
          <Badge label={test.isPublished ? 'Published' : 'Draft'} tone={test.isPublished ? 'success' : 'warning'} />
        </View>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {test.durationMinutes} minutes · {test.questions.length} question{test.questions.length === 1 ? '' : 's'}
        </Text>

        <View style={styles.actionRow}>
          <Button
            label="+ Add Question"
            size="sm"
            variant="outline"
            onPress={() => router.push({ pathname: '/(admin)/add-question', params: { testId: test._id } })}
          />
          <Button
            label="+ Bulk Upload"
            size="sm"
            variant="outline"
            onPress={() => router.push({ pathname: '/(admin)/bulk-upload-questions', params: { testId: test._id } })}
          />

          <Button
            label="🤖 Generate with AI"
            size="sm"
            variant="outline"
            onPress={() => router.push({ pathname: '/(admin)/generate-questions', params: { testId: test._id } })}
          />

          {test.isPublished ? (
            <Button
              label="📊 View Results"
              size="sm"
              variant="outline"
              onPress={() => router.push({ pathname: '/(admin)/test-results', params: { id: test._id, title: test.title } })}
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
      </ScrollView>

      {/* Fixed bottom action bar — hamesha visible, scroll ke saath nahi jaata */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          label={deleting ? 'Deleting...' : 'Delete Test'}
          variant="danger"
          onPress={handleDelete}
          loading={deleting}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  sectionLabel: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  questionCard: { marginBottom: spacing.md },
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  optionRow: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
});
