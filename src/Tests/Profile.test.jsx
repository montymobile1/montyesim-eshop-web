import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "./utils/test-utils";
import AuthLayout from "../components/layout/AuthLayout";
import Profile from "../pages/profile/Profile";
import { store } from "../redux/store";
import { SignIn } from "../redux/reducers/authReducer";

describe("Profile", () => {
  beforeEach(() => {
    // Set up Redux store state before each test
    store.dispatch(
      SignIn({
        user_info: {
          email: "test@example.com",
          first_name: "John",
          last_name: "Doe",
          msisdn: "+1234567890",
          should_notify: false,
          currency_code: "USD",
        },
        user_token: "test-token",
        access_token: "access-token",
        refresh_token: "refresh-token",
      })
    );

    // Set currency state directly (login_type and system_currency are set via fetchCurrencyInfo)
    // For tests, we'll rely on the default state which has login_type: "email"
  });

  it("renders page title", () => {
    render(
      <AuthLayout>
        <Profile />
      </AuthLayout>
    );

    expect(
      screen.getByRole("heading", { name: /profile.accountInformation/i })
    ).toBeInTheDocument();
  });

  it("renders all form labels", () => {
    render(
      <AuthLayout>
        <Profile />
      </AuthLayout>
    );

    // Check for labels (they use translation keys in the simple mock)
    expect(screen.getByText(/checkout.email/i)).toBeInTheDocument();
    expect(screen.getByText(/profile.firstName/i)).toBeInTheDocument();
    expect(screen.getByText(/profile.lastName/i)).toBeInTheDocument();
    expect(screen.getByText(/profile.phoneNumber/i)).toBeInTheDocument();
    expect(screen.getByText(/profile.defaultCurrency/i)).toBeInTheDocument();
    expect(
      screen.getByText(/profile.receiveUpdatesByEmail/i)
    ).toBeInTheDocument();
  });

  it("renders all form inputs", () => {
    render(
      <AuthLayout>
        <Profile />
      </AuthLayout>
    );

    // Check for input fields by their placeholders or labels
    const emailInput = screen.getByPlaceholderText(/checkout.enterEmail/i);
    expect(emailInput).toBeInTheDocument();

    const firstNameInput = screen.getByPlaceholderText(
      /profile.enterFirstName/i
    );
    expect(firstNameInput).toBeInTheDocument();

    const lastNameInput = screen.getByPlaceholderText(/profile.enterLastName/i);
    expect(lastNameInput).toBeInTheDocument();

    // Phone input might be rendered differently, check by label
    const phoneLabel = screen.getByText(/profile.phoneNumber/i);
    expect(phoneLabel).toBeInTheDocument();
  });

  it("renders form buttons", () => {
    render(
      <AuthLayout>
        <Profile />
      </AuthLayout>
    );

    // Check for Cancel and Save buttons
    expect(
      screen.getByRole("button", { name: /btn.cancel/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /btn.saveChanges/i })
    ).toBeInTheDocument();
  });
});
