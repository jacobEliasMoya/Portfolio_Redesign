export const ZOOM_LIMITS = Object.freeze({ min: -0.55, max: 0.7 });
export const clampZoom = (value) => Math.max(ZOOM_LIMITS.min, Math.min(ZOOM_LIMITS.max, value));
/** Dolly about Earth at z=-9, keeping the camera safely outside its terrain. */
export const zoomCameraZ = (baseZ, logZoom) => -9 + (baseZ + 9) * Math.exp(clampZoom(logZoom));
