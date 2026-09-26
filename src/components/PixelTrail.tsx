/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo } from "react";
import type { ComponentProps, CSSProperties } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { shaderMaterial, useTrailTexture } from "@react-three/drei";
import * as THREE from "three";
import "./PixelTrail.css";

const GooeyFilter = ({
  id = "goo-filter",
  strength = 10,
}: {
  id?: string;
  strength?: number;
}) => (
  <svg className="goo-filter-container" aria-hidden="true">
    <defs>
      <filter id={id}>
        <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

const DotMaterial = shaderMaterial(
  {
    resolution: new THREE.Vector2(),
    mouseTrail: null as THREE.Texture | null,
    gridSize: 100,
    pixelColor: new THREE.Color("#ffffff"),
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  /* glsl */ `
    uniform vec2 resolution;
    uniform sampler2D mouseTrail;
    uniform float gridSize;
    uniform vec3 pixelColor;

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    float sdfCircle(vec2 p, float r) {
        return length(p - 0.5) - r;
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      vec2 gridUv = fract(uv * gridSize);
      vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize;

      float trail = texture2D(mouseTrail, gridUvCenter).r;

      gl_FragColor = vec4(pixelColor, trail);
    }
  `,
);

const identityEase = (x: number) => x;

type GooeyFilterConfig = { id: string; strength: number };

/** realne typy propsów canvasa z R3F — bez żadnych `never`-castów */
type PixelTrailCanvasProps = ComponentProps<typeof Canvas>;

function Scene({
  gridSize,
  trailSize,
  maxAge,
  interpolate,
  easingFunction,
  pixelColor,
}: {
  gridSize: number;
  trailSize: number;
  maxAge: number;
  interpolate: number;
  easingFunction: (x: number) => number;
  pixelColor: string;
}) {
  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);

  const dotMaterial = useMemo(() => new DotMaterial(), []);
  useEffect(() => () => dotMaterial.dispose(), [dotMaterial]);

  useEffect(() => {
    dotMaterial.uniforms.pixelColor.value.set(pixelColor);
  }, [dotMaterial, pixelColor]);

  const [trail, onMove] = useTrailTexture({
    size: 512,
    radius: trailSize,
    maxAge,
    interpolate: interpolate || 0.1,
    ease: easingFunction || identityEase,
  });

  useEffect(() => {
    if (!trail) return;
    trail.minFilter = THREE.NearestFilter;
    trail.magFilter = THREE.NearestFilter;
    trail.wrapS = THREE.ClampToEdgeWrapping;
    trail.wrapT = THREE.ClampToEdgeWrapping;
  }, [trail]);

  const scale = Math.max(viewport.width, viewport.height) / 2;

  return (
    <mesh scale={[scale, scale, 1]} onPointerMove={onMove}>
      <planeGeometry args={[2, 2]} />
      <primitive
        object={dotMaterial}
        attach="material"
        gridSize={gridSize}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
        mouseTrail={trail}
      />
    </mesh>
  );
}

export interface PixelTrailProps {
  /** Number of pixels in grid. */
  gridSize?: number;
  /** Size of each trail dot. */
  trailSize?: number;
  /** Duration of the trail effect. */
  maxAge?: number;
  /** Interpolation factor for pointer movement. */
  interpolate?: number;
  easingFunction?: (x: number) => number;
  canvasProps?: Partial<PixelTrailCanvasProps>;
  glProps?: PixelTrailCanvasProps["gl"];
  gooeyFilter?: GooeyFilterConfig;
  /** Pixel color. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

const PixelTrail = ({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = identityEase,
  canvasProps = {},
  glProps = {
    antialias: false,
    powerPreference: "high-performance",
    alpha: true,
  },
  gooeyFilter,
  color = "#ffffff",
  className = "",
  style,
}: PixelTrailProps) => {
  const { dpr, ...rest } = canvasProps;
  return (
  <>
    {gooeyFilter && (
      <GooeyFilter id={gooeyFilter.id} strength={gooeyFilter.strength} />
    )}
    <Canvas
      {...rest}
      dpr={dpr ?? [1, 1.25]}
      gl={glProps}
      className={`pixel-canvas ${className}`}
      style={{
        ...style,
        ...(gooeyFilter ? { filter: `url(#${gooeyFilter.id})` } : {}),
      }}
    >
      <Scene
        gridSize={gridSize}
        trailSize={trailSize}
        maxAge={maxAge}
        interpolate={interpolate}
        easingFunction={easingFunction}
        pixelColor={color}
      />
    </Canvas>
  </>
  );
};

export default PixelTrail;
