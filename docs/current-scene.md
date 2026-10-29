Opening camera restored: tour progress0 is a fixed Overview at [0,0,22], aimed at [0,.35,-9], matching the original pre-tour camera. It stays there through loading and after readiness until scroll/Next advances to Jake, Space, California and Moon. Back/reset return to Overview. Tour button stepping is gated on readiness like wheel input. Wide landmark views remain. Four tour tests cover stationary opening despite moving landmarks, forward/reverse stops and path clearance; full lint/build pass. Live animation framing still awaits visual review.

Tour refinement: stops are now Jake -> Space -> California -> Moon. Jake and Space have separate word-center anchors that follow text orbit/drag; wide camera distance is preserved. TOUR_STOPS is an ordered key/label list with automatically distributed progress and generic sampling, so future text/place anchors can be inserted without rewriting segment interpolation. New anchors must also be supplied/updated from their scene objects. Three focused tour tests and full lint pass; production build passes. Live framing remains unverified.

Tour and projectile gravity update (2026-10-29): non-pilot scroll now visits Jake, California and Moon, with Back/Next selecting those stops. Targets follow the moving text, rotating Earth and orbiting Moon. Camera stand-off is max(22, EarthRadius*3.8) world units to preserve the earlier wide view; spherical travel and body clearance avoid crossing terrain. Live camera framing still needs visual review.

Earth, BlockMoon/OrbitingMoon and BlackHole/BlackHoleV2 expose gravity=true and gravityPower=1 by default. Set gravity=false to disable a model, gravityPower=0 for no pull, or e.g. gravityPower=1.5 for stronger pull. Softened inverse-square fields follow model world transforms and skip hidden/destroyed planets; total acceleration is bounded at80. Fired bolts use 120Hz maximum integration steps and swept collision checks along each curved segment. Existing damage and charge behavior remain. All166 tests pass, including gravity strength/toggles, frame-rate consistency and collision checks.

# Current scene — checkpoint 2026-10-28

Camera banking softness: chase orientation damping is now rate4 rather than8, matching positional damping and taking about .75s to settle95% after a fixed change. Q/E and ship-relative steering remain immediate; full rotations, inverted recovery, clearance and reduced-motion behavior are preserved. Six camera tests and targeted lint pass.

## Resource audit and ship-relative controls — latest 2026-10-29

Flight now owns a normalized orientation quaternion. Steering increments apply around the current ship's own yaw/pitch/roll axes; thrust and Space/C lift derive from its forward/up axes, including sideways/inverted poses. Q/E are continuous left/right rolls with eased spin speed, not strafe. Camera boom/up follow the actual craft orientation through complete turns and return upright on exploration exit. Quaternion camera easing avoids an inverted up-vector singularity. Pad launch preserves the full pad attitude; cosmetic bank/lean are separate. Previous scene-relative yaw/pitch/lift limits are superseded.

Memory fixes: RimPlasma now disposes both InstancedMesh objects in addition to shared geometry/materials, because dispose=null disables automatic cleanup. Idle rim/projectile batches stop GPU buffer uploads; projectile target lists, flight vectors and camera scratch objects are reused. Scratch caches use weak keys so discarded craft/camera objects are collectible. Input/timer cleanup and existing model resource ownership were inspected.

Repeatable audit: node --expose-gc scripts/audit-resource-lifecycle.mjs. Nine factories, ten measured cycles each: all1590 tracked releases occurred exactly once, with0 retained ArrayBuffer growth after settled forced GC and approximately277KiB JS heap variation. This is CPU-side ownership evidence, not React navigation/WebGL/driver profiling. All161 tests and production build pass; full lint had one unused-variable warning, now removed and rechecked. Live GPU memory and flight feel remain unmeasured.

Moon spacing update: orbit distance is now EarthRadius*3.6 + MoonRadius, previously EarthRadius*2.8 + MoonRadius. This increases center distance about26% and surface gap about44%. Moon size,100-second period, inclination, tidal lock and lunar pad/flag behavior remain unchanged; linear orbital velocity naturally increases for the wider orbit. Fifteen orbit/landing/launch/camera tests, targeted lint and production build pass. Earlier2.8-distance values are superseded.

Rim-plasma direction smoothing: each emitter keeps a persistent quaternion and follows new exhaust direction along the shortest arc with exponential rate7 (roughly .4s to settle). Pulse origins use that same eased direction. Strength now ramps at8 and fades at6 to soften transfers between ports. Flight controls/physics remain immediate. Reduced motion follows input directly without interpolated motion. Five focused propulsion tests, targeted lint and production build pass; live feel awaits user review.

## Directional rim plasma — latest 2026-10-29

Angular V3 now emits broad blue/cyan-white three-dimensional plasma lobes from its actual six blue rim lights during manual free flight. Rear ports respond to forward thrust, front ports to reverse, sides to strafe; canted opposite-side jets respond to turning, vertical cant responds to lift/pitch and braking opposes local velocity. Input is cleared before launch/landing/park/crash early returns, so these effects do not replace or compete with the existing underside takeoff rings. Coasting alone does not emit a trail.

Three overlapping pulses per port use shared lathed lobe geometry with rounded widening fronts and tapered/fading tails, a white inner volume and cyan-blue outer envelope. Ignition/shutdown is damped; no thin pink ribbons. Two instanced draws total (18 instances each), no textures, lights, packages, React frame updates or per-pulse allocations. Effects are excluded from crash debris and use explicit owned-resource cleanup. Reduced motion displays a static response to direct input rather than traveling pulses.

RimPlasma lives under the same craft transform at model scale; sampleRimDrive places origins just beyond the V3 lamp faces. Other model variants retain their existing effects because their rim/rotor layouts differ. All151 tests, changed-file lint and production build pass. New tests cover direction/torque/braking, actual lamp ray alignment, bounded directions and broad volumetric geometry. Live shader appearance and motion feel remain pending browser review.

## Circular angular-UFO cockpit mount — latest 2026-10-29

V3 dome now sits in a circular 48-segment metal collar with circular dark gasket, replacing the tight six-sided mount. Gasket's .80 inner radius clears the complete rotating glass/frame sweep; upper armor opening is also circular at .94 radius, overlapped by the .98 outer collar to seal the boundary. Cockpit floor is lowered from Y=.49 to .44. Dome facets, rotation, angular outer hull and other UFO variants remain unchanged. No additional material batches. All147 tests, lint and production build pass, including 96-angle actual collar ray checks and full-sweep radial clearance. Six exact-model renders saved in docs/references/ufo-v3-circular-cockpit; front/side/rear/three-quarter inspected. Browser motion review remains pending.

## Weapon rotation — latest 2026-10-29

All UFO variants now rotate their three cannon jaws and cyan jaw accents around the local +Z bore at .9 radians/second (about seven seconds per turn). The saddle, recessed aperture, muzzle and shot/charge origins remain fixed. Offset-axis compensation keeps the muzzle exactly at [0,-.10,2.88] rather than orbiting around the UFO center. Delta-based motion clamps long frames and freezes under reduced motion. V3/Reference factories keep a separate two-material rotor batch; JSX cannon uses four fixed plus two rotating material batches. Existing crash/consumption geometry is retained. All146 tests pass; visual motion review remains pending.

## Shared cannon and angular dome rotation — latest 2026-10-29

Angular V3 now rotates only its faceted glass dome and metal dome frame, isolated in `v3-dome`. The outer disc, rim lamps, vent housings/louvers, cannon, cockpit interior/collar and landing gear remain steady relative to craft heading. Dome uses the existing 2.34 rad/s speed, engine-power launch ramp and reduced-motion freeze. Earlier disc-rotation notes for V3 are superseded; other variants keep their existing rotor behavior.

All four UFO variants now share the three-jaw alien cannon, shifted .16 model units forward to expose more of the jaws while retaining saddle overlap with the hull. Shared muzzle is [0,-.10,2.88]; charge and fired bolt placement use it for every variant. Charging appearance and blaster damage are unchanged. Classic/Hexagonal JSX models use a reusable four-material-batch cannon component; Reference/V3 merge the same geometry into their existing materials. Preview includes Classic alongside the existing three variants.

All 145 tests pass, including clear muzzle/recess, saddle embedding, independent dome/outer hull transforms and vent alignment. Full lint and final production build pass. Updated six-view offline images are under docs/references/ufo-v3-cannon-extended and docs/references/ufo-reference-shared-cannon. Actual browser appearance/animation review remains pending.

V3 vent attachment correction: all three underside vent housings, dark wells and louvers belong to v3-disc, matching the rotating armor openings. Landing gear, cockpit and cannon retain their fixed groups. Existing spin/engine/reduced-motion behavior drives the vents without another animation loop.

