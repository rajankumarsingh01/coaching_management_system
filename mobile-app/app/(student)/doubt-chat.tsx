// import { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import axiosInstance from '../../src/api/axiosInstance';

// type Message = { id: string; role: 'student' | 'ai'; text: string; time: string };

// function formatTime(date: Date) {
//   return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
// }

// export default function DoubtChatScreen() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [sending, setSending] = useState(false);
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [remaining, setRemaining] = useState<number | null>(null);
//   const [error, setError] = useState('');
//   const listRef = useRef<FlatList>(null);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const { data } = await axiosInstance.get('/doubts/me');
//         const history: Message[] = [];
//         [...data.data].reverse().forEach((d: any) => {
//           const time = d.createdAt ? formatTime(new Date(d.createdAt)) : '';
//           history.push({ id: `${d._id}-q`, role: 'student', text: d.question, time });
//           history.push({ id: `${d._id}-a`, role: 'ai', text: d.answer, time });
//         });
//         setMessages(history);
//       } catch (err) {
//         console.error('Failed to load doubt history', err);
//       } finally {
//         setLoadingHistory(false);
//       }
//     };
//     fetchHistory();
//   }, []);

//   const handleSend = async () => {
//     const question = input.trim();
//     if (!question || sending) return;

//     setError('');
//     setInput('');
//     setMessages((prev) => [
//       ...prev,
//       { id: `local-${Date.now()}`, role: 'student', text: question, time: formatTime(new Date()) },
//     ]);
//     setSending(true);

//     try {
//       const { data } = await axiosInstance.post('/doubts', { question });
//       setMessages((prev) => [
//         ...prev,
//         { id: `${data.data._id}-a`, role: 'ai', text: data.data.answer, time: formatTime(new Date()) },
//       ]);
//       setRemaining(data.data.remainingToday);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Something went wrong. Please try again.');
//     } finally {
//       setSending(false);
//       setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.avatar}>
//           <Ionicons name="sparkles" size={18} color="#fff" />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>AI Tutor</Text>
//           <Text style={styles.headerSubtitle}>
//             {remaining !== null ? `${remaining} doubts left today` : 'Always here to help'}
//           </Text>
//         </View>
//       </View>

//       <KeyboardAvoidingView
//         style={styles.flex}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
//       >
//         {loadingHistory ? (
//           <View style={styles.centerFill}>
//             <ActivityIndicator color="#2563eb" />
//           </View>
//         ) : (
//           <FlatList
//             ref={listRef}
//             style={styles.flex}
//             data={messages}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={styles.listContent}
//             onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
//             ListEmptyComponent={
//               <View style={styles.emptyWrap}>
//                 <View style={styles.emptyIcon}>
//                   <Ionicons name="chatbubble-ellipses-outline" size={28} color="#2563eb" />
//                 </View>
//                 <Text style={styles.empty}>
//                   Padhai se juda koi bhi doubt yahan poocho{'\n'}AI Tutor turant help karega!
//                 </Text>
//               </View>
//             }
//             renderItem={({ item }) => (
//               <View
//                 style={[
//                   styles.bubbleRow,
//                   item.role === 'student' ? styles.bubbleRowRight : styles.bubbleRowLeft,
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.bubble,
//                     item.role === 'student' ? styles.studentBubble : styles.aiBubble,
//                   ]}
//                 >
//                   <Text style={item.role === 'student' ? styles.studentText : styles.aiText}>
//                     {item.text}
//                   </Text>
//                   {!!item.time && (
//                     <Text
//                       style={item.role === 'student' ? styles.studentTime : styles.aiTime}
//                     >
//                       {item.time}
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             )}
//           />
//         )}

//         {error ? <Text style={styles.error}>{error}</Text> : null}

//         {sending && (
//           <View style={styles.typingRow}>
//             <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
//               <ActivityIndicator size="small" color="#6b7280" />
//             </View>
//           </View>
//         )}

