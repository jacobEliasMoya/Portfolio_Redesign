const upper=[[0,.43],[.82,.43],[1.1,.39],[1.6,.27],[1.95,.16],[2.23,.09]];
const lower=[[0,-.43],[.65,-.43],[1.2,-.32],[1.7,-.22],[2.23,-.09]];
function surface(profile,r){for(let i=1;i<profile.length;i++)if(r<=profile[i][0]){const [a,y]=profile[i-1],[b,z]=profile[i],slope=(z-y)/(b-a);return {y:y+slope*(r-a),slope};}return {y:profile.at(-1)[1],slope:0};}
const noise=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
export function createHexSaucerTiles(){
 const tiles=[];
 for(const side of [1,-1]){
  const width=side===1?.34:.49,step=width*.94;
  for(let row=-10;row<=10;row++)for(let col=-10;col<=10;col++){
   const x=(col+(Math.abs(row)%2)*.5)*step,z=row*step*.75,r=Math.hypot(x,z);
   if(r>2.22-width*.58||r<(side===1?.77:.57))continue;
   // Leave three actual openings in the lower armor for engine vents.
   if(side===-1&&[0,1,2].some(i=>Math.hypot(x-Math.sin(i*Math.PI*2/3)*1.25,z-Math.cos(i*Math.PI*2/3)*1.25)<.28))continue;
   const sample=surface(side===1?upper:lower,r),depth=(side===1?.09:.075)+noise(row,col)*.065;
   const relief=side===1?noise(row+9,col)*.065:noise(row+9,col)*.025;
   const nx=-sample.slope*x/(r||1)*side,nz=-sample.slope*z/(r||1)*side;
   tiles.push({x,y:sample.y+side*(depth*.27+relief),z,width:width*(.98+noise(col,row)*.055),depth,shade:.40+noise(row+4,col+17)*.34,side,normal:[nx,side,nz],variant:Math.floor(noise(row+3,col+5)*4)});
  }
 }
 return tiles;
}
