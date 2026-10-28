import { Quaternion, Vector3 } from "three";
export const EARTH_AXIAL_TILT = 23.44 * Math.PI / 180;
export const EARTH_IDLE_SPEED = 0.035;
/** Drag in camera-space axes so horizontal and vertical movement remain intuitive. */
export function applyEarthDrag(orientation, dx, dy, cameraOrientation) {
  const up = new Vector3(0, 1, 0).applyQuaternion(cameraOrientation);
  const right = new Vector3(1, 0, 0).applyQuaternion(cameraOrientation);
  const yaw = new Quaternion().setFromAxisAngle(up, dx * 0.005);
  const pitch = new Quaternion().setFromAxisAngle(right, dy * 0.005);
  orientation.premultiply(yaw).premultiply(pitch).normalize();
  return orientation;
}
