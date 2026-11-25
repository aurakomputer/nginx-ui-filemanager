import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "./toast";
import { useAuthStore } from "../stores/auth-store";
import config from "../config";

interface ValidationErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const api: AxiosInstance = axios.create({
  baseURL: config.api_url,
  withCredentials: true,
  withXSRFToken: true,
});

api.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const authStore = useAuthStore();
    if (authStore.isLogin && authStore.token) {
      requestConfig.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return requestConfig;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log("reponse server", response);
    }
    return response.data;
  },
  (error: AxiosError<ValidationErrorResponse>): Promise<never> => {
    if (error.response) {
      if (import.meta.env.DEV) {
        console.log("error response", error.response);
      }

      if (error.response.status === 401) {
        toast.app_error("Kamu tidak mempunyai ijin untuk melakukan tindakan");
      } else if (error.response.status === 402) {
      } else if (error.response.status === 422 && error.response.data?.errors) {
        const firstEntry = Object.entries(error.response.data.errors)[0];
        if (firstEntry) {
          const [key, value] = firstEntry;
          for (const item of value) {
            if (import.meta.env.DEV) {
              console.log(`terdapat kesalahan validasi pada key : ${key}`);
            }
            toast.app_error(`${item}`);
            break;
          }
        }
      } else {
        toast.app_error("" + error);
        toast.error("Tejadi kesalahan System Silahkan Lapor Ke pihak Administrator", 2000);
      }
    } else if (error.request) {
      toast.app_error("" + error);
      if (import.meta.env.DEV) {
        console.log(error.request);
      }
    } else {
      toast.app_error("" + error);
    }

    return Promise.reject(error);
  },
);

export { api };
export default api;
