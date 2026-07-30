import type { HeadingProps } from "./heading.types";

export function Heading({
  level = 2,
  accent = false,
  className = "",
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as const;
  const classes = [
    "heading",
    `heading-h${level}`,
    accent ? "text-accent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes} {...props} />;
}
