import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axiosInstance from '../../src/api/axiosInstance';
import RazorpayCheckoutModal from '../../src/components/RazorpayCheckoutModal';
import { useAuth } from '../../src/context/AuthContext';

type Fee = {
  _id: string;
  amount: number;
  status: string;
  dueDate: string;
  batchId: { name: string };
};

const STATUS_COLORS: Record<string, string> = {
  paid: '#16a34a',
  pending: '#ca8a04',
  due: '#dc2626',
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
    <View style={styles.container}>
      <Text style={styles.title}>My Fees</Text>

      <FlatList
        data={fees}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No fee records yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.batchName}>{item.batchId?.name}</Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
            <Text style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>

            {item.status !== 'paid' && (
              <TouchableOpacity style={styles.payButton} onPress={() => handlePayNow(item._id)}>
                <Text style={styles.payButtonText}>Pay Now</Text>
              </TouchableOpacity>
            )}
          </View>
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  batchName: { fontSize: 14, fontWeight: '600' },
  amount: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  dueDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  status: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize', marginTop: 4 },
  payButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});