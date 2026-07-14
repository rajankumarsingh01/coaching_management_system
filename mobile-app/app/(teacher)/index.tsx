// import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
// import { useState } from 'react';
// import { router } from 'expo-router';
// import { useBatch } from '../../src/context/BatchContext';
// import { useAuth } from '../../src/context/AuthContext';

// export default function TeacherHome() {
//   const { batches, selectedBatch, setSelectedBatch, loading } = useBatch();
//   const { logout } = useAuth();
//   const [pickerOpen, setPickerOpen] = useState(false);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <Text>Loading batches...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Teacher Dashboard</Text>
//         <TouchableOpacity onPress={logout}>
//           <Text style={styles.logout}>Logout</Text>
//         </TouchableOpacity>
//       </View>

//       {batches.length === 0 ? (
//         <Text style={styles.empty}>No batches assigned yet.</Text>
//       ) : (
//         <>
//           <TouchableOpacity style={styles.selector} onPress={() => setPickerOpen(!pickerOpen)}>
//             <Text style={styles.selectorText}>
//               {selectedBatch ? selectedBatch.name : 'Select a batch'} ▾
//             </Text>
//           </TouchableOpacity>

//           {pickerOpen && (
//             <FlatList
//               data={batches}
//               keyExtractor={(item) => item._id}
//               style={styles.dropdown}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.dropdownItem}
//                   onPress={() => {
//                     setSelectedBatch(item);
//                     setPickerOpen(false);
//                   }}
//                 >
//                   <Text>{item.name}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//           )}

//           {selectedBatch && (
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => router.push('/(teacher)/mark-attendance')}
//             >
//               <Text style={styles.actionButtonText}>Mark Attendance for {selectedBatch.name}</Text>
//             </TouchableOpacity>



//           )}


//           <TouchableOpacity
//             style={[styles.actionButton, { backgroundColor: '#7c3aed', marginTop: 10 }]}
//             onPress={() => router.push('/(teacher)/poster-generator')}
//           >
//             <Text style={styles.actionButtonText}>🎨 Poster Generator</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff' },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   title: { fontSize: 22, fontWeight: 'bold' },
//   logout: { color: '#dc2626', fontWeight: '600' },
//   empty: { color: '#9ca3af' },
//   selector: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 14,
//   },
//   selectorText: { fontSize: 16, fontWeight: '500' },
//   dropdown: {
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     borderRadius: 8,
//     marginTop: 4,
//     maxHeight: 200,
//   },
//   dropdownItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//   },
//   actionButton: {
//     backgroundColor: '#2563eb',
//     borderRadius: 8,
//     padding: 14,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   actionButtonText: { color: '#fff', fontWeight: '600' },
// });











import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useBatch } from '../../src/context/BatchContext';
import { useAuth } from '../../src/context/AuthContext';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';

export default function TeacherHome() {
  const { batches, selectedBatch, setSelectedBatch, loading } = useBatch();
  const { user, logout } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);

  usePushNotifications(!!user);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading batches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

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

          {selectedBatch && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(teacher)/mark-attendance')}
            >
              <Text style={styles.actionButtonText}>Mark Attendance for {selectedBatch.name}</Text>
            </TouchableOpacity>



          )}


          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#7c3aed', marginTop: 10 }]}
            onPress={() => router.push('/(teacher)/poster-generator')}
          >
            <Text style={styles.actionButtonText}>🎨 Poster Generator</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  logout: { color: '#dc2626', fontWeight: '600' },
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
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: { color: '#fff', fontWeight: '600' },
});