//         <View style={styles.inputBar}>
//           <TextInput
//             value={input}
//             onChangeText={setInput}
//             placeholder="Apna doubt likho..."
//             placeholderTextColor="#9ca3af"
//             style={styles.input}
//             multiline
//             editable={!sending}
//           />
//           <TouchableOpacity
//             style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
//             onPress={handleSend}
//             disabled={sending || !input.trim()}
//             activeOpacity={0.8}
//           >
//             <Ionicons name="send" size={18} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#f5f7fb' },
//   flex: { flex: 1 },
//   centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eef0f4',
//   },
//   avatar: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: '#2563eb',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
//   headerSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 1 },

//   listContent: { padding: 14, paddingBottom: 8, flexGrow: 1 },

//   emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
//   emptyIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#eef2ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   empty: { textAlign: 'center', color: '#9ca3af', fontSize: 13, lineHeight: 20 },

//   bubbleRow: { flexDirection: 'row', marginBottom: 10 },
//   bubbleRowRight: { justifyContent: 'flex-end' },
//   bubbleRowLeft: { justifyContent: 'flex-start' },

//   bubble: {
//     maxWidth: '82%',
//     borderRadius: 16,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowRadius: 3,
//     shadowOffset: { width: 0, height: 1 },
//     elevation: 1,
//   },
//   studentBubble: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
//   aiBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eef0f4' },
//   typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },

//   studentText: { color: '#fff', fontSize: 14.5, lineHeight: 20 },
//   aiText: { color: '#111827', fontSize: 14.5, lineHeight: 20 },
//   studentTime: { color: '#dbeafe', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
//   aiTime: { color: '#9ca3af', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },

//   typingRow: { paddingHorizontal: 14, marginBottom: 4 },

//   error: { color: '#dc2626', fontSize: 12, textAlign: 'center', marginBottom: 6 },

//   inputBar: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     gap: 8,
//     paddingHorizontal: 12,
//     paddingTop: 10,
//     paddingBottom: Platform.OS === 'ios' ? 10 : 12,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eef0f4',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#f2f4f7',
//     borderRadius: 22,
//     paddingHorizontal: 16,
//     paddingVertical: Platform.OS === 'ios' ? 10 : 8,
//     fontSize: 14.5,
//     color: '#111827',
//     maxHeight: 110,
//   },
//   sendBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: '#2563eb',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendBtnDisabled: { backgroundColor: '#93b4f5' },
// });













import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../src/api/axiosInstance';

type Message = { id: string; role: 'student' | 'ai'; text: string; time: string };

const MAX_CHARS = 500;

