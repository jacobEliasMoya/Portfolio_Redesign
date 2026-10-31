import {Color,Matrix3,Matrix4,Vector3} from "three";
/** Shared offline serialization of the existing runtime mesh, without redesign. */
export function serializeThreeAsset(root){
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
function serializeMesh(object,world,name,tint=null){
 const source=object.geometry,g=source.index?source.toNonIndexed():source.clone(),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,normalMatrix=new Matrix3().getNormalMatrix(world),v=new Vector3();
 const positions=[],normals=[],uvs=[],colors=[];
 for(let i=0;i<p.count;i++){
  v.fromBufferAttribute(p,i).applyMatrix4(world);positions.push(v.toArray());
  if(n){v.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);normals.push(v.toArray());}
  colors.push(tint?tint.toArray():[1,1,1]);
  uvs.push(uv?[uv.getX(i),uv.getY(i)]:[0,0]);
 }
 const objectMaterials=Array.isArray(object.material)?object.material:[object.material],slots=objectMaterials.map(materialId),triangleMaterials=[];
 for(let i=0;i<p.count;i+=3){const group=g.groups.find(item=>i>=item.start&&i<item.start+item.count);triangleMaterials.push(group?.materialIndex??0);}
 const existing=slots.length===1?meshes.find(m=>m.materials.length===1&&m.materials[0]===slots[0]):null;
 if(existing){for(let i=0;i<positions.length;i++){existing.positions.push(positions[i]);existing.normals.push(normals[i]);existing.uvs.push(uvs[i]);existing.colors.push(colors[i]);}existing.triangleMaterials.push(...triangleMaterials);}
 else meshes.push({name,positions,normals,uvs,colors,materials:slots,triangleMaterials});g.dispose();
}
root.traverseVisible(object=>{
 if(!object.isMesh||!object.visible)return;
 if(object.isInstancedMesh){const instance=new Matrix4(),world=new Matrix4();for(let i=0;i<object.count;i++){object.getMatrixAt(i,instance);world.multiplyMatrices(object.matrixWorld,instance);const tint=new Color(1,1,1);if(object.instanceColor)object.getColorAt(i,tint);serializeMesh(object,world,`${object.name}-${i}`,tint);}}
 else serializeMesh(object,object.matrixWorld,object.name||`mesh-${meshes.length}`);
});
return {materials,textures,meshes};
}
