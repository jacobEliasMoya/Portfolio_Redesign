## Lower pad with level default and Moon-relative rotation - 2026-10-30

Jacob clarified that level refers to the initial/default pose, not continuous stabilization. Reduced pad height from1.14 to.98 model units and shortened supports from.6 to.4, preserving their foundation anchoring. Body bottom is.90, clearing the highest undamaged lunar facets (about.879).

initializeLunarPad now captures a level default pose once after reveal has a valid transform, before the ship's first landing/launch sample. Position and quaternion are then retained in Moon-local space: orbit, drag and rotation naturally move the complete platform, its lights and supports. Removed per-frame counter-rotation/repositioning. Default horizontal heading, scale.8, spacecraft landing/launch and existing beacons remain.

Verification:209 full regression tests, lint and production build pass. Updated tests verify initial leveling, unchanged local attachment under subsequent Moon rotation, expected world motion and landing approach normal, reveal-zero safety and lowered terrain/support clearance. Live browser/device review remains pending under the existing access restriction. User requested committing and pushing this correction.

## Compact weapon slots, switch particles, flag hover and raised level pad - 2026-10-30

Tidied the lower-left ship controls: smaller status icon, aligned Launch/Land and Exit buttons, separate L key badge, and a fixed4.8em action-text area preserving the erase/type animation. Weapon name and charge indicators moved into a centered bottom weapon bar while piloting. Slots are80x64px (68x60 on narrow screens), with1/2 selectable by keyboard or native button;3 remains disabled/reserved. Active cyan/red borders follow actual selected weapon state; bolt charge uses12 small cells in slot1. Desktop footer uses symmetric side columns to center the bar. Narrow layouts stack without overlap and preserve safe-area margins.

Weapon icons are actual bolt/ray volumes and the original shaders in the existing foreground renderer, not pictures or another Canvas. Bolt material now supports a non-instanced HUD variant with the unchanged gameplay default. HUD ray icon omits the contact flare/endpoint ball; gameplay still has its contact effect. Icon resources are reused/disposed and native BOLT/RAY labels serve as rendering fallback. Slot requests go through the real weapon-selection/cancellation logic; selection is published by the ship, and clicking returns focus to the flight canvas. Charge, pending shot and held-ray cancellation stay consistent with keyboard switching.

Weapon name is now a transient switch announcement. It pops in, holds briefly, then physically disperses as instanced micro-cubes sampled from the real Sabo contours, including counters. Two cached models share the existing foreground scene; one active instanced draw, no per-frame React state. Matrices remain static during the readable hold and stop uploading after expiry. Full lifetime2.25seconds; rapid switches replace the prior message, same-weapon selection does not replay it. Reduced motion uses a static1.6second message with no scatter. Native fallback text clears after2.25seconds; screen-reader selected-weapon text and slot selection remain available.

Death ray damage halved from4 to2 per contact tick: DEATH_RAY_HIT_POWER=.2 at the retained.2second cadence (10damage/sec sustained, with an immediate first tick). The smaller impact power also narrows the local crater footprint. Red beam size,80unit range, immediate held firing/release and existing in-world flare remain.

Flag hover adds a damped pointer-local cloth push/ripple, with pointer coordinates transformed into flag-local space. Cloth, stripe and Sabo monogram receive the same bounded deformation; pole stays fixed. Touch is ignored, exit/blur clears hover, reduced motion disables movement, and listeners are cleaned up. Existing wash is retained.

Raised lunar pad height from.91 to1.14 model units, with three hexagonal supports anchored into the lunar foundation. Deck is stabilized parallel to the scene XZ plane, tracking the Moon center while preserving its projected horizontal heading. Pose runs at priority-1.25, after Moon motion/drag and before the ship samples landing/launch transforms. Uniform reveal/radius scaling is retained and singular reveal transforms are guarded. Existing pad size, deck/lights/beacons, ship clearance and landing approach logic remain.

Verification:208 full regression tests, full lint and production build pass. Tests cover real model/shader reuse and no HUD endpoint ball, slot request cancellation/unsubscribe, halved impact damage, actual Sabo particle geometry/counters/pop/hold/dispersal/replay/disposal/reduced motion, localized flag deformation and stable printed offsets, level pad through orbital tilt/drag, reveal-zero safety, terrain clearance/support anchoring and landing/launch behavior. Offline formed/dispersing notice geometry rendered and visually inspected in docs/references/weapon-notice via scripts/render-weapon-notice.mjs; this is not a browser screenshot. Live browser shaders, interaction feel and device performance remain unverified under the previous access restriction. User authorized committing and pushing the completed accumulated updates after verification.

## Guide prose uses full-width lines - 2026-10-30

