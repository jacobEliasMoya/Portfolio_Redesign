/** Exact critically damped spring. Bounded pixel offsets keep the actual buttons stationary. */
export function stepGlyphMotion(state,target,delta){
 const dt=Math.min(.05,Math.max(0,delta)),omega=16,decay=Math.exp(-omega*dt);
 for(const axis of ["x","y"]){const velocity=axis==="x"?"vx":"vy",distance=state[axis]-target[axis],impulse=state[velocity]+omega*distance;state[axis]=target[axis]+(distance+impulse*dt)*decay;state[velocity]=(state[velocity]-omega*impulse*dt)*decay;}
 return state;
}
export function glyphRepulsion(x,y,pointer,active,out={x:0,y:0}){
 out.x=0;out.y=0;if(!active)return out;
 let dx=x-pointer.x,dy=y-pointer.y;const distance=Math.hypot(dx,dy);if(distance>=64)return out;
 if(distance<.001){dx=0;dy=-1;}
 const amount=4*Math.pow(1-distance/64,2),length=Math.max(.001,Math.hypot(dx,dy));out.x=dx/length*amount;out.y=dy/length*amount;return out;
}
