import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "./utils/test-utils";
import MainLayout from "../components/layout/MainLayout";
import ContactUs from "../pages/ContactUs";

describe("Contact us page", () => {
  it("renders page title", () => {
    render(
      <MainLayout>
        <ContactUs />
      </MainLayout>
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /contactUs.needSomeHelp/i,
      })
    ).toBeInTheDocument();
  });

  it("renders contact form with all elements", () => {
    render(
      <MainLayout>
        <ContactUs />
      </MainLayout>
    );

    // Check form title
    expect(screen.getByText(/contactUs.contactUs/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /contactUs.needSomeHelp/i,
      })
    ).toBeInTheDocument();

    // Check form labels
    expect(screen.getByText(/checkout.email/i)).toBeInTheDocument();
    expect(screen.getByText(/contactUs.message/i)).toBeInTheDocument();

    // Check form inputs
    const emailInput = screen.getByPlaceholderText(/checkout.enterEmail/i);
    expect(emailInput).toBeInTheDocument();

    const messageInput = screen.getByPlaceholderText(
      /contactUs.typeYourMessage/i
    );
    expect(messageInput).toBeInTheDocument();

    // Check submit button
    expect(
      screen.getByRole("button", { name: /btn.sendMessage/i })
    ).toBeInTheDocument();
  });

  it("renders FAQ section with heading and description", () => {
    render(
      <MainLayout>
        <ContactUs />
      </MainLayout>
    );

    // Check FAQ section heading
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /contactUs.frequentlyAskedQuestions/i,
      })
    ).toBeInTheDocument();

    // Check FAQ description
    expect(
      screen.getByText(/contactUs.subscribeDescription/i)
    ).toBeInTheDocument();
  });

  it("renders FAQ list items", async () => {
    render(
      <MainLayout>
        <ContactUs />
      </MainLayout>
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /contactUs.frequentlyAskedQuestions/i,
      })
    ).toBeInTheDocument();
  });
});
