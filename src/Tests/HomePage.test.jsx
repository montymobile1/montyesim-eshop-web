import { describe, it, expect } from "vitest";
import Home from "../pages/home/Home";
import { render, screen } from "./utils/test-utils";
import MainLayout from "../components/layout/MainLayout";

describe("Home Page", () => {
  it("renders page element", () => {
    render(
      <MainLayout>
        <Home />
      </MainLayout>
    );
    const plansLink = screen.getByRole("link", {
      name: "btn.view_all_plans",
    });
    expect(
      screen.getByRole("heading", {
        name: "home.stayConnected home.whileTraveling",
        level: 1,
      })
    ).toBeInTheDocument();

    expect(plansLink).toBeInTheDocument();
    expect(plansLink).toHaveAttribute("href", "/plans");
  });
  it("renders footer elements", () => {
    render(
      <MainLayout>
        <Home />
      </MainLayout>
    );

    // Check footer links
    const privacyLink = screen.getByRole("link", {
      name: "footer.privacyPolicy",
    });
    const termsLink = screen.getByRole("link", {
      name: "footer.termsAndConditions",
    });
    const contactLink = screen.getByRole("link", {
      name: "footer.contactUs",
    });

    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");

    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "/terms");

    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "/contact-us");

    // Check copyright text
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear}`, "i"))
    ).toBeInTheDocument();
  });
});
