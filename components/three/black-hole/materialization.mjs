import {DoubleSide,Mesh,MeshBasicMaterial,RingGeometry} from "three";
/** GPU-only tile assembly: keep all 7,121 instance matrices and colors immutable. */
export function createMaterialization(model){
 const shell=model.getObjectByName("matte-hex-sphere"),disc=model.getObjectByName("tilted-accretion-disc"),bands=disc.children.map((mesh,index)=>{
  const age={value:0},delay=index*.045,material=mesh.material,previous=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=(shader,renderer)=>{
   previous.call(material,shader,renderer);shader.uniforms.uBirthAge=age;shader.uniforms.uBirthDelay={value:delay};
   shader.vertexShader="uniform float uBirthAge;uniform float uBirthDelay;\n"+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace("#include <project_vertex>",`
    vec4 mvPosition=vec4(transformed,1.0);
    #ifdef USE_INSTANCING
     vec3 birthCenter=instanceMatrix[3].xyz;
     float seed=fract(sin(dot(birthCenter.xz,vec2(12.9898,78.233)))*43758.5453);
     float p=clamp((uBirthAge-uBirthDelay-seed*.24)/.7,0.0,1.0);p=p*p*(3.0-2.0*p);
     vec3 birthPosition=birthCenter;
     float angle=(1.0-p)*(2.5+seed*3.0);
     birthPosition.xz=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*birthCenter.xz*(1.0+.65*(1.0-p));
     birthPosition.y+=sin(seed*6.283)*(1.0-p)*1.2;
     vec3 localTile=(instanceMatrix*mvPosition).xyz-birthCenter;
     mvPosition.xyz=localTile*p+birthPosition;
    #endif
    mvPosition=modelViewMatrix*mvPosition;
    gl_Position=projectionMatrix*mvPosition;
   `);
  };
  material.customProgramCacheKey=()=>key+"-singularity-birth-v1";
  return {mesh,age,culled:mesh.frustumCulled};
 });
 const ring=new Mesh(new RingGeometry(.92,1,48),new MeshBasicMaterial({color:"#e6a65c",transparent:true,opacity:0,depthWrite:false,side:DoubleSide,toneMapped:false}));ring.name="singularity-inward-shock";ring.rotation.x=Math.PI/2;ring.visible=false;model.add(ring);
 return {model,shell,disc,bands,ring,baseX:disc.rotation.x,baseZ:disc.rotation.z};
}
export function stepMaterialization(birth,age,delta,reducedMotion=false){
 const time=reducedMotion?2:Math.max(0,age),progress=Math.min(1,time/1.25),pulse=Math.exp(-time*5),core=Math.min(1,time/.6);
 // A compact, opaque seed unfolds with a short asymmetric overshoot, then settles.
 birth.shell.scale.set(.025+.975*core+.08*Math.sin(time*13)*pulse,.025+.975*core-.1*Math.sin(time*11)*pulse,.025+.975*core);
 if(time>=1.25)birth.shell.scale.setScalar(1);
 birth.disc.rotation.x=birth.baseX+(reducedMotion?0:.23*Math.sin(time*9)*Math.exp(-time*2.8));birth.disc.rotation.z=birth.baseZ+(reducedMotion?0:.15*Math.sin(time*7)*Math.exp(-time*2.8));
 for(const band of birth.bands){band.age.value=time;band.mesh.frustumCulled=time<1.3?false:band.culled;if(!reducedMotion)band.mesh.rotation.y+=Math.max(0,Math.min(.1,delta))*7*Math.exp(-time*3);}
 const shock=time/.65;birth.ring.visible=!reducedMotion&&shock<1;birth.ring.scale.setScalar(.04+3.8*Math.pow(Math.max(0,1-shock),2));birth.ring.material.opacity=Math.sin(Math.min(1,shock)*Math.PI)*.55;
 birth.model.userData.materializationProgress=progress;
}
