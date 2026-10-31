"""Export the selected Sabo outlines to Three FontLoader data (no raster text)."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.areaPen import AreaPen
from fontTools.pens.reverseContourPen import ReverseContourPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
font=TTFont("app/fonts/Sabo-Filled.woff2");glyphset=font.getGlyphSet();glyphs={}
class TypefacePen(BasePen):
 def __init__(self):super().__init__(glyphset);self.out=[];self.start=None
 def emit(self,code,*points):self.out.append(code);self.out.extend(str(round(v,4)) for p in points for v in p)
 def _moveTo(self,p):self.start=p;self.emit("m",p)
 def _lineTo(self,p):self.emit("l",p)
 def _curveToOne(self,a,b,end):self.emit("b",end,a,b)
 def _qCurveToOne(self,control,end):self.emit("q",end,control)
 def _closePath(self):
  if self.start:self.emit("l",self.start)
 def _endPath(self):pass
for code,name in font.getBestCmap().items():
 pen=TypefacePen();area=AreaPen(glyphset);glyphset[name].draw(area);glyphset[name].draw(ReverseContourPen(pen) if area.value>0 else pen)
 glyphs[chr(code)]={"ha":font["hmtx"].metrics[name][0],"x_min":0,"x_max":font["hmtx"].metrics[name][0],"o":" ".join(pen.out)}
# Sabo does not contain apostrophe or slash. Derive these small HUD marks from
# its own comma/hyphen outlines; keep every supplied letter contour unchanged.
comma=font.getBestCmap()[ord(",")];hyphen=font.getBestCmap()[ord("-")]
bounds=BoundsPen(glyphset);glyphset[comma].draw(bounds);cap=BoundsPen(glyphset);glyphset[font.getBestCmap()[ord("H")]].draw(cap)
pen=TypefacePen();glyphset[comma].draw(TransformPen(pen,(1,0,0,1,0,cap.bounds[3]-bounds.bounds[3])))
glyphs["'"]={"ha":font["hmtx"].metrics[comma][0],"x_min":0,"x_max":font["hmtx"].metrics[comma][0],"o":" ".join(pen.out)}
transform=(.6,1.1,-1.1,.6,0,0);bounds=BoundsPen(glyphset);glyphset[hyphen].draw(TransformPen(bounds,transform))
pen=TypefacePen();glyphset[hyphen].draw(TransformPen(pen,(*transform[:4],-bounds.bounds[0],-bounds.bounds[1])))
glyphs["/"]={"ha":round(bounds.bounds[2]-bounds.bounds[0]+80),"x_min":0,"x_max":round(bounds.bounds[2]-bounds.bounds[0]),"o":" ".join(pen.out)}
for char,alias in [("’","'"),("‘","'"),("–","-"),("—","-")]:
 if char not in glyphs and alias in glyphs:glyphs[char]=glyphs[alias]
head=font['head'];data={"glyphs":glyphs,"familyName":"Sabo Filled","ascender":font['hhea'].ascent,"descender":font['hhea'].descent,"underlinePosition":font['post'].underlinePosition,"underlineThickness":font['post'].underlineThickness,"boundingBox":{"xMin":head.xMin,"xMax":head.xMax,"yMin":head.yMin,"yMax":head.yMax},"resolution":head.unitsPerEm,"original_font_information":{"source":"Philippe Moesch / existing Sabo Filled WOFF2; exact outlines, winding normalized for Three.js"}}
output=Path('public/fonts/sabo-filled.typeface.json');output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(data,separators=(',',':')),encoding='utf-8');print(f'{len(glyphs)} glyph mappings / {output.stat().st_size} bytes')
