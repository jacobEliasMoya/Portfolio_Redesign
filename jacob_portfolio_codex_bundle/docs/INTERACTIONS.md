# Interaction Specification

## General principle

Build the experience static first. Interaction should increase meaning, navigation, feedback, or delight; it should not be required to understand the page.

## What I Build — desktop

### Base state

- Left column: sticky `WHAT I BUILD` title block.
- Right column: vertically flowing capability pills.
- Left title block is intentionally shorter than the total right-side content.
- Title should remain fixed within the chapter while right-side content scrolls.

### Capability behavior

Each inactive capability is a thick, rounded horizontal pill.

When the capability reaches the active scroll zone:

1. It expands vertically into a larger panel/canvas.
2. Its title remains prominent.
3. Short explanatory copy appears.
4. Contextual technologies/tools appear.
5. Optional small project/example annotation may appear.
6. The next capability approaches as the active item eventually releases/collapses or scrolls away.

Do not make the behavior feel like a standard accordion. The visual metaphor is that the pill itself becomes the canvas.

### Suggested technology mapping

These are directional, not mandatory content:

Creative Development
- React
- Next.js
- TypeScript
- Three.js
- motion/animation tooling where actually used

Full-Stack Websites
- Next.js
- Node.js
- Go where relevant
- PostgreSQL
- Payload/CMS
- APIs

Digital Experiences
- React
- Three.js
- WebGL/motion tooling where relevant

AI-Driven Development
- agent-assisted workflows
- tool use
- structured outputs
- retrieval/evaluation where actually used
- TypeScript/Node/Go/Python only when backed by real work

Technical Direction
- architecture
- APIs
- data/content models
- deployment/infrastructure
- CI/CD
- observability

Do not claim tools or expertise that are not actually supported by the owner's work.

## What I Build — mobile

Do not force a long sticky-scroll sequence onto a narrow viewport.

Recommended adaptation:

- `WHAT I BUILD` becomes a normal section heading.
- Capability pills become touch-friendly expandable panels.
- Tap toggles expanded content.
- Only one may be open at once if that creates a cleaner experience.
- Expanded content should remain readable without scroll-jacking.

## Project cards

Default behavior:

- Strong visual/art-directed card.
- Hover/focus may create restrained movement or reveal metadata.
- Card itself remains a normal navigational element.

On click/open, transition to a real case-study route or full detail experience containing:

- Problem
- Role
- Constraints
- System / architecture
- Important decisions
- Implementation
- Visual design/product work
- Technical stack
- Result/outcome
- Links/code where appropriate

The case study is where engineering credibility is proven. The homepage card should not attempt to contain everything.

## Lab

Lab is an exploratory index.

Possible item categories:

- experiments
- Go/backend builds
- AI/agent prototypes
- small utilities
- technical notes
- design experiments
- unfinished or evolving concepts

An item may open a dedicated Lab entry, external demo, repository, or lightweight modal/preview depending on its depth.

Lab interactions may be slightly more playful than Selected Work, but must stay within the same visual language.

## Motion

Add motion after functional behavior is complete.

Good motion:

- subtle 3D object response
- capability pill expansion
- project hover response
- restrained parallax
- smooth section state transitions
- deliberate page transitions

Bad motion:

- constant background movement
- scroll-jacking
- animations that delay navigation
- excessive elastic/bouncy motion
- effects that make reading harder

Respect `prefers-reduced-motion`.