Kept Movement/Weapons keybind sections in their existing desktop columns. Launch/Exit introduction now uses a single column; Ship & Landing and Exploring are full-width sections. All prose can run across the available width and wraps naturally. Existing keycaps, fonts, padding, responsive control rows and block animation are retained.

Verification:full lint and production build pass. This is a layout-only adjustment; no new tests. Live browser review remains pending under the existing access restriction. Not pushed.

## Guide instruction layout and Sabo keycaps - 2026-10-30

Applied Press Start 2P to the instruction text Jacob explicitly selected. Reorganized the Guide into a short launch/exit introduction, Movement, Weapons, Ship & Landing, and Exploring sections. Body descriptions/notes use the self-hosted arcade face at12px with1.9 line height on a darker inset reading surface. Headings/buttons stay Sabo. Key assignments, weapon behavior, lunar distance, tour/touch instructions and keyboard requirement are preserved.

At Jacob's follow-up request, each keyboard binding now has its own native semantic kbd keycap with Sabo Filled labels, a raised border, dark side/shadow and subtle top highlight. Alternative keys are separate caps with slash separators; weapon slots and inline F references are caps too. Pixel vector arrow symbols with screen-reader text cover arrows missing from Sabo. These are informational caps, not new clickable controls. Measured the actual Sabo advances: Space/C needs129.2px including key padding/separators, so the key column is136px.

Wide layouts pair the sections in columns with aligned key/description rows. Section columns stack at1000px and below, and key descriptions move below the caps at540px and below. Short viewports reduce vertical padding; native header/footer actions remain outside the scrollable instruction area. Existing1040px outer width, block geometry, single cubic layer, perspective individual fall-ins and native modal behavior remain.

Verification:8 existing Guide/HUD regression tests, full lint and production build pass. Actual font-metric checks confirm all movement key groups fit their column; generated CSS contains both intended font families and column sizing. No new layout-mirroring tests or packages. Live browser appearance, scrolling and device layout remain unverified under the existing browser-access restriction. Not pushed.

## Press Start 2P installed and available on request - 2026-10-30

At Jacob's explicit request, identified the Google Fonts arcade face as Press Start 2P by CodeMan38. Downloaded its original TTF, OFL1.1 license and METADATA.pb from official google/fonts commit e06fe11c39051bddaef73ec338a9d1c8175723f1. Files/provenance are in app/fonts/press-start-2p; source SHA256 034c77f1f05ec89421e4a63f0e3a4ca1ecf852cc6d2bf611f126f275728e017d. Public license copy at /fonts/press-start-2p/OFL.txt.

Installed the original TTF persistently for the current Windows account at LocalAppData/Microsoft/Windows/Fonts/PressStart2P-Regular.ttf, with HKCU Fonts entry Press Start 2P Regular (TrueType). Loaded it using public GDI registration and broadcast font-change notification. A fresh process verified Windows enumerates the exact family and installed bytes match the source. Already-running apps may need reopening if their font menu is cached.

App setup is self-hosted next/font/local WOFF2, exported as pressStart2P from app/fonts.ts, variable --font-press-start-2p registered on the root layout, Tailwind opt-in font-arcade token. Normal400 only, swap, no preload, monospace fallback. scripts/prepare-arcade-font.py repackages and verifies all658 glyph outlines and656 character mappings unchanged; TTF118204 bytes, WOFF229668 bytes. No runtime package or Google font request. Existing Sabo headers/live3D lettering/body/Guide text remain unchanged: use this new face only for the non-header text Jacob subsequently specifies.

Verification:source-to-WOFF2 validation, independent-process Windows installation/hash verification, full lint and production build pass. Build inspection verifies exact self-hosted WOFF2 emitted, CSS variable present and unused font not preloaded/applied. Browser appearance remains unreviewed under the prior browser-access restriction; no text usage was requested yet. Not pushed.

## Guide width and breathing room - 2026-10-30

Following the annotated screenshot, increased Guide maximum width from880 to1040px. Inner horizontal padding now scales40-64px (previously30), with32-40px vertical padding (previously24). Narrow screens retain the single-column layout and now use28px vertical/32px horizontal padding. Desktop viewport side margins allow room for the protruding 3D rim. Actual panel measurements still resize the surrounding block board automatically. Existing font sizes, single cubic layer and individual fall-in sequence remain.

Verification:full lint and production build pass. CSS-only layout change; no new tests. Browser layout review remains pending under the prior browser-access restriction. Existing offline mesh previews predate this padding-only change and do not verify native text layout. Not pushed.

## Guide reduced to one block layer - 2026-10-30

