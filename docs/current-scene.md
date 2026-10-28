# Current scene — checkpoint 2026-10-28

This document is the source of truth for the current implementation. Older refinements in architecture.md and AGENTS.md describe the design history; when values conflict, use this snapshot and the code.

## Experience

The root route is a full-window black WebGL scene with only a persistent asset progress bar along the bottom. No header, slogans, preview link, replay control or backdrop selector is shown. Errors still provide a retry path; loading status is available to assistive technology.

Earth loads and scales in first. Its reveal completion callback starts one continuous particle formation reading exactly **loading jakes world**. Individual letter starts overlap. Text stays invisible until its formation starts, converges from scattered positions, and remains formed afterward. There is no longer a separate LOADING-to-name dispersal transition. Required assets must be ready before completion is signaled. The percentage is Three.js LoadingManager item progress, not a simulated animation percentage or byte/GPU measurement.

The settled phrase orbits clockwise viewed from Earth's north pole, easing up to 0.18 radians/second (about 35 seconds per revolution). Its vertical midpoint is y=0.35, aligned with Earth's center. Text stays independent of manual Earth rotation. The globe naturally occludes far-side lettering. Magnetic hover affects nearby visible text particles and is disabled during dragging.

## Earth, water and clouds

- BlockEarth: components/three/planet/, 20,921 shared beveled cube instances. Deterministic geometry is generated offline from NASA Blue Marble July 2004 color and scaled GEBCO/NASA topography. Fine land/coastal cubes, larger ocean tiles, green/tan land, white ice, exaggerated stepped relief. Source credits, limitations and regeneration details are in that directory's README.
- Main Earth radius: min(6.5, viewport aspect * 9.4), center [0, 0.35, -9]. This is deliberately much larger than the original backdrop globe. /earth retains an independent inspection scale and six view buttons.
- Earth orientation: 23.44-degree axial tilt. Free camera-relative quaternion drag supports horizontal and vertical movement. Idle spin pauses while held, then eases back to 0.035 rad/s, approximately three minutes per revolution. Manual orientation persists.
- Ocean ripple: an explicit oceanMask selects blue tiles. A periodic crest travels by spherical angular distance, lifting cubes radially up to 0.055 base units with the letter pulse's soft response. Land remains fixed. Translations derive from immutable rest positions to avoid accumulated drift.
- Clouds: components/three/clouds/ contains reusable billow, wisp, bank and spiral sculptures plus a batched CloudLayer. Twenty-four smaller scattered patches sit at base radii 3.22–3.325 plus local relief, close enough for peaks to pierce them. Formations are 55% smaller than their first version. Keep the text band relatively open. Clouds inherit Earth's tilt, drag and spin, plus a gentle local-Y drift of 0.008 rad/s. Use shared beveled cube geometry and a cool pearl palette.
- FluidKit's fullscreen backdrop and later spherical atmosphere experiment were both removed. The component and npm dependency are absent. Use the cube clouds as the current atmosphere direction.

## Text and camera

Sabo Filled is self-hosted; Regular is the outline face, not a lighter weight. Current particle asset: public/models/loading-jakes-world.json (5,793 cubes). The lettering maps onto a front spherical arc rather than a flat plane. Radius = Earth radius * 1.2 + 0.6; font scale fits about 2.1 radians. Cube depth and tangent orientation remain three-dimensional.

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
