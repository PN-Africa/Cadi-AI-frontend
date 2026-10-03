import { axiosPrivate } from "../lib/axios";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const res = await axiosPrivate.post(`/auth/forgot-password`, payload);
  return res.data;
};