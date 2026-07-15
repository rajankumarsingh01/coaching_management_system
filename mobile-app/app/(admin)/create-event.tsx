import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

type Batch = { _id: string; name: string };
type EventType = 'test' | 'holiday' | 'event';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TYPES: EventType[] = ['event', 'test', 'holiday'];

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<EventType>('event');
  const [description, setDescription] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null); // null = institute-wide
  const [submitting, setSubmitting] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const isValid = title.trim().length >= 2 && DATE_REGEX.test(date);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/calendar', {
        title: title.trim(),
        date,
        type,
        batchId: selectedBatchId || undefined,
        description: description.trim() || undefined,
      });
      Alert.alert('Success', 'Event created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted }]}>TITLE</Text>
      <TextInput
        placeholder="e.g. Diwali Break"
        placeholderTextColor={colors.textFaint}
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DATE (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="e.g. 2026-08-15"
        placeholderTextColor={colors.textFaint}
        value={date}
        onChangeText={setDate}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>TYPE</Text>
      <View style={styles.chipWrap}>
        {TYPES.map((t) => {
          const active = t === type;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text, textTransform: 'capitalize' }]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>SCOPE</Text>
      {loadingBatches ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : (
        <View style={styles.chipWrap}>
          <TouchableOpacity
            onPress={() => setSelectedBatchId(null)}
            style={[
              styles.chip,
              {
                backgroundColor: selectedBatchId === null ? colors.primary : colors.surface,
                borderColor: selectedBatchId === null ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[typography.label, { color: selectedBatchId === null ? colors.onPrimary : colors.text }]}>
              Institute-wide
            </Text>
          </TouchableOpacity>
          {batches.map((b) => {
            const active = b._id === selectedBatchId;
            return (
              <TouchableOpacity
                key={b._id}
                onPress={() => setSelectedBatchId(b._id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={[typography.label, { color: active ? colors.onPrimary : colors.text }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>DESCRIPTION (OPTIONAL)</Text>
      <TextInput
        placeholder="Notes about this event"
        placeholderTextColor={colors.textFaint}
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <Button
        label={submitting ? 'Creating...' : 'Create Event'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!isValid}
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});