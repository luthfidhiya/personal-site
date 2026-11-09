# DESIGN.md

Direction for Lytcher.dev, the personal portfolio of Luthfi Dhiya. Version 2: a rebuild
from scratch. What carries over from v1 is only the samurai theme, the red moon and the
name; everything else below is new.

References: `refrensi/` (two illustrated landing pages). Taken from them: scenes built
from layered paintings that move at different depths, and sections that flow into each
other with no visible seam. Not taken: their bright palettes.

## Identity

A samurai at night where almost nothing is lit. The page is shadow first; red is the
only light in the world, and it decides what the eye can see. Quiet, heavy, cinematic.

Dial: ENERGY 2 / RHYTHM 3 / MOTION 3

## Light rule

Every image and every surface follows one rule: shadow is the default, red is the light.

- 80 to 90 percent of each frame sits near black
- Forms are read from red rim light only (moon behind, blade glint, embers, lanterns)
- No white light, no blue, no daylight, no fill light. Skin and cloth stay in shadow
  except where red catches an edge
- Text is the only thing that is not red and not dark, so it always reads first

## Palette

- `--void` #050405: the base of every section
- `--shadow` #0e0a0c: one step up, for panels and the ink between layers
- `--blood` #c4121c: red fills (buttons, the moon disc, the seal)
- `--glow` #ff3b30: red as light (rim light, hover, focus rings, the cut). Used on text
  only at large sizes
- `--paper` #e6ddd0: main text
- `--smoke` #8f877c: secondary text

## Typography

- Zen Antique for headings: a heavy old-style mincho with real ink weight, so a title
  holds its own against a near-black painting
- Hanken Grotesk for body: plain and narrow enough to sit in the dark gaps of a scene

## Copy

Until the owner writes the real text, the site uses template copy. Every template line is
marked `[TEMPLATE]` in `src/data/` so it cannot ship as if it were final. Facts that are
already real (name, role, location, the tools list) stay as they are.

## Structure

Five scenes, one continuous descent through the night. Each scene has its own composition,
so no two sections share a layout.

| # | Section | Scene | Composition |
|---|---|---|---|
| 1 | Hero | The samurai under the red moon | Close-up: samurai from the waist up fills the right half, cut off by the right and bottom edges. Name on the left. Scrolling plays his draw and cut |
| 2 | About | The falls | Wide: a tiny lone figure by a waterfall that glows red from the moon. Words take the dark sky |
| 3 | Arsenal | The weapon rack | Object close-up: blades on a rack, each edge catching red. The tools list sits beside it like an inventory |
| 4 | Work | The dojo | Interior: lantern-lit floor, projects as a hand of cards turned over when picked |
| 5 | Contact | The gate | A torii against the moon, the samurai walking toward it from behind. Footer below |

Navigation: mark left, four stops right, Contact outlined. On phones the stops move to a
bar along the bottom.

## Seamless descent

No section ever ends in a flat band of black. Between two scenes:

1. **Overlap**: the next scene's back layer is already in place behind the current one,
   and the two crossfade with scroll
2. **Foreground sweep**: the current scene's front layer (grass, rock, beam) rises faster
   than the rest and wipes across the screen, revealing the next scene behind it
3. **One atmosphere**: embers and drifting smoke run across every boundary in a single
   fixed layer
4. **Matched edges in the art**: every painting ends at the bottom in dark ground or mist,
   and starts at the top in dark sky, at the same value as its neighbours

Scrolling is smoothed (Lenis) so the layers glide instead of stepping.

## The samurai

One character design, made fresh for v2 (the v1 ronin is not reused): wide straw hat,
dark kimono, long red scarf, face lost in the hat's shadow.

The hero animation is a scroll-scrubbed image sequence: a Veo clip of the draw and cut,
48 to 60 frames, keyed and drawn to a canvas. The hero is pinned for 120 to 150svh, so a
new frame arrives every 15 to 25px of scroll.

## Imagery

Generated art (personal use). Sources in `assets-src/<scene>/`, committed so they move between
devices, prompts in
`ART.md`, web versions in `public/art/`. Each scene is built from components, one image
per element (moon, clouds, each ridge, figure, foreground), assembled in code so every
element moves at its own depth. Solid components are generated on flat chroma green and
keyed; glowing ones on black and blended. Light itself (sky gradient, glow, mist, shafts,
embers) is made in code, not painted.

## Motion

- Layers move against the scroll at different speeds (far slow, near fast)
- Small living details only where they make sense: the falls run, lanterns flicker,
  the scarf moves, embers rise
- Text enters with a short fade and rise, once
- Pause motion control in the footer. Under `prefers-reduced-motion`, nothing is pinned
  or scrubbed, and every scene is its still painting
