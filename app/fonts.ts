import localFont from "next/font/local";

export const saboFilled = localFont({
  src: "./fonts/Sabo-Filled.woff2",
  variable: "--font-sabo-filled",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["monospace"],
});

export const saboOutline = localFont({
  src: "./fonts/Sabo-Regular.woff2",
  variable: "--font-sabo-outline",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["monospace"],
  preload: false,
});

// Opt-in companion text face. Apply only to the text Jacob selects.
export const pressStart2P = localFont({
  src: "./fonts/press-start-2p/PressStart2P-Regular.woff2",
  variable: "--font-press-start-2p",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["monospace"],
  preload: false,
});
