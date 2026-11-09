# Lytcher.dev

Personal portfolio of Luthfi Dhiya. React, TypeScript, Vite and Tailwind, run with Bun.

## Run

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # typecheck + production build into dist/
bun run lint
```

## Layout

- `DESIGN.md`: visual direction (identity, palette, type, scenes, motion)
- `ART.md`: every generated image, its prompt, and the asset standard (names, folders)
- `assets-src/<scene>/`: source art per scene (hero, about, arsenal, work, contact)
- `public/art/<scene>/`: web-ready art, generated from the sources by `scripts/build-art.sh`
- `src/data/`: page content
- `refrensi/`: reference videos
