## Lower pad with level default and Moon-relative rotation - 2026-10-30

Jacob clarified that level refers to the initial/default pose, not continuous stabilization. Reduced pad height from1.14 to.98 model units and shortened supports from.6 to.4, preserving their foundation anchoring. Body bottom is.90, clearing the highest undamaged lunar facets (about.879).

initializeLunarPad now captures a level default pose once after reveal has a valid transform, before the ship's first landing/launch sample. Position and quaternion are then retained in Moon-local space: orbit, drag and rotation naturally move the complete platform, its lights and supports. Removed per-frame counter-rotation/repositioning. Default horizontal heading, scale.8, spacecraft landing/launch and existing beacons remain.

Verification:209 full regression tests, lint and production build pass. Updated tests verify initial leveling, unchanged local attachment under subsequent Moon rotation, expected world motion and landing approach normal, reveal-zero safety and lowered terrain/support clearance. Live browser/device review remains pending under the existing access restriction. User requested committing and pushing this correction.

## Raised platform and pointer-responsive flag - 2026-10-30

Pad height1.14 (previously.91), scale.8, three hex supports reaching the lunar foundation. Pad follows the Moon center but stays parallel to scene XZ, preserving projected heading. Pose updates after Moon transforms and before ship landing/launch sampling; zero-scale reveal is guarded. Flag hover adds bounded local fabric movement with shared cloth/stripe/letter deformation, damped entry/exit, blur cleanup and reduced-motion handling. See docs/current-scene.md for validation and browser limitations.

## Irregular sculpted Moon, rendered HUD icons and direct Sabo — 2026-10-30

Moon now follows the approved crater reference while retaining the chunky hex/voxel family. User explicitly rejected an overly tidy/smooth result: final layout has3242 fitted cells (3230 hexagons/12 pentagons), deterministic slight irregularity, independently lifted caps and narrow seams. Seventeen broad sculpted bowls/rims coexist with12x actual LOLA topographic relief. LROC-derived colors restore cool dark-gray basins, warmer pale highlands and per-facet variation; artistic crater depths/placements are labeled as artistic. Earth source/model is unchanged.

Version3 block-moon.json includes fitted corner positions and per-cell dimensions. New lunar-facet-geometry.mjs maps those boundaries onto one instanced terrain batch, keeps cap normals faceted, composes the impact-heat shader and preserves existing damage/ejected pieces. Deeper.64 foundation remains below all crater floors; continuous sealed16384-triangle skin fills the seams. Orbit/size/tidal-lock/gravity props, pad/flag and12-damage destruction threshold remain. Offline generator now requires Pillow only at development time; no runtime package added. Reference and front/three-quarter/side/rear renders live in docs/references/moon/sculpted-craters-review.

# Survey Moon and tidal lock

`BlockMoon` is the reusable static lunar surface in `components/three/moon/`; `OrbitingMoon` adds a synchronous orbit around a supplied Earth center. No new npm packages.

## Terrain

- Source: NASA SVS CGI Moon Kit LROC albedo and LOLA `ldem_4_uint.tif`, saved under docs/references/moon/. Read the source README for credits and coordinate/units documentation.
- Offline generator: `python scripts/generate-moon.py` (Pillow required only in development).
- Unsigned sample conversion: `elevation_metres = sample * 0.5 - 10000` relative to a 1,737,400 m reference radius.
- Model reference radius: 0.82 local units. Apply one global 16x relief exaggeration; negative heights remain recessed. Geometry is surveyed relief, not albedo-derived noise or invented crater rings.
- Six cube-sphere patches with adaptive subdivisions where surveyed elevations vary. 16,941 instances; runtime asset public/models/moon/block-moon.json, around 1.55 MB uncompressed.
- Reuse the shared beveled hexagonal prism construction, tangent overlap 1.4x and radial depth 1.5x. An opaque inner sphere at local radius 0.70 seals the interior below crater lows. Matte charcoal/gray albedo is independent of elevation.
- Four-pixels-per-degree DEM supports stylized large features; tiny craters in the concept artwork cannot be faithfully resolved at this geometry/source resolution. The source is actual 16-bit survey data, not the 8-bit preview.

## Orbit

