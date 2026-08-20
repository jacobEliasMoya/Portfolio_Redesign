# Codex Master Prompt — Jacob Moya Portfolio

You are helping implement an existing portfolio design, not invent a new one.

Before changing UI, read:

- `docs/MASTER_BRIEF.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/DESIGN_DECISIONS.md`
- `docs/INTERACTIONS.md`
- `docs/RESPONSIVE.md`
- `docs/IMPLEMENTATION_ORDER.md`

Use `images/approved/` as the canonical visual reference set. `images/explorations/` contains historical experiments and rejected directions; do not copy them blindly.

## Core objective

Implement a distinctive creative-engineering portfolio with a cream canvas, bold condensed black typography, technical microcopy, large pastel fields, rounded geometry, sculptural 3D visuals, and generous negative space.

The homepage structure is:

Hero → Selected Work → What I Build → Lab → Contact/Footer

Do not add conventional portfolio sections unless explicitly requested.

## Non-negotiable design constraints

- No bento/grid-heavy redesign.
- No decorative timelines, lines/circles, or process diagrams.
- No generic skill-logo card grid.
- No fake terminals, HUDs, blueprints, gears, or glassmorphism.
- No three-line `WHAT / I / BUILD` title.
- What I Build title must be visually shorter than the scrolling capability content.
- Capability pills are thick and substantial.
- `AI-Driven Development` is one of the What I Build capabilities.
- Technologies are revealed contextually inside expanded capability panels.
- `LAB`, not `LAB.`.
- Lab belongs inside a pastel visual field/container.
- Major homepage sections require generous vertical separation.

## Engineering approach

Work static-first.

1. Preserve semantic HTML/content.
2. Match desktop static composition.
3. Make responsive/mobile correct.
4. Add functional interactions.
5. Add sticky-scroll behavior.
6. Add motion last.
7. Run accessibility/performance QA.

Do not use animation to hide weak layout decisions.

When unsure, preserve the design rather than inventing a new pattern. Before major visual changes, explain what reference/constraint you are following.
