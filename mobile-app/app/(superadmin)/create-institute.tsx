import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';

export default function CreateInstituteScreen() {
  const [form, setForm] = useState({
    instituteName: '',
    instituteCode: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/institutes', form);
      Alert.alert('Success', `Institute "${data.data.institute.name}" created`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Onboard New Institute</Text>

      <TextInput
        placeholder="Institute Name"
        value={form.instituteName}
        onChangeText={(v) => handleChange('instituteName', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Institute Code (e.g. SCC001)"
        value={form.instituteCode}
        onChangeText={(v) => handleChange('instituteCode', v)}
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>Institute Admin Account</Text>

      <TextInput
        placeholder="Admin Name"
        value={form.adminName}
        onChangeText={(v) => handleChange('adminName', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Admin Email"
        value={form.adminEmail}
        onChangeText={(v) => handleChange('adminEmail', v)}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Admin Password"
        value={form.adminPassword}
        onChangeText={(v) => handleChange('adminPassword', v)}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Institute'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});