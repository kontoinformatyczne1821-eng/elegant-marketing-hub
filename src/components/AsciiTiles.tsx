import { useEffect, useRef } from "react";

/**
 * AsciiTiles — "Glassy tiles made of glowing ASCII characters".
 *
 * Local stand-in for the React Bits Pro component of the same name
 * (https://pro.reactbits.dev/docs/components/ascii-tiles). The paid registry
 * requires a REACTBITS_LICENSE_KEY, so this file reproduces the component's
 * documented surface: a sheared glass-tile lattice, per-tile bevel with
 * specular highlight, and a moving ASCII glyph pattern painted across it.
 * Prop names/defaults mirror the docs where they were verifiable.
 */

export interface AsciiTilesProps {
  /** Rendering surface width. */
  width?: string | number;
  /** Rendering surface height. */
  height?: string | number;
  className?: string;
  /** Optional children rendered above the tile surface. */
  children?: React.ReactNode;
  /** Animation speed multiplier (0–3). */
  speed?: number;
  /** ASCII glyph cell size in CSS pixels (4–24). */
  glyphSize?: number;
  /** Glass-tile grid density across the long edge (1–12). */
  tileDensity?: number;
  /** Diagonal shear factor for the tile lattice (-0.5–0.5). */
  tileShear?: number;
  /** Bevel width as a fraction of the tile edge (0–0.1). */
  bevelWidth?: number;
  /** Bevel highlight falloff softness (0–1). */
  bevelSoftness?: number;
  /** Distance of the chromatic refraction ghost, in glyph cells. */
  chromaticSpread?: number;
  /** Refraction wobble strength of the glyph pattern (0–100). */
  refraction?: number;
  /** Specular highlight sharpness (higher = tighter). */
  specularExponent?: number;
  /** Specular highlight strength (0–1). */
  specularStrength?: number;
  /** Horizontal pattern frequency across the surface. */
  patternFreqX?: number;
  /** Vertical pattern frequency across the surface. */
  patternFreqY?: number;
  /** Diagonal (x/y) pattern frequency across the surface. */
  patternFreqXY?: number;
  /** Lit glyph color. */
  glyphColor?: string;
  /** Recessed color behind the glyphs and between tiles. */
  recessColor?: string;
  /** Surface background color. */
  backgroundColor?: string;
  /** Overall surface opacity (0–1). */
  opacity?: number;
  /** Device pixel ratio cap used for the canvas backing store. */
  dpr?: number;
  /** Cursor-based pattern destruction near the mouse. */
  cursorInteraction?: boolean;
  /** Cursor influence radius, in CSS pixels. */
  cursorRadius?: number;
  /** Cursor destruction strength (0–2). */
  cursorIntensity?: number;
}

