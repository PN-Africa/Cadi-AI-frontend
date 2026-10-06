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