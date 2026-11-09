import { useEffect, useRef, type CSSProperties } from "react";
import { useMotion } from "../hooks/useMotion";
import { usePointerParallax } from "../hooks/usePointerParallax";
import { profile } from "../data/profile";

// The peak. The stage stays pinned while the visitor scrolls through it, and the scroll
// plays the kata frame by frame, like an anime key-frame sequence: he grips the sword,
// draws it level (nukitsuke), lifts it overhead, holds while the sky reddens, then cuts.
// His blade's red arc ends at the tip, and from there the stroke runs on across the
// screen; the world falls apart along it and the descent begins. Everything is a pure
// function of scroll, so it plays backward too.

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// The six key frames (public/art/ronin-0..5, all cropped to one shared box)
const FRAMES = 6;
// Where each frame is reached along p. 0..4 is the draw and the lift; 4 is held; 5 is the cut
const KEYS = [0.1, 0.17, 0.24, 0.31, 0.38, 0.455];
// Fraction of each step spent blending: the rest is held, which is what makes it read as
// key-framed animation rather than a slow dissolve
const BLEND = 0.35;

// Where the blade tip is in the cut frame (fractions of the image), and the way the cut
// carries on from it: the red arc arrives almost level, falling a little to the left
const TIP = { x: 0.0042, y: 0.7617 };
const DIR = (() => {
  const x = -0.95;
  const y = 0.3;
  const l = Math.hypot(x, y);
  return { x: x / l, y: y / l };
})();

const sky = {
  src: "/art/sky-1280.webp",
  srcSet: "/art/sky-640.webp 640w, /art/sky-1280.webp 1280w",
  sizes: "100vw",
  width: 1280,
  height: 720,
};

const frame = (i: number) => ({
  src: `/art/ronin-${i}-1100.webp`,
  srcSet: `/art/ronin-${i}-560.webp 419w, /art/ronin-${i}-1100.webp 822w`,
  sizes: "(max-width: 767px) 42vw, 64svh",
  width: 822,
  height: 1100,
});

/** Opacity of every frame for a point of the kata */
const frameWeights = (p: number) => {
  const w = new Array<number>(FRAMES).fill(0);
  if (p <= KEYS[0]) {
    w[0] = 1;
    return { w, smear: 0 };
  }
  for (let i = 0; i < FRAMES - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (p <= b) {
      const t = smooth(b - (b - a) * BLEND, b, p);
      w[i] = 1 - t;
      w[i + 1] = t;
      return { w, smear: Math.sin(Math.PI * t) };
    }
  }
  w[FRAMES - 1] = 1;
  return { w, smear: 0 };
};

