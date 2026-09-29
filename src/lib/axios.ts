import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../auth/auth";

const BASE_URL = import.meta.env.VITE_API_BASE;

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

const handleResponse = (response: AxiosResponse) => {
  return response;
};

const handleError = (error: AxiosError) => {
  const errCode = error.response?.status || error.code;

  switch (errCode) {
    case "ERR_NETWORK":
      toast.error("Unable to connect");
      break;
  }

  return Promise.reject(error);
};

axiosPrivate.interceptors.response.use(handleResponse, handleError);