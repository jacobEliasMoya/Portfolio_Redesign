# Change log

## 2026-10-29 — Matte black hole and wide-disc lensing variant

- Save the design studies and corrected hex-paneled sphere reference; build a matte-black geodesic shell with sealed backing and smaller instanced accretion fragments.
- Add /black-hole inspection, camera presets, differential fast-to-slow orbits, pause/resume and reduced motion. Keep the Earth scene separate.
- Preserve Version 1; add Version 2 with a wider seven-band disc, comparison controls and an optional secondary-disc lens image around the opaque core.
- Replace smeared viewing-camera distortion with a clear orthographic disc atlas. Map it into upper/lower secondary arcs and filter cool graphite reflections from the lens image to address the reported edge-on blue artifact.
- Extend offline asset review for both versions, preserve per-instance tint, batch repeated export geometry and fix repeated color-buffer allocation / relative output paths.

Validation: all 129 scene tests pass. Full ESLint and production build passed after the final shader change. Offline model geometry reviewed; current WebGL lens appearance and GPU cost still require user/device review. No main-scene integration or physical gravity simulation included.

## 2026-10-29 — UFO Version 3, suspension and independent dragging

- Build Version 3 from the selected angular design: six-sided hull, fitted beveled armor, six rim lights, hex canopy collar, engine and vent wells. Retain previous UFO versions and the main-scene default; add Version 3 to /ufo comparison controls.
- Refine the reference rebuild's canopy collar, armor relief, glass and rim fittings; save the design study and six exact-model renders for each revision.
- Add coordinated landing suspension: planted feet, damped touchdown compression/rebound, parked load and a prelaunch crouch/unload. Landing finishes after settling; reduced motion skips the bounce. Add Test landing gear to /ufo.
- Add nearest-object drag ownership for Earth, Moon and lettering. Moon rotates independently within its existing orbit; text slides along its current orbit and resumes automatic travel on release. Preserve pilot controls and touch/capture cancellation.

Validation: all 122 scene tests, ESLint and production build pass. Offline model views inspected. Agent browser interaction review remains unavailable under the saved localhost permission; motion feel still needs user review.

## 2026-10-29 — Separate UFO reference rebuild

- Build an independent reference UFO using the reference-3d-modeling workflow and the approved six-view design: broad stepped hex plates, shallow disc, cyan light belt, faceted canopy and recessed underside engine/vents.
- Preserve the current hexagonal and Classic models and the main-scene default. Add Reference rebuild / Current hexagonal comparison controls to /ufo.
- Retain power, rotating-disc, gear and projectile conventions. Batch 120 plates and other static geometry within separate disc, cockpit and gear groups.
- Extend the offline exact-model renderer with six UFO views and save the renders with model dimensions and verification notes.

Validation: seven relevant geometry/crash tests, ESLint and production build pass. Offline renders inspected; browser visual review remains unavailable to the agent under the saved permission setting.

## 2026-10-29 — Flight, lunar landing and archive satellite checkpoint

- Add the approved hexagonal UFO, keyboard flight, chase camera, hull clearance, charged plasma weapons, terrain impacts, tile damage and irregular planet/text destruction.
- Add the survey-based hexagonal Moon, tidal lock, lunar collisions, drift after Earth destruction and grayscale lunar impact effects.
- Build the lunar landing pad, retracting approach beacons, gear, camera-gated takeoff, smooth control handoff and guided L-to-land/relaunch. Landing requires five-unit range and a 45-degree approach cone.
- Add the Sabo JM lunar flag with continuous gentle ripple and stronger launch wash. Add a more metallic disc finish and restrained engine-driven underside rings; remove the rejected motion-reactive trails.
- Add procedural stars, wider text orbit, flat-first Jakes Space formation, cloud cleanup/drift and a nonpilot scroll camera path.
- Pool ship crash geometry/sparks, prepare collision indices incrementally, cap/adapt render resolution and index shared hex geometry without reducing faces. CPU measurements and browser-profiling limits are recorded in docs/performance.md.
- Build and visually approve the archive satellite: tapered six-sided body, recessed curved display, solar wings, dish, vents and JM badge. Static model uses eight material batches / 8,168 triangles and one small display texture.
- Add /moon, /ufo and /satellite inspection routes; save approved concepts and exact-model Blender review images with a repeatable offline rendering script.
- Preserve the reference-3d-modeling workflow in .agents/skills so it travels with the repository; retain the installed personal copy.

Validation: all 110 automated tests, ESLint and production build pass. Jacob approved the final satellite visually. Offline Blender images verify model geometry; agent browser inspection and device FPS profiling remain unavailable under the saved localhost permission. The satellite display is still illustrative; original-site integration and main-scene placement remain future work. This is a source checkpoint, with no deployment changes.

## 2026-10-28 — Interactive block Earth checkpoint

- Replace the root foundation preview with a full-window black 3D scene and bottom loading bar; retain /studio and add /earth for inspection.
- Build the Sabo particle lettering through successive JM/Jake/JakeSpace experiments into one curved **loading jakes world** formation.
- Add hidden-before-formation particles, overlapping convergence starts, soft radial pulses, local magnetic attraction and a clockwise text orbit.
- Replace cursor-following text tilt with choreographed perspective camera moves, gentle easing and the wide-lens test.
- Generate a varied-size block Earth from NASA color/elevation rasters, with stepped mountain relief, explicit ocean data and traveling water ripples.
- Add free Earth drag, a tilted geographic axis and slow idle rotation, independent of the camera and text.
- Generate Earth turnaround and cloud concept references; build reusable cube-cloud variations and place 24 small low-altitude patches with peak intersections.
- Explore and remove FluidKit backdrop/atmosphere approaches; no fluid dependency remains.
- Maintain reduced motion, error/retry handling, asset provenance, instanced rendering and automated geometry/motion checks.
- Record the active settings in docs/current-scene.md and preserve exploratory refinements in the existing architecture/working agreement documents.

Validation: production build, ESLint and 27 automated tests. Browser visual/device validation remains outstanding. This checkpoint is source control only; no deployment was requested.


### Black-hole UFO consumption preview
- Added a replayable proximity test: Version 3 UFO peels apart in original armor/mechanical fragments, spirals inward and vanishes into the core.
- Retained batched rendering, cached geometry, original UFO defaults and the approved lensing; excluded the craft from the disc atlas.
- Added reset, shared pause, reduced-motion behavior and proximity/geometry regression tests.


### Earth and Moon consumption tests
- Added UFO / Earth / Moon selection to the black-hole preview with shared send, replay, reset and pause controls.
- Reused original planet hex tiles and colors in one surface draw per target; GPU consumption leaves instance buffers static. Added receding solid backing and regression coverage.


### Planet consumption stream refinement
- Replaced uniform detached-shell motion with seeded acceleration, independent tile tumble, and a narrow curved particle stream that forms immediately after detachment.
- Kept GPU instancing, deterministic replay, existing colors and UFO behavior. Added continuity and stream-convergence checks.
