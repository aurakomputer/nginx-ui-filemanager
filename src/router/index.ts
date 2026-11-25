import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    guest?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/LoginPage.vue"),
    meta: { guest: true },
  },
  {
    path: "/panel",
    component: () => import("src/layouts/PanelLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "panel.dashboard",
        component: () => import("src/pages/DashboardPage.vue"),
      },
      //     {
      //       path: "sync",
      //       name: "panel.sync",
      //       component: () => import("src/pages/SyncPage.vue"),
      //     },
      //     {
      //       path: "input-attendance",
      //       name: "panel.input-attendance",
      //       component: () => import("src/pages/InputAttendancePage.vue"),
      //     },
      //     {
      //       path: "attendances",
      //       name: "panel.attendances",
      //       component: () => import("src/pages/AttendancesPage.vue"),
      //     },
      //     {
      //       path: "profile",
      //       name: "panel.profile",
      //       component: () => import("src/pages/ProfilePage.vue"),
      //     },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    return { name: "login" };
  }

  if (to.meta.guest && token) {
    return { name: "panel.dashboard" };
  }
});

export default router;
