"""Offline public-domain airport snapshot and conservative relief profiles; no runtime feed."""
import csv,hashlib,json,math,sys
from pathlib import Path
source=Path(sys.argv[1]);root=Path(__file__).resolve().parent.parent
rows=list(csv.DictReader(source.open(encoding='utf-8-sig')))
def direction(lat,lon):
 a,b=math.radians(lat),math.radians(lon)
 return (math.cos(a)*math.sin(b),math.sin(a),math.cos(a)*math.cos(b))
airports=[]
for row in rows:
 if row['type']!='large_airport' or row['scheduled_service']!='yes':continue
 lat,lon=float(row['latitude_deg']),float(row['longitude_deg'])
 if not (-90<=lat<=90 and -180<=lon<=180):continue
 airports.append(dict(id=row['ident'],code=row['iata_code'] or row['ident'],name=row['name'],lat=lat,lon=lon,continent=row['continent'],country=row['iso_country']))
airports.sort(key=lambda a:a['id']);vectors=[direction(a['lat'],a['lon']) for a in airports]
# One connected tour visits every selected airport; choose short neighboring legs where possible.
remaining=set(range(len(airports)));current=next(i for i,a in enumerate(airports) if a['code']=='SFO');order=[]
while remaining:
 remaining.remove(current);order.append(current)
 if remaining:
  x,y,z=vectors[current];current=max(sorted(remaining),key=lambda i:x*vectors[i][0]+y*vectors[i][1]+z*vectors[i][2])
ordered=[airports[i] for i in order];vectors=[vectors[i] for i in order]
earth=json.loads((root/'public/models/earth/block-earth.json').read_text());grid={}
def cell(v):return tuple(math.floor(c/.1) for c in v)
for i,size in enumerate(earth['sizes']):
 p=earth['positions'][i*3:i*3+3];length=math.sqrt(sum(c*c for c in p));n=tuple(c/length for c in p)
 grid.setdefault(cell(n),[]).append((*n,length+size*1.5))
def height(v):
 x,y,z=cell(v);highest=2.98
 for dx in (-1,0,1):
  for dy in (-1,0,1):
   for dz in (-1,0,1):
    for a,b,c,r in grid.get((x+dx,y+dy,z+dz),()):
     if a*v[0]+b*v[1]+c*v[2]>.997:highest=max(highest,r)
 return round(highest,5)
profiles=[]
for i,start in enumerate(vectors):
 end=vectors[(i+1)%len(vectors)];dot=max(-1,min(1,sum(a*b for a,b in zip(start,end))));angle=math.acos(dot);s=math.sin(angle)
 samples=[]
 for j in range(33):
  t=j/32
  if abs(s)<1e-8:v=start
  else:v=tuple(a*math.sin((1-t)*angle)/s+b*math.sin(t*angle)/s for a,b in zip(start,end))
  samples.append(height(v))
 profiles.append(samples)
payload=dict(source='https://ourairports.com/data/',snapshot='2026-10-31',sha256=hashlib.sha256(source.read_bytes()).hexdigest(),selection='type=large_airport and scheduled_service=yes',airports=ordered,clearance=profiles)
output=root/'components/three/air-traffic/major-airports.json';output.write_text(json.dumps(payload,separators=(',',':'),ensure_ascii=False),encoding='utf-8')
print(f'{len(ordered)} airports, {len(set(a["country"] for a in ordered))} countries, {len(set(a["continent"] for a in ordered))} continents; {output.stat().st_size} bytes')
