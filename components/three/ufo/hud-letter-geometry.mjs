import {TextGeometry} from "three/addons/geometries/TextGeometry.js";
export function hudTextAdvance(font,text){return Array.from(text).reduce((width,char)=>width+(font.data.glyphs[char]??font.data.glyphs["?"]).ha,0)/font.data.resolution;}
/** Real hard-edged, extruded Sabo glyphs, centered vertically for screen-space placement. */
const capCenters=new WeakMap();
export function createHudLetterGeometry(font,text,{fixedBaseline=false}={}){
 const geometry=new TextGeometry(text,{font,size:1,depth:.16,curveSegments:2,bevelEnabled:false,bevelThickness:.003,bevelSize:.003,bevelSegments:1});
 geometry.computeBoundingBox();const box=geometry.boundingBox;
 if(box&&!box.isEmpty()){
  let center=(box.min.y+box.max.y)/2;
  if(fixedBaseline){if(!capCenters.has(font)){const ys=font.generateShapes("H",1).flatMap(shape=>shape.getPoints().map(point=>point.y));capCenters.set(font,(Math.min(...ys)+Math.max(...ys))/2);}center=capCenters.get(font);}
  geometry.translate(-box.min.x,-center,0);
 }
 return geometry;
}
