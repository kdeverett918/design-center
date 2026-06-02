import { useEffect, useRef } from 'react';

/**
 * Design Center brand mark — a rotating point-cloud sphere.
 *
 * Points are distributed evenly over a sphere (Fibonacci spiral), spun around
 * the Y axis with a fixed tilt, then perspective-projected so near points grow
 * brighter and larger while far ones recede — a real sense of depth in ~40px.
 * Dots are tinted along a violet→blue→teal latitude gradient, so the mark reads
 * as "live and colorful" on both the light and dark showroom shells.
 *
 * It's a small canvas with a single rAF loop that honors
 * `prefers-reduced-motion` by rendering one static frame instead of animating.
 */

const DOTS = 80;

// Latitude gradient stops (top → equator → bottom).
const TOP = [0x9b, 0x6b, 0xff];
const MID = [0x5b, 0x9d, 0xff];
const BOT = [0x2f, 0xd0, 0xc0];

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function latitudeColor(y: number) {
  // y in [-1, 1] → t in [0, 1] from top to bottom.
  const t = (1 - y) / 2;
  const [a, b, k] =
    t < 0.5
      ? [TOP, MID, t / 0.5]
      : [MID, BOT, (t - 0.5) / 0.5];
  return `rgb(${lerp(a[0], b[0], k)},${lerp(a[1], b[1], k)},${lerp(a[2], b[2], k)})`;
}

type Point = { x: number; y: number; z: number; color: string };

function buildSphere(): Point[] {
  const pts: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < DOTS; i++) {
    const y = 1 - (i / (DOTS - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
      color: latitudeColor(y),
    });
  }
  return pts;
}

export default function Logo({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const points = buildSphere();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fixed tilt so the poles never sit dead-on.
    const TILT = 0.5;
    const cosTilt = Math.cos(TILT);
    const sinTilt = Math.sin(TILT);

    let raf = 0;
    let angle = 0;
    let dpr = 1;
    let size = 40;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth || 40;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const R = size * 0.34;
      const persp = 2.4;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);

      const projected = points.map((p) => {
        // Spin around Y…
        const x = p.x * ca + p.z * sa;
        const zr = -p.x * sa + p.z * ca;
        // …then tilt around X.
        const y = p.y * cosTilt - zr * sinTilt;
        const z = p.y * sinTilt + zr * cosTilt;
        const s = persp / (persp - z);
        return { sx: cx + x * R * s, sy: cy + y * R * s, depth: z, scale: s, color: p.color };
      });
      // Painter's algorithm: far points first.
      projected.sort((a, b) => a.depth - b.depth);

      for (const d of projected) {
        const t = (d.depth + 1) / 2; // 0 = back, 1 = front
        const alpha = 0.22 + t * 0.78;
        const radius = (0.65 + t * 1.4) * d.scale;
        ctx.fillStyle = d.color;
        // Soft bloom.
        ctx.globalAlpha = alpha * 0.22;
        ctx.beginPath();
        ctx.arc(d.sx, d.sy, radius * 2.6, 0, Math.PI * 2);
        ctx.fill();
        // Crisp core.
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(d.sx, d.sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();

    if (reduce) {
      angle = 0.7;
      draw();
      return;
    }

    const loop = () => {
      angle += 0.006;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Design Center"
      style={{ display: 'block' }}
      className={className}
    />
  );
}
