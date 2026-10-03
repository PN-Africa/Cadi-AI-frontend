import { axiosPrivate } from "../lib/axios";

export interface SignUpPayload {
  role: "CAREGIVER" | "HEALTHCARE_PROFESSIONAL" | string;
  email: string;
  phone: string;
  medicalLicenseId: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const signUp = async (payload: SignUpPayload): Promise<SignUpResponse> => {
  const res = await axiosPrivate.post(`/auth/signup`, payload);
  return res.data;
};