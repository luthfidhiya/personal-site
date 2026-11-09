import { useEffect, type RefObject } from "react";

// For the scenes below the hero (not pinned): every [data-speed] element inside root moves
// by the section's distance from the viewport centre. speed < 0 trails the page (far),
// speed > 0 leads it (near). Uses `translate`, so CSS animations on `transform` still run.
export const useSceneParallax = (rootRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-speed]")).map((el) => ({
      el,
      speed: Number(el.dataset.speed),
    }));

    let raf = 0;
    let last = NaN;
    const loop = () => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // Only while the scene is near the screen
      if (r.bottom > -vh && r.top < vh * 2) {
        const offset = r.top + r.height / 2 - vh / 2;
        if (offset !== last) {
          for (const { el, speed } of items) el.style.translate = `0 ${(offset * speed).toFixed(1)}px`;
          last = offset;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rootRef]);
};
