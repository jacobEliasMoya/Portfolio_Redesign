# Change log

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
