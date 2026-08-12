# World Test Implementation Report

## Scope

`/world-test` is an independent Three.js Alpine scene. The existing homepage, knowledge base, gesture module, navigation, and content architecture remain in place.

## Source asset policy

- Read-only source: `C:\Users\mch\Desktop\Bob Ross -Nothern Lights- Scene -Animated\Bob Ross -Nothern Lights- Scene -Animated.blend`
- The original `.blend` was never modified, deleted, copied into Git, or loaded directly by the website.
- No useful Blender scene asset was deleted during the final pass.
- Earlier generated chunks remain recoverable in the workspace backup area.

## Restored Blender assets

- `Landscape`, `Landscape.001`, `Landscape.002`: three original mountain surfaces.
- `Landscape.003`, `Landscape.004`, `Landscape_plane`: original foreground terrain and lake.
- `Cube`, `Cube.001`: original cabin.
- 17 manually positioned hero trees restored from their Blender world transforms.
- 488 sampled instances restored from the original particle systems:
  - small pine trees from `Landscape.003`;
  - bushes and rocks from `Landscape.004`.
- Particle transforms are exported from Blender and converted from Z-up to Three.js Y-up; they are no longer randomly placed at `Y=0`.

## Runtime assets

```text
public/models/world-core.glb
public/models/mountain.glb
public/models/cabin.glb
public/models/hero-trees.glb
public/models/hero-tree-instances.json
public/models/foreground-prototypes.glb
public/models/foreground-instances.json
```

The active GLB payload is approximately 4 MB. Assets use 256px WebP textures, Draco compression, controlled decimation, staged loading, and `InstancedMesh` reuse.

## Reference-image translation

- Central mountain establishes the scene silhouette.
- Original lake is the central visual axis.
- Cabin remains in the lower-left foreground.
- Large pines frame both sides; small pines and bushes form the shoreline layer.
- Aurora was changed from a horizontal glow into vertical curtain-like strands.
- Snow uses foreground and background depth with a larger visible particle size.
- A continuous snow base and a gently displaced foreground snowbank connect the Blender terrain patches without deleting them.
- Editorial title scale was reduced so the landscape remains the primary subject.

## Interaction fixes

- Gesture panel is pointer-transparent except for its toggle button, so it no longer blocks Canvas dragging.
- Canvas uses `touch-action: none` and grab/grabbing cursor feedback.
- OrbitControls allow cinematic drag movement while limiting rotation to the authored front-facing scene range.
- A continuous snow base prevents a black void when the camera moves away from the exact Blender camera angle.

## Rendering fixes

- Removed the temporary road and rover from the Alpine fallback layer.
- Fixed Blender node-name normalization (`Circle.006` -> `Circle006`) for Three.js prototype lookup.
- Removed unused morph channels only from cloned instancing geometry; original GLB geometry and the `.blend` remain untouched.
- Corrected web-only snow and lake materials for the original scene lighting.
- Increased aurora and snowfall visibility while preserving reduced-motion behavior.

## Accessibility and performance

- Desktop DPR is capped at 1.5; low-power/mobile DPR is capped at 1.1.
- Low quality mode uses half of the restored instances and fewer snow particles.
- `prefers-reduced-motion` pauses aurora and snowfall motion and switches the Canvas to demand rendering.
- WebGL and missing-model fallbacks remain available.
- The procedural Alpine world now renders outside the GLB Suspense boundaries, so slow networks see mountains, lake, cabin, trees, aurora and snow immediately instead of a navy blank screen.
- Each GLB owns an independent Suspense boundary. Core terrain arrives first; cabin and hero trees follow; the 2.7 MB foreground detail layer is delayed on mobile/low-power devices without deleting it.

## Verification

- TypeScript: `npx tsc --noEmit` passes.
- Browser: scene loads, no Next.js runtime error overlay, restored trees render, aurora and snow render.
- Drag test: camera responds and the gesture panel does not block pointer movement.
- GitHub Pages production build: see the final command result for this pass.
