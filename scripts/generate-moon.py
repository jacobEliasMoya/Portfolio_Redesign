"""Build the approved sculpted, faceted Moon. NASA survey is a subtle underlay,
not a claim that the artist-directed crater bowls are measured topography.
Development-only Pillow dependency; runtime remains static instanced geometry.
"""
import json,math,random
from pathlib import Path
from PIL import Image
SOURCE=Path("docs/references/moon")
color=Image.open(SOURCE/"lroc_color_2k.jpg").convert("RGB")
dem=Image.open(SOURCE/"ldem_4_uint.tif")
RADIUS=.82;EXAGGERATION=12;RESOLUTION=32
TANGENT_SCALE=1.35;DEPTH_SCALE=.45;FOUNDATION=.64
rng=random.Random(1969)
def normalize(p):
 length=math.sqrt(sum(v*v for v in p));return tuple(v/length for v in p)
def direction(face,u,v):return normalize([(1,v,-u),(-1,v,u),(u,1,-v),(u,-1,v),(u,v,1),(-u,v,-1)][face])
def sample(n):
 u=(math.atan2(n[0],n[2])/(2*math.pi)+.5)%1
 if abs(n[1])>1-1e-10:u=.5
 v=.5-math.asin(max(-1,min(1,n[1])))/math.pi
 x=u*dem.width-.5;y=v*(dem.height-1);left=math.floor(x);top=math.floor(y);fx=x-left;fy=y-top
 def height(px,py):return dem.getpixel((px%dem.width,min(dem.height-1,max(0,py))))*.5-10000
 elevation=(height(left,top)*(1-fx)+height(left+1,top)*fx)*(1-fy)+(height(left,top+1)*(1-fx)+height(left+1,top+1)*fx)*fy
 rgb=color.getpixel((int(u*color.width)%color.width,min(color.height-1,max(0,int(v*color.height)))))
 return elevation,sum(rgb)/3/255
# Front, rear and limb groups. Their placement/depth are artistic choices from the concept.
CRATERS=[
 ((.40,.18,.90),.265,.105,.014),((-.46,.28,.87),.205,.078,.012),((-.27,-.40,.88),.225,.085,.012),((.31,-.50,.80),.155,.058,.009),((.02,.58,.81),.105,.040,.007),((-.66,-.12,.73),.095,.032,.006),
 ((-.38,.24,-.89),.255,.100,.014),((.43,-.20,-.88),.230,.088,.013),((-.20,-.53,-.82),.175,.064,.010),((.32,.56,-.76),.135,.050,.008),((-.60,-.19,-.78),.100,.035,.006),
 ((.97,.04,.24),.215,.079,.012),((.89,-.43,-.12),.125,.045,.008),((-.96,.10,-.27),.230,.090,.013),((-.83,-.48,.24),.140,.052,.009),((.66,.57,.48),.075,.027,.005),((-.31,.61,-.73),.080,.029,.005)]
CRATERS=[(normalize(n),radius,depth,rim) for n,radius,depth,rim in CRATERS]
def smooth(a,b,value):
 t=max(0,min(1,(value-a)/(b-a)));return t*t*(3-2*t)
def relief(n):
 depression=0;rim=0;weight=0
 for center,radius,depth,lip in CRATERS:
  dot=max(-1,min(1,sum(a*b for a,b in zip(n,center))))
  if dot<math.cos(radius*1.4):continue
  q=math.acos(dot)/radius
  bowl=depth*(1-smooth(.18,1,q)) if q<1 else 0
  depression=max(depression,bowl);weight=max(weight,bowl/depth)
  rim=max(rim,lip*math.exp(-((q-1.04)/.14)**2))
 # Keep the landing pad's polar support surface undisturbed.
 polar=1-smooth(.78,.92,n[1])
 return (-depression+rim)*polar,weight*polar
def surface(n):
 elevation,_=sample(n);offset,_=relief(n)
 return RADIUS*(1+elevation/1737400*EXAGGERATION)+offset

def surface_normal(n):
 helper=(0,1,0) if abs(n[1])<.9 else (1,0,0)
 tangent=normalize((n[1]*helper[2]-n[2]*helper[1],n[2]*helper[0]-n[0]*helper[2],n[0]*helper[1]-n[1]*helper[0]))
 other=(n[1]*tangent[2]-n[2]*tangent[1],n[2]*tangent[0]-n[0]*tangent[2],n[0]*tangent[1]-n[1]*tangent[0]);eps=.006
 gradients=[]
 for axis in (tangent,other):
  plus=normalize(tuple(n[i]+axis[i]*eps for i in range(3)));minus=normalize(tuple(n[i]-axis[i]*eps for i in range(3)))
  gradients.append((surface(plus)-surface(minus))/(2*eps*RADIUS))
 return normalize(tuple(n[i]-tangent[i]*gradients[0]-other[i]*gradients[1] for i in range(3)))
def palette(n,variation=1):
 _,albedo=sample(n);_,depth=relief(n)
 # Keep LROC's connected maria/highland patterns, with a broader mineral-gray range.
 brightness=smooth(.50,.82,albedo)**.9
 value=(.25+.56*brightness)*variation*(1-.22*depth)
 return [round(value*(.91+.11*brightness),4),round(value*(.965+.035*brightness),4),round(value*(1.055-.09*brightness),4)]
