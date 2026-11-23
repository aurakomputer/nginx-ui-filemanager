<template>
  <div class="fm-container">
    <!-- Breadcrumb -->
    <Breadcrumb class="fm-breadcrumb">
      <BreadcrumbItem @click="goTo('/')">/</BreadcrumbItem>
      <BreadcrumbItem
        v-for="(seg, i) in pathSegments"
        :key="i"
        @click="goTo(seg.path)"
      >
        {{ seg.name }}
      </BreadcrumbItem>
    </Breadcrumb>

    <!-- Toolbar -->
    <div class="fm-toolbar">
      <Upload :customRequest="handleUpload" :showUploadList="false">
        <Button type="primary">
          <template #icon>
            <UploadOutlined />
          </template>
          {{ $t("Unggah File") }}
        </Button>
      </Upload>
      <Button @click="loadFiles">
        <template #icon>
          <ReloadOutlined />
        </template>
        {{ $t("Refresh") }}
      </Button>
    </div>

    <!-- Tabel file -->
    <Table
      :dataSource="files"
      :columns="columns"
      rowKey="name"
      :pagination="false"
      size="small"
      :loading="loading"
      class="fm-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span
            :class="['fm-entry', record.is_dir ? 'fm-folder' : 'fm-file']"
            @click="record.is_dir ? enterDirectory(record.name) : null"
          >
            <FolderOutlined v-if="record.is_dir" class="fm-icon" />
            <FileOutlined v-else class="fm-icon" />
            {{ record.name }}
          </span>
        </template>
        <template v-if="column.key === 'action'">
          <Button danger size="small" @click="handleDelete(record)">
            {{ $t("Hapus") }}
          </Button>
        </template>
      </template>
    </Table>

    <div v-if="hasLoadError" class="fm-error">
      {{ $t("Gagal memuat daftar file. Periksa log plugin.") }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { Button, Table, Upload, Breadcrumb, BreadcrumbItem } =
  window.NginxUI.shared.antdvNext;
const { FolderOutlined, FileOutlined, UploadOutlined, ReloadOutlined } =
  window.NginxUI.shared.antdvIcons;
const { computed, onMounted, ref } = window.NginxUI.shared.vue;

import { useShared } from "@nginxui/plugin-sdk";

interface FileEntry {
  name: string;
  is_dir: boolean;
}

interface FileListResponse {
  path: string;
  items: FileEntry[];
}

interface GettextLike {
  $gettext: (msgid: string) => string;
}

const shared = useShared();
const http = shared.http;
const gettext = shared.gettext as GettextLike;
function $t(msgid: string): string {
  return gettext.$gettext(msgid);
}

// http belum punya baseURL ke endpoint plugin, jadi bangun base path manual.
const PLUGIN_ID = "io.github.aurakomputer.filemanager";
const API_BASE = `/plugins/${PLUGIN_ID}/http`;

const files = ref<FileEntry[]>([]);
const currentPath = ref("/");
const loading = ref(false);
const hasLoadError = ref(false);

const columns = [
  { title: $t("Nama"), dataIndex: "name", key: "name" },
  { title: $t("Aksi"), key: "action", width: 120 },
];

const pathSegments = computed(() => {
  if (currentPath.value === "/") return [];
  const parts = currentPath.value.split("/").filter(Boolean);
  return parts.map((name, i) => ({
    name,
    path: "/" + parts.slice(0, i + 1).join("/"),
  }));
});

async function loadFiles() {
  loading.value = true;
  hasLoadError.value = false;
  try {
    const res = await http.get<FileListResponse>(`${API_BASE}/list`, {
      params: { path: currentPath.value },
    });

    console.log("Response from list", res);
    files.value = res.data?.items ?? [];
  } catch (err) {
    hasLoadError.value = true;
    files.value = [];
    console.error("loadFiles failed:", err);
  } finally {
    loading.value = false;
  }
}

async function handleUpload({ file }: { file: File }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", currentPath.value);
  await http.post(`${API_BASE}/upload`, formData);
  await loadFiles();
}

async function handleDelete(record: FileEntry) {
  const base = currentPath.value.replace(/\/$/, "");
  await http.delete(`${API_BASE}/delete`, {
    data: { path: `${base}/${record.name}` },
  });
  await loadFiles();
}

function enterDirectory(name: string) {
  currentPath.value = currentPath.value.replace(/\/$/, "") + "/" + name;
  loadFiles();
}

function goTo(p: string) {
  currentPath.value = p;
  loadFiles();
}

onMounted(loadFiles);
</script>

<style scoped>
.fm-container {
  padding: 16px;
  background: var(--ant-color-bg-container);
  border-radius: var(--ant-border-radius-lg);
}

.fm-breadcrumb {
  margin-bottom: 12px;
}

.fm-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.fm-table {
  border-radius: var(--ant-border-radius);
}

.fm-entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.fm-folder {
  color: var(--ant-color-primary);
  font-weight: 500;
}

.fm-file {
  color: var(--ant-color-text);
}

.fm-icon {
  font-size: 14px;
  color: var(--ant-color-text-secondary);
}

.fm-error {
  margin-top: 12px;
  font-size: 12px;
  color: var(--ant-color-error-text);
}
</style>
