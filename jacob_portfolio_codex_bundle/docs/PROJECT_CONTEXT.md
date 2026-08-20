# Project Context

## Project intent

This portfolio is a deliberate experiment in AI-driven development. The goal is not to produce a "vibe-coded" website or hand the entire project over to AI. AI should act as a creative and technical collaborator that helps extend Jacob's creativity, reduce workload, and build confidence with modern development practices while he prepares for new job opportunities.

The finished portfolio should be an organized, maintainable piece of art that Jacob understands and can confidently explain, modify, and continue building.

The portfolio is also one part of a larger career-positioning system. The portfolio, résumé, LinkedIn, GitHub, case studies, Lab, technical learning, and future projects should express different aspects of the same professional identity rather than repeat identical information.

## Professional North Star

The central professional identity is:

> A product-minded software engineer with deep frontend strength, broad end-to-end ownership, strong visual judgment, and an increasingly AI-native approach to building software.

The memorable portfolio-facing identity is **Creative Engineer**, grounded by the descriptor:

`DESIGN / ENGINEERING / SYSTEMS / AI`

For recruiting, searchability, and conventional professional contexts, **Software Engineer** remains the primary identity. The site should support credible positioning toward roles such as Senior Frontend Engineer, Product Engineer, Design Engineer, Creative Engineer, frontend-heavy Full-Stack Engineer, and Web Platform Engineer—especially at AI-native product companies.

Do not position Jacob as an ML researcher, AI infrastructure specialist, prompt engineer, or a designer who merely knows some React. The credible story is an experienced software engineer adapting aggressively to AI-native development and expanding the portion of the software lifecycle he can responsibly own.

The long-term movement is from receiving frontend tickets toward owning ambiguous product problems from definition through production. Four qualities should repeatedly emerge through the work:

- **Taste** — visual judgment, interaction, hierarchy, typography, responsiveness, and the ability to reject generic solutions.
- **Engineering** — production systems, architecture, frontend, APIs, databases, CMS design, deployment, testing, performance, and debugging.
- **Ownership** — understanding constraints, making decisions, crossing system boundaries, modernizing systems, and maintaining shipped work.
- **Direction** — visible growth toward AI-native development, agentic workflows, backend engineering, Go, database depth, and systems thinking.

The intended value proposition is that Jacob can take an ambiguous digital problem, determine what should exist, design the experience, architect the system, use AI intelligently to accelerate implementation, and own the result through production.

## Product direction

- Use the approved screenshots as the visual source of truth.
- Begin with a static Next.js frontend and temporary content.
- Build the homepage section by section rather than generating the entire experience at once.
- Preserve the distinctive art direction instead of translating it into a generic component-library layout.
- Introduce Payload CMS after the static frontend and its content needs are understood.
- Eventually replace temporary content with typed data from Payload without unnecessarily redesigning the frontend.

## Workspace map

- `apps/web` is the active public-facing Next.js application and the location for frontend implementation.
- `apps/cms` is the Payload application that will be addressed after the static frontend and content model are ready.
- `jacob_portfolio_codex_bundle` contains the approved visual references, design documentation, prompts, and durable project context. It is reference material, not the Next.js application itself.

The web application currently uses Next.js App Router, React, strict TypeScript, Tailwind CSS, Jest with Testing Library, and Playwright. Its documented architecture is a target that should be introduced incrementally as real needs appear; do not create empty layers or premature abstractions merely to match the proposed folder tree.

The homepage should remain concise:

`Hero → Selected Work → What I Build → Lab → Contact`

Do not add conventional portfolio sections by default. About content, a résumé timeline, testimonials, client logos, technology inventories, process explanations, or other secondary material should earn their place or live on a dedicated route.

Each homepage section has a specific strategic job:

- **Hero — Identity:** Establish Creative Engineer at the intersection of visual thinking and software engineering. Interaction should enhance the composition, not become the composition.
- **Selected Work — Evidence:** Show what has been proven or shipped. Expressive cards earn attention; detailed case studies establish technical credibility.
- **What I Build — Ownership:** Show what Jacob can responsibly own without becoming a conventional skills grid. Technologies support capability rather than replace it.
- **Lab — Trajectory:** Show where Jacob is going through experiments, unfinished ideas, research, AI/agent work, Go/backend work, tools, and prototypes. Lab is intentionally distinct from polished case studies.
- **Contact — Conversion:** End confidently and convert interest into a conversation without repeating the résumé.

Selected Work case studies should eventually provide evidence around problem, role, constraints, system, architecture, decisions, implementation, and result. Where truthful and relevant, they may also include interface screenshots, architecture diagrams, data models, API and database decisions, CMS design, infrastructure, accessibility, performance, failed approaches, AI involvement, testing, deployment, monitoring, code, and lessons learned.

Never invent metrics, responsibilities, technologies, or outcomes. Temporary content must be recognizable as temporary and should later be replaced with substantiated evidence.

## Learning goals

