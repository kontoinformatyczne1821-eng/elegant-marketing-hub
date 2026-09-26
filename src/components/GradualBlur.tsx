import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./GradualBlur.css";

/* Component added by Ansh - github.com/ansh-dhanani */

export type GradualBlurPosition = "top" | "bottom" | "left" | "right";
export type GradualBlurTarget = "parent" | "page";
export type GradualBlurCurve =
  | "linear"
  | "bezier"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";
export type GradualBlurAnimated = boolean | "scroll";
export type GradualBlurPreset =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "subtle"
  | "intense"
  | "smooth"
  | "sharp"
  | "header"
  | "footer"
  | "sidebar"
  | "page-header"
  | "page-footer";

export interface GradualBlurConfig {
  position: GradualBlurPosition;
  strength: number;
  height: string;
  width?: string;
  divCount: number;
  exponential: boolean;
  zIndex: number;
  animated: GradualBlurAnimated;
  duration: string;
  easing: string;
  opacity: number;
  curve: GradualBlurCurve;
  responsive: boolean;
  target: GradualBlurTarget;
  hoverIntensity?: number;
  preset?: GradualBlurPreset;
  onAnimationComplete?: () => void;
  className: string;
  style: CSSProperties;
  mobileHeight?: string;
  tabletHeight?: string;
  desktopHeight?: string;
  mobileWidth?: string;
  tabletWidth?: string;
  desktopWidth?: string;
}

export type GradualBlurProps = Partial<GradualBlurConfig> & { children?: ReactNode };

const DEFAULT_CONFIG: GradualBlurConfig = {
  position: "bottom",
  strength: 2,
  height: "6rem",
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: "0.3s",
  easing: "ease-out",
  opacity: 1,
  curve: "linear",
  responsive: false,
  target: "parent",
  className: "",
  style: {},
};

const PRESETS: Record<GradualBlurPreset, Partial<GradualBlurConfig>> = {
  top: { position: "top", height: "6rem" },
  bottom: { position: "bottom", height: "6rem" },
  left: { position: "left", height: "6rem" },
  right: { position: "right", height: "6rem" },
  subtle: { height: "4rem", strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: "10rem", strength: 4, divCount: 8, exponential: true },
  smooth: { height: "8rem", curve: "bezier", divCount: 10 },
  sharp: { height: "5rem", curve: "linear", divCount: 4 },
  header: { position: "top", height: "8rem", curve: "ease-out" },
  footer: { position: "bottom", height: "8rem", curve: "ease-out" },
  sidebar: { position: "left", height: "6rem", strength: 2.5 },
  "page-header": { position: "top", height: "10rem", target: "page", strength: 3 },
  "page-footer": { position: "bottom", height: "10rem", target: "page", strength: 3 },
};

const CURVE_FUNCTIONS: Record<GradualBlurCurve, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  "ease-in": (p) => p * p,
  "ease-out": (p) => 1 - Math.pow(1 - p, 2),
  "ease-in-out": (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
};

const mergeConfigs = (...configs: (Partial<GradualBlurConfig> | undefined)[]) =>
  configs.reduce<Partial<GradualBlurConfig>>(
    (acc, c) => ({ ...acc, ...c }),
    {},
  );

const getGradientDirection = (position: GradualBlurPosition) =>
  ({ top: "to top", bottom: "to bottom", left: "to left", right: "to right" })[
    position
  ] || "to bottom";

const debounce = (fn: () => void, wait: number) => {
  let t: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(t);
    t = setTimeout(() => fn(), wait);
  };
};

const useResponsiveDimension = (
  responsive: boolean,
  config: GradualBlurConfig,
  key: "height" | "width",
) => {
  const [value, setValue] = useState<string | undefined>(config[key]);
  useEffect(() => {
    if (!responsive) return;
    const calc = () => {
      const w = window.innerWidth;
      const record = config as unknown as Record<string, string | undefined>;
      const cap = key[0].toUpperCase() + key.slice(1);
      let v = config[key];
      if (w <= 480 && record[`mobile${cap}`]) v = record[`mobile${cap}`];
      else if (w <= 768 && record[`tablet${cap}`]) v = record[`tablet${cap}`];
      else if (w <= 1024 && record[`desktop${cap}`]) v = record[`desktop${cap}`];
      setValue(v);
    };
    const debounced = debounce(calc, 100);
    calc();
    window.addEventListener("resize", debounced);
    return () => window.removeEventListener("resize", debounced);
  }, [responsive, config, key]);
  return responsive ? value : config[key];
};

