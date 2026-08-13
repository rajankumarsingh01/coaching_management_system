import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../../src/api/axiosInstance';

type MessageStatus = 'error';

type PickedImage = { uri: string; name: string; type: string; remoteUrl?: string };

type Message = {
  id: string;
  role: 'student' | 'ai';
  text: string;
  time: string;
  createdAt: number;
  status?: MessageStatus;
  animate?: boolean;
  subject?: string;
  image?: PickedImage;
};

type ListItem =
  | ({ type: 'message' } & Message)
  | { type: 'separator'; id: string; label: string };

const MAX_CHARS = 500;

const SUGGESTIONS = [
  'Yeh topic ek simple example se samjhao',
  'Iska formula aur use kab hota hai?',
  'Isi topic pe ek practice question do',
  'Ismein common mistake kya hoti hai?',
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  physics: { bg: '#eff6ff', text: '#2563eb' },
  chemistry: { bg: '#f0fdf4', text: '#16a34a' },
  maths: { bg: '#fef2f2', text: '#dc2626' },
  mathematics: { bg: '#fef2f2', text: '#dc2626' },
  biology: { bg: '#f0fdfa', text: '#0d9488' },
  english: { bg: '#fdf4ff', text: '#a21caf' },
  history: { bg: '#fffbeb', text: '#b45309' },
  geography: { bg: '#eef2ff', text: '#4f46e5' },
};

function getSubjectStyle(subject: string) {
  const key = subject.trim().toLowerCase();
  return SUBJECT_COLORS[key] || { bg: '#f3f4f6', text: '#4b5563' };
}

// Backend falls back to this placeholder question text when a doubt is
// photo-only (no caption) — hide it from the bubble, image speaks for itself.
const PHOTO_ONLY_PLACEHOLDER = '📷 Photo doubt';

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts: number) {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

function buildListData(messages: Message[]): ListItem[] {
  const out: ListItem[] = [];
  let lastLabel = '';
  messages.forEach((m) => {
    const label = formatDateLabel(m.createdAt);
    if (label !== lastLabel) {
      out.push({ type: 'separator', id: `sep-${m.id}`, label });
      lastLabel = label;
    }
    out.push({ type: 'message', ...m });
  });
  return out;
}

// ---------- Phase B: lightweight markdown-ish formatter ----------

type InlineSegment = { bold: boolean; text: string };

type Block =
  | { type: 'empty' }
  | { type: 'heading'; level: number; segments: InlineSegment[] }
  | { type: 'bullet'; segments: InlineSegment[] }
  | { type: 'numbered'; number: string; segments: InlineSegment[] }
  | { type: 'paragraph'; segments: InlineSegment[] };

function parseInline(str: string): InlineSegment[] {
  const parts: InlineSegment[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str))) {
    if (match.index > lastIndex) {
      parts.push({ bold: false, text: str.slice(lastIndex, match.index) });
    }
    parts.push({ bold: true, text: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < str.length) {
    parts.push({ bold: false, text: str.slice(lastIndex) });
  }
  if (parts.length === 0) parts.push({ bold: false, text: str });
  return parts;
}

function parseBlocks(text: string): Block[] {
  return text.split('\n').map((line): Block => {
    const trimmed = line.trim();
    if (trimmed === '') return { type: 'empty' };

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      return { type: 'heading', level: headingMatch[1].length, segments: parseInline(headingMatch[2]) };
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      return { type: 'bullet', segments: parseInline(bulletMatch[1]) };
    }

    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
    if (numberedMatch) {
      return { type: 'numbered', number: numberedMatch[1], segments: parseInline(numberedMatch[2]) };
    }

    return { type: 'paragraph', segments: parseInline(trimmed) };
  });
}

function InlineSegments({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((s, i) => (
        <Text key={i} style={s.bold ? styles.boldText : undefined}>
          {s.text}
        </Text>
      ))}
    </>
  );
}

