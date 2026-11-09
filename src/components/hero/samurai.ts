// The samurai's draw as an image sequence (public/art/hero/samurai, made by
// scripts/build-art.sh). Frames are full 1920x1080 video frames, so they line up.

export const FRAME_COUNT = 60;
const FRAME_W = 1920;
const FRAME_H = 1080;
/** Horizontal centre of his body inside the video frame */
const BODY_X = 0.49;

export const frameUrl = (i: number, small: boolean) =>
  `/art/hero/samurai/${small ? "960/" : ""}${String(i).padStart(3, "0")}.webp`;

/** Loads every frame; the array fills in as they arrive */
export const loadFrames = (small: boolean, onFirst: () => void) => {
  const frames: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.decoding = "async";
    img.src = frameUrl(i, small);
    img.onload = () => {
      frames[i] = img;
      if (i === 0) onFirst();
    };
  }
  return frames;
};

/** Nearest loaded frame to i, so a slow connection shows a close pose rather than nothing */
const nearest = (frames: (HTMLImageElement | undefined)[], i: number) => {
  for (let d = 0; d < FRAME_COUNT; d++) {
    const img = frames[i - d] ?? frames[i + d];
    if (img) return img;
  }
  return undefined;
};

/**
 * Draws frame i, bottom-anchored so his waist cut sits under the near ridge, with his body
 * at `bodyAt` of the canvas width. `scale` is his height relative to the canvas height.
 */
export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  frames: (HTMLImageElement | undefined)[],
  i: number,
  bodyAt: number,
  scale: number,
) => {
  const img = nearest(frames, i);
  const { width: w, height: h } = ctx.canvas;
  ctx.clearRect(0, 0, w, h);
  if (!img) return;
  const s = (h * scale) / FRAME_H;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, w * bodyAt - FRAME_W * BODY_X * s, h - FRAME_H * s, FRAME_W * s, FRAME_H * s);
};