const useIntersectionObserver = (
  ref: React.RefObject<HTMLDivElement | null>,
  shouldObserve = false,
) => {
  const [isVisible, setIsVisible] = useState(!shouldObserve);

  useEffect(() => {
    if (!shouldObserve || !ref.current) return;

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.1,
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, shouldObserve]);

  return isVisible;
};

function GradualBlur({ children, ...props }: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo<GradualBlurConfig>(
    () =>
      mergeConfigs(
        DEFAULT_CONFIG,
        props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : undefined,
        props,
      ) as GradualBlurConfig,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props],
  );

  const responsiveHeight = useResponsiveDimension(
    config.responsive,
    config,
    "height",
  );
  const responsiveWidth = useResponsiveDimension(
    config.responsive,
    config,
    "width",
  );

  const isVisible = useIntersectionObserver(
    containerRef,
    config.animated === "scroll",
  );

  const blurDivs = useMemo(() => {
    const divs: ReactNode[] = [];
    const increment = 100 / config.divCount;
    const currentStrength =
      isHovered && config.hoverIntensity
        ? config.strength * config.hoverIntensity
        : config.strength;

    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear;

    for (let i = 1; i <= config.divCount; i++) {
      let progress = i / config.divCount;
      progress = curveFunc(progress);

      const blurValue = config.exponential
        ? Math.pow(2, progress * 4) * 0.0625 * currentStrength
        : 0.0625 * (progress * config.divCount + 1) * currentStrength;

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(config.position);

      const divStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition:
          config.animated && config.animated !== "scroll"
            ? `backdrop-filter ${config.duration} ${config.easing}`
            : undefined,
      };

      divs.push(<div key={i} style={divStyle} />);
    }

    return divs;
  }, [config, isHovered]);

  const containerStyle = useMemo(() => {
    const isVertical: boolean = ["top", "bottom"].includes(config.position);
    const isHorizontal: boolean = ["left", "right"].includes(config.position);
    const isPageTarget = config.target === "page";

    const base: Record<string, string | number | undefined> = {
      position: isPageTarget ? "fixed" : "absolute",
      pointerEvents: config.hoverIntensity ? "auto" : "none",
      opacity: isVisible ? 1 : 0,
      transition: config.animated
        ? `opacity ${config.duration} ${config.easing}`
        : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      ...config.style,
    };

    if (isVertical) {
      base.height = responsiveHeight;
      base.width = responsiveWidth || "100%";
      base[config.position] = 0;
      base.left = 0;
      base.right = 0;
    } else if (isHorizontal) {
      base.width = responsiveWidth || responsiveHeight;
      base.height = "100%";
      base[config.position] = 0;
      base.top = 0;
      base.bottom = 0;
    }

    return base as CSSProperties;
  }, [config, responsiveHeight, responsiveWidth, isVisible]);

  const { hoverIntensity, animated, onAnimationComplete, duration } = config;

  useEffect(() => {
    if (isVisible && animated === "scroll" && onAnimationComplete) {
      const ms = parseFloat(duration) * 1000;
      const t = setTimeout(() => onAnimationComplete(), ms);
      return () => clearTimeout(t);
    }
  }, [isVisible, animated, onAnimationComplete, duration]);

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${
        config.target === "page" ? "gradual-blur-page" : "gradual-blur-parent"
      } ${config.className}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div
        className="gradual-blur-inner"
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        {blurDivs}
        {children}
      </div>
    </div>
  );
}

const GradualBlurMemo = memo(GradualBlur);
GradualBlurMemo.displayName = "GradualBlur";
(GradualBlurMemo as unknown as { PRESETS: typeof PRESETS; CURVE_FUNCTIONS: typeof CURVE_FUNCTIONS }).PRESETS =
  PRESETS;
(GradualBlurMemo as unknown as { PRESETS: typeof PRESETS; CURVE_FUNCTIONS: typeof CURVE_FUNCTIONS }).CURVE_FUNCTIONS =
  CURVE_FUNCTIONS;

export default GradualBlurMemo;
