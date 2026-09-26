import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import "./FlipCard.css";

const SLOP = { fine: 4, coarse: 8 };
const TILT_SPRING = { stiffness: 240, damping: 24, mass: 0.6 };
const LIFT_SPRING = { stiffness: 320, damping: 26 };
const FLING = 0.16;
const HISTORY_MS = 90;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const snap = (deg: number) => Math.round(deg / 180) * 180;
const isBack = (deg: number) => Math.abs(Math.round(deg / 180)) % 2 === 1;

type Axis = "x" | "y";

type Grip = {
  id: number;
  x: number;
  y: number;
  base: number;
  moved: boolean;
  slop: number;
  hist: { t: number; v: number }[];
};

type Spin = { stop: () => void };

export interface FlipCardProps {
  /** Content of the front face. */
  front?: ReactNode;
  /** Content of the back face. */
  back?: ReactNode;
  /** Controlled state: true shows the back. Omit it to let the card manage itself. */
  flipped?: boolean;
  /** Start on the back face. */
  defaultFlipped?: boolean;
  /** Fires when a click, drag, flick or key lands on the other face. */
  onFlipChange?: (flipped: boolean) => void;
  /** `y` turns the card sideways and drags horizontally. `x` turns it over the top. */
  axis?: Axis;
  /** A press without movement flips the card. */
  flipOnClick?: boolean;
  /** Drag to turn the card by hand. */
  draggable?: boolean;
  /** Pixels of drag for a half turn. 0 uses the card width (or height on the x axis). */
  dragDistance?: number;
  /** The card leans toward the cursor on hover. */
  tilt?: boolean;
  /** Largest tilt angle in degrees. */
  tiltMax?: number;
  /** A soft sheen that follows the cursor. */
  glare?: boolean;
  /** Strength of the sheen at its centre. */
  glareOpacity?: number;
  /** Lift while hovered or held. */
  hoverScale?: number;
  /** Viewing distance in px. */
  perspective?: number;
  /** Stiffness of the flip spring. */
  stiffness?: number;
  /** Damping of the flip spring. */
  damping?: number;
  /** Card width in px, capped at the parent. */
  width?: number;
  /** Card height in px. */
  height?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Surface of both faces. */
  background?: string;
  /** Text colour of both faces. */
  color?: string;
  /** A soft shadow beneath the card. */
  shadow?: boolean;
  shadowColor?: string;
  shadowOpacity?: number;
  /** Stretch to the parent instead of using width/height. */
  fill?: boolean;
  /** Lets the text inside be selected and edited (disables the grab cursor). */
  editable?: boolean;
  /** Dimmed, flat and inert. */
  disabled?: boolean;
  /** Accessible name. The face is carried by aria-pressed. */
  ariaLabel?: string;
  className?: string;
}

