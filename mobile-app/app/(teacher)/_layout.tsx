import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="poster-generator" options={{ headerShown: true, title: 'Poster Generator' }} />
      <Stack.Screen name="about" options={{ headerShown: true, title: 'About Institute' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="batches" options={{ headerShown: true, title: 'My Batches' }} />
      <Stack.Screen name="batch-detail" options={{ headerShown: true, title: 'Batch Details' }} />
      <Stack.Screen name="attendance-report" options={{ headerShown: true, title: 'Attendance Report' }} />
      <Stack.Screen name="content-batches" options={{ headerShown: true, title: 'Notes & Lectures' }} />
      <Stack.Screen name="batch-content" options={{ headerShown: true, title: 'Batch Content' }} />
      <Stack.Screen name="upload-note" options={{ headerShown: true, title: 'Upload Note' }} />
      <Stack.Screen name="add-lecture" options={{ headerShown: true, title: 'Add Lecture' }} />
      <Stack.Screen name="test-batches" options={{ headerShown: true, title: 'Tests & Quizzes' }} />
      <Stack.Screen name="batch-tests" options={{ headerShown: true, title: 'Tests' }} />
      <Stack.Screen name="create-test" options={{ headerShown: true, title: 'Create Test' }} />
      <Stack.Screen name="test-detail" options={{ headerShown: true, title: 'Test Details' }} />
      <Stack.Screen name="add-question" options={{ headerShown: true, title: 'Add Question' }} />
      <Stack.Screen name="bulk-upload-questions" options={{ headerShown: true, title: 'Bulk Upload' }} />
      <Stack.Screen name="test-results" options={{ headerShown: true, title: 'Test Results' }} />
      <Stack.Screen name="leaderboard-batches" options={{ headerShown: true, title: 'Leaderboard' }} />
      <Stack.Screen name="leaderboard" options={{ headerShown: true, title: 'Leaderboard' }} />
      <Stack.Screen name="homework-batches" options={{ headerShown: true, title: 'Homework' }} />
      <Stack.Screen name="batch-homework" options={{ headerShown: true, title: 'Homework' }} />
      <Stack.Screen name="create-homework" options={{ headerShown: true, title: 'Create Homework' }} />
      <Stack.Screen name="homework-detail" options={{ headerShown: true, title: 'Homework Details' }} />
      <Stack.Screen name="calendar-events" options={{ headerShown: true, title: 'Calendar' }} />
      <Stack.Screen name="create-event" options={{ headerShown: true, title: 'Add Event' }} />
       <Stack.Screen name="create-event" options={{ headerShown: true, title: 'Add Event' }} />
      <Stack.Screen name="salary" options={{ headerShown: true, title: 'My Salary' }} />
    </Stack>
  );
}
