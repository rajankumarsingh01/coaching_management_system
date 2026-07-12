import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';
import { useBatch } from '../../src/context/BatchContext';

export default function TeacherHome() {
  const { batches, selectedBatch, setSelectedBatch, loading } = useBatch();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading batches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Dashboard</Text>

      {batches.length === 0 ? (
        <Text style={styles.empty}>No batches assigned yet.</Text>
      ) : (
        <>
          <TouchableOpacity style={styles.selector} onPress={() => setPickerOpen(!pickerOpen)}>
            <Text style={styles.selectorText}>
              {selectedBatch ? selectedBatch.name : 'Select a batch'} ▾
            </Text>
          </TouchableOpacity>

          {pickerOpen && (
            <FlatList
              data={batches}
              keyExtractor={(item) => item._id}
              style={styles.dropdown}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedBatch(item);
                    setPickerOpen(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  empty: { color: '#9ca3af' },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
  },
  selectorText: { fontSize: 16, fontWeight: '500' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});