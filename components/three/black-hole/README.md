# Matte hex black hole

Based on the user-corrected concept docs/references/black-hole/hex-black-hole-concept-v5-tiled-sphere.png: the CENTRAL SPHERE itself is paneled like Earth, not a smooth black void. User requested black/matte panels, smaller disc fragments, controlled chaos and fast orbit. Apply the repository reference-3d-modeling skill.

## Construction and dimensions

Core radius 2.0. A dual geodesic surface supplies 1,430 hex panels and twelve necessary pentagonal junctions on a sphere. Beveled caps have narrow reveals, .012–.036 radial relief, and an opaque inner foundation so no background shows through. Three near-black finishes (#070809, #0a0b0c, #0d0e10), roughness 1 / metalness 0: no glossy glass, emissive seams or texture tricks on the core. The sphere is three static material batches plus a foundation.

Five tilted accretion bands carry 3,242 small beveled hex fragments, plus 80 loose outer fragments. Bands have uneven clusters, angular gaps, narrow wavy radial streams and small vertical offsets. Inner fragments are muted amber, transitioning to bronze and graphite outside. Fine tiles are .060–.095 wide; outer loose pieces .055–.130. Band centers radius 2.22–3.58, loose debris extends to approximately 4.2. Tile dimensions retain the true hex ratio.

This is a stylized object following the user's design, not astrophysical visualization. There is no gravity/collision/pull-in gameplay or screen-space lensing effect yet. Main Earth scene is not modified.

## Motion and rendering

Orbit speed is 1.8*(2.15/radius)^2.2 radians/sec: inner band about 1.68 rad/s, outer about .59 rad/s, loose debris .18 rad/s. Band parent rotation produces differential orbital motion; there is no per-fragment frame update, texture upload or React state update. Ten model draws / 200,984 triangles total. No textures, runtime packages, bloom or shadow lights. Static model geometry and instance buffers are created once per mount and disposed on unmount. Demand rendering stops animation while paused or with reduced motion. No FPS guarantee without device profiling.

## Inspection / verification

Open /black-hole: camera presets, drag/zoom, pause/resume. All behavior respects reduced motion; existing object previews and main scene stay intact. User still needs to judge actual browser motion; agent localhost access is blocked.

`node --test scripts/test-black-hole.mjs`: shell tiling and topology, normals, sealed sightlines, matte finishes, deterministic bands, relative orbital speeds, bounded geometry cost, reduced motion and instance-buffer reuse / cleanup.

`node scripts/render-satellite.mjs docs/references/black-hole/model black-hole`: exact asset factory exported to Blender with per-instance tint baked into color attributes and repeated objects merged by material for offline review. Three-quarter, side and top views. Blender lights/color management differ from WebGL. Actual render generation is not a browser performance measurement.


## Version 2 — wider disc and transparent lensing field

Version 1 stays available. /black-hole defaults to Version 2 with version selector and Light bending toggle. V2 uses the same matte core, seven wider-spaced accretion streams (band centers 2.22–5.40), 7,121 total fragments including debris out to radius6.35. Twelve model draws / 368,140 triangles. The factory's wideDisc option and createAccretionBands wide option default false so original geometry/data remain unchanged. Inner speed remains the same; outer motion is slower.

BlackHoleV2 mounts a separate LensingField: a camera-facing, depth-tested transparent annulus around the opaque core, spanning radii1.98–3.10 with peak2.25. It samples an offscreen scene capture and offsets UVs radially with a modest tangential term. This is a stylized screen-space refraction approximation, not gravitational ray tracing or transparency through the black core. It can only warp the content present in the scene buffer. Foreground depth protects the core and near-side fragments. Tone mapping and output color conversion are applied to sampled linear scene colors.

Drei useFBO owns/resizes/disposes a half-float capture capped at768px per dimension, with no multisampling. The lens mesh is hidden during capture to avoid feedback; the previous render target is restored in finally. One extra scene render plus one transparent plane draw when enabled (about25 model submissions total, not one extra draw alone). Paused/reduced-motion scenes only capture requested frames; camera controls can still update the static distortion. No additional packages or real-time shadows. Actual GPU cost and shader appearance need browser profiling, currently unavailable under saved permission. Toggle off lensing to compare.

Four combined V1/V2 tests cover original preservation, wider data, shared matte core, finite geometry, fast-to-slow orbit, bounded lens strength and capture size. Build/lint pass. Offline V2 renders review the wider MODEL ONLY; Blender does not implement this WebGL lens shader. Regenerate with node scripts/render-satellite.mjs docs/references/black-hole/model-v2 black-hole-v2.


### Secondary disc image refinement

The V2 capture now temporarily hides BOTH the lens plane and opaque hex shell, exposing the far-side disc. The shader projects actual source disc radii2.22–5.40 into apparent radii2.08–2.62 around the center, with stronger upper and weaker lower image arcs. The sampled moving hex fragments supply the image; no fake solid orange torus or duplicated debris meshes. View angle reduces the arcs when seen face-on. The core is restored before the main render and stays opaque/depth-protected. This is an art-directed secondary image approximation, not general relativistic ray tracing.

It reuses the same single bounded capture; no second FBO/pass is added. With the four core draws excluded from capture, model submissions are about21 (8 capture +12 main +1 lens), superseding the earlier25 count. The shader adds a second texture sample and source projection. Visual/GPU behavior still requires browser review. Tests cover monotonic source-disc remapping, bounds and original preservation; build/lint pass.

Physical reference: NASA's Black Hole Accretion Disk Visualization (https://svs.gsfc.nasa.gov/13326/) and https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/ describe the far-side/underside disc appearing above/below the black hole and as a thin secondary image. No NASA image/data assets are bundled by this refinement.


### Smear correction — current implementation

User identified smearing/stretching after increasing lens strength. Replaced viewing-camera capture and large viewport-relative UV offsets with a single orthographic top-down DISC ATLAS. The tilted disc is captured square (384–768px) with camera axes aligned to disc-local X/-Z. Main camera angle no longer collapses source tiles edge-on. Secondary arcs sample the clean atlas directly using local radius/angle; source radius is monotonic across the entire visible arc, with no clamped edge repetition. Transparent gaps reveal the untouched main scene rather than blending two mismatched warped images. Broad screen-space warp removed; the effect is now the secondary-disc image only. The matte core remains opaque and all previous versions are preserved. Same one extra capture / plane draw; no extra geometry or postprocessing chain. Four current V2 tests cover bounds, original preservation, source mapping and atlas coordinates. Browser appearance remains subject to user review.


### UFO consumption test (2026-10-29)

The /black-hole preview includes a separate Version 3 UFO and Send UFO / Replay / Reset controls. It approaches from X=8.1 at 0.65 units/sec; each original panel or mechanical piece releases when its center reaches the 6.3-unit capture sphere. Larger continuous rails/foundation split into six angular sectors. Pieces spiral inward over 3.4 seconds, shrink late, and disappear behind the opaque core. This is a staged proximity demonstration, not integration with free-flight gameplay or a gravity simulation.

Fragment attributes are prepared once, preserving the original material batches and triangle count. The vertex shader moves/rotates whole pieces using a shared clock; replay changes that clock without rebuilding geometry. Original UFO factory defaults and all other previews remain unchanged. Pause orbit also pauses consumption; reduced motion gives the direct consumed result. The UFO is excluded from the disc atlas to avoid cyan contamination of the approved warm lensing.

Verification: deterministic proximity timing, bounded progress, complete finite fragment attributes, original geometry/batch preservation, shader injection and reuse are covered by scripts/test-black-hole-consumption.mjs. Browser appearance and frame time require user review because saved localhost browser permission is blocked.


### Earth and Moon consumption tests (2026-10-29)

The black-hole preview now selects UFO, Earth or Moon. Switching targets resets the test and loads only the selected model. Earth and Moon reuse all original map/survey hex tiles, normals, relief, color and overlap ratios, at preview radii 1.55 / 1.1. Their clouds, lunar pad/flag and other main-scene gameplay stay outside this isolated test. Assets load under Suspense with the existing preview error boundary.

Each surface remains one instanced draw plus one sealed backing sphere. Shared consumption logic replaces the instance transform in Three's position, world-position and normal shader chunks; static instance matrices/colors are never rewritten while playing or resetting. Tiles reach the same 6.3-unit capture zone, then peel and spiral inward with the UFO timing. The backing recedes between first and last detachment to avoid leaving an intact ball behind; reset restores it. These tests do not change the Earth/Moon models or destruction behavior in the main scene. The selected target remains excluded from the warm disc atlas.

Regression coverage in scripts/test-black-hole-planets.mjs checks every tile's capture-sphere intersection, original linearized surface colors, shader transform use for positions/normals, backing reset, unchanged GPU buffer versions and disposal. Live browser appearance/FPS still requires user review under the saved browser restriction.


Planet consumption stream refinement: detached Earth/Moon tiles no longer preserve a uniformly rotating shell. Each instance has three deterministic seed values prepared once. On detachment, seeded speed (1.0-1.7x), independent tumbling and an immediate smooth size reduction separate neighboring pieces. Exponential inward pull and fast convergence toward the tilted disc plane gather them into a narrow curved stream, with bounded lateral scatter. Every path begins exactly at the released tile center and ends inside radius 1.65 within the existing 3.4-second maximum; reset reuses seeds and buffers. UFO behavior stays as approved. Added tests for detachment continuity, immediate speed spread, inward travel and convergence from different latitudes. Browser appearance remains a user review item.
