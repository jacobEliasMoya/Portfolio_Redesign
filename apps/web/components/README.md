# Component Architecture

This directory will use the adapted atomic-design structure documented in the
web application README:

- `atoms/` for context-free primitives
- `molecules/` for focused combinations of atoms
- `organisms/` for reusable sections
- `templates/` for page-level compositions
- `renderers/` for explicit CMS block mappings

Component implementations are intentionally deferred until the visual design is
approved. Add each directory and component only when the application needs it;
do not commit empty layer directories or speculative primitives.
