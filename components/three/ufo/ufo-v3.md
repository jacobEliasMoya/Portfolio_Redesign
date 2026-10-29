# Version 3 — angular UFO

Chosen design: option 3 in docs/references/ufo-reference-rebuild/hex-design-evolution-options.png. Uses the reference-3d-modeling workflow. The generated drawing has inconsistent perimeter edge counts across views; the implemented asset follows the established six-sided design language with a true six-sided plan and modest bevels.

## Proportions and construction

Hull corner radius 2.23; six flat faces with apothem approximately 1.93. Top rises from .10 at the edge to .48 centrally; bottom rises from -.39 centrally to -.13 at the edge. Canopy matches the earlier faceted teal dome, mounted within a six-sided silver collar and dark inner gasket. Weapon faces local +Z and retains the existing forward projectile convention. Gear retains the existing local -1.1275 foot height and ref-driven retraction.

`ufo-v3-geometry.mjs` clips a regular hex grid against the hull boundary and subtracts the canopy / engine / three vent openings. Fully outside cells are retained whole, preventing spurious cutting seams. Small partial pieces at boundaries complete the surface. Panels have a narrow reveal and beveled caps, conforming to the shallow surface profile. Opaque foundation closes all background sightlines.

`create-ufo-v3.mjs` builds the model independently: six inset rim lights, faceted rails and belt, hexagonal central engine and three hex vent wells. Static geometry is batched by material inside independent disc, cockpit and gear groups. Current statistics: 174 panel pieces (90 upper), 17 total material batches / 11,986 triangles including gear, 15 visible batches with gear hidden. No textures, dependencies, postprocessing or per-vertex animation added.

## Access and preservation

UFOModel type `v3`; UFOV3 drives rotation, engine power, hover and gear through the existing animation conventions. /ufo opens Version 3 and retains Reference rebuild / Current hexagonal comparison buttons. Exit pilot to change versions. Previous model components and main-scene default are preserved.

## Review

`node --test scripts/test-ufo-v3.mjs scripts/test-reference-ufo.mjs scripts/test-hexagonal-ufo.mjs` validates deterministic layout, cavity clearance, outward foundation faces, finite geometry and independent groups. Lint/build passed. Exact model rendered and inspected from three-quarter, underside and side views; all six views saved in docs/references/ufo-v3. Regenerate with `node scripts/render-satellite.mjs docs/references/ufo-v3 ufo-v3` using installed Blender.

Offline material/light response differs from WebGL; browser inspection remains blocked by saved localhost permission. No claim of frame-rate measurement or exact image reconstruction. No automatic commit or main-scene replacement included.
