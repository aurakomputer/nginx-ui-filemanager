import { defineStore, acceptHMRUpdate } from "pinia";
import { api } from "../utils/api";
import { toast } from "../utils/toast";

export interface AuthUser {
  id: number | string;
  name: string;
  username?: string;
  email?: string;
  [key: string]: unknown;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginApiResponse {
  status: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: AuthUser;
  };
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isLogin: (state): boolean => state.token !== null,
  },

  actions: {
    async login({
      username,
      password,
    }: LoginCredentials): Promise<LoginApiResponse> {
      const response = (await api.post("v1/login", {
        username,
        password,
        device_name: "SekolahKU PWA",
      })) as unknown as LoginApiResponse;

      if (response.status === true && response.data?.token) {
        this.token = response.data.token;
        this.user = response.data.user ?? null;
      }

      if (response.message) {
        if (response.status) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      }

      return response;
    },

    logout(): boolean {
      this.token = null;
      this.user = null;

      return true;
    },
  },

  persist: true,
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
