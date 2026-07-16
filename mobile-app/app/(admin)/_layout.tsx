import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-user" options={{ headerShown: true, title: 'Create User' }} />
      <Stack.Screen name="create-fee" options={{ headerShown: true, title: 'Add Fee' }} />
      <Stack.Screen name="user-detail" options={{ headerShown: true, title: 'User Details' }} />
      <Stack.Screen name="poster-generator" options={{ headerShown: true, title: 'Poster Generator' }} />
      <Stack.Screen name="about" options={{ headerShown: true, title: 'About Institute' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="batches" options={{ headerShown: true, title: 'Batches' }} />
      <Stack.Screen name="create-batch" options={{ headerShown: true, title: 'Create Batch' }} />
      <Stack.Screen name="batch-detail" options={{ headerShown: true, title: 'Batch Details' }} />
      <Stack.Screen name="batch-assign" options={{ headerShown: true, title: 'Assign' }} />
      <Stack.Screen name="assign-teacher-all" options={{ headerShown: true, title: 'Bulk Assign Teacher' }} />
      <Stack.Screen name="branding-settings" options={{ headerShown: true, title: 'Institute Branding' }} />
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
      <Stack.Screen name="homework-batches" options={{ headerShown: true, title: 'Homework' }} />
      <Stack.Screen name="batch-homework" options={{ headerShown: true, title: 'Homework' }} />
      <Stack.Screen name="create-homework" options={{ headerShown: true, title: 'Create Homework' }} />
      <Stack.Screen name="homework-detail" options={{ headerShown: true, title: 'Homework Details' }} />
      <Stack.Screen name="calendar-events" options={{ headerShown: true, title: 'Calendar' }} />
      <Stack.Screen name="create-event" options={{ headerShown: true, title: 'Add Event' }} />
      <Stack.Screen name="test-results" options={{ headerShown: true, title: 'Test Results' }} />
      <Stack.Screen name="salaries" options={{ headerShown: true, title: 'Salaries' }} />
      <Stack.Screen name="create-salary" options={{ headerShown: true, title: 'Add Salary' }} />
      <Stack.Screen name="salary-detail" options={{ headerShown: true, title: 'Salary Details' }} />
      <Stack.Screen name="weak-topics-batches" options={{ headerShown: true, title: 'Weak Topics' }} />
<Stack.Screen name="batch-weak-topics" options={{ headerShown: true, title: 'Weak Topics' }} />
<Stack.Screen name="generate-questions" options={{ headerShown: true, title: 'AI Question Generator' }} />
    </Stack>
  );
}