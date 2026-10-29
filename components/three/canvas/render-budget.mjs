/** Bound drawing-buffer cost independently of the monitor's CSS size or density. */
export function renderDpr(width,height,deviceDpr=1,factor=1){
 const area=Math.max(1,width)*Math.max(1,height);
 const ceiling=Math.min(Math.max(.1,deviceDpr),1.25,Math.sqrt(2_000_000/area));
 return ceiling*(.65+.35*Math.max(0,Math.min(1,factor)));
}
