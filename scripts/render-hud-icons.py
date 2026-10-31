"""Offline icon renders of canonical runtime geometry; no generative redesign."""
import bpy, json, sys, math
from pathlib import Path
from array import array
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:]
asset=json.loads(Path(args[0]).read_text(encoding="utf-8"));output=Path(args[1])
bpy.ops.object.select_all(action="SELECT");bpy.ops.object.delete(use_global=False)
def coord(p):return (p[0],-p[2],p[1])
def material(name,color,rough=.8,metal=0,emission=(0,0,0),strength=0,tinted=False):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;s=n.get("Principled BSDF")
 s.inputs["Base Color"].default_value=(*color,1);s.inputs["Roughness"].default_value=rough;s.inputs["Metallic"].default_value=metal;s.inputs["Emission Color"].default_value=(*emission,1);s.inputs["Emission Strength"].default_value=strength
 if tinted:
  c=n.new("ShaderNodeVertexColor");c.layer_name="tint";m.node_tree.links.new(c.outputs["Color"],s.inputs["Base Color"])
 return m
materials=[material(x["name"],x["color"],x["roughness"],x["metalness"],x["emissive"],x["emissiveIntensity"]) for x in asset["materials"]]
def mesh_object(name,coords,indices,colors=None):
 mesh=bpy.data.meshes.new(name);mesh.vertices.add(len(coords)//3);mesh.vertices.foreach_set("co",coords)
 mesh.loops.add(len(indices));mesh.loops.foreach_set("vertex_index",indices);mesh.polygons.add(len(indices)//3);mesh.polygons.foreach_set("loop_start",array("i",range(0,len(indices),3)));mesh.polygons.foreach_set("loop_total",array("i",[3])*(len(indices)//3));mesh.update()
 if colors is not None:mesh.color_attributes.new(name="tint",type="FLOAT_COLOR",domain="POINT").data.foreach_set("color",colors)
 obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);return obj
for item in asset["meshes"]:
 co=array("f",(v for p in item["positions"] for v in coord(p)));obj=mesh_object(item["name"],co,array("i",range(len(co)//3)))
 for index in item["materials"]:obj.data.materials.append(materials[index])
 obj.data.polygons.foreach_set("material_index",array("i",item["triangleMaterials"]))
 if item["normals"]:
  for face in obj.data.polygons:face.use_smooth=True
  obj.data.normals_split_custom_set_from_vertices([coord(n) for n in item["normals"]])
if "instances" in asset:
 tile=asset["instances"];vertices=list(zip(*[iter(tile["positions"])]*3));coords=array("f");indices=array("i");colors=array("f");unit_indices=tile["indices"];facet_normals=[]
 matrices=tile["matrices"];view=Vector(asset["view"]).normalized()
 for index in range(len(matrices)//16):
  m=matrices[index*16:index*16+16]
  # Back-facing tiles cannot contribute to this fixed orthographic thumbnail.
  if Vector((m[12],m[13],m[14])).normalized().dot(view)<-.2:continue
  offset=len(coords)//3;r,g,b=tile["colors"][index*3:index*3+3]
  if tile.get("facetCorners"):
   top=[(m[12],m[13],m[14])]+list(zip(*[iter(tile["facetCorners"][index*18:index*18+18])]*3))
   # Bottom follows the same instance's local -Y offset as the runtime shader.
   points=top+[(p[0]-m[4],p[1]-m[5],p[2]-m[6]) for p in top]
   for p in points:coords.extend(coord(p));colors.extend((r,g,b,1))
   for side in range(6):
    a=side+1;b=(side+1)%6+1
    triangles=[(0,b,a),(a,b,a+7),(b,b+7,a+7)]
    cap_normal=Vector(coord((m[4],m[5],m[6]))).normalized()
    for face_number,triangle in enumerate(triangles):
     indices.extend(offset+v for v in triangle)
     if face_number==0:normal=cap_normal
     else:
      pa,pb,pc=[Vector(coord(points[v])) for v in triangle];normal=(pb-pa).cross(pc-pa).normalized()
     facet_normals.extend([tuple(normal)]*3)
  else:
   for x,y,z in vertices:
    coords.extend((m[0]*x+m[4]*y+m[8]*z+m[12],-(m[2]*x+m[6]*y+m[10]*z+m[14]),m[1]*x+m[5]*y+m[9]*z+m[13]));colors.extend((r,g,b,1))
   indices.extend(v+offset for v in unit_indices)
 obj=mesh_object("canonical-survey-tiles",coords,indices,colors);obj.data.materials.append(material("survey",(1,1,1),.9,.08,tinted=True))
 if facet_normals:
  for face in obj.data.polygons:face.use_smooth=True
  obj.data.normals_split_custom_set(facet_normals)
 del coords,indices,colors
 if asset.get("skin"):
  skin=asset["skin"];co=array("f",(v for p in zip(*[iter(skin["positions"])]*3) for v in coord(p)));colors=array("f",(v for rgb in zip(*[iter(skin["colors"])]*3) for v in (*rgb,1)))
  obj=mesh_object("canonical-lunar-skin",co,array("i",skin["indices"]),colors);obj.data.materials.append(material("lunar-skin",(1,1,1),.95,0,tinted=True))
 if asset["core"]>0:
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3,radius=asset["core"]);bpy.context.object.data.materials.append(material("interior",(.025,.04,.06),1))
scene=bpy.context.scene
try:scene.render.engine="BLENDER_EEVEE_NEXT"
except TypeError:scene.render.engine="BLENDER_EEVEE"
scene.render.resolution_x=asset["width"];scene.render.resolution_y=asset["height"];scene.render.resolution_percentage=100;scene.render.image_settings.file_format="PNG";scene.render.image_settings.color_mode="RGBA";scene.render.film_transparent=True
scene.world.color=(.06,.06,.06);scene.world.use_nodes=True;scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.35
scene.view_settings.view_transform="AgX";scene.view_settings.look="AgX - Medium High Contrast"
def area(name,location,power,size,color):
 data=bpy.data.lights.new(name,"AREA");data.energy=power;data.shape="DISK";data.size=size;data.color=color;obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.location=coord(location);obj.rotation_euler=(-obj.location).to_track_quat("-Z","Y").to_euler()
area("key",(-3,5,6),1050,5,(1,.97,.89));area("fill",(4,2,4),700,4,(.77,.9,1));area("rim",(0,4,-5),1000,4,(.82,.94,1))
bpy.context.view_layer.update();objects=[o for o in scene.objects if o.type=="MESH"];corners=[o.matrix_world@Vector(p) for o in objects for p in o.bound_box]
low=Vector(tuple(min(v[i] for v in corners) for i in range(3)));high=Vector(tuple(max(v[i] for v in corners) for i in range(3)));target=(low+high)*.5
if "frame" in asset:target=Vector(coord(asset["frame"]["center"]))
camera_data=bpy.data.cameras.new("hud-camera");camera_data.type="ORTHO";camera=bpy.data.objects.new("hud-camera",camera_data);bpy.context.collection.objects.link(camera);camera.location=target+Vector(coord(asset["view"])).normalized()*20;camera.rotation_euler=(target-camera.location).to_track_quat("-Z","Y").to_euler();scene.camera=camera
inverse=camera.rotation_euler.to_matrix().transposed();points=[inverse@(p-target) for p in corners];width=max(p.x for p in points)-min(p.x for p in points);height=max(p.y for p in points)-min(p.y for p in points);camera_data.ortho_scale=max(width,height*(asset["width"]/asset["height"]))*1.12
if "frame" in asset:camera_data.ortho_scale=asset["frame"]["span"]
if asset.get("perspective"):
 p=asset["perspective"];camera_data.type="PERSP";camera_data.sensor_fit="VERTICAL";camera_data.sensor_height=32
 camera_data.lens=32/(2*math.tan(math.radians(p["fov"])/2));camera_data.clip_start=p["near"];camera_data.clip_end=p["far"]
 camera.location=coord(p["position"]);camera.rotation_euler=Vector(coord((0,0,-1))).to_track_quat("-Z","Y").to_euler()
 # Runtime Guide uses directional lights; illuminate passing blocks uniformly
 # instead of letting Blender's board-local area lights fall off near the eye.
 data=bpy.data.lights.new("guide-flight-key","SUN");data.energy=1.2;data.angle=.3
 light=bpy.data.objects.new("guide-flight-key",data);bpy.context.collection.objects.link(light)
 light.rotation_euler=Vector(coord((200,-300,-400))).to_track_quat("-Z","Y").to_euler()
if "instances" in asset:
 tile=asset["instances"]
 if tile.get("facetCorners"):radius=max(Vector(p).length for p in zip(*[iter(tile["facetCorners"])]*3))
 else:radius=max(Vector(tile["matrices"][i+12:i+15]).length for i in range(0,len(tile["matrices"]),16))+.03
 camera_data.ortho_scale=radius*2*1.12
scene.render.filepath=str(output);bpy.ops.render.render(write_still=True);print("Saved exact runtime-model icon",output)
