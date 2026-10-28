> For the active implementation and settings, read [current-scene.md](current-scene.md). This file also preserves earlier architectural exploration and superseded refinements.

# JM 3D application

This project checkout is the active implementation. The separate home-directory clone is not automatically synchronized.

## Structure

- `app/`: routes, metadata, fonts and global CSS. Routes compose features.
- `design-system/`: shared color, spacing, motion and renderer tokens. Theme maps tokens to CSS variables; Three.js imports the same values. CSS dimensions and world units remain separate.
- `components/ui/atoms/`: HTML building blocks, such as Button.
- `components/ui/molecules/`: small compositions, such as SectionHeading.
- `components/ui/organisms/`: reusable interface sections, such as StudioHeader.
- `components/three/canvas/`: browser-only renderer, pixel-density limit and error fallback.
- `components/three/objects/`: reusable objects owning their local interaction.
- `components/three/scenes/`: cameras, lighting and object composition.
- `features/`: coordinate UI, scenes and application behavior. Studio is the initial component preview.
- `hooks/`: shared browser behavior, including live reduced-motion preference tracking.

The root route now runs features/loader, combining an HTML status/control layer with a client-only loader scene. /studio retains the foundation preview. The full portfolio universe and quote fetching are not implemented.

The Particle Core Jake uses 1,327 instances of one shared rounded-cube geometry: 1,240 core blocks and 87 loose edge fragments. scripts/generate-wordmark.py samples Sabo Filled's actual outlines, preserves glyph holes, and fills four depth layers on a 0.19-unit grid. Each base cube is 0.18 units wide with a 10% bevel. Seeded per-instance scale and positional variation create overlapping anchor blocks, uneven faces, and smaller fragments. The version-3 asset public/models/jake-particle-core.json stores positions, scales, fragment flags, particle-to-letter assignments and each letter's bounding center and radius. The loader validates this metadata before rendering. The pulse metadata does not alter the generated geometry. FontTools is needed only to regenerate the asset, not at runtime. The earlier jake-voxels.json retains the old outline data and is no longer loaded.

Three.js FileLoader fetches the volume through useLoader, allowing Drei useProgress to report real item-based asset progress. With these small assets this can jump directly to 100%; no artificial download percentage is added. The separate assembly state waits for a completed rendered logo before offering entry. Replay only restarts animation, not the already-cached download. Demand rendering requests frames while the particle wordmark gently drifts; reduced motion freezes the formation and uses lower-frequency frame requests only for the subdued brightness pulse. Reduced motion shows static LOADING briefly, then switches to Jake once ready. Errors offer retry or a route to the preview; a 15-second timeout prevents an indefinite wait without a way forward. This loader currently prepares its own LOADING and Jake assets, not a future spaceship or universe scene.

## Rendering and accessibility

The rejected custom shader was removed. FluidkitBackdrop now uses the approved @dilukangelo/fluidkit 0.5.0 package, with Smoke/Hero/Goo/Off configurations adapted from its public examples. Source and licence: https://github.com/dilukangelosl/fluidkit (MIT). These names describe recipes, not an exported preset enum. All retain a pure-black base.

FluidKit owns a separate, sized canvas with its own WebGL2 context. The adapter copies its rendered output into a Three.js CanvasTexture and displays that texture on a real plane behind the letters at z=-4. Raw WebGLTexture handles cannot be shared across contexts. Copy/upload runs in a microtask following FluidKit's onFrame callback, after the library renders and before the browser clears its non-preserved drawing buffer. Simulation resolution is capped at 96, dye at 256 (128 for Goo), and source-canvas width at 384 CSS pixels. Unsupported WebGL2/float-render-target support leaves the backdrop black. Reduced motion destroys the simulator and hides the plane. Cleanup removes pointer listeners, destroys the simulator, disposes the texture, and removes its source canvas.

Magnetic hover uses a camera ray intersected with the wordmark's transformed local XY plane. Each cube is attracted only within 1.35 world units of that point, with a squared falloff, bounded strength and damped return offsets. A small forward lift makes the effect dimensional. Group cursor-following rotation and local particle attraction have separate transform ownership; reduced motion resets the attraction and touch does not trigger hover.

The scene loads client-side. HTML remains readable if WebGL fails. Keep essential text, navigation and controls in HTML. React state handles discrete interactions; refs and delta-based useFrame updates handle animation. Give each animated property one owner. Demand rendering avoids drawing a settled scene continuously.

