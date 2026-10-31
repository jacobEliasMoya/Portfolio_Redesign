# Cape Canaveral rocket events

Original procedural, low-poly Falcon 9 / Falcon Heavy-inspired and silver launchers. Standard/Rare proportions and structure reference [SpaceX Falcon Heavy](https://www.spacex.com/vehicles/falcon-heavy) and the [Falcon User’s Guide](https://www.spacex.com/assets/media/falcon-users-guide-2025-05-09.pdf). No third-party meshes, textures, logos, live launch feed or real SpaceX schedule. Tiers apply only to rockets.

| Tier | Chance | Silhouette | Destruction reward |
| --- | --- | --- | --- |
| Standard | 80% | Slim white / dark interstage | 5,000 |
| Rare | 17% | Three connected boosters | 10,000 |
| Legendary | 3% | Taller silver body / fins / gold exhaust | 25,000 |

All balancing is in rocket-event.mjs. Random tickets derive from the rarity table, with 0.01% precision. One active rocket; first launch after 60–120 active scene seconds, then another 60–120 seconds between launch starts. A 22-second flight and 1.65-second explosion finish before the next opportunity. Destruction does not accelerate the cooldown. Long suspended frames do not queue catch-up launches. Reduced motion pauses the event clock and hides animated exhaust/smoke.

The launch origin uses LC-39A's 28.608422 N, -80.604133 E geodetic coordinates from [NASA's Apollo by the Numbers](https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_18-01_General_Background.htm). Geographic mapping matches Earth/airports (+Y north, +Z zero longitude, +X east). Rocket meshes, plume and smoke inherit Earth's reveal, tilt, drag, spin and depth occlusion. A conservative local Cape terrain/peak-wave envelope is 3.2775; launch ground radius 3.28 plus body clearance. The nose starts radial, rises slowly, then curves eastward toward orbit and fades out. This is a stylized trajectory, not orbital dynamics.

Three body meshes are prepared once, with only the active tier drawn: 1,064 / 2,944 / 228 triangles respectively, one vertex-colored material per variant. One three-engine instanced plume draw and one 16-puff smoke draw are shared across tiers. At most six active draws including the continuing stage, three detached meshes, plume and smoke. Cached stage geometry swaps preserve the exact canonical pose while centered geometry keeps colliders accurate. Reuse the compact pooled crash blast (.16 local scale), not a new light/bloom/particle system. Models and effects have explicit disposal. No per-frame React state.

Bolts and death rays use the existing swept collision pipeline. Rocket reward overrides ordinary damage score once for the whole rocket, independent of charge. The serial/phase/rarity guards reject repeated or stale hits against later launches. Escaped/despawned rockets and singularity-consumed rockets award nothing. New launches stop while a live singularity consumes the universe; frozen rocket meshes remain in the existing GPU consumption effect and cannot respawn into it. Reset Universe restores the event scheduler.

Brief native accessible status notices use the existing foreground Sabo 3D HudLabel rendering. Launch notices announce rarity; kills announce the rarity and reward. Timeout generations prevent an older launch notice from clearing a newer reward. The Guide includes odds/rewards.

Verification: node --test scripts/test-rockets.mjs covers exact rarity boundaries, cadence/single-flight behavior, terrain clearance/geography/continuous motion, silhouette budgets, tap/full-charge/ray flat rewards, duplicate/stale-hit rejection, singularity shutdown, announcement lifetime guards, pooled explosion and no resurrection. Whole repo: 249 passing tests, lint/build checked separately. Browser reviewed a temporary accelerated Legendary launch, eastward ascent, gold plume and Sabo launch notice; the test overrides were removed. Live aimed rocket destruction and real-device FPS profiling remain unverified (real collision/scoring are covered by tests).

node scripts/render-rockets.mjs [output-folder] produces three-quarter, front, rear and side offline renders of these exact factories through the existing Blender review pipeline. Those images verify geometry/materials rather than browser rendering or gameplay performance.

## Staging and reference model

The Heavy has a tall center core/upper stage and wider payload fairing, shorter rounded side noses, twelve perforated grid fins, folded legs and 27 stylized engine bells. No placeholder cockpit windows on Standard/Rare. Legendary remains the fictional silver/gold variant. Body aspect ratios stay close to the official silhouette while keeping a faceted game asset.

ROCKET_STAGING in rocket-event.mjs controls the compressed mission: Heavy sides at 7s, center first stage at 10s; Standard first stage at 9s. Separations happen above the globe's cloud band. The upper stage keeps flying, side engines turn off, and a .2s coast precedes upper-engine ignition. Each detached stage inherits its exact release transform/velocity, drifts outward then Earthward and fades after eight seconds or before its complete bounding sphere could intersect the conservative terrain envelope. These are stylized return arcs, not simulated landings or real mission timings.

Detached stages are non-scoring visual hardware. The continuing core/upper stage is the destructible reward target; the whole rocket still awards once. Collider bounds rebuild on geometry changes and old shape hits are invalidated. Destruction hides all hardware and centers the blast on the current main stage. All stage meshes and geometries are allocated once; no per-frame mesh construction.

Additional verification: node --test scripts/test-rocket-separation.mjs covers timing, release continuity, no teleporting, terrain-safe fall/fade, exhaust cutoff/upper ignition, continuous upper-stage placement, collider changes/stale hits, one reward, explosion location and disposal of shared stages. Complete repo now has 255 passing tests. Live review used temporary fast Rare/fixed 8.5s staging solely for inspection; normal timing and random rarity are restored. render-rockets.mjs accepts an optional rarity after the output folder (e.g. rare) to isolate front/rear/side model views without the other variants occluding it.
