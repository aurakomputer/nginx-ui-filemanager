import type { ResponseData } from "src/types";
import { useToastStore } from "../stores/toast-store";

export const toast = {
  show: (
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    duration = 3000,
  ): void => {
    useToastStore().show(message, type, duration);
  },
  hide: (): void => {
    useToastStore().hide();
  },
  info: (message: string, duration = 3000): void => {
    useToastStore().info(message, duration);
  },
  success: (message: string, duration = 3000): void => {
    useToastStore().success(message, duration);
  },
  warning: (message: string, duration = 3000): void => {
    useToastStore().warning(message, duration);
  },
  error: (message: string, duration = 3000): void => {
    useToastStore().error(message, duration);
  },
  app_error: (message: string, duration = 3500): void => {
    useToastStore().app_error(message, duration);
  },

  response: (responseData: any): void => {
    if (responseData.status) {
      useToastStore().success(responseData.message);
    } else {
      useToastStore().error(responseData.message);
    }
  },
};

export default toast;