function FormattedText({ text }: { text: string }) {
  const blocks = useMemo(() => parseBlocks(text), [text]);

  return (
    <View>
      {blocks.map((b, i) => {
        if (b.type === 'empty') return <View key={i} style={styles.lineSpacer} />;

        if (b.type === 'heading') {
          return (
            <Text key={i} style={[styles.aiText, styles.headingText, b.level === 1 && styles.heading1]}>
              <InlineSegments segments={b.segments} />
            </Text>
          );
        }

        if (b.type === 'bullet') {
          return (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={[styles.aiText, styles.bulletText]}>
                <InlineSegments segments={b.segments} />
              </Text>
            </View>
          );
        }

        if (b.type === 'numbered') {
          return (
            <View key={i} style={styles.numberedRow}>
              <Text style={styles.numberBadgeText}>{b.number}.</Text>
              <Text style={[styles.aiText, styles.bulletText]}>
                <InlineSegments segments={b.segments} />
              </Text>
            </View>
          );
        }

        return (
          <Text key={i} style={styles.aiText}>
            <InlineSegments segments={b.segments} />
          </Text>
        );
      })}
    </View>
  );
}

// ---------- end Phase B formatter ----------

function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

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

// Word-by-word reveal for AI answers (simulated typing — backend sends full text at once)
function AnimatedAIText({
  text,
  animate,
  onTick,
}: {
  text: string;
  animate?: boolean;
  onTick?: () => void;
}) {
  const [display, setDisplay] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplay(text);
      return;
    }
    const words = text.split(' ');
    let i = 0;
    setDisplay('');
    const interval = setInterval(() => {
      i += 1;
      setDisplay(words.slice(0, i).join(' '));
      onTick?.();
      if (i >= words.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <FormattedText text={display} />;
}

function SkeletonLoader() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.skeletonWrap}>
      {[0, 1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.skeletonBubble,
            i % 2 === 0 ? styles.skeletonLeft : styles.skeletonRight,
            { opacity },
          ]}
        />
      ))}
    </View>
  );
}

