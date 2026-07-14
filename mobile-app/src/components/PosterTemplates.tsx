import { View, Text, StyleSheet, Image } from 'react-native';
import { useBranding } from '../context/BrandingContext';

export type PosterData = {
  templateId: 'achievement' | 'announcement' | 'milestone';
  title: string;
  subtitle: string;
  lines: string[]; // e.g. ["1. Rahul Kumar - 98%", "2. Priya Singh - 95%"]
  footerNote: string;
};

// Fixed canvas size — good aspect ratio for WhatsApp Status / Instagram post
const POSTER_WIDTH = 360;
const POSTER_HEIGHT = 450;

export default function PosterCanvas({ data }: { data: PosterData }) {
  const { branding } = useBranding();
  const primaryColor = branding?.primaryColor || '#2563EB';
  const secondaryColor = branding?.secondaryColor || '#1E40AF';

  return (
    <View style={[styles.canvas, { backgroundColor: primaryColor }]}>
      <View style={styles.headerRow}>
        {branding?.logoUrl ? (
          <Image source={{ uri: branding.logoUrl }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: secondaryColor }]}>
            <Text style={styles.logoPlaceholderText}>
              {(branding?.displayName || branding?.instituteName || 'C')[0]}
            </Text>
          </View>
        )}
        <Text style={styles.instituteName} numberOfLines={1}>
          {branding?.displayName || branding?.instituteName || 'Coaching Institute'}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{data.title}</Text>
        {data.subtitle ? <Text style={styles.subtitle}>{data.subtitle}</Text> : null}

        <View style={styles.linesBox}>
          {data.lines.map((line, idx) => (
            <Text key={idx} style={styles.line}>
              {line}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {data.footerNote ? <Text style={styles.footerNote}>{data.footerNote}</Text> : null}
        {branding?.tagline ? <Text style={styles.tagline}>{branding.tagline}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 18 },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  instituteName: { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { color: '#e5e7eb', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  linesBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  line: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  footer: { alignItems: 'center' },
  footerNote: { color: '#fff', fontSize: 11, opacity: 0.9, marginBottom: 2 },
  tagline: { color: '#e5e7eb', fontSize: 10, fontStyle: 'italic' },
});