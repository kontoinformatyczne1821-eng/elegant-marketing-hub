import { useCallback, useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export interface CountUpProps {
  /** The target number to count up to. */
  to?: number;
  /** The initial number from which the count starts. */
  from?: number;
  /** Alias for `to`. */
  end?: number;
  /** Alias for `from`. */
  start?: number;
  /** "up" counts from → to, "down" counts to → from. */
  direction?: "up" | "down";
  /** Delay in seconds before the counting starts. */
  delay?: number;
  /** Duration in seconds, based on the damping and stiffness used below. */
  duration?: number;
  className?: string;
  /** Start only when the element scrolls into view. */
  startWhen?: boolean;
  /** Character used as the thousands separator. */
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

const getDecimalPlaces = (num: number) => {
  const str = num.toString();
  if (str.includes(".")) {
    const decimals = str.split(".")[1];
    if (parseInt(decimals, 10) !== 0) return decimals.length;
  }
  return 0;
};

export default function CountUp({
  to,
  from = 0,
  end,
  start,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const resolvedTo = end ?? to ?? 0;
  const resolvedFrom = start ?? from ?? 0;
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? resolvedTo : resolvedFrom);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  const maxDecimals = Math.max(getDecimalPlaces(resolvedFrom), getDecimalPlaces(resolvedTo));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };
      const formatted = Intl.NumberFormat("en-US", options).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator],
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === "down" ? resolvedTo : resolvedFrom);
    }
  }, [resolvedFrom, resolvedTo, direction, formatValue]);

  useEffect(() => {
    if (!isInView || !startWhen) return;
    onStart?.();
    const timeoutId = setTimeout(() => {
      motionValue.set(direction === "down" ? resolvedFrom : resolvedTo);
    }, delay * 1000);
    const durationTimeoutId = setTimeout(() => {
      onEnd?.();
    }, delay * 1000 + duration * 1000);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(durationTimeoutId);
    };
  }, [isInView, startWhen, motionValue, direction, resolvedFrom, resolvedTo, delay, onStart, onEnd, duration]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest: number) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