V3 cannon revision: fixed low-mounted alien emitter with embedded saddle, recessed cyan throat and three swept focusing jaws replaces the tube on top of the rim. Shared V3 main/preview geometry; muzzle [0,-.10,2.72] drives charge and projectile placement. Charge appearance, damage and flight behavior remain unchanged. Model remains 17 batches / 12,394 triangles. Six offline views saved under docs/references/ufo-v3-alien-cannon; live browser review pending.

Earth durability update: threshold is now 60 damage, requiring three full-charge 20-damage hits on an undamaged Earth (or accumulated weaker shots). Dents, scorch and impact plumes remain visible while it survives. Moon stays at 12. The existing warning/breakup sequence still starts at the threshold. Flight manual reads the shared durability constants. Earlier one-hit Earth/20-threshold notes are superseded.

Fired bolt update: slim rounded-front cyan blaster pulses replace the teardrop envelope, with a long narrow white core, short fading tail and restrained charged-shot violet edge. Charge increases width by up to 1.8x and length by 1.45x; flying bolts do not wobble or breathe. The separate compact charging orb and filament shader/pulse are unchanged, as are projectile damage, speed, input, pooling, impacts and collision behavior. No new draw calls/packages. All 142 tests pass; live visual review remains pending.

Version 3 UFO disc rotation is now 2.34 radians/second at full power, a 30% increase from 1.8. Shared by main scene and V3 preview; existing engine ramp, stationary parked state and reduced-motion freeze remain intact. Steering/flight speeds are unchanged. Targeted lint passes.

## Impact plumes and gear containment — 2026-10-29

Earth impacts now combine an uneven surface dust front with fourteen central rising billows; charged impacts spread farther with varied emission timing. Moon uses an explicit lunar profile with neutral-gray smaller, faster, short-lived ballistic dust arcs rather than Earth-like lingering smoke. Existing actual lunar tile ejecta, scars and damage stay intact. Eight slots of forty instances still share one draw per body; sample storage is reused, no textures/lights/packages added, and reduced motion skips the effects.

Shared landing gear now collapses toward local Y=-.40 at the underside instead of translating up by .65 through the disc. Deployed clearance and compression behavior are unchanged. Actual V3 geometry stays below the hull midplane for the full retraction sweep. All 140 scene tests pass; live visual review remains pending.

## Main-scene UFO selection — 2026-10-29

Version 3 now owns a one-frame 128px studio-reflection capture using the same three Lightformer cards as the UFO preview. The capture is assigned directly to its materials so main-scene planets and background do not inherit it. Both preview and main scene therefore use the same model and reflection setup; their direct scene lights and framing remain different. Full build/lint/type checks and nine targeted tests pass; live visual comparison remains pending.

Motion pacing: lunar orbit is now 100 seconds per revolution and Earth idle rotation is .0525 radians/second (about 120 seconds per revolution), both 50% faster than the prior settings. Tidal locking, drag pause/resume and reduced-motion behavior use the existing shared helpers. Earlier 150-second / .035-radian values below are superseded.

The main space scene now explicitly selects the angular Version 3 UFO, matching the default `/ufo` inspection model, at the existing .38 scale. It uses the shared PilotSaucer controller, landing gear/suspension, engine power, weapons and crash effects. Earlier notes that the main scene retains the previous hexagonal ship are superseded. Other model variants remain available in the inspection view and source.

This document is the source of truth for the current implementation. Older refinements in architecture.md and AGENTS.md describe the design history; when values conflict, use this snapshot and the code.

## Experience

The root route is a full-window black WebGL scene with only a persistent asset progress bar along the bottom. No header, slogans, preview link, replay control or backdrop selector is shown. Errors still provide a retry path; loading status is available to assistive technology.

Earth loads and scales in first. Its reveal completion callback starts one continuous particle formation reading exactly **Jakes Space**. Individual letter starts overlap. Text stays invisible until its formation starts, converges from scattered positions, and remains formed afterward. There is no longer a separate LOADING-to-name dispersal transition. Required assets must be ready before completion is signaled. The percentage is Three.js LoadingManager item progress, not a simulated animation percentage or byte/GPU measurement.

The settled phrase orbits clockwise viewed from Earth's north pole, easing up to 0.18 radians/second (about 35 seconds per revolution). Its vertical midpoint is y=0.35, aligned with Earth's center. Text stays independent of manual Earth rotation. The globe naturally occludes far-side lettering. Magnetic hover affects nearby visible text particles and is disabled during dragging.

## Earth, water and clouds

- BlockEarth: components/three/planet/, 20,921 shared beveled cube instances. Deterministic geometry is generated offline from NASA Blue Marble July 2004 color and scaled GEBCO/NASA topography. Fine land/coastal cubes, larger ocean tiles, green/tan land, white ice, exaggerated stepped relief. Source credits, limitations and regeneration details are in that directory's README.
- Main Earth radius: min(6.5, viewport aspect * 9.4), center [0, 0.35, -9]. This is deliberately much larger than the original backdrop globe. /earth retains an independent inspection scale and six view buttons.
- Earth orientation: 23.44-degree axial tilt. Free camera-relative quaternion drag supports horizontal and vertical movement. Idle spin pauses while held, then eases back to 0.035 rad/s, approximately three minutes per revolution. Manual orientation persists.
- Ocean ripple: an explicit oceanMask selects blue tiles. A periodic crest travels by spherical angular distance, lifting cubes radially up to 0.055 base units with the letter pulse's soft response. Land remains fixed. Translations derive from immutable rest positions to avoid accumulated drift.
- Clouds: components/three/clouds/ contains reusable billow, wisp, bank and spiral sculptures plus a batched CloudLayer. Twenty-four smaller scattered patches sit at base radii 3.22–3.325 plus local relief, close enough for peaks to pierce them. Formations are 55% smaller than their first version. Keep the text band relatively open. Clouds inherit Earth's tilt, drag and spin, plus a gentle local-Y drift of 0.008 rad/s. Use shared beveled cube geometry and a cool pearl palette.
- FluidKit's fullscreen backdrop and later spherical atmosphere experiment were both removed. The component and npm dependency are absent. Use the cube clouds as the current atmosphere direction.

## Text and camera

Sabo Filled is self-hosted; Regular is the outline face, not a lighter weight. Current particle asset: public/models/jakes-space-particle-core.json. The lettering maps onto a front spherical arc rather than a flat plane. Radius = Earth radius * 1.2 + 0.6; font scale fits about 2.1 radians. Cube depth and tangent orientation remain three-dimensional.

Formation timing: start 0.1 seconds, 0.32-second letter stagger, 1.4-second convergence and up to 0.12-second radial delay. The same intro runs once per mount; no automatic replays. The legacy two-word assets and intro helpers remain as documented exploration history, but are not the root route's active sequence.

Perspective scene camera: smooth quintic Bezier travel between forming glyphs, damped position/aim, 85-degree wide-lens experiment easing back to 40 degrees for the completed composition. This is perspective, not actual fisheye distortion or orthographic projection. Cursor-following group rotation was removed. Main camera choreography stays independent of Earth drag and text orbit.

Settled letter pulses: center-outward waves with 0.85-second sweeps, starts 0.5 seconds apart, initial delay 0.4 seconds and cycle rest 0.35 seconds. Soft attack/recovery prevents hard reforming transitions.

Reduced motion: static scene camera, immediate/static formation, no autonomous Earth spin, text orbit, cloud drift, ocean displacement or magnetic attraction. Subdued text brightness pulses remain; direct manual Earth rotation remains available.

## Architecture and tools

Keep routes thin; features coordinate the scene and loading states. Atomic HTML UI remains available in the foundation studio. Reusable 3D objects, planet and clouds live under components/three/. State handles discrete phases; refs and useFrame own animation. Share geometry/materials and cap pixel density at 1–1.5. No per-cube React mesh trees.

Next 16.4.3, React 19.3, Three 0.186, Fiber 9.8 and Drei 10.7 remain the runtime foundation. package.json/package-lock.json are authoritative. No new editor extension requirements. No FluidKit dependency. No quote API, spaceship, VR or full portfolio universe has been implemented.

Run npm run dev for localhost:3000, npm run build for production validation and npm run lint. Python/Pillow generates Earth assets; Python/FontTools generates Sabo word volumes. Those tools are development-only, not npm/runtime requirements. Large original maps, font-tool installations, node_modules and .next are excluded from the commit; local downsampled source maps and generated assets are included for reproducibility.

## Verification and known limits

The checkpoint runs the production build, lint and all scripts/test-*.mjs tests: 27 tests covering formation, readiness waits, pulse continuity, camera endpoints, wrapped geometry, orbit, cloud bounds, Earth transform integrity, ocean selection and rotation math.

Browser visual verification was unavailable after local-origin access was declined. Do not claim these checks establish actual lighting, mobile framing, pointer interaction or GPU performance. Inspect the main scene and /earth on real devices before treating the art direction/performance as final. Terrain uses an 8-bit scaled height image and heuristic RGB land classification; it is stylized rather than survey-grade. AI turnaround references are art direction, not geographically registered reconstruction views.

