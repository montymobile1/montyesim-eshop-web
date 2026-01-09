import { describe, it, expect } from "vitest";

import HowItWorks from "../pages/HowItWorks";
import { render, screen } from "./utils/test-utils";
import MainLayout from "../components/layout/MainLayout";

describe("How it works", () => {
  it("renders page title", () => {
    render(
      <MainLayout>
        <HowItWorks />
      </MainLayout>
    );

    expect(
      screen.getByRole("heading", {
        name: /howItWorks.howToSetUpMontyEsim/i,
      })
    ).toBeInTheDocument();
  });

  it("renders iOS and Android text", () => {
    render(
      <MainLayout>
        <HowItWorks />
      </MainLayout>
    );

    // Check for iOS text
    expect(screen.getByText(/iOS/i)).toBeInTheDocument();

    // Check for Android text
    expect(screen.getByText(/Android/i)).toBeInTheDocument();
  });

  it("swiper is functional - renders swiper component", () => {
    render(
      <MainLayout>
        <HowItWorks />
      </MainLayout>
    );

    // Check that swiper is rendered
    const swiper = screen.getByTestId("swiper");
    expect(swiper).toBeInTheDocument();

    // Check that swiper slides are rendered
    const slides = screen.getAllByTestId("swiper-slide");
    expect(slides.length).toBeGreaterThan(0);

    // Check for navigation buttons (prev/next) - they are button elements with SVG icons
    const allButtons = screen.getAllByRole("button");
    
    // Find buttons that contain SVG icons (navigation buttons)
    const buttonsWithIcons = allButtons.filter((btn) => {
      const svg = btn.querySelector('svg');
      return svg !== null;
    });

    // We should have at least 2 navigation buttons (prev and next)
    expect(buttonsWithIcons.length).toBeGreaterThanOrEqual(2);
  });
});
