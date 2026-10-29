/** Offline asset QA only. Serializes the same mesh factory used by React to Blender. */
import {mkdir,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
import {createArchiveSatellite} from "../components/three/satellite/create-archive-satellite.mjs";
import {Matrix3,Matrix4,Vector3} from "three";

const output=resolve(process.argv[2]??"docs/references/satellite");
const folder=join(tmpdir(),"portfolio-satellite-qa");await mkdir(folder,{recursive:true});await mkdir(output,{recursive:true});
const created=createArchiveSatellite(),root=created.isObject3D?created:created.group??created.model;
if(!root)throw new Error("Satellite factory must return a Three Object3D or {group/model}.");
root.updateMatrixWorld(true);
const materials=[],materialIds=new Map(),textures=[],textureIds=new Map(),meshes=[];
function textureId(texture){
 if(!texture?.image?.data)return null;
 if(textureIds.has(texture))return textureIds.get(texture);
 const id=textures.length;textureIds.set(texture,id);
 textures.push({width:texture.image.width,height:texture.image.height,data:Array.from(texture.image.data),channels:texture.image.data.length/(texture.image.width*texture.image.height),colorSpace:texture.colorSpace,flipY:texture.flipY});return id;
}
function materialId(material){
 if(materialIds.has(material))return materialIds.get(material);
 const id=materials.length;materialIds.set(material,id);
 materials.push({name:material.name??`material-${id}`,color:material.color?.toArray()??[1,1,1],roughness:material.roughness??.8,metalness:material.metalness??0,emissive:material.emissive?.toArray()??[0,0,0],emissiveIntensity:material.emissiveIntensity??0,opacity:material.opacity??1,basic:material.type==="MeshBasicMaterial",map:textureId(material.map),roughnessMap:textureId(material.roughnessMap)});return id;
}
function serializeMesh(object,world,name){
 const source=object.geometry,g=source.index?source.toNonIndexed():source.clone(),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,normalMatrix=new Matrix3().getNormalMatrix(world),v=new Vector3();
 const positions=[],normals=[],uvs=[];
 for(let i=0;i<p.count;i++){
  v.fromBufferAttribute(p,i).applyMatrix4(world);positions.push(v.toArray());
  if(n){v.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);normals.push(v.toArray());}
  uvs.push(uv?[uv.getX(i),uv.getY(i)]:[0,0]);
 }
 const objectMaterials=Array.isArray(object.material)?object.material:[object.material],slots=objectMaterials.map(materialId),triangleMaterials=[];
 for(let i=0;i<p.count;i+=3){const group=g.groups.find(item=>i>=item.start&&i<item.start+item.count);triangleMaterials.push(group?.materialIndex??0);}
 meshes.push({name,positions,normals,uvs,materials:slots,triangleMaterials});g.dispose();
}
root.traverse(object=>{
 if(!object.isMesh||!object.visible)return;
 if(object.isInstancedMesh){const instance=new Matrix4(),world=new Matrix4();for(let i=0;i<object.count;i++){object.getMatrixAt(i,instance);world.multiplyMatrices(object.matrixWorld,instance);serializeMesh(object,world,`${object.name}-${i}`);}}
 else serializeMesh(object,object.matrixWorld,object.name||`mesh-${meshes.length}`);
});
const asset=join(folder,"satellite-asset.json");await writeFile(asset,JSON.stringify({materials,textures,meshes}));
console.log(`Exported exact satellite factory: ${meshes.length} meshes, ${materials.length} materials, ${textures.length} textures.`);
const executable=process.env.BLENDER_EXECUTABLE??"C:/Program Files/Blender Foundation/Blender 4.4/blender.exe";
const result=spawnSync(executable,["--background","--factory-startup","--python",resolve("scripts/render-satellite.py"),"--",asset,output],{stdio:"inherit",windowsHide:true});
if(result.error)throw result.error;process.exitCode=result.status??1;
