import type { HTMLAttributes } from "react";

type TextVariant = "body" | "lead" | "small" | "label";
type TextElement = "p" | "span" | "div";

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement;
  variant?: TextVariant;
  accent?: boolean;
};

export function Text({
  as,
  variant = "body",
  accent = false,
  className = "",
  ...props
}: TextProps) {
  const Tag = as ?? "p";
  const variantClass = variant === "body" ? "text" : `text text-${variant}`;
  const classes = [
    variantClass,
    accent ? "text-accent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes} {...props} />;
}
