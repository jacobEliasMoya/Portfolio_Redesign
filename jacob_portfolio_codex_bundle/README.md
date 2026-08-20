# Jacob Moya Portfolio — Codex Design Bundle

This bundle collects the strongest portfolio design directions, interaction explorations, mobile states, and implementation prompts from the redesign discussion.

## Canonical direction

Use `images/approved/` as the primary visual reference set.

- `00_user_reference.png` — source/reference composition from the design discussion.
- `01_homepage_core_direction.png` — current core homepage direction after removing the weaker designer/engineer middle section.
- `02_homepage_with_lab.png` — homepage direction with the Lab concept added.
- `03_interaction_states.png` — interaction/state exploration for projects, What I Build, and Lab.
- `04_mobile_responsive_states.png` — responsive/mobile behavior exploration.

Use `images/explorations/` only as supporting history. Some of those renders contain ideas that were explicitly rejected; see `docs/DESIGN_DECISIONS.md` before copying anything from them.

When references disagree, use this priority order:

1. `docs/PROJECT_CONTEXT.md` for current product, career, learning, and workflow intent.
2. `docs/DESIGN_DECISIONS.md` for explicitly approved and rejected visual decisions.
3. `images/approved/` for composition and art direction.
4. The remaining design and interaction documents for implementation guidance.
5. `prompts/` as staged implementation history and reusable task framing.
6. `images/explorations/` as historical context only.

## Reference asset policy

Treat the checked-in PNG files as durable reference artifacts rather than generated application assets.

- Do not overwrite an approved reference when the direction changes; add a clearly named revision so Git history remains understandable.
- Do not import exploration images into the production application merely because they are available in the repository.
- Copy or recreate only the production assets actually required by `apps/web` and place those assets in the web application.
- Keep generated screenshots, test artifacts, and temporary exports outside this bundle unless they are intentionally promoted into the reference set.
- Confirm that any future third-party reference material is appropriate to redistribute before committing it to this public repository.

## Files for Codex

- `docs/MASTER_BRIEF.md` — overall product/design direction.
- `docs/DESIGN_SYSTEM.md` — visual language and anti-patterns.
- `docs/DESIGN_DECISIONS.md` — approved/rejected decisions and rationale.
- `docs/INTERACTIONS.md` — project, capability, Lab, and navigation behaviors.
- `docs/RESPONSIVE.md` — desktop/mobile adaptation rules.
- `docs/IMPLEMENTATION_ORDER.md` — static-first development sequence.
- `prompts/00_codex_master_prompt.md` — paste this first when starting the Codex project.
- `prompts/01_static_homepage.md` — build the static composition.
- `prompts/02_what_i_build.md` — implement the sticky expanding capability interaction.
- `prompts/03_lab.md` — implement the Lab doorway and experiment index.
- `prompts/04_projects.md` — implement project interaction and case-study behavior.
- `prompts/05_mobile.md` — adapt the interaction model for mobile.
- `prompts/06_final_polish.md` — motion, performance, accessibility, and QA pass.

## Core rule

Do not redesign while implementing. Preserve the reference art direction first. Build the complete static/responsive experience before adding behavior. Interactions should enhance the composition rather than become the composition.
