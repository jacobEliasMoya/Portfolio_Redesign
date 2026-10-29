/** Deterministic local cube sculptures, following the approved cloud concept sheet. */
export function buildCloudShape(variant = "billow", seed = 1) {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const blocks = [];
  const add = (x, y, z, size) => blocks.push({ position: [x, y, z], size, shade: .84 + random() * .16 });
  if (variant === "wisp") {
    for (let strand = 0; strand < 3; strand++) for (let i = 0; i < 42; i++) {
      const t = i / 41;
      if (random() < .12) continue;
      add((t - .5) * 3.8, .12 + Math.sin(t * Math.PI) * .2, Math.sin(t * Math.PI * 1.8 + strand) * .25 + (strand - 1) * .28, .07 + Math.sin(t * Math.PI) * .1 + random() * .05);
    }
  } else if (variant === "spiral") {
    for (let arm = 0; arm < 3; arm++) for (let i = 0; i < 65; i++) {
      const t = i / 64, angle = arm * Math.PI * 2 / 3 + t * Math.PI * 2.3, r = .3 + t * 1.5;
      add(Math.cos(angle) * r, .12 + (1 - t) * .3, Math.sin(angle) * r * .75, .1 + (1 - t) * .15 + random() * .04);
    }
  } else {
    const bank = variant === "bank";
    for (let ix = -8; ix <= 8; ix++) for (let iz = -4; iz <= 4; iz++) for (let iy = 0; iy < (bank ? 3 : 5); iy++) {
      const x = ix * .2, z = iz * .2, y = iy * .2;
      const lobes = bank ? [[-.7,.12,0,.95,.35,.62],[.35,.16,.05,1.15,.42,.7]] : [[-.8,.2,0,.8,.55,.65],[0,.42,0,.95,.8,.78],[.85,.15,.05,.75,.48,.6]];
      if (!lobes.some(([cx,cy,cz,rx,ry,rz]) => ((x-cx)/rx)**2 + ((y-cy)/ry)**2 + ((z-cz)/rz)**2 < 1)) continue;
      if (random() < .08) continue;
      add(x + (random()-.5)*.05, y + (random()-.5)*.03, z + (random()-.5)*.05, .18 + random()*.13);
    }
  }
  return blocks;
}

/** Sparse, intentionally staggered patches; leave the equatorial text band clear. */
export const CLOUD_PLACEMENTS = Object.freeze([
  { variant: "billow", lon: -115, lat: 33, scale: .38, heading: .3 },
  { variant: "bank", lon: -15, lat: 37, scale: .38, heading: .7 },
  { variant: "billow", lon: 60, lat: 46, scale: .34, heading: -.2 },
  { variant: "bank", lon: 175, lat: 53, scale: .36, heading: -.3 },
  { variant: "bank", lon: -80, lat: -43, scale: .32, heading: .3 },
  { variant: "billow", lon: -10, lat: -32, scale: .35, heading: .5 },
  { variant: "bank", lon: -110, lat: 42, scale: .34, heading: -.7 },
  { variant: "billow", lon: 85, lat: 30, scale: .3, heading: .2 },
  { variant: "bank", lon: -155, lat: 24, scale: .3, heading: .5 },
  { variant: "billow", lon: -42, lat: 28, scale: .28, heading: -.4 },
  { variant: "bank", lon: 95, lat: 58, scale: .3, heading: -.6 },
  { variant: "billow", lon: 155, lat: 34, scale: .32, heading: .3 },
  { variant: "bank", lon: -48, lat: -54, scale: .34, heading: .8 },
  { variant: "billow", lon: 20, lat: -48, scale: .3, heading: .2 },
  { variant: "bank", lon: 165, lat: -36, scale: .32, heading: .4 },
]);

/** Low cloud patches follow the sphere; tall mountains may intentionally pierce them. */
export function buildCloudLayer() {
  const blocks = [];
  CLOUD_PLACEMENTS.forEach((patch, index) => {
    const cloudScale = patch.scale * 0.45;
    const lon = patch.lon * Math.PI / 180, lat = patch.lat * Math.PI / 180;
    const normal = [Math.sin(lon)*Math.cos(lat), Math.sin(lat), Math.cos(lon)*Math.cos(lat)];
    const east = [Math.cos(lon),0,-Math.sin(lon)];
    const north = [-Math.sin(lon)*Math.sin(lat), Math.cos(lat), -Math.cos(lon)*Math.sin(lat)];
    const c = Math.cos(patch.heading), s = Math.sin(patch.heading);
    for (const block of buildCloudShape(patch.variant, index + 91)) {
      const [x,y,z] = block.position;
      const u = (x*c-z*s)*cloudScale, v = (x*s+z*c)*cloudScale;
      const direction = normal.map((n,i) => n + (east[i]*u+north[i]*v)/3.28);
      const length = Math.hypot(...direction);
      const radial = 3.22 + (index % 4) * .035 + y*cloudScale*.4;
      blocks.push({ position: direction.map((n) => n/length*radial), normal: direction.map((n) => n/length), size: block.size*cloudScale, shade: block.shade, variant: patch.variant });
    }
  });
  return blocks;
}