# Dual of a subdivided icosahedron: shared polygon boundaries, no overlapping shingles.
phi=(1+math.sqrt(5))/2
ico=[(-1,phi,0),(1,phi,0),(-1,-phi,0),(1,-phi,0),(0,-1,phi),(0,1,phi),(0,-1,-phi),(0,1,-phi),(phi,0,-1),(phi,0,1),(-phi,0,-1),(-phi,0,1)]
ico=[normalize(p) for p in ico]
faces=[(0,11,5),(0,5,1),(0,1,7),(0,7,10),(0,10,11),(1,5,9),(5,11,4),(11,10,2),(10,7,6),(7,1,8),(3,9,4),(3,4,2),(3,2,6),(3,6,8),(3,8,9),(4,9,5),(2,4,11),(6,2,10),(8,6,7),(9,8,1)]
points=[];lookup={};triangles=[];frequency=18;layout_rng=random.Random(1971)
for face in faces:
 a,b,c=[ico[i] for i in face];grid={}
 for i in range(frequency+1):
  for j in range(frequency+1-i):
   n=normalize(tuple((a[k]*(frequency-i-j)+b[k]*i+c[k]*j)/frequency for k in range(3)));key=tuple(round(v,8) for v in n)
   if key not in lookup:
    lookup[key]=len(points);points.append(normalize(tuple(n[axis]+layout_rng.uniform(-.009,.009) for axis in range(3))))
   grid[i,j]=lookup[key]
 for i in range(frequency):
  for j in range(frequency-i):
   triangles.append((grid[i,j],grid[i+1,j],grid[i,j+1]))
   if i+j<frequency-1:triangles.append((grid[i+1,j],grid[i+1,j+1],grid[i,j+1]))
neighbors=[[] for _ in points]
for tri in triangles:
 center=normalize(tuple(sum(points[v][axis] for v in tri)/3 for axis in range(3)))
 for v in tri:neighbors[v].append(center)
positions,normals,sizes,colors,elevations,offsets,corners,corner_counts,lifts=[],[],[],[],[],[],[],[],[]
for n,ring in zip(points,neighbors):
 normal=surface_normal(n);helper=(0,1,0) if abs(n[1])<.9 else (1,0,0)
 tangent=normalize((n[1]*helper[2]-n[2]*helper[1],n[2]*helper[0]-n[0]*helper[2],n[0]*helper[1]-n[1]*helper[0]));other=(n[1]*tangent[2]-n[2]*tangent[1],n[2]*tangent[0]-n[0]*tangent[2],n[0]*tangent[1]-n[1]*tangent[0])
 ring.sort(key=lambda p:math.atan2(sum(p[i]*other[i] for i in range(3)),sum(p[i]*tangent[i] for i in range(3))),reverse=True)
 lift=rng.uniform(.001,.0065);lifts.append(round(lift,7));radial=surface(n)+lift;position=tuple(v*radial for v in n);positions.extend(round(c,6) for c in position);normals.extend(round(c,7) for c in normal)
 # Size is a conservative collision/debris envelope; polygon corners drive the actual cap.
 width=max(math.dist(n,p)*RADIUS for p in ring)*2/TANGENT_SCALE;sizes.append(round(width,6));corner_counts.append(len(ring))
 world=[]
 for point in ring:
  r=surface(point);world.append(tuple(point[i]*r*.975+(position[i]-n[i]*lift)*.025+n[i]*lift for i in range(3)))
 # Shade each actual polygon as a facet, not a noisy point-sampled gradient.
 accumulated=[0,0,0]
 for i in range(len(world)):
  a=tuple(world[i][axis]-position[axis] for axis in range(3));b=tuple(world[(i+1)%len(world)][axis]-position[axis] for axis in range(3))
  cross=(b[1]*a[2]-b[2]*a[1],b[2]*a[0]-b[0]*a[2],b[0]*a[1]-b[1]*a[0])
  for axis in range(3):accumulated[axis]+=cross[axis]
 normal=normalize(accumulated);normals[-3:]=[round(c,7) for c in normal]
 while len(world)<6:world.append(world[-1])
 corners.extend(round(v,7) for p in world for v in p)
 elevation,_=sample(n);elevations.append(elevation);offsets.append(round(relief(n)[0],7));colors.extend(palette(n,rng.uniform(.94,1.06)))
skin_positions,skin_colors,skin_indices=[],[],[]
segments,rings=128,64
for row in range(rings+1):
 latitude=math.pi/2-row/rings*math.pi
 for column in range(segments+1):
  longitude=-math.pi+column/segments*math.pi*2;n=(math.sin(longitude)*math.cos(latitude),math.sin(latitude),math.cos(longitude)*math.cos(latitude));radial=surface(n)-.004
  skin_positions.extend(round(c*radial,6) for c in n);skin_colors.extend(palette(n))
for row in range(rings):
 for column in range(segments):
  a=row*(segments+1)+column;b=a+segments+1;skin_indices.extend([a,b,a+1,a+1,b,b+1])
asset={"version":3,"style":"sculpted-craters","radius":RADIUS,"foundation":FOUNDATION,"reliefExaggeration":EXAGGERATION,"tileTangentScale":TANGENT_SCALE,"tileDepthScale":DEPTH_SCALE,"facetCorners":corners,"facetCornerCounts":corner_counts,"positions":positions,"normals":normals,"sizes":sizes,"colors":colors,"elevationsMetres":elevations,"artisticOffsets":offsets,"facetLifts":lifts,"craters":[{"direction":n,"angularRadius":radius,"depth":depth,"rim":rim} for n,radius,depth,rim in CRATERS],"skin":{"positions":skin_positions,"colors":skin_colors,"indices":skin_indices},"source":"Stylized crater sculpture from approved generated concept, with NASA SVS CGI Moon Kit LROC/LOLA underlay. Crater placement/depth are artistic, not surveyed measurements."}
path=Path("public/models/moon/block-moon.json");path.write_text(json.dumps(asset,separators=(",",":")),encoding="utf-8")
print(f"Generated {len(sizes):,} sculpted facets, {len(CRATERS)} crater bowls and {len(skin_indices)//3:,} sealed-skin triangles; {round(path.stat().st_size/1024):,}KB")
