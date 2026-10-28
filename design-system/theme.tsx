import type { CSSProperties, ReactNode } from "react";
import { tokens } from "./tokens";
export function Theme({ children }: { children: ReactNode }) {
  const properties = {
    ...Object.fromEntries(Object.entries(tokens.color).map(([key, value]) => [`--color-${key}`, value])),
    ...Object.fromEntries(Object.entries(tokens.space).map(([key, value]) => [`--space-${key}`, value])),
    "--motion-ui": `${tokens.motion.uiSeconds}s`,
  } as CSSProperties;
  return <div className="app-theme" style={properties}>{children}</div>;
}
