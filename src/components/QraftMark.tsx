export interface QraftMarkProps {
  /** Kolor kresek znaku. */
  className?: string;
  /** Wysokość znaku w px (szerokość skaluje się proporcjonalnie). */
  height?: number;
}

/** Znak QRAFT rysowany cienką kreską — „A” bez poprzecznicy, jak w logotypie. */
const QraftMark = ({ className = "text-white", height = 22 }: QraftMarkProps) => (
  <svg
    viewBox="0 0 152 40"
    height={height}
    role="img"
    aria-label="QRAFT"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    vectorEffect="non-scaling-stroke"
  >
    {/* Q */}
    <circle cx="15" cy="20" r="10.5" />
    <path d="M22.5 27.5 L29 34" />
    {/* R */}
    <path d="M44 33 V7 H53.5 A6 6 0 0 1 53.5 19 H44 M52 19 L60 33" />
    {/* A */}
    <path d="M70 33 L80.5 7 L91 33" />
    {/* F */}
    <path d="M101 33 V7 H116 M101 19 H113" />
    {/* T */}
    <path d="M126 7 H146 M136 7 V33" />
  </svg>
);

export default QraftMark;