Removed two of the three Guide block layers at the user's request. Retained the front layer's cubic proportions, irregular overlaps, palette, rectangular layout and continuous individual Z fall-ins. Moved the backing forward to Z-14 so it stays with the remaining cubes. Block instances drop by two thirds; the shared instanced draw and existing resource cleanup remain.

Verification:199 tests, full lint and production build pass. Updated existing checks for one layer with real cubic depth and the retained individual sequencing. Offline exact-model previews regenerated; live browser motion/layout remains unverified under the prior browser-access restriction. Not pushed. Supersedes the three-layer depth described below.

## Wider Guide, cubic blocks, individual fall-ins - 2026-10-30

User clarified that pulse-like means individual blocks falling one by one, not rhythmic grouped bursts. The Guide now assigns each cube its own unique deterministic start time, spatially mixed across all three layers. Removed band/row triggers and intentional pauses. Individual .65-second falls overlap continuously across a 2.1-second build, preserving the real perspective Z fly-past, tumble, full-size geometry, and reverse dismissal. Reduced motion remains immediate. This individual sequence supersedes the previous four-band entrance.

Guide panel width increases from680 to880px. Desktop control descriptions use two columns to shorten the board into a wider rectangle while retaining existing text sizes. At720px and below it returns to a single scrollable column with the existing mobile spacing. Height remains viewport-limited; native modal/focus/close/HTML fallback remain unchanged. Actual panel measurements continue to drive the 3D board size.

Every block now has actual cube-like depth: .85-1.15 times its smaller face dimension. Three layers are spaced32 units apart, with existing deterministic size variation, overlap, tilt and palette preserved. Backing sits at Z-78 within the rear cube layer. All cubes retain one shared instanced draw, geometry/material, cleanup and settled-buffer behavior. No new packages or renderer contexts.

Verification:199 full regression tests, lint and production build pass. Tests check unique individual starts without grouping/pauses, mixed layers in flight, eased continuity, cubic proportions and real layer thickness, alongside existing camera crossing/resize, settled matrices and renderer-state cleanup. Front/depth and intermediate exact-model samples regenerated and visually inspected in docs/references/guide-board using a representative904x544 rectangular board. These are offline mesh samples without native guide text, not browser captures. Live browser layout/motion and device performance remain unverified under the existing browser-access restriction. Not pushed.

## Guide depth fly-past and three block layers - 2026-10-30

The Guide now uses a real perspective camera in a separate scene, composited through the existing HUD WebGL renderer. The ordinary HUD keeps its orthographic camera and pixel positions. The perspective camera is calibrated to one CSS pixel per world unit at the resting board plane, including portrait/landscape resize. A depth clear separates the passes; autoClear is restored even if rendering fails. Closed Guide skips the extra pass. No new Canvas/context, images, dependencies or per-frame React state.

Full-size blocks begin beyond the viewer and travel along Z, tumbling and receding into the board in four staggered title-like waves. Removed the scale-from-zero entrance. A curved lateral corridor keeps the immediate camera crossing away from the center of the lens. Build takes 1.65 seconds; dismissal reverses the path over .8 seconds. Reduced motion and renderer-failure native fallback remain immediate. Settled matrices/colors stop uploading; camera-distance changes refresh moving poses on resize.

Added three complete staggered layers of real beveled blocks, spaced 18 units apart with varied depth, deterministic overlap and slight layer delays. The rear backing moved to Z -53. All layers share one instanced draw, geometry and material; no separate per-block React objects. The front arrangement and readable native guide text remain. Native modal focus, Escape/outside close, touch/scroll and reduced-motion behavior are retained.

Verification: all 198 regression tests, full lint and production build pass. New checks cover viewer-plane crossing, full-size travel, on-screen perspective enlargement, CSS-pixel alignment at desktop/portrait/landscape sizes, resizing during animation, three-layer overlap/thickness, stable settled buffers/disposal, and renderer-state restoration after errors. Front, depth and intermediate exact-model samples regenerated and visually inspected in docs/references/guide-board. Perspective samples use the runtime camera framing; Blender lighting is illustrative. These are offline mesh renders without native guide text, not live browser captures. Browser motion/composition and device performance remain unverified under the existing browser-access restriction. Not pushed. Supersedes the previous bounded local-scatter Guide entrance; weapon, flight, local damage and optional planet-explosion settings remain as previously recorded.

## Selectable weapons, local Guide assembly, precision aiming, optional planet breakup - 2026-10-30

