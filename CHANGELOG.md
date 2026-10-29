Opening camera restored: tour progress0 is a fixed Overview at [0,0,22], aimed at [0,.35,-9], matching the original pre-tour camera. It stays there through loading and after readiness until scroll/Next advances to Jake, Space, California and Moon. Back/reset return to Overview. Tour button stepping is gated on readiness like wheel input. Wide landmark views remain. Four tour tests cover stationary opening despite moving landmarks, forward/reverse stops and path clearance; full lint/build pass. Live animation framing still awaits visual review.

Tour refinement: stops are now Jake -> Space -> California -> Moon. Jake and Space have separate word-center anchors that follow text orbit/drag; wide camera distance is preserved. TOUR_STOPS is an ordered key/label list with automatically distributed progress and generic sampling, so future text/place anchors can be inserted without rewriting segment interpolation. New anchors must also be supplied/updated from their scene objects. Three focused tour tests and full lint pass; production build passes. Live framing remains unverified.

Tour and projectile gravity update (2026-10-29): non-pilot scroll now visits Jake, California and Moon, with Back/Next selecting those stops. Targets follow the moving text, rotating Earth and orbiting Moon. Camera stand-off is max(22, EarthRadius*3.8) world units to preserve the earlier wide view; spherical travel and body clearance avoid crossing terrain. Live camera framing still needs visual review.

Earth, BlockMoon/OrbitingMoon and BlackHole/BlackHoleV2 expose gravity=true and gravityPower=1 by default. Set gravity=false to disable a model, gravityPower=0 for no pull, or e.g. gravityPower=1.5 for stronger pull. Softened inverse-square fields follow model world transforms and skip hidden/destroyed planets; total acceleration is bounded at80. Fired bolts use 120Hz maximum integration steps and swept collision checks along each curved segment. Existing damage and charge behavior remain. All166 tests pass, including gravity strength/toggles, frame-rate consistency and collision checks.

# Change log

## 2026-10-29 — Softer chase-camera banking

- Reduce orientation-follow damping from8 to4 so bank/roll transitions build and settle more gently, matching the camera's positional follow. Preserve ship response, full rolls, inverted recovery and reduced motion.
- Six camera tests and targeted lint pass.

## 2026-10-29 — Memory audit, local flight axes and rolling chase camera

- Close the rim-plasma instanced-buffer cleanup gap; explicitly dispose both owned meshes and deduplicate shared resources. Skip idle effect uploads and reuse projectile target/flight/camera scratch storage.
- Add a repeatable lifecycle audit across nine model/effect factories. Ninety measured cycles release all1590 tracked resources exactly once; settled forced GC shows zero retained typed-array buffer growth. Browser/GPU profiling remains outside this audit.
- Remap Q/E from strafe to full rolls, make all steering/translation ship-relative using a normalized orientation quaternion, and align chase-camera up/boom with the craft. Preserve full lunar launch attitude, safe camera clearance and exploration's upright view.
- Add inverted/sideways flight, arbitrary scene-rotation equivalence, camera recovery, idle-effect and resource disposal regressions. All161 tests and production build pass; lint warning fixed and rechecked.

## 2026-10-29 — More space between Earth and Moon

- Increase orbit distance from EarthRadius*2.8 + MoonRadius to EarthRadius*3.6 + MoonRadius (about26% farther center-to-center and44% more surface gap).
- Preserve Moon size,100-second orbital period, tidal lock, inclination and pad/flag attachment. Fifteen relevant tests, targeted lint and production build pass.

## 2026-10-29 — Smooth rim-plasma direction changes

- Ease each emitter's orientation along the shortest rotation arc when adding/reversing steering, lift or other controls. Use the eased axis for both lobe orientation and pulse offsets.
- Soften ignition/fade to blend port transfers. Keep flight response unchanged and direct input under reduced motion.
- Five focused propulsion tests pass, including monotonic convergence, no initial snap, normalized rotation and 30/60Hz equivalence. Targeted lint and production build pass; live feel remains user-review dependent.

