// import { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { router } from 'expo-router';
// import axiosInstance from '../../src/api/axiosInstance';
// import { useAuth } from '../../src/context/AuthContext';
// import { useBranding } from '../../src/context/BrandingContext';
// import { usePushNotifications } from '../../src/hooks/usePushNotifications';

// export default function StudentHome() {
//   const [summary, setSummary] = useState<{ percentage: number; total: number; present: number } | null>(null);
//   const [pendingFees, setPendingFees] = useState(0);
//   const { user, logout } = useAuth();
//   const { branding } = useBranding();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [attendanceRes, feesRes] = await Promise.all([
//           axiosInstance.get('/attendance/me'),
//           axiosInstance.get('/fees/me'),
//         ]);
//         setSummary(attendanceRes.data.data);
//         const unpaid = feesRes.data.data.filter((f: any) => f.status !== 'paid');
//         setPendingFees(unpaid.length);
//       } catch (err) {
//         console.error('Failed to load dashboard data', err);
//       }
//     };
//     fetchData();
//   }, []);

//   const primaryColor = branding?.primaryColor || '#2563EB';

//   return (
//     <View style={styles.container}>
//       {branding?.bannerImageUrl ? (
//         <Image source={{ uri: branding.bannerImageUrl }} style={styles.banner} resizeMode="cover" />
//       ) : null}

//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>{branding?.displayName || 'Welcome'}, {user?.name}</Text>
//           {branding?.tagline ? <Text style={styles.tagline}>{branding.tagline}</Text> : null}
//         </View>
//         <TouchableOpacity onPress={logout}>
//           <Text style={styles.logout}>Logout</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/attendance')}>
//         <Text style={styles.cardLabel}>Attendance</Text>
//         <Text style={[styles.cardValue, { color: primaryColor }]}>{summary ? `${summary.percentage}%` : '—'}</Text>
//         {summary && (
//           <Text style={styles.cardSub}>
//             {summary.present} / {summary.total} days present
//           </Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/fees')}>
//         <Text style={styles.cardLabel}>Fees</Text>
//         <Text style={[styles.cardValue, pendingFees > 0 && styles.cardValueWarning]}>
//           {pendingFees > 0 ? `${pendingFees} pending` : 'All clear'}
//         </Text>
//       </TouchableOpacity>

//       <View style={styles.row}>
//         <TouchableOpacity
//           style={[styles.smallCard, { marginRight: 8 }]}
//           onPress={() => router.push('/(student)/notes')}
//         >
//           <Text style={styles.smallCardLabel}>📄 Notes</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/(student)/lectures')}>
//           <Text style={styles.smallCardLabel}>▶️ Lectures</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/tests')}>
//   <Text style={styles.cardLabel}>📝 Tests & Quizzes</Text>
// </TouchableOpacity>

// <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/homework')}>
//   <Text style={styles.cardLabel}>📚 Homework</Text>
// </TouchableOpacity>

//       </View>

//       <TouchableOpacity style={styles.aboutLink} onPress={() => router.push('/(student)/about')}>
//         <Text style={[styles.aboutLinkText, { color: primaryColor }]}>About {branding?.displayName || 'Institute'} →</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   banner: { width: '100%', height: 140 },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     paddingBottom: 8,
//   },
//   title: { fontSize: 18, fontWeight: 'bold' },
//   tagline: { fontSize: 12, color: '#6b7280', marginTop: 2 },
//   logout: { color: '#dc2626', fontWeight: '600' },
//   card: {
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     borderRadius: 12,
//     padding: 20,
//     marginHorizontal: 16,
//     marginBottom: 12,
//   },
//   cardLabel: { fontSize: 14, color: '#6b7280' },
//   cardValue: { fontSize: 32, fontWeight: 'bold', marginTop: 4 },
//   cardValueWarning: { color: '#dc2626', fontSize: 20 },
//   cardSub: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
//   row: { flexDirection: 'row', marginHorizontal: 16 },
//   smallCard: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//   },
//   smallCardLabel: { fontSize: 14, fontWeight: '600' },
//   aboutLink: { marginHorizontal: 16, marginTop: 16, marginBottom: 24 },
//   aboutLinkText: { fontSize: 13, fontWeight: '500' },
// });







import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/context/AuthContext';
import { useBranding } from '../../src/context/BrandingContext';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';
import { useTranslation } from 'react-i18next';


export default function StudentHome() {
  const [summary, setSummary] = useState<{ percentage: number; total: number; present: number } | null>(null);
  const [pendingFees, setPendingFees] = useState(0);
  const { user, logout } = useAuth();
  const { branding } = useBranding();


  const { t } = useTranslation();

  usePushNotifications(!!user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, feesRes] = await Promise.all([
          axiosInstance.get('/attendance/me'),
          axiosInstance.get('/fees/me'),
        ]);
        setSummary(attendanceRes.data.data);
        const unpaid = feesRes.data.data.filter((f: any) => f.status !== 'paid');
        setPendingFees(unpaid.length);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    fetchData();
  }, []);

  const primaryColor = branding?.primaryColor || '#2563EB';

  return (
    <View style={styles.container}>
      {branding?.bannerImageUrl ? (
        <Image source={{ uri: branding.bannerImageUrl }} style={styles.banner} resizeMode="cover" />
      ) : null}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{branding?.displayName || 'Welcome'}, {user?.name}</Text>
          {branding?.tagline ? <Text style={styles.tagline}>{branding.tagline}</Text> : null}
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/attendance')}>
        <Text style={styles.cardLabel}>Attendance</Text>
        <Text style={[styles.cardValue, { color: primaryColor }]}>{summary ? `${summary.percentage}%` : '—'}</Text>
        {summary && (
          <Text style={styles.cardSub}>
            {summary.present} / {summary.total} days present
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/fees')}>
        <Text style={styles.cardLabel}>Fees</Text>
        <Text style={[styles.cardValue, pendingFees > 0 && styles.cardValueWarning]}>
          {pendingFees > 0 ? `${pendingFees} pending` : 'All clear'}
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.smallCard, { marginRight: 8 }]}
          onPress={() => router.push('/(student)/notes')}
        >
          <Text style={styles.smallCardLabel}>📄 Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/(student)/lectures')}>
          <Text style={styles.smallCardLabel}>▶️ Lectures</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/achievements')}>
  <Text style={styles.cardLabel}>🏅 Achievements</Text>
</TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/tests')}>
        <Text style={styles.cardLabel}>📝 Tests & Quizzes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/homework')}>
        <Text style={styles.cardLabel}>📚 Homework</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(student)/calendar')}>
        <Text style={styles.cardLabel}>📅 Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.aboutLink} onPress={() => router.push('/(student)/about')}>
        <Text style={[styles.aboutLinkText, { color: primaryColor }]}>About {branding?.displayName || 'Institute'} →</Text>
      </TouchableOpacity>


      <TouchableOpacity style={styles.aboutLink} onPress={() => router.push('/(student)/settings')}>
  <Text style={[styles.aboutLinkText, { color: primaryColor }]}>⚙️ Settings / भाषा बदलें</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { width: '100%', height: 140 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  tagline: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  logout: { color: '#dc2626', fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 14, color: '#6b7280' },
  cardValue: { fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  cardValueWarning: { color: '#dc2626', fontSize: 20 },
  cardSub: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  row: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12 },
  smallCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  smallCardLabel: { fontSize: 14, fontWeight: '600' },
  aboutLink: { marginHorizontal: 16, marginTop: 16, marginBottom: 24 },
  aboutLinkText: { fontSize: 13, fontWeight: '500' },
});

