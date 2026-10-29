---
name: reference-3d-modeling
description: Build or refine browser-ready 3D props from approved concept art or reference images in Three.js and React Three Fiber. Use for matching silhouettes, proportions, mesh construction and materials to a reference; not for generating a new concept image or ordinary scene wiring.
---

# Reference-led 3D modeling

Translate an approved visual into an actual mesh asset. Use the project's existing renderer, visual language and resource lifecycle. A skill improves the modeling workflow; it does not add a modeling application, a renderer or new tool access.

## Read the reference before constructing

Inspect every supplied view at useful resolution. Identify the dominant silhouette, the body-to-appendage ratios, the camera angle, the thicknesses, and the materials. Record a short dimensional plan in local model units before adding decorative detail. Make the plan relative to a stable measurement such as the main body width. Separate visible evidence from choices needed where the reference is ambiguous.

Compare the current render to the reference when refining an existing asset. Prioritize the largest mismatch. Do not assume that adding more small primitives repairs an incorrect body or screen proportion. Preserve accepted details unless they prevent a correct result.

## Model the structure, then the detail

- Block out body, appendages and major cavities first. Check front, side and rear silhouettes before dressing the surface.
- Build real recesses with a deliberate depth stack. In local face coordinates, document backing, display, inner gasket, bezel and front lip depths. A solid body cap must not cover an intended cavity. A screen opening must not reveal background through its sides.
- Use polygon rings, profiled extrusions, lathed sections, and custom faces when they express the reference better than overlapping boxes. Keep bevel width proportional to the part; avoid beveled rings so narrow that their bevels self-intersect.
- Place repeated armor, cells and fixtures on their actual support surfaces, using local tangent frames. Check panel boundaries and seams. Decorative overlaps should be intentional; coplanar surfaces cause flicker.
- Match polygon counts and facet scale to the established art style. Hexagonal means six-sided when the user asks for a hex silhouette; clipped rectangles and octagons are different shapes.
- Add small features after the large forms work. Use existing vector contours for logos or lettering when available rather than approximating a chosen typeface.

## Materials and browser cost

Use a small deliberate palette of shared materials. Metal needs a reflection source to read as metal; tune roughness together with preview lighting, rather than increasing metalness alone. Distinguish painted surfaces, bare metal, glass and emissive indicators. Keep glow restrained unless the reference calls for it.

Bake static display artwork into a single texture or a compact merged/instanced surface instead of creating one draw per pixel. Clearly label illustrative display content when the actual website is not yet integrated. Do not pretend a picture of a site is a live site.

Keep the result as reusable geometry/model code or a normal asset format supported by the app. Share or merge static repeated parts where useful, preserve meaningful part names and pivots, and dispose owned resources. Avoid new packages, heavy postprocessing, full-resolution textures or a new toolchain unless needed for the requested asset. A static prop should not require a continuous update loop.

## Compare visually before declaring success

Use an allowed browser/rendering tool to inspect a front three-quarter view plus front, side and rear views. Frame the model consistently with the reference, with neutral lighting that reveals shape and metal reflections. Check:

- silhouette and relative scale at thumbnail size;
- cavity depth, backfaces, gaps and intersections;
- facet scale, material separation and screen readability;
- appendage attachment points and any expected motion pivots;
- draw count/geometry cost where measurement is available.

Fix a specific observed mismatch, then compare again. Build/lint and mesh mathematics cannot establish visual fidelity. If rendering access is blocked, respect that boundary, complete what can be checked, state the gap and provide the preview location. Never route around denied browser access with an alternate host, port or capture method.

When a user rejects the same asset repeatedly, revisit proportions and structural geometry before another detail pass. Ask a focused visual question only when the rejection leaves a consequential ambiguity; continue independent work while awaiting clarification when possible.

Explain the material changes and the verification actually performed. Do not call an asset a one-to-one match unless the comparison supports it. Keep scene placement and functional interactions within the scope the user has approved.
