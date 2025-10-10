import { createRouter, createWebHashHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
NProgress.configure({ showSpinner: false }); // NProgress Configuration 刷新页面头部进度条

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/views/page1/index.vue"),
    },
    {
      path: "/timeLine",
      component: () => import("@/views/timeLine/index.vue"),
    },
    {
      path: "/message",
      component: () => import("@/views/messageView/index.vue"),
    },
    {
      path: "/gallery",
      component: () => import("@/views/galleryView/index.vue"),
    },
    {
      path: "/resources",
      component: () => import("@/views/resourcesView/index.vue"),
    },
    {
      path: "/game",
      component: () => import("@/views/gameView/index.vue"),
    },
     {
      path: "/voice",
      component: () => import("@/views/voiceView/index.vue"),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