Weapon1 is charged bolts at every charge level, including full charge; automatic conversion into a death ray is removed. Weapon2 is an immediate continuous red death ray while holding left click or F, with no charge orb or charge meter. Releasing either source ends it once no other firing source is held; damage stops immediately with a.12second visual fade. Beam range80 and cannon-relative world orientation remain. Sustained contact applies the existing.5-power impact (4 damage) every.2seconds, independent of frame rate, keeping physical crater/scorch/heat/plume behavior without per-frame damage multiplication. Switching weapons cancels unfinished input and pending releases; modal focus, blur, reset, landing/crash and loss of visibility clear firing. Slot3 is reserved, not an invented third weapon. Number-row1/2 and numpad1/2 work while piloting; editable fields, dialogs, modifiers and repeats are respected. HUD shows selected slot/weapon with red styling for weapon2. Guide and preview manual explain both distinct input patterns. One existing bolt pool and one beam mesh set are reused; ray-only firing skips gravity collection, and bolts retain curved trajectories.

Guide assembly no longer falls from above: it shares wrapFormation and smoothIntro with the actual title. Four staggered bands grow and rotate from bounded local XYZ scatter, with a brief15% brightness pulse. Rest blocks now overlap tightly, with deterministic varied sizes (interior1.26-1.65cell, edge1.18-1.34cell), small XY offsets/tilts, varied depths and irregular outer edges. No detached decorations. A sealed backing and calm native text preserve readable controls. Settled instance matrices/colors stop uploading. Reverse animation dissolves locally rather than lifting offscreen. Existing shared foreground renderer/native dialog/reduced motion/fallbacks remain. Front, angled and two intermediate exact-model samples regenerated with consistent framing in docs/references/guide-board; samples show geometry without HTML guide text, not browser captures.

Shift plus arrows now gives25% normal yaw/pitch sensitivity (PRECISION_AIM_SCALE=.25). Existing Shift braking, normal WASD turning/thrust, roll, ship-relative controls and opposite-key/alias handling stay intact. Guide/manual updated.

Whole-body Earth/Moon explosions are disabled by default. BlockEarth, BlockMoon and OrbitingMoon expose explosionsEnabled?:boolean, defaultfalse. Setting true restores existing threshold-triggered breakup. Local craters, scars, heat, smoke and impact ejecta remain. The hook updates the existing target through setExplosionsEnabled rather than recreating it or resetting crater/mark state. Low-level explosion logic retains opt-in capability and legacy default for other consumers/tests. The flag gates future triggers; an already started breakup is not rewound. Disabled thresholds no longer imply displayed finite durability in the preview manual.

Verification:196 full tests pass; full lint and production build pass. Tests cover both keyboard slot groups/reserved3, fully charged bolts, immediate held ray without charging, overlapping inputs and cancellation, frame-rate-independent ray damage/release, bounded local pulse assembly, connected overlap/depth variation/settled buffers, actual quarter-speed flight quaternions, and disabled breakup retaining real impact damage with re-enable on the same target. Offline mesh samples visually inspected. Live browser composition, motion, shaders and device performance remain unverified under the prior browser-access restriction. Not pushed. Supersedes the preceding automatic full-charge ray / falling-block Guide checkpoint. The cleaned3308-block world title remains unchanged.

## Block-built Guide and full-charge death ray - 2026-10-30

Implemented the explicitly requested Guide board: real instanced beveled 3D blocks fall into a shallow navy board with a raised cyan/graphite rim and recessed center. Diagonal wave delays plus small damped landings build over1.25seconds; closing reverses the sequence over.8seconds. Native readable guide content appears after settling. The board reuses the existing live HUD foreground renderer, with no extra WebGL context, raster images or sprite substitution. A depth-separated dimming plane sits behind the board; the native modal backdrop becomes transparent while that renderer is available. Keyboard focus/escape/outside dismissal, touch/scroll, safe widths/heights, reduced motion and native text fallback remain. Blocks use one instanced draw plus backing and dim plane, reuse geometry, and stop matrix uploads when settled. Board animation requests stop when open/closed; existing requested HUD letter drift remains independent. ResizeObserver/listener/frame/resource cleanup is explicit. Actual front/depth mesh samples were rendered offline in docs/references/guide-board via scripts/render-guide-board.mjs; samples show the asset only, without HTML text or browser animation.

Partial charge releases retain existing traveling bolts and gravity curves. Releasing at full1.5second charge starts a.72second cannon-connected death ray: finite80unit range, white 3D core, cyan shader envelope and contact flare. The ray follows actual world muzzle position and full ship orientation, extends rapidly, stops at the nearest registered projectile target and applies existing full-charge damage20 once per burst. It keeps existing crater deformation, scorch/heat, impact marks/plumes and destruction thresholds (Earth60/Moon12), rather than multiplying damage each frame. It can acquire a first hit after an initial miss; deactivating/hiding the ship cancels the ray. Beam meshes/materials are preconstructed/reused/disposed, and shader flow is fixed under reduced motion. All UFO variants share SaucerProjectiles, so the behavior applies consistently. Guide and preview manual explain the death ray; charge cells now floor rather than round so all12 cells illuminate only at true full charge.

