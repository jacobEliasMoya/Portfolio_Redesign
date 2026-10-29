"""Generate a faceted Moon from NASA LROC albedo and 16-bit LOLA elevation.
Run from repository root; development-only dependency: Pillow.
"""
import json, math, random
from pathlib import Path
from PIL import Image
SOURCE = Path('docs/references/moon')
color = Image.open(SOURCE/'lroc_color_2k.jpg').convert('RGB')
dem = Image.open(SOURCE/'ldem_4_uint.tif')
RADIUS = .82
EXAGGERATION = 24
RESOLUTION = 44
rng = random.Random(1969)
positions, normals, sizes, colors, elevations = [], [], [], [], []

def direction(face,u,v):
    vector=[(1,v,-u),(-1,v,u),(u,1,-v),(u,-1,v),(u,v,1),(-u,v,-1)][face]
    length=math.sqrt(sum(n*n for n in vector))
    return tuple(n/length for n in vector)

def sample(n):
    u=(math.atan2(n[0],n[2])/(2*math.pi)+.5)%1
    if abs(n[1])>1-1e-10: u=.5
    v=.5-math.asin(max(-1,min(1,n[1])))/math.pi
    elevation=dem.getpixel((int(u*dem.width)%dem.width,min(dem.height-1,max(0,int(v*dem.height)))))*.5-10000
    rgb=color.getpixel((int(u*color.width)%color.width,min(color.height-1,max(0,int(v*color.height)))))
    return elevation,sum(rgb)/3/255

def tile(face,u,v,step,split=True):
    n=direction(face,u,v); elevation,albedo=sample(n)
    neighbors=[sample(direction(face,u+du*step*.4,v+dv*step*.4)) for du,dv in [(-1,-1),(-1,1),(1,-1),(1,1)]]
    heights=[elevation]+[p[0] for p in neighbors]
    # Use one tile level: avoid tiny adaptive patches and retain readable hexagonal faces.
    radial=RADIUS*(1+elevation/1737400*EXAGGERATION)
    width=max(.030,min(.046,min(math.dist(n,direction(face,u+step,v)),math.dist(n,direction(face,u,v+step)))*RADIUS*1.12))
    positions.extend(round(value*radial,6) for value in n)
    normals.extend(round(value,7) for value in n)
    sizes.append(round(width*rng.uniform(.99,1.02),6))
    # Color and geometry are sampled independently; dark basalt isn't a height measurement.
    # Expand the real map's tonal range; surveyed concavities get a restrained AO-like shade.
    brightness=max(0,min(1,(albedo-.43)/.48))**.9
    concavity=max(0,sum(p[0] for p in neighbors)/len(neighbors)-elevation)
    cavity_shade=1-min(.28,concavity/3500)
    tone=(.18+brightness*.66)*cavity_shade*rng.uniform(.985,1.015)
    colors.extend([round(tone,4),round(tone*.995,4),round(tone*.99,4)])
    elevations.append(elevation)

for face in range(6):
    step=2/RESOLUTION
    for y in range(RESOLUTION):
        for x in range(RESOLUTION): tile(face,-1+(x+.5)*step,-1+(y+.5)*step,step)
# A continuous survey-displaced skin fills tile seams while preserving crater depressions.
# It sits just beneath the thin hexagonal caps, rather than a smooth constant-radius ball.
skin_positions,skin_colors,skin_indices=[],[],[]
segments,rings=256,128
for row in range(rings+1):
    latitude=math.pi/2-row/rings*math.pi
    for column in range(segments+1):
        longitude=-math.pi+column/segments*math.pi*2
        n=(math.sin(longitude)*math.cos(latitude),math.sin(latitude),math.cos(longitude)*math.cos(latitude))
        elevation,albedo=sample(n)
        radial=RADIUS*(1+elevation/1737400*EXAGGERATION)-.004
        skin_positions.extend(round(c*radial,6) for c in n)
        brightness=max(0,min(1,(albedo-.43)/.48))**.9
        tone=(.18+brightness*.66)*.92
        skin_colors.extend([round(tone,4),round(tone*.995,4),round(tone*.99,4)])
for row in range(rings):
    for column in range(segments):
        a=row*(segments+1)+column;b=a+segments+1
        skin_indices.extend([a,b,a+1,a+1,b,b+1])
asset={'version':2,'radius':RADIUS,'reliefExaggeration':EXAGGERATION,'positions':positions,'normals':normals,'sizes':sizes,'colors':colors,'elevationsMetres':elevations,'skin':{'positions':skin_positions,'colors':skin_colors,'indices':skin_indices},'source':'NASA SVS CGI Moon Kit: LROC color 2k, LOLA ldem_4_uint (half metres offset by -10000m), centered 0 degrees longitude'}
path=Path('public/models/moon/block-moon.json')
path.write_text(json.dumps(asset,separators=(',',':')),encoding='utf-8')
print(f'Generated {len(sizes):,} fine lunar hexagonal tiles and {len(skin_indices)//3:,} survey-skin triangles; {round(path.stat().st_size/1024):,} KB; survey elevation {min(elevations):.1f} to {max(elevations):.1f} m')