Surface coverage refinement: overlap surface tiles by scaling their local tangent X/Z dimensions to 1.25x and radial Y depth to 1.15x. Include an opaque deep-blue inner sphere at 98% of the base radius, inside the same reveal/rotation hierarchy, to prevent see-through pinholes at cube-sphere seams and moving wave crests. Terrain positions, elevations and water displacement remain unchanged.

Scene zoom: after the text/camera entrance completes, mouse wheel/trackpad and two-finger touch pinch dolly the scene camera around Earth. Minimal +/minus/Reset controls support keyboard users. Keep the same camera owner in ParticleWordmark; apply bounded logarithmic zoom to the settled camera position, never add competing OrbitControls. Bounds keep the camera outside terrain. One-finger drag rotates Earth; the second touch cancels Earth drag for pinch. Respect reduced motion with immediate manual zoom. Remove native listeners on cleanup.

Earth shape update: surface instances now use shared beveled octagonal prism geometry, eight-sided caps aligned to each tile's outward radial normal. Tangential overlap is 1.4x, radial depth remains 1.15x, and the solid blue inner layer stays to prevent see-through seams. Keep map-derived positions/relief, ocean masks and ripples unchanged. Clouds and text retain their cube geometry. Geometry helper: octagonal-earth-geometry.mjs. This supersedes the cube-shaped Earth surface.

Earth surface shape refinement: replace the eight-sided octagonal prisms with six-sided beveled hexagonal prisms for a chunkier, less circular silhouette. Use hexagonal-earth-geometry.mjs. Retain 1.4x tangent overlap, 1.15x radial depth, the opaque inner sphere, elevation data and ocean displacement. Text/cloud shapes remain unchanged. This supersedes the octagonal surface experiment.

Survey Moon implemented: components/three/moon/ contains BlockMoon and OrbitingMoon; scripts/generate-moon.py produces 16,941 overlapping hexagonal prisms from saved NASA LROC albedo and 16-bit LOLA heights, decoded as sample * 0.5 - 10000 metres. Preserve signed lows and a consistent 16x relief exaggeration. Moon radius is Earth * 0.273; compressed presentation orbit distance is Earth * 2.05 + Moon radius, with a 150-second period and artistic 18-degree inclination. One orbital phase drives both translation and yaw so local +Z (near side) always faces Earth, independent of Earth drag. Freeze orbital time for reduced motion; reveal after Earth. /moon provides six inspection views. Tests verify elevation units and locking across a full inclined orbit. The earlier Moon design-only status is superseded. Browser visual/performance review remains pending.

Moon quality revision: the first 16,941-block model was rejected as too coarse. Version-2 lunar data has 47,271 finer adaptive hexagonal tiles, thinner radial caps (0.55x depth, 1.32x tangent overlap), stronger actual-albedo maria/highland contrast, restrained elevation-neighborhood cavity shading and one global 24x relief exaggeration. Add a 256x128 continuous survey-displaced, vertex-colored skin just beneath the tiles so crater bowls remain cohesive between caps; pole samples collapse to one longitude to avoid pinched geometry. This replaces the constant-radius-only foundation as the visible gap filler. Keep the tidal-lock orbit unchanged. Preview lighting is more directional to reveal relief. No visual verification claim until browser review. Supersedes earlier 16x/16,941-instance values.

Moon readability/coverage correction: user rejected the tiny-tile version and reported see-through areas. Use one 44x44-per-face sampling level (11,616 tiles), clamp base widths to 0.030–0.046, remove adaptive microtiles, increase tangent overlap to 1.65x and radial depth to 1.15x. Keep the detailed continuous survey skin for crater relief; render it opaque and double-sided, with a brighter neutral opaque interior foundation. Preserve lunar data, 24x relief and tidal lock. Ray tests check that the skin blocks background sightlines from 300 directions. Supersedes the 47,271 thin-cap setup.

Classic UFO model: components/three/ufo/ owns ClassicUFO and its procedural geometry; /ufo provides three-quarter/side/top/underside inspection. Original broad 24-faceted silver saucer, large beveled hexagonal plates, 12-facet cyan canopy with six ribs and cockpit seat, 12 rim lights, underside ring/aperture and three vents. Online visual references: THQ Nordic Destroy All Humans! and Smithsonian The Invaders saucer; save links/provenance in the UFO README. No extracted game mesh or third-party textures. Concept saved in docs/references/ufo-saucer-concept.png. Keep gentle hover optional and respect reduced motion. No Earth-scene flight path, weapons or beam effect is implemented yet.

UFO refinement: remove the added hexagonal plating from both top and underside. Keep the continuous faceted metallic hull, cockpit frame, cyan canopy, rim lights, vents and engine details. The panel generator and unused geometry were removed. This supersedes the plated saucer concept.

Saucer refinement: preserve the unplated 24-faceted hull; refine its taper with small edge bevel tiers. Put twelve inset navigation lights in a dark belt between two thin polished rim lips (no thick torus crossing the light row). Lower the 18-facet cyan dome, slim six frame ribs, refine the seat/cushion and add a restrained cockpit display. Underside uses a real annular engine well with recessed hexagonal aperture, lower-intensity cyan accents and compact vent pods. Reduce hover amplitude for a calmer feel. /ufo now has procedural one-frame studio reflection lighting via Drei Environment/Lightformer, with no downloaded HDRI or new dependencies. All geometry remains original; no flight-path or main-scene placement change.

Earth direction: Jacob rejected the sculpted/Clean experiment. Keep only the hexagonal Earth with its raised map-derived terrain, overlapping tiles, opaque foundation and ocean ripples. Remove the sculpted model, generator, API variant and preview selector. Preserve clouds, Moon, rotation, zoom and scene choreography. Further visual changes should follow Jacob's direction rather than assuming smoother means better.

Saucer flight: PilotSaucer wraps ClassicUFO in a delta-based flight controller, also placed in the Earth/text/Moon scene. Explicit Pilot mode separates flight from Earth drag and studio OrbitControls; main flight unlocks after text/camera entrance. Hold left mouse for forward thrust; mouse movement does not steer or tilt the ship. Arrow keys control yaw/pitch; pitch is limited to ±0.85 rad, turns bank and ease level. W/S thrust/reverse, A/D strafe, Space/Ctrl vertical, arrows steer, Shift brake, R reset. Release thrust coasts with drag. Clear inputs on blur, hidden document, pointer cancellation/leave, or mode exit. No pointer lock or camera takeover. Earth exclusion sphere and outer boundary constrain flight; this is not terrain/Moon collision physics. Reduced motion disables decorative hover; direct piloting remains available. No mobile flight controls yet. Tests cover heading, thrust, coast, bounds and frame-rate consistency; browser interaction/appearance review remains pending.

Saucer rotor: ClassicUFO has sibling disc and cockpit groups inside its shared hover/flight container. Hull, belt, rim lights, engine and underside vents rotate around local Y at 1.8 radians/second (one turn in about 3.5 seconds). Canopy, frame, cockpit base, seat, console and crown retain flight heading. Spin is delta-based, independent of hover/piloting, and freezes for reduced motion. Both the main scene and /ufo use this same model.

React lifecycle correction: keep screen-space flight controls as normal DOM siblings of Canvas, not Drei Html. Installed Html creates a nested ReactDOM root and synchronously unmounts it in layout cleanup, a likely source of the reported synchronous-unmount warning. Earth/Moon Suspense fallbacks now use null instead of Html; main page retains asset-loading status. Do not patch dependency cleanup or suppress the warning. Browser confirmation of the reported warning remains pending.

Performance checkpoint: see docs/performance.md and node scripts/audit-scene.mjs. Cap drawing buffers at 2M pixels / DPR 1.25, adapt resolution with Drei PerformanceMonitor after sustained samples, keep a stable conservative fallback. Preserve geometry counts and appearance; indexed text/cloud geometry reduces duplicate vertices. Cache deterministic text work and orbit trig; skip inactive hover ray work. Ocean matrix updates run at 30 Hz with delta-based timing; camera/flight remain full rate. No browser/hardware FPS claims without actual profiling. Recruiter laptop usability is a target awaiting production/device review.

Current wordmark: exactly "Jakes Space", replacing "loading jakes world". Generate jakes-space-particle-core.json from Sabo Filled using generate-wordmark.py --text "Jakes Space" --match-text Jake. Keep the single sequential convergence, orbit, pulse, magnetic hover and camera choreography. Update accessible status, asset validation and failure matching alongside the visual asset.

