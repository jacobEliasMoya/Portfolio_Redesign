# Block Earth: construction and sources

`BlockEarth` lives in `components/three/planet/`. Import from that directory's index. It is an actual three-dimensional instanced cube model, not a billboard or image wrapped on a smooth sphere.

## Schema

- Radius: 3 world units before the component's `radius` scaling.
- Surface: six cube-sphere patches, 28 x 28 initial cells each. Split land/coastal cells into four finer tiles; seeded ocean subdivisions add varied sizes.
- Blocks: one shared lightly beveled cube, aligned with its local radial normal. Terrain stacks overlapping cubes from the shell to its raised surface.
- Relief: NASA's 0–6400m grayscale elevation raster, stylized with a power curve, quantized to 0.035 world-unit steps and exaggerated to about 0.5 units. This is visual relief, not survey-grade elevation. The source is an 8-bit scaled image, not raw DEM metres.
- Colors: NASA July 2004 Blue Marble RGB classifies land/ocean, snow and dry areas, then maps to cobalt/navy, green, tan, rock and ice palettes. Land classification is a stylized RGB heuristic; fine coastal details are approximate.
- Asset: `public/models/earth/block-earth.json`, version 1; flattened `positions`, `normals`, `colors`, plus per-instance `sizes` and sampled normalized `elevations`.
- Budget: 20,921 instances, about 1.73 MB uncompressed JSON. One geometry/material; no per-block React components. Raster processing happens offline, not during rendering. Device performance still needs visual testing.
- Default orientation: Americas facing forward. No automatic spin by default. Optional `autoRotate`, `revealed`, `reducedMotion`, `position`, `rotation`, `radius` props.
- `/earth` provides a standalone orbit preview and six view buttons. Loader reveals the Earth behind the final lettering during reassembly; Drei progress includes the local Earth asset.

## Map provenance

NASA Blue Marble Next Generation, July 2004 color composite:
https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/
Original: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/july/world.200407.3x5400x2700.jpg

NASA Blue Marble / GEBCO topography, scaled 0–6400 metres:
https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/topography-bathymetry-maps/
Original: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/topography/gebco_08_rev_elev_5400x2700.tif
Credit: NASA Earth Observatory; topography page credits Jesse Allen and GEBCO / British Oceanographic Data Centre.

Local 1080x540 PNG derivatives are included beside the generated asset for deterministic regeneration. Run `python scripts/generate-earth.py` from the repository root with Pillow installed. No runtime Python dependency.

NASA imagery is generally available for informational/personal website use under NASA's media guidelines, subject to noted third-party rights. Source pages and credits are retained; no NASA logos or endorsement are implied. See https://www.nasa.gov/nasa-brand-center/images-and-media/ .

## Visual references

`docs/references/blocky-earth-concept.png` plus paired Americas/Asia, Pacific/Africa and polar-view sheets. These are AI-generated art-direction references, not geographically exact texture maps or mutually registered reconstruction photographs. Use them for style; use the NASA maps for consistent geometry.

Ocean ripple: generated oceanMask explicitly marks blue water instances. A periodic rounded crest travels by angular distance from a Pacific epicenter; blue cubes lift radially up to 0.055 base units, using the same fast-attack/soft-release response as the text pulse. Update only ocean instance-matrix translations from immutable rest positions, keeping land/ice/mountains fixed and preventing drift. Run while revealed, request frames during motion, restore rest positions once hidden or reduced motion is enabled. No React state updates per frame. Helper: ocean-ripple.mjs; npm run test:earth includes mask and traveling-wave checks.

BlockEarth onRevealed callback fires once after its reveal settles above 98%. The main scene uses this to start the wrapped text, so the planet appears first. Fullscreen presentation retains only a bottom asset progress bar. FluidKit was removed.

Atmosphere experiment: user approved restoring @dilukangelo/fluidkit 0.5.0 only as a transparent spherical shell, not the removed fullscreen backdrop or selector. FluidAtmosphere lives in components/three/planet/. Shell radius = Earth radius * 1.18 + 0.14, inside text radius Earth * 1.2 + 0.6. Fade in after Earth settles. A low-resolution real FluidKit dye simulation on a separate hidden-but-sized canvas feeds a CanvasTexture; upload in a post-render microtask before buffer clearing, capped at 30 Hz. Triplanar sampling blends three projections to avoid longitude seams and polar pinching. Additive blue-white wisps with stronger rim visibility, depth test enabled and depth writes off preserve solid terrain/text. Raycast hover splats map to the same three projections; ignore held buttons/touch so dragging still rotates Earth. Respect reduced motion by destroying the simulation/hiding the shell. Remove listeners, source canvas, GPU textures and simulation on cleanup. Missing WebGL2 float support gracefully omits atmosphere. This is a 2D-fluid projection on a sphere, not volumetric atmospheric physics. Current implementation needs visual/device validation.

