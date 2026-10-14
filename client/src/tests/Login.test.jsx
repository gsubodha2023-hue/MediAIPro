import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Login from "../pages/auth/Login.jsx";
import authReducer from "../redux/slices/authSlice.js";

// Mock the API-calling service so tests never make real network requests
vi.mock("../services/authService.js", () => ({
  loginUser: vi.fn(),
}));
import { loginUser } from "../services/authService.js";

const renderLogin = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );
};

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields and a submit button", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    // Should not have called the API if validation failed
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("calls loginUser with the entered credentials on valid submit", async () => {
    loginUser.mockResolvedValueOnce({
      data: {
        accessToken: "fake-token",
        user: { id: "1", name: "Jane", email: "jane@example.com", role: "patient" },
      },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "password123",
      });
    });
  });
});
