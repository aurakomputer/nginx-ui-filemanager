<template>
  <div class="max-w-3xl mx-auto px-4 pt-4 pb-8 space-y-5">
    <div
      class="rounded-3xl bg-gradient-to-br from-primary to-blue-700 text-white p-5 shadow-sm relative overflow-hidden">
      <div class="flex items-center justify-between gap-4 relative z-10">
        <div class="min-w-0">
          <p class="text-xs text-white/80 font-medium">Assalamu'alaikum,</p>
          <h2 class="text-lg font-bold tracking-tight truncate mt-0.5">
            {{ authStore.user?.name || "Pengajar" }}
          </h2>
          <p class="text-xs text-white/75 mt-1 flex items-center gap-1.5">
            <ClockIcon class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">
              Sinkron: {{ databaseStore.lastSync || "Belum pernah sinkron" }}
            </span>
          </p>
        </div>

        <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
          <AcademicCapIcon class="w-7 h-7 text-white" />
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 pr-1">
          <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" :class="isOnline ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
            ">
            <SignalIcon v-if="isOnline" class="w-3.5 h-3.5" />
            <SignalSlashIcon v-else class="w-3.5 h-3.5" />
            <span>{{ isOnline ? "Online" : "Offline" }}</span>
          </span>
        </div>
        <button type="button" :disabled="databaseStore.loading"
          class="inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-primary px-3 py-1.5 rounded-xl active:opacity-80 disabled:opacity-60"
          @click="syncAllData">
          <ArrowPathIcon class="w-3.5 h-3.5" :class="{ 'animate-spin': databaseStore.loading }" />
          <span>{{ databaseStore.loading ? "Proses..." : "Sinkronkan" }}</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <DashboardCard caption="Total Kelas" :value="databaseStore.schoolClasses.length" sub-caption="Rombel aktif"
        :icon="BuildingLibraryIcon" color-scheme="primary" />

      <DashboardCard caption="Total Santri" :value="databaseStore.students.length" sub-caption="Santri terdaftar"
        :icon="UserGroupIcon" color-scheme="emerald" />

      <DashboardCard caption="Data Absensi" :value="databaseStore.attendances.length" sub-caption="Tersimpan lokal"
        :icon="ClipboardDocumentCheckIcon" color-scheme="amber" />

      <DashboardCard caption="Materi & Jam" :value="databaseStore.learningHours.length"
        sub-caption="`${databaseStore.learningSubjects.length} jurnal materi`" :icon="BookOpenIcon"
        color-scheme="purple" />
    </div>

    <div>
      <div class="flex items-center justify-between px-1 mb-2">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Menu Utama</h3>
      </div>

      <k-list strong class="!my-0 rounded-3xl">
        <k-list-item link title="Input Absensi Santri" subtitle="Catat kehadiran santri per kelas & jam pelajaran"
          @click="goTo('panel.attendance')">
          <template #media>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ClipboardDocumentCheckIcon class="w-5 h-5" />
            </div>
          </template>
        </k-list-item>

        <k-list-item link title="Jurnal Materi Pembelajaran" subtitle="Isi catatan materi & pokok bahasan mengajar"
          @click="goTo('panel.subjects')">
          <template #media>
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <BookOpenIcon class="w-5 h-5" />
            </div>
          </template>
        </k-list-item>

        <k-list-item link title="Direktori Data Santri" subtitle="Lihat daftar santri berdasarkan kelas"
          @click="goTo('panel.students')">
          <template #media>
            <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <UsersIcon class="w-5 h-5" />
            </div>
          </template>
        </k-list-item>

        <k-list-item link title="Profil & Pengaturan Akun" subtitle="Informasi pengajar dan keluar aplikasi"
          @click="goTo('panel.profile')">
          <template #media>
            <div class="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
              <UserCircleIcon class="w-5 h-5" />
            </div>
          </template>
        </k-list-item>
      </k-list>
    </div>

    <div>
      <div class="flex items-center justify-between px-1 mb-2">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Daftar Kelas</h3>
        <span class="text-xs text-slate-500"> {{ databaseStore.schoolClasses.length }} Kelas </span>
      </div>

      <k-list v-if="databaseStore.schoolClasses.length > 0" class="!my-0">
        <k-list-item v-for="schoolClass in databaseStore.schoolClasses" :key="schoolClass.id" link
          :title="schoolClass.name" :after="`${schoolClass.students?.length || 0} Santri`"
          @click="openClassAttendance(schoolClass.id)">
          <template #media>
            <div
              class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {{ getInitials(schoolClass.name) }}
            </div>
          </template>
        </k-list-item>
      </k-list>

      <k-block v-else strong class="!my-0 text-center py-8 rounded-3xl">
        <FolderOpenIcon class="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Belum ada data kelas</p>
        <p class="text-xs text-slate-400 mt-1 mb-4">
          Tekan tombol sinkronisasi untuk mengunduh data kelas dan santri dari server.
        </p>
        <k-button rounded inline :disabled="databaseStore.loading" @click="syncAllData">
          Unduh Data Sekarang
        </k-button>
      </k-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { kList, kListItem, kBlock, kButton } from "konsta/vue";
import {
  AcademicCapIcon,
  ArrowPathIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  FolderOpenIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/vue/24/outline";
import DashboardCard from "src/components/DashboardCard.vue";
import { useAuthStore } from "src/stores/auth-store";
import { useDatabaseStore } from "src/stores/database-store";
import { toast } from "src/utils/toast";

const router = useRouter();
const authStore = useAuthStore();
const databaseStore = useDatabaseStore();

const isOnline = ref<boolean>(navigator.onLine);

const updateOnlineStatus = (): void => {
  isOnline.value = navigator.onLine;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const syncAllData = async (): Promise<void> => {
  if (!navigator.onLine) {
    toast.warning("Tidak ada koneksi internet untuk menyinkronkan data");
    return;
  }
  await databaseStore.sync(true);
  toast.success("Sinkronisasi data selesai");
};

const goTo = (routeName: string): void => {
  router.push({ name: routeName });
};

const openClassAttendance = (classId: number | string): void => {
  router.push({
    name: "panel.attendance",
    query: { class_id: String(classId) },
  });
};

onMounted(async () => {
  if (!databaseStore.lastSync && navigator.onLine) {
    await databaseStore.sync(true);
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
});

const handleSync = async (): Promise<void> => {
  if (!isOnline.value) {
    toast.warning("Perangkat sedang offline. Sinkronisasi membutuhkan koneksi internet.");
    return;
  }
  if (databaseStore.loading) return;

  await databaseStore.sync(true);
  toast.success("Data berhasil disinkronkan");
};
onUnmounted(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});
</script>
