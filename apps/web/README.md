# Portfolio Web

The public-facing portfolio application, built with Next.js App Router.

## Getting started

From the repository root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Frontend architecture

The application will use an adapted atomic-design system. Atomic design organizes
reusable UI by composition level; application routes, data access, and business
features remain separate from that hierarchy.

```text
apps/web/
├── app/                         # Routes, layouts, metadata, and route boundaries
│   ├── (site)/                  # Public-site route group
│   │   ├── page.tsx
│   │   └── [...slug]/
│   │       └── page.tsx
│   ├── api/                     # Route handlers, when required
│   ├── globals.css
│   ├── layout.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
│
├── components/
│   ├── atoms/                   # Small, context-free UI primitives
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.types.ts
│   │   │   ├── button.test.tsx
│   │   │   └── index.ts
│   │   ├── heading/
│   │   └── icon/
│   │
│   ├── molecules/               # Small combinations of atoms
│   │   ├── card-header/
│   │   ├── navigation-item/
│   │   └── social-link/
│   │
│   ├── organisms/               # Complete, reusable page sections
│   │   ├── site-header/
│   │   ├── project-grid/
│   │   └── contact-form/
│   │
│   ├── templates/               # Page composition without route-specific data
│   │   ├── landing-page/
│   │   └── project-page/
│   │
│   └── renderers/               # Maps CMS block data to organisms/templates
│       ├── block-renderer.tsx
│       ├── block-renderer.types.ts
│       └── registry.ts
│
├── features/                    # Domain behavior that is not generic UI
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── queries/
│   │   ├── types/
│   │   └── index.ts
│   └── contact/
│
├── graphql/                     # Shared GraphQL infrastructure
│   ├── client.ts
│   ├── fragments/               # Reusable, colocatable data selections
│   ├── generated/               # Generated types/documents; do not edit
│   └── schema.graphql
│
├── hooks/                       # Cross-feature React hooks
├── lib/                         # Framework adapters and shared utilities
├── providers/                   # Application-level React providers
├── styles/                      # Design tokens and shared style utilities
├── types/                       # Cross-cutting TypeScript types
├── public/                      # Static assets
└── tests/                       # Integration and end-to-end tests
```

This is the target structure. Directories should be added as the application
needs them rather than committed empty.

## Atomic layers

| Layer | Responsibility | May compose |
| --- | --- | --- |
| Atoms | Generic primitives with no domain or CMS knowledge | HTML and other atoms |
| Molecules | Focused UI groups with one small responsibility | Atoms |
| Organisms | Reusable sections with meaningful layout | Atoms and molecules |
| Templates | Page-level visual composition with typed content slots | Atoms, molecules, and organisms |
| Routes | Fetch data, handle route concerns, and select a template | Templates and features |

Atomic classification is based on responsibility, not physical size. A component
that contains project-specific behavior belongs in `features/projects`, even if it
is visually small.

## Dependency rules

- Dependencies flow upward: atoms must not import molecules, organisms, templates,
  features, GraphQL documents, or route modules.
- Reusable components receive typed props and do not fetch their own page data.
- Route files remain thin: validate route input, load data, and render a template.
- Features may use atomic components; atomic components must not depend on features.
- Renderers translate external CMS block types into explicit component props.
- GraphQL fragments live beside a feature when used only by that feature, or in
  `graphql/fragments` when genuinely shared.
- Each component folder exposes a small public API through `index.ts`. Avoid global
  barrel files that hide dependency direction or increase client bundles.
- Prefer Server Components. Add `"use client"` only at the lowest interactive
  boundary that requires browser state, effects, or event handlers.

## Naming conventions

- Use `kebab-case` for directories and filenames.
- Use `PascalCase` for React component names and exported TypeScript types.
- Use descriptive component names such as `ProjectCard`, not layer-prefixed names
  such as `MoleculeProjectCard`.
- Keep tests, stories, styles, and types beside the component they describe.
- Give GraphQL fragments globally unique, domain-oriented names such as
  `ProjectCard_Project`.

## Planned architecture phases

1. Establish atomic component folders, design tokens, and component conventions.
2. Add GraphQL client configuration, code generation, and colocated fragments.
3. Add a typed CMS block registry and dynamic renderer.
4. Add component tests, visual stories, and route-level integration coverage.

