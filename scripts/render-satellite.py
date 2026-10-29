"""Render exact exported Three.js asset for offline geometry review, never browser capture."""
import bpy
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

args=sys.argv[sys.argv.index("--")+1:]
variant=args[2] if len(args)>2 else "satellite"
asset=json.loads(Path(args[0]).read_text(encoding="utf-8"))
output=Path(args[1])
if not output.is_absolute():output=Path(__file__).resolve().parent.parent/output
output.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action="SELECT");bpy.ops.object.delete(use_global=False)

def coord(p):return (p[0],-p[2],p[1])

images=[]
for i,item in enumerate(asset["textures"]):
    image=bpy.data.images.new("asset-texture-"+str(i),width=item["width"],height=item["height"],alpha=True)
    channels=item["channels"];pixels=[];data=item["data"]
    for j in range(0,len(data),channels):
        values=[v/255 for v in data[j:j+channels]]
        pixels.extend(values[:3] if channels>=3 else [values[0]]*3)
        pixels.append(values[3] if channels==4 else 1.)
    if item.get("flipY"):
        stride=item["width"]*4;pixels=[v for y in reversed(range(item["height"])) for v in pixels[y*stride:(y+1)*stride]]
    image.pixels.foreach_set(pixels);image.update();images.append(image)

materials=[]
for item in asset["materials"]:
    m=bpy.data.materials.new(item["name"]);m.use_nodes=True
    nodes=m.node_tree.nodes;links=m.node_tree.links;shader=nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value=(*item["color"],1)
    shader.inputs["Metallic"].default_value=item["metalness"]
    shader.inputs["Roughness"].default_value=item["roughness"]
    shader.inputs["Emission Color"].default_value=(*item["emissive"],1)
    shader.inputs["Emission Strength"].default_value=item["emissiveIntensity"]
    if item["map"] is not None:
        t=nodes.new("ShaderNodeTexImage");t.image=images[item["map"]];t.interpolation="Closest"
        links.new(t.outputs["Color"],shader.inputs["Base Color"])
        if item["basic"] or item["emissiveIntensity"]>0:
            links.new(t.outputs["Color"],shader.inputs["Emission Color"])
            shader.inputs["Emission Strength"].default_value=.65 if item["basic"] else item["emissiveIntensity"]
    elif item["basic"]:
        shader.inputs["Emission Color"].default_value=(*item["color"],1)
        shader.inputs["Emission Strength"].default_value=.65
    if item["roughnessMap"] is not None:
        t=nodes.new("ShaderNodeTexImage");t.image=images[item["roughnessMap"]]
        links.new(t.outputs["Color"],shader.inputs["Roughness"])
    color_node=nodes.new("ShaderNodeVertexColor");color_node.layer_name="instance-tint"
    multiply=nodes.new("ShaderNodeMixRGB");multiply.blend_type="MULTIPLY";multiply.inputs[0].default_value=1
    base_links=list(shader.inputs["Base Color"].links)
    if base_links:links.new(base_links[0].from_socket,multiply.inputs[1])
    else:multiply.inputs[1].default_value=(*item["color"],1)
    links.new(color_node.outputs["Color"],multiply.inputs[2]);links.new(multiply.outputs[0],shader.inputs["Base Color"])
    materials.append(m)

for item in asset["meshes"]:
    vertices=[coord(p) for p in item["positions"]]
    faces=[(i,i+1,i+2) for i in range(0,len(vertices),3)]
    mesh=bpy.data.meshes.new(item["name"]);mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(item["name"],mesh);bpy.context.collection.objects.link(obj)
    for slot in item["materials"]:mesh.materials.append(materials[slot])
    for poly,index in zip(mesh.polygons,item["triangleMaterials"]):poly.material_index=index
    uv=mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:uv.data[loop.index].uv=item["uvs"][loop.vertex_index]
    tint=mesh.color_attributes.new(name="instance-tint",type="FLOAT_COLOR",domain="CORNER")
    colors=item.get("colors")
    if colors is None:colors=[[1,1,1]]*len(vertices)
    for loop in mesh.loops:tint.data[loop.index].color=(*colors[loop.vertex_index],1)
    if item["normals"]:
        for poly in mesh.polygons:poly.use_smooth=True
        mesh.normals_split_custom_set([coord(item["normals"][loop.vertex_index]) for loop in mesh.loops])