Flight control refinement: remove cursor-driven yaw and pitch entirely; no flight pointermove listener or cursor dead zone. Left click still applies thrust. Arrow keys steer/pitch; W/S thrust/reverse, A/D strafe, Space/Ctrl rise/descend, Shift brake, R reset. Keep automatic banking on keyboard turns, disc spin and existing flight boundaries. Applies to both main scene and /ufo.

Saucer death ray: while piloting, F toggles a mint/cyan beam emitted along local +Z from the fixed front emitter. Ignore key-repeat so holding F does not flicker. Three shared-container cylinder layers (opaque core, additive glow, depth-tested/no transparent depth writes) follow ship pitch/bank, independent of disc spin. Smooth on/off; reduced motion switches directly, no flashing. A small unshadowed emitter light adds local glow. Reset, blur, hidden tab, cancellation, pointer leave and pilot exit clear firing. Both scenes show the F hint. Visual effect only: no terrain destruction, hit logic or damage. No postprocessing dependency.

Forward ray correction: define local +Z as the UFO front, matching cockpit console and positive thrust. A fixed raised gun housing with a mint aperture sits above the front rim in the cockpit group, independent of disc rotation. Beam origin is [0,0.24,2.49] in model units, directed along +Z; it pitches/banks with the flight container. This replaces the downward underside ray. F retains toggle behavior.

Projectile revision: replace continuous ray with a fixed pool of 24 independent world-space energy bolts. F toggles a stream at 0.28-second intervals (0.5 for reduced motion); mint-white cores, teal glow and short trailing streaks, three instanced draws, no per-bolt lights or postprocessing. Snapshot front-emitter position, ship orientation and inherited velocity at launch; move along +Z heading at 14 world units/sec plus ship velocity, expire after 1.8 seconds, taper at end. Turns after launch never drag existing bolts. Exiting pilot/hidden scene clears bolts. No hit/damage logic yet. Tests cover independent heading, velocity inheritance, bounded pooling and expiry.

Projectile collisions: swept segments select the nearest hit across registered instanced Earth/Moon terrain, clouds and text. Inverse world transforms handle planet spin/tilt/reveal and lunar orbit. Spatial hashes index conservative per-instance bounding spheres; dynamic text refreshes at 80 ms with padding, so this is approximate tile collision, not triangle-accurate contact. Remove a small local cluster by zeroing its transforms; text animation skips destroyed IDs and ocean updates preserve zero scales. Planet foundations absorb shots and remain intact. Consume each bolt at one hit and reuse its mesh slot for a short impact burst. Damage is session-local, restored by reload; no changes to source assets. /ufo has no target objects by default. Fixed projectile pool and broad-phase checks bound the work; browser performance/visual validation remains pending.

Flight menu direction: shared PilotMenu in main scene and /ufo uses the existing self-hosted Sabo Filled font, plain-text arcade menu choices and a collapsible flight manual. No boxed panel, icons or new font dependencies. Show boot/exploration/pilot status, Pilot / Exit and Flight Manual choices, a compact active hint and key/action pairs. Keep keyboard focus visible, 44px actions, bounded scrolling on short screens and standard DOM outside Canvas. Scene container uses region rather than image semantics so menu controls remain accessible.

Single-shot firing: each fresh F key press queues exactly one energy bolt. Ignore keyboard auto-repeat; holding F cannot fire again until released and pressed. Remove the firing toggle, repeat interval and cooldown stream. Consume queued requests once, clear on reset/blur/exit, retain the 24-slot pool, projectile motion and destruction. Left mouse remains thrust. Flight manual says FIRE ONE BOLT. Supersedes all earlier F-toggle/automatic-fire instructions.

Keyboard focus fix: arrow and flight keys remain available during pilot mode when a flight-menu button/link has focus. Preserve native Space activation on buttons and ignore keydown in editable fields; always process keyup to avoid stuck movement after focus changes. Pointer leave releases mouse thrust only, preserving held keyboard steering. Blur/cancellation and mode exit still clear inputs.

Earth impact revision: dent mode replaces tile removal on Earth. Impacted clusters shift inward by roughly 0.05–0.06 local units with a floor above the opaque foundation, retain their full geometry, and become red/orange/yellow with per-instance heat emission. Scorched ocean tiles stop rippling so dents persist. Collision indices rebuild after denting and scorched tiles still absorb further shots without sinking repeatedly. Damage remains session-local. Moon/cloud/text damage behavior is unchanged. No added draw calls or per-tile lights.

Impact refinements: Earth tracks per-tile hits, darkening base color and reducing heat emission on successive hits toward charcoal; only the first hit dents geometry. Letter collision uses explode mode: hit instances leave the orbit animation permanently, scatter/tumble outward for 1.1–1.5 seconds, darken/shrink away, then their transforms are zeroed. Reuse the original instances, no fragment meshes/lights; reduced motion removes hit blocks immediately. Reload restores damage.

Movement attitude: UFO banking now follows local strafe velocity plus turn/strafe input, with corrected roll sign for the +Z forward convention. Left movement leans left, right movement leans right; forward thrust noses down slightly and reverse noses up. Damped bounded lean is cosmetic, separate from the chosen flight pitch, so it does not create an unintended climb/dive. Residual velocity maintains a small coast lean and braking eases the craft level. Reset clears lean. Model and front emitter share the visible attitude.

Flight speed: forward and reverse thrust acceleration increased from 5 to 9 world units/s²; overall speed cap increased from 5 to 8 world units/s. Drag, braking and strafe/vertical acceleration remain the same. Normalize forward cosmetic lean against the new speed cap.

UFO Earth crashes: remove the old 1.2x Earth exclusion sphere. Near Earth, sample the existing terrain collision index radially without damaging tiles, then resolve contact using a conservative hull radius. Low normal impact speed bounces with a small spark burst; inward speed >=3 world units/sec breaks the saucer into radial sections of its actual mesh geometry (including cockpit and instanced rim components), fades fragments over two seconds, then respawns at the safe initial position. Freeze flight/fire and clear held inputs during breakup. No camera shake, sounds or lives system. Reduced motion omits model breakup and uses a few static fading sparks. These are approximate terrain/hull contacts, not full rigid-body simulation; Moon crash collision is not added. Shared crash behavior is only activated where Earth exists; /ufo remains a flight inspection space. Tests distinguish normal versus glancing impact and confirm nonpenetration/rebound. Browser visual/performance verification remains pending.

Wider scene framing: initial and settled home camera Z increased from 12 to 22 (Earth center stays -9), roughly 48% farther from Earth. The letter sequence now starts from the wide home view before approaching its existing shots and returns to the same wider home. Reduced motion and reset zoom use that home. Earth-scene outer flight radius increases from 3.8x to 6.5x Earth radius (about 42.25 units at desktop size); /ufo outer radius increases from 12 to 20. Terrain crash detection and flight speed are unchanged.

Flight-boundary adjustment: Earth-scene outer radius is now 5.51x Earth radius, exactly 45% above the original 3.8x radius (about 35.8 units at desktop Earth size). Supersedes the 6.5x / approximately 70% increase. Wider camera framing and /ufo inspection bounds remain as set.

Camera direction superseded: remove letter-shot camera bounce, intro dolly and FOV breathing from ParticleWordmark. FollowSceneCamera is now the sole main-scene camera owner: steady wide Earth framing outside pilot mode, smooth world-offset UFO position following while piloting, fixed 40-degree FOV and zoom support in both modes. Do not inherit ship roll/pitch or add camera shake. Flight updates run before camera follow, which runs before text magnetic raycasting. Redirect follow offset when the Earth sphere would obstruct sight, keep actual camera outside Earth, and hold the crash position until a smooth respawn follow. Preserve the 45%-expanded flight bounds; no visible boundary geometry. Reduced motion tracks directly. Legacy camera-choreography helper/tests remain for historical reference but are unused by the main scene.

Browser shortcut correction: descend is Q, replacing Ctrl, because Ctrl+W can close the tab and normal web pages cannot reliably cancel reserved browser shortcuts. Flight keydown runs in capture phase with preventDefault for supported non-editable controls, as best effort only; do not promise tab-close suppression. No automatic fullscreen or keyboard lock. Manual shows SPACE / Q. All other bindings remain the same.

Current flight controls supersede earlier mappings: W/S forward/reverse thrust, A/D turn, Q/E strafe, Space/C rise/descend, Shift brake, R reset. Left mouse click fires exactly one bolt per pointerdown; holding the button never thrusts or auto-fires. F remains alternate single-shot keyboard fire. Left/right arrows alias turning without doubling input; up/down arrows pitch. No mouse steering. Shared getFlightInput mapping and shared PilotMenu apply to both scenes. Ctrl is not a flight control.