Verification:191 full regression tests pass, including7 new tests for guide sequencing/reversal, finite and bounded real block poses, stable settled buffers/disposal, charge routing, nearest blocking target, one-hit damage, follow orientation, range/lifetime, real damage integration and beam mesh/flow behavior. After small visual/meter polish,15 targeted tests, full lint and production build pass. Browser motion, native modal/Canvas composition and real shader appearance/performance still need live review under the existing browser-access restriction. No new packages. Not pushed. The earlier simple-drop Guide checkpoint is superseded; the cleaned3308-block world title remains unchanged.

## Guide drop-in overlay and cleaned world title - 2026-10-30

Implemented the user's simplified Guide direction: native modal containing a centered navy guide panel with a short 40px drop/fade entrance, reverse lift dismissal, dimmed backdrop, readable scrollable instructions, Close, Back to Space and Reset View. Escape, outside click, native focus trapping/return and reduced motion are retained; closing has a timer fallback if CSS animation events are suppressed. Header/footer can wrap at narrow widths. Opening the modal clears held flight/fire input so keys do not continue acting behind it. Guide is bottom-right; destination links remain top-right. The briefly explored gathered-cloth geometry, controller, renderer, tests and preview were removed when the user requested the simpler overlay; no extra guide WebGL context ships.

Removed all227 decorative floating fragments from public/models/jakes-space-particle-core.json. Preserved all3308 core cubes byte-for-byte in their parallel position/scale/letter arrays, along with letter centers, pulse radii and original framing via layoutWidth24.4606. No changes to physical shot/breakup debris. scripts/generate-wordmark.py now supports --no-fragments, filtering after RNG sampling so core samples stay identical. Regenerating with --text "Jakes Space" --match-text Jake --no-fragments exactly reproduces the cleaned asset. Runtime validates the optional layoutWidth before using it for unchanged title scaling.

Verification:184 tests pass; full lint and production build pass. Browser animation, layout and real device feel remain unreviewed under the prior browser-access restriction. Not pushed.

Latest discussion: user proposed a different Guide entrance using actual3D blocks dropping sequentially in pulse-like waves, forming a3D space for the list similarly to the Jakes Space formation. This is a new design idea discussed after the simpler overlay work, not yet implemented. Existing HUD letters remain live3D meshes.

## Tour navigation moved to the header - 2026-10-30

Moved Home / Jake / Space / Earth / Moon from bottom-right into the top-right header, replacing Guide there. Guide now occupies bottom-right and still opens the same native dialog. Preserved real 3D labels, tour selection/active states, launch controls and keyboard access. Header wraps onto another line at narrow widths; Guide stays below the ship controls on narrow screens. Three existing HUD behavior tests, full lint and production build pass. Browser layout review remains pending. Not pushed.

## Genuine live 3D HUD letter assets - 2026-10-30

User explicitly rejected cached glyph pictures. Replaced that approach with live extruded Sabo Mesh assets in hud-letter-model.mjs, rendered every animated frame in their own transparent orthographic foreground Canvas. Each character has a centered XYZ pivot, actual .16-em volume, normals, lit MeshStandardMaterial front/side surfaces, and independent rotation plus depth drift. Magnetic repulsion drives these actual mesh transforms. Shared resource pool reuses geometry by character and materials by color/opacity. No images, sprite planes, readback, Canvas2D, raster cache, or CSS glyph wobble remain in the runtime lettering path; obsolete helpers/tests were removed.

The foreground renderer uses DPR1.5-2 and antialiasing, independently of the heavy world renderer's adaptive DPR. This deliberately adds one small-scene WebGL context and live mesh draw work rather than degrading text with the world's reduced resolution. Mobile/GPU cost is not measured. Demand frames continue for idle motion, settle to demand-only with reduced motion, and stop on unmount. Glyph geometry is shared and GPU resources/listeners/observers are disposed or disconnected on teardown. Rendering failure or context loss restores accessible Sabo HTML text; successful scene presentation hides that fallback. Native button hit areas, focus, touch, type/delete launch animation, existing font, size and HUD placement are preserved. Open modal suppresses magnetic hover; reduced motion fixes mesh poses.

Verification:184 tests pass, including actual Mesh/standard-material/volume checks, geometry sharing and disposal, changing 3D normals/pivots without buffer or parent-layout changes, reduced-motion stability and existing spring/font tests. Full lint and production build pass. The exact new model factory was rendered offline via scripts/render-hud-lettering.mjs and visually inspected in docs/references/corner-hud-lettering/lettering.png. This is a geometry/material sample, not a browser capture. Browser motion/layout and device frame time still need live review under the existing browser restriction. Not pushed. This checkpoint supersedes all raster/cached-glyph display notes below.

