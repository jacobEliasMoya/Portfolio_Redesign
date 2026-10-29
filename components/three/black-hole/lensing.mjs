export function discAtlasResolution(width,height){return Math.min(768,Math.max(384,Math.round(Math.max(width,height)*.5)));}
/** Compress the main disc's radial span into a smaller apparent secondary image. */
export function secondaryDiscRadius(apparentRadius){const t=Math.max(0,Math.min(1,(apparentRadius-2.08)/.72));return 2.22+t*3.18;}
export function discAtlasUv(radius,angle){return [.5+Math.sin(angle)*radius/13.2,.5-Math.cos(angle)*radius/13.2];}
/** Image only warm emitted disc light, not cool reflections on graphite panels. */
export function warmLensingWeight([r,g,b]){const warmth=(r-Math.max(g,b))/Math.max(.01,r+g+b),t=Math.max(0,Math.min(1,(warmth-.035)/.125));return t*t*(3-2*t);}
export const lensVertexShader=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const lensFragmentShader=`uniform sampler2D uDisc;uniform float uAzimuth;uniform float uArcVisibility;
varying vec2 vUv;
void main(){
 vec2 p=(vUv-.5)*6.4;float r=length(p);
 if(r<2.06||r>2.80)discard;
 // Sample an orthographic top-down disc atlas. Its detail never collapses edge-on.
 // The source radius stays one-to-one and monotonic throughout the visible image.
 float phi=atan(p.y,p.x),radialT=clamp((r-2.08)/.72,0.,1.);
 float sourceRadius=2.22+radialT*3.18,sourceAngle=phi+uAzimuth+1.5707963;
 vec2 sourceUv=.5+vec2(sin(sourceAngle),-cos(sourceAngle))*sourceRadius/13.2;
 vec3 secondary=texture2D(uDisc,sourceUv).rgb;
 float warmth=(secondary.r-max(secondary.g,secondary.b))/max(.01,secondary.r+secondary.g+secondary.b);
 float warmLight=smoothstep(.035,.16,warmth);
 float imageMask=clamp(dot(secondary,vec3(.2126,.7152,.0722))*7.,0.,1.)*warmLight;
 float radialMask=smoothstep(2.08,2.13,r)*(1.-smoothstep(2.72,2.80,r));
 float upper=pow(max(0.,sin(phi)),.32),lower=.78*pow(max(0.,-sin(phi)),.4);
 float imageAlpha=radialMask*(.18+max(upper,lower))*uArcVisibility*imageMask;
 imageAlpha=clamp(imageAlpha,0.,.98);
 if(imageAlpha<.005)discard;
 gl_FragColor=vec4(secondary*1.45,imageAlpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
