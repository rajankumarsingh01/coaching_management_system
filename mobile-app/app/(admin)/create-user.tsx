import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

const ROLES = ['teacher', 'student', 'parent'];

type Parent = { id: string; name: string; email: string };

export default function CreateUserScreen() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher', parentId: '' });
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchParents = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/users', { params: { role: 'parent' } });
      setParents(data.data);
    } catch (err) {
      console.error('Failed to load parents', err);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (form.role !== 'student' || !form.parentId) {
        delete payload.parentId;
      }
      const { data } = await axiosInstance.post('/users/register', payload);
      Alert.alert('Success', `${data.data.role} account created: ${data.data.name}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
      fetchParents(); // refresh so a newly created parent is available next time
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create User</Text>

      <TextInput
        placeholder="Name"
        value={form.name}
        onChangeText={(v) => handleChange('name', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(v) => handleChange('email', v)}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={(v) => handleChange('password', v)}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>Role</Text>
      <View style={styles.roleRow}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleChip, form.role === r && styles.roleChipActive]}
            onPress={() => handleChange('role', r)}
          >
            <Text style={[styles.roleChipText, form.role === r && styles.roleChipTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {form.role === 'student' && (
        <>
          <Text style={styles.label}>Link to Parent (optional)</Text>
          <View style={styles.parentList}>
            <TouchableOpacity
              style={[styles.parentChip, form.parentId === '' && styles.parentChipActive]}
              onPress={() => handleChange('parentId', '')}
            >
              <Text style={[styles.parentChipText, form.parentId === '' && styles.parentChipTextActive]}>
                None
              </Text>
            </TouchableOpacity>
            {parents.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.parentChip, form.parentId === p.id && styles.parentChipActive]}
                onPress={() => handleChange('parentId', p.id)}
              >
                <Text
                  style={[styles.parentChipText, form.parentId === p.id && styles.parentChipTextActive]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {parents.length === 0 && (
            <Text style={styles.hint}>No parent accounts yet — create one first if needed.</Text>
          )}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create User'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  roleChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roleChipText: { color: '#374151' },
  roleChipTextActive: { color: '#fff', fontWeight: '600' },
  parentList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  parentChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  parentChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  parentChipText: { fontSize: 12, color: '#374151' },
  parentChipTextActive: { color: '#fff', fontWeight: '600' },
  hint: { fontSize: 12, color: '#9ca3af', marginBottom: 16 },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});