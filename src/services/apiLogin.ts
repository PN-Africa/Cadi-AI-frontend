import { axiosPrivate } from "../lib/axios";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await axiosPrivate.post(`/auth/login`, payload);
  return res.data;
};