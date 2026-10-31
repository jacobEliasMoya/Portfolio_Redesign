# Sabo — Philippe Moesch

Additional opt-in text face: [Press Start 2P](press-start-2p/README.md), installed and self-hosted at Jacob's request on 2026-10-30. Use only for the non-header text he identifies; Sabo remains the selected heading/3D lettering face.

Selected for the JM space portfolio. Filled is the default display face; Regular is the outline/inline design, not a lighter weight.

- Designer's release: https://www.behance.net/gallery/16531089/Free-Font-Sabo
- Original download listing: https://philippemoesch.gumroad.com/l/TEEfS
- Download mirror: https://www.wfonts.com/font/sabo

The designer describes the font as free with a royalty-free licence on both the Behance release and Gumroad listing. The mirror archive contains no separate licence document. Copyright remains with Philippe Moesch.

The mirror's two OTF files were duplicates of Filled. Sabo-Regular.otf was losslessly reconstructed from the supplied Sabo-Regular.woff using FontTools, preserving its outlines and naming. The two supplied WOFF files are distinct and unchanged.

The build self-hosts the WOFF files through next/font/local. Use `font-display` for Filled and `font-outline` for the outline style. The HUD and PilotMenu directly use saboFilled.className and its resolved fontFamily from app/fonts.ts. font-sans remains the readable companion, not Sabo. Both designs are weight 400; synthetic bold and italic are disabled. Keep long prose in a readable companion face when implementing the new design.

UI delivery uses losslessly repackaged WOFF2 copies. Rebuild with python scripts/prepare-ui-fonts.py (development-only fonttools[woff]). The script verifies identical glyph outlines and character maps; source WOFF/OTF files stay unchanged.

Three.js HUD labels use the exported outline data at public/fonts/sabo-filled.typeface.json. Regenerate via python scripts/export-hud-typeface.py (fontTools). Apostrophe/slash marks are adapted from Sabo comma/hyphen because the source face does not supply them. All normal letter outlines are preserved.