Share geometry/materials and use instancing for large particle populations. The nine-tile preview is deliberately small; the future JM must not create thousands of React mesh components. Cap pixel density and tune particle budgets against real devices.

Respect system reduced motion. Users can also enable reduced motion using the visible control. Preserve keyboard focus and HTML alternatives for essential interactions.

## Running and typography

Use npm run dev, npm run build, and npm run lint. Stable Fiber 9 supports the React 19 application. Confine 3D dependencies to client boundaries. The standard Tailwind PostCSS integration replaces the previous custom CSS loader.

Use font-display for Sabo Filled, font-outline for the outline style, and system sans-serif for prose. Font provenance is in app/fonts/README.md.

The core barely moves, preserving a clear silhouette. Loose fragments drift and rotate farther, and receive twice the core's magnetic attraction strength. Reduced motion disables drift, rotation, breathing, attraction and pulse displacement; a subdued brightness-only pulse remains. The renderer resizes its per-instance attraction buffer when the asset particle count changes.

## Sequential letter pulse

After assembly, wait 0.6 seconds, then run 1.1-second radial sweeps with starts spaced 0.75 seconds apart. Neighboring waves overlap by 0.35 seconds, keeping ordered J, A, K, E peaks while flowing between letters. After E finishes, rest for 0.65 seconds; the full cycle lasts 4 seconds. Each particle's normalized distance to its letter center drives its wave. Brightness, radial expansion, forward lift and scale combine with hover attraction. Fragments respond more strongly. Attack damping is 18 and release damping is 3.2, preserving the soft recovery. Replay resets the pulse clock and particle state. Reduced motion retains only 18% brightness, updated every 80 ms. The helper lives in components/three/animation/letter-pulse.mjs; npm run test:pulse checks radial direction, ordered peaks, adjacent overlap, rest/repeat and recovery.


## LOADING into Jake

One instanced mesh reuses 1,327 cubes for both words. The LOADING volume has 828 sampled positions (including 114 fragments), two depth layers and a 0.12-unit base cube. Proportional index mapping assigns each particle a destination in each word; small deterministic offsets avoid identical stacked surfaces.

Seven letters form sequentially from their centers. The word holds, scatters and gathers into Jake over 2.3 seconds. Both transition endpoints use smooth easing and share the same scatter positions. Real asset readiness gates dissipation; timed choreography does not inflate download progress. The final Jake frame triggers completion. Cursor interactions and the repeating pulse start afterward. Replay resets transition, attraction and pulse state without another download. Reduced motion skips spatial assembly and dispersal. React receives phase updates only at stage boundaries.

Timing lives in components/three/animation/loading-intro.mjs. npm run test:intro checks formation order, readiness waiting, phase continuity and reduced motion. The existing pulse suite remains npm run test:pulse.


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

## Planet model

See components/three/planet/README.md for the BlockEarth schema, source attribution, offline generation and usage. /earth is the standalone six-angle preview. The loader reveals the globe behind the final wordmark; the geometry stays independent of lettering and camera choreography.

Ocean ripple: generated oceanMask explicitly marks blue water instances. A periodic rounded crest travels by angular distance from a Pacific epicenter; blue cubes lift radially up to 0.055 base units, using the same fast-attack/soft-release response as the text pulse. Update only ocean instance-matrix translations from immutable rest positions, keeping land/ice/mountains fixed and preventing drift. Run while revealed, request frames during motion, restore rest positions once hidden or reduced motion is enabled. No React state updates per frame. Helper: ocean-ripple.mjs; npm run test:earth includes mask and traveling-wave checks.

Wrapped introduction: use one particle asset reading exactly "loading jakes world" (5,793 blocks) and one continuous sequential convergence; no LOADING-to-name dispersal swap. Map flat Sabo samples onto a front equatorial arc with wrapPoint, scaled smaller to span about 2.1 radians outside the Earth relief. Keep glyph depths and tangent rotations. Stagger 0.32 seconds, formation duration 1.4 seconds. Camera still follows letter shots and pulls back at the complete phrase; asset readiness gates completion. Replay is explicit only; never auto-restart. Earth is visible throughout. BlockEarth draggable prop enables captured horizontal mouse/touch drag around Y only, damped independently from camera/text, with cleanup and touch-action restoration. Reduced motion permits direct user rotation but freezes autonomous effects. Magnetic text attraction uses distance to the camera ray for curved lettering, disabled during drag.

