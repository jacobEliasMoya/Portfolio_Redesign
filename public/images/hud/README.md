# HUD model images

These transparent PNGs are offline renders of this repository's existing models, not generative approximations. Source: createUFOV3, the static LunarLandingPad deck dimensions, shared hexagonal geometry, and Earth/Moon terrain JSON. Lighting is neutral studio lighting for small HUD readability. The Moon follows the approved sculpted-crater redesign; Earth remains the existing topographic asset.

Rebuild: node scripts/render-hud-icons.mjs. Set BLENDER_EXECUTABLE if Blender is not installed at the script default. --ships or --moon limits output. Moon review: node scripts/render-hud-icons.mjs docs/references/moon/sculpted-craters-review --moon-review.

Use the source PNGs through Next Image. Keep transparent margins and actual hull/dome proportions. Sabo is a separate self-hosted live font, not baked into these images. Generated trial icons were not selected or copied into this folder.
