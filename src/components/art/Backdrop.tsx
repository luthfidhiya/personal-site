import LivingPainting, { type PaintingFx } from "./LivingPainting";

// A scene's painted backdrop (generated art in public/art, see DESIGN.md). The still image
// is always there (alt text, reduced motion, before WebGL is ready); over it a
// LivingPainting makes the parts that should move, move. It drifts against the scroll
// (data-speed, see useParallax), and the ink vignette fades it into the next scene.

interface Scene {
  sizes: [number, number][];
  /** Where the crop holds when the screen is narrower than the painting */
  focus: [number, number];
  fx: PaintingFx;
}

// Coordinates measured on each painting (fractions, x right, y down)
const SCENES = {
  about: {
    sizes: [
      [640, 360],
      [1280, 720],
    ],
    focus: [0.62, 0.5],
    fx: {
      flow: [0.12, 0.0, 0.31, 0.74],
      ripple: [0.0, 0.7, 0.62, 1.0],
      hold: [[0.58, 0.36, 0.9, 0.86]],
      glow: [0.42, 0.3, 0.22, 0.12],
      fog: 0.45,
      sparks: 26,
      rise: true,
      sparkColor: [1, 0.45, 0.35],
    },
  },
  arsenal: {
    sizes: [
      [960, 525],
      [1920, 1050],
    ],
    focus: [0.72, 0.5],
    fx: {
      sway: [0.0, 0.0, 1.0, 0.92],
      swayAmp: 0.007,
      hold: [[0.66, 0.28, 1.0, 1.0]],
      glow: [0.59, 0.21, 0.1, 0.18],
      sparks: 22,
      rise: false,
      sparkColor: [1, 0.62, 0.25],
    },
  },
  work: {
    sizes: [
      [960, 525],
      [1920, 1050],
    ],
    focus: [0.5, 0.5],
    fx: {
      ripple: [0.0, 0.66, 1.0, 1.0],
      lights: [
        [0.16, 0.22, 0.09, 0.22],
        [0.33, 0.35, 0.05, 0.18],
        [0.43, 0.41, 0.035, 0.15],
        [0.805, 0.35, 0.05, 0.18],
        [0.94, 0.15, 0.09, 0.22],
        [0.12, 0.48, 0.16, 0.08],
      ],
      sparks: 30,
      rise: false,
      sparkColor: [0.9, 0.5, 0.35],
    },
  },
  contact: {
    sizes: [
      [960, 525],
      [1920, 1050],
    ],
    focus: [0.7, 0.5],
    fx: {
      sway: [0.0, 0.52, 1.0, 1.0],
      swayAmp: 0.01,
      hold: [
        [0.6, 0.53, 0.87, 0.9],
        [0.68, 0.38, 0.95, 0.53],
      ],
      lights: [
        [0.712, 0.445, 0.03, 0.25],
        [0.918, 0.43, 0.03, 0.25],
      ],
      glow: [0.79, 0.32, 0.13, 0.12],
      fog: 0.35,
      sparks: 34,
      rise: true,
      sparkColor: [1, 0.5, 0.25],
    },
  },
} satisfies Record<string, Scene>;

interface BackdropProps {
  name: keyof typeof SCENES;
  alt: string;
  speed?: number;
}

const Backdrop = ({ name, alt, speed = -0.12 }: BackdropProps) => {
  const scene: Scene = SCENES[name] as Scene;
  const [w, h] = scene.sizes[scene.sizes.length - 1];
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const [tw] = narrow ? scene.sizes[0] : scene.sizes[scene.sizes.length - 1];
  const [fx, fy] = scene.focus;
  return (
    <div className="scene-art">
      <div className="scene-layer" data-speed={speed}>
        <img
          src={`/art/${name}-${w}.webp`}
          srcSet={scene.sizes.map(([sw]) => `/art/${name}-${sw}.webp ${sw}w`).join(", ")}
          sizes="100vw"
          width={w}
          height={h}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: `${fx * 100}% ${fy * 100}%` }}
        />
        <LivingPainting src={`/art/${name}-${tw}.webp`} width={w} height={h} focus={scene.focus} fx={scene.fx} />
      </div>
    </div>
  );
};

export default Backdrop;
