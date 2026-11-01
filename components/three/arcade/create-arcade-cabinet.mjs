import {CylinderGeometry,IcosahedronGeometry,Group,Mesh,MeshStandardMaterial,ExtrudeGeometry,Shape} from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
/** Actual reusable meshes, with an open screen aperture. Coordinates are HUD pixels. */
export function createArcadeCabinet(layout,font){
 const root=new Group();root.name='arcade-cabinet';const geometry=new Set(),materials=new Set();
 const material=(color,metalness=.25,roughness=.55,emissive=0)=>{const m=new MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:.55});materials.add(m);return m;};
 const charcoal=material('#161d23'),paint=material('#26313b'),silver=material('#83949e',.45,.35),black=material('#05080d',.05),cyan=material('#42e8f1',.2,.3,'#106873');
 const lettering=material('#dfedf0',.1,.45);
 const colors=[cyan,material('#ef5248',.2,.3,'#490d08'),material('#f4bb48',.2,.3,'#5d3008')];
 const place=(g,m,x,y,z,name,parent=root)=>{geometry.add(g);const mesh=new Mesh(g,m);mesh.name=name;mesh.position.set(x-layout.width/2,layout.height/2-y,z);parent.add(mesh);return mesh;};
 const box=(x,y,w,h,d,m,z,name)=>place(new RoundedBoxGeometry(w,h,d,1,Math.min(2,w*.12,h*.12)),m,x,y,z,name);
 const {width:w,height:h,screen:s,rail:r,header}=layout;
 // Structural surround is a ring, including the rear: nothing caps the live screen.
 box(w/2,header/2+8,w-r*2,header,24,charcoal,-32,'marquee-body');
 box(w/2,header/2+8,w-r*2-10,header-10,5,black,-16,'marquee-face');
 box(w/2,header+13,w-r*2-8,4,6,cyan,-12,'marquee-light');
 box(w/2,10,w-r*2,5,12,silver,-12,'marquee-upper-trim');
 box(w/2,s.y-5,s.width+12,10,12,silver,-19,'bezel-top');
 box(w/2,s.y+s.height+5,s.width+12,10,12,silver,-19,'bezel-bottom');
 box(s.x-5,s.y+s.height/2,10,s.height+20,12,silver,-19,'bezel-left');
 box(s.x+s.width+5,s.y+s.height/2,10,s.height+20,12,silver,-19,'bezel-right');
 // A true profiled extrusion gives the side rails thickness and a projecting deck.
 const profile=new Shape();profile.moveTo(0,0);profile.lineTo(r,0);profile.lineTo(r,-header-18);profile.lineTo(r*.65,-header-32);profile.lineTo(r*.65,-h+layout.deck+12);profile.lineTo(r+4,-h+25);profile.lineTo(r+4,-h);profile.lineTo(0,-h);profile.closePath();
 const sideGeometry=new ExtrudeGeometry(profile,{depth:48,bevelEnabled:true,bevelThickness:1.5,bevelSize:1.5,bevelSegments:1,steps:1});geometry.add(sideGeometry);
 const left=new Mesh(sideGeometry,paint);left.name='left-profile';left.position.set(-w/2+4,h/2,-55);root.add(left);
 const right=new Mesh(sideGeometry,paint);right.name='right-profile';right.scale.x=-1;right.position.set(w/2-4,h/2,-55);root.add(right);
 const deckTop=s.y+s.height+17,deckHeight=h-deckTop-15;
 const deckProfile=new Shape();deckProfile.moveTo(35,deckHeight/2);deckProfile.lineTo(7,deckHeight/2);deckProfile.lineTo(-18,-deckHeight/2);deckProfile.lineTo(10,-deckHeight/2);deckProfile.closePath();
 const deckGeometry=new ExtrudeGeometry(deckProfile,{depth:w-2*r,bevelEnabled:true,bevelThickness:2,bevelSize:2,bevelSegments:1,steps:1});
 // Extrude in Z, then rotate the profile so depth becomes cabinet width.
 deckGeometry.rotateY(Math.PI/2);deckGeometry.translate(-(w-2*r)/2,0,0);
 place(deckGeometry,charcoal,w/2,deckTop+deckHeight/2,11,'control-deck');
 box(w/2,h-12,w-2*r+6,12,52,paint,8,'deck-front-lip');
 box(w/2,h-6,w-2*r+4,3,52,silver,12,'deck-front-trim');
 const label=(text,x,y,size,color= silver,z=40)=>{const g=new TextGeometry(text,{font,size,depth:.8,curveSegments:1});g.computeBoundingBox();const b=g.boundingBox;g.translate(-(b.max.x+b.min.x)/2,-(b.max.y+b.min.y)/2,0);return place(g,color,x,y,z,`label-${text}`);};
 const title=label("JAKE'S SPACE",w/2,header/2+8,header*.57,lettering,-9);title.scale.setScalar(Math.min(1,(w*.68)/Math.max(1,title.geometry.boundingBox.max.x-title.geometry.boundingBox.min.x)));
 const cylinder=(x,y,radius,depth,m,z,name)=>{const mesh=place(new CylinderGeometry(radius,radius*1.08,depth,12),m,x,y,z,name);mesh.rotation.x=Math.PI/2;return mesh;};
 const caps=layout.buttons.map((p,i)=>{cylinder(p.x,p.y,layout.buttonRadius+4,5,black,15,`button-base-${i}`);const cap=cylinder(p.x,p.y,layout.buttonRadius,8,colors[i],22,`button-cap-${i}`);label(['BOLTS','RAY','SINGULARITY'][i],p.x,h-27,Math.max(8,Math.min(10,w*.012)));return cap;});
 const start=cylinder(layout.start.x,layout.start.y,Math.max(9,layout.buttonRadius*.55),7,silver,20,'start');label('START',layout.start.x,h-27,Math.max(8,Math.min(10,w*.012)));
 const j=layout.joystick;cylinder(j.x,j.y+12,layout.buttonRadius+5,5,black,19,'joystick-base');
 const lever=new Group();lever.name='joystick-pivot';lever.position.set(j.x-w/2,h/2-j.y-12,22);root.add(lever);
 const stem=new Mesh(new CylinderGeometry(3,4,27,8),silver);geometry.add(stem.geometry);stem.position.set(0,12,5);stem.rotation.x=.4;lever.add(stem);
 const ball=new Mesh(new IcosahedronGeometry(Math.max(12,layout.buttonRadius*.8),1),cyan);geometry.add(ball.geometry);ball.position.set(0,29,15);lever.add(ball);
 label('MOVE',j.x,h-27,Math.max(8,Math.min(10,w*.012)));
 // Merge fixed panels/lettering by shared material. Moving parts keep their pivots.
 root.updateMatrixWorld(true);const batches=new Map();
 for(const mesh of [...root.children]){
  if(!mesh.isMesh||caps.includes(mesh)||mesh===start)continue;
  const g=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);
  // Baking a mirrored profile reverses triangle winding; retain its outward faces.
  if(mesh.matrixWorld.determinant()<0)for(const attribute of Object.values(g.attributes)){
   const a=attribute.array,n=attribute.itemSize;for(let i=0;i<attribute.count;i+=3)for(let c=0;c<n;c++){const j=(i+1)*n+c,k=(i+2)*n+c,value=a[j];a[j]=a[k];a[k]=value;}
  }
  const list=batches.get(mesh.material)||[];list.push(g);batches.set(mesh.material,list);root.remove(mesh);
 }
 for(const [m,list] of batches){const merged=mergeGeometries(list,false);list.forEach(g=>g.dispose());geometry.add(merged);const mesh=new Mesh(merged,m);mesh.name='static-cabinet-panels';root.add(mesh);}
 root.userData.screen={...s};
 return {root,lever,caps,start,dispose(){geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
export function stepArcadeCabinet(model,keys,delta,reducedMotion=false){
 const blend=reducedMotion?1:1-Math.exp(-22*Math.min(.1,Math.max(0,delta)));
 const x=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0),z=(keys.has('KeyA')?1:0)-(keys.has('KeyD')?1:0);
 model.lever.rotation.x+=(x*.28-model.lever.rotation.x)*blend;model.lever.rotation.z+=(z*.28-model.lever.rotation.z)*blend;
 let moving=false;
 model.caps.forEach((cap,i)=>{const depth=keys.has('KeyF')&&keys.has(`Digit${i+1}`)?18:22;cap.position.z+=(depth-cap.position.z)*blend;if(Math.abs(depth-cap.position.z)>.001)moving=true;});
 return moving||Math.abs(model.lever.rotation.x-x*.28)+Math.abs(model.lever.rotation.z-z*.28)>.001;
}