Planet destruction threshold: Earth explodes after 20 projectile impacts, Moon after 12; shared PLANET_HITS constants live in planet-explosion.mjs. Count one consumed impact per shot, including repeated dented tiles/foundation hits. On threshold, stop further collisions, briefly swell/warm for 0.25 seconds, then reuse existing instance matrices for a deterministic radial burst and 2.5-second fade/shrink. Hide solid foundations/skin and Earth clouds during the burst; no extra per-tile meshes/lights. Disable Earth flight collision and camera avoidance once destruction starts. Source maps/assets remain untouched; reload restores the scene. Reduced motion hides the destroyed planet without a flying-debris burst. No automatic planet respawn or gravity simulation.

Planet threshold buildup: extend charge to 1.2 seconds, with a hot red core visible through widening tile gaps and a soft red Fresnel halo. Tiles lift radially 6% and narrow tangentially 42% during charge; retain most original colors instead of repainting the whole surface yellow. Core and halo fade over the first 0.65 seconds of the burst; tile transforms stay continuous into breakup. Shared PlanetCore applies to Earth and Moon, adds two transient draws per charging planet, no bloom library or per-tile lights. Reduced motion omits the buildup/burst.

Threshold glow refinement: core and halo brightness now share a smooth 0.6-second heartbeat with a rising envelope over the 1.2-second buildup. Two red pulses culminate at full intensity and meet the burst glow continuously. Keep this as intensity modulation, without camera motion or hard flashes. Reduced motion continues to omit the buildup.

Lunar tile readability: Moon impacts now eject the actual hit hexagonal instances outward, tumble/fade them, and permanently remove those instances for the session. Darken the continuous lunar survey skin beneath each hit to make exposed impact scars visible; retain sealed geometry rather than opening see-through holes. Use radial lunar-local debris directions and restrained speed; animate debris only before the full Moon explosion begins. The 12-hit threshold, red heartbeat/core and whole-Moon breakup remain. Reduced motion skips flying fragments.

Red-circle correction: user rejected the visible core sphere and its lingering glow shell. Remove PlanetCore entirely. Put the red heartbeat directly into Earth and Moon tile emission using the shared impact shader; negative impactHeat marks red buildup, positive values retain existing hot-scar colors. Auxiliary glow ends immediately at breakup; no red sphere/ring survives among the debris. Preserve tile separation, thresholds and outward burst. Supersedes all core/halo geometry instructions.

Earth-linked lettering explosion: when Earth enters exploding (or is already gone), the remaining Jakes Space blocks burst radially away from Earth exactly once, using their current orbit positions and existing instance mesh. Reuse debris animation with stronger outward velocity and 2–2.6-second lifetime. Already-shot fragments keep their motion; all other text indices become permanently destroyed, leave the orbit/magnetic/pulse loop and stop colliding. Hide the wordmark after fragments expire. Moon destruction does not trigger lettering destruction. Reduced motion removes lettering immediately. Reload restores it.

Earth-loss Moon motion: keep the tidal-locked inclined orbit while Earth exists. At Earth exploding/gone, release the Moon once from its current orbital pose, retaining the analytic tangent velocity. Continue straight-line inertial motion without acceleration or drag; add slow three-axis tumbling and stop forcing its near side toward Earth. Existing lunar damage/full explosion behavior remains available. Reduced motion freezes automatic drift/tumble; reload restores orbit. This is a stylized loss-of-gravity transition, not an N-body simulation.

Space background pass: ProceduralStarfield adds 1,580 seeded crisp square point stars plus 28 instanced octahedral accents, in world-space shells outside the scene (nearest radius 55, farthest 280 around Earth). Preserve the black base and mostly cool, subdued brightness with a few warm stars. Natural parallax comes only from UFO/camera travel; no automatic drift, twinkle, textures, bloom or per-star lights. Two draws, no useFrame loop or per-frame buffer uploads. Pixel-size uniform follows adaptive drawing-buffer height. Keep this confined to the main scene; model inspection routes remain black. This establishes the background before subsequent visual-consistency passes.

Star brightness refinement: increase procedural star brightness range from 0.35–0.75 to 0.65–1.0, preserving positions, sizes, density, tint and draw count.

Third-person chase camera: pilot mode now follows behind the UFO flight heading with a 10-unit boom, 3-unit elevation and 2.5-unit forward aim. Heading includes chosen yaw/pitch; keep camera horizon level and exclude cosmetic banking/lean. Smoothly orbit behind when turning, rather than maintaining a world-fixed viewing direction. Shorten the boom when Earth blocks it, while preserving camera-outside-Earth protection and zoom. Shared refs update after flight and before camera/text frames. Exploration retains the steady wide Earth view.

Interaction/spacing pass: UFO flight collision now samples both Earth and Moon terrain in their current world transforms, including lunar drift/tumble, and evaluates impact against moving surface velocity. Gentle impacts bounce; hard ones crash/respawn. Letter particles repel locally around a piloted UFO and damp back without deletion; projectile damage remains separate. Text orbit radius increases to Earth*1.5+0.8 while retaining its prior font scale. Remove spiral and three-strand wisp placements from the main cloud layer; retain fuller billow/bank patches in two instanced batches with gentle differential Y drift and tiny atmospheric sway. Reduced motion freezes cloud motion and disables particle displacement.

Scroll-guided exploration: outside pilot mode, scroll now scrubs a predefined centripetal curved camera path through wide/front/side/rear/low/overview positions, with a paired aim spline. Scroll forward/back reverses the same route; bounded 0–1 progress, no automatic travel or looping. Smooth progress following and camera settling; reduced motion directly follows input. Two-finger vertical touch movement also scrubs the route while one finger keeps Earth drag. Back/Next/Reset are keyboard-accessible alternatives. Pilot mode retains third-person chase and scroll zoom with separate stored zoom/progress, restoring the last tour position on exit. The route currently uses fixed world-space stations; edit scroll-tour.mjs to art-direct it.


Flat title and charged weapon refinement: after Earth reveal, Jakes Space particles converge as a flat front-facing title at the existing font scale. Hold 1.2 seconds after formation, then quintic-ease the same particle positions and tangent rotations into the equatorial arc over 2.2 seconds. Begin orbit only after wrapping, with a gradual speed ramp. Reduced motion uses the static wrapped title without bending. Hold left click or F to charge (1.5 seconds to maximum); release fires one bolt, tap fires a normal bolt. Shared overlapping mouse/keyboard holds release once after both are released. A small mint faceted muzzle charge grows with power; stronger shots grow up to 3x and travel 14–24 units/sec. Damage still counts one impact per bolt. Cancel charge on blur, hidden tab, pointer cancellation, reset, mode exit and crash. No new dependencies. Verify wrapped-wordmark/weapon-charge/projectile tests, lint and build; browser visual review remains restricted by the saved localhost access policy.


Charged impact refinement: shot power now reaches collision damage. Tap retains base blast radius/one damage; full charge reaches 4x local blast radius and counts four damage toward Earth/Moon breakup (thresholds still 20/12). Radius grows quadratically with held charge; damage tiers 1–4. Nearby tiles dent/scorch on Earth and eject on Moon/text/clouds using their existing damage modes. The bounded spatial grid queries only the struck target; no full-scene area scans or damage through separate objects. Lunar skin scars and projectile impact visual expand with charge. This supersedes the prior one-damage-per-charged-bolt note.


Faster entrance: prioritize reaching the usable scene. Earth reveal damping increases 3→7 (98% reveal about 0.56 seconds); text starts 0.05 seconds in, letters stagger 0.12 seconds with overlapping 0.65-second convergence and 0.08-second ripple. Flat title holds 0.6 seconds, bends into orbit over 1.05 seconds. For ten visible letters the combined Earth/text choreography is about 4.1 seconds rather than 9.1 seconds, excluding real asset loading. Keep real readiness gating and reduced-motion handling; flight, orbit, pulses and destruction speeds unchanged. Timing lives in WRAP_TIMING.


Splash heat palette: Earth dents now use a smooth radial gradient from fiery red center through orange to golden-yellow outer tiles. Instance emission follows each tile's actual impact color, keeping the yellow perimeter visible instead of recoloring it red. Center emission is stronger; repeated hits retain the 8-hit cap and progressively darken color and emission. Planet-wide pre-explosion red pulses remain separate. Palette helper lives in planet/impact-material.mjs; tests check actual damaged tile colors and repeat-hit charring.


UFO types: preserve Classic as default. Add selectable Hexagonal via UFOModel/type, available in main Flight Deck and /ufo inspection/pilot preview. Both share the existing stable cockpit, local +Z emitter, rotating disc, flight/charged projectiles and geometry-based crash breakup. HexagonalHull adds one static instanced batch of overlapping six-sided beveled blocks to upper and lower surfaces, deterministic raised relief and gray variation. Keep the continuous original hull underneath to seal tile gaps. Reuse the Earth hexagonal prism geometry; no per-tile React meshes, new textures or packages. Switching type changes appearance without resetting flight. Six-view design reference: docs/references/ufo-hexagonal-six-views.png. Browser visual comparison still pending saved localhost permission restriction.


