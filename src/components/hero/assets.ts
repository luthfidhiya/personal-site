import { FRAME_COUNT, frameUrl } from "./samurai";

// The hero's still layers, as built by scripts/build-art.sh: name, small width, large width
const STILLS: [string, number, number][] = [
  ["moon", 640, 1280],
  ["cloud-1", 960, 1920],
  ["cloud-2", 960, 1920],
  ["ridge-far", 960, 1920],
  ["ridge-near", 960, 1920],
  ["branch", 960, 1920],
];

export const art = (name: string) => {
  const [, small, large] = STILLS.find(([n]) => n === name)!;
  return {
    src: `/art/hero/${name}-${large}.webp`,
    srcSet: `/art/hero/${name}-${small}.webp ${small}w, /art/hero/${name}-${large}.webp ${large}w`,
  };
};

/** Everything the hero shows before the visitor scrolls, for the loader to fetch first */
export const heroUrls = (narrow: boolean) => [
  ...STILLS.map(([name, small, large]) => `/art/hero/${name}-${narrow ? small : large}.webp`),
  ...Array.from({ length: FRAME_COUNT }, (_, i) => frameUrl(i, narrow)),
];
