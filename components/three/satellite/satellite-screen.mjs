import {DataTexture,RGBAFormat,SRGBColorSpace,LinearFilter} from "three";
/** A single baked display, not a separate mesh for each pixel. */
export function createArchiveScreenTexture(){
 const size=256,data=new Uint8Array(size*size*4);
 const put=(x,y,c)=>{if(x>=0&&y>=0&&x<size&&y<size)data.set([...c,255],(y*size+x)*4);};
 const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,c);};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const v=Math.max(.25,1-Math.hypot((x-128)/180,(y-128)/180));put(x,y,[5,23,29].map(n=>Math.round(n*v)));}
 const teal=[83,174,176],dim=[39,95,106];
 rect(51,191,154,2,teal);rect(51,193,25,8,teal);for(let i=0;i<3;i++)rect(54+i*7,195,3,3,[12,45,53]);rect(195,195,8,3,dim);rect(185,195,7,3,teal);
 for(let y=-10;y<=10;y++)for(let x=-10;x<=10;x++){
  if(x*x+y*y>98)continue;
  const land=(x< -2&&y>0&&y<8&&x>-9)||(x>-5&&x<0&&y<2&&y>-8)||(x>1&&y>1&&y<7)||(x>0&&x<5&&y<2&&y>-5)||(x>5&&y< -4);
  const shade=.6+.4*Math.sqrt(Math.max(0,1-(x*x+y*y)/100));rect(105+x*4,126+y*4,4,4,(land?[124,191,76]:[27,116,149]).map(v=>Math.round(v*shade)));
 }
 for(let i=0;i<2;i++){const y=143-i*33;rect(170,y,25,18,teal);rect(172,y+2,21,14,dim);rect(172,y+18,11,4,teal);}
 rect(57,78,36,42,dim);rect(59,80,32,38,[9,31,39]);rect(59,112,32,5,teal);for(let i=0;i<4;i++){rect(63,104-i*6,3,2,teal);rect(69,104-i*6,16-i*2,2,dim);}rect(103,72,63,2,dim);rect(103,67,42,2,dim);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,glint=Math.max(0,1-Math.abs(y-(210-x*.18))/13)*.1;for(let c=0;c<3;c++)data[i+c]=Math.min(255,Math.round(data[i+c]*(y%3===0?.92:1)+glint*100));}
 const texture=new DataTexture(data,size,size,RGBAFormat);texture.name="archive-screen-art";texture.colorSpace=SRGBColorSpace;texture.magFilter=LinearFilter;texture.minFilter=LinearFilter;texture.needsUpdate=true;return texture;
}
