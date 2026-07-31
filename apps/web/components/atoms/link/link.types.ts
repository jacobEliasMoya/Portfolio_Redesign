import type { AnchorHTMLAttributes } from "react";

export type LinkVariant = "default" | "accent" | "muted";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: LinkVariant;
  external?: boolean;
};
