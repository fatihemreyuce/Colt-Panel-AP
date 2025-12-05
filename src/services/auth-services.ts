import type { LoginRequest, LoginResponse } from "@/types/auth.types";
import { fetchClient } from "../utils/fetch-client";

export const login = async (request: LoginRequest) => {
  return await fetchClient<LoginRequest, LoginResponse>("/auth/login", {
    method: "POST",
    body: request,
  });
};

export const logout = async () => {
  return await fetchClient("/auth/logout", {
    method: "POST",
  });
};

