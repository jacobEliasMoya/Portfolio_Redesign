import {Group,Mesh,MeshStandardMaterial} from "three";
import {createHudLetterGeometry,hudTextAdvance} from "./hud-letter-geometry.mjs";
import {glyphRepulsion,stepGlyphMotion} from "./hud-glyph-motion.mjs";

/** Shared reusable Sabo mesh assets; one geometry per character, one material pair per style. */
export function createHudLetterResources(font){
 const geometries=new Map(),materials=new Map();
 return {font,
  geometry(char){
   if(!geometries.has(char)){
    const geometry=createHudLetterGeometry(font,char,{fixedBaseline:true});geometry.computeBoundingBox();
    const width=geometry.boundingBox.max.x-geometry.boundingBox.min.x;
    geometry.translate(-width/2,0,-.08);geometry.userData.width=width;geometries.set(char,geometry);
   }return geometries.get(char);
  },
  materials(color,opacity){
   const key=`${color}:${opacity}`;
   if(!materials.has(key)){
    const front=new MeshStandardMaterial({color,roughness:.65,metalness:.05,transparent:opacity<1,opacity,toneMapped:false});
    const side=front.clone();side.color.multiplyScalar(.5);materials.set(key,[front,side]);
   }return materials.get(key);
  },
  dispose(){geometries.forEach(geometry=>geometry.dispose());materials.forEach(pair=>pair.forEach(material=>material.dispose()));},
 };
}

/** Every visible character is an actual volume with its own centered 3D pivot. */
export function createHudLetterModel(resources,text,{fontSize=1,color="#e8eadc",opacity=1}={}){
 const root=new Group();root.name=`Sabo HUD: ${text}`;root.scale.setScalar(fontSize);
 const glyphs=[];let advance=0,index=0;
 for(const char of text){
  if(char.trim()){
   const geometry=resources.geometry(char),mesh=new Mesh(geometry,resources.materials(color,opacity));
   mesh.name=`Sabo ${char} ${index}`;const x=advance+geometry.userData.width/2;mesh.position.x=x;
   root.add(mesh);glyphs.push({mesh,x,phase:index*.83,motion:{x:0,y:0,vx:0,vy:0},target:{x:0,y:0}});
  }
  advance+=hudTextAdvance(resources.font,char);index++;
 }
 root.userData.glyphs=glyphs;root.userData.fontSize=fontSize;return root;
}

export function stepHudLetterModel(root,{elapsed,delta,pointer,origin,reducedMotion=false}){
 const size=root.userData.fontSize;
 for(const glyph of root.userData.glyphs){
  const {mesh,x,phase,motion,target}=glyph;
  glyphRepulsion(origin.x+x*size,origin.y,pointer,pointer.active&&!reducedMotion,target);
  if(reducedMotion){motion.x=motion.y=motion.vx=motion.vy=0;}else stepGlyphMotion(motion,target,delta);
  const t=elapsed*.95+phase,float=reducedMotion?0:Math.sin(t);
  mesh.position.set(x+motion.x/size,float*.018-motion.y/size,reducedMotion?0:Math.cos(t*.71)*.018);
  mesh.rotation.set(.08+float*.025-motion.y*.012,-.14+(reducedMotion?0:Math.cos(t*.83)*.026)+motion.x*.012,(reducedMotion?0:Math.sin(t*.7)*.006)+motion.x*.004);
 }
}
