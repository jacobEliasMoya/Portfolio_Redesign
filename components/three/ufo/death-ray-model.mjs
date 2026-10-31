import {AdditiveBlending,CylinderGeometry,Group,Mesh,MeshBasicMaterial,ShaderMaterial,SphereGeometry} from "three";
import {deathRayActive,deathRayEnvelope} from "./death-ray.mjs";
/** Actual +Z red beam volume: hot red bore, crimson envelope and contact flare. */
export function createDeathRayModel(){
 const root=new Group(),geometry=new CylinderGeometry(1,1,1,16,1,false);geometry.rotateX(Math.PI/2);geometry.translate(0,0,.5);
 const coreMaterial=new MeshBasicMaterial({color:"#ff4938",transparent:true,depthWrite:false,toneMapped:false});
 const shellMaterial=new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,toneMapped:false,
  uniforms:{uAge:{value:0},uStrength:{value:1}},
  vertexShader:`varying vec3 vLocal;varying vec3 vNormal;varying vec3 vView;void main(){vLocal=position;vec4 view=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=-view.xyz;gl_Position=projectionMatrix*view;}`,
  fragmentShader:`uniform float uAge;uniform float uStrength;varying vec3 vLocal;varying vec3 vNormal;varying vec3 vView;void main(){float edge=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),1.4);float flow=.85+.15*sin(vLocal.z*35.-uAge*12.);vec3 color=mix(vec3(.65,.002,.008),vec3(1.,.045,.012),edge);gl_FragColor=vec4(color*1.7,uStrength*(.24+.42*edge)*flow);}`});
 const flareMaterial=new MeshBasicMaterial({color:"#ff3520",transparent:true,blending:AdditiveBlending,depthWrite:false,toneMapped:false});
 const flareGeometry=new SphereGeometry(1,12,8),core=new Mesh(geometry,coreMaterial),shell=new Mesh(geometry,shellMaterial),flare=new Mesh(flareGeometry,flareMaterial);
 root.add(core,shell,flare);root.visible=false;root.name="Red death ray";
 for(const mesh of [core,shell,flare])mesh.frustumCulled=false;
 return {root,core,shell,flare,coreMaterial,shellMaterial,flareMaterial,dispose(){geometry.dispose();flareGeometry.dispose();coreMaterial.dispose();shellMaterial.dispose();flareMaterial.dispose();}};
}
export function updateDeathRayModel(model,ray,scale,reducedMotion=false){
 const strength=deathRayEnvelope(ray);model.root.visible=deathRayActive(ray)&&ray.length>.0001&&strength>0;
 if(!model.root.visible)return;
 model.root.position.copy(ray.origin);model.root.quaternion.copy(ray.rotation);
 const width=scale*(.8+.2*strength);
 model.core.scale.set(width*.13,width*.13,ray.length);model.shell.scale.set(width*.48,width*.48,ray.length);
 model.coreMaterial.opacity=strength;model.shellMaterial.uniforms.uStrength.value=strength;model.shellMaterial.uniforms.uAge.value=reducedMotion?0:ray.age;
 model.flare.visible=ray.hit&&ray.held;model.flare.position.set(0,0,ray.length);model.flare.scale.setScalar(width*.65*strength);model.flareMaterial.opacity=.65*strength;
}
