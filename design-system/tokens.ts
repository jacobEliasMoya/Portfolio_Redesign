/** Colors are shared by HTML and Three.js. World units are separate from CSS units. */
export const tokens = {
  color: { background: "#000000", surface: "#11151d", foreground: "#edf0f4", muted: "#9da6b4", accent: "#bdffc9", metal: "#b8c1ce", edge: "#293240" },
  space: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2.5rem" },
  motion: { uiSeconds: 0.2, damping: 8, hoverLift: 0.35 },
  scene: { dpr: [1, 1.5] as [number, number], camera: [6, 5, 7] as [number, number, number] },
} as const;
