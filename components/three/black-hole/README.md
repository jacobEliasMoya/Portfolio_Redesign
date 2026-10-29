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
