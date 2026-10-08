import { axiosPrivate } from "../lib/axios";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  userId: string;
  role: string;
  accessToken: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await axiosPrivate.post(`/auth/login`, payload);
  return res.data;
};