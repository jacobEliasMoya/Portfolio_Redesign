# Worldwide miniature air traffic

The active scene uses a 12-plane fleet visiting every airport in major-airports.json: 1,156 OurAirports records classified as large_airport with scheduled_service=yes, covering 216 country/territory codes and six continental regions. This is a defined snapshot of major airports, not every airfield or a real airline timetable. No runtime feed or network requests.

## Geography and movement

The public-domain snapshot was downloaded 2026-10-31 from https://davidmegginson.github.io/ourairports-data/airports.csv. Source terms and schema: https://ourairports.com/data/ and https://ourairports.com/help/data-dictionary.html. The JSON records the source checksum, selection and snapshot date. Regenerate with scripts/generate-airport-network.py and an original airports.csv; Python standard library only.

The generator saves a geographic airport ordering and reference terrain profiles. Following Jacob's rejection of the ground-turn motion, runtime uses a coprime stride through that ordering to connect more distant airports while retaining one connected itinerary through every airport. Runtime geography matches generate-earth.py: +Y north, +Z zero longitude and +X east. Legs now take 10–20 seconds on the original smooth spherical arcs, with per-route terrain-safe base radii 3.3052–3.6673 and a .035 gentle arc (maximum 3.7023). Planes fade out at arrival, remain hidden for 1.8 seconds, then begin the next flight. No visible ground swivels or steep terrain-following pitch. Reference relief profiles remain bundled but are not used for this restored motion.

Aircraft inherit Earth reveal, drag, tilt, idle spin and destruction visibility. Reduced motion freezes progress and hides moving trails. Earth's existing depth buffer hides far-side aircraft. The old four-airport helper remains as the reusable coordinate convention and starter-model style reference; the main scene uses traffic-network.mjs and the complete snapshot.

## Models, effects and score

Original procedural toy jets: faceted fuselage, swept wings, twin engines, dark cockpit/windows and gold tails. Coral .82x, pale-blue 1x and cream 1.12x styles now use .13 base scale, about 41% smaller than the first version. All 12 share a 336-triangle model/material and instance tints: one draw / 4,032 triangles.

Short twin cloud-like contrails use eight cached puffs per engine. Historical path samples stay attached to the Earth's geographic frame, with fading opacity, mild expansion and no trail during ground stops or final approach. One extra 192-instance draw / 3,840 triangles. Total aircraft + trail budget is two draws / 7,872 triangles; no textures, lights, bloom or per-frame React state. Owned geometry, materials and instance resources are disposed on unmount.

Bolts and rays can destroy planes. A destroyed plane is removed permanently until scene reload, leaves a brief pooled smoke puff and awards 1,000 points exactly once, regardless of bolt charge or held-ray duration. Animation skips destroyed instances, so flight updates cannot restore them. This uses the existing collision/scoring pipeline, with a per-destroyed-instance score override; terrain damage and its scoring are unchanged.

## Verification

Run node --test scripts/test-world-air-traffic.mjs for airport coverage, substantial forward travel, smooth level arcs, hidden direction changes, 1,000-point bolt/ray scoring, no double rewards/resurrection and smoke cleanup. The complete repository suite contains 231 passing tests after this pass. Lint/build and actual browser visuals are checked separately.

A warmed Node CPU audit of the complete 24-plane/384-puff update measured about .09ms median / .14ms p95 on this host; snapshot JSON is about 49KB gzip. These are not browser FPS or real-device guarantees. Live targeted aircraft shooting and real-device GPU profiling remain distinct checks.

node scripts/render-airplanes.mjs generates offline close-ups of the original three color/size styles, using the existing Blender review workflow (BLENDER_EXECUTABLE supported). Images under docs/references/air-traffic show canonical model geometry and relative styles, not the smaller active scene scale or browser performance.

Current height generation: node scripts/generate-flight-clearances.mjs. Conservative swept corridor bounds include actual tile geometry, peak ocean waves, the largest complete aircraft and a .025 safety margin. Regenerate after terrain, aircraft scale/model or itinerary changes. This keeps the restored smooth level motion without runtime relief sampling. Historical 24-plane CPU audit above predates the fleet reduction.
