import { render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";
import { AppView } from "../types";
import { describe, it, expect, vi } from "vitest";
import React from "react";

describe("Sidebar", () => {
  const mockSetView = vi.fn();
  const mockOnSignOut = vi.fn();
  const mockOnSwitchToSignIn = vi.fn();

  const defaultProps = {
    currentView: AppView.DASHBOARD,
    setView: mockSetView,
    authUser: null,
    guestMode: true,
    onSignOut: mockOnSignOut,
    onSwitchToSignIn: mockOnSwitchToSignIn,
  };

  it("renders navigation buttons with aria-labels and titles for accessibility", () => {
    render(<Sidebar {...defaultProps} />);

    // Find the dashboard button. The text "Dashboard" is inside the button.
    // However, we specifically want to enforce aria-label and title attributes
    // because the text is hidden on mobile breakpoints.

    // We can find the button by its text content initially to verify it exists
    // But strict check for attributes is what we need.

    // There are many buttons, let's look for the one that calls setView with DASHBOARD
    // or just the first one which should be Dashboard.

    // The menu items in Sidebar.tsx start with Dashboard.
    const buttons = screen.getAllByRole("button");
    // Filter out the Sign In / Sign Out buttons at the bottom if any
    // The navigation buttons are the first ones.

    // Let's verify specifically for "Dashboard"
    // We can try to find by text "Dashboard" but that relies on the span content.
    // If we want to check attributes:

    // Note: getByText might find the span, but we want the button wrapping it.
    const dashboardText = screen.getByText("Dashboard");
    const dashboardButton = dashboardText.closest("button");

    expect(dashboardButton).toBeInTheDocument();

    // These assertions should fail currently
    expect(dashboardButton).toHaveAttribute("aria-label", "Dashboard");
    expect(dashboardButton).toHaveAttribute("title", "Dashboard");
  });
});
