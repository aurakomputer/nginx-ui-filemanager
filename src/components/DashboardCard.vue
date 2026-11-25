<template>
  <div
    class="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-xs transition-all duration-200 active:scale-[0.99]">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {{ caption }}
        </div>
        <div class="text-2xl font-bold tracking-tight mt-1" :class="scheme.valueClass">
          {{ value }}
        </div>
        <div v-if="subCaption" class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          {{ subCaption }}
        </div>
      </div>

      <div v-if="icon" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        :class="scheme.iconBgClass">
        <component :is="icon" class="w-5 h-5" :class="scheme.iconClass" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";

export type ColorScheme = "primary" | "blue" | "emerald" | "amber" | "rose" | "purple";

interface Props {
  caption: string;
  value: string | number;
  subCaption?: string;
  icon?: Component;
  colorScheme?: ColorScheme;
}

const props = withDefaults(defineProps<Props>(), {
  subCaption: "",
  icon: undefined,
  colorScheme: "primary",
});

const schemes: Record<ColorScheme, { iconBgClass: string; iconClass: string; valueClass: string }> =
{
  primary: {
    iconBgClass: "bg-primary/10",
    iconClass: "text-primary",
    valueClass: "text-slate-900 dark:text-white",
  },
  blue: {
    iconBgClass: "bg-blue-500/10",
    iconClass: "text-blue-600",
    valueClass: "text-blue-600",
  },
  emerald: {
    iconBgClass: "bg-emerald-500/10",
    iconClass: "text-emerald-600",
    valueClass: "text-emerald-600",
  },
  amber: {
    iconBgClass: "bg-amber-500/10",
    iconClass: "text-amber-600",
    valueClass: "text-amber-600",
  },
  rose: {
    iconBgClass: "bg-rose-500/10",
    iconClass: "text-rose-600",
    valueClass: "text-rose-600",
  },
  purple: {
    iconBgClass: "bg-purple-500/10",
    iconClass: "text-purple-600",
    valueClass: "text-purple-600",
  },
};

const scheme = computed(() => schemes[props.colorScheme] || schemes.primary);
</script>
