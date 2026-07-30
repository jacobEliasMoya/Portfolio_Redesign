import type { HTMLAttributes } from "react";

export type TextVariant = "body" | "lead" | "small" | "label";
export type TextElement = "p" | "span" | "div";

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement;
  variant?: TextVariant;
  accent?: boolean;
};