Hexagonal reference rebuild: HexagonalUFO is now an independent model, not a Classic hull overlay. Reference proportions: radius 2.23, upper armor about 0.43 high plus stepped relief, lower hull -0.43, canopy sill 0.47 and crown 1.06. Upper hex blocks roughly 0.34 wide, underside 0.49; sloped surface normals, seeded relief/shade variation, openings around three 0.29-radius louvered vents. Closed dark lathed foundation prevents gaps. Dark inset belt with 16 cyan lamps; 12-sided central engine collar, cyan ring and hexagonal core. Canopy uses real dual-icosphere hex/pentagon faces, clipped at sill, individual teal face shades and metallic edge bars; no smooth globe masquerading as a hex dome. Fixed front weapon opening remains aligned with projectile local +Z origin. Rotor, cockpit, banking, charging and crashes remain compatible. Classic restored as its own unchanged construction; UFOModel dispatches to either component. /ufo now offers six inspection angles. Geometry tests verify differing tile scales, surface slope, true six-sided canopy faces and finite bounds. No claim of 1:1 visual fidelity until live comparison is possible; localhost access policy still prevents browser verification.


Charged damage increase: full charge now counts eight damage (previously four), partial charge tiers scale 1–8. Base taps remain one damage; maximum splash radius remains 4x. Earth threshold 20 now takes three full hits, Moon threshold 12 takes two. Heat gradient and repeated tile scorching unchanged. Flight manual updated to 8x damage.


Planet-breaker plasma: only a completed 1.5-second charge releases a full plasma bolt. It has a broader white-blue core, cyan envelope, violet extended tail and gentle 2 Hz ±12% size breathing; reduced motion keeps it steady. Full impact counts 20 damage, starting Earth/Moon existing breakup sequence in one hit; partial charges remain 1–7 damage. Keeps swept collisions and nearest-hit consumption, so intervening objects still block shots. Heat palette now reserves yellow for the outer 18% of radius, shifts to orange/red earlier and has a dark red inner core. Repeated hits still char further. No new lights, textures, draw calls or packages.


Plasma visual polish: full-charge projectiles now use a dedicated 16-sided tapered envelope with a rounded head and pointed 2.8-unit local wake. A lightweight instanced shader adds cyan/violet color grading, flowing helical filaments, a softer Fresnel rim and traveling energy crests. Compact white core stays stable; energy envelope carries subtle movement. Replaces full-charge oval glow/trail with one additional pooled instanced batch, no bloom/lights/textures. Reduced motion fixes shader time at zero. Full-charge damage and ordinary bolts unchanged. Visual GPU review remains pending localhost access restriction.


Charge-to-flight visual continuity: muzzle charge now uses the same tapered plasma geometry, animated filament material and white-blue core as the launched full-charge projectile. Shared palette from first hold; no final-charge mint-to-blue swap or unrelated icosahedral orb. Charge group tracks the actual ship world heading; grows with held level and gently pulses at full charge. Release retains plasma identity at projectile size. Partial-charge projectile behavior/damage unchanged.

All released charge levels now share that plasma geometry/palette; partial shots are smaller and retain partial damage, with full-charge pulse and planet-breaker damage reserved for completed charge.


Charge appearance preference correction: restore the original compact faceted charging orb, its size ramp and full-charge pulse. Keep a constant plasma-blue/cyan #8ae9ff throughout charging; remove the old mint-to-blue end-of-charge swap. Fired plasma shape/material and damage remain as before this correction. This supersedes the shared charging-envelope experiment.


Charging filaments: retain the compact faceted spherical charge, growth and full-charge pulse, but replace its plain blue material with the same cyan/violet twisting filament shader used by the fired projectile. Non-instanced shader variant omits instanceMatrix transforms for the charging Mesh. Both follow shared scene time, steady under reduced motion; no final-charge color switch.


Irregular planet breakup: Earth/Moon fragment velocities now originate from five randomized internal blast pockets with strong tangential scatter, wider speed variation, per-tile 0–0.24-second release delays and independent axis/speed tumbling. Cache seeded random motion once per explosion, not per frame; fresh runs differ. Preserve outward bias, smooth acceleration/spin onset, charge-to-burst continuity, fixed disappearance deadline and reduced-motion immediate hide. Reuses original tile instance buffers; no new fragment meshes.


Selected saucer: Hexagonal is now the default for UFOModel, PilotSaucer, the main scene and /ufo preview. Remove UFO type selection from the Flight Deck and preview UI. Keep Classic component and programmatic type option available in source for future use, without presenting a model chooser.


Ship collision performance fix: CrashEffects now incrementally prepares a reusable crash pool before impacts. Hex tile instances remain one batch with copied instance colors; continuous large hull geometry is partitioned into sectors during preparation. Clone geometry/materials only during preparation, warm zero-scale debris/spark batches for a rendered frame, then hide while idle. Trigger snapshots current world transforms into cached motion records; no crash-frame mesh/geometry/material creation. Repeated crashes reuse the same resources. Preserve gentle bounce sparks, 2-second crash/respawn and reduced-motion static sparks. Prepare Earth/Moon spatial indices in 384-instance tasks after model initialization; dent updates relocate affected hash entries instead of discarding the entire index. Clean up timers and owned pool resources on unmount/model change. Preparation uses a best-effort 3 ms task budget: one source-geometry split may exceed it, so this is not a hard frame-time limit. If a crash arrives before preparation completes, use already-prepared fragments and pooled sparks rather than blocking to finish preparation.

Verification: 90 scene tests, lint and production build pass. CPU-only audit script scripts/audit-crash-performance.mjs compares the same hull/canopy subset used in diagnosis; visual/GPU/production browser profiling remains pending saved localhost access policy. Do not claim a guaranteed live FPS or complete stutter elimination from these measurements.


Teardrop projectiles: reshape only the fired plasma envelope into a fuller rounded forward head (widest near local +Z 0.38) and smooth taper to a pointed rear at -2.25. More profile rings keep the bulb rounded. Shift the bright compact core toward the leading head; keep the shared spiral filament shader, charge orb, damage, pooling and flight direction. No extra draw calls or dependencies.


Max-power lunar damage correction: Moon crater marks and local tile debris continue during charging/exploding phases, not only while intact. Whole-planet explosion skips tiles already owned by local ejecta and never restores them after expiry. Lunar impact ejecta receive the radial fiery palette/heat before planet snapshot. Earth dent tiles remain part of Earth breakup. Preserve full-power one-hit breakup and solid lunar backing until the burst starts.


Earth impact smoke: eight pooled geodesic smoke rings, forty low-poly puffs each, one instanced draw. Consume existing Earth impact marks with charge power; ring expands along the spherical surface, lifts, billows and fades in 1.6–2.1 seconds. Charged blasts are thicker/wider. Inherit Earth rotation/reveal; keep impact center clear; disable under reduced motion and hide when Earth is gone. No textures, lights or fluid engine.


Lunar impact styling correction: reuse smoke rings on Moon with local survey radius 0.82, not Earth radius 3. Lunar ejecta retain original gray survey colors and no fiery local heat; whole-Moon burst retains original rock color ratios while fading. Keep existing pre-breakup red warning pulse, crater marks, solid backing, damage thresholds and Earth fiery palette.


Hex saucer landing gear: three simple six-sided tapered legs extend from the existing underside housings to small hexagonal feet. Legs lean gently outward and reach local Y -1.13. Housings and gear now belong to the fixed craft/cockpit group; the disc and central engine retain rotor motion. Static deployed model detail only: no deployment animation or landing simulation. Gear is included automatically in the prepared crash pool. Classic remains unchanged.


Lunar launch implementation: approved graphite hex platform on Moon local north pole, with instanced hex surface plates, cyan edge lamps and three foot markers. Main-scene UFO rests on pad with gear extended and no hover, follows the current pad world transform (including Moon motion). Launch Saucer starts a 2.6-second eased vertical lift; gear slides into housings after 0.85 seconds, then free flight inherits pad velocity and tangent heading. Chase camera follows during launch. Controls/fire are suppressed until lift ends; reduced motion skips directly to safe clearance. Exit pilot parks on pad; R and crash respawn relaunch from the pad when available. Destroyed Moon hides the pad; retain safe existing flight spawn fallback. /ufo inspection has no Moon and retains free-flight preview. Gear changes are ref-driven; no per-frame React state. Reference docs/references/moon/lunar-landing-pad-concept.png. Live visual check remains pending localhost browser access restriction.


Liftoff rim illumination: engine-power ref rises over the first 0.7 seconds of launch; smooth damping brightens the existing sixteen cyan rim lamps from emissive 1.25 to 4.25 and fades in soft Gaussian cyan halos. One additional instanced quad batch, no shadow lights or full-screen bloom. Keep steady flight glow, fade to parked state on exit/reset; reduced motion changes directly. Decorative halos excluded from crash pool.


