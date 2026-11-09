import { useEffect, type RefObject } from "react";

// Writes the cursor position (-1..1 on each axis, eased) to --mx / --my on the element,
// so its layers can shift by different amounts. Only for a fine pointer that can hover.
export const usePointerParallax = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const el = ref.current;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || !canHover.matches || reduce.matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const step = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      el.style.setProperty("--mx", current.x.toFixed(4));
      el.style.setProperty("--my", current.y.toFixed(4));
      const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(step);
    };
    // Drift back to centre when the cursor leaves the window
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      if (!frame) frame = requestAnimationFrame(step);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
};
