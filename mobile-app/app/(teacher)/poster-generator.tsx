import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import PosterCanvas, { PosterData } from '../../src/components/PosterTemplates';

const TEMPLATES: { id: PosterData['templateId']; label: string }[] = [
  { id: 'achievement', label: '🏆 Top Scorers' },
  { id: 'milestone', label: '📈 Attendance Milestone' },
  { id: 'announcement', label: '📢 Announcement' },
];

export default function PosterGeneratorScreen() {
  const [templateId, setTemplateId] = useState<PosterData['templateId']>('achievement');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linesText, setLinesText] = useState('');
  const [footerNote, setFooterNote] = useState('');
  const [sharing, setSharing] = useState(false);
  const posterRef = useRef<View>(null);

  const posterData: PosterData = {
    templateId,
    title: title || 'Your Title Here',
    subtitle,
    lines: linesText.split('\n').filter((l) => l.trim().length > 0),
    footerNote,
  };

  const handleShare = async () => {
    if (!posterRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(posterRef, { format: 'png', quality: 1 });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share Poster' });
    } catch (err) {
      Alert.alert('Error', 'Failed to generate poster image');
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionLabel}>Choose Template</Text>
      <View style={styles.templateRow}>
        {TEMPLATES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.templateChip, templateId === t.id && styles.templateChipActive]}
            onPress={() => setTemplateId(t.id)}
          >
            <Text style={[styles.templateChipText, templateId === t.id && styles.templateChipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Title (e.g. Top 3 Scorers — Physics Test)"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Subtitle (e.g. July 2026)"
        value={subtitle}
        onChangeText={setSubtitle}
        style={styles.input}
      />
      <TextInput
        placeholder={'One line per entry, e.g.:\n1. Rahul Kumar - 98%\n2. Priya Singh - 95%'}
        value={linesText}
        onChangeText={setLinesText}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
      />
      <TextInput
        placeholder="Footer note (optional, e.g. Admissions open now!)"
        value={footerNote}
        onChangeText={setFooterNote}
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>Preview</Text>
      <View style={styles.previewWrapper}>
        <View ref={posterRef} collapsable={false}>
          <PosterCanvas data={posterData} />
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={sharing}>
        <Text style={styles.shareButtonText}>{sharing ? 'Preparing...' : '📤 Share Poster'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  sectionLabel: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  templateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'flex-start', marginBottom: 16 },
  templateChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  templateChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  templateChipText: { color: '#374151', fontSize: 13 },
  templateChipTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  previewWrapper: { marginVertical: 12, alignItems: 'center' },
  shareButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  shareButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});