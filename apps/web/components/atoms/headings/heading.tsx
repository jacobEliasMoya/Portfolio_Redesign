import type { ComponentPropsWithoutRef } from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  level?: HeadingLevel;
  accent?: boolean;
};

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