Earth rotation refinement: main scene supports free camera-relative quaternion drag in both horizontal and vertical directions, no Y-only restriction. Earth has a 23.44-degree axial tilt, with its slow idle spin around the tilted local Y axis (0.035 rad/s, roughly three minutes per turn). Pause idle spin while dragging; ease it back after release without resetting user orientation. Keep user orientation, axial tilt and local spin in separate nested groups. Reduced motion disables idle spin but permits direct manual turning. Standalone six-view preview disables axial tilt for its exact reference views. Atmosphere, text orbit and scene-camera choreography remain independent. This supersedes the Y-axis-only drag preference.

Atmosphere direction superseded: user rejected the fluid shell. Remove FluidAtmosphere and FluidKit dependency. Design several 3D cloud styles matching Earth's varied-size beveled cube construction before adding any cloud geometry. Keep the globe, ocean ripples, free drag/idle rotation, tilted axis, orbiting text and camera choreography intact. Cloud concepts are exploratory, not approved implementations.

Surface coverage refinement: overlap surface tiles by scaling their local tangent X/Z dimensions to 1.25x and radial Y depth to 1.15x. Include an opaque deep-blue inner sphere at 98% of the base radius, inside the same reveal/rotation hierarchy, to prevent see-through pinholes at cube-sphere seams and moving wave crests. Terrain positions, elevations and water displacement remain unchanged.

Earth shape update: surface instances now use shared beveled octagonal prism geometry, eight-sided caps aligned to each tile's outward radial normal. Tangential overlap is 1.4x, radial depth remains 1.15x, and the solid blue inner layer stays to prevent see-through seams. Keep map-derived positions/relief, ocean masks and ripples unchanged. Clouds and text retain their cube geometry. Geometry helper: octagonal-earth-geometry.mjs. This supersedes the cube-shaped Earth surface.

Earth surface shape refinement: replace the eight-sided octagonal prisms with six-sided beveled hexagonal prisms for a chunkier, less circular silhouette. Use hexagonal-earth-geometry.mjs. Retain 1.4x tangent overlap, 1.15x radial depth, the opaque inner sphere, elevation data and ocean displacement. Text/cloud shapes remain unchanged. This supersedes the octagonal surface experiment.

Earth direction: Jacob rejected the sculpted/Clean experiment. Keep only the hexagonal Earth with its raised map-derived terrain, overlapping tiles, opaque foundation and ocean ripples. Remove the sculpted model, generator, API variant and preview selector. Preserve clouds, Moon, rotation, zoom and scene choreography. Further visual changes should follow Jacob's direction rather than assuming smoother means better.

Earth impact revision: dent mode replaces tile removal on Earth. Impacted clusters shift inward by roughly 0.05–0.06 local units with a floor above the opaque foundation, retain their full geometry, and become red/orange/yellow with per-instance heat emission. Scorched ocean tiles stop rippling so dents persist. Collision indices rebuild after denting and scorched tiles still absorb further shots without sinking repeatedly. Damage remains session-local. Moon/cloud/text damage behavior is unchanged. No added draw calls or per-tile lights.

Planet destruction threshold: Earth explodes after 20 projectile impacts, Moon after 12; shared PLANET_HITS constants live in planet-explosion.mjs. Count one consumed impact per shot, including repeated dented tiles/foundation hits. On threshold, stop further collisions, briefly swell/warm for 0.25 seconds, then reuse existing instance matrices for a deterministic radial burst and 2.5-second fade/shrink. Hide solid foundations/skin and Earth clouds during the burst; no extra per-tile meshes/lights. Disable Earth flight collision and camera avoidance once destruction starts. Source maps/assets remain untouched; reload restores the scene. Reduced motion hides the destroyed planet without a flying-debris burst. No automatic planet respawn or gravity simulation.

Planet threshold buildup: extend charge to 1.2 seconds, with a hot red core visible through widening tile gaps and a soft red Fresnel halo. Tiles lift radially 6% and narrow tangentially 42% during charge; retain most original colors instead of repainting the whole surface yellow. Core and halo fade over the first 0.65 seconds of the burst; tile transforms stay continuous into breakup. Shared PlanetCore applies to Earth and Moon, adds two transient draws per charging planet, no bloom library or per-tile lights. Reduced motion omits the buildup/burst.

Red-circle correction: user rejected the visible core sphere and its lingering glow shell. Remove PlanetCore entirely. Put the red heartbeat directly into Earth and Moon tile emission using the shared impact shader; negative impactHeat marks red buildup, positive values retain existing hot-scar colors. Auxiliary glow ends immediately at breakup; no red sphere/ring survives among the debris. Preserve tile separation, thresholds and outward burst. Supersedes all core/halo geometry instructions.


### Optional whole-body breakup (2026-10-30)

BlockEarth accepts `explosionsEnabled`, defaulting to `false`. Opt in with `explosionsEnabled={true}` to restore the existing hit-threshold explosion. Craters, scorch/heat and local impact effects stay enabled. Changing the prop updates the existing impact target without clearing its damage. It gates future triggers and does not rewind an already-started breakup.
