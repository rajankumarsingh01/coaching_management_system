import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';

type Note = { _id: string; title: string; fileUrl: string; fileType: string; uploadedBy: { name: string } };

export default function StudentNotesScreen() {
  const { selectedBatch } = useBatch();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedBatch) return;
      const { data } = await axiosInstance.get(`/notes/batch/${selectedBatch._id}`);
      setNotes(data.data);
    };
    fetchNotes();
  }, [selectedBatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes {selectedBatch ? `— ${selectedBatch.name}` : ''}</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No notes uploaded yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => Linking.openURL(item.fileUrl)}>
            <Text style={styles.cardTitle}>📄 {item.title}</Text>
            <Text style={styles.cardSub}>
              {item.fileType.toUpperCase()} · by {item.uploadedBy?.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});