## Floating, dimensional HUD lettering - 2026-10-30

Increased identity to 30-40px, main actions to 24px, status/destinations to 22px; narrow-screen identity 26px, Guide 20px and destinations 17px. Existing Sabo contours remain unchanged. Extrusion depth increased from .045 to .16 em, with a slight baked three-quarter tilt and dark side faces. Each character now has its own cached native-resolution Three render, preserving a common cap baseline (including raised apostrophes), sharp counters and 4px overflow padding.

Each letter independently floats by under 1px with about 1.5 degrees of tilt over staggered 4.8-6.7 second cycles. Pointer proximity repels nearby letters by at most 4px within a 64px radius, with an exact critically damped return and small associated tilt. Visual transforms leave button layout/hit areas fixed. Touch does not trigger hover; reduced motion disables idle drift and repulsion. A native open Guide dialog suppresses pointer response. Per-label pointer listeners and active spring frames clean up on text changes/unmount; frame requests stop after settling. Per-character rasters share a renderer-scoped cache capped at 128 entries, without additional WebGL contexts or per-frame GPU glyph rendering. Transform updates do not trigger glyph remeasurement.

Verification: all 183 tests pass, including bounded/finite repulsion, direction, frame-rate-independent spring return, shared cap baseline/punctuation, depth, font counters, raster density and alpha conversion. Full lint and production build pass. The actual glyph geometry was rendered offline and visually inspected in docs/references/corner-hud-lettering/lettering.png; this verifies geometry only, not browser motion or layout. Live browser/device feel remains pending under the previous browser-access restriction. Not pushed.

## Larger, sharper Corner Pilot labels — 2026-10-30

Raised desktop identity28–36px, main actions22px, status/destinations20px, Exit15px, charge14px. Narrow-screen identity24px, Guide18px and destinations16px; lower controls stack below960px and destination labels wrap if necessary.44px targets remain. Removed blurred text shadow and subpixel bevels; glyphs remain real extruded Sabo shapes.

The prior live meshes shared the world's adaptive DPR (which can be below1), causing soft labels. Now the same Three renderer paints small temporary multisampled linear render targets at2–3 pixels per CSS pixel, then caches each glyph label in a native-resolution2D DOM canvas. These are renders of the same Three geometry, not Canvas text or font substitution. There is no second WebGL context or continuous HUD render loop. Text, color, layout and device-density changes repaint; camera travel and world quality changes do not. Native device-pixel snapping and straight-alpha sRGB conversion prevent resampling/dark edge fringes. Renderer target/scissor/clear state is restored and targets are immediately disposed; geometries/materials remain owned per label with cleanup. Underlying accessible text remains visible if painting fails; button/touch behavior stays DOM-native.

Verification:180 tests pass, including real glyph counters/extrusion, bounded high-resolution backing dimensions, row-flip/alpha-edge conversion and prior typing behavior. Full lint/build pass. Native WebGL readback, visual sharpness and mobile frame time still need live browser/device review; browser access was previously denied. Earlier camera-relative glyph draw/projection checkpoint is superseded by cached native-resolution display. Nothing pushed.

## Corner Pilot with larger native Three.js lettering — 2026-10-30

Implemented approved simpler option2: unboxed top-left identity, top-right Guide, bottom-left model-icon/status plus Launch/Land, bottom-right five text destinations with cyan active underline. Removed the six-panel framing, duplicate Pilot action, permanent charge panel and primary Reset/motto. Exit Pilot appears only while piloting; Reset View is in Guide. Charge meter appears only while charging. All prior launch/land behavior, erase/type action animation and keyboard controls remain.

User then requested larger text built from Three.js components. Reusable HudLabel measures existing DOM slots and registers their text/color/size; HudLetteringLayer draws actual beveled/extruded Sabo glyph meshes in the existing scene canvas, anchored in camera space. The same letter geometry supports header, Guide action, ship status, Launch/Land, Exit Pilot, charge label and destination labels. DOM source stays in place at zero opacity for accessibility, layout and button/touch hit areas once the renderer is ready; it remains visible before Three initialization. Native modal guide prose stays HTML. No second WebGL context, independent animation loop or raster text substitution.

