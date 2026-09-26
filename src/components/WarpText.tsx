/* Tekst rasteryzowany do tekstury i przepuszczany przez szklany shader:
   ambient fbm deformuje litery w spoczynku, a soczewka kursora (opcjonalna)
   ugina i powiększa fragment pod wskaźnikiem. Kursor jest wyłączany propem
   `pointer={false}` — wtedy zostaje tylko ambient, bez ruchu za myszką.
   Prop `outlineFromLine` rysuje linie od podanego numeru jako cienki
   kontur (stroke), co daje hierarchię: masa + obrys. */
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import "./WarpText.css";

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);

  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
  pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.016;

  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);

  vec4 base = sampleText(displaced);
  float r = sampleText(displaced + split).r;
  float g = base.g;
  float b = sampleText(displaced - split).b;
  float a = max(max(sampleText(displaced + split).a, base.a), sampleText(displaced - split).a);

  vec3 color = vec3(r, g, b) + lens * base.a * 0.055;
  fragColor = vec4(color, a);
}
`;

type FontValue = string | number;

export interface WarpTextProps {
  /** Tekst renderowany do tekstury; `\n` dzieli go na linie. */
  text?: string;
  /** Kolor wypełnienia liter przed przepuszczeniem przez szkło. */
  color?: string;
  /** Ilość ambient deformacji w spoczynku. */
  warpStrength?: number;
  /** Rozmiar ruchomych komórek deformacji. */
  warpScale?: number;
  /** Szybkość falowania w spoczynku. */
  speed?: number;
  /** Promień obszaru soczewki kursora. */
  pointerInfluence?: number;
  /** Siła ugięcia tekstu pod kursorem. */
  pointerStrength?: number;
  /** Rozdzielenie kanałów RGB na krawędzi szkła. */
  refraction?: number;
  /** Delikatna fala na soczewce kursora. */
  ripple?: boolean;
  /** Wyrównanie tekstu w kanwie — `left` trzyma siatkę sekcji. */
  align?: "center" | "left";
  /** Reakcja na kursor. `false` = tylko ambient (bez ruchu za myszką). */
  pointer?: boolean;
  fontSize?: FontValue;
  fontWeight?: FontValue;
  fontFamily?: string;
  letterSpacing?: FontValue;
  lineHeight?: FontValue;
  /** Od tego numeru linii (1-based) litery rysowane jako cienki kontur. */
  outlineFromLine?: number;
  /** Kolor konturu. */
  strokeColor?: string;
  /** Grubość konturu w px CSS. */
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

const getFontValue = (value: FontValue) => (typeof value === "number" ? `${value}px` : value);

const measureLine = (ctx: CanvasRenderingContext2D, line: string, letterSpacing: number) => {
  const chars = Array.from(line);
  const textWidth = chars.reduce((width, char) => width + ctx.measureText(char).width, 0);
  return textWidth + Math.max(0, chars.length - 1) * letterSpacing;
};

const drawLine = (
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  letterSpacing: number,
  align: "center" | "left",
  outline: boolean
) => {
  const chars = Array.from(line);
  let cursor = align === "left" ? x : x - measureLine(ctx, line, letterSpacing) / 2;

  chars.forEach((char, index) => {
    if (outline) ctx.strokeText(char, cursor, y);
    else ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + (index === chars.length - 1 ? 0 : letterSpacing);
  });
};

type RasterConfig = {
  text: string;
  color: string;
  fontSize: FontValue;
  fontWeight: FontValue;
  fontFamily: string;
  letterSpacing: FontValue;
  lineHeight: FontValue;
  align: "center" | "left";
  outlineFromLine: number;
  strokeColor: string;
  strokeWidth: number;
};

const buildTextCanvas = ({
  container,
  width,
  height,
  dpr,
  props,
}: {
  container: HTMLElement;
  width: number;
  height: number;
  dpr: number;
  props: RasterConfig;
}) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  /* niewidoczny probe: przeglądarka policzy faktyczny rozmiar, krój
     i tracking w jednostkach CSS, dopiero potem rysujemy do tekstury */
  const probe = document.createElement("span");
  probe.textContent = props.text;
  Object.assign(probe.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre",
    inset: "0 auto auto 0",
    fontFamily: props.fontFamily,
    fontSize: getFontValue(props.fontSize),
    fontWeight: String(props.fontWeight),
    letterSpacing: getFontValue(props.letterSpacing),
    lineHeight:
      typeof props.lineHeight === "number" ? String(props.lineHeight) : props.lineHeight,
  });
  container.appendChild(probe);
  const computed = window.getComputedStyle(probe);
  let fontSizePx = parseFloat(computed.fontSize) || 96;
  const fontFamily = computed.fontFamily || "sans-serif";
  const fontWeight = computed.fontWeight || String(props.fontWeight);
  let letterSpacing =
    computed.letterSpacing === "normal" ? 0 : parseFloat(computed.letterSpacing) || 0;
  let lineHeight = parseFloat(computed.lineHeight);
  if (!Number.isFinite(lineHeight)) {
    lineHeight = fontSizePx * (typeof props.lineHeight === "number" ? props.lineHeight : 0.92);
  }
  probe.remove();

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = props.color;
  /* kontur rysujemy w skali CSS, niezależnie od dopasowania rozmiaru */
  ctx.strokeStyle = props.strokeColor;
  ctx.lineWidth = props.strokeWidth;
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const lines = String(props.text || "").split("\n");
  const applyFont = () => {
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
  };
  applyFont();

  const maxWidth = width * 0.86;
  const maxHeight = height * 0.78;
  const widest = Math.max(...lines.map((line) => measureLine(ctx, line, letterSpacing)), 1);
  const blockHeight = Math.max(lineHeight * lines.length, 1);
  const fit = Math.min(1, maxWidth / widest, maxHeight / blockHeight);

  if (fit < 1) {
    fontSizePx *= fit;
    letterSpacing *= fit;
    lineHeight *= fit;
    applyFont();
  }

  const startY = height / 2 - (lineHeight * (lines.length - 1)) / 2;
  lines.forEach((line, index) => {
    const outline = props.outlineFromLine > 0 && index + 1 >= props.outlineFromLine;
    drawLine(ctx, line, width / 2, startY + index * lineHeight, letterSpacing, props.align, outline);
  });

  return canvas;
};

type UniformsConfig = {
  warpStrength: number;
  warpScale: number;
  speed: number;
  pointerInfluence: number;
  pointerStrength: number;
  refraction: number;
  ripple: boolean;
};

const syncUniforms = (program: Program, props: UniformsConfig) => {
  const uniforms = program.uniforms as Record<string, { value: unknown }>;
  uniforms.uWarpStrength.value = props.warpStrength;
  uniforms.uWarpScale.value = props.warpScale;
  uniforms.uSpeed.value = props.speed;
  uniforms.uPointerInfluence.value = props.pointerInfluence;
  uniforms.uPointerStrength.value = props.pointerStrength;
  uniforms.uRefraction.value = props.refraction;
  uniforms.uRipple.value = props.ripple ? 1 : 0;
};

const WarpText = ({
  text = "Bend the moment",
  color = "#f8f5ff",
  warpStrength = 0.08,
  warpScale = 1.7,
  speed = 0.55,
  pointerInfluence = 0.42,
  pointerStrength = 0.38,
  refraction = 0.018,
  ripple = true,
  align = "center",
  pointer = true,
  fontSize = "clamp(3rem, 10vw, 9rem)",
  fontWeight = 800,
  fontFamily = "inherit",
  letterSpacing = "-0.06em",
  lineHeight = 0.9,
  outlineFromLine = 0,
  strokeColor = "rgba(242,242,240,0.6)",
  strokeWidth = 1.4,
  className = "",
  style,
}: WarpTextProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    align,
    outlineFromLine,
    strokeColor,
    strokeWidth,
  });
  const contextRef = useRef<{ program: Program; rasterize: () => void } | null>(null);

  useEffect(() => {
    propsRef.current = {
      text,
      color,
      fontSize,
      fontWeight,
      fontFamily,
      letterSpacing,
      lineHeight,
      align,
      outlineFromLine,
      strokeColor,
      strokeWidth,
    };

    if (contextRef.current) {
      syncUniforms(contextRef.current.program, {
        warpStrength,
        warpScale,
        speed,
        pointerInfluence,
        pointerStrength,
        refraction,
        ripple,
      });
      contextRef.current.rasterize();
    }
  }, [
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    align,
    outlineFromLine,
    strokeColor,
    strokeWidth,
    warpStrength,
    warpScale,
    speed,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return undefined;

    let renderer: Renderer;
    let gl: Renderer["gl"];
    let raf = 0;
    let disposed = false;
    let contextLost = false;
    let visible = true;
    let pageVisible = !document.hidden;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let rasterVersion = 0;

    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
    const pointerEnabled = pointer && pointerStrength > 0 && pointerInfluence > 0;
    const startTime = performance.now();

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      gl = renderer.gl;
    } catch (error) {
      console.warn("WarpText: WebGL could not be initialized.", error);
      return undefined;
    }

    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const texture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTextTexture: { value: texture },
        uResolution: { value: new Float32Array([1, 1]) },
        uPointer: { value: new Float32Array([0.5, 0.5]) },
        uPointerActive: { value: 0 },
        uTime: { value: 0 },
        uWarpStrength: { value: warpStrength },
        uWarpScale: { value: warpScale },
        uSpeed: { value: speed },
        uPointerInfluence: { value: pointerInfluence },
        uPointerStrength: { value: pointerStrength },
        uRefraction: { value: refraction },
        uRipple: { value: ripple ? 1 : 0 },
        uMotion: { value: reduceMotion ? 0 : 1 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const renderOnce = () => {
      if (disposed || contextLost) return;
      renderer.render({ scene: mesh });
    };

    const rasterize = async () => {
      const version = ++rasterVersion;
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (error) {
          void error;
        }
      }
      if (disposed || contextLost || version !== rasterVersion) return;

      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const textCanvas = buildTextCanvas({
        container,
        width: rect.width,
        height: rect.height,
        dpr,
        props: propsRef.current,
      });
      texture.image = textCanvas;
      texture.needsUpdate = true;
      renderOnce();
    };

    const resize = () => {
      if (disposed || contextLost) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(rect.width, rect.height);
      (program.uniforms.uResolution.value as Float32Array)[0] = gl.drawingBufferWidth;
      (program.uniforms.uResolution.value as Float32Array)[1] = gl.drawingBufferHeight;
      rasterize();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      ptr.tx = (event.clientX - rect.left) / rect.width;
      ptr.ty = 1 - (event.clientY - rect.top) / rect.height;
      ptr.activeTarget = 1;
    };

    const onPointerLeave = () => {
      ptr.activeTarget = 0;
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible && visible && !raf) raf = requestAnimationFrame(loop);
      if (!pageVisible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onReducedMotion = (event: MediaQueryListEvent) => {
      (program.uniforms.uMotion.value as number) = event.matches ? 0 : 1;
      renderOnce();
    };

    const onFontsLoaded = () => {
      rasterize();
    };

    const loop = (now: number) => {
      if (disposed || contextLost) return;

      const elapsed = (now - startTime) * 0.001;
      /* bez kursora soczewka oddycha po wolnej krzywej — nie goni wskaźnika */
      const idleX = 0.5 + Math.sin(elapsed * 0.33) * 0.12;
      const idleY = 0.5 + Math.cos(elapsed * 0.27) * 0.1;
      const targetX = ptr.activeTarget > 0 ? ptr.tx : idleX;
      const targetY = ptr.activeTarget > 0 ? ptr.ty : idleY;
      const damping = ptr.activeTarget > 0 ? 0.12 : 0.035;

      ptr.x += (targetX - ptr.x) * damping;
      ptr.y += (targetY - ptr.y) * damping;
      ptr.active += ((ptr.activeTarget > 0 ? 1 : 0.18) - ptr.active) * 0.06;

      (program.uniforms.uPointer.value as Float32Array)[0] = ptr.x;
      (program.uniforms.uPointer.value as Float32Array)[1] = ptr.y;
      (program.uniforms.uPointerActive.value as number) = reduceMotion
        ? ptr.active * 0.35
        : ptr.active;
      (program.uniforms.uTime.value as number) = reduceMotion ? 0 : elapsed;

      renderOnce();
      raf = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && pageVisible && !raf) raf = requestAnimationFrame(loop);
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    if (pointerEnabled) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
    }
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    document.addEventListener("visibilitychange", onVisibility);
    mediaQuery?.addEventListener("change", onReducedMotion);
    document.fonts?.addEventListener("loadingdone", onFontsLoaded);

    syncUniforms(program, {
      warpStrength,
      warpScale,
      speed,
      pointerInfluence,
      pointerStrength,
      refraction,
      ripple,
    });
    contextRef.current = { program, rasterize: () => void rasterize() };
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      contextRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", onVisibility);
      mediaQuery?.removeEventListener("change", onReducedMotion);
      document.fonts?.removeEventListener("loadingdone", onFontsLoaded);

      if (!contextLost) {
        try {
          if (texture?.texture) gl.deleteTexture(texture.texture);
          geometry?.remove?.();
          program?.remove?.();
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        } catch (error) {
          void error;
        }
      }

      if (canvas.parentNode === container) container.removeChild(canvas);
    };
    /* kontekst WebGL budujemy raz; propsy lecą przez refs */
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <div
      ref={containerRef}
      className={`warp-text ${className}`.trim()}
      style={style}
      role="img"
      aria-label={text}
    />
  );
};

export default WarpText;
