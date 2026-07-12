// Generates a closed, smooth "wavy circle" SVG path — sine-modulated radius
// converted to a Catmull-Rom -> Bezier curve, giving the hand-drawn squiggle
// look (like Facebook/Threads' loading ring), not a plain circle.

type Point = { x: number; y: number };

export function generateWavyCirclePath(
  cx: number,
  cy: number,
  baseRadius: number,
  amplitude: number,
  frequency: number,
  segments = 64
): string {
  const pts: Point[] = [];
  for (let i = 0; i < segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
    const r = baseRadius + amplitude * Math.sin(frequency * theta);
    pts.push({
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta),
    });
  }
  return catmullRomToBezier(pts);
}

function catmullRomToBezier(pts: Point[]): string {
  const n = pts.length;
  if (n < 3) return '';
  const at = (i: number) => pts[((i % n) + n) % n];

  const d: string[] = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];

  for (let i = 0; i < n; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );
  }
  d.push('Z');
  return d.join(' ');
}