import { render, screen } from "@testing-library/react";

import { Text } from "./text";

describe("Text", () => {
  it("renders a paragraph with body styles by default", () => {
    render(<Text>Designed to perform.</Text>);

    const text = screen.getByText("Designed to perform.");

    expect(text.tagName).toBe("P");
    expect(text).toHaveClass("text");
  });

  it("supports another semantic element and text variant", () => {
    render(
      <Text as="span" variant="label">
        Digital by design
      </Text>,
    );

    const text = screen.getByText("Digital by design");

    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveClass("text", "text-label");
  });

  it("forwards native attributes and custom classes", () => {
    render(
      <Text accent className="intro-copy" data-testid="intro">
        Thoughtful experiences
      </Text>,
    );

    expect(screen.getByTestId("intro")).toHaveClass(
      "text-accent",
      "intro-copy",
    );
  });
});