const Hero = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const upperRef = useRef<HTMLDivElement>(null);
  const lowerRef = useRef<HTMLDivElement>(null);
  const roninRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef<SVGSVGElement>(null);
  const { reduced, allowed } = useMotion();
  usePointerParallax(stageRef);

  // The living sky (a looping Veo clip over the still painting): it plays only while motion
  // is allowed and the stage is on screen, and the two halves are kept on the same frame
  // so the cut line never shows two different moments
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const [a, b] = Array.from(stage.querySelectorAll<HTMLVideoElement>(".hero-video"));
    if (!a || !b) return;
    let onScreen = true;
    const update = () => {
      const play = allowed && onScreen;
      for (const v of [a, b]) {
        if (play) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    };
    const showWhenReady = (v: HTMLVideoElement) => () => v.classList.add("is-playing");
    a.addEventListener("playing", showWhenReady(a), { once: true });
    b.addEventListener("playing", showWhenReady(b), { once: true });
    const sync = window.setInterval(() => {
      if (!a.paused && Math.abs(a.currentTime - b.currentTime) > 0.04) b.currentTime = a.currentTime;
    }, 1000);
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    io.observe(stage);
    update();
    return () => {
      io.disconnect();
      window.clearInterval(sync);
      a.pause();
      b.pause();
    };
  }, [allowed]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const upper = upperRef.current;
    const lower = lowerRef.current;
    const ronin = roninRef.current;
    const slash = slashRef.current;
    if (!root || !stage || !upper || !lower || !ronin || !slash || reduced) return;
    const poses = Array.from(ronin.querySelectorAll<HTMLImageElement>(".ronin-pose"));

    // The cut line, in stage pixels: through the blade tip, along the arc's direction
    let W = 0;
    let H = 0;
    let nx = 0;
    let ny = 0;
    const paths = slash.querySelectorAll("path");
    const layout = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      // The figure's resting box (layout size, so parallax and tension scale don't skew it)
      const tx = ronin.offsetLeft + ronin.offsetWidth * TIP.x;
      const ty = ronin.offsetTop + ronin.offsetHeight * TIP.y;
      const L = Math.max(W, H) * 3;
      const ax = tx - DIR.x * L;
      const ay = ty - DIR.y * L;
      const bx = tx + DIR.x * L;
      const by = ty + DIR.y * L;
      // Normal pointing up, toward the upper half
      nx = DIR.y;
      ny = -DIR.x;
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      const poly = (sx: number, sy: number, off: number) =>
        `polygon(${[
          [ax - sx * off, ay - sy * off],
          [bx - sx * off, by - sy * off],
          [bx + sx * L, by + sy * L],
          [ax + sx * L, ay + sy * L],
        ]
          .map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`)
          .join(",")})`;
      // A pixel of overlap so no seam shows before the split
      upper.style.clipPath = poly(nx, ny, 1);
      lower.style.clipPath = poly(-nx, -ny, 1);
      slash.setAttribute("viewBox", `0 0 ${W} ${H}`);
      // The stroke leaves the tip and runs on, off the far edge of the screen
      const d = `M${tx.toFixed(1)},${ty.toFixed(1)} L${(tx + DIR.x * W * 1.6).toFixed(1)},${(ty + DIR.y * W * 1.6).toFixed(1)}`;
      paths.forEach((p) => p.setAttribute("d", d));
    };

    let frameReq = 0;
    const set = (k: string, v: number) => root.style.setProperty(k, v.toFixed(4));
    const render = () => {
      frameReq = 0;
      const r = root.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));

      const titleOut = smooth(0.06, 0.28, p);
      set("--title-out", titleOut);
      // Once the title has gone, its link leaves the tab order too
      root.toggleAttribute("data-past", titleOut > 0.98);

      const { w, smear } = frameWeights(p);
      poses.forEach((img, i) => (img.style.opacity = w[i].toFixed(3)));
      // A smear between key frames, sharper on the cut
      const onCut = p > KEYS[4];
      set("--smear", smear * (onCut ? 5 : 2.2));

      set("--tension", smooth(0.3, 0.45, p));
      set("--heat", smooth(0.3, 0.46, p));
      set("--stroke", smooth(0.452, 0.5, p));
      set("--stroke-fade", 1 - smooth(0.6, 0.78, p));
      const flash = Math.max(0, 1 - Math.abs(p - 0.456) / 0.018);
      set("--flash", flash);
      // The impact shakes the camera for a beat
      const shake = flash * flash * 9;
      stage.style.translate = shake > 0.05 ? `${(Math.sin(p * 2400) * shake).toFixed(1)}px ${(Math.cos(p * 3100) * shake * 0.6).toFixed(1)}px` : "";
      set("--gone", smooth(0.62, 0.88, p));

      const split = smooth(0.56, 0.92, p);
      const s = split * split;
      const lift = s * H * 0.32;
      const slide = s * W * 0.05;
      upper.style.translate = `${(nx * lift - DIR.x * slide).toFixed(1)}px ${(ny * lift - DIR.y * slide).toFixed(1)}px`;
      lower.style.translate = `${(-nx * lift + DIR.x * slide).toFixed(1)}px ${(-ny * lift + DIR.y * slide).toFixed(1)}px`;
      upper.style.rotate = `${(-2.5 * s).toFixed(3)}deg`;
      lower.style.rotate = `${(1.5 * s).toFixed(3)}deg`;
    };
    const schedule = () => {
      if (!frameReq) frameReq = requestAnimationFrame(render);
    };
    const onResize = () => {
      layout();
      schedule();
    };

    layout();
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(stage);
    ro.observe(ronin);
    return () => {
      cancelAnimationFrame(frameReq);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return (
    <div ref={rootRef} className="hero" data-static={reduced || undefined} data-fog>
      <div ref={stageRef} className="hero-stage">
        <div className="hero-under" aria-hidden="true" />
        <div ref={upperRef} className="half">
          <div className="layer" style={{ "--depth": 0.12 } as CSSProperties}>
            <img
              {...sky}
              className="hero-sky"
              alt="A blood moon over a snow peak, with a pagoda on a cliff; thin clouds drift across the moon"
              fetchPriority="high"
            />
            <video className="hero-sky hero-video" src="/art/hero-sky.mp4" muted loop playsInline preload="none" aria-hidden="true" />
          </div>
        </div>
        <div ref={lowerRef} className="half" aria-hidden="true">
          <div className="layer" style={{ "--depth": 0.12 } as CSSProperties}>
            <img {...sky} className="hero-sky" alt="" decoding="async" />
            <video className="hero-sky hero-video" src="/art/hero-sky.mp4" muted loop playsInline preload="none" />
          </div>
        </div>
        <div className="hero-heat" aria-hidden="true" />

        <div className="hero-copy">
          <p className="kicker">
            {profile.role} <span aria-hidden="true">/</span> {profile.location}
          </p>
          <h1 className="hero-title">{profile.name}</h1>
          <p className="hero-lede">I build web apps end to end, from the database schema to the last hover state.</p>
          <a href="#about" className="btn btn-bone">
            Begin the descent
          </a>
        </div>

        <div ref={roninRef} className="ronin-wrap">
          <div className="ronin-aura" aria-hidden="true" />
          {Array.from({ length: FRAMES }, (_, i) => (
            <img
              key={i}
              {...frame(i)}
              className="ronin-pose"
              style={{ opacity: i === 0 ? 1 : 0 }}
              alt={i === 0 ? "A ronin in a straw hat waits on a rock, hand on his sheathed sword" : ""}
              aria-hidden={i === 0 ? undefined : true}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
            />
          ))}
        </div>

        <svg ref={slashRef} className="slash" aria-hidden="true" preserveAspectRatio="none">
          <path pathLength={1} className="slash-glow" />
          <path pathLength={1} className="slash-core" />
        </svg>
        <div className="hero-flash" aria-hidden="true" />
      </div>
    </div>
  );
};

export default Hero;
