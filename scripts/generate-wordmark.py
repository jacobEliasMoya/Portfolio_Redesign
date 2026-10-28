"""Generate a dense particle core from Sabo Filled, with loose edge fragments.
Development-only dependency: pip install fonttools. Run from the repository root.
"""
import json
import math
import random
import argparse
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen


class OutlinePen(BasePen):
    def __init__(self, glyphs):
        super().__init__(glyphs)
        self.contours = []
        self.current = []

    def _moveTo(self, p):
        self.current = [p]

    def _lineTo(self, p):
        self.current.append(p)

    def _curveToOne(self, a, b, c):
        p = self.current[-1]
        for step in range(1, 17):
            t = step / 16
            u = 1 - t
            self.current.append(tuple(u**3*p[i]+3*u*u*t*a[i]+3*u*t*t*b[i]+t**3*c[i] for i in (0, 1)))

    def _qCurveToOne(self, a, b):
        p = self.current[-1]
        for step in range(1, 17):
            t = step / 16
            self.current.append(tuple((1-t)**2*p[i]+2*(1-t)*t*a[i]+t*t*b[i] for i in (0, 1)))

    def _closePath(self):
        self.contours.append(self.current)
        self.current = []

    _endPath = _closePath


def winding(x, y, contours):
    count = 0
    for polygon in contours:
        for a, b in zip(polygon, polygon[1:] + polygon[:1]):
            cross = (b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1])
            if a[1] <= y < b[1] and cross > 0:
                count += 1
            elif b[1] <= y < a[1] and cross < 0:
                count -= 1
    return count != 0


parser = argparse.ArgumentParser()
parser.add_argument("--text", default="Jake")
parser.add_argument("--output", default="public/models/jake-particle-core.json")
parser.add_argument("--spacing", type=float, default=0.19)
parser.add_argument("--cube-size", type=float, default=0.18)
parser.add_argument("--layers", type=int, default=4)
parser.add_argument("--match-text", help="Use the font scale of this reference text at 8.2 units wide")
args = parser.parse_args()

font = TTFont("app/fonts/Sabo-Filled.otf")
glyphs = font.getGlyphSet()
contours = []
letter_contours = []
offset = 0
for letter in args.text:
    name = font.getBestCmap()[ord(letter)]
    pen = OutlinePen(glyphs)
    glyphs[name].draw(pen)
    shifted = [[(x + offset, y) for x, y in polygon] for polygon in pen.contours]
    contours.extend(shifted)
    letter_contours.append(shifted)
    offset += font["hmtx"][name][0] + 55
points = [p for polygon in contours for p in polygon]
left, right = min(p[0] for p in points), max(p[0] for p in points)
bottom, top = min(p[1] for p in points), max(p[1] for p in points)
width = 8.2
scale = width / (right - left)
if args.match_text:
    reference_points = []
    reference_offset = 0
    for character in args.match_text:
        name = font.getBestCmap()[ord(character)]
        pen = OutlinePen(glyphs)
        glyphs[name].draw(pen)
        reference_points.extend((x + reference_offset, y) for polygon in pen.contours for x, y in polygon)
        reference_offset += font["hmtx"][name][0] + 55
    scale = 8.2 / (max(p[0] for p in reference_points) - min(p[0] for p in reference_points))
    width = (right - left) * scale
spacing = args.spacing
positions = []
scales = []
fragments = []
letter_indices = []
letter_centers = []
for shape in letter_contours:
    points_in_letter = [p for polygon in shape for p in polygon]
    if not points_in_letter:
        letter_centers.extend([0, 0, 0])
        continue
    cx = (min(p[0] for p in points_in_letter)+max(p[0] for p in points_in_letter))/2
    cy = (min(p[1] for p in points_in_letter)+max(p[1] for p in points_in_letter))/2
    letter_centers.extend([round((cx-(left+right)/2)*scale, 4), round((cy-(bottom+top)/2)*scale, 4), 0])
rng = random.Random(47)


def add_particle(x, y, z, size, letter_index, fragment=False):
    positions.extend([round(x, 4), round(y, 4), round(z, 4)])
    scales.append(round(size, 4))
    fragments.append(1 if fragment else 0)
    letter_indices.append(letter_index)


edge_count = 0
for ix in range(math.ceil(width / spacing)):
    x = left + (ix + 0.5) * spacing / scale
    for iy in range(int((top-bottom)*scale/spacing)+1):
        y = bottom + (iy + 0.5) * spacing / scale
        if winding(x, y, contours):
            letter_index = next(index for index, shape in enumerate(letter_contours) if winding(x, y, shape))
            missing = [(dx, dy) for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]
                       if not winding(x + dx*spacing/scale, y + dy*spacing/scale, contours)]
            px, py = (x-(left+right)/2)*scale, (y-(bottom+top)/2)*scale
            for iz in range(args.layers):
                # Uneven faces and overlapping anchor blocks make a connected core.
                size = rng.uniform(0.95, 1.65) if not missing else rng.uniform(0.85, 1.35)
                add_particle(px+rng.uniform(-0.018, 0.018), py+rng.uniform(-0.018, 0.018), (iz-(args.layers-1)/2)*spacing+rng.uniform(-0.045, 0.045), size, letter_index)
            if missing:
                edge_count += 1
                if edge_count % 2 == 0:
                    dx, dy = rng.choice(missing)
                    distance = rng.uniform(0.2, 0.5)
                    add_particle(px+dx*distance+rng.uniform(-0.06, 0.06), py+dy*distance+rng.uniform(-0.06, 0.06), rng.uniform(-0.65, 0.65), rng.uniform(0.3, 0.7), letter_index, True)
letter_radii = [0.0]*len(letter_contours)
for index, letter_index in enumerate(letter_indices):
    radius = math.dist(positions[index*3:index*3+3], letter_centers[letter_index*3:letter_index*3+3])
    letter_radii[letter_index] = max(letter_radii[letter_index], radius)
result = {"version": 3, "text": args.text, "source": "Sabo Filled — Philippe Moesch", "style": "particle-core", "cubeSize": args.cube_size, "positions": positions, "scales": scales, "fragments": fragments, "letterIndices": letter_indices, "letterCenters": letter_centers, "letterRadii": [round(r, 4) if r > 0 else 1 for r in letter_radii]}
target = Path(args.output)
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
print(f"Generated {len(positions)//3} cubes ({sum(fragments)} loose fragments) in {target}")
