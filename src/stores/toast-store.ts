import { defineStore, acceptHMRUpdate } from "pinia";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastState {
  opened: boolean;
  message: string;
  type: ToastType;
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = defineStore("toast", {
  state: (): ToastState => ({
    opened: false,
    message: "",
    type: "info",
  }),

  actions: {
    show(message: string, type: ToastType = "info", duration = 3000): void {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      this.message = message;
      this.type = type;
      this.opened = true;

      timeoutId = setTimeout(() => {
        this.opened = false;
        timeoutId = null;
      }, duration);
    },

    hide(): void {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      this.opened = false;
    },

    info(message: string, duration = 3000): void {
      this.show(message, "info", duration);
    },

    success(message: string, duration = 3000): void {
      this.show(message, "success", duration);
    },

    warning(message: string, duration = 3000): void {
      this.show(message, "warning", duration);
    },

    error(message: string, duration = 3000): void {
      this.show(message, "error", duration);
    },

    app_error(message: string, duration = 3500): void {
      this.show(message, "error", duration);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot));
}
