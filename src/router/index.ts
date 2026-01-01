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
      path: "/wish",
      component: () => import("@/views/wishView/index.vue"),
    },
    {
      path: "/talk",
      component: () => import("@/views/talkView/index.vue"),
    },
    {
      path: "/voice",
      component: () => import("@/views/voiceView/index.vue"),
    },
    {
      path: "/music",
      component: () => import("@/views/musicView/index.vue"),
    },
    {
      path: "/wiki",
      component: () => import("@/views/wikiView/index.vue"),
    },
    {
      path: "/thanks",
      component: () => import("@/views/thanksView/index.vue"),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
