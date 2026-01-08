import { describe, it, expect } from "vitest";
import Home from "../pages/home/Home";
import { render, screen } from "./utils/test-utils";

describe("Home Page", () => {
  it("renders page element", () => {
    render(<Home />);
    const plansLink = screen.getByRole("link", {
      name: /view all plans/i,
    });
    expect(
      screen.getByRole("heading", {
        name: /Stay Connected While Traveling/i,
      })
    ).toBeInTheDocument();

    expect(plansLink).toBeInTheDocument();
    expect(plansLink).toHaveAttribute("href", "/plans");
  });
});
