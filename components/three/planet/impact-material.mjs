/** Radial blast colors: fiery red center, orange middle, golden-yellow edge. */
export function impactPalette(distance,radius,hits=1){
 const t=Math.max(0,Math.min(1,distance/Math.max(radius,.001)));
 const smooth=n=>{const v=Math.max(0,Math.min(1,n));return v*v*(3-2*v);};
 const core=smooth(t/.32),rim=smooth((t-.82)/.16),orange=smooth((t-.32)/.5);
 const brightness=Math.pow(.55,Math.max(0,Math.min(7,hits-1)));
 return {r:(.40+.60*core)*brightness,g:(.012+.028*core+.26*orange+.60*rim)*brightness,b:(.003+.004*orange+.019*rim)*brightness,heat:(1+.15*core-.5*rim)*Math.pow(.4,Math.max(0,Math.min(7,hits-1)))};
}
/** Per-instance heat adds emission only to hit tiles; no additional draw call or light. */
export function applyImpactGlow(shader){
 shader.vertexShader=shader.vertexShader.replace("#include <common>","#include <common>\nattribute float impactHeat;\nvarying float vImpactHeat;").replace("#include <begin_vertex>","#include <begin_vertex>\nvImpactHeat = impactHeat;");
 shader.fragmentShader=shader.fragmentShader.replace("#include <common>","#include <common>\nvarying float vImpactHeat;").replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance += vImpactHeat < 0.0 ? -vImpactHeat * vec3(1.0, 0.015, 0.003) * 1.8 : vImpactHeat * diffuseColor.rgb * 1.35;");
}