const RAMP = " .`·:-=+*≡#%@";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AsciiTiles({
  width = "100%",
  height = "100%",
  className = "",
  children,
  speed = 1,
  glyphSize = 8,
  tileDensity = 3.3,
  tileShear = -0.22,
  bevelWidth = 0.02,
  bevelSoftness = 0.1,
  chromaticSpread = 0.2,
  refraction = 100,
  specularExponent = 150,
  specularStrength = 1,
  patternFreqX = 6,
  patternFreqY = 4,
  patternFreqXY = 10,
  glyphColor = "#FFFFFF",
  recessColor = "#050D08",
  backgroundColor = "#000000",
  opacity = 1,
  dpr = 1.5,
  cursorInteraction = false,
  cursorRadius = 129,
  cursorIntensity = 1,
}: AsciiTilesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Mutable per-mount state that the render loop reads without re-subscribing.
  const stateRef = useRef({ pointerX: -1000, pointerY: -1000, visible: true });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    const reduce = prefersReducedMotion();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const ratio = Math.max(1, Math.min(dpr, window.devicePixelRatio || 1));
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const patternAt = (x: number, y: number, t: number) => {
      const u = (x / Math.max(w, 1)) * patternFreqX * Math.PI * 2;
      const v = (y / Math.max(h, 1)) * patternFreqY * Math.PI * 2;
      const d = (u + v) * (patternFreqXY / 10);
      const n =
        Math.sin(u + t) +
        Math.sin(v - t * 0.78) +
        Math.sin(d * 0.5 + t * 0.55) +
        Math.sin((u - v) * 0.35 - t * 0.4);
      return (n + 4) / 8; // → 0..1
    };

    const roundRect = (x: number, y: number, rw: number, rh: number, r: number) => {
      const rr = Math.max(0, Math.min(r, Math.min(rw, rh) / 2));
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, rr);
      ctx.arcTo(x + rw, y + rh, x, y + rh, rr);
      ctx.arcTo(x, y + rh, x, y, rr);
      ctx.arcTo(x, y, x + rw, y, rr);
      ctx.closePath();
    };

    const paint = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, w, h);

      const size = Math.max(44, Math.min(w, h) / Math.max(tileDensity, 0.5));
      const bevel = Math.max(1, size * bevelWidth);
      const specOrder = 600 / Math.max(specularExponent, 1);
      const soft = 1 + bevelSoftness * 2;
      const gap = Math.max(1, size * 0.012);
      const radius = Math.max(3, size * 0.05);
      const cell = Math.max(4, Math.min(glyphSize, size / 3));
      const pad = bevel + cell * 0.75;
      const ghost = chromaticSpread * cell * 1.5;
      const refractAmp = cell * 0.3 * (refraction / 100);
      const px = stateRef.current.pointerX;
      const py = stateRef.current.pointerY;

      const rows = Math.ceil(h / size) + 3;
      const cols = Math.ceil(w / size) + 3;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${cell}px ui-monospace, monospace`;

      for (let j = -1; j < rows; j++) {
        for (let i = -1; i < cols; i++) {
          const gx = i * size + j * size * tileShear - size;
          const gy = j * size - size;
          if (gx > w || gy > h || gx + size < 0 || gy + size < 0) continue;

          // tile body — recessed color closer to scampering pattern light
          ctx.fillStyle = recessColor;
          roundRect(gx + gap, gy + gap, size - gap * 2, size - gap * 2, radius);
          ctx.fill();

          // glass bevel: top-left specular highlight into a soft falloff
          const spec = specularStrength * Math.pow(Math.max(0, 1 - (bevel / Math.max(size, 1)) * soft * 6), specOrder);
          const g = ctx.createLinearGradient(gx, gy, gx + size * 0.6, gy + size * 0.6);
          g.addColorStop(0, `rgba(255,255,255,${Math.min(0.5, 0.12 * specularStrength + spec * 0.4)})`);
          g.addColorStop(Math.min(0.6, 0.18 + bevelSoftness * 0.4), "rgba(255,255,255,0.04)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          roundRect(gx + gap, gy + gap, size - gap * 2, size - gap * 2, radius);
          ctx.fill();

          // inner lip so the tile reads as a raised glass plate
          ctx.strokeStyle = "rgba(255,255,255,0.10)";
          ctx.lineWidth = 1;
          roundRect(gx + gap + 0.5, gy + gap + 0.5, size - gap * 2 - 1, size - gap * 2 - 1, radius);
          ctx.stroke();

          // ASCII glyphs painted across the whole surface
          for (let yy = gy + pad; yy < gy + size - pad * 0.5; yy += cell) {
            for (let xx = gx + pad; xx < gx + size - pad * 0.5; xx += cell) {
              if (xx < -cell || yy < -cell || xx > w + cell || yy > h + cell) continue;

              let i01 = patternAt(xx + ghost * Math.sin(t + yy * 0.02), yy + refractAmp * Math.sin(t * 1.3 + xx * 0.03), t);

              let destroyed = 0;
              if (cursorInteraction) {
                const dx = xx - px;
                const dy = yy - py;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < cursorRadius) {
                  destroyed = (1 - d / cursorRadius) * cursorIntensity;
                  if (destroyed > 0.08) {
                    // pattern destruction near the pointer: noisy scramble + dropout
                    i01 = Math.random() * i01 * 1.4;
                    if (Math.random() < destroyed * 0.35) continue;
                  }
                }
              }

              if (i01 <= 0.06) continue;
              const idx = Math.min(RAMP.length - 1, Math.floor(i01 * RAMP.length));
              const ch = RAMP[idx];
              if (ch === " ") continue;

              const alpha = Math.min(0.95, 0.24 + i01 * 0.8 + destroyed * 0.5);
              ctx.globalAlpha = alpha;
              ctx.shadowColor = glyphColor;
              ctx.shadowBlur = Math.min(8, cell * 0.6) * (0.4 + i01);
              if (ghost > 0.2) {
                ctx.globalAlpha = alpha * Math.min(0.6, chromaticSpread + 0.15);
                ctx.fillStyle = glyphColor;
                ctx.fillText(ch, xx + ghost, yy);
                ctx.fillText(ch, xx - ghost, yy);
              }
              ctx.globalAlpha = alpha;
              ctx.fillStyle = glyphColor;
              ctx.fillText(ch, xx, yy);
              ctx.shadowBlur = 0;
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!stateRef.current.visible) return;
      clock += dt * speed;
      paint(clock);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      stateRef.current.pointerX = e.clientX - rect.left;
      stateRef.current.pointerY = e.clientY - rect.top;
    };
    const resetPointer = () => {
      stateRef.current.pointerX = -1000;
      stateRef.current.pointerY = -1000;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) paint(0);
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      (entries) => {
        stateRef.current.visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(host);

    resize();
    paint(0);
    if (!reduce) raf = requestAnimationFrame(loop);
    if (cursorInteraction) {
      host.addEventListener("pointermove", onPointer);
      host.addEventListener("pointerleave", resetPointer);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", resetPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{ width, height, opacity, backgroundColor }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      {children}
    </div>
  );
}

export default AsciiTiles;