Rotor launch timing: main-scene hex saucer disc is stationary while parked; spin speed follows damped launch engine power up to 1.8 rad/s, easing down on exit/parking. Standalone inspection without an engine-power ref retains decorative rotation. Reduced motion keeps rotor still.


Lunar pad size refinement: scale the complete platform to 80% (36% less footprint area). Lights, plates and foot markers scale together; parked UFO clearance uses pad world scale automatically. Craft size unchanged.


Launch camera gate: selecting Launch first moves the chase camera to the still-parked craft. Shared ref latches ready when camera position is within 0.4 world units and aim within 0.2 of the chase pose. Only then advance launch time/engine spin/lights, lift and gear retraction. Readiness stays latched through flight, resets on camera mode changes. Reduced motion also waits for camera positioning before immediate safe departure. No per-frame React state.


Launch handoff polish: preserve the exact Moon-aligned departure quaternion, then quintic-slerp to the live flight attitude over 1.2 seconds as controls become active; no immediate world-level rotation snap. Moon orbital/reveal updates run at frame priority -2, before ship (-1) and camera (-0.5), so parked/launch pose and inherited velocity sample this frame instead of stale previous-frame transforms. Reduced motion takes the direct attitude. Browser stutter/FPS remains unmeasured; these changes address confirmed ordering and orientation discontinuities.


Sign direction selected: option 4 from docs/references/picket-signboard-options.png, a broad wooden arrow on one chunky post. Keep simple bevels, broad wood grain, graphite hex bolts and a small hex-tile footing; use self-hosted Sabo for the final message. No sign component/message content implemented yet. Moon orbit distance increases from Earth*2.05+MoonRadius to Earth*2.8+MoonRadius (about 32% farther from center, 71% greater surface gap); retain size, 150-second period, tidal lock, pad and launch. Camera arrival tolerance allows 0.8 position/0.4 aim world units so steady following lag of the faster-moving wider orbit does not block launch.


JM lunar flag selected/implemented: option 2 from docs/references/moon/lunar-flag-options.png. Reusable LunarFlag beside north-pole pad: navy faceted fixed-fold cloth, cyan hoist stripe, cream dimensional J/M outlines generated from the actual self-hosted Sabo Filled font, faceted silver pole/top support and gray hex base. No cloth simulation/wind, downloaded textures, Drei HTML roots or new packages. Monogram vertices conform to the cloth folds. Moon-local radial placement follows orbit/tumble and hides when Moon breakup starts.


Flag reading direction: orient the printed +Z face toward the parked/launch chase view behind the saucer. Compute fixed Moon-local yaw around the flag radial-up axis; keep pole upright to terrain and keep lettering readable from departure camera. No per-frame billboard rotation.


Flag hoist/launch wash: raise cloth, lettering, support bar and attachment collars by 0.06 local units. A launch-only traveling ripple displaces cloth/stripe/monogram from cached original vertices with one shared function, anchored at the pole and strongest at free edge. Strength follows lift timing and damps away after departure; no perpetual lunar wind.


Lunar landing: L requests auto-land within 8 world units of the pad and a 60-degree half-angle cone above its normal. Approach over 1.9 seconds then descend for 2.3 seconds, tracking moving pad; extend gear and fade rotor/rim power on touchdown. Suppress flight/fire during sequence. Stay parked in pilot mode; L launches again through existing sequence. Invalid requests leave free flight unchanged; Flight Deck gives approach instructions. Reduced motion seats immediately. Moon destruction removes pad availability and falls back to flight.


Landing approach beacons: six small fixtures around pad corners brighten mint/cyan only when the piloted craft satisfies the same 8-unit/above-pad cone check as L-to-land; remain on during automated descent and fade off on touchdown/departure/out-of-range. Pilot publishes eligibility once per frame for pad visuals, no duplicate alternate range logic. Three instanced batches (posts, caps, glow rings); no new real-time lights/shadows. Existing decorative edge lamps remain separate.


Landing zone/beacon refinement: reduce landing range to 5 world units and cone half-angle to 45 degrees. Use that same eligibility for beacons and L. Fixtures share one parent group translating 0.105 local units up from inside pad as illumination rises; retract and darken when out of range or parked. Keep lit/extended during auto-descent. No per-instance matrix uploads for deployment.

- UFO disc finish: hex panels use roughness .42 / metalness .72; underlying hull .48 / .65; dark rim .38 / .75; rim rails .32 / .8. Existing panel shade variation and faceted geometry retained. Material-only change adds no geometry, textures, lights or draw calls.

- Lunar JM flag now ripples continuously at 30% strength, rising to full flutter during takeoff. Cloth, stripe and letters deform together; reduced motion keeps it still.

- Performance: shared beveled hex geometry indexed, 132 to 84 stored vertices with all 44 triangles retained. Applies to Earth, Moon and hex UFO, preserving normal/UV seams. See docs/performance.md.

- Once the intro enables flight, L enters pilot mode directly and starts the existing camera-settle / takeoff sequence. While piloting, L retains landing/relaunch behavior. Shortcut ignores held-key repeats, browser modifiers and text fields.

- Pilot camera enforces 1.35 world-unit hull/near-plane clearance after smoothing and Earth correction; conflicting boundaries move the camera outward from Earth. Applies during launch, flight and landing.

- Jetsons-inspired propulsion: three thin cyan anti-gravity rings descend and fade under the hex UFO, driven by smoothed engine power; off parked, ramps during launch, fades on landing. Three tiny reusable ring meshes, no lights/textures/postprocessing. Reduced motion holds static rings.

- Motion propulsion: two short tapered cyan trails build with thrust/reverse and fade while coasting; turning biases side brightness, rings lean opposite thrust and broaden under braking. Inputs smoothed with no React frame updates; two small meshes added, reduced-motion pulse disabled.

- Motion-reactive propulsion rejected and removed: no rear trails, turn brightness or braking expansion. Restored the original three simple engine-driven underside rings.

- Archive satellite model created at components/three/satellite/archive-satellite.tsx, inspect at /satellite. Six-sided beveled body and cream bezel, dark screen with illustrative pixel globe, seven hex cells per solar wing, dish, antenna, JM Sabo badge, rear vents. Static mesh model with owned geometry cleanup. Original website integration and main-scene placement pending; screen is placeholder artwork. Accepted generated reference saved docs/references/satellite/hexagonal-archive-concept.png.

- Satellite revision: deeper body and rear casing, double hex collars, layered side armor, dark recessed screen liner, heavier wing hinges, closed faceted parabolic dish and preview reflection cards. First model rejected as too simplified. Visual approval pending.

## Archive satellite rebuild — 2026-10-29

Replaced stacked prism model with an explicit tapered six-sided housing, truly recessed curved screen, dark gasket, beveled frame, surface-aligned panels, mechanical wing hinges, fitted solar cells, closed concave dish and tangential JM badge/status strips. Original Sabo JM contours retained. Static detail merged into eight material batches (8,168 triangles); single 256-square display texture replaces individual pixel meshes. Preview adds front/side/rear presets and error fallback; original website and main-scene placement remain unconnected. Seven targeted tests validate geometry, screen visibility and resource disposal. Offline exact-geometry Blender front/rear renders are saved with references; browser access remains blocked, so runtime WebGL appearance is unverified. See components/three/satellite/README.md.

Personal reference-3d-modeling skill created and validated with skill-creator. It guides reference measurement, geometry, materials and multi-view QA; no extra modeling app or packages installed.

## End-of-day approval — 2026-10-29

Jacob approved the rebuilt archive satellite ("its absolutly awesome"). Preserve this model as the accepted design. All 110 automated tests, ESLint and production build passed for the checkpoint. Reference modeling skill is now also preserved at .agents/skills/reference-3d-modeling/SKILL.md for repository portability. No deployment or old-website integration is included.

## Separate UFO reference rebuild — 2026-10-29

Using reference-3d-modeling, built a new reference variant from docs/references/ufo-hexagonal-six-views.png. The current hexagonal and Classic models are preserved; main-scene default remains hexagonal. /ufo opens the new variant with a comparison selector. Broad regular hex plates, shallower silhouette, inset belt, faceted teal cockpit and recessed engine/vent wells; 120 plates, 17 total batches and 15,012 triangles including hidden gear. Original movement/power/gear/weapon conventions retained. Six exact-model offline Blender views saved in docs/references/ufo-reference-rebuild. See components/three/ufo/reference-model.md for dimensions and verification limits. No approval to replace the main-scene saucer assumed.

UFO refinement: continuous cockpit collar/gasket, calmer upper plate relief, deeper teal canopy, slimmer rim rails and further inset lamps. Same 17 total batches, 15,588 triangles including gear; four targeted tests, lint/build pass. New generated hex-design evolution options saved with UFO references for review before constructing chosen next version.

