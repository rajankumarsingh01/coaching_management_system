import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  pending: 'danger',
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function SalaryDetailScreen() {
  const params = useLocalSearchParams<{
    id: string; teacherName: string; teacherEmail: string; month: string; year: string;
    baseSalary: string; advanceTaken: string; amountPaid: string; status: string; remarks: string;
  }>();

  const [baseSalary] = useState(Number(params.baseSalary));
  const [advanceTaken, setAdvanceTaken] = useState(Number(params.advanceTaken));
  const [amountPaid, setAmountPaid] = useState(Number(params.amountPaid));
  const [status, setStatus] = useState(params.status);

  const [advanceAmount, setAdvanceAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [advancing, setAdvancing] = useState(false);
  const [paying, setPaying] = useState(false);

  const colors = useThemeColors();
  const remaining = baseSalary - advanceTaken - amountPaid;

  const handleAdvance = async () => {
    const amount = Number(advanceAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0');
      return;
    }
    setAdvancing(true);
    try {
      const { data } = await axiosInstance.patch(`/salaries/${params.id}/advance`, { amount });
      const salary = data.data;
      setAdvanceTaken(salary.advanceTaken);
      setAmountPaid(salary.amountPaid);
      setStatus(salary.status);
      setAdvanceAmount('');
      Alert.alert('Success', 'Advance recorded successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to record advance');
    } finally {
      setAdvancing(false);
    }
  };

  const handlePay = async () => {
    const amount = payAmount.trim() === '' ? undefined : Number(payAmount);
    if (amount !== undefined && amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0, or leave blank to pay full remaining amount');
      return;
    }
    setPaying(true);
    try {
      const { data } = await axiosInstance.patch(`/salaries/${params.id}/pay`, { amount });
      const salary = data.data;
      setAdvanceTaken(salary.advanceTaken);
      setAmountPaid(salary.amountPaid);
      setStatus(salary.status);
      setPayAmount('');
      Alert.alert('Success', 'Salary payment recorded successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaying(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h1, { color: colors.text }]}>{params.teacherName}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{params.teacherEmail}</Text>
            <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
              {MONTH_NAMES[Number(params.month) - 1]} {params.year}
            </Text>
          </View>
          <Badge label={capitalize(status)} tone={STATUS_TONE[status] ?? 'neutral'} />
        </View>
      </Card>

      <Card style={styles.breakdownCard}>
        <Row label="Base Salary" value={`₹${baseSalary}`} colors={colors} />
        <Row label="Advance Taken" value={`₹${advanceTaken}`} colors={colors} />
        <Row label="Amount Paid" value={`₹${amountPaid}`} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Row label="Remaining" value={`₹${remaining}`} colors={colors} bold />
        {params.remarks ? (
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md }]}>
            Remarks: {params.remarks}
          </Text>
        ) : null}
      </Card>

      {status !== 'paid' && (
        <>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>GIVE ADVANCE</Text>
          <View style={styles.actionRow}>
            <TextInput
              placeholder={`Up to ₹${remaining}`}
              placeholderTextColor={colors.textFaint}
              value={advanceAmount}
              onChangeText={setAdvanceAmount}
              keyboardType="numeric"
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
            <Button label={advancing ? 'Saving...' : 'Give Advance'} onPress={handleAdvance} loading={advancing} variant="secondary" />
          </View>

          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>PAY SALARY</Text>
          <View style={styles.actionRow}>
            <TextInput
              placeholder={`Blank = full ₹${remaining}`}
              placeholderTextColor={colors.textFaint}
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="numeric"
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
            <Button label={paying ? 'Saving...' : 'Pay Now'} onPress={handlePay} loading={paying} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Row({ label, value, colors, bold }: { label: string; value: string; colors: any; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[typography.body, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[bold ? typography.h2 : typography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  headerCard: { marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  breakdownCard: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  divider: { height: 1, marginVertical: spacing.sm },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
});