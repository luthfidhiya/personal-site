import { useSyncExternalStore } from "react";

// One switch for everything that moves on its own (embers, fog, sparks).
// Off from the start under prefers-reduced-motion; the visitor can also pause it.
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
let paused = false;
const listeners = new Set<() => void>();
// Mirrored onto <html data-motion> so CSS-only motion (the ronin's aura) stops with the rest
const mirror = () => {
  document.documentElement.dataset.motion = !reduce.matches && !paused ? "on" : "off";
};
const emit = () => {
  mirror();
  listeners.forEach((l) => l());
};
reduce.addEventListener("change", emit);
mirror();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const motionAllowed = () => !reduce.matches && !paused;
export const reducedMotion = () => reduce.matches;

export const setMotionPaused = (value: boolean) => {
  paused = value;
  emit();
};

export const useMotion = () => {
  const allowed = useSyncExternalStore(subscribe, motionAllowed);
  const isReduced = useSyncExternalStore(subscribe, reducedMotion);
  const isPaused = useSyncExternalStore(subscribe, () => paused);
  return { allowed, reduced: isReduced, paused: isPaused };
};
