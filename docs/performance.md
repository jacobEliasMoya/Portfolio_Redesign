# Performance checkpoint

## 2026-10-29 resource/idle-work audit

RimPlasma's explicitly owned meshes now receive dispose events, releasing instanceMatrix GPU bindings as well as shared geometry/materials. Idle rim/projectile effects stop instance-buffer uploads. Flight axes, chase pose/clearance and collision target arrays reuse scratch storage; weak scratch keys do not keep removed craft/camera positions alive.

`node --expose-gc scripts/audit-resource-lifecycle.mjs`: nine warmed factory cases, ten measured creation/disposal cycles each. All1,590 tracked geometry/material/texture/instance resources released exactly once. After three GC/event-loop settle passes, retained typed-array growth was0 bytes and heap delta283,472 bytes in this run. This is not a browser React mount/unmount or GPU memory trace. Existing loader caches are intentional; no cache-clearing or reduced geometry/visual quality was introduced.

Target: a responsive desktop scene on an ordinary laptop with integrated graphics. This remains a target, not a measured hardware guarantee.

## Measured from local assets

| Object | Instances | Surface triangles | JSON bytes | Estimated gzip bytes |
| --- | ---: | ---: | ---: | ---: |
| Earth | 20,921 | 920,524 | 1,853,306 | 429,673 |
| Moon | 11,616 | 511,104 | 3,841,660 | 947,941 |
| Text (Jakes Space) | 3,535 | 381,780 | 117,913 | 37,258 |

Those three surfaces total 1,813,408 triangles. Moon survey skin, foundations, clouds and UFO add more. Instancing reduces draw submissions, not triangle count. The three active JSON assets total about 5.81 MB raw / 1.41 MB estimated gzip; actual response compression depends on hosting. No textures/HDR downloads are required by the main scene. Reproduce with `node scripts/audit-scene.mjs`.

## Changes

- Main and inspection canvases cap their drawing buffers at two million pixels, DPR at 1.25, and never exceed device density. A 4K window therefore renders near 1080p internally instead of paying for 4K plus high DPR.
- Drei PerformanceMonitor samples eight 250 ms windows. Sustained low frame rates below 42 FPS lower resolution; rates above 57 permit recovery. After repeated adjustments, settle at the conservative floor (65% of base DPR). Resizing keeps the pixel budget. Monitoring does not remount models. Reduced motion and the static Moon preview skip monitoring, keeping the size-based cap.
- Rounded text/cloud geometry is indexed: 92 stored vertices rather than 324 for the same 108 triangles, preserving position, normals and UV seams. Model counts and silhouettes stay unchanged.
- Cache text scatter noise, base colors and resting angles. Compute orbit sine/cosine once per frame, skip formation calculations once complete, and skip per-particle cursor ray work when hover is inactive.
- Ocean wave matrix work/uploads are limited to 30 Hz, retaining delta-based timing and the same displacement. Flight and camera rendering remain at the display rate. Animated instance matrices declare dynamic usage.

## Verification and remaining work

Build, lint and scene tests validate structure/math; they cannot establish actual frame rate, visual sharpness or input latency. Browser access was previously declined, so no browser profiling or hardware FPS figures are claimed.

Next visual/device validation: production build (`npm run build`, then a production server on a free port), 1366×768 integrated-graphics laptop and 1920×1080 desktop; intro, settled orbit, Earth drag, text hover and flight. Aim for sustained 45–60 FPS, with 30 FPS as a minimum fallback target. Inspect CPU/GPU timing, draw calls, memory, long tasks, loading on a normal connection, and a 4K window. The first load may still incur JSON parsing, shader compilation and model setup work. If measured GPU geometry cost remains high, add a deliberately designed lower-detail Moon/Earth representation; resolution adaptation cannot solve all geometry/CPU bottlenecks.

Projectile collision update: use swept segments with local-space spatial hashes rather than raycasting every terrain triangle. Static instance indices are built lazily after a broad-phase sphere hit; animated text indices refresh at most every 80 ms. A weak registry is scoped to mounted mesh identities and cleaned up on unmount. Cluster removal zeros instance transforms without rebuilding React meshes. Impact bursts reuse existing projectile slots/draws. Profile firing toward terrain during device validation; these checks add CPU work, and mathematical tests are not frame-time evidence.

Planet explosions reuse the existing 20,921 Earth / 11,616 Moon instances. Snapshot buffers and cached radial velocities are allocated once when the hit threshold is reached; update matrices/colors for the 2.75-second event without adding draw calls, then hide the mesh and release snapshots. Ocean updates stop while exploding. This still adds temporary CPU/buffer-upload work; profile simultaneous Earth/Moon destruction on integrated graphics.

Threshold glow revision: charge now lasts 1.2 seconds. A core sphere and Fresnel halo add two temporary draws per planet, with no postprocessing pass or shadowed lights. They are hidden outside the threshold event; their shader/view appearance still needs browser validation.

Core-sphere removal: the user rejected the interior red orb/halo. Both meshes and their shader were removed. Red threshold pulsing is now per-instance tile emission on Earth and Moon, with no extra glow draw calls or lingering spherical effect after breakup.

Procedural starfield: 1,580 static GL points plus 28 low-poly octahedral instances (224 triangles), two additional draw calls, no downloaded assets or animation loop. Points are capped at 3.5 drawing-buffer pixels; the size uniform tracks adaptive resolution. The empty inner radius keeps stars outside the flight/camera area. Profile composition and sharpness on the final device; static counts do not establish measured FPS.

