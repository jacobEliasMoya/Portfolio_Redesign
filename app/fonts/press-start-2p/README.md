# Press Start 2P — CodeMan38

Downloaded from the official Google Fonts repository on 2026-10-30 at Jacob's explicit request. Reserved for non-header text he selects; the default body, Sabo headings and live Three.js lettering remain unchanged.

- [Google Fonts specimen](https://fonts.google.com/specimen/Press+Start+2P)
- [Pinned source folder](https://github.com/google/fonts/tree/e06fe11c39051bddaef73ec338a9d1c8175723f1/ofl/pressstart2p)
- [Original TTF download](https://raw.githubusercontent.com/google/fonts/e06fe11c39051bddaef73ec338a9d1c8175723f1/ofl/pressstart2p/PressStart2P-Regular.ttf)
- Designer: CodeMan38. Copyright 2012 The Press Start 2P Project Authors. Reserved Font Name: Press Start 2P.
- License: SIL Open Font License 1.1; original text in OFL.txt, also distributed at /fonts/press-start-2p/OFL.txt. Original METADATA.pb retained alongside the TTF.
- Original TTF SHA-256: `034c77f1f05ec89421e4a63f0e3a4ca1ecf852cc6d2bf611f126f275728e017d`.

The original TTF is retained for desktop installation. The WOFF2 is a lossless format conversion, without subsetting, changes to character coverage, glyph outlines or naming. Rebuild and verify with `python scripts/prepare-arcade-font.py` (development-only `fonttools[woff]`).

The app self-hosts WOFF2 through `pressStart2P` in app/fonts.ts. Its CSS variable is registered on the root layout, with no preload. Apply only where requested:

Current selected usage: the Explorer Guide's instruction text, descriptions and notes. Guide headings, buttons and raised keyboard keycap labels use Sabo Filled. Directional arrow keycaps use small pixel-shaped vector arrows because Sabo does not supply those symbols.

```tsx
<p className="font-arcade">Selected non-header text</p>
```

CSS modules can use `font-family: var(--font-press-start-2p), monospace`; components can also import `pressStart2P.className` or `pressStart2P.style.fontFamily`. Only normal weight 400 exists. This setup does not convert or replace Three.js Sabo mesh assets.

Windows installation uses the original TTF in the current account's LocalAppData/Microsoft/Windows/Fonts folder and the current-user Fonts registry entry. Apps that cache their font menu may need to be reopened.