- World center defaults to Earth [0, 0.35, -9]. Both bodies respond to the same responsive Earth radius.
- Moon display radius = Earth radius * 0.273. Orbit distance = Earth radius * 2.8 + Moon radius. The size ratio is approximately real; the distance is deliberately compressed for the composition.
- Period: 150 seconds. An 18-degree inclined, -12-degree-node presentation orbit is an artistic choice, not a precise lunar ephemeris.
- Orbital phase drives both center position and local Y yaw (`yaw = phase + pi`). The map's local +Z/zero-longitude near-side face always points at Earth, including after orbital-plane rotation. This produces one axial turn per orbit, not a Moon frozen in world orientation.
- Moon orbit is a sibling of Earth, so free Earth dragging/idle spin does not drag the Moon out of its orbit or break the lock.
- The Moon scales in after Earth reveals. Its asset participates in Drei loading progress; failure is handled by the existing scene boundary/retry UI.
- Reduced motion freezes orbital time but retains the same Earth-facing orientation.

Inspect `/moon` for six fixed views, orbit controls and zoom. The main scene includes the orbiting companion automatically.

Run `npm run test:moon` to check signed elevation decoding, spherical coverage, constant orbit distance and near-side orientation across a full inclined revolution. Browser visual/device performance validation remains outstanding.

Moon quality revision: the first 16,941-block model was rejected as too coarse. Version-2 lunar data has 47,271 finer adaptive hexagonal tiles, thinner radial caps (0.55x depth, 1.32x tangent overlap), stronger actual-albedo maria/highland contrast, restrained elevation-neighborhood cavity shading and one global 24x relief exaggeration. Add a 256x128 continuous survey-displaced, vertex-colored skin just beneath the tiles so crater bowls remain cohesive between caps; pole samples collapse to one longitude to avoid pinched geometry. This replaces the constant-radius-only foundation as the visible gap filler. Keep the tidal-lock orbit unchanged. Preview lighting is more directional to reveal relief. No visual verification claim until browser review. Supersedes earlier 16x/16,941-instance values.

Moon readability/coverage correction: user rejected the tiny-tile version and reported see-through areas. Use one 44x44-per-face sampling level (11,616 tiles), clamp base widths to 0.030–0.046, remove adaptive microtiles, increase tangent overlap to 1.65x and radial depth to 1.15x. Keep the detailed continuous survey skin for crater relief; render it opaque and double-sided, with a brighter neutral opaque interior foundation. Preserve lunar data, 24x relief and tidal lock. Ray tests check that the skin blocks background sightlines from 300 directions. Supersedes the 47,271 thin-cap setup.

Planet destruction threshold: Earth explodes after 20 projectile impacts, Moon after 12; shared PLANET_HITS constants live in planet-explosion.mjs. Count one consumed impact per shot, including repeated dented tiles/foundation hits. On threshold, stop further collisions, briefly swell/warm for 0.25 seconds, then reuse existing instance matrices for a deterministic radial burst and 2.5-second fade/shrink. Hide solid foundations/skin and Earth clouds during the burst; no extra per-tile meshes/lights. Disable Earth flight collision and camera avoidance once destruction starts. Source maps/assets remain untouched; reload restores the scene. Reduced motion hides the destroyed planet without a flying-debris burst. No automatic planet respawn or gravity simulation.

Lunar tile readability: Moon impacts now eject the actual hit hexagonal instances outward, tumble/fade them, and permanently remove those instances for the session. Darken the continuous lunar survey skin beneath each hit to make exposed impact scars visible; retain sealed geometry rather than opening see-through holes. Use radial lunar-local debris directions and restrained speed; animate debris only before the full Moon explosion begins. The 12-hit threshold, red heartbeat/core and whole-Moon breakup remain. Reduced motion skips flying fragments.

Earth-loss Moon motion: keep the tidal-locked inclined orbit while Earth exists. At Earth exploding/gone, release the Moon once from its current orbital pose, retaining the analytic tangent velocity. Continue straight-line inertial motion without acceleration or drag; add slow three-axis tumbling and stop forcing its near side toward Earth. Existing lunar damage/full explosion behavior remains available. Reduced motion freezes automatic drift/tumble; reload restores orbit. This is a stylized loss-of-gravity transition, not an N-body simulation.


### Optional whole-body breakup (2026-10-30)

BlockMoon / OrbitingMoon accepts `explosionsEnabled`, defaulting to `false`. Opt in with `explosionsEnabled={true}` to restore the existing hit-threshold explosion. Craters, scorch/heat and local impact effects stay enabled. Changing the prop updates the existing impact target without clearing its damage. It gates future triggers and does not rewind an already-started breakup. OrbitingMoon forwards the flag to its BlockMoon.
