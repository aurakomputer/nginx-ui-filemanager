<template>
  <k-page class="flex flex-col justify-center min-h-screen">
    <div class="w-full max-w-md mx-auto px-4 py-8">
      <div class="flex flex-col items-center text-center mb-6">
        <div class="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs">
          <img src="/src/assets/logo.webp" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Selamat Datang</h1>
        <p class="text-sm opacity-60 mt-1">Masuk ke akun Anda untuk melanjutkan aktivitas</p>
      </div>

      <form @submit.prevent="handleLogin">
        <k-list strong inset class="!my-2">
          <k-list-input label="Email atau Username" type="text" placeholder="Masukkan email atau username"
            :value="form.username" :error="errors.username" clear-button @input="onUsernameInput"
            @clear="form.username = ''" />

          <k-list-input label="Kata Sandi" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan kata sandi"
            :value="form.password" :error="errors.password" @input="onPasswordInput">
            <template #content>
              <button type="button" class="text-xs font-semibold text-primary px-2 py-1 active:opacity-60"
                @click="showPassword = !showPassword">
                {{ showPassword ? "Sembunyikan" : "Lihat" }}
              </button>
            </template>
          </k-list-input>
        </k-list>

        <div class="flex items-center justify-between px-4 my-3">
          <k-link class="text-xs font-semibold" @click="forgotSheetOpened = true">
            Lupa kata sandi?
          </k-link>
        </div>

        <k-block class="!mt-6 !mb-2">
          <k-button large rounded type="submit" :disabled="loading" class="font-semibold shadow-sm">
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <k-preloader size="w-5 h-5" />
              <span>Memproses...</span>
            </span>
            <span v-else>Masuk</span>
          </k-button>
        </k-block>
      </form>

      <div class="text-center mt-6">
        <span class="text-xs opacity-50">
          Pastikan perangkat terhubung internet saat login pertama kali
        </span>
      </div>
    </div>

    <k-sheet class="pb-safe" :opened="forgotSheetOpened" @backdropclick="forgotSheetOpened = false">
      <k-block>
        <p class="text-sm opacity-75 leading-relaxed">
          Jika Anda lupa kata sandi atau akun belum terdaftar, silakan hubungi operator atau
          administrator sekolah untuk melakukan reset kata sandi.
        </p>
        <k-button large rounded class="mt-4" @click="forgotSheetOpened = false">
          Mengerti
        </k-button>
      </k-block>
    </k-sheet>
  </k-page>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { kPage, kList, kListInput, kLink, kBlock, kButton, kPreloader, kSheet } from "konsta/vue";
import { api } from "../utils/api";
import toast from "src/utils/toast";

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginErrors {
  username: string;
  password: string;
}

interface ToastState {
  opened: boolean;
  message: string;
}

interface LoginResponse {
  token?: string;
  message?: string;
}

const router = useRouter();

const loading = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const forgotSheetOpened = ref<boolean>(false);

const form = reactive<LoginForm>({
  username: "",
  password: "",
  remember: true,
});

const errors = reactive<LoginErrors>({
  username: "",
  password: "",
});

const onUsernameInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  form.username = target.value;
};

const onPasswordInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  form.password = target.value;
};

const onRememberChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  form.remember = target.checked;
};

const validate = (): boolean => {
  errors.username = form.username.trim() ? "" : "Email atau username wajib diisi";
  errors.password = form.password ? "" : "Kata sandi wajib diisi";
  return !errors.username && !errors.password;
};

const handleLogin = async (): Promise<void> => {
  if (!validate()) return;

  loading.value = true;
  try {
    const response = await api.post<LoginResponse>("v1/login", {
      username: form.username,
      password: form.password,
      remember: form.remember,
    });

    if (!response.status) {
      toast.response(response);
    } else if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      await router.push({ name: "panel.dashboard" });
    }
  } finally {
    loading.value = false;
  }
};
</script>
