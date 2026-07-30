import type { ComponentPropsWithoutRef } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  level?: HeadingLevel;
  accent?: boolean;
};
