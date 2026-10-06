import { axiosPrivate } from "../lib/axios";

export interface AdminVerifyPayload {
  token: string;
}

export interface AdminVerifyResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const verifyAdminMagicLink = async (
  payload: AdminVerifyPayload
): Promise<AdminVerifyResponse> => {
  const res = await axiosPrivate.post(`/admin/auth/verify-access`, payload);
  return res.data;
};