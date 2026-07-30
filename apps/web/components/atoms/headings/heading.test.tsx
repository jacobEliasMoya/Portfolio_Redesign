import { render, screen } from "@testing-library/react";

import { Heading } from "./heading";

describe("Heading", () => {
  it("renders an h2 by default", () => {
    render(<Heading>Selected work</Heading>);

    expect(
      screen.getByRole("heading", { level: 2, name: "Selected work" }),
    ).toHaveClass("heading", "heading-h2");
  });

  it("renders the requested semantic heading level", () => {
    render(<Heading level={1}>Jacob Moya</Heading>);

    expect(
      screen.getByRole("heading", { level: 1, name: "Jacob Moya" }),
    ).toBeInTheDocument();
  });

  it("combines accent and caller-provided classes", () => {
    render(
      <Heading level={3} accent className="hero-title">
        Real impact
      </Heading>,
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveClass(
      "heading-h3",
      "text-accent",
      "hero-title",
    );
  });
});
