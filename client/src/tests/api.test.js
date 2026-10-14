import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "../services/api.js";

describe("API authentication interceptor", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it("preserves login errors instead of trying to refresh without a cookie", async () => {
    const refreshRequest = vi.spyOn(axios, "post");
    const loginError = {
      response: {
        status: 401,
        data: { message: "Invalid email or password" },
      },
    };

    api.defaults.adapter = async (config) => {
      loginError.config = config;
      loginError.response.config = config;
      throw loginError;
    };

    await expect(api.post("/auth/login", {})).rejects.toBe(loginError);
    expect(refreshRequest).not.toHaveBeenCalled();
  });
});
