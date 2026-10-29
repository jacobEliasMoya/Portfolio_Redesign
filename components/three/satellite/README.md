# Archive satellite

Reusable static Three.js asset rendered by `ArchiveSatellite`. The model factory is also consumed by the offline Blender QA exporter, so reviewed images contain the same geometry as the app.

## Reference and dimensions

Approved concept: `docs/references/satellite/hexagonal-archive-concept.png`. Body width 2.7, height 2.34, depth 1.28; complete wing span approximately 5.95 units. Main shell is a tapered six-sided loft, with surface-aligned panels and a closed rear. Wing cells, frame and dish all retain six-sided forms.

Front local +Z depth stack: housing cap .38; screen edge .43 / convex center .465; dark gasket center .46; outer bezel center .52 / lip .64. A ray from the front hits the screen before the body, confirming the display is visible through an actual opening.

`create-archive-satellite.mjs` batches static detail by material: 8 meshes, 8,168 triangles, one 256×256 RGBA display texture. The screen artwork is illustrative; it does not embed the earlier website. No animation loop, downloaded assets, postprocessing or runtime packages are required. `disposeArchiveSatellite` releases the owned resources, deduplicating the shared map/emissiveMap texture.

## Inspect and verify

- `/satellite`: orbit/zoom inspection plus front, side and rear presets, keyboard buttons and WebGL/error fallbacks.
- `node --test scripts/test-satellite-geometry.mjs scripts/test-satellite-model.mjs`: normals, finite buffers, open frame, solid housing/dish, screen depth, draw budget and texture disposal.
- `node scripts/render-satellite.mjs`: optional offline review using installed Blender. Set `BLENDER_EXECUTABLE` if needed. Exact model buffers, normals, UVs and texture are exported to a temporary folder; PNGs go into `docs/references/satellite`. Blender lighting/color management differs from the browser. This is asset inspection, not a WebGL performance or browser screenshot check.

A reference image should be checked against model renders before claiming a visual match. Build/lint alone do not prove fidelity. The optional personal `$reference-3d-modeling` skill captures this workflow. No live browser verification was possible during this revision because a saved permission blocks localhost access.