def area(name,location,power,size,color,target=(0,0,.3),shape="DISK",size_y=None):
    data=bpy.data.lights.new(name,"AREA");data.energy=power;data.shape=shape;data.size=size;data.color=color
    if size_y is not None:data.size_y=size_y
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.location=coord(location)
    obj.rotation_euler=(Vector(coord(target))-obj.location).to_track_quat("-Z","Y").to_euler()

area("large warm key",(-3,5,5),850,5,(1,.94,.82))
area("cool fill",(5,1,3),650,4,(.72,.86,1))
area("rear edge",(0,3,-5),1100,3,(.8,.9,1))
area("screen reflection",(-1,3,6),150,3,(1,1,1),shape="RECTANGLE",size_y=.5)

scene=bpy.context.scene
try:
    scene.render.engine="BLENDER_EEVEE_NEXT"
except TypeError:
    # Blender 5 renamed the Eevee identifier; retain Blender 4 compatibility.
    scene.render.engine="BLENDER_EEVEE"
scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.world.color=(.025,.025,.025)
scene.world.use_nodes=True;scene.world.node_tree.nodes["Background"].inputs["Color"].default_value=(0,0,0,1)
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.15
scene.render.film_transparent=False
scene.view_settings.view_transform="AgX"
scene.view_settings.look="AgX - Medium High Contrast"
camera_data=bpy.data.cameras.new("asset-review-camera");camera_data.type="ORTHO";camera_data.ortho_scale=7.1
camera=bpy.data.objects.new("asset-review-camera",camera_data);bpy.context.collection.objects.link(camera);scene.camera=camera
views=[("satellite-model-front",(4.5,2.8,8)),("satellite-model-rear",(-4,2.6,-8)),("satellite-model-front-ortho",(0,.25,9)),("satellite-model-side",(9,.25,0))]
if variant in ("ufo","ufo-v3"):
    camera_data.ortho_scale=5.9
    area("underside fill",(1,-4,3),500,4,(.8,.9,1))
    views=[("ufo-reference-three-quarter",(4.5,3.2,8)),("ufo-reference-front",(0,1.2,9)),("ufo-reference-rear",(0,1.2,-9)),("ufo-reference-side",(9,.25,0)),("ufo-reference-top",(.001,9,0)),("ufo-reference-underside",(.001,-9,.001))]
if variant in ("black-hole","black-hole-v2"):
    camera_data.ortho_scale=11.8
    views=[("black-hole-three-quarter",(6,4.5,11)),("black-hole-side",(12,1.6,0)),("black-hole-top",(.001,13,.001))]
    bpy.data.lights["large warm key"].color=(.86,.91,1)
    bpy.data.lights["rear edge"].color=(1,.53,.17)
for name,location in views:
    if variant in ("black-hole","black-hole-v2"):camera_data.ortho_scale=12.8 if name.endswith("top") else 11.8
    if variant=="ufo-v3":name=name.replace("ufo-reference","ufo-v3")
    if variant in ("ufo","ufo-v3"):camera_data.ortho_scale=7.2 if name.endswith(("top","underside")) else 5.9
    if variant=="black-hole-v2":
        camera_data.ortho_scale=18.5 if name.endswith("top") else 16.5
        name=name.replace("black-hole-","black-hole-v2-")
    camera.location=coord(location);camera.rotation_euler=(Vector(coord((0,.25,0)))-camera.location).to_track_quat("-Z","Y").to_euler()
    scene.render.filepath=str(output/(name+".png"));bpy.ops.render.render(write_still=True)
print("Offline exact-asset renders saved to",output)
