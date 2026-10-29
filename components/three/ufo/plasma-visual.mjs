import {AdditiveBlending,LatheGeometry,ShaderMaterial,Vector2} from "three";
/** Teardrop silhouette: full rounded leading head, drawn-out pointed trailing tip (+Z forward). */
export function createPlasmaEnvelope(){
 const geometry=new LatheGeometry([[0,-2.25],[.015,-1.95],[.05,-1.55],[.11,-1.1],[.22,-.6],[.36,-.18],[.48,.13],[.54,.38],[.52,.58],[.44,.79],[.29,.97],[.12,1.06],[0,1.08]].map(p=>new Vector2(...p)),16);
 geometry.rotateX(Math.PI/2);return geometry;
}
export function createPlasmaMaterial({instanced=true}={}){return new ShaderMaterial({
 transparent:true,depthWrite:false,blending:AdditiveBlending,toneMapped:false,
 uniforms:{uTime:{value:0}},
 vertexShader:`
 uniform float uTime;
 varying vec3 vLocal;
 varying vec3 vNormal;
 varying vec3 vView;
 void main(){
  vLocal=position;
  vec3 p=position;
  float envelope=smoothstep(-2.25,-.4,p.z)*(1.-smoothstep(.65,1.08,p.z));
  float wave=sin(p.z*8.-uTime*7.);
  p.xy*=1.+.045*wave*envelope;
  vec4 view=modelViewMatrix*${instanced?"instanceMatrix*":""}vec4(p,1.);
  vNormal=normalize(normalMatrix*${instanced?"mat3(instanceMatrix)*":""}normal);
  vView=-view.xyz;
  gl_Position=projectionMatrix*view;
 }`,
 fragmentShader:`
 uniform float uTime;
 varying vec3 vLocal;
 varying vec3 vNormal;
 varying vec3 vView;
 void main(){
  float angle=atan(vLocal.y,vLocal.x);
  float head=smoothstep(-1.6,.5,vLocal.z);
  float twist=angle*3.+vLocal.z*5.-uTime*4.;
  float filament=pow(.5+.5*sin(twist),9.);
  float secondary=pow(.5+.5*sin(-angle*5.+vLocal.z*9.+uTime*3.),16.);
  float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),1.6);
  float crest=.5+.5*sin(vLocal.z*7.-uTime*6.);
  vec3 color=mix(vec3(.22,.07,.85),vec3(.025,.65,1.),head);
  color=mix(color,vec3(.65,.95,1.),filament*.7*head);
  float tip=smoothstep(-2.25,-1.95,vLocal.z)*(1.-smoothstep(.97,1.09,vLocal.z));
  float alpha=tip*(.10+.35*rim+.42*filament+.17*secondary)*(.85+.15*crest);
  gl_FragColor=vec4(color*1.35,alpha);
 }`
});}
