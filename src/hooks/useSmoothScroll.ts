import { useEffect, useRef } from "react";
import Lenis from "lenis";

// Inertial scrolling, so the layers glide instead of stepping. Off under reduced motion.
// While `paused` (the loader is up) the page does not scroll at all.
export const useSmoothScroll = (paused: boolean) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09 });
    lenisRef.current = lenis;
    let frame = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-loading", paused);
    if (paused) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [paused]);
};
