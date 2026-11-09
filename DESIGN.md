# DESIGN.md

Direction for Lytcher.dev, the personal portfolio of Luthfi Dhiya.

## Identity

Anime samurai at night: dark ink, one blood-red moon. The site should feel like
the opening frames of a samurai anime, quiet and heavy, with red used only where
a blade would catch the light.

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3

## Palette

- `--bg` #0c0a0d: night ink, the base of every section (owner asked for a dark background)
- `--surface` #16121a: one step up, for panels that sit on the ink
- `--bone` #ece3d3: main text, warm like aged paper instead of pure white
- `--ash` #a39a8c: secondary text
- `--red` #ef3b44 (text on dark) and `--red-deep` #c8202a (fills): the single accent

Red appears on: the moon-disc section marks, primary buttons, link hover, focus rings.
Nowhere else.

## Typography

- Shippori Mincho B1 for headings: a brush-like mincho that carries the Japanese tone
- Outfit for body: a plain geometric sans that stays readable next to the ornate mincho

## Motif

A red disc with a kanji numeral inside (壱 弐 参 肆), echoing the red moon that
appears in every illustration. Used as section marks and in the logo.


## Structure

One continuous descent through a painted night, in the spirit of an illustrated game
landing page: each section is a scene, joined to the next by ink at the edges. Titles
sit on the left (or wherever the painting leaves sky), with a small kanji kicker above.

- **The peak (hero)**: pinned while the visitor scrolls. A living sky (blood moon, snow
  peak, pagoda) behind the name; the ronin on his rock in the right third. Scrolling plays
  his kata key frame by key frame and ends in the cut, which splits the world.
- **About, "Stillness"**: the falls. The ronin kneels by the pool; the words take the sky.
- **Arsenal, "Steel"**: the bamboo grove with the crouching shinobi; tools on a rack.
- **Work, "Kata"**: the dojo. Projects are a hand of cards: the chosen one face up, its
  neighbours face down (crossed blades over the moon), turned over when picked.
- **Contact, "The gate"**: travellers walking to a torii under the moon; footer with the
  motion control.

Navigation: a quiet top bar (mark left, four stops right, Contact outlined); on phones the
stops move to a bar along the bottom.

## The ronin

Six key frames generated in one Gemini conversation so the character stays the same
(stand, grip and draw, nukitsuke, blade up, raised, the cut), each on a flat chroma green,
keyed out and cropped to one shared box so they swap in place. Scroll moves through them
anime-style: each frame is mostly held, with a short blend and a directional smear
between; the cut adds a flash and a camera shake. He is darkened against the bright sky,
rimmed in red, and stands in a red aura that breathes and swells as he gathers himself.
The cut's line leaves his blade tip along the red arc in the cut frame.

## Imagery

Generated art (personal use): Magnific (Freepik) free plan for the sky and the falls,
Gemini (Nano Banana / Veo) for everything else. Sources live in `assets-src/ai/`
(gitignored); web versions in `public/art/`, made by a PIL script (crop the Gemini mark,
key the green, WebP in two sizes).

| File | Scene | Source |
|---|---|---|
| sky, hero-sky.mp4 | The peak | Magnific image, animated with Veo |
| ronin-0..5 | The peak | Gemini, chroma key |
| about | About | Magnific |
| arsenal, work, contact | Arsenal, Work, Contact | Gemini, style-matched to the about image |

## Motion

- **Scroll as camera** (reverses on scroll up): the name recedes into depth and blur, the
  sky reddens and presses closer, the kata plays, the world splits along the cut
- **Living paintings** (WebGL cinemagraph, `LivingPainting.tsx`): only chosen regions
  move. The falls stream and the pool ripples; bamboo and grass bend in the wind while the
  figures hold still; lanterns flicker; the moon breathes; mist drifts; embers rise and
  fireflies wander. Runs only while its scene is on screen
- **Living sky**: a looping Veo clip over the still sky painting, both halves kept on the
  same frame so the cut line never shows two moments
- **Atmosphere** (WebGL): embers and ash blown by scrolling and pushed by the cursor
- **Pointer**: on the title, sky and ronin shift against the cursor by different amounts
- Cards turn over (rotateY) when a project is picked
- Everything that moves on its own (sky clip, paintings, aura, embers) stops with the
  footer's "Pause motion". Under `prefers-reduced-motion` none of it starts, nothing is
  scrubbed or pinned, and every scene is its still painting
