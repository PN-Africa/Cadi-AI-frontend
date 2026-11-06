import { axiosPrivate } from "../lib/axios";

export interface AdminLoginPayload {
  email: string;
}

export interface AdminLoginResponse {
  message: string;
}

export const requestAdminMagicLink = async (
  payload: AdminLoginPayload
): Promise<AdminLoginResponse> => {
  const res = await axiosPrivate.post(`/auth/admin/login`, payload);
  return res.data;
};

export interface AdminSignInPayload {
  email: string;
  password: string;
}

export interface AdminSession {
  token: string;
  user: {
    email: string;
    name?: string;
    role: string;
  };
}

export const signInAdmin = async (payload: AdminSignInPayload): Promise<AdminSession> => {
  const res = await axiosPrivate.post(`/auth/admin/login`, payload);
  const data = res.data ?? {};

  const token: string = data.token ?? data.accessToken ?? data.access_token ?? "";
  if (!token) {
    throw new Error("The admin sign-in response did not include a token.");
  }

  const admin = data.admin ?? {};

  return {
    token,
    user: {
      email: admin.email ?? payload.email,
      name: admin.name ?? data.name ?? undefined,
      role: admin.role ?? data.role ?? "ADMIN",
    },
  };
};