const SUGGESTIONS = [
  'Yeh topic ek simple example se samjhao',
  'Iska formula aur use kab hota hai?',
  'Isi topic pe ek practice question do',
  'Ismein common mistake kya hoti hai?',
];

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 320, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function DoubtChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axiosInstance.get('/doubts/me');
        const history: Message[] = [];
        [...data.data].reverse().forEach((d: any) => {
          const time = d.createdAt ? formatTime(new Date(d.createdAt)) : '';
          history.push({ id: `${d._id}-q`, role: 'student', text: d.question, time });
          history.push({ id: `${d._id}-a`, role: 'ai', text: d.answer, time });
        });
        setMessages(history);
      } catch (err) {
        console.error('Failed to load doubt history', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const limitReached = remaining !== null && remaining <= 0;
  const charsLeft = MAX_CHARS - input.length;
  const isOverLimit = charsLeft < 0;

  const handleSend = async (overrideText?: string) => {
    const question = (overrideText ?? input).trim();
    if (!question || sending || limitReached || isOverLimit) return;

    setError('');
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: 'student', text: question, time: formatTime(new Date()) },
    ]);
    setSending(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const { data } = await axiosInstance.post('/doubts', { question });
      setMessages((prev) => [
        ...prev,
        { id: `${data.data._id}-a`, role: 'ai', text: data.data.answer, time: formatTime(new Date()) },
      ]);
      setRemaining(data.data.remainingToday);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleSuggestionTap = (text: string) => {
    setInput(text);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          <Text
            style={[
              styles.headerSubtitle,
              remaining !== null && remaining <= 2 && styles.headerSubtitleWarning,
            ]}
          >
            {remaining !== null ? `${remaining} doubts left today` : 'Always here to help'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {loadingHistory ? (
          <View style={styles.centerFill}>
            <ActivityIndicator color="#2563eb" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.flex}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="chatbubble-ellipses-outline" size={28} color="#2563eb" />
                </View>
                <Text style={styles.empty}>
                  Padhai se juda koi bhi doubt yahan poocho{'\n'}AI Tutor turant help karega!
                </Text>
                <View style={styles.chipsWrap}>
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={styles.chip}
                      activeOpacity={0.7}
                      onPress={() => handleSuggestionTap(s)}
                    >
                      <Text style={styles.chipText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubbleRow,
                  item.role === 'student' ? styles.bubbleRowRight : styles.bubbleRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    item.role === 'student' ? styles.studentBubble : styles.aiBubble,
                  ]}
                >
                  <Text style={item.role === 'student' ? styles.studentText : styles.aiText}>
                    {item.text}
                  </Text>
                  {!!item.time && (
                    <Text
                      style={item.role === 'student' ? styles.studentTime : styles.aiTime}
                    >
                      {item.time}
                    </Text>
                  )}
                </View>
              </View>
            )}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {sending && (
          <View style={styles.typingRow}>
            <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
              <TypingDots />
            </View>
          </View>
        )}

        {limitReached && (
          <View style={styles.limitBanner}>
            <Ionicons name="time-outline" size={14} color="#92400e" />
            <Text style={styles.limitBannerText}>
              Aaj ke liye doubts khatam ho gaye. Kal phir try karo!
            </Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={limitReached ? 'Kal phir doubt poochna...' : 'Apna doubt likho...'}
              placeholderTextColor="#9ca3af"
              style={styles.input}
              multiline
              editable={!sending && !limitReached}
              maxLength={MAX_CHARS + 20}
            />
            {charsLeft <= 60 && !limitReached && (
              <Text style={[styles.counter, isOverLimit && styles.counterOver]}>
                {charsLeft}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || sending || limitReached || isOverLimit) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={sending || !input.trim() || limitReached || isOverLimit}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fb' },
  flex: { flex: 1 },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f4',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  headerSubtitleWarning: { color: '#d97706', fontWeight: '600' },

  listContent: { padding: 14, paddingBottom: 8, flexGrow: 1 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40, paddingHorizontal: 10 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 13, lineHeight: 20, marginBottom: 20 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '90%',
  },
  chipText: { color: '#2563eb', fontSize: 12.5, fontWeight: '500' },

  bubbleRow: { flexDirection: 'row', marginBottom: 10 },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubbleRowLeft: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  studentBubble: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eef0f4' },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },

  studentText: { color: '#fff', fontSize: 14.5, lineHeight: 20 },
  aiText: { color: '#111827', fontSize: 14.5, lineHeight: 20 },
  studentTime: { color: '#dbeafe', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  aiTime: { color: '#9ca3af', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },

  typingRow: { paddingHorizontal: 14, marginBottom: 4 },
  dotsRow: { flexDirection: 'row', gap: 4, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9ca3af' },

  error: { color: '#dc2626', fontSize: 12, textAlign: 'center', marginBottom: 6 },

  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
  },
  limitBannerText: { color: '#92400e', fontSize: 12, fontWeight: '500' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eef0f4',
  },
  inputWrap: { flex: 1, position: 'relative' },
  input: {
    backgroundColor: '#f2f4f7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14.5,
    color: '#111827',
    maxHeight: 110,
  },
  counter: {
    position: 'absolute',
    right: 12,
    bottom: -16,
    fontSize: 10,
    color: '#9ca3af',
  },
  counterOver: { color: '#dc2626', fontWeight: '600' },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#93b4f5' },
});


