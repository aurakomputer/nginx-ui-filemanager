<template>
  <k-page class="pb-6">
    <k-navbar :title="pageTitle" :subtitle="pageSubtitle">
      <template v-if="!isDashboard" #left>
        <k-navbar-back-link text="Kembali" @click="goBack" />
      </template>
    </k-navbar>

    <router-view />
  </k-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { kPage, kNavbar, kNavbarBackLink, kLink } from "konsta/vue";
import { ArrowPathIcon, SignalIcon, SignalSlashIcon } from "@heroicons/vue/24/outline";
import { useDatabaseStore } from "src/stores/database-store";
import { toast } from "src/utils/toast";

interface Props {
  title?: string;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  subtitle: "",
});

const route = useRoute();
const router = useRouter();
const databaseStore = useDatabaseStore();

const isDashboard = computed<boolean>(() => route.name === "panel.dashboard");

const pageTitle = computed<string>(() => {
  if (props.title) return props.title;
  if (typeof route.meta?.title === "string") return route.meta.title;
  return "SekolahKU";
});

const pageSubtitle = computed<string>(() => {
  if (props.subtitle) return props.subtitle;
  if (typeof route.meta?.subtitle === "string") return route.meta.subtitle;
  return "";
});

const goBack = (): void => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: "panel.dashboard" });
  }
};
</script>
