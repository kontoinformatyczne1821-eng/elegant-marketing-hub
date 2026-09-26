import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useInView } from "framer-motion";
import { X } from "lucide-react";

/* ------------------------------------------------------------------ *
 *  transitions.dev — React ports
 *  1) Number pop-in          (namespaced .t-digit-group / .t-digit)
 *  2) Input clear with dissolve (namespaced .t-clear*)
 *  Both read their motion tokens from :root, so live CSS tweaks
 *  apply on the next animation without a reload.
 * ------------------------------------------------------------------ */

const cs = () =>
  typeof window === "undefined" ? null : getComputedStyle(document.documentElement);

const num = (name: string, fb: number) => {
  const v = parseFloat(cs()?.getPropertyValue(name) ?? "");
  return Number.isFinite(v) ? v : fb;
};

/** Minimal cubic-bezier(x1,y1,x2,y2) sampler so JS easing matches CSS. */
function bezier(str: string) {
  const m = String(str).match(
    /cubic-bezier\(([-\d.]+),([-\d.]+),([-\d.]+),([-\d.]+)\)/,
  );
  if (!m) return (t: number) => t;
  const [x1, y1, x2, y2] = m.slice(1).map(parseFloat);
  const cx = 3 * x1,
    bx = 3 * (x2 - x1) - cx,
    ax = 1 - cx - bx;
  const cy = 3 * y1,
    by = 3 * (y2 - y1) - cy,
    ay = 1 - cy - by;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let s = t;
    for (let i = 0; i < 8; i++) {
      const dx = ((ax * s + bx) * s + cx) * s - t;
      const d = (3 * ax * s + 2 * bx) * s + cx;
      if (Math.abs(dx) < 1e-6 || d === 0) break;
      s -= dx / d;
    }
    return ((ay * s + by) * s + cy) * s;
  };
}

/* ------------------------- 1) Number pop-in ------------------------ */

export function usePopIn<T extends HTMLElement>(deps: unknown[] = [], enabled = true) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  useEffect(() => {
    if (!inView || !enabled) return;
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-animating");
    void el.offsetWidth; // force reflow so the replay always fires
    el.classList.add("is-animating");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, ...deps]);
  return ref;
}

/** Each character is its own digit; the last two ride in staggered. */
export function DigitChars({ text }: { text: string }) {
  const chars = Array.from(text.replace(/ /g, "\u00a0"));
  return (
    <>
      {chars.map((ch, i) => {
        const stagger =
          chars.length > 1 && i === chars.length - 2
            ? "1"
            : chars.length > 1 && i === chars.length - 1
              ? "2"
              : undefined;
        return (
          <span key={i} className="t-digit" data-stagger={stagger}>
            {ch}
          </span>
        );
      })}
    </>
  );
}

export function PopNumber({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = usePopIn<HTMLSpanElement>([text]);
  return (
    <span ref={ref} className={`t-digit-group ${className}`}>
      <DigitChars text={text} />
    </span>
  );
}

/* -------------------- 3) Text states swap -------------------------- */

/**
 * Three-phase swap: old text exits up with blur, the node is rewritten,
 * then the new text enters from below. Children are deliberately absent
 * so React never overwrites the imperative textContent.
 */
export function TextSwap({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef<string | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prev.current === null) {
      el.textContent = text;
      prev.current = text;
      return;
    }
    if (prev.current === text) return;
    prev.current = text;
    const dur =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--text-swap-dur",
        ),
      ) || 150;
    el.classList.add("is-exit");
    const t = setTimeout(() => {
      el.textContent = text;
      el.classList.remove("is-exit");
      el.classList.add("is-enter-start");
      void el.offsetHeight; // force reflow so the next change transitions
      el.classList.remove("is-enter-start");
    }, dur);
    return () => clearTimeout(t);
  }, [text]);

  return <span ref={ref} className={`t-text-swap ${className}`} />;
}

/* --------------------- 4) Tabs sliding ---------------------------- */

