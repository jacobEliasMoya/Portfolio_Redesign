import { ExtrudeGeometry, Shape } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

/** Six-sided, beveled prism with its outward-facing cap along local +Y. */
export function createHexagonalEarthGeometry() {
  const outline = new Shape();
  const radius = .5 / Math.cos(Math.PI / 6);
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + i * Math.PI / 3;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    if (i === 0) outline.moveTo(x,y); else outline.lineTo(x,y);
  }
  outline.closePath();
  const geometry = new ExtrudeGeometry(outline, { depth: .94, steps: 1, bevelEnabled: true, bevelThickness: .03, bevelSize: .018, bevelSegments: 1, curveSegments: 1 });
  geometry.center();
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  geometry.scale(1/(bounds.max.x-bounds.min.x),1/(bounds.max.y-bounds.min.y),1/(bounds.max.z-bounds.min.z));
  geometry.rotateX(-Math.PI/2);
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  // Merge only identical position/normal/UV tuples: preserve bevel and hard-edge seams.
  const indexed = mergeVertices(geometry, 1e-6);
  geometry.dispose();
  return indexed;
}