## UFO Version 3 — angular design

Jacob chose option 3 of hex-design-evolution-options.png. Built standalone v3 factory/component with true six-sided shallow hull, fitted beveled hex armor, actual canopy/engine/vent cutouts, six rim lights, six-sided collar, engine and vent surrounds. 174 panel pieces, 17 total batches / 11,986 triangles including hidden gear. /ufo defaults to Version 3 with previous versions available; main-scene default remains unchanged. Seven targeted UFO tests, lint/build pass. Six exact-model offline Blender views saved under docs/references/ufo-v3; three-quarter/underside/side inspected. See components/three/ufo/ufo-v3.md.

## Landing gear suspension

Added analytic touchdown compression/rebound and prelaunch crouch/unload shared by current hexagonal, reference and v3 models. Body and leg transforms compensate to anchor feet during compression. Landing contact at 4.2s, settlement complete at 5.05s; launch remains 2.6s with .35s load release before lift. Reduced motion skips bounce. /ufo includes Test landing gear for inspection. Eight targeted motion tests pass; no new geometry, packages or lights. See UFO README for scope and review limits.

## Independent object dragging

Earth no longer rotates from arbitrary canvas drags: a shared nearest-object gesture controller now selects Earth, Moon or the settled particle lettering on pointerdown. Terrain uses sphere proxies; lettering uses per-instance sphere proxies only on pointerdown, avoiding per-triangle raycasts over terrain meshes. One pointer owner prevents simultaneous rotations; pointer loss, blur, multiple touches and mode changes cancel cleanly. Blank-space dragging does not rotate Earth.

Moon gets a camera-relative manual orientation offset inside its tidal-lock/orbit parent; pad, flag and terrain rotate together, while orbital translation stays unchanged. The control frame updates before the parked ship samples the pad. The selected manual orientation persists; tidal-lock mathematics remains the underlying baseline.

Dragging formed Jakes Space lettering adjusts its angular offset on the existing Y orbit, preserving height/radius. Auto-travel pauses while held and resumes on release. Screen movement is projected onto the orbit tangent for the current camera; a short damped catch-up softens the drag. No orbit tilt or font changes. Intro, destroyed objects and pilot mode disable their respective drag actions; reduced motion permits direct manipulation without automatic motion. Inspection pages retain their existing OrbitControls.

Twelve relevant geometry/drag/orbit tests pass. Four new drag tests cover exclusive nearest ownership, disabled/blank hits, touch/capture/blur cleanup, transformed instances and orbit projection. Lint/build pass; browser interaction review remains blocked by saved localhost permission.

## Matte hex black-hole component

Implemented separate BlackHole component and /black-hole inspection from corrected hex-sphere concept. Core is a genuinely tiled matte black sphere: 1,430 hexagons plus twelve pentagonal spherical junctions, sealed foundation, roughness 1 and zero metalness. Five dense uneven amber/bronze/graphite bands and loose outer fragments total 3,322 instances. Faster inner orbit with group-only transforms; pause/resume and reduced motion supported. Ten draws, 200,984 triangles; no textures or packages. Exact geometry rendered offline in docs/references/black-hole/model. Two targeted model tests validate topology, normals, closure, materials, orbit and unchanged instance buffers. Browser interaction remains unavailable to agent. No main-scene integration or gameplay assumed. See components/three/black-hole/README.md.

## Black hole Version 2

Separate wide-disc variant added while preserving original. /black-hole defaults to V2 and exposes version / Light bending controls. Seven wider accretion bands plus debris: 7,121 fragments, outer debris radius6.35, 12 model draws / 368,140 triangles. Core remains opaque matte black. Optional transparent screen-space annular refraction samples a <=768px offscreen buffer; no self-feedback, depth-tested foreground/core, final tone mapping. It costs one additional scene render and a plane draw; toggle for comparison. Four V1/V2 tests and lint/build pass. Offline renders review model geometry only; live lens shader appearance/GPU costs remain unverified because browser permission is blocked. No Earth scene integration or physical lens simulation assumed.

V2 lensing strengthened: radial UV displacement .075 to .13, tangential .018 to .038, broader .46 radial envelope with outer fade starting2.9 and ending3.1; blend .97. Same capture size, geometry and render passes.

V2 secondary-disc lensing: same capture now hides the hex core as well as the lens plane, sampling the unobscured disc into an apparent narrow ring at radii2.08–2.62. Stronger upper and smaller lower arcs, camera-angle dependent, from the actual moving hex disc image. Core is restored/opaque in the main render. No second capture, no duplicate fragment meshes; approximately21 model submissions instead of25. Three V2 tests, lint/build pass; shader appearance remains unverified in blocked browser. NASA physical references recorded in black-hole README.

Secondary lens image increased after positive user review: apparent radial span .54 to .72 (2.08–2.80), brighter image gain1.45, stronger lower arc .78 and broader angular weighting. Radial displacement .17 / tangential .055; radial envelope .56. View-angle minimum raised to .35. Same geometry, capture and texture sample count.

Lensing smear correction: user reported smeared/stretched appearance. Replaced edge-on viewing-camera source capture with an orthographic top-down disc atlas, square384–768px. Direct polar sampling renders the secondary upper/lower arcs; large viewport UV warp removed. Empty atlas areas stay transparent over unchanged primary scene. Same single capture; no duplicated geometry. Four V2 tests validate bounds/source mapping; browser visual review remains unavailable to agent. This supersedes prior screen-warp parameters.

Level-disc blue-artifact correction: lens atlas includes cool-lit graphite; edge-on arc strength exposed those reflections as a blue secondary ring. Secondary-image alpha now uses a red-dominant warm-light mask (normalized warmth .035–.16), rejecting neutral/blue reflections while preserving amber emission. Original disc materials/lighting and Version1 unchanged. Added warm/cool source regression checks; live visual confirmation remains needed.


### UFO consumption test (2026-10-29)

The /black-hole preview includes a separate Version 3 UFO and Send UFO / Replay / Reset controls. It approaches from X=8.1 at 0.65 units/sec; each original panel or mechanical piece releases when its center reaches the 6.3-unit capture sphere. Larger continuous rails/foundation split into six angular sectors. Pieces spiral inward over 3.4 seconds, shrink late, and disappear behind the opaque core. This is a staged proximity demonstration, not integration with free-flight gameplay or a gravity simulation.

Fragment attributes are prepared once, preserving the original material batches and triangle count. The vertex shader moves/rotates whole pieces using a shared clock; replay changes that clock without rebuilding geometry. Original UFO factory defaults and all other previews remain unchanged. Pause orbit also pauses consumption; reduced motion gives the direct consumed result. The UFO is excluded from the disc atlas to avoid cyan contamination of the approved warm lensing.

Verification: deterministic proximity timing, bounded progress, complete finite fragment attributes, original geometry/batch preservation, shader injection and reuse are covered by scripts/test-black-hole-consumption.mjs. Browser appearance and frame time require user review because saved localhost browser permission is blocked.


### Earth and Moon consumption tests (2026-10-29)

The black-hole preview now selects UFO, Earth or Moon. Switching targets resets the test and loads only the selected model. Earth and Moon reuse all original map/survey hex tiles, normals, relief, color and overlap ratios, at preview radii 1.55 / 1.1. Their clouds, lunar pad/flag and other main-scene gameplay stay outside this isolated test. Assets load under Suspense with the existing preview error boundary.

Each surface remains one instanced draw plus one sealed backing sphere. Shared consumption logic replaces the instance transform in Three's position, world-position and normal shader chunks; static instance matrices/colors are never rewritten while playing or resetting. Tiles reach the same 6.3-unit capture zone, then peel and spiral inward with the UFO timing. The backing recedes between first and last detachment to avoid leaving an intact ball behind; reset restores it. These tests do not change the Earth/Moon models or destruction behavior in the main scene. The selected target remains excluded from the warm disc atlas.

Regression coverage in scripts/test-black-hole-planets.mjs checks every tile's capture-sphere intersection, original linearized surface colors, shader transform use for positions/normals, backing reset, unchanged GPU buffer versions and disposal. Live browser appearance/FPS still requires user review under the saved browser restriction.


Planet consumption stream refinement: detached Earth/Moon tiles no longer preserve a uniformly rotating shell. Each instance has three deterministic seed values prepared once. On detachment, seeded speed (1.0-1.7x), independent tumbling and an immediate smooth size reduction separate neighboring pieces. Exponential inward pull and fast convergence toward the tilted disc plane gather them into a narrow curved stream, with bounded lateral scatter. Every path begins exactly at the released tile center and ends inside radius 1.65 within the existing 3.4-second maximum; reset reuses seeds and buffers. UFO behavior stays as approved. Added tests for detachment continuity, immediate speed spread, inward travel and convergence from different latitudes. Browser appearance remains a user review item.