Typeface data is exported from the existing Sabo Filled outlines into public/fonts/sabo-filled.typeface.json (~40KB). Sabo lacks apostrophe/slash: these HUD marks are adapted from its comma/hyphen contours; supplied letters are unchanged. Slot widths use actual Three font advance metrics so desktop CSS font fallback cannot squeeze or misplace the geometry. Header22–28px (mobile20), primary action16px, status16px, destination16px (mobile14); smallest320px viewport destination widths sum about280px including gaps, within288px inner width.44px minimum hit targets remain. Desktop lower corners stack on screens<=720px. Surface geometry/material resources and observers/subscriptions clean up; per-frame work only copies the camera pose to the HUD group. Font geometry changes only when text changes, including typing animation.

Verification:179 tests pass, including Sabo B/O counters, required punctuation, finite extruded geometry, front/side material groups, and screen projection at1440x900/390x844/844x390 through camera rotation/roll. Full lint and production build pass. Actual lettering geometry was rendered offline to docs/references/corner-hud-lettering/lettering.png (output copy hud-three-lettering-preview.png); this is a geometry sample, not an actual site capture. Live browser layout/device review remains pending. Not pushed.

## Physical impact craters, visible lunar damage, stars and font delivery — 2026-10-30

Earth and Moon now use crater damage mode. Hits permanently lower a faceted bowl and raise an uneven rim; charge scales radius/depth and repeated hits accumulate down to a bounded inner floor. Tile transforms, fitted Moon corner attributes, lunar skin and inner foundations deform together. Collision grid relocates the changed tiles; subsequent shots and ship contacts query the new surface. Damaged water tiles are excluded from Earth ripple resets. Legacy dent/explode modes remain for other assets/tests. Existing planet durability/full breakup remains.

User clarified that craters ADD to scorching and splash plumes. Both bodies use red-hot centers, orange/gold edges and impactHeat emission; repeated hits char the palette. Moon initially retained gray-only coloring, then was explicitly changed to the fiery palette too. Moon base crater radius is.14 instead of.10; lunar dust is larger, brighter and lasts1.15–1.5s. Reduced motion keeps static crater/scorch damage while skipping moving dust. Crater target buffers are captured lazily and owned by the target; no additional persistent per-frame animation or mesh per impact. Offline previews: docs/references/impact-craters; they show mesh/color changes, not live shader/plume animation.

Starfield now has1760 points (1400 distant/360 near), plus48 brighter octahedral accents. Near sizes doubled; accents are larger/closer, point brightness increases20%, projected sizes clamp1.25–4.5px. The55-unit empty flight region and static two-draw layout remain.

Completed loading bar is visually hidden when ready while retaining accessible progress. Sabo source WOFFs are losslessly repackaged as WOFF2 by scripts/prepare-ui-fonts.py; all158 glyph recordings and cmap entries are verified identical for each face. Shared direct HUD/preview binding remains; modern format/new asset URLs and explicit monospace fallback replace auto Arial fallback. User sees correct font on phone Netlify but incorrect on desktop/local; desktop cache/format/loading remains a hypothesis, not a verified root cause. Live browser validation remains blocked/unperformed; these edits are not pushed.

Verification:177 tests pass, including real Earth/Moon shot deformation, rim/foundation changes, repeat-hit depth, retained heat/plume marks and transformed collision normals. Full lint and production build pass. Offline crater meshes reviewed. No live desktop/iPhone font or star/plume motion claim.

Moon color refinement (2026-10-30): widened the existing LROC-derived palette to make connected dark maria/basin patches clearly visible, with cool slate grays, warmer pale highlands and darker crater floors. Preserved per-hex variation. Geometry hashes confirm positions, normals, facet corners/lifts, sizes and crater shapes are unchanged; Earth is unchanged. Regenerated all four offline review views and HUD Moon PNG. Eight relevant tests, full lint and production build pass; browser appearance remains unverified. Preview outputs/moon-color-pass.png. Not pushed.

Final pass verification:174/174 tests, full lint and production build pass. Transparent PNGs have clear alpha margins with no clipped silhouettes; the built Sabo Filled WOFF matches the selected source byte-for-byte. Four exact-geometry offline views inspected. Runtime browser shader/layout and real-iPhone review remain pending; nothing was pushed.

## Irregular sculpted Moon, rendered HUD icons and direct Sabo — 2026-10-30

Moon now follows the approved crater reference while retaining the chunky hex/voxel family. User explicitly rejected an overly tidy/smooth result: final layout has3242 fitted cells (3230 hexagons/12 pentagons), deterministic slight irregularity, independently lifted caps and narrow seams. Seventeen broad sculpted bowls/rims coexist with12x actual LOLA topographic relief. LROC-derived colors restore cool dark-gray basins, warmer pale highlands and per-facet variation; artistic crater depths/placements are labeled as artistic. Earth source/model is unchanged.