const FlipCard = ({
  front = null,
  back = null,
  flipped,
  defaultFlipped = false,
  onFlipChange,
  axis = "y",
  flipOnClick = true,
  draggable = true,
  dragDistance = 0,
  tilt = true,
  tiltMax = 12,
  glare = true,
  glareOpacity = 0.22,
  hoverScale = 1.03,
  perspective = 1100,
  stiffness = 170,
  damping = 20,
  width = 300,
  height = 400,
  radius = 22,
  background = "#27272a",
  color = "#f5f5f5",
  shadow = true,
  shadowColor = "#000000",
  shadowOpacity = 0.45,
  fill = false,
  editable = false,
  disabled = false,
  ariaLabel = "Flip card",
  className = "",
}: FlipCardProps) => {
  const reduce = useReducedMotion();
  const controlled = flipped !== undefined;
  const [inner, setInner] = useState(defaultFlipped);
  const [dragging, setDragging] = useState(false);
  const shown = controlled ? flipped : inner;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const grip = useRef<Grip | null>(null);
  const spin = useRef<Spin | null>(null);
  const target = useRef(shown ? 180 : 0);

  const turn = useMotionValue(shown ? 180 : 0);
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const lift = useSpring(1, LIFT_SPRING);
  const sheen = useSpring(0, LIFT_SPRING);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const sumX = useTransform([turn, tiltX], ([t, x]: number[]) => t + x);
  const sumY = useTransform([turn, tiltY], ([t, y]: number[]) => t + y);
  const turnY = useMotionTemplate`perspective(${perspective}px) scale(${lift}) rotateX(${tiltX}deg) rotateY(${sumY}deg)`;
  const turnX = useMotionTemplate`perspective(${perspective}px) scale(${lift}) rotateY(${tiltY}deg) rotateX(${sumX}deg)`;
  const facing = useTransform(turn, (t) => Math.abs(Math.cos((t * Math.PI) / 180)));
  const spread = useTransform(facing, (f) => 0.08 + 0.92 * f);
  const shade = useTransform(facing, (f) => 0.1 + 0.9 * f * f);
  const gxPct = useMotionTemplate`${gx}%`;
  const gyPct = useMotionTemplate`${gy}%`;

  const settle = (to: number, velocity: number, instant: boolean) => {
    spin.current?.stop();
    target.current = to;
    if (instant || reduce) turn.jump(to);
    else
      spin.current = animate(turn, to, {
        type: "spring",
        stiffness,
        damping,
        velocity,
        restDelta: 0.05,
      }) as unknown as Spin;
    const next = isBack(to);
    if (next === shownRef.current) return;
    shownRef.current = next;
    if (!controlled) setInner(next);
    onFlipChange?.(next);
  };

  const flip = (instant: boolean) => {
    const base = snap(turn.get());
    settle(isBack(base) ? base - 180 : base + 180, 0, instant);
  };

  const rest = () => {
    tiltX.set(0);
    tiltY.set(0);
    sheen.set(0);
    lift.set(1);
  };

  useEffect(() => {
    if (!controlled || flipped === undefined || isBack(target.current) === flipped) return;
    const base = target.current;
    spin.current?.stop();
    target.current = isBack(base) ? base - 180 : base + 180;
    if (reduce) turn.jump(target.current);
    else
      spin.current = animate(turn, target.current, {
        type: "spring",
        stiffness,
        damping,
        restDelta: 0.05,
      }) as unknown as Spin;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  useEffect(() => () => spin.current?.stop(), []);

  useEffect(() => {
    if (disabled) rest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0 || grip.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture by itself is not critical */
    }
    spin.current?.stop();
    grip.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      base: turn.get(),
      moved: false,
      slop: e.pointerType === "touch" ? SLOP.coarse : SLOP.fine,
      hist: [],
    };
    if (!reduce) lift.set(hoverScale);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = grip.current;
    if (g && g.id === e.pointerId) {
      const d = axis === "x" ? e.clientY - g.y : e.clientX - g.x;
      if (!g.moved) {
        if (Math.abs(d) < g.slop || !draggable || reduce) return;
        g.moved = true;
        setDragging(true);
        tiltX.set(0);
        tiltY.set(0);
        sheen.set(0);
      }
      const span = dragDistance > 0 ? dragDistance : axis === "x" ? height : width;
      const deg = g.base + (axis === "x" ? -1 : 1) * (d / span) * 180;
      turn.set(deg);
      const now = performance.now();
      g.hist.push({ t: now, v: deg });
      while (g.hist.length > 2 && now - g.hist[0].t > HISTORY_MS) g.hist.shift();
      return;
    }
    if (!tilt || reduce || disabled || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = clamp((e.clientX - r.left) / r.width, 0, 1);
    const py = clamp((e.clientY - r.top) / r.height, 0, 1);
    tiltX.set((0.5 - py) * 2 * tiltMax);
    tiltY.set((px - 0.5) * 2 * tiltMax);
    gx.set(px * 100);
    gy.set(py * 100);
    sheen.set(1);
  };

  const release = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const g = grip.current;
    if (!g || g.id !== e.pointerId) return;
    grip.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* release by itself is not critical */
    }
    setDragging(false);
    if (e.pointerType === "touch" || !rootRef.current?.matches(":hover")) rest();
    if (!g.moved) {
      if (!cancelled && flipOnClick) flip(false);
      else settle(target.current, 0, false);
      return;
    }
    const here = turn.get();
    let velocity = 0;
    const a = g.hist[0];
    const b = g.hist[g.hist.length - 1];
    if (!cancelled && a && b && b.t > a.t && performance.now() - b.t < 60)
      velocity = ((b.v - a.v) / (b.t - a.t)) * 1000;
    const to = cancelled
      ? snap(g.base)
      : clamp(snap(here + velocity * FLING), snap(here) - 180, snap(here) + 180);
    settle(to, velocity, false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    if (!e.repeat) flip(true);
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && e.detail === 0) flip(true);
  };

  const rotorStyle = {
    transform: axis === "x" ? turnX : turnY,
    "--fc-gx": gxPct,
    "--fc-gy": gyPct,
    "--fc-sheen": sheen,
  } as unknown as CSSProperties;

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={shown}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={`flip-card${className ? ` ${className}` : ""}`}
      data-axis={axis}
      data-fill={fill ? "" : undefined}
      data-editable={editable ? "" : undefined}
      data-draggable={draggable && !disabled && !reduce ? "" : undefined}
      data-dragging={dragging ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-fade={reduce ? (shown ? "back" : "front") : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => release(e, false)}
      onPointerCancel={(e) => release(e, true)}
      onLostPointerCapture={(e) => release(e, true)}
      onPointerEnter={(e) => {
        if (!reduce && !disabled && e.pointerType !== "touch") lift.set(hoverScale);
      }}
      onPointerLeave={() => {
        if (!grip.current) rest();
      }}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onDragStart={(e) => e.preventDefault()}
      style={
        {
          "--fc-w": `${width}px`,
          "--fc-h": `${height}px`,
          "--fc-radius": `${radius}px`,
          "--fc-bg": background,
          "--fc-ink": color,
          "--fc-shadow": shadowColor,
          "--fc-shadow-o": shadowOpacity,
          "--fc-glare": glareOpacity,
        } as CSSProperties
      }
    >
      {shadow ? (
        <motion.span
          className="flip-card__shadow"
          aria-hidden="true"
          style={axis === "x" ? { scaleY: spread, opacity: shade } : { scaleX: spread, opacity: shade }}
        />
      ) : null}
      <motion.div className="flip-card__rotor" style={reduce ? undefined : rotorStyle}>
        <div className="flip-card__face flip-card__face--front" aria-hidden={shown} inert={shown}>
          {front}
          {glare ? <span className="flip-card__glare" aria-hidden="true" /> : null}
        </div>
        <div className="flip-card__face flip-card__face--back" aria-hidden={!shown} inert={!shown}>
          {back}
          {glare ? <span className="flip-card__glare" aria-hidden="true" /> : null}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
