import {Group,Mesh,MeshStandardMaterial,MeshPhysicalMaterial,Shape,Path,ExtrudeGeometry,CylinderGeometry,BoxGeometry,PlaneGeometry,BufferGeometry,Float32BufferAttribute} from 'three';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
export const MONITOR_SCREEN=Object.freeze({width:5.16,height:3.1,x:0,y:.85,z:.465,pixels:1200});
function outline(w,h,c){return [[-w/2+c,-h/2],[w/2-c,-h/2],[w/2,-h/2+c],[w/2,h/2-c],[w/2-c,h/2],[-w/2+c,h/2],[-w/2,h/2-c],[-w/2,-h/2+c]];}
function polygon(points,Type=Shape){const s=new Type();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
/** Flat polygon rings form a shallow raised rim: no sphere or curved display. */
function screenRim(){
 const rings=[[5.5,3.46,.06,.34],[5.36,3.32,.035,.51],[5.22,3.16,.012,.51],[5.16,3.1,.006,.455]];
 const vertices=[];
 for(let r=0;r<rings.length-1;r++){
  const [w,h,c,z]=rings[r],[iw,ih,ic,iz]=rings[r+1],a=outline(w,h,c),b=outline(iw,ih,ic);
  for(let i=0;i<8;i++){const j=(i+1)%8;for(const [p,d] of [[a[i],z],[a[j],z],[b[j],iz],[a[i],z],[b[j],iz],[b[i],iz]])vertices.push(p[0],p[1],d);}
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setAttribute('uv',new Float32BufferAttribute(Array(vertices.length/3*2).fill(0),2));g.computeVertexNormals();return g;
}
/** Silver Orbit in model units. Front +Z; screen is a separately named material surface. */
export function createSilverOrbit(font){
 const root=new Group();root.name='silver-orbit';const geometries=new Set(),materials=new Set();
 const mat=(color,metalness=.35,roughness=.4)=>{const m=new MeshStandardMaterial({color,metalness,roughness});materials.add(m);return m;};
 const silver=mat('#b8c4cc',.65,.32),edge=mat('#667582',.55,.4),graphite=mat('#202933',.3,.48),black=mat('#070c11',.1,.5),cyan=mat('#62e9f2',.2,.3);cyan.emissive.set('#34bbcc');cyan.emissiveIntensity=.8;
 const add=(g,m,name,x=0,y=0,z=0)=>{geometries.add(g);const mesh=new Mesh(g,m);mesh.name=name;mesh.position.set(x,y,z);root.add(mesh);return mesh;};
 const extrude=(shape,depth,bevel=.035)=>new ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSegments:1,bevelThickness:bevel,bevelSize:bevel,steps:1,curveSegments:1});
 add(extrude(polygon(outline(5.94,3.79,.24)),.66,.07),silver,'rear-enclosure',0,.65,-.52);
 add(extrude(polygon(outline(5.99,3.82,.25)),.055,.01),graphite,'casing-seam',0,.65,.13);
 const frame=polygon(outline(6,3.85,.25));const hole=polygon(outline(5.25,3.2,.015).map(([x,y])=>[x,y+.2]),Path);frame.holes.push(hole);
 add(extrude(frame,.15,.035),silver,'front-bezel',0,.65,.18);
 const gasket=polygon(outline(5.27,3.22,.015));gasket.holes.push(polygon(outline(5.16,3.1,.006),Path));add(extrude(gasket,.025,.004),black,'screen-gasket',0,.85,.32);
 add(screenRim(),edge,'raised-screen-bevel',0,.85,0);
 const displayMaterial=new MeshPhysicalMaterial({color:'#020407',metalness:.15,roughness:.24,clearcoat:1,clearcoatRoughness:.12});materials.add(displayMaterial);
 const screen=add(new PlaneGeometry(5.16,3.1),displayMaterial,'monitor-display',0,.85,MONITOR_SCREEN.z-.01);
 // Broad fitted rear panels, not fine surface decoration.
 add(extrude(polygon(outline(5.42,3.2,.20)),.035,.025),edge,'rear-panel',0,.65,-.60).rotation.y=Math.PI;
 for(const sign of [-1,1]){
  const pod=add(new CylinderGeometry(.46,.46,.16,6),graphite,`hex-side-${sign}`,sign*3.04,.60,-.16);pod.rotation.z=Math.PI/2;
  const cap=add(new CylinderGeometry(.37,.37,.035,6),edge,`hex-cap-${sign}`,sign*3.135,.60,-.16);cap.rotation.z=Math.PI/2;
 }
 add(extrude(polygon(outline(.94,.87,.10)),.36,.035),graphite,'neck',0,-1.36,-.28);
 add(extrude(polygon(outline(1.12,.80,.12)),.16,.03),edge,'rear-neck-mount',0,-.89,-.53).rotation.y=Math.PI;
 // True six-sided footprint, with broad upper bevels and a graphite sole.
 const foot=[[-1.55,-.48],[0,-.83],[1.55,-.48],[1.55,.48],[0,.83],[-1.55,.48]];
 const sole=add(extrude(polygon(foot),.09,.025),graphite,'foot-sole',0,-2.02,0);sole.rotation.x=-Math.PI/2;
 const base=add(extrude(polygon(foot.map(([x,y])=>[x*.97,y*.97])),.14,.10),silver,'hexagonal-foot',0,-1.91,0);base.rotation.x=-Math.PI/2;
 for(let i=0;i<3;i++){const b=add(new CylinderGeometry(.105,.105,.055,6),graphite,`hex-button-${i}`,1.72+i*.28,-.99,.39);b.rotation.x=Math.PI/2;}
 add(new BoxGeometry(.43,.055,.025),cyan,'status-light',0,-.99,.39);
 if(font){const g=new TextGeometry('JM',{font,size:.13,depth:.004,curveSegments:1});add(g,edge,'jm-mark',-2.57,-1.05,.38);}
 root.userData.screen={...MONITOR_SCREEN};
 return {root,screen,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
