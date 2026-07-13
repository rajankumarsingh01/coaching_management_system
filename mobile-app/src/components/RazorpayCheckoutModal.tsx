import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

type RazorpayCheckoutModalProps = {
  visible: boolean;
  orderId: string;
  amount: number; // in paise, as returned by backend
  keyId: string;
  studentName: string;
  studentEmail: string;
  onSuccess: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss: () => void;
};

// Minimal HTML page that loads Razorpay's Standard Checkout script and opens it
// immediately — works inside a plain WebView, no native SDK / dev build needed,
// so this runs fine in Expo Go as-is.
const buildCheckoutHtml = (params: {
  keyId: string;
  amount: number;
  orderId: string;
  name: string;
  email: string;
}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script>
      var options = {
        key: "${params.keyId}",
        amount: "${params.amount}",
        currency: "INR",
        name: "Coaching Institute",
        description: "Fee Payment",
        order_id: "${params.orderId}",
        prefill: {
          name: "${params.name}",
          email: "${params.email}"
        },
        theme: { color: "#2563eb" },
        handler: function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: "success",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }));
        },
        modal: {
          ondismiss: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ status: "dismissed" }));
          }
        }
      };
      var rzp = new Razorpay(options);
      rzp.open();
    </script>
  </body>
</html>
`;

export default function RazorpayCheckoutModal({
  visible,
  orderId,
  amount,
  keyId,
  studentName,
  studentEmail,
  onSuccess,
  onDismiss,
}: RazorpayCheckoutModalProps) {
  const html = buildCheckoutHtml({ keyId, amount: String(amount) as any, orderId, name: studentName, email: studentEmail });

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === 'success') {
        onSuccess(data);
      } else {
        onDismiss();
      }
    } catch (err) {
      onDismiss();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.container}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});