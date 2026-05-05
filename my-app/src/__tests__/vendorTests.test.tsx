// vendorTests.test.tsx
// Test for vendor/auth feature: sign-in validation

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/theme";

// Mock next/router
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    query: {},
    isReady: true,
    pathname: "/signin",
  }),
}));

// Mock next/link so <Link> just renders a plain <a> tag
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Import the sign-in page 
import Signin from "@/pages/signin";

// Helper function which wraps component in ChakraProvider
function renderWithChakra(ui: React.ReactElement) {
}

// TEST: Sign-in validation
// Part A: Enter an invalid email to verify error message appears
// Part B: Enter valid credentials to verify successful login redirect

describe("Sign-in page - validation and login", () => {
  // Clear mocks and localStorage before each test
  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  test("shows error message when email format is invalid", () => {
    renderWithChakra(<Signin />);

    // Type an invalid email (missing @ symbol)
    const emailInput = screen.getByPlaceholderText("Please enter your email address");
    fireEvent.change(emailInput, { target: { value: "notanemail" } });

    // Type any password so we only test the email error
    const passwordInput = screen.getByPlaceholderText("Please enter your password");
    fireEvent.change(passwordInput, { target: { value: "Password/101" } });

    // Click the Sign In button (second one - first is in the navbar)
    const signInButtons = screen.getAllByRole("button", { name: /sign in/i });
    fireEvent.click(signInButtons[1]); // [0] = navbar, [1] = form button

    // The validation function returns "Incorrect email format" for bad emails
    expect(screen.getByText("Incorrect email format")).toBeInTheDocument();
  });

  test("shows success message and redirects when valid credentials are entered", async () => {
    renderWithChakra(<Signin />);

    // Use a real user from dummyData: Taylor Swift
    const emailInput = screen.getByPlaceholderText("Please enter your email address");
    fireEvent.change(emailInput, { target: { value: "taylorswift@gmail.com" } });

    const passwordInput = screen.getByPlaceholderText("Please enter your password");
    fireEvent.change(passwordInput, { target: { value: "Password/101" } });

    // Click the Sign In button (second one - first is in the navbar)
    const signInButtons = screen.getAllByRole("button", { name: /sign in/i });
    fireEvent.click(signInButtons[1]); // [0] = navbar, [1] = form button

    // After successful login, the page shows "Sign in successful"
    expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();

    // The user should be saved to localStorage
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    expect(savedUser.email).toBe("taylorswift@gmail.com");

    // After 2 seconds, router.push should redirect to hirer dashboard
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/hirer/dashboard");
      },
      { timeout: 3000 } // wait up to 3 seconds for the 2-second setTimeout
    );
  });
});
