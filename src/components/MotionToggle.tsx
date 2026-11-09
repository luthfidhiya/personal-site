import { setMotionPaused, useMotion } from "../hooks/useMotion";

// The embers, mist and sparks move on their own, so the visitor gets a way to stop them.
// It sits in the footer, out of the way of the opening.
// Not shown under prefers-reduced-motion, where they never start.
const MotionToggle = () => {
  const { reduced, paused } = useMotion();
  if (reduced) return null;
  return (
    <button
      type="button"
      className="motion-toggle"
      aria-pressed={paused}
      onClick={() => setMotionPaused(!paused)}
    >
      <span className="motion-glyph" aria-hidden="true" data-paused={paused} />
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
};

export default MotionToggle;
