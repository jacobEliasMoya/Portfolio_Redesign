import { render, screen } from "@testing-library/react";

import { Link } from "./link";

describe("Link", () => {
  it("renders a default link", () => {
    render(<Link href="/work">Selected work</Link>);

    expect(screen.getByRole("link", { name: "Selected work" })).toHaveClass(
      "link",
      "link-default",
    );
  });

  it("supports variants and custom classes", () => {
    render(
      <Link href="/about" variant="muted" className="footer-link">
        About
      </Link>,
    );

    expect(screen.getByRole("link")).toHaveClass(
      "link-muted",
      "footer-link",
    );
  });

  it("adds safe defaults to external links", () => {
    render(
      <Link href="https://example.com" external>
        External project
      </Link>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noreferrer");
  });
});
