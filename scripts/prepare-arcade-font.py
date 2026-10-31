"""Repackage the pinned Press Start 2P source for self-hosted web delivery.
Development only: fonttools[woff]. Preserve every glyph and character mapping.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen

source = Path(__file__).resolve().parents[1] / "app/fonts/press-start-2p/PressStart2P-Regular.ttf"
destination = source.with_suffix(".woff2")
with TTFont(source, recalcTimestamp=False) as font:
    assert font["name"].getDebugName(1) == "Press Start 2P"
    cmap = font.getBestCmap()
    recordings = {}
    glyphs = font.getGlyphSet()
    for name in font.getGlyphOrder():
        pen = RecordingPen()
        glyphs[name].draw(pen)
        recordings[name] = pen.value
    font.flavor = "woff2"
    font.save(destination)
with TTFont(destination, recalcTimestamp=False) as font:
    assert cmap == font.getBestCmap()
    assert list(recordings) == font.getGlyphOrder()
    glyphs = font.getGlyphSet()
    for name, original in recordings.items():
        pen = RecordingPen()
        glyphs[name].draw(pen)
        assert original == pen.value, name
    print(f"{font['name'].getDebugName(4)}: {len(recordings)} glyphs and {len(cmap)} character mappings verified unchanged")
    print(f"TTF {source.stat().st_size} bytes; WOFF2 {destination.stat().st_size} bytes")
