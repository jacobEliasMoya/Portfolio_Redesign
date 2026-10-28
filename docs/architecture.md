# JM 3D application

This project checkout is the active implementation. The separate home-directory clone is not automatically synchronized.

## Structure

- `app/`: routes, metadata, fonts and global CSS. Routes compose features.
- `design-system/`: shared color, spacing, motion and renderer tokens. Theme maps tokens to CSS variables; Three.js imports the same values. CSS dimensions and world units remain separate.
- `components/ui/atoms/`: HTML building blocks, such as Button.
- `components/ui/molecules/`: small compositions, such as SectionHeading.
- `components/ui/organisms/`: reusable interface sections, such as StudioHeader.
- `components/three/canvas/`: browser-only renderer, pixel-density limit and error fallback.
- `components/three/objects/`: reusable objects owning their local interaction.
- `components/three/scenes/`: cameras, lighting and object composition.
- `features/`: coordinate UI, scenes and application behavior. Studio is the initial component preview.
- `hooks/`: shared browser behavior, including live reduced-motion preference tracking.

Add quote fetching and readiness coordination under a loader feature when implemented. No loader, quote endpoint or particle logo exists yet. The cube platform demonstrates the foundation, not the portfolio scene. Its colors are initial tokens, not a final palette decision.

## Rendering and accessibility

The scene loads client-side. HTML remains readable if WebGL fails. Keep essential text, navigation and controls in HTML. React state handles discrete interactions; refs and delta-based useFrame updates handle animation. Give each animated property one owner. Demand rendering avoids drawing a settled scene continuously.

Share geometry/materials and use instancing for large particle populations. The nine-tile preview is deliberately small; the future JM must not create thousands of React mesh components. Cap pixel density and tune particle budgets against real devices.

Respect system reduced motion. Users can also enable reduced motion using the visible control. Preserve keyboard focus and HTML alternatives for essential interactions.

## Running and typography

Use npm run dev, npm run build, and npm run lint. Stable Fiber 9 supports the React 19 application. Confine 3D dependencies to client boundaries. The standard Tailwind PostCSS integration replaces the previous custom CSS loader.

Use font-display for Sabo Filled, font-outline for the outline style, and system sans-serif for prose. Font provenance is in app/fonts/README.md.
