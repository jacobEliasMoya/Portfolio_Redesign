"""Build instanced Earth columns from NASA Blue Marble color/elevation rasters.
Requires Pillow only at generation time. Run from repository root.
"""
import json, math, random
from pathlib import Path
from PIL import Image

ROOT = Path('public/models/earth')
color = Image.open(ROOT/'color.png').convert('RGB')
elevation = Image.open(ROOT/'elevation.png').convert('L')
rng = random.Random(73)
RADIUS = 3
RESOLUTION = 28
positions, normals, sizes, colors, heights, ocean_mask = [], [], [], [], [], []

def direction(face,u,v):
    a = [(1,v,-u),(-1,v,u),(u,1,-v),(u,-1,v),(u,v,1),(-u,v,-1)][face]
    length=math.sqrt(sum(x*x for x in a))
    return tuple(x/length for x in a)

def sample(n):
    longitude=math.atan2(n[0],n[2])
    latitude=math.asin(max(-1,min(1,n[1])))
    x=int((longitude/(2*math.pi)+0.5)*color.width)%color.width
    y=min(color.height-1,max(0,int((0.5-latitude/math.pi)*color.height)))
    rgb=color.getpixel((x,y)); h=elevation.getpixel((x,y))/255
    ocean=rgb[2]>rgb[0]*1.18 and rgb[2]>rgb[1]*1.08
    land=not ocean
    return rgb,h,land,latitude

def tile(face,u,v,step,split=True):
    n=direction(face,u,v); rgb,h,land,lat=sample(n)
    # Resolve land/coasts more finely, with larger uninterrupted ocean tiles.
    corners=[sample(direction(face,u+du*step*.4,v+dv*step*.4))[2] for du,dv in [(-1,-1),(-1,1),(1,-1),(1,1)]]
    if split and (land or any(corners) or rng.random()<.12):
        for du,dv in [(-1,-1),(-1,1),(1,-1),(1,1)]: tile(face,u+du*step/4,v+dv*step/4,step/2,False)
        return
    nx=direction(face,u+step,v); ny=direction(face,u,v+step)
    width=min(math.dist(n,nx),math.dist(n,ny))*RADIUS*1.14
    relief=(.045+round((h**.72)*.48/.035)*.035) if land else rng.uniform(-.018,.018)
    snow=land and ((min(rgb)>155 and max(rgb)-min(rgb)<65) or h>.65 or lat<math.radians(-68))
    if snow: palette=(.86,.92,.97)
    elif not land: palette=(.025,.19,.48) if rng.random()<.7 else (.035,.27,.64)
    elif h>.4: palette=(.47,.39,.27)
    elif rgb[0]>rgb[1]*1.08: palette=(.68,.56,.32)
    elif rgb[1]>rgb[0]*1.04: palette=(.23,.43,.1)
    else: palette=(.39,.49,.17)
    variation=rng.uniform(.86,1.12)
    tint=[round(min(1,c*variation),4) for c in palette]
    # Overlapping real cubes fill the relief column down to the globe shell.
    layers=max(1,math.ceil(max(0,relief)/(width*.72)))
    for layer in range(layers):
        distance=RADIUS+relief-layer*width*.72-width*.25
        positions.extend(round(c*distance,5) for c in n)
        normals.extend(round(c,6) for c in n)
        sizes.append(round(width*rng.uniform(.97,1.07),5))
        colors.extend(tint)
        heights.append(round(h if land else 0,4))
        ocean_mask.append(0 if land else 1)

for face in range(6):
    step=2/RESOLUTION
    for y in range(RESOLUTION):
        for x in range(RESOLUTION): tile(face,-1+(x+.5)*step,-1+(y+.5)*step,step)
asset={'version':1,'radius':RADIUS,'positions':positions,'normals':normals,'sizes':sizes,'colors':colors,'elevations':heights,'oceanMask':ocean_mask,'source':'NASA Blue Marble July 2004 and GEBCO topography, 0-6400m scaled raster; stylized exaggerated relief'}
(ROOT/'block-earth.json').write_text(json.dumps(asset,separators=(',',':')),encoding='utf-8')
print(f'Generated {len(sizes):,} cube instances; {round((ROOT/"block-earth.json").stat().st_size/1024):,} KB')
