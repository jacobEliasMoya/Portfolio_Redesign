import {Group,IcosahedronGeometry,Mesh,MeshStandardMaterial,TorusGeometry} from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
/** Black faceted nucleus, three intersecting electron orbits: .58-unit total silhouette. */
export function createAtomBomb(){
 const root=new Group(),orbits=new Group(),coreGeometry=new IcosahedronGeometry(.135,1),coreMaterial=new MeshStandardMaterial({color:"#080a0d",roughness:.8,metalness:.12});
 root.name="singularity-atom-bomb";root.add(new Mesh(coreGeometry,coreMaterial),orbits);
 const rings=[],beads=[];
 for(let i=0;i<3;i++){
  const ring=new TorusGeometry(.28,.009,4,32);ring.rotateX(Math.PI/2);ring.rotateZ(i*Math.PI/3);rings.push(ring);
  const bead=new IcosahedronGeometry(.025,0);bead.translate(.28,0,0);bead.rotateY(i*2.1);bead.rotateZ(i*Math.PI/3);beads.push(bead);
 }
 const ringGeometry=mergeGeometries(rings),beadGeometry=mergeGeometries(beads);[...rings,...beads].forEach(g=>g.dispose());
 const ringMaterial=new MeshStandardMaterial({color:"#64747e",roughness:.55,metalness:.45}),beadMaterial=new MeshStandardMaterial({color:"#b8e0e8",emissive:"#52828b",emissiveIntensity:.35,roughness:.6});
 orbits.add(new Mesh(ringGeometry,ringMaterial),new Mesh(beadGeometry,beadMaterial));
 return {root,orbits,dispose(){[coreGeometry,ringGeometry,beadGeometry].forEach(g=>g.dispose());[coreMaterial,ringMaterial,beadMaterial].forEach(m=>m.dispose());}};
}
export function stepAtomBomb(model,position,delta,reducedMotion=false){model.root.position.copy(position);if(!reducedMotion){model.orbits.rotation.y+=delta*2.5;model.orbits.rotation.z+=delta*.8;}}