export default function DoubtChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);
  const [input, setInput] = useState('');
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axiosInstance.get('/doubts/me');
        const history: Message[] = [];
        [...data.data].reverse().forEach((d: any) => {
          const createdAt = d.createdAt ? new Date(d.createdAt).getTime() : Date.now();
          const time = d.createdAt ? formatTime(new Date(d.createdAt)) : '';
          history.push({
            id: `${d._id}-q`,
            role: 'student',
            text: d.question === PHOTO_ONLY_PLACEHOLDER ? '' : d.question,
            time,
            createdAt,
            image: d.imageUrl ? { uri: d.imageUrl, name: '', type: '', remoteUrl: d.imageUrl } : undefined,
          });
          history.push({
            id: `${d._id}-a`,
            role: 'ai',
            text: d.answer,
            time,
            createdAt,
            subject: d.subject || undefined,
          });
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


  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setAndroidKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setAndroidKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const limitReached = remaining !== null && remaining <= 0;
  const charsLeft = MAX_CHARS - input.length;
  const isOverLimit = charsLeft < 0;

  const listData = useMemo(() => buildListData(messages), [messages]);

  const handleSend = async (overrideText?: string, retryId?: string, overrideImage?: PickedImage | null) => {
    const question = (overrideText ?? input).trim();
    const image = overrideImage !== undefined ? overrideImage : pickedImage;

    if ((!question && !image) || sending || limitReached || isOverLimit) return;

    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let studentId = retryId;

    if (retryId) {
      setMessages((prev) => prev.map((m) => (m.id === retryId ? { ...m, status: undefined } : m)));
    } else {
      studentId = `local-${Date.now()}`;
      setInput('');
      setPickedImage(null);
      setMessages((prev) => [
        ...prev,
        {
          id: studentId!,
          role: 'student',
          text: question,
          time: formatTime(new Date()),
          createdAt: Date.now(),
          image: image || undefined,
        },
      ]);
    }

    setSending(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      let data;
      if (image) {
        const formData = new FormData();
        formData.append('question', question);
        formData.append('image', { uri: image.uri, name: image.name, type: image.type } as any);
        const res = await axiosInstance.post('/doubts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = res.data;
      } else {
        const res = await axiosInstance.post('/doubts', { question });
        data = res.data;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (image && data.data.imageUrl) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === studentId && m.image ? { ...m, image: { ...m.image, remoteUrl: data.data.imageUrl } } : m
          )
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${data.data._id}-a`,
          role: 'ai',
          text: data.data.answer,
          time: formatTime(new Date()),
          createdAt: Date.now(),
          animate: true,
          subject: data.data.subject || undefined,
        },
      ]);
      setRemaining(data.data.remainingToday);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMessages((prev) => prev.map((m) => (m.id === studentId ? { ...m, status: 'error' } : m)));
      setError(err.response?.data?.message || 'Bhejne me dikkat hui. Neeche retry dabao.');
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleSuggestionTap = (text: string) => {
    setInput(text);
  };

  const handleCopy = async (id: string, text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedId(id);
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
  };

  const handleScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    setShowScrollButton(distanceFromBottom > 150);
  };

  const handlePickResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setPickedImage({
      uri: asset.uri,
      name: asset.fileName || 'doubt.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission chahiye', 'Photo khichne ke liye camera access allow karein.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: true });
    handlePickResult(result);
  };

  const launchGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission chahiye', 'Photo chunne ke liye gallery access allow karein.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
    });
    handlePickResult(result);
  };

  const handleAttachPress = () => {
    if (sending || limitReached) return;
    Alert.alert('Photo doubt bhejo', undefined, [
      { text: 'Camera se khincho', onPress: launchCamera },
      { text: 'Gallery se chuno', onPress: launchGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
        style={[styles.flex, Platform.OS === 'android' && { marginBottom: androidKeyboardHeight }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {loadingHistory ? (
          <SkeletonLoader />
        ) : (
          <View style={styles.flex}>
            <FlatList
              ref={listRef}
              style={styles.flex}
              data={listData}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              onScroll={handleScroll}
              scrollEventThrottle={16}
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
              renderItem={({ item }) => {
                if (item.type === 'separator') {
                  return (
                    <View style={styles.separatorRow}>
                      <View style={styles.separatorPill}>
                        <Text style={styles.separatorText}>{item.label}</Text>
                      </View>
                    </View>
                  );
                }

                const isStudent = item.role === 'student';
                return (
                  <View
                    style={[styles.bubbleRow, isStudent ? styles.bubbleRowRight : styles.bubbleRowLeft]}
                  >
                    <View style={[styles.bubble, isStudent ? styles.studentBubble : styles.aiBubble]}>
                      {!isStudent && item.subject ? (
                        <View
                          style={[
                            styles.subjectPill,
                            { backgroundColor: getSubjectStyle(item.subject).bg },
                          ]}
                        >
                          <Text
                            style={[styles.subjectPillText, { color: getSubjectStyle(item.subject).text }]}
                          >
                            {item.subject}
                          </Text>
                        </View>
                      ) : null}

                      {isStudent && item.image ? (
                        <Image
                          source={{ uri: item.image.remoteUrl || item.image.uri }}
                          style={styles.doubtImage}
                          resizeMode="cover"
                        />
                      ) : null}

                      {isStudent ? (
                        item.text ? <Text style={styles.studentText}>{item.text}</Text> : null
                      ) : (
                        <AnimatedAIText
                          text={item.text}
                          animate={item.animate}
                          onTick={() => listRef.current?.scrollToEnd({ animated: false })}
                        />
                      )}

                      {isStudent && item.status === 'error' && (
                        <View style={styles.retryRow}>
                          <Ionicons name="alert-circle-outline" size={12} color="#fee2e2" />
                          <Text style={styles.retryText}>Bhejne me dikkat hui</Text>
                          <TouchableOpacity
                            style={styles.retryBtn}
                            onPress={() => handleSend(item.text, item.id, item.image)}
                            disabled={sending}
                          >
                            <Ionicons name="refresh" size={12} color="#2563eb" />
                            <Text style={styles.retryBtnText}>Retry</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <View style={styles.bubbleFooter}>
                        <Text style={isStudent ? styles.studentTime : styles.aiTime}>{item.time}</Text>
                        {!isStudent && (
                          <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={() => handleCopy(item.id, item.text)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Ionicons
                              name={copiedId === item.id ? 'checkmark' : 'copy-outline'}
                              size={13}
                              color={copiedId === item.id ? '#16a34a' : '#9ca3af'}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              }}
            />

            {showScrollButton && (
              <TouchableOpacity
                style={styles.scrollBtn}
                onPress={() => listRef.current?.scrollToEnd({ animated: true })}
                activeOpacity={0.85}
              >
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
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

        {pickedImage && (
          <View style={styles.pickedImageRow}>
            <Image source={{ uri: pickedImage.uri }} style={styles.pickedImageThumb} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setPickedImage(null)}>
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handleAttachPress}
            disabled={sending || limitReached}
            activeOpacity={0.7}
          >
            <Ionicons
              name="camera-outline"
              size={22}
              color={sending || limitReached ? '#c7ccd6' : '#2563eb'}
            />
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                limitReached
                  ? 'Kal phir doubt poochna...'
                  : pickedImage
                  ? 'Photo ke saath kuch likhna hai? (optional)'
                  : 'Apna doubt likho...'
              }
              placeholderTextColor="#9ca3af"
              style={styles.input}
              multiline
              editable={!sending && !limitReached}
              maxLength={MAX_CHARS + 20}
            />
            {charsLeft <= 60 && !limitReached && (
              <Text style={[styles.counter, isOverLimit && styles.counterOver]}>{charsLeft}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              ((!input.trim() && !pickedImage) || sending || limitReached || isOverLimit) &&
                styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={(!input.trim() && !pickedImage) || sending || limitReached || isOverLimit}
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

  separatorRow: { alignItems: 'center', marginVertical: 10 },
  separatorPill: {
    backgroundColor: '#e5e9f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  separatorText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },

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

  doubtImage: {
    width: 190,
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#e5e9f0',
  },

  subjectPill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  subjectPillText: { fontSize: 10.5, fontWeight: '700' },

  studentText: { color: '#fff', fontSize: 14.5, lineHeight: 20 },
  aiText: { color: '#111827', fontSize: 14.5, lineHeight: 20 },

  boldText: { fontWeight: '700' },
  headingText: { fontWeight: '700', fontSize: 15, marginTop: 4, marginBottom: 2 },
  heading1: { fontSize: 16 },
  lineSpacer: { height: 6 },

  bulletRow: { flexDirection: 'row', marginBottom: 3, paddingRight: 2 },
  bulletDot: { color: '#2563eb', fontSize: 14, lineHeight: 20, marginRight: 6 },
  bulletText: { flex: 1 },

  numberedRow: { flexDirection: 'row', marginBottom: 3, paddingRight: 2 },
  numberBadgeText: { color: '#2563eb', fontWeight: '700', fontSize: 13.5, lineHeight: 20, marginRight: 6, minWidth: 16 },

  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  studentTime: { color: '#dbeafe', fontSize: 10, alignSelf: 'flex-end' },
  aiTime: { color: '#9ca3af', fontSize: 10 },
  copyBtn: { marginLeft: 10, padding: 2 },

  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  retryText: { color: '#fee2e2', fontSize: 10.5 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 4,
  },
  retryBtnText: { color: '#2563eb', fontSize: 10.5, fontWeight: '700' },

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

  scrollBtn: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  skeletonWrap: { flex: 1, padding: 14, paddingTop: 20 },
  skeletonBubble: {
    height: 42,
    borderRadius: 16,
    backgroundColor: '#e5e9f0',
    marginBottom: 14,
    width: '60%',
  },
  skeletonLeft: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  skeletonRight: { alignSelf: 'flex-end', borderBottomRightRadius: 4, width: '45%' },

  pickedImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  pickedImageThumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#e5e9f0' },
  removeImageBtn: {
    marginLeft: -12,
    marginTop: -34,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },

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
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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