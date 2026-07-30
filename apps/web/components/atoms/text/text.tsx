import type { TextProps } from "./text.types";

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
