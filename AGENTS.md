# Jacob Moya — 3D portfolio working agreement

## Collaboration and explanations

- Follow Jacob's flow. Explore his ideas without predicting additional features or making design decisions ahead of him.
- Distinguish planning from implementation. Discussion, questions, and speculative ideas are not authorization to start building. When implementation is explicitly requested, complete the agreed scope.
- Do the work AND explain it. Before a meaningful change, explain what will change and why. During the work, explain important concepts and tradeoffs in plain language, using concrete examples. Afterward, explain what changed, how it functions, how it was verified, and any remaining limitations.
- Help Jacob learn Three.js, React Three Fiber, rendering, async loading, and the architecture as the project develops. Do not silently produce finished code with no explanation. Scale explanations to the task; do not overwhelm him with implementation detail.
- Keep updates concise and conversational. Ask when a material preference is missing; do not repeatedly ask for approval already given.
- Work in this project checkout. A separate clone exists in the user's home directory and is not automatically synchronized. Do not maintain two independent working implementations or overwrite either clone without a reason.

## Design direction and preferences

- Evolve the earlier interactive.jacobmoya.com space portfolio into a playful, beautiful 3D experience. Preserve its personal, exploratory character.
- Inspiration: Game Boy Advance era pixel graphics, evolving into 3D and eventually potential VR. Aim for luxurious lighting, tactile depth, and extremely smooth, deliberate animation.
- Planned composition: a plane tilted away from the viewer, with its far edge rising into the scene; pixel-like foreground elements lift on hover; a 3D spaceship flies over and around it.
- Typography: Sabo by Philippe Moesch is selected. Self-host the supplied font files. Filled is the main display face; Regular is the outline design, not a lighter weight. Use a readable companion for long prose. Prefer independent designer/Behance releases over Google Fonts. Do not reintroduce Google Fonts by default.
- Logo direction: a stepped, pixel-built JM with real dimensional depth and a restrained silver/graphite finish. The concept image under docs/references is visual inspiration, not a final production model.
- Particles must look crisp and pixel-like. For the planned JM, use actual small cube instances distributed through the Sabo-shaped letters' volume: readable from the front, sculptural when rotated. Do not substitute soft circular stardust or flat sprites for this object.
- Initial palette tokens and the current cube platform are exploration tools, not final approved portfolio art direction.
- Prefer free models/assets with clear permitted web use. Record creator, source, licence and required attribution. Do not assume that a free download grants unrestricted use.

## Current scope and next steps

- Implemented: self-hosted Sabo, design tokens, atomic HTML UI, reusable 3D canvas/object/scene structure, a foundation preview, reduced-motion behavior, and standard Tailwind PostCSS configuration.
- Next planned feature: a basic loader driven by Drei loading state, later evolved into the particle JM. The loader, particle logo, quotes endpoint and full universe scene are NOT implemented yet.
- Planned loader: show a universe-themed quote before revealing the scene. The source may be internal or external; an external provider has not been chosen. Never invent real-person quote attributions. Quote retrieval should have timeout/failure handling and a local fallback.
- Track real asset loading. Drei useProgress reports Three.js LoadingManager item progress, not complete byte-level or GPU readiness. Track quote requests and scene readiness separately. A timed introduction is not measured loading progress. Only signal ready when the required scene is usable; keep errors and retries explicit.
- Keep the loader's own visual assets lightweight and available early. Do not gate loading the main scene on dismissing a loader that depends on that scene loading first.
- VR is a future possibility, not current implementation scope. Do not install or build every optional feature in advance.

## Application architecture

- app/: Next.js routes, metadata, fonts and global styles. Keep routes thin.
- design-system/: shared color, spacing, motion and renderer tokens. HTML receives CSS variables; Three.js uses the same token values. CSS pixel/rem sizes are distinct from world units.
- components/ui/atoms, molecules, organisms: reusable accessible HTML components using atomic composition.
- components/three/canvas: browser-only renderer, quality limits, Suspense and rendering failure fallback.
- components/three/objects: reusable objects and local interactions, such as the future ParticleJM and Spaceship. No quote requests or global readiness decisions here.
- components/three/scenes: compose cameras, lights and objects.
- features/: coordinate interface, scenes, data and application state. Future quote fetching/loading coordination belongs to a loader feature.
- hooks/: reusable browser behavior, including reduced-motion preference tracking.
- See docs/architecture.md for the current structure and usage.

## Packages and tools

package.json and package-lock.json are the source of truth for installed versions. Use npm and commit lockfile changes with dependency changes.

Installed runtime foundation:
- next 16.4.3, react/react-dom 19.3.0, TypeScript 5 and the Next.js App Router.
- three ^0.186.1: 3D engine.
- @react-three/fiber ^9.8.2: React renderer for Three.js. Stay on the stable React-19-compatible Fiber 9 line unless a migration is explicitly agreed.
- @react-three/drei ^10.7.9: scene helpers, OrbitControls, model/font loading and loading-progress utilities. Prefer supported helpers over rebuilding standard functionality.
- @types/three ^0.186.0: Three.js types.
- tailwindcss 4 and @tailwindcss/postcss ^4.3.3: standard CSS integration. @tailwindcss/turbopack remains in the original dev dependencies but is no longer configured as a custom CSS loader; do not restore that old loader setup.
- ESLint 9 with eslint-config-next; Node and React types are installed as development dependencies.

Discussed options, NOT installed or automatically approved for inclusion:
- @react-spring/three for spring-based hover and assembly motion.
- @react-three/postprocessing for restrained scene finishing effects.
- gltfjsx for converting models to reusable React components.
- leva for development-only scene controls.
- @react-three/rapier for physics only if needed.
- @react-three/xr for later VR/AR work.

No editor/browser extension has been selected or made a project requirement. Do not invent an extension requirement or install one without agreement. Prefer existing browser/dev tools and package documentation. Add optional packages only when a concrete approved feature needs them; check compatibility and explain the purpose.

## Rendering, accessibility and verification

- Keep WebGL and browser APIs inside client boundaries. Load the 3D scene client-side; retain useful HTML if WebGL is unavailable.
- Use React state for discrete UI changes and refs/useFrame with delta-based motion for per-frame updates. Do not set React state every frame. Give each animated property one owner.
- Share geometry/materials and use instancing for large cube populations. Do not create thousands of independent React meshes for the particle JM.
- Cap device pixel ratio; tune particle counts and quality for mobile. Use demand rendering when settled and request frames while animation is active. Avoid unnecessary renderer remounts.
- Respect system reduced motion; offer an additional user control. Keep essential text/navigation in HTML, preserve keyboard focus, provide accessible equivalents for essential interactions, and handle loading/rendering failures.
- Check npm run lint and npm run build for meaningful implementation changes. Verify changed interactions in the browser where available, including narrow layouts. State any verification gaps honestly. Do not add tests that merely mirror trivial implementation.
- npm run dev runs the local preview; npm run start serves a production build. Keep this repository local unless publication is requested. A Git push is not deployment authorization.
- Keep source, selected fonts, asset provenance and architecture documentation in the repository. Do not commit node_modules, .next, scratch files, credentials or machine-specific font installation state.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
