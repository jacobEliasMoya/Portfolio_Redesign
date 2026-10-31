import {BoxGeometry,Color,ConeGeometry,CylinderGeometry,ExtrudeGeometry,Float32BufferAttribute,MeshStandardMaterial,Shape} from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
/** Toy jet proportions: 1.25 length, 1.24 span; +Z nose, +Y dorsal fin. One colored mesh. */
export function createAirplaneModel(){
 const parts=[];
 function add(source,color,x=0,y=0,z=0){const geometry=source.index?source.toNonIndexed():source.clone();source.dispose();geometry.translate(x,y,z);const tint=new Color(color),colors=new Float32Array(geometry.attributes.position.count*3);for(let i=0;i<colors.length;i+=3)tint.toArray(colors,i);geometry.setAttribute("color",new Float32BufferAttribute(colors,3));parts.push(geometry);}
 function tube(radius,length){const g=new CylinderGeometry(radius,radius,length,6,1);g.rotateX(Math.PI/2);return g;}
 function wing(points){const shape=new Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const g=new ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,steps:1});g.rotateX(Math.PI/2);g.translate(0,.0175,0);return g;}
 add(tube(.095,.88),"#f0eee1");
 const nose=new ConeGeometry(.095,.24,6);nose.rotateX(Math.PI/2);add(nose,"#f0eee1",0,0,.56);
 const tail=new ConeGeometry(.095,.22,6);tail.rotateX(-Math.PI/2);add(tail,"#f0eee1",0,0,-.55);
 add(wing([[-.62,-.27],[-.1,.14],[.1,.14],[.62,-.27],[.59,-.37],[.08,-.1],[-.08,-.1],[-.59,-.37]]),"#e2e3db",0,-.015,0);
 add(wing([[-.27,-.55],[-.07,-.33],[.07,-.33],[.27,-.55],[.24,-.6],[-.24,-.6]]),"#dfad55",0,.025,0);
 add(new BoxGeometry(.035,.25,.2),"#dfad55",0,.15,-.43);
 for(const x of [-.21,.21]){add(tube(.055,.24),"#b9c3c6",x,-.075,-.09);add(tube(.04,.012),"#263c49",x,-.075,.036);}
 add(new BoxGeometry(.14,.035,.14),"#173e52",0,.083,.32);
 for(const x of [-.094,.094])for(let i=0;i<5;i++)add(new BoxGeometry(.012,.035,.035),"#235b70",x,.032,.17-i*.1);
 const geometry=mergeGeometries(parts);parts.forEach(part=>part.dispose());geometry.computeBoundingSphere();
 const material=new MeshStandardMaterial({vertexColors:true,roughness:.68,metalness:.08});
 return {geometry,material,dispose(){geometry.dispose();material.dispose();}};
}
