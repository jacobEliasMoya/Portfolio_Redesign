"""Losslessly repackage the selected Sabo WOFF outlines as WOFF2 for UI delivery.
Development only: fonttools[woff]. Keep the designer's source files unchanged.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
for source in Path("app/fonts").glob("*.woff"):
 font=TTFont(source,recalcTimestamp=False);original=font.getGlyphSet();recordings={}
 for name in font.getGlyphOrder():
  pen=RecordingPen();original[name].draw(pen);recordings[name]=pen.value
 cmap=font.getBestCmap();destination=source.with_suffix(".woff2");font.flavor="woff2";font.save(destination)
 rebuilt=TTFont(destination,recalcTimestamp=False);glyphs=rebuilt.getGlyphSet()
 assert cmap==rebuilt.getBestCmap()
 for name,recording in recordings.items():
  pen=RecordingPen();glyphs[name].draw(pen);assert recording==pen.value,name
 print(f"{destination}: {len(recordings)} glyphs verified identical to source")
