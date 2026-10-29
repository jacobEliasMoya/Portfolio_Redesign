> Current implementation checkpoint: see [docs/current-scene.md](docs/current-scene.md) for the active design, values, components and verification limits. It supersedes earlier experimental values in this document. [CHANGELOG.md](CHANGELOG.md) records the 2026-10-28 work. Continue to explain what changes, why and how it was verified; follow Jacob's flow.

# Jacob Moya — 3D portfolio working agreement

## Collaboration and explanations

- Follow Jacob's flow. Explore his ideas without predicting additional features or making design decisions ahead of him.
- Distinguish planning from implementation. Discussion, questions, and speculative ideas are not authorization to start building. When implementation is explicitly requested, complete the agreed scope.
- Do the work AND explain it. Before a meaningful change, explain what will change and why. During the work, explain important concepts and tradeoffs in plain language, using concrete examples. Afterward, explain what changed, how it functions, how it was verified, and any remaining limitations.
- Help Jacob learn Three.js, React Three Fiber, rendering, async loading, and the architecture as the project develops. Do not silently produce finished code with no explanation. Scale explanations to the task; do not overwhelm him with implementation detail.
- Keep updates concise and conversational. Ask when a material preference is missing; do not repeatedly ask for approval already given.
- Work in this project checkout. A separate clone exists in the user's home directory and is not automatically synchronized. Do not maintain two independent working implementations or overwrite either clone without a reason.

## Design direction and preferences

- Evolve the earlier interactive.jacobmoya.com space portfolio into a playful, beautiful 3D experience. Preserve its personal, exploratory character.
- Inspiration: Game Boy Advance era pixel graphics, evolving into 3D and eventually potential VR. Aim for luxurious lighting, tactile depth, and extremely smooth, deliberate animation.
- Planned composition: a plane tilted away from the viewer, with its far edge rising into the scene; pixel-like foreground elements lift on hover; a 3D spaceship flies over and around it.
- Typography: Sabo by Philippe Moesch is selected. Self-host the supplied font files. Filled is the main display face; Regular is the outline design, not a lighter weight. Use a readable companion for long prose. Prefer independent designer/Behance releases over Google Fonts. Do not reintroduce Google Fonts by default.
- Logo direction: the current loader reads Jake, using the selected Sabo Filled Particle Core design. Build a dense readable volume from varied-size overlapping blocks and smaller loose edge fragments. Overlap is explicitly approved. Keep modest bevels, a slightly low-poly character, silver/graphite materials and a pure black (#000000) background. This supersedes the earlier sparse Sabo outline direction. Regular is the outline face, not a lighter weight.
- Particles must look crisp and pixel-like. For the planned JM, use actual small cube instances distributed through the Sabo-shaped letters' volume: readable from the front, sculptural when rotated. Do not substitute soft circular stardust or flat sprites for this object.
- Initial palette tokens and the current cube platform are exploration tools, not final approved portfolio art direction.
- Prefer free models/assets with clear permitted web use. Record creator, source, licence and required attribution. Do not assume that a free download grants unrestricted use.

## Current scope and next steps

- Implemented: self-hosted Sabo, design tokens, atomic HTML UI, reusable 3D canvas/object/scene structure, a foundation preview, reduced-motion behavior, and standard Tailwind PostCSS configuration.
- Implemented loader: black scene, real Drei progress, Particle Core Jake, replay, cursor-following orientation, magnetic hover, sequential letter pulses, reduced motion, failure/timeout handling and studio entry. Quotes and the full universe scene are not implemented yet.
- Planned loader: show a universe-themed quote before revealing the scene. The source may be internal or external; an external provider has not been chosen. Never invent real-person quote attributions. Quote retrieval should have timeout/failure handling and a local fallback.
- Track real asset loading. Drei useProgress reports Three.js LoadingManager item progress, not complete byte-level or GPU readiness. Track quote requests and scene readiness separately. A timed introduction is not measured loading progress. Only signal ready when the required scene is usable; keep errors and retries explicit.
- Keep the loader's own visual assets lightweight and available early. Do not gate loading the main scene on dismissing a loader that depends on that scene loading first.
- VR is a future possibility, not current implementation scope. Do not install or build every optional feature in advance.

## Application architecture

- app/: Next.js routes, metadata, fonts and global styles. Keep routes thin.
- design-system/: shared color, spacing, motion and renderer tokens. HTML receives CSS variables; Three.js uses the same token values. CSS pixel/rem sizes are distinct from world units.
- components/ui/atoms, molecules, organisms: reusable accessible HTML components using atomic composition.
- components/three/canvas: browser-only renderer, quality limits, Suspense and rendering failure fallback.
- components/three/objects: reusable objects and local interactions, such as the future ParticleJM and Spaceship. No quote requests or global readiness decisions here.
- components/three/scenes: compose cameras, lights and objects.
- features/: coordinate interface, scenes, data and application state. Future quote fetching/loading coordination belongs to a loader feature.
- hooks/: reusable browser behavior, including reduced-motion preference tracking.
- See docs/architecture.md for the current structure and usage.

## Packages and tools

package.json and package-lock.json are the source of truth for installed versions. Use npm and commit lockfile changes with dependency changes.

Installed runtime foundation:
- next 16.4.3, react/react-dom 19.3.0, TypeScript 5 and the Next.js App Router.
- three ^0.186.1: 3D engine.
- @react-three/fiber ^9.8.2: React renderer for Three.js. Stay on the stable React-19-compatible Fiber 9 line unless a migration is explicitly agreed.
- @react-three/drei ^10.7.9: scene helpers, OrbitControls, model/font loading and loading-progress utilities. Prefer supported helpers over rebuilding standard functionality.
- @dilukangelo/fluidkit ^0.5.0: approved MIT WebGL2 fluid backdrop engine. Smoke/Hero/Goo are recipes over its public API, not an exported preset enum. It owns a separate canvas; do not share raw WebGLTexture handles across renderer contexts.
- @types/three ^0.186.0: Three.js types.
- tailwindcss 4 and @tailwindcss/postcss ^4.3.3: standard CSS integration. @tailwindcss/turbopack remains in the original dev dependencies but is no longer configured as a custom CSS loader; do not restore that old loader setup.
- ESLint 9 with eslint-config-next; Node and React types are installed as development dependencies.

Discussed options, NOT installed or automatically approved for inclusion:
- @react-spring/three for spring-based hover and assembly motion.
- @react-three/postprocessing for restrained scene finishing effects.
- gltfjsx for converting models to reusable React components.
- leva for development-only scene controls.
- @react-three/rapier for physics only if needed.
- @react-three/xr for later VR/AR work.

No editor/browser extension has been selected or made a project requirement. Do not invent an extension requirement or install one without agreement. Prefer existing browser/dev tools and package documentation. Add optional packages only when a concrete approved feature needs them; check compatibility and explain the purpose.

## Rendering, accessibility and verification

- Keep WebGL and browser APIs inside client boundaries. Load the 3D scene client-side; retain useful HTML if WebGL is unavailable.
- Use React state for discrete UI changes and refs/useFrame with delta-based motion for per-frame updates. Do not set React state every frame. Give each animated property one owner.
- Share geometry/materials and use instancing for large cube populations. Do not create thousands of independent React meshes for the particle JM.
- Cap device pixel ratio; tune particle counts and quality for mobile. Use demand rendering when settled and request frames while animation is active. Avoid unnecessary renderer remounts.
- Respect system reduced motion; offer an additional user control. Keep essential text/navigation in HTML, preserve keyboard focus, provide accessible equivalents for essential interactions, and handle loading/rendering failures.
- Check npm run lint and npm run build for meaningful implementation changes. Verify changed interactions in the browser where available, including narrow layouts. State any verification gaps honestly. Do not add tests that merely mirror trivial implementation.
- npm run dev runs the local preview; npm run start serves a production build. Keep this repository local unless publication is requested. A Git push is not deployment authorization.
- Keep source, selected fonts, asset provenance and architecture documentation in the repository. Do not commit node_modules, .next, scratch files, credentials or machine-specific font installation state.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## Current loader behavior and preferences

- Particle Core Jake uses 1,327 rounded cube instances: 1,240 overlapping core blocks plus 87 loose fragments. scripts/generate-wordmark.py samples Sabo Filled outlines; version-3 assets include scales, fragment flags, letter indices, centers and radii. The older jake-voxels.json outline is retained but unused.
- Core blocks should remain nearly settled and overlap where helpful for readability. Loose fragments drift and rotate more. Reduced motion disables drift, rotation, breathing and attraction.
- Magnetic hover maps the cursor to the wordmark's local 3D plane and attracts only nearby blocks within 1.35 world units. Use squared falloff, bounded attraction, slight forward lift and a damped return. Fragments respond twice as strongly. Ignore touch hover and disable attraction in reduced motion.
- Pulses run J, A, K, E sequentially after assembly, from each letter's own center outward. Brightness, expansion, forward lift and size respond additively; fragments respond more strongly. Jacob prefers the larger wave, roughly 2.5 times the original expansion/lift with stronger brightness. Keep the name readable and avoid flashing.
- Pulse recovery must be soft: follow the wave quickly, then damp each particle back over about one second. Letter peaks remain sequential; neighboring source waves and recovery tails overlap for fluid movement. Starts are 0.75 seconds apart with 1.1-second sweeps, a 0.65-second rest and 0.6-second initial delay. This supersedes the earlier isolated pulse timing. Timing lives in components/three/animation/letter-pulse.mjs. Replay clears its clock and per-particle state. Reduced motion keeps only a brightness wave at 18% strength with 80 ms updates, without spatial displacement/scaling.
- The rejected custom liquid shader was removed. Use the approved FluidKit engine instead: Smoke/Hero/Goo/Off controls, sharp lettering and black base. The adapter copies the library canvas into a Three.js CanvasTexture on a plane behind the wordmark at z=-4. Upload follows FluidKit rendering in a microtask because onFrame precedes its render. Simulation resolution is 96, dye 256 (Goo 128), source width capped at 384 CSS pixels. Clean up simulation, canvas, texture and listeners; unsupported WebGL2 remains black. Reduced motion destroys the simulator. Do not restore the rejected shader.
- Introduction: LOADING forms one letter at a time with a center-outward pulse, holds until assets are ready, dissipates, then the same instanced pool gathers into Jake. The LOADING asset has 828 positions including 114 fragments, two depth layers and 0.12-unit cubes. Use proportional particle mapping and tiny deterministic offsets to prevent identical stacked surfaces.
- Keep choreography separate from real download progress. No artificial percentage. The timing module is components/three/animation/loading-intro.mjs. Cursor effects and Jake's repeating pulse begin after Jake settles. Replay restarts the whole introduction without re-fetching cached assets. Reduced motion shows static LOADING briefly and switches to Jake when ready, without dispersal. Preserve completion when motion preference changes.
- Generate volumes with scripts/generate-wordmark.py using --text, --output, --spacing, --cube-size and --layers. FontTools is needed only for generation. Run npm run test:intro and npm run test:pulse alongside lint/build for animation changes.


Wordmark refinement: LOADING and Jake use the same Sabo font scale and 0.18-unit base blocks. Generate LOADING with --match-text Jake (2,008 positions including 136 fragments, four layers). Fit both words using one shared responsive group scale; do not shrink LOADING independently to match word width. Initial particles are visible scattered cubes that converge into each letter over 0.85 seconds, with overlapping 0.48-second letter starts. Do not reveal letters by growing cubes from zero scale. The larger pool maps to both assets with small deterministic offsets to avoid duplicate surfaces. This supersedes the earlier 828-position smaller LOADING and center-outward growth.

Particle visibility refinement: hide each letter's particles completely until its convergence begins. Reveal them quickly during the start of that motion, then keep them visible through dissipation and the Jake transition. Do not display the waiting scattered field before the introduction. This supersedes the initial always-visible particle field; preserve reduced-motion static text.

Introduction pacing refinement: shorten letter starts to 0.3 seconds apart with 0.65-second convergence, allowing neighboring formations to overlap continuously. Initial delay 0.1 seconds, readable hold 0.15 seconds, dissipation 0.8 seconds, Jake gathering 1.7 seconds. Broaden the initial visibility ramp to the first 30% of formation progress so revealing cubes feels less abrupt. This supersedes earlier intro timing values; actual readiness still gates the transition.

Final wordmark is now JakeSpace 2.0, replacing Jake. Use public/models/jakespace-particle-core.json (3,847 cubes, 247 fragments), generated with --text "JakeSpace 2.0" --match-text Jake. Keep the same font scale and cube size as LOADING, fitting both shapes in one shared frame. Pulse all non-space characters in order, including digits and punctuation; whitespace preserves spacing without a pulse delay. Earlier Jake counts refer to the retained prior asset.

Camera direction: replace cursor-following wordmark rotation with a choreographed scene-camera dolly. Keep the wordmark orientation fixed and preserve local magnetic hover. Closed cubic Bezier paths lean in with sideways/vertical arcs as LOADING forms, pull out during dissipation, then lean into JakeSpace 2.0 and settle at the home view. Small overlapping accents follow letter timing; damp both camera position and aim. Camera uses the same intro clock and readiness gate, replay restarts choreography, reduced motion holds a fixed camera. Update camera matrices before magnetic raycasting. Timing/path helper: components/three/animation/camera-choreography.mjs; verify with npm run test:camera. This supersedes earlier cursor-following orientation preferences.

Camera correction: the initial gentle whole-word dolly was too subtle. Use actual per-letter close-up shots for LOADING: compute each glyph center in world space with the fixed group rotation/scale, fit that glyph to roughly 75% of the frame, travel between glyphs along curved Bezier segments, then pull back for the full-word reveal. Track both camera position and aim, including target depth; use faster damping to follow the short letter intervals. Preserve magnetic hover and the reduced-motion static view.

Front-facing camera correction: remove the wordmark group tilt entirely (rotation zero). Keep camera and target X/Y aligned, centering each glyph while looking straight along the Z axis; no oblique or sideways viewing angle. Curve the depth between shots to lean out and back in. Slow letter starts to 0.85 seconds, formation to 1.15 seconds, hold to 0.45 seconds, scatter to 1.1 seconds and gather to 2.3 seconds. Each close-up anchor arrives 0.5 seconds into its letter formation. This supersedes the angled composition and fast 0.3-second camera travel.

Camera polish: use quintic easing with zero endpoint velocity/acceleration and gentler damping (9) for softer travel. Deepen each close-up from 75% to roughly 95% glyph framing, with a 0.55-unit minimum distance and larger 1.8-unit pullback controls between letters. Give movement room to settle: letter starts 1.1 seconds apart, formation 1.4 seconds. This supersedes the earlier camera depth and 0.85-second stagger.

Pulse pacing refinement: speed the wave to 0.85 seconds per letter with starts 0.5 seconds apart, so the next letter begins while the previous wave is finishing (0.35-second overlap). Initial delay 0.4 seconds, cycle rest 0.35 seconds. Preserve existing amplitude, soft damping/recovery and reduced-motion brightness cap. This supersedes earlier 1.1-second sweep / 0.75-second pulse interval values.

Camera framing refinement: back out from the extreme close-ups. Frame the active glyph at roughly 40% of the view with a 1.2-unit minimum camera distance, keeping neighboring letters visible. Reduce the between-letter pullback controls to 0.8 units. Retain front-facing aim, smooth easing and slower pacing. This supersedes the 95% close-up framing.

Lens experiment: use an 85-degree perspective lens for the letter inspection, move closer and frame the active glyph around 55%, then ease back to 40 degrees for the full-word reveal. This is a fisheye-inspired wide-angle test, not a true nonlinear fisheye distortion shader. Keep reduced motion at 40 degrees and update projection before magnetic raycasting.

Wide-lens framing correction: the 55% letter close-up was still too tight. Back out to roughly 25% glyph framing with a 1.8-unit minimum distance, retaining the 85-degree lens test and smooth front-facing camera movement. This supersedes the prior close-up distance.

Introduction timing correction: start the next letter after 0.75 seconds rather than 1.1 seconds. Keep each formation at 1.4 seconds, scatter at 1.1 seconds and gather at 2.3 seconds. The intent is earlier overlapping starts, not faster individual particle motion. Camera anchors remain synchronized to the letter starts.

Final lettering update: the second formation now reads exactly "jakes world" (lowercase, no apostrophe), replacing JakeSpace 2.0. Use public/models/jakes-world-particle-core.json generated with --match-text Jake. Preserve the same LOADING introduction, shared font scale, convergence timing, camera choreography, magnetic attraction and sequential pulses through non-space glyphs.

## Block Earth component

The Earth model lives in components/three/planet/ (BlockEarth, barrel export and construction/provenance README). Use real varied-size rounded cube instances on a sphere, with finer continent/coast blocks and exaggerated stepped map-derived mountain relief. Pure-black scene, cobalt/navy oceans, green/tan land, white snow; no lettering baked into the planet. NASA Blue Marble/GEBCO data determines geography; AI concept sheets determine styling only. Current asset has 20,921 cubes and is generated offline with scripts/generate-earth.py from local downsampled source maps. Retain provenance, avoid pretending 8-bit scaled elevation is raw survey data, and acknowledge approximate RGB land classification. /earth is the independent six-view orbit preview. The loader reveals it behind the final text during reassembly. Respect reduced motion, shared geometry/materials, responsive sizing and resource cleanup. No new npm dependencies were added.

Earth composition: dramatically enlarge the loader globe to radius up to 7.5 units (responsive cap aspect * 10.8), positioned at z=-9 so its raised surface stays behind the lettering. This supersedes the earlier radius-3.5 background globe. Keep the standalone /earth inspection scale unchanged.

Ocean ripple: generated oceanMask explicitly marks blue water instances. A periodic rounded crest travels by angular distance from a Pacific epicenter; blue cubes lift radially up to 0.055 base units, using the same fast-attack/soft-release response as the text pulse. Update only ocean instance-matrix translations from immutable rest positions, keeping land/ice/mountains fixed and preventing drift. Run while revealed, request frames during motion, restore rest positions once hidden or reduced motion is enabled. No React state updates per frame. Helper: ocean-ripple.mjs; npm run test:earth includes mask and traveling-wave checks.

Wrapped introduction: use one particle asset reading exactly "loading jakes world" (5,793 blocks) and one continuous sequential convergence; no LOADING-to-name dispersal swap. Map flat Sabo samples onto a front equatorial arc with wrapPoint, scaled smaller to span about 2.1 radians outside the Earth relief. Keep glyph depths and tangent rotations. Stagger 0.32 seconds, formation duration 1.4 seconds. Camera still follows letter shots and pulls back at the complete phrase; asset readiness gates completion. Replay is explicit only; never auto-restart. Earth is visible throughout. BlockEarth draggable prop enables captured horizontal mouse/touch drag around Y only, damped independently from camera/text, with cleanup and touch-action restoration. Reduced motion permits direct user rotation but freezes autonomous effects. Magnetic text attraction uses distance to the camera ray for curved lettering, disabled during drag.

Current presentation supersedes earlier loader UI/backdrop: full-window black WebGL scene only, persistent actual asset-download bar at the bottom, accessible status text visually hidden and retry shown only on failure. No header, slogans, preview link, replay button, background selector or FluidKit. FluidKit component and npm dependency were removed. Earth loads and scales into view first; its onRevealed callback after settling beyond 98% starts the text clock and camera sequence. Text remains hidden and its clock paused before that callback. Do not use an arbitrary delay to coordinate the stages. Earth drag, ocean waves, wrapped text and reduced motion remain supported.

Atmosphere experiment: user approved restoring @dilukangelo/fluidkit 0.5.0 only as a transparent spherical shell, not the removed fullscreen backdrop or selector. FluidAtmosphere lives in components/three/planet/. Shell radius = Earth radius * 1.18 + 0.14, inside text radius Earth * 1.2 + 0.6. Fade in after Earth settles. A low-resolution real FluidKit dye simulation on a separate hidden-but-sized canvas feeds a CanvasTexture; upload in a post-render microtask before buffer clearing, capped at 30 Hz. Triplanar sampling blends three projections to avoid longitude seams and polar pinching. Additive blue-white wisps with stronger rim visibility, depth test enabled and depth writes off preserve solid terrain/text. Raycast hover splats map to the same three projections; ignore held buttons/touch so dragging still rotates Earth. Respect reduced motion by destroying the simulation/hiding the shell. Remove listeners, source canvas, GPU textures and simulation on cleanup. Missing WebGL2 float support gracefully omits atmosphere. This is a 2D-fluid projection on a sphere, not volumetric atmospheric physics. Current implementation needs visual/device validation.

Text orbit: after the single wrapped phrase finishes forming, rotate its particle targets around Earth's Y axis (center z=-9), clockwise viewed from the north pole. Ease up to 0.09 radians/second (about 70 seconds per turn) without restarting the formation or moving the camera. Rotate cube tangent orientation with the current target, preserve pulse/magnetic effects on the visible hemisphere and let Earth occlude lettering on the far side. Orbit is independent of Earth drag. Reduced motion freezes orbit; replay resets its clock. Pure helper: components/three/animation/text-orbit.mjs.

Planet size refinement: reduce the main-scene Earth radius from 7.5 to 6.5 units (responsive cap aspect * 9.4), about 13% smaller. Atmosphere and text orbit derive from the same radius so their spacing stays consistent. Keep center z=-9 and the standalone /earth inspection size unchanged.

Earth rotation refinement: main scene supports free camera-relative quaternion drag in both horizontal and vertical directions, no Y-only restriction. Earth has a 23.44-degree axial tilt, with its slow idle spin around the tilted local Y axis (0.035 rad/s, roughly three minutes per turn). Pause idle spin while dragging; ease it back after release without resetting user orientation. Keep user orientation, axial tilt and local spin in separate nested groups. Reduced motion disables idle spin but permits direct manual turning. Standalone six-view preview disables axial tilt for its exact reference views. Atmosphere, text orbit and scene-camera choreography remain independent. This supersedes the Y-axis-only drag preference.

Atmosphere direction superseded: user rejected the fluid shell. Remove FluidAtmosphere and FluidKit dependency. Design several 3D cloud styles matching Earth's varied-size beveled cube construction before adding any cloud geometry. Keep the globe, ocean ripples, free drag/idle rotation, tilted axis, orbiting text and camera choreography intact. Cloud concepts are exploratory, not approved implementations.

Text orbit speed: increase clockwise rotation to 0.18 radians/second, approximately 35 seconds per revolution. Preserve the smooth two-second acceleration, orbit radius, formation timing, independent Earth rotation and reduced-motion pause. This supersedes the previous 0.09 rad/s value.

Cloud implementation approved: components/three/clouds/ owns deterministic billow, wisp, bank and spiral cube sculptures, standalone CloudShape and a batched CloudLayer. Eleven sparse patches sit just above the mountain envelope, curved along the sphere with the equatorial text band kept open. CloudLayer is passed as children to BlockEarth so reveal scale, free drag, axial tilt and idle rotation stay aligned; slow additional local-Y drift gives atmospheric movement. Pearl/cool-white beveled cubes, one shared geometry/material and one instanced draw for all patches. Fade in after Earth settles; reduced motion freezes drift. No FluidKit or volumetric shader. Check npm run test:clouds for finite deterministic shapes, shell clearance and equatorial spacing.

Text orbit centering: wrapPoint uses y = fontY * scale + 0.35 to align the lettering midpoint with Earth's world-space center y=0.35. Remove the old -0.4 downward offset; keep orbit plane independent of interactive Earth tilt.

Cloud refinement: make each formation 55% smaller, increase scattering from 11 to 24 patches, and lower their centers to radius 3.22–3.325 before local cloud relief. Peaks may intentionally intersect clouds; no longer enforce clearance above the whole mountain envelope. Keep the base globe clear, leave the equatorial text band open, and retain small varied-size cubes and gentle drift. Include patches near the Rockies, Andes and Himalayas.

Surface coverage refinement: overlap surface tiles by scaling their local tangent X/Z dimensions to 1.25x and radial Y depth to 1.15x. Include an opaque deep-blue inner sphere at 98% of the base radius, inside the same reveal/rotation hierarchy, to prevent see-through pinholes at cube-sphere seams and moving wave crests. Terrain positions, elevations and water displacement remain unchanged.

Scene zoom: after the text/camera entrance completes, mouse wheel/trackpad and two-finger touch pinch dolly the scene camera around Earth. Minimal +/minus/Reset controls support keyboard users. Keep the same camera owner in ParticleWordmark; apply bounded logarithmic zoom to the settled camera position, never add competing OrbitControls. Bounds keep the camera outside terrain. One-finger drag rotates Earth; the second touch cancels Earth drag for pinch. Respect reduced motion with immediate manual zoom. Remove native listeners on cleanup.

Earth shape update: surface instances now use shared beveled octagonal prism geometry, eight-sided caps aligned to each tile's outward radial normal. Tangential overlap is 1.4x, radial depth remains 1.15x, and the solid blue inner layer stays to prevent see-through seams. Keep map-derived positions/relief, ocean masks and ripples unchanged. Clouds and text retain their cube geometry. Geometry helper: octagonal-earth-geometry.mjs. This supersedes the cube-shaped Earth surface.

Earth surface shape refinement: replace the eight-sided octagonal prisms with six-sided beveled hexagonal prisms for a chunkier, less circular silhouette. Use hexagonal-earth-geometry.mjs. Retain 1.4x tangent overlap, 1.15x radial depth, the opaque inner sphere, elevation data and ocean displacement. Text/cloud shapes remain unchanged. This supersedes the octagonal surface experiment.

Moon exploration: design-first six-view reference set and actual NASA LROC/LOLA source rasters are saved under docs/references/moon/. Read its README before implementation, especially unsigned 16-bit elevation units, 0-degree longitude alignment, resolution limits and the distinction between generated art direction and measured survey data. Match the current overlapping beveled hexagonal planet style, with recessed lunar craters and raised rims. No Moon component has been authorized or implemented in this design pass.

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


Reference-led prop modeling: for approved concept-to-model work, follow components/three/satellite/README.md and the optional personal reference-3d-modeling skill. Check silhouette/proportions and recess construction before decorative details. Compare actual model renders across views; build success is not evidence of visual fidelity. Respect blocked browser access; offline asset renders do not establish browser rendering or FPS. Satellite rebuild checkpoint is recorded in docs/current-scene.md.


Approved satellite checkpoint (2026-10-29): Jacob explicitly approved the rebuilt archive satellite. Preserve its proportions and visual design. The reference-3d-modeling skill is included at .agents/skills/reference-3d-modeling/SKILL.md as well as the personal installation; use the repository copy when working from another machine.


Latest interaction checkpoint: UFO Version 3 is a separate selectable angular model, not a replacement of the main-scene default. Landing suspension and Test landing gear share the same analytic functions. Earth/Moon/text dragging uses exclusive nearest-object ownership, disabled during piloting. See docs/current-scene.md and CHANGELOG.md for current values and verification limits.
