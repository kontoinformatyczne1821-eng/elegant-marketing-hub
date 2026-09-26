import type { CSSProperties, ReactNode } from "react";
import "./GlareHover.css";

export interface GlareHoverProps {
  /** The width of the hover element. */
  width?: string;
  /** The height of the hover element. */
  height?: string;
  /** The background color of the element. */
  background?: string;
  /** The border radius of the element. */
  borderRadius?: string;
  /** The border color of the element. */
  borderColor?: string;
  children?: ReactNode;
  /** The color of the glare effect (hex format). */
  glareColor?: string;
  /** The opacity of the glare effect (0-1). */
  glareOpacity?: number;
  /** The angle of the glare effect in degrees. */
  glareAngle?: number;
  /** The size of the glare effect as a percentage (e.g. 250 = 250%). */
  glareSize?: number;
  /** The duration of the transition in milliseconds. */
  transitionDuration?: number;
  /** If true, the glare only animates on hover and doesn't return on mouse leave. */
  playOnce?: boolean;
  className?: string;
  style?: CSSProperties;
}

const GlareHover = ({
  width = "500px",
  height = "500px",
  background = "#000",
  borderRadius = "10px",
  borderColor = "#333",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
}: GlareHoverProps) => {
  const hex = glareColor.replace("#", "");
  let rgba = glareColor;
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const vars = {
    "--gh-width": width,
    "--gh-height": height,
    "--gh-bg": background,
    "--gh-br": borderRadius,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": rgba,
    "--gh-border": borderColor,
  };

  return (
    <div
      className={`glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
};

export default GlareHover;
