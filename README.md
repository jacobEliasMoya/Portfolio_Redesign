# Jake’s Space

Jacob Moya’s interactive 3D portfolio—a space to explore, fly through, and play with. Pixel roots meet sculpted hexagonal worlds, tactile lettering, and a little destruction.

**[Visit Jake’s Space](https://jake-space.netlify.app/)** · [Current implementation](docs/current-scene.md) · [Development history](CHANGELOG.md)

The portfolio is a work in progress. The playable universe and visual experiments are the current foundation; more work and portfolio content will follow.

## Inside the universe

- **Explore:** scroll between the Jakes Space lettering, Earth, and Moon, or choose a destination. Drag the worlds and lettering to inspect them.
- **Fly:** launch an angular UFO from the lunar pad, roll through space, and return to land. Movement and the chase camera follow the ship’s orientation.
- **Leave a mark:** charged bolts and a held red death ray carve physical craters, scorch terrain, and scatter debris. Damage lasts until the universe is reset.
- **Chase a score:** destroy miniature aircraft and catch rare Cape Canaveral rocket launches, including staged booster separation. A mechanical 3D counter tracks confirmed damage and destruction.
- **Unlock Singularity:** score above 6,767 to fire a one-use atom bomb. Detonate on impact or remotely to form a black hole that pulls in the surrounding universe.
- **Step into Silver Orbit:** a separate 3D monitor experience presents the live portfolio on its display, with orbitable hardware, a focused playing view, and optional scanline, green-phosphor, and amber treatments.

Earth and Moon share a chunky hexagonal, topographic style. Sabo lettering uses real extruded shapes and block volumes; the Guide assembles from overlapping 3D blocks. The scene respects reduced-motion preferences and retains native HTML navigation and controls.

## Run locally

Requires **Node.js 20.9 or newer** and **npm**.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The current app uses bundled assets and needs no API keys, CMS, or database to run.

For a production build:

```sh
npm run build
npm run start
```

## Routes

| Route | Experience |
| --- | --- |
| `/` | Main portfolio universe and playable UFO flight |
| `/monitor` | Silver Orbit monitor with the live site on its display |
| `/earth` | Earth model inspection |
| `/moon` | Moon model inspection |
| `/ufo` | UFO inspection and flight preview |
| `/black-hole` | Black-hole variants and consumption previews |
| `/satellite` | Archive satellite inspection |
| `/studio` | Foundation component preview |

The earlier `/arcade` cabinet route has been retired. Its concept references remain in the repository; `/monitor` is the active hardware experience.

## Flight controls

Select **Launch** or press **L** after the introduction. The in-app **Guide** covers controls, landing, scoring, and Singularity in more detail.

| Input | Action |
| --- | --- |
| W / S | Thrust / reverse |
| A / D or ← / → | Turn |
| Q / E | Roll |
| ↑ / ↓ | Pitch |
| Space / C | Rise / descend relative to the ship |
| Shift | Brake; reduce arrow-key sensitivity for precise aiming |
| 1 | Charged bolts: hold click or F, then release to fire |
| 2 | Red death ray: hold click or F to fire immediately |
| 3 | Select Singularity after unlocking; click or F to launch, then again to detonate |
| L | Launch / land when above and within range of the lunar pad |
| R | Reset the saucer |

**Exit Pilot** returns to exploration and parks the ship. **Reset Universe** restores the scene and score after using Singularity. Touch supports object dragging and a two-finger tour gesture; flight currently requires a keyboard. Physical iPhone animation/input and sustained device performance remain areas for further review.

## Built with

Next.js App Router, React, TypeScript, Three.js, React Three Fiber, Drei, and Tailwind CSS. Fonts are self-hosted: **Sabo Filled** for display lettering and **Press Start 2P** for Guide instructions.

Large populations use shared geometry and instancing. Projectiles, crash debris, and transient effects use bounded pools; animation updates stay outside React state. The root has separate world and foreground HUD renderers. Silver Orbit adds an outer model renderer and a live, same-origin HTML display; its exported GLB contains the monitor asset, not the embedded website.

## Project map

| Directory | Purpose |
| --- | --- |
| `app/` | Routes, metadata, fonts, and global styles |
| `features/` | Loader and monitor experiences |
| `components/three/` | Worlds, spacecraft, effects, cameras, and 3D HUD |
| `components/ui/` | Reusable accessible HTML interface components |
| `design-system/` | Shared visual and rendering tokens |
| `hooks/` | Browser behavior and reusable scene hooks |
| `public/models/` | Generated model data and downloadable assets |
| `scripts/` | Regression checks, offline asset generation, renders, and audits |
| `docs/` | Implementation checkpoints, references, provenance, and performance notes |

Read [AGENTS.md](AGENTS.md) for the working agreement and [docs/current-scene.md](docs/current-scene.md) for current settings. Older documentation also preserves experiments; newer checkpoints and actual source take precedence.

## Checks

```sh
node --test scripts/test-*.mjs
npm run lint
npm run build
```

Focused commands such as `npm run test:earth`, `npm run test:moon`, and `npm run test:ufo` are listed in [package.json](package.json). Offline model generation and Blender review renders are development tools, not requirements for running the app. Their dependencies and instructions live beside the relevant scripts and component documentation.

## Assets and credits

Model geometry is built for this project. Geographic data, fonts, and visual references retain their own sources and terms; generated concept images are labeled separately from implemented assets.

- [Earth construction and NASA map sources](components/three/planet/README.md)
- [Moon construction](components/three/moon/README.md) and [NASA lunar references](docs/references/moon/README.md)
- [Aircraft and OurAirports data](components/three/air-traffic/README.md)
- [Rocket construction and references](components/three/rockets/README.md)
- [Sabo by Philippe Moesch](app/fonts/README.md) and [Press Start 2P by CodeMan38](app/fonts/press-start-2p/README.md)
- [Silver Orbit concept and modeling references](docs/assets/monitor-concepts/silver-orbit-views/brief-and-prompts.md)

For measured results and their limits, see [performance notes](docs/performance.md). Pending real-device work is tracked in [mobile optimization notes](docs/mobile-optimization.md).