export function SlidingTabs({
  items,
  value,
  onChange,
  className = "",
  tabClassName = "",
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  tabClassName?: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  const move = useCallback(
    (animate: boolean) => {
      const bar = barRef.current;
      const pill = pillRef.current;
      if (!bar || !pill) return;
      const tab = bar.querySelector<HTMLElement>(`[data-tab="${value}"]`);
      if (!tab) return;
      if (!animate) {
        /* suspend the tween, snap into place, restore — first paint and
           resize must never animate from a stale measurement */
        const prev = pill.style.transition;
        pill.style.transition = "none";
        pill.style.transform = `translateX(${tab.offsetLeft}px)`;
        pill.style.width = `${tab.offsetWidth}px`;
        void pill.offsetWidth;
        pill.style.transition = prev;
      } else {
        pill.style.transform = `translateX(${tab.offsetLeft}px)`;
        pill.style.width = `${tab.offsetWidth}px`;
      }
    },
    [value],
  );

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      move(false);
    } else {
      move(true);
    }
  }, [move]);

  useEffect(() => {
    const onResize = () => move(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [move]);

  return (
    <div
      ref={barRef}
      role="tablist"
      className={`t-tabs ${className}`}
    >
      <span ref={pillRef} className="t-tabs-pill" aria-hidden="true" />
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          data-tab={it.id}
          aria-selected={it.id === value}
          onClick={() => onChange(it.id)}
          className={`t-tab outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${tabClassName}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------- 2) Input clear with dissolve ------------------ */
type ClearFieldProps = {
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  label?: string;
  className?: string;
};

export function ClearField({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  autoComplete,
  label,
  className = "",
}: ClearFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const pholdRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const clearingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [clearing, setClearing] = useState(false);

  const sync = () => {
    const input = inputRef.current;
    const wrap = wrapRef.current;
    const mirror = mirrorRef.current;
    if (!input || !wrap || !mirror) return;
    const v = input.value;
    wrap.classList.toggle("has-value", v.length > 0);
    if (v.length > 0) mirror.textContent = v.replace(/ /g, "\u00a0");
  };

  useEffect(() => {
    const id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /** One soft streak per word, written as a radial-gradient stack. */
  const buildGlow = (text: string) => {
    const input = inputRef.current;
    const wrap = wrapRef.current;
    if (!input || !wrap) return "";
    if (!canvasRef.current)
      canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const csIn = getComputedStyle(input);
    /* `font` can serialize empty — rebuild the shorthand from the longhands. */
    ctx.font =
      csIn.font ||
      `${csIn.fontStyle} ${csIn.fontWeight} ${csIn.fontSize} ${csIn.fontFamily}`;
    const rgb = "255,255,255"; // dark surface: lighten, never multiply away
    const w = wrap.clientWidth || 280;
    const padLeft = parseFloat(getComputedStyle(input).paddingLeft) || 20;
    const spread = num("--glow-spread", 1.5);
    const layers: string[] = [];
    let x = 0;
    text.split(/(\s+)/).forEach((seg) => {
      const segW = ctx.measureText(seg).width;
      if (seg.trim()) {
        const cx = padLeft + x + segW / 2;
        const hw = Math.max(segW * 0.45, 8) * spread;
        ([
          [0, 0.8, 7, 0.22],
          [hw * 0.45, 0.55, 8, 0.18],
          [-hw * 0.4, 0.65, 6, 0.16],
          [hw * 0.15, 0.9, 5, 0.14],
        ] as const).forEach(([dx, rwm, rh, a]) => {
          const lx = (((cx + dx) / w) * 100).toFixed(2);
          layers.push(
            `radial-gradient(ellipse ${Math.max(hw * rwm, 2).toFixed(1)}px ${rh}px at ${lx}% 100%, rgba(${rgb},${a}), transparent)`,
          );
        });
      }
      x += segW;
    });
    return layers.join(", ");
  };

  const clearWithAnimation = () => {
    const input = inputRef.current;
    const wrap = wrapRef.current;
    const mirror = mirrorRef.current;
    const phold = pholdRef.current;
    const glow = glowRef.current;
    if (!input || !wrap || !mirror || !phold || !glow) return;
    if (clearingRef.current || !input.value) return;
    clearingRef.current = true;
    setClearing(true);
    const keepFocus = document.activeElement === input;
    mirror.textContent = input.value.replace(/ /g, "\u00a0");

    const total = num("--clear-dur", 1000);
    const outDur = num("--clear-out-dur", 400);
    const inDur = num("--clear-in-dur", 400);
    const outFly = num("--clear-out-fly", 12);
    const inFly = num("--clear-in-fly", 12);
    const blur = num("--clear-blur", 2);
    const delay = num("--glow-delay", 50);
    const peakAt = num("--glow-peak-at", 0.15);
    const gOp = num("--glow-opacity", 0.85);
    const easeOut = bezier(cs()?.getPropertyValue("--clear-out-ease") ?? "");
    const easeIn = bezier(cs()?.getPropertyValue("--clear-in-ease") ?? "");

    input.value = "";
    onChange("");
    wrap.classList.remove("has-value");
    wrap.classList.add("is-clearing");
    glow.style.background = buildGlow(mirror.textContent || "");
    glow.style.opacity = "0";
    phold.style.transform = `translateY(-${inFly}px)`;
    phold.style.opacity = "0.9";
    phold.style.filter = `blur(${blur}px)`;

    const t0 = performance.now();
    const tick = (now: number) => {
      const el = now - t0;
      const eo = easeOut(Math.min(1, el / outDur));
      mirror.style.transform = `translateY(${(eo * outFly).toFixed(1)}px)`;
      mirror.style.opacity = (1 - eo).toFixed(3);
      mirror.style.filter = `blur(${(eo * blur).toFixed(1)}px)`;

      const ei = easeIn(Math.min(1, el / inDur));
      phold.style.transform = `translateY(${(-inFly + ei * inFly).toFixed(1)}px)`;
      phold.style.opacity = (0.9 + ei * 0.1).toFixed(3);
      phold.style.filter = `blur(${(blur - ei * blur).toFixed(1)}px)`;

      let g = 0;
      if (el > delay) {
        const gp = Math.min(1, (el - delay) / Math.max(1, total - delay));
        g = gp < peakAt ? gp / peakAt : 1 - (gp - peakAt) / (1 - peakAt);
      }
      glow.style.opacity = (g * gOp).toFixed(3);

      if (el < total) {
        requestAnimationFrame(tick);
      } else {
        wrap.classList.remove("is-clearing");
        [mirror, phold].forEach((node) => (node.style.cssText = ""));
        mirror.textContent = "";
        glow.style.opacity = "0";
        glow.style.background = "";
        clearingRef.current = false;
        setClearing(false);
        if (keepFocus)
          requestAnimationFrame(() => input.focus({ preventScroll: true }));
      }
    };
    requestAnimationFrame(tick);
  };

  const keepFocus = (e: React.SyntheticEvent) => {
    if (document.activeElement === inputRef.current) e.preventDefault();
  };

  const showBtn = value.length > 0 || clearing;

  return (
    <label className={`block space-y-2 ${className}`}>
      {label && (
        <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/45">
          {label}
        </span>
      )}
      <div
        ref={wrapRef}
        className="t-clear relative h-11 rounded-full border border-white/10 bg-white/[0.02] transition-colors duration-300 focus-within:border-white/30"
      >
        <input
          ref={inputRef}
          name={name}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            sync();
          }}
          className="relative z-[1] h-full w-full bg-transparent pl-5 pr-11 font-[Inter] font-light text-sm text-white placeholder:text-transparent focus:outline-none"
        />
        <div
          ref={mirrorRef}
          aria-hidden="true"
          className="t-clear-mirror pl-5 pr-11 font-[Inter] font-light text-sm text-white"
        />
        <div
          ref={pholdRef}
          aria-hidden="true"
          className="t-clear-placeholder pl-5 pr-11 font-[Inter] font-light text-sm text-white/20"
        >
          {placeholder}
        </div>
        <div ref={glowRef} aria-hidden="true" className="t-clear-glow" />
        <button
          type="button"
          aria-label={`Wyczyść: ${label || name}`}
          onMouseDown={keepFocus}
          onPointerDown={keepFocus}
          onClick={clearWithAnimation}
          className="t-clear-btn absolute right-2.5 top-1/2 z-[4] h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-white/15 text-white/40 transition-colors duration-300"
          style={{ display: showBtn ? "grid" : "none" }}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </label>
  );
}
