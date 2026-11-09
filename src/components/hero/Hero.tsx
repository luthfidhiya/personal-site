import { useEffect, useRef } from "react";
import { profile } from "../../data/profile";
import { art } from "./assets";
import { FRAME_COUNT, drawFrame, loadFrames } from "./samurai";

// The peak (DESIGN.md). Pinned while the visitor scrolls: the layers drift at their own
// depths and the scroll plays the samurai's draw. Each layer's travel over the pin, in
// viewport units; nearer layers travel further, which is what reads as depth.
const DRIFT: Record<string, { x: number; y: number }> = {
  moon: { x: 0, y: -4 },
  "cloud-2": { x: -6, y: -7 },
  "cloud-1": { x: 5, y: -10 },
  "ridge-far": { x: 0, y: -8 },
  "ridge-mid": { x: 0, y: -14 },
  samurai: { x: 0, y: -10 },
  "ridge-near": { x: 0, y: -22 },
  branch: { x: -24, y: -45 },
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, from: number, to: number) => clamp((p - from) / (to - from));


const Hero = () => {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const copy = copyRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !copy || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-layer]"));
    // On phones he stands smaller and nearer the middle, so the text keeps the top half
    const bodyAt = narrow ? 0.62 : 0.7;
    const scale = narrow ? 0.64 : 1.04;

    let frameShown = -1;
    let progress = -1;
    const frames = loadFrames(narrow, () => {
      frameShown = -1;
      render(true);
    });

    const render = (force = false) => {
      const r = root.getBoundingClientRect();
      const p = reduced ? 0 : clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      if (p === progress && !force) return;
      progress = p;

      for (const el of layers) {
        const d = DRIFT[el.dataset.layer!];
        el.style.translate = `${(d.x * p).toFixed(2)}vw ${(d.y * p).toFixed(2)}svh`;
      }
      // The draw plays over most of the pin, leaving a beat of stillness at either end
      const frame = Math.round(range(p, 0.06, 0.8) * (FRAME_COUNT - 1));
      if (frame !== frameShown || force) {
        drawFrame(ctx, frames, frame, bodyAt, scale);
        frameShown = frame;
      }
      // The words give way as the blade crosses them
      const fade = range(p, 0.42, 0.62);
      copy.style.opacity = String(1 - fade);
      copy.style.translate = `0 ${(-4 * fade).toFixed(2)}svh`;
    };

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render(true);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    let raf = 0;
    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <div className="hero-sky" aria-hidden="true" />
        <div className="hero-moon" data-layer="moon" aria-hidden="true">
          <img {...art("moon")} sizes="40vw" alt="" />
        </div>
        <img className="hero-cloud-2" data-layer="cloud-2" {...art("cloud-2")} sizes="80vw" alt="" />
        <img className="hero-cloud-1" data-layer="cloud-1" {...art("cloud-1")} sizes="90vw" alt="" />
        <img className="hero-ridge-far" data-layer="ridge-far" {...art("ridge-far")} sizes="100vw" alt="" />
        <div className="hero-mist hero-mist-far" aria-hidden="true" />
        <img className="hero-ridge-mid" data-layer="ridge-mid" {...art("ridge-far")} sizes="115vw" alt="" />
        <div className="hero-mist hero-mist-near" aria-hidden="true" />
        <canvas
          ref={canvasRef}
          className="hero-samurai"
          data-layer="samurai"
          role="img"
          aria-label="A samurai in a straw hat, eyes glowing red, draws his katana"
        />
        {/* The ground goes on below the ridge, so rising it never shows an edge */}
        <div className="hero-ridge-near" data-layer="ridge-near">
          <img {...art("ridge-near")} sizes="110vw" alt="" />
        </div>
        <img className="hero-branch" data-layer="branch" {...art("branch")} sizes="50vw" alt="" />

        <div ref={copyRef} className="hero-copy">
          <p className="hero-kicker">
            {profile.role} · {profile.location}
          </p>
          <h1 id="hero-title" className="hero-title">
            {profile.name}
          </h1>
          <p className="hero-lede">{profile.tagline}</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
