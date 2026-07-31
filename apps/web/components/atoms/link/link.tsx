import type { LinkProps } from "./link.types";

export function Link({
  variant = "default",
  external = false,
  className = "",
  rel,
  target,
  ...props
}: LinkProps) {
  const classes = ["link", `link-${variant}`, className]
    .filter(Boolean)
    .join(" ");
  const externalProps = external
    ? {
        target: target ?? "_blank",
        rel: rel ?? "noreferrer",
      }
    : { target, rel };

  return <a className={classes} {...externalProps} {...props} />;
}