Current presentation supersedes earlier loader UI/backdrop: full-window black WebGL scene only, persistent actual asset-download bar at the bottom, accessible status text visually hidden and retry shown only on failure. No header, slogans, preview link, replay button, background selector or FluidKit. FluidKit component and npm dependency were removed. Earth loads and scales into view first; its onRevealed callback after settling beyond 98% starts the text clock and camera sequence. Text remains hidden and its clock paused before that callback. Do not use an arbitrary delay to coordinate the stages. Earth drag, ocean waves, wrapped text and reduced motion remain supported.

Atmosphere experiment: user approved restoring @dilukangelo/fluidkit 0.5.0 only as a transparent spherical shell, not the removed fullscreen backdrop or selector. FluidAtmosphere lives in components/three/planet/. Shell radius = Earth radius * 1.18 + 0.14, inside text radius Earth * 1.2 + 0.6. Fade in after Earth settles. A low-resolution real FluidKit dye simulation on a separate hidden-but-sized canvas feeds a CanvasTexture; upload in a post-render microtask before buffer clearing, capped at 30 Hz. Triplanar sampling blends three projections to avoid longitude seams and polar pinching. Additive blue-white wisps with stronger rim visibility, depth test enabled and depth writes off preserve solid terrain/text. Raycast hover splats map to the same three projections; ignore held buttons/touch so dragging still rotates Earth. Respect reduced motion by destroying the simulation/hiding the shell. Remove listeners, source canvas, GPU textures and simulation on cleanup. Missing WebGL2 float support gracefully omits atmosphere. This is a 2D-fluid projection on a sphere, not volumetric atmospheric physics. Current implementation needs visual/device validation.

Text orbit: after the single wrapped phrase finishes forming, rotate its particle targets around Earth's Y axis (center z=-9), clockwise viewed from the north pole. Ease up to 0.09 radians/second (about 70 seconds per turn) without restarting the formation or moving the camera. Rotate cube tangent orientation with the current target, preserve pulse/magnetic effects on the visible hemisphere and let Earth occlude lettering on the far side. Orbit is independent of Earth drag. Reduced motion freezes orbit; replay resets its clock. Pure helper: components/three/animation/text-orbit.mjs.

Earth rotation refinement: main scene supports free camera-relative quaternion drag in both horizontal and vertical directions, no Y-only restriction. Earth has a 23.44-degree axial tilt, with its slow idle spin around the tilted local Y axis (0.035 rad/s, roughly three minutes per turn). Pause idle spin while dragging; ease it back after release without resetting user orientation. Keep user orientation, axial tilt and local spin in separate nested groups. Reduced motion disables idle spin but permits direct manual turning. Standalone six-view preview disables axial tilt for its exact reference views. Atmosphere, text orbit and scene-camera choreography remain independent. This supersedes the Y-axis-only drag preference.

Atmosphere direction superseded: user rejected the fluid shell. Remove FluidAtmosphere and FluidKit dependency. Design several 3D cloud styles matching Earth's varied-size beveled cube construction before adding any cloud geometry. Keep the globe, ocean ripples, free drag/idle rotation, tilted axis, orbiting text and camera choreography intact. Cloud concepts are exploratory, not approved implementations.

Cloud implementation approved: components/three/clouds/ owns deterministic billow, wisp, bank and spiral cube sculptures, standalone CloudShape and a batched CloudLayer. Eleven sparse patches sit just above the mountain envelope, curved along the sphere with the equatorial text band kept open. CloudLayer is passed as children to BlockEarth so reveal scale, free drag, axial tilt and idle rotation stay aligned; slow additional local-Y drift gives atmospheric movement. Pearl/cool-white beveled cubes, one shared geometry/material and one instanced draw for all patches. Fade in after Earth settles; reduced motion freezes drift. No FluidKit or volumetric shader. Check npm run test:clouds for finite deterministic shapes, shell clearance and equatorial spacing.

Cloud refinement: make each formation 55% smaller, increase scattering from 11 to 24 patches, and lower their centers to radius 3.22–3.325 before local cloud relief. Peaks may intentionally intersect clouds; no longer enforce clearance above the whole mountain envelope. Keep the base globe clear, leave the equatorial text band open, and retain small varied-size cubes and gentle drift. Include patches near the Rockies, Andes and Himalayas.
