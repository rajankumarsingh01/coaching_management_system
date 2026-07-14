import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { useTheme } from '../../context/ThemeContext';

const TEMPLATES = [
  { id: 'achievement', label: '🏆 Top Scorers' },
  { id: 'milestone', label: '📈 Attendance Milestone' },
  { id: 'announcement', label: '📢 Announcement' },
];

const PosterGenerator = () => {
  const { branding } = useTheme();
  const [templateId, setTemplateId] = useState('achievement');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linesText, setLinesText] = useState('');
  const [footerNote, setFooterNote] = useState('');
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef(null);

  const lines = linesText.split('\n').filter((l) => l.trim().length > 0);
  const primaryColor = branding?.primaryColor || '#2563EB';

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `poster-${templateId}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Poster Generator</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Template</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    templateId === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Top 3 Scorers — Physics Test"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. July 2026"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Lines (one per line)
            </label>
            <textarea
              value={linesText}
              onChange={(e) => setLinesText(e.target.value)}
              rows={5}
              placeholder={'1. Rahul Kumar - 98%\n2. Priya Singh - 95%'}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Footer Note (optional)</label>
            <input
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              placeholder="e.g. Admissions open now!"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded px-6 py-2 font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {downloading ? 'Generating...' : '⬇ Download Poster'}
          </button>
        </div>

        {/* Poster canvas preview */}
        <div className="flex justify-center">
          <div
            ref={posterRef}
            style={{
              width: 360,
              height: 450,
              backgroundColor: primaryColor,
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: 'sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="logo"
                  crossOrigin="anonymous"
                  style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: branding?.secondaryColor || '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                >
                  {(branding?.displayName || 'C')[0]}
                </div>
              )}
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {branding?.displayName || 'Coaching Institute'}
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 6 }}>
                {title || 'Your Title Here'}
              </p>
              {subtitle && <p style={{ color: '#e5e7eb', fontSize: 13, marginBottom: 16 }}>{subtitle}</p>}

              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {lines.map((line, idx) => (
                  <p key={idx} style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {footerNote && <p style={{ color: '#fff', fontSize: 11, opacity: 0.9 }}>{footerNote}</p>}
              {branding?.tagline && (
                <p style={{ color: '#e5e7eb', fontSize: 10, fontStyle: 'italic' }}>{branding.tagline}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterGenerator;