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
