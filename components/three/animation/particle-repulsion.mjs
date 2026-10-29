/** Smooth local displacement away from a passing ship; never permanently destroys a block. */
export function particleRepulsion(point,ship,radius=1.8,output=[0,0,0]){
 const x=point[0]-ship.x,y=point[1]-ship.y,z=point[2]-ship.z,d=Math.hypot(x,y,z);
 const strength=Math.pow(Math.max(0,1-d/radius),2)*2.4;
 if(d<1e-6){output[0]=0;output[1]=strength;output[2]=0;}else{output[0]=x/d*strength;output[1]=y/d*strength;output[2]=z/d*strength;}
 return output;
}
