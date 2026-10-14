import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import ProtectedRoute from "../routes/ProtectedRoute.jsx";
import authReducer from "../redux/slices/authSlice.js";

const renderWithAuthState = (authState, allowedRoles) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/protected" element={<div>Secret content</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedRoute", () => {
  it("redirects to /login when not authenticated", () => {
    renderWithAuthState(
      { user: null, isAuthenticated: false, loading: false },
      ["patient"]
    );
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("shows the protected content when authenticated with an allowed role", () => {
    renderWithAuthState(
      { user: { role: "patient" }, isAuthenticated: true, loading: false },
      ["patient"]
    );
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("redirects to /unauthorized when authenticated but role isn't allowed", () => {
    renderWithAuthState(
      { user: { role: "doctor" }, isAuthenticated: true, loading: false },
      ["patient"]
    );
    expect(screen.getByText("Unauthorized page")).toBeInTheDocument();
  });

  it("shows a loading state while the session is being restored", () => {
    renderWithAuthState(
      { user: null, isAuthenticated: false, loading: true },
      ["patient"]
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
