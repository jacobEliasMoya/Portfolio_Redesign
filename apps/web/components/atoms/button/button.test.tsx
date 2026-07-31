import { render, screen } from "@testing-library/react";

import { Button } from "./button";

describe("Button", () => {
  it("renders a primary, medium button by default", () => {
    render(<Button>View project</Button>);

    expect(screen.getByRole("button", { name: "View project" })).toHaveClass(
      "button",
      "button-primary",
      "button-medium",
    );
  });

  it("supports variants, sizes, and custom classes", () => {
    render(
      <Button variant="secondary" size="large" className="hero-action">
        Get in touch
      </Button>,
    );

    expect(screen.getByRole("button")).toHaveClass(
      "button-secondary",
      "button-large",
      "hero-action",
    );
  });

  it("defaults to type button and forwards native attributes", () => {
    render(<Button disabled>Unavailable</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
