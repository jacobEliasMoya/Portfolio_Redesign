> Implementation update: the Moon is now built in components/three/moon/. The design-only scope below records the preceding reference stage; see that component README for the active model, tidal lock and preview.

# Moon design reference — 2026-10-28

## Scope

Design references only. No Moon component, geometry generator, orbit, scene placement or runtime asset has been implemented. The existing Earth scene is unchanged by this design pass.

## Six-view schema

Each paired sheet uses left/right order:

| Sheet | Left | Right |
|---|---|---|
| moon-near-far.png | Near side, center 0 degrees longitude | Far side, center 180 degrees |
| moon-east-west.png | Eastern limb, center 90 degrees east | Western limb, center 90 degrees west |
| moon-polar-views.png | North pole | South pole |

These AI-generated sheets use the actual NASA albedo and elevation preview as image references. They establish material, silhouette, block proportions and relief styling. They are not mutually registered survey renderings, measured reconstruction photographs or exact crater maps. Derive future coordinates from the supplied survey rasters, not from the generated images.

## Construction direction

- Match Earth's current beveled hexagonal-prism style, using varied-size, overlapping solid blocks with a sealed interior.
- Dark charcoal basalt maria, pale gray highlands, silver-gray rims; no oceans, clouds, atmosphere, snow caps or emissions.
- Express terrain as both positive and negative relief: recessed crater floors, raised rims, stepped terraces, mountain ridges and broad low basins. Do not build crater-like holes through the sphere.
- Use smaller blocks around large crater rims and relief transitions, larger blocks across flatter maria. Share instanced geometry/materials.
- Keep color/albedo independent of elevation: darker basalt is a material property, not a direct height measurement.
- Exaggerate vertical relief deliberately for readability and document that multiplier. Preserve the locations and relative heights in the survey.
- First inspection should include near/far sides, both limbs and both poles at equal scale. Any orbit/placement beside Earth remains a later decision.

## Authoritative source data

NASA Scientific Visualization Studio, CGI Moon Kit:
https://svs.gsfc.nasa.gov/4720/

The kit provides LROC albedo imagery and Lunar Orbiter Laser Altimeter (LOLA) gridded elevation from NASA's Lunar Reconnaissance Orbiter. NASA describes these kit elevation products as based on the LOLA grids available in spring 2019, not a claim that they are the newest 2026 survey release.

Saved in this directory:

- lroc_color_2k.jpg — 2048x1024 albedo/color map, centered 0 degrees longitude.
  https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg
- ldem_3_8bit.jpg — 1024x512 elevation preview, for visual reference only. Do not infer physical metres from its brightness without its scaling metadata.
  https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit.jpg
- ldem_4_uint.tif — 1440x720 global unsigned 16-bit elevation raster, four samples per degree, centered 0 degrees longitude. Suitable for a stylized first model, not small-crater reconstruction.
  https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_4_uint.tif

NASA documents the unsigned TIFF values as half-metres relative to a radius of 1,727,400 metres. The normal reference radius is 1,737,400 metres. Thus:

    elevation_metres = sample * 0.5 - 10000
    physical_radius_metres = 1737400 + elevation_metres

Do not normalize each hemisphere separately. Use one global elevation range and consistent exaggeration across all views. A future detailed model can select the kit's higher-resolution 16/64 pixels-per-degree maps if the geometry budget warrants it.

Survey archive and further documentation:
https://pds-geosciences.wustl.edu/missions/lro/lola.htm

Credit NASA's Scientific Visualization Studio / LRO / LOLA / LROC. Source page names Ernie Wright (visualizer) and Noah Petro (planetary scientist). NASA media guidance: https://www.nasa.gov/nasa-brand-center/images-and-media/ . Retain source credits and check any item-specific third-party notices; do not imply NASA endorsement.
