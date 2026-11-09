import { useEffect, type RefObject } from "react";

// Moves every [data-speed] element inside root by its section's distance from the
// viewport centre: speed < 0 trails the page (far), speed > 0 leads it (near).
export const useParallax = (rootRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-speed]")).map((el) => ({
      el,
      speed: Number(el.dataset.speed),
      section: el.closest<HTMLElement>("section") ?? el,
    }));
    let frame = 0;

    const apply = () => {
      frame = 0;
      const vh = window.innerHeight;
      const mid = vh / 2;
      for (const { el, speed, section } of items) {
        const r = section.getBoundingClientRect();
        if (r.bottom < -mid || r.top > vh + mid) continue;
        const offset = r.top + r.height / 2 - mid;
        el.style.translate = `0 ${(offset * speed).toFixed(1)}px`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    apply();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [rootRef]);
};
