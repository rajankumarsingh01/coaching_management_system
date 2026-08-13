import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Card } from '../../src/components/ui/Card';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

type Lecture = { _id: string; title: string; youtubeUrl: string; uploadedBy: { name: string } };

const getVideoId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : '';
};

const buildPlayerHtml = (videoId: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      src="https://www.youtube.com/embed/${videoId}?playsinline=1&modestbranding=1&rel=0&origin=https://coachingapp.local"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </body>
</html>
`;

export default function StudentLecturesScreen() {
  const { selectedBatch } = useBatch();
  const colors = useThemeColors();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      if (!selectedBatch) return;
      const { data } = await axiosInstance.get(`/lectures/batch/${selectedBatch._id}`);
      setLectures(data.data);
    };
    fetchLectures();
  }, [selectedBatch]);

 if (activeLecture) {
    const videoId = getVideoId(activeLecture.youtubeUrl);
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.md }]}>{activeLecture.title}</Text>
        <View style={styles.playerWrapper}>
          {videoId ? (
            <WebView
              source={{ html: buildPlayerHtml(videoId), baseUrl: 'https://coachingapp.local' }}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              setSupportMultipleWindows={false}
              onShouldStartLoadWithRequest={(request) => {
                const { url } = request;
                if (url.startsWith('https://coachingapp.local') || url === 'about:blank') {
                  return true;
                }
                const allowedHosts = ['www.youtube.com', 'youtube.com', 'youtube-nocookie.com'];
                try {
                  const { hostname } = new URL(url);
                  if (allowedHosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
                    return true;
                  }
                } catch {
                  // intent://, vnd.youtube:// jaise scheme yahan fail honge — block ho jayenge
                }
                return false;
              }}
            />
          ) : (
            <Text style={[typography.body, { color: colors.danger, textAlign: 'center', marginTop: spacing.xl }]}>
              Invalid YouTube link — could not extract video ID.
            </Text>
          )}
        </View>
        <Text
          style={[typography.bodyMedium, { color: colors.primary, marginTop: spacing.lg }]}
          onPress={() => setActiveLecture(null)}
        >
          ← Back to lectures
        </Text>
      </View>
    );
  } 

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Lectures" tagline={selectedBatch ? selectedBatch.name : undefined} />
      <FlatList
        data={lectures}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
            No lectures added yet.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveLecture(item)}>
            <Card style={styles.card}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>▶️ {item.title}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.sm },
  playerWrapper: { height: 220, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
});