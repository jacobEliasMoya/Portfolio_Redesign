# Arcade cabinet modeling reference pack

Generated visual exploration, 2026-10-31. Created with the built-in image_gen tool, using the user-accepted front-view concept as the shared input. Original AI-generated concept artwork for this project; no third-party cabinet model, logo art or textures downloaded. In-image typography approximates the selected pixel lettering; production uses the supplied Sabo Filled font.

## Images

- [00-approved-front.png](00-approved-front.png): accepted direction from the conversation: flat playing display, 3D cabinet around it. Approval concerns the direction, not exact generated geometry or lettering.
- [01-front-playing-view.png](01-front-playing-view.png): proposed refinement with a wider visible viewport and shallower header/deck.
- [02-exploded-construction.png](02-exploded-construction.png): proposed mesh decomposition: side profiles/body, marquee, display plane, bezel, joystick and buttons.
- [03-model-turnaround.png](03-model-turnaround.png): supporting front/side/three-quarter proposal for reviewing silhouette and depth.

New images are reference proposals pending user review. They are pictures, not GLB files or renders of an existing implemented model. The live portfolio has not changed.

## Construction decisions

Keep the player-facing screen parallel to the physical monitor: a head-on rectangle without backward tilt, perspective skew, CRT curvature or an inset tunnel. Use cabinet side thickness, bevels, top marquee and the projecting angled deck for depth. A side or three-quarter construction view can show the same vertical display obliquely; that is not the final playing camera.

Prioritize usable viewport area, Earth/Jakes Space as the focal point, restrained graphite/silver/cyan materials, a thin bezel, and simple mesh parts. A wide screen is intended, but 16:9 is only a proposed baseline. Establish actual dimensions and responsive composition before implementation.

## Visual review and limitations

The generated front display is square-on and the exploded image makes the major components understandable. Generated views vary in screen aspect ratio, bezel proportions and implied depth; they are not dimensionally consistent engineering drawings. In particular, the exploded view's display is taller than the refined front view. Reconcile these with one shared dimensional plan rather than modeling each image literally. Tiny generated text is not a source asset. No browser/GPU checks are claimed for these raster concepts.

The general workflow is recorded in [reference-3d-modeling](../../../.agents/skills/reference-3d-modeling/SKILL.md), with this asset's specific constraints in its linked arcade reference. [Exact generation prompts](prompts.md) preserve the requested views and constraints for future iterations.
