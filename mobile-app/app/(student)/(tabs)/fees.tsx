import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import axiosInstance from '../../../src/api/axiosInstance';
import RazorpayCheckoutModal from '../../../src/components/RazorpayCheckoutModal';
import { useAuth } from '../../../src/context/AuthContext';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

type Fee = {
  _id: string;
  amount: number;
  status: string;
  dueDate: string;
  batchId: { name: string };
};

type StatusTone = 'success' | 'warning' | 'danger';

const STATUS_TONE: Record<string, StatusTone> = {
  paid: 'success',
  pending: 'warning',
  due: 'danger',
};

export default function StudentFeesScreen() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [checkoutData, setCheckoutData] = useState<{
    feeId: string;
    orderId: string;
    amount: number;
    keyId: string;
  } | null>(null);
  const { user } = useAuth();
  const colors = useThemeColors();

  const fetchFees = useCallback(async () => {
    const { data } = await axiosInstance.get('/fees/me');
    setFees(data.data);
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handlePayNow = async (feeId: string) => {
    try {
      const { data } = await axiosInstance.post(`/fees/${feeId}/create-order`);
      setCheckoutData({
        feeId,
        orderId: data.data.orderId,
        amount: data.data.amount,
        keyId: data.data.keyId,
      });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start payment');
    }
  };

  const handlePaymentSuccess = async (result: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    if (!checkoutData) return;
    try {
      await axiosInstance.post('/fees/verify-payment', {
        feeId: checkoutData.feeId,
        ...result,
      });
      Alert.alert('Success', 'Payment successful!');
      fetchFees();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Payment verification failed');
    } finally {
      setCheckoutData(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="My Fees" />

      <FlatList
        data={fees}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
            No fee records yet.
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.batchId?.name}</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xs }]}>₹{item.amount}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>

            <View style={{ marginTop: spacing.sm }}>
              <Badge
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                tone={STATUS_TONE[item.status] ?? 'neutral'}
              />
            </View>

            {item.status !== 'paid' && (
              <Button
                label="Pay Now"
                onPress={() => handlePayNow(item._id)}
                fullWidth
                style={{ marginTop: spacing.md }}
              />
            )}
          </Card>
        )}
      />

      {checkoutData && (
        <RazorpayCheckoutModal
          visible={!!checkoutData}
          orderId={checkoutData.orderId}
          amount={checkoutData.amount}
          keyId={checkoutData.keyId}
          studentName={user?.name || ''}
          studentEmail={user?.email || ''}
          onSuccess={handlePaymentSuccess}
          onDismiss={() => setCheckoutData(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.sm },
});