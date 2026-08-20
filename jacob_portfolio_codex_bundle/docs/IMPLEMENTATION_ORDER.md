# Implementation Order

## Phase 1 — static structure

Build semantic content and routing first.

- layout
- navigation
- hero
- selected work
- What I Build content
- Lab
- footer
- project detail routes

At this point, the site must work without custom animation logic.

## Phase 2 — visual system

Reproduce the approved reference direction faithfully.

- typography
- color tokens
- spacing
- border radii
- responsive widths
- image/art placement
- microcopy styling

Do not improvise a new design system during implementation.

## Phase 3 — responsive/mobile

Make every static section work across breakpoints before adding desktop scroll interactions.

## Phase 4 — functional interactions

- navigation/menu
- project links/carousel behavior
- capability expansion
- Lab item behavior
- any theme toggle or other utility controls

## Phase 5 — desktop sticky behavior

Implement What I Build sticky title and scroll-driven active capability state.

Avoid scroll-jacking. Prefer native scrolling, `position: sticky`, intersection observers, CSS transitions, and small amounts of state.

## Phase 6 — motion/polish

- capability transforms
- subtle project hover
- 3D response/parallax where justified
- route transitions if they remain fast and accessible

## Phase 7 — quality

- keyboard testing
- screen-reader landmarks/labels
- reduced motion
- focus states
- performance
- image optimization
- CLS/LCP
- mobile touch targets
- error states
- real content validation

## Rule of thumb

Static state must work.
Interactive state must improve it.
Motion must justify itself.
