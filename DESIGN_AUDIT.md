# MCH Website — Visual Reset Audit

## Current structure

- Next.js 15 App Router with `/` and `/knowledge/` routes.
- Existing content remains in `src/data/`: profile, works, skills, articles, socials and knowledge data.
- Knowledge search, filters, accordion documents, localStorage uploads and private garden are client-side features that must remain intact.

## Previous visual problems

- Bright multi-colour section bands, heavy black strokes and toy-like rounded cards dominated the page.
- Cartoon creature, Toyism SVG symbols, dot patterns and stickers competed with the actual product/design work.
- Yellow pill navigation and tags made the page feel like a toy brand or game UI.
- Repeated cards flattened the information hierarchy and obscured the strongest content: work, systems thinking and writing.

## Reset direction

- Base: Off-white `#F1F0EB`, black `#111111`, muted text `#6A6A64`, one muted-red accent `#B64B45`.
- Ratio: 80% neutral canvas, 15% content/image colour, 5% accent.
- Typography, grid, whitespace, hairline rules and restrained motion do the hierarchy work.
- Square corners and small radii are allowed; pill UI, stickers, random dots and decorative Toyism symbols are removed.
- The homepage may operate as a spatial world: a low-poly map becomes the primary navigation layer while the professional editorial content remains directly below it.

## Reference application

- Aristide Benoist: primary Art Direction reference for scale, whitespace, work index and scroll narrative.
- Studio Feixen: Swiss grid, graphic composition and type contrast only; no cute/toy interpretation.
- Dennis Snellenberg: cursor, hover, pointer response and motion timing, kept quiet and precise.
- Bruno Simon: reserved for a future Lab/Experiment surface, not the core page.
- Bruno Simon (revised brief): applied to the homepage world map through exploration, a controllable object, spatial landmarks and pointer response; the visual system remains original and content-specific.

## What stays / what changes

### Stays

- Real content, route structure, data files, knowledge functions, fonts and static export setup.

### Changes

- Hero → typographic statement with MCH / year / role / location metadata.
- Navigation → transparent editorial bar with minimal mobile menu.
- Profile → editorial facts, long-form statement and method rows.
- Work → title-led indexed list with subtle hover state.
- Thinking, Capabilities and Contact → rules, numbering, whitespace and text hierarchy.
- Desktop-only custom cursor with VIEW/OPEN labels; disabled on touch and reduced-motion devices.

### Removed

- Cartoon character UI, Toyism SVG symbol system from layout, stickers, colour-band sections, heavy borders, rounded tags and toy-brand card surfaces.