## 2026-10-29 — Broad directional rim plasma

- Add cyan-blue plasma bursts with white cores to the angular UFO's actual six rim emitters, driven by thrust/reverse, strafe, turning, lift/pitch and velocity-opposing braking. Keep existing takeoff rings and flight physics.
- Use broad tapered 3D lobes and three overlapping pulses per emitter, damp ignition/shutdown and omit coast-only trails. Static input response under reduced motion; suppress directional drive during parked/launch/landing states.
- Reuse two instanced batches, exclude effects from crash pooling and dispose owned resources. No new lights, textures or packages.

Validation: all151 tests, targeted lint after the render-resource correction, and final production build pass. Actual rim alignment checked by ray tests. Browser shader/visual review remains pending.

## 2026-10-29 — Circular bearing around rotating cockpit

- Replace angular V3's hexagonal collar/gasket with circular profiled rings and clip surrounding armor to a circular opening. Allow clearance for the entire rotating faceted frame rather than only its initial pose.
- Lower the cockpit floor below the glass sill. Preserve dome geometry/rotation, outer hull, weapon and other model variants, sharing the existing material batches.
- All147 tests, lint and production build pass. New actual-geometry regression samples the gasket in 96 directions and checks dome sweep/armor clearance. Save and inspect exact-model offline views; live motion review remains pending.

## 2026-10-29 — Rotating cannon focusing jaws

- Add .9rad/s forward-axis rotation to the shared three-jaw cannon on every UFO. Preserve fixed mounting saddle, recessed aperture and muzzle/charge/bolt alignment. Respect reduced motion and use delta-based group transforms.
- Separate only jaws and energy accents into two material batches, retaining existing geometry and crash/black-hole consumption data. Material disposal deduplicates shared cannon resources.
- All146 tests pass, including multiple-turn muzzle invariance, fixed forward axis, 30/60Hz equivalence and reduced-motion freeze. Live animation review remains pending.

## 2026-10-29 — Shared extended cannon and rotating angular dome

- Extend the alien cannon forward by .16 model units, retaining a hull-embedded saddle, and apply the same geometry and muzzle convention to Classic, Hexagonal, Reference and V3. Preserve charging appearance, blaster shots and damage. Add Classic to the inspection selector.
- Move V3 glass and dome frame into an independent dome group; drive that group at 2.34 radians/second with the existing engine ramp/reduced-motion freeze. Keep its outer hull, vents, lights, cannon and gear steady.
- Keep vents attached to the hull. Update multi-angle regression to verify hull/vent alignment independently of dome rotation, with a focused ray query that avoids hidden landing-gear hits.
- Save updated V3/reference exact-model renders; preserve and present the original classic/hexagonal/evolution concept sheets for design discussion.

Validation: all 145 scene tests, full lint and production build pass; Classic selector also passes targeted lint and the final build. Browser visual/motion review remains pending; offline renders validate model geometry only.

## 2026-10-29 — Underside vents follow the spinning disc

- Move V3's three vent housings, dark wells and louvers from the fixed cockpit batch into the rotating disc so they stay aligned with their armor openings. Preserve fixed landing gear and cannon.
- Add a regression that ray-checks all three louvers at multiple disc angles and confirms gear does not inherit rotor rotation. Full lint and production build pass.

## 2026-10-29 — Integrated alien cannon

- Replace V3's perched barrel with a low-mounted hex saddle, recessed cyan aperture and three swept focusing jaws. Keep the emitter fixed as armor rotates.
- Share a V3 muzzle position for charge and bolt placement; preserve charge appearance, projectile damage and other UFO variants.
- Batch into existing materials: 17 total draws / 12,394 triangles. Save six exact-model review views, checking front/side/rear/three-quarter. Adapt offline rendering to Blender 5's renamed Eevee identifier while retaining Blender 4 support.

