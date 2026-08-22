import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders an empty page shell while the design is being finalized", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeEmptyDOMElement();
  });
});
