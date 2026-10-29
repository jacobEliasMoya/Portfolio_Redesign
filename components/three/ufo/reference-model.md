# Reference rebuild variant

Source: approved generated six-view concept at `docs/references/ufo-hexagonal-six-views.png`. Apply the repository `reference-3d-modeling` skill. This is a separate model, not a replacement for HexagonalUFO or ClassicUFO.

## Dimensional plan

Keep radius 2.23 / disc diameter 4.46 in existing model units. Shallow upper profile rises from .045 at rim to .43 below cockpit; underside falls from -.065 at rim to -.43 below engine. Canopy sill .47 / crown approximately 1.06. Upper plates are .43 wide and approximately .50 tall in their own tangent plane; lower plates .55 wide / .635 tall. Their six sides remain regular after scaling. Seeded depth and relief create overlapping steps instead of engraved seams.

## Construction and compatibility

`create-reference-ufo.mjs` builds 120 broad plates (72 upper / 48 lower), a sealed dark foundation, sixteen inset cyan rim lamps, polygon canopy/frame, three louvered vent wells and a recessed cyan hex-core engine. Static parts are batched by material within separate disc, cockpit and gear groups. Seventeen total batches / 15,588 triangles including hidden deployed gear; fifteen visible with gear retracted. No textures/downloads or new packages. Current and Classic source models remain unchanged. Existing +Z projectile origin, gear clearance, powered disc rotation, reduced motion, engine illumination and simple underside propulsion are retained by ReferenceUFO.

`UFOModel type="reference"` selects this variant. `/ufo` opens it and offers **Reference rebuild / Current hexagonal** comparison buttons; exit pilot mode before switching. The main scene still uses the existing default `hexagonal` model. The new model hides gear in inspection by default to match the six-view concept; flight receives the existing gear/power refs.

## Verification

`node --test scripts/test-reference-ufo.mjs scripts/test-hexagonal-ufo.mjs scripts/test-crash-pool.mjs` verifies finite buffers, deterministic broad plates, independent rotor/cockpit/gear, material batching and preserved original-model behavior. Recomputed new-canopy frame normals avoid nonfinite normals on clipped zero-length edge bars without changing the current model.

`node scripts/render-satellite.mjs docs/references/ufo-reference-rebuild ufo` exports this exact factory to Blender for six asset views. Inspect three-quarter silhouette plus top, side and underside before judging the match. Blender and browser reflections differ. Browser access remains blocked by saved permission; no runtime visual/FPS claim. This is a reference-led approximation, not a measured exact reconstruction: generated views have inconsistent plate boundaries and light counts. The new model preserves a coherent single layout across views.

## Refinement / next design study

Added a continuous beveled cockpit collar and dark gasket, reduced upper armor relief slightly, darkened the teal canopy, slimmed rim rails and recessed the lamp lenses further. Four targeted tests, lint and build passed. Exact offline views regenerated.

New built-in image-generation design study: docs/references/ufo-reference-rebuild/hex-design-evolution-options.png. Three explorations build on the current render and original six-view concept: round fitted-hex saucer, six-sector rounded saucer, and stronger angular perimeter. Generated polygon counts/surface topology are illustrative; enforce the intended six-sector construction in measured geometry. Await Jacob’s design preference before implementing the next revision. Current and previous UFO variants remain intact.
