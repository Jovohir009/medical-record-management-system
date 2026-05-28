import { AuthUser, UserRole } from "../types/domain";
import { apiRequest, setAuthToken } from "./apiClient";

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: UserRole;
  };
}

export function toAuthUser(user: LoginResponse["user"]): AuthUser {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    initials: user.full_name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
  };
}

export async function loginRequest(
  email: string,
  password: string,
  remember: boolean,
): Promise<AuthUser> {
  const result = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  setAuthToken(result.token, remember);
  return toAuthUser(result.user);
}

export async function getCurrentUserRequest(): Promise<AuthUser> {
  const result = await apiRequest<{ user: LoginResponse["user"] }>("/auth/me");
  return toAuthUser(result.user);
}