Validation: all 143 tests, full lint and production build pass. New ray test checks the recessed aperture, clear forward muzzle and independence from rotating disc. Offline renders verify geometry; live browser appearance remains pending.

## 2026-10-29 — Earth survives multiple charged shots

- Increase Earth durability from 20 to 60 damage: three full-charge shots instead of one, keeping visible accumulated dents/scorch between hits. Moon remains at 12; bolt damage, charging and breakup timing remain unchanged.
- Read durability from shared constants in the flight manual and distinguish projectile damage from planet durability.
- Nineteen targeted collision/explosion tests pass, including repeat full-charge hits on already-dented Earth and unchanged lunar behavior.

## 2026-10-29 — Crisp fired blaster bolts

- Replace fired teardrop plasma with a slim cyan blaster pulse, rounded leading cap, narrow white core and short fading rear taper. Charged shots are moderately thicker/longer with a restrained violet edge.
- Remove traveling-bolt wobble/breathing; keep the existing compact charging orb, its filament shader and charge pulse unchanged. Firing, velocity, damage, swept collisions, pooling and impact bursts retain their existing behavior.
- Reuse the existing projectile batches; no textures, lights, packages or additional draws.

Validation: all 142 scene tests, changed-file lint, TypeScript and production build pass, including new blaster silhouette and independent charging-shader coverage. Live visual review remains pending.

## 2026-10-29 — Impact plume differentiation and contained gear retraction

- Replace uniformly spaced smoke rings with seeded uneven dust fronts and fourteen central rising billows on Earth. Charged hits have broader spread, larger puffs and staggered emission.
- Give Moon impacts their own neutral-gray, smaller, faster dust arcs with short lifetimes and radial rise/fall. Retain the original lunar tile debris, damage and crater marks.
- Keep eight pooled impact slots, forty puffs each and one instanced draw per body, with no new textures, lights or packages. Reuse sample storage inside the update loop; reduced motion skips plumes.
- Correct shared landing gear retraction: shorten toward the underside mounting plane instead of translating upward through the hull. Preserve full-deployment foot depth and suspension; fully retracted gear collapses and hides.

Validation: all 140 scene tests, full lint and production build pass, including actual V3 gear bounds throughout retraction, suspension/contact continuity, plume separation, charged timing/spread, lunar falloff and finite polar motion. Live plume appearance and gear animation remain user-review items.

## 2026-10-29 — Consistent Version 3 UFO reflections

- Confirm both main space scene and the preview select Version 3. The preview previously supplied studio reflections that the main scene lacked.
- Share the preview's three reflection cards and capture them once inside Version 3. Apply the captured map only to the model's standard/physical materials and restore previous maps on cleanup, without changing the main scene environment or planet lighting.
- Retain the preview environment for other UFO variants; Version 3 uses its own identical reflection setup on both routes.

Validation: full lint, TypeScript, production build and nine focused UFO/crash/suspension tests pass. Live browser visual comparison remains pending; directional lighting and framing still differ between scenes.

## 2026-10-29 — Version 3 UFO in the main space scene

- Increase lunar orbital speed and Earth idle rotation by 50%: 100-second orbit and .0525 radians/second spin, preserving tidal locking and reduced-motion behavior.

- Select the angular Version 3 UFO explicitly in the main scene's FlightCompanion, matching the default UFO inspection model.
- Retain the existing ship scale and shared flight, lunar launch/landing, suspension, weapons and crash-effect integration.

Validation: full lint, separate TypeScript check and both focused test runs pass (14 UFO/landing/crash tests and 13 orbit/rotation/landing tests). Production compilation succeeded; the full build stopped when its TypeScript child process was denied with spawn EPERM. Tests passed using in-process isolation after the default test runner encountered the same process-launch restriction. Live browser appearance and motion feel remain unverified.

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