Version3 block-moon.json includes fitted corner positions and per-cell dimensions. New lunar-facet-geometry.mjs maps those boundaries onto one instanced terrain batch, keeps cap normals faceted, composes the impact-heat shader and preserves existing damage/ejected pieces. Deeper.64 foundation remains below all crater floors; continuous sealed16384-triangle skin fills the seams. Orbit/size/tidal-lock/gravity props, pad/flag and12-damage destruction threshold remain. Offline generator now requires Pillow only at development time; no runtime package added. Reference and front/three-quarter/side/rear renders live in docs/references/moon/sculpted-craters-review.

HUD replaces flat SVG saucer and CSS-gradient planet stand-ins with transparent PNGs in public/images/hud. UFO images come directly from createUFOV3 (including its cannon and parked gear); Earth and Moon use their current terrain data. Parked icon adds the static deck using existing pad dimensions. Generated icon explorations were rejected for model drift and are not shipped. Next Image supplies responsive delivery and stable dimensions. Rebuild via node scripts/render-hud-icons.mjs (BLENDER_EXECUTABLE optional); new offline-only serialization/render helpers are checked in. Moon icon is regenerated from the rebuilt Moon.

Sabo definitions now live in app/fonts.ts, shared with root layout, HUD and preview PilotMenu. Both interfaces bind the Next font class and resolved fontFamily directly, without relying only on inherited variables. Bundled WOFF name tables verify the selected Filled face and existing outline face; production font asset/preload/style checks supplement build validation. Guide prose intentionally remains readable monospace. Live deployment font rendering is not verified; these edits have not been pushed.

Checks:174 tests include crater floors/polar support, outward cells, exact CPU/GPU corner reconstruction, WebGL attribute budget, swept hits/debris, sealed shell and tidal lock. Full lint/build and final image-alpha checks are recorded after finishing the pass. Offline views establish geometry appearance, not browser shader compilation or real-iPhone performance.

## Arcade HUD and lunar opening — 2026-10-30

Implemented the approved vintage HUD in the main app, replacing the old floating Next/Back controls and text hint. Three equal grid columns with equal gaps on top/bottom: player, centered JAKE’S SPACE (no subtitle), ship status; blaster charge, launch/land plus Pilot/Explore/Guide/Reset View, and destinations. Sabo headings, cyan state accents, warm-white stepped borders, small vector ship icon. Responsive portrait arrangement and safe-area spacing. Guide is a native modal with keyboard focus/escape behavior; flight keys ignore the dialog. Keyboard flight remains required; this is not a full mobile-flight implementation.

LAUNCH erases one character at a time and types LAND as ship mode changes, reversing after touchdown. 65ms erase/100ms type ticks; pending timeout cancels on target changes/unmount. Accessible button label remains whole; reduced motion changes label directly. UI action requests use the existing real landing eligibility/launch sequence, not fake keyboard events. LAND remains disabled outside pad approach range and during launch/landing. PILOT enters flight (existing automatic takeoff); EXPLORE exits/parks; Reset View resets the camera, not damage.

HUD charge uses twelve live quantized charge cells. Per-scene external store only notifies React for discrete mode/eligibility/charge/tour changes, with reused per-frame snapshots and automatic subscription cleanup. Destination buttons select Home/Jake/Space/California/Moon using shared TOUR_STOPS; Home preserves the opening and Earth labels the California stop. Scroll highlights the current nearest stop.

Opening now follows behind the Moon looking toward Earth; Moon initial phase is0 instead of2.25 so lettering is on the opening-facing side. Camera stand-off max(9,MoonRadius*5) plus2MoonRadius vertical offset, with existing body clearance. First camera frame initializes directly rather than flying from the obsolete start. This supersedes the fixed [0,0,22] opening checkpoint. Scroll/Reset return to this lunar overview. Moon period, distance, inclination, size and tidal lock remain unchanged.

Verification: all170 tests passed, including HUD notification isolation, full erase/type/reverse and mid-animation reversal, lunar overview tracking and camera clearance; lint and production build passed. No live browser layout/motion or real-iPhone check was completed (browser access previously denied). Approved generated image is art direction, not an actual runtime screenshot. See docs/mobile-optimization.md for pending mobile investigation.

Interface cleanup and mobile notes (2026-10-30): removed PilotMenu from the main scene and its unused landing-status state/callback. Reusable menu remains in /ufo. Main app text/buttons now explicitly inherit self-hosted Sabo Filled from .loader-experience instead of body Arial; menu already declared Sabo. Screenshot showed the previous deployed panel in fallback typography; live computed-style/font-network verification was blocked by browser network access, so its precise deployed cause is unconfirmed. See docs/mobile-optimization.md for iPhone static-scene report and investigation priorities. Reduced-motion preference deliberately pauses major animation, a likely but unconfirmed explanation; no accessibility preference was overridden.

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