- Learn TypeScript and React through concepts that arise naturally during implementation.
- Learn how Payload models, stores, and delivers portfolio content.
- Learn the testing strategy as part of implementation, including Jest, React Testing Library, and Playwright.
- Become more comfortable directing and reviewing AI-assisted development.
- Understand the architecture and tradeoffs well enough to discuss them in interviews.
- Increase the amount of a software system Jacob can understand, direct, evaluate, and responsibly own—not merely the number of frameworks he has encountered.

Teaching should be contextual rather than a large abstract course delivered before implementation. However, contextual learning must not mean moving continuously without reflection. Intentional pauses for review are essential.

## Working rhythm

Each meaningful section or milestone should follow this rhythm:

1. **Observe** — Study the approved references and identify the visual, responsive, content, and interaction requirements.
2. **Plan** — Define the component boundaries, typed data shapes, accessibility needs, and implementation approach.
3. **Build** — Implement a focused portion of the experience and explain relevant concepts as they appear.
4. **Pause and review** — Stop at a meaningful checkpoint before continuing. Review both the visual result and the technical ideas introduced.
5. **Refine** — Apply feedback, verify the section, and only then move to the next milestone.

Review checkpoints should include, where relevant:

- What was built and why it was structured that way.
- The TypeScript, React, Next.js, or Payload concepts introduced.
- The testing tools and techniques introduced, including what a test protects, why it belongs at that testing layer, and how to read a failure.
- A short walkthrough of the important code in plain language.
- Questions from Jacob before more abstractions are added.
- Visual comparison against the approved references.
- Accessibility, responsiveness, and maintainability checks.
- A small optional exercise or modification Jacob can attempt to reinforce the lesson.
- What Jacob should be able to explain about the work in an interview.

Do not proceed through several major sections without an explicit learning and design review. A checkpoint is part of the work, not an interruption to it.

AI-assisted implementation should alternate between direct practice, delegation, critique, debugging, and review. The goal is neither to stop writing code nor to judge skill by the volume of manually typed code. Jacob should develop enough technical literacy to direct AI, detect weak output, evaluate architecture, and take responsibility for the result.

## Testing as a learning track

Testing is a first-class part of the learning process, not an implementation detail that AI performs silently. When tests are added, changed, run, or fail, pause at an appropriate checkpoint to explain the relevant ideas.

- **Jest** provides the test runner, assertions, setup, and fast feedback for unit and component tests.
- **React Testing Library** renders React components and encourages testing through user-visible semantics and behavior rather than component internals.
- **Playwright** runs the application in real browsers and verifies important page-level behavior, navigation, responsive states, and complete user journeys.

For each meaningful test, explain:

- The behavior or risk being protected.
- Why the test is a unit/component test or an end-to-end test.
- How the test is arranged, executed, and asserted.
- Which queries and assertions were chosen and why.
- What a representative failure looks like and how to investigate it.
- What should deliberately remain untested at that layer.

Avoid duplicating the same assertion across every testing layer. Prefer many focused Jest and Testing Library tests for component contracts and a smaller number of high-value Playwright journeys for browser-level confidence. Include accessibility and responsive behavior when they are meaningful to the feature.

## Development principles

- Prefer clear, intentional code over clever abstractions.
- Introduce reusable systems when repetition or a known requirement justifies them.
- Keep content, presentation, and CMS concerns appropriately separated.
- Use strong typing to clarify the design rather than adding types only for ceremony.
- Explain decisions and tradeoffs, including when a simpler approach is chosen.
- Maintain accessibility and responsive behavior throughout implementation.
- Test in proportion to risk and value.
- Keep Jacob in the role of creative director and informed technical owner.
- Use AI as an engineering capability, with attention to verification, failure handling, reliability, security, cost, latency, and human judgment—not as a novelty or a substitute for understanding.

## Relationship to the wider career system

The portfolio should not attempt to perform every career function by itself:

| Surface | Primary question |
| --- | --- |
| Portfolio | Why should someone remember Jacob? |
| Selected Work | Has he built meaningful things? |
| Case studies | Does he understand engineering decisions? |
| What I Build | What can he own? |
| Lab | Where is he going? |
| Résumé | Has he done serious professional work? |
| LinkedIn | Does he match the role being recruited for? |
| GitHub | Do the technical claims hold up? |
| Interview | Can he reason through difficult systems? |

Portfolio implementation decisions should reinforce this system, but work on the website should not silently expand into rewriting every professional surface. Those are related future workstreams with their own requirements.

## Initial sequence

1. Establish the smallest necessary visual foundation and design tokens.
2. Build and review the homepage hero.
3. Build and review Selected Work.
4. Continue through the remaining homepage sections one at a time.
5. Define the real content model once the static presentation is stable.
6. Integrate Payload CMS incrementally, with dedicated learning checkpoints.

This sequence may evolve through review, but section-by-section implementation and intentional learning pauses should remain core constraints.

## Final test

The goal is not merely to become a better website developer or someone who lets AI write code. The work should support Jacob becoming an engineer with enough technical depth, product judgment, visual taste, systems understanding, and AI leverage to take an ambiguous idea from problem to production.

The portfolio should make that engineer memorable while remaining truthful, technically credible, and unmistakably personal.
