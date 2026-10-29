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
