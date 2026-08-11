// import { useEffect, useState, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
// import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
// import { Card } from '../../../src/components/ui/Card';
// import { Badge } from '../../../src/components/ui/Badge';
// import { useThemeColors } from '../../../src/theme/useThemeColors';
// import { spacing, typography } from '../../../src/theme/tokens';
// import { useBranding } from '../../../src/context/BrandingContext';
// import { useChild } from '../../../src/context/ChildContext';
// import axiosInstance from '../../../src/api/axiosInstance';

// type Fee = { _id: string; amount: number; status: string; dueDate: string; batchId: { name: string } };

// const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
//   paid: 'success',
//   pending: 'warning',
//   due: 'danger',
// };

// export default function ParentFeesScreen() {
//   const colors = useThemeColors();
//   const { branding } = useBranding();
//   const { selectedChild } = useChild();
//   const [fees, setFees] = useState<Fee[]>([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchFees = useCallback(async () => {
//     if (!selectedChild) return;
//     const { data } = await axiosInstance.get(`/fees/student/${selectedChild.id}`);
//     setFees(data.data);
//   }, [selectedChild]);

//   useEffect(() => {
//     fetchFees();
//   }, [fetchFees]);

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScreenHeader
//         title={selectedChild ? `${selectedChild.name}'s Fees` : 'Fees'}
//         tagline={branding.instituteName}
//         bannerUrl={branding.bannerImageUrl || undefined}
//       />
//       <FlatList
//         data={fees}
//         keyExtractor={(item) => item._id}
//         contentContainerStyle={styles.list}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={async () => {
//               setRefreshing(true);
//               await fetchFees();
//               setRefreshing(false);
//             }}
//           />
//         }
//         ListEmptyComponent={<Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>No fee records yet.</Text>}
//         renderItem={({ item }) => (
//           <Card style={styles.card}>
//             <View style={styles.row}>
//               <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.batchId?.name}</Text>
//               <Badge label={item.status} tone={STATUS_TONE[item.status] ?? 'neutral'} />
//             </View>
//             <Text style={[typography.stat, { color: colors.text, marginTop: spacing.sm }]}>₹{item.amount}</Text>
//             <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
//               Due: {new Date(item.dueDate).toLocaleDateString()}
//             </Text>
//           </Card>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   list: { padding: spacing.lg },
//   card: { marginBottom: spacing.md },
//   row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// });






import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import RazorpayCheckoutModal from '../../../src/components/RazorpayCheckoutModal';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../../src/theme/tokens';
import { useBranding } from '../../../src/context/BrandingContext';
import { useChild } from '../../../src/context/ChildContext';
import { useAuth } from '../../../src/context/AuthContext';
import axiosInstance from '../../../src/api/axiosInstance';

type Fee = { _id: string; amount: number; status: string; dueDate: string; batchId: { name: string } };

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  due: 'danger',
};

export default function ParentFeesScreen() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { selectedChild } = useChild();
  const { user } = useAuth();

  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    feeId: string;
    orderId: string;
    amount: number;
    keyId: string;
  } | null>(null);

  const fetchFees = useCallback(async () => {
    if (!selectedChild) return;
    setError('');
    try {
      const { data } = await axiosInstance.get(`/fees/student/${selectedChild.id}`);
      setFees(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    setLoading(true);
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

  const unpaid = fees.filter((f) => f.status !== 'paid');
  const pendingAmount = unpaid.reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidAmount = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={selectedChild ? `${selectedChild.name}'s Fees` : 'Fees'}
        tagline={branding.instituteName}
        bannerUrl={branding.bannerImageUrl || undefined}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={fees}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchFees();
                setRefreshing(false);
              }}
            />
          }
          ListHeaderComponent={
            fees.length > 0 ? (
              <Card
                elevated
                style={[
                  styles.heroCard,
                  { backgroundColor: pendingAmount > 0 ? colors.warningBg : colors.successBg },
                ]}
              >
                <Text style={[typography.label, { color: colors.textMuted }]}>PENDING AMOUNT</Text>
                <Text
                  style={[
                    typography.display,
                    { fontSize: 36, color: pendingAmount > 0 ? colors.warning : colors.success, marginTop: spacing.xs },
                  ]}
                >
                  {pendingAmount > 0 ? `₹${pendingAmount.toLocaleString('en-IN')}` : 'All paid up 🎉'}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                  ₹{paidAmount.toLocaleString('en-IN')} paid so far
                </Text>
              </Card>
            ) : null
          }
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
              No fee records yet.
            </Text>
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.batchId?.name}</Text>
                <Badge
                  label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  tone={STATUS_TONE[item.status] ?? 'neutral'}
                />
              </View>
              <Text style={[typography.stat, { color: colors.text, marginTop: spacing.sm }]}>₹{item.amount}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                Due: {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>

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
      )}

      {checkoutData && (
        <RazorpayCheckoutModal
          visible={!!checkoutData}
          orderId={checkoutData.orderId}
          amount={checkoutData.amount}
          keyId={checkoutData.keyId}
          studentName={selectedChild?.name || user?.name || ''}
          studentEmail={user?.email || ''}
          onSuccess={handlePaymentSuccess}
          onDismiss={() => setCheckoutData(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg },
  heroCard: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.lg, borderWidth: 0 },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});