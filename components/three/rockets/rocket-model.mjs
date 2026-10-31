import {BoxGeometry,Color,ConeGeometry,CylinderGeometry,Float32BufferAttribute,MeshStandardMaterial} from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
/** Original stylized launchers, not branded replicas: +Y nose, base at -.82. */
export function createRocketModel(tier){
 const parts=[];
 const add=(source,color,x=0,y=0,z=0)=>{const geometry=source.index?source.toNonIndexed():source.clone();source.dispose();geometry.translate(x,y,z);const tint=new Color(color),colors=new Float32Array(geometry.attributes.position.count*3);for(let i=0;i<colors.length;i+=3)tint.toArray(colors,i);geometry.setAttribute("color",new Float32BufferAttribute(colors,3));parts.push(geometry);};
 const legendary=tier.id==="legendary",white=legendary?"#b8c3c8":"#f1eee3",dark="#17202a";
 const stage=(x,booster=false)=>{
  add(new CylinderGeometry(.115,.115,1.35,8),white,x,-.025);
  add(new CylinderGeometry(.12,.12,.22,8),dark,x,.34);
  add(new ConeGeometry(.115,.24,8),white,x,.77);
  add(new CylinderGeometry(.055,.09,.13,6),dark,x,-.76);
  const fins=tier.id==="rare"?(booster?[Math.sign(x)]:[]):[-1,1];
  for(const side of fins)add(new BoxGeometry(.11,.16,.045),booster?dark:white,x+side*.145,-.57);
 };
 if(legendary){
  add(new CylinderGeometry(.165,.165,1.5,8),white,0,-.02);add(new ConeGeometry(.165,.46,8),"#d7e1e3",0,.96);
  add(new CylinderGeometry(.17,.17,.13,8),dark,0,-.57);add(new CylinderGeometry(.08,.13,.14,6),dark,0,-.82);
  for(const side of [-1,1]){add(new BoxGeometry(.2,.36,.055),"#9ba9af",side*.2,-.5);add(new BoxGeometry(.12,.18,.045),"#d7e1e3",side*.18,.6);}
 }else{stage(0);if(tier.id==="rare"){stage(-.31,true);stage(.31,true);add(new BoxGeometry(.54,.055,.09),dark,0,-.28);}}
 // Dark cabin windows and two slim stage seams keep the silhouette readable at miniature scale.
 add(new BoxGeometry(legendary?.2:.15,.07,.018),"#142b3e",0,legendary?.77:.6,.117);
 for(const y of [-.32,.13])add(new CylinderGeometry(legendary?.167:.117,legendary?.167:.117,.018,8),"#68777e",0,y);
 const geometry=mergeGeometries(parts);parts.forEach(p=>p.dispose());geometry.computeBoundingSphere();geometry.computeBoundingBox();
 const material=new MeshStandardMaterial({vertexColors:true,roughness:legendary?.55:.75,metalness:legendary?.35:.08});
 return {geometry,material,dispose(){geometry.dispose();material.dispose();}};
}
