<template>
  <k-app theme="ios" safe-areas>
    <router-view />
    <k-toast position="center" :opened="toastStore.opened" class="z-50">
      <template #button>
        <k-button clear inline @click="toastStore.hide()">Tutup</k-button>
      </template>
      {{ toastStore.message }}
    </k-toast>
  </k-app>
</template>

<script setup lang="ts">
import { kApp, kToast, kButton } from "konsta/vue";
import { useToastStore } from "src/stores/toast-store";

const toastStore = useToastStore();
</script>