Cloud/interaction pass: billow and bank clouds use two shared instanced draws instead of one; spiral/wisp placements are removed. Motion changes their parent groups, with no per-cloud-block frame uploads. Ship-letter repulsion reuses a float buffer and the existing text update loop. Flight broad-phase checks both planetary centers before sampling their sparse terrain index; Moon translation is included in impact speed. Profile active flight near the Moon/text in the pending device review.


## Ship collision/explosion hitch diagnosis — 2026-10-28

Read-only implementation audit plus standalone Node/Three CPU benchmark on the current host; not a browser frame trace or GPU measurement. No runtime fix applied during this diagnosis.

- The crash frame calls `piecesFromShip` synchronously inside `useFrame`. It converts indexed geometry to flat triangles separately for every instance, partitions/copies attributes, transforms vertices, calculates bounds, allocates new geometry/meshes and clones a transparent material per fragment.
- A representative subset of the current hex ship (213 hull tiles plus canopy glass/frame, normally three mesh submissions) produced 215 distinct debris meshes/geometries/material clones. Eight CPU runs took 155.66, 129.98, 69.32, 62.91, 65.63, 59.09, 58.87 and 53.75 ms. This excludes engines, vents, gun, rim lights, sparks, GPU upload/program work and full browser overhead. Additional standalone meshes/sparks further increase submissions during the following two seconds.
- The first Earth terrain query, using the actual 20,921-instance asset/matrices and current collision code, took 65.24 ms while building its lazy index/bounding sphere. Repeated queries along that same surface segment took 1.06–1.89 ms. First proximity can therefore hitch independently of the crash. Planet motion/ocean updates and the rest of the scene were absent from this CPU microbenchmark.
- A 60 Hz frame allows about 16.7 ms total; these synchronous bursts exceed that budget before rendering. Strong evidence of CPU/frame-time spikes, with additional draw/upload/allocation pressure during debris rendering. Browser access remains restricted, so actual frame stalls, garbage collection and GPU time are unmeasured.

Recommended next implementation: prebuild/reuse bounded debris batches before contact, keep hex tiles instanced while breaking apart, pool sparks/materials, and prewarm or incrementally build terrain indices before piloting. Preserve actual ship geometry and breakup appearance. Confirm cold first-contact, first crash, repeated crash and simultaneous planet explosion in a production browser profile when access is available.


## Implemented crash/collision pooling

- `crash-pool.mjs` prepares original ship geometry in advance and retains instancing for hex tiles/rim lights. Each continuous large surface is split into at most eight prepared sectors. Geometry, materials, motion records, instance colors, sparks and transform buffers survive repeated crashes; impact only snapshots the current ship pose and initializes cached motion values. Shader/buffer preparation is requested with a zero-scale warm draw before hiding batches. Actual driver timings remain unmeasured.
- Three millisecond preparation budget is best effort at source-mesh granularity: splitting one geometry can exceed it. Preparation is moved into the entrance/idle period, not guaranteed to fit every initial frame. Early crashes use the available prepared subset and sparks without synchronously finishing preparation.
- Earth/Moon hash construction runs in 384-instance scheduled tasks after initialization, normally complete before the introduction enables piloting. Spatial entries move with dented tiles; subsequent impacts do not invalidate/rebuild the complete index. Dynamic text still follows its existing refresh interval. Earliest queries before preparation completes retain the correct synchronous fallback.
- Both full-ship and spark effects keep their existing lifetime/reduced-motion behavior. Owned geometries/materials and pending preparation timers are cleaned up on unmount. Original source assets remain intact.

Reproduce CPU-only comparison: `node scripts/audit-crash-performance.mjs`. Same current-host subset: 213 hull tiles + canopy glass/frame, excluding engines, vents, weapon, lights and all GPU work. New pool retains 215 fragments in **3 debris batches**, plus 1 pooled spark batch. Previous code created **215 separate meshes/materials/geometries** for this subset.

Latest isolated run: old crash setup 53.75–155.66 ms; new crash trigger **0.744–9.254 ms** (first trigger 9.254 ms), first debris step 0.156–2.528 ms. Prepared geometry tasks 3.513–6.887 ms plus final hide task; these are moved before impact. Actual 20,921-tile Earth index prepared in 55 chunks totaling 34.049 ms, longest chunk 3.691 ms. First surface query 7.165 ms, subsequent queries 0.998–1.112 ms, versus previous cold unprepared query 65.24 ms. Timing varies with JIT, CPU load and platform. These are useful local CPU comparisons, not live browser frame-time measurements or a hardware guarantee.

Verification: all 90 scene tests, lint, TypeScript/build passed. New tests cover instancing/resource reuse, restored world transforms/colors, reduced-motion sparks, continuous surface sectors retaining all triangles, and incrementally prepared collision/dent behavior. Browser frame trace and visual first/repeated-crash checks remain pending access.

## Shared hex tile indexing

Earth, Moon and the hex UFO now use an indexed version of the same beveled tile. Identical position/normal/UV tuples are merged with tolerance 1e-6, preserving hard edges and UV seams. Each tile retains all 44 triangles / 132 triangle indices, while stored vertices fall from 132 to 84 (36.4% fewer). No tile counts, silhouettes, materials, animation rates or resolution settings change. Indexed draws permit GPU vertex reuse; actual frame-time improvement requires browser/device measurement.
