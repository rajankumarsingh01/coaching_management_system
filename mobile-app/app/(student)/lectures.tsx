import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import axiosInstance from '../../src/api/axiosInstance';
import { useBatch } from '../../src/context/BatchContext';

type Lecture = { _id: string; title: string; youtubeUrl: string; uploadedBy: { name: string } };

const getVideoId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : '';
};

// Wrapping the iframe in a real HTML page (instead of loading the embed URL
// directly as source.uri) fixes YouTube's "Error 153 / configuration error"
// inside React Native WebView — the embed needs a proper document/referrer
// context, which a bare source.uri navigation doesn't provide.
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
      <View style={styles.container}>
        <Text style={styles.playerTitle}>{activeLecture.title}</Text>
        <View style={styles.playerWrapper}>
          {videoId ? (
           <WebView
  source={{ html: buildPlayerHtml(videoId), baseUrl: 'https://coachingapp.local' }}
  allowsFullscreenVideo
  mediaPlaybackRequiresUserAction={false}
  javaScriptEnabled
  domStorageEnabled
  originWhitelist={['*']}
/>
          ) : (
            <Text style={styles.errorText}>Invalid YouTube link — could not extract video ID.</Text>
          )}
        </View>
        <Text style={styles.backLink} onPress={() => setActiveLecture(null)}>
          ← Back to lectures
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lectures {selectedBatch ? `— ${selectedBatch.name}` : ''}</Text>

      <FlatList
        data={lectures}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No lectures added yet.</Text>}
        renderItem={({ item }) => (
          <Text style={styles.card} onPress={() => setActiveLecture(item)}>
            ▶️ {item.title}
          </Text>
        )}
      />
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
    fontSize: 15,
    fontWeight: '600',
  },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  playerTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  playerWrapper: { height: 220, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' },
  errorText: { color: '#dc2626', textAlign: 'center', marginTop: 20 },
  backLink: { color: '#2563eb', marginTop: 16, fontWeight: '500' },
});