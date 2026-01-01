<template>
  <header class="shouanren-header">
    <!-- 主标题与星光徽章 -->
    <div class="header-brand">
      <div class="starlight-badge">
        <div class="star-core"></div>
        <div class="star-glow"></div>
      </div>
      <h1 class="site-title">
        <span class="title-text">守岸人·星域守望</span>
        <span class="title-sub">Shouanren · Stellar Domain</span>
      </h1>
    </div>

    <!-- 在线状态指示器 -->
    <div class="online-indicator" :class="{ 'pulse-online': onlineCount > 0 }">
      <div class="signal-dot"></div>
      <div class="online-text">
        <span class="label">星域共鸣</span>
        <span class="count">{{
          onlineCount !== null ? onlineCount : "..."
        }}</span>
      </div>
      <div class="signal-wave"></div>
    </div>

    <!-- 移动端汉堡菜单按钮 -->
    <button
      class="stellar-hamburger"
      @click="toggleMobileNav"
      :aria-expanded="mobileNavOpen"
      aria-label="切换导航菜单"
      :class="{ active: mobileNavOpen }"
    >
      <span class="line line-top"></span>
      <span class="line line-mid"></span>
      <span class="line line-bot"></span>
      <div class="button-glow"></div>
    </button>

    <!-- 主导航 - 桌面端 & 移动端 -->
    <nav
      class="stellar-nav"
      :class="{ 'mobile-active': mobileNavOpen }"
      aria-label="主导航"
    >
      <div class="nav-backdrop" @click="mobileNavOpen = false"></div>
      <div class="nav-content">
        <!-- 导航项 -->
        <RouterLink
          v-for="item in filteredNavItems"
          :key="item.name"
          :to="item.path"
          class="nav-link"
          active-class="nav-active"
          @click="mobileNavOpen = false"
        >
          <span class="link-text">{{ item.name }}</span>
          <span class="link-glow"></span>
        </RouterLink>

        <!-- 外部链接 -->
        <a
          href="http://slty.site/#/redirector"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link external"
          @click="mobileNavOpen = false"
        >
          <span class="link-text">霜落映界</span>
          <span class="link-external-marker"></span>
        </a>

        <!-- 移动端底部装饰 -->
        <div class="mobile-nav-footer" v-if="mobileNavOpen">
          <div class="footer-ornament"></div>
          <p class="footer-quote">“于此岸，守望星海回响”</p>
        </div>
      </div>
    </nav>

    <!-- 背景星光粒子 (性能优化) -->
    <div class="starlight-particles" aria-hidden="true"></div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { io } from "socket.io-client";

// 配置导航项 (含图标)
const navItems = [
  { name: "星域首页", path: "/" },
  { name: "星辉档案", path: "/timeLine" },
  { name: "回响留言", path: "/message" },
  { name: "光蕴图集", path: "/gallery" },
  { name: "资源星图", path: "/resources" },
  { name: "AI对话", path: "/talk" },
  { name: "祈愿", path: "/wish" },
  { name: "AI语音", path: "/voice" },
  { name: "共鸣曲库", path: "/music" },
  { name: "文本共享", path: "/wiki" },
  { name: "鸣谢星光", path: "/thanks" },
];

// 过滤掉重复的“AI语音”项 (根据路径)
const filteredNavItems = computed(() => {
  const seen = new Set();
  return navItems.filter((item) => {
    if (seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  });
});

// 移动端导航状态
const mobileNavOpen = ref(false);
const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value;
};

// 在线状态逻辑
const siteId = "shouanren";
const onlineCount = ref<number | null>(null);
const socket: any = io("http://36.150.237.25:3000", {
  query: { siteId },
  transports: ["websocket", "polling"], // 兼容性
});

onMounted(() => {
  socket.on("onlineCount", (count: number) => {
    onlineCount.value = count;
  });
  socket.on("connect_error", (err: any) => {
    console.warn("在线人数连接异常:", err.message);
    onlineCount.value = 0; // 降级处理
  });
});

onBeforeUnmount(() => {
  if (socket) socket.disconnect();
});
</script>

<style scoped lang="scss">
/* 守岸人主题变量 */
.shouanren-header {
  --color-deep-space: #0a1a2a; // 深空底色
  --color-stellar-domain: #0f2b3f; // 星域蓝
  --color-star-blue: #4fe9df; // 星辉青 - 主色
  --color-star-cyan: #7fbfff; // 星芒蓝 - 辅助色
  --color-mist-light: #d9eef6; // 雾光白 - 文字
  --color-mist-light-rgb: 217, 238, 246;
  --color-star-blue-rgb: 79, 233, 223;
  --color-star-cyan-rgb: 127, 191, 255;
  --gradient-domain: linear-gradient(
    135deg,
    var(--color-deep-space),
    var(--color-stellar-domain) 60%,
    #123456
  );
  --gradient-glow: radial-gradient(
    circle at center,
    rgba(var(--color-star-blue-rgb), 0.35) 0%,
    rgba(var(--color-star-blue-rgb), 0.1) 40%,
    transparent 70%
  );
  --glass-bg: rgba(16, 35, 52, 0.72);
  --glass-border: rgba(var(--color-star-cyan-rgb), 0.12);

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  background: var(--gradient-domain);
  backdrop-filter: blur(12px) saturate(1.8);
  -webkit-backdrop-filter: blur(12px) saturate(1.8);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(5, 15, 30, 0.4),
    inset 0 1px 0 rgba(var(--color-mist-light-rgb), 0.05),
    inset 0 0 30px rgba(var(--color-star-blue-rgb), 0.03);
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(16px, 4vw, 40px);
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-star-blue),
      var(--color-star-cyan),
      transparent
    );
    opacity: 0.6;
    filter: blur(1px);
  }
}

/* 品牌区域 */
.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 2;
}

.starlight-badge {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  .star-core {
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at 30% 30%,
      var(--color-star-blue),
      var(--color-star-cyan) 60%,
      transparent 80%
    );
    border-radius: 50%;
    filter: blur(1px);
    animation: star-pulse 4s ease-in-out infinite;
  }
  .star-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 180%;
    height: 180%;
    transform: translate(-50%, -50%);
    background: var(--gradient-glow);
    border-radius: 50%;
    opacity: 0.7;
    animation: glow-rotate 20s linear infinite;
  }
}

.site-title {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  .title-text {
    font-size: clamp(1.1rem, 1.8vw, 1.5rem);
    font-weight: 700;
    background: linear-gradient(
      90deg,
      var(--color-mist-light),
      var(--color-star-cyan) 50%,
      var(--color-star-blue)
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.03em;
    text-shadow: 0 2px 8px rgba(var(--color-star-blue-rgb), 0.15);
    transition: all 0.3s ease;
  }
  .title-sub {
    font-size: 0.7rem;
    font-weight: 400;
    color: rgba(var(--color-mist-light-rgb), 0.65);
    letter-spacing: 0.1em;
    margin-top: 2px;
  }
  &:hover .title-text {
    background: linear-gradient(
      90deg,
      var(--color-star-blue),
      var(--color-star-cyan) 50%,
      var(--color-mist-light)
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 4px 16px rgba(var(--color-star-blue-rgb), 0.25);
  }
}

/* 在线指示器 */
.online-indicator {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(16, 35, 52, 0.5);
  border: 1px solid rgba(var(--color-star-cyan-rgb), 0.15);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2;
  transition: all 0.3s ease;
  &:hover {
    border-color: rgba(var(--color-star-cyan-rgb), 0.3);
    background: rgba(20, 45, 70, 0.6);
    transform: translateY(-1px);
  }
  &.pulse-online .signal-dot {
    animation: signal-pulse 2s ease-in-out infinite;
  }
}

.signal-dot {
  width: 10px;
  height: 10px;
  background: var(--color-star-blue);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-star-blue);
  flex-shrink: 0;
}

.signal-wave {
  position: absolute;
  top: 50%;
  left: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--color-star-blue);
  transform: translateY(-50%);
  opacity: 0;
  .pulse-online & {
    animation: wave-expand 2s ease-out infinite;
  }
}

.online-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  .label {
    font-size: 0.75rem;
    color: rgba(var(--color-mist-light-rgb), 0.8);
    font-weight: 500;
  }
  .count {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-star-cyan);
    text-shadow: 0 0 8px rgba(var(--color-star-cyan-rgb), 0.4);
  }
}

/* 导航菜单 */
.stellar-nav {
  display: flex;
  align-items: center;
  .nav-content {
    display: flex;
    gap: 4px;
    background: rgba(16, 35, 52, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 6px;
    border: 1px solid rgba(var(--color-star-cyan-rgb), 0.08);
    box-shadow: 0 8px 32px rgba(5, 15, 30, 0.3),
      inset 0 1px 0 rgba(var(--color-mist-light-rgb), 0.05);
  }
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  color: rgba(var(--color-mist-light-rgb), 0.85);
  text-decoration: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  overflow: hidden;
  z-index: 1;

  .link-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(var(--color-star-blue-rgb), 0.15),
      transparent
    );
    transition: left 0.7s ease;
    z-index: -1;
  }
  &:hover {
    color: var(--color-mist-light);
    background: rgba(var(--color-star-blue-rgb), 0.08);
    transform: translateY(-1px);

    .link-glow {
      left: 100%;
    }
  }
  &.nav-active {
    color: var(--color-star-blue);
    background: rgba(var(--color-star-blue-rgb), 0.12);
    font-weight: 600;
    &::before {
      content: "";
      position: absolute;
      bottom: 4px;
      left: 18px;
      right: 18px;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-star-blue),
        transparent
      );
      border-radius: 1px;
      filter: blur(0.5px);
    }
  }
  &.external .link-external-marker {
    margin-left: 4px;
    opacity: 0.6;
    &::after {
      content: "↗";
      font-size: 0.8em;
    }
  }
}

/* 移动端汉堡按钮 */
.stellar-hamburger {
  display: none; // 默认隐藏，移动端显示
  position: relative;
  width: 44px;
  height: 44px;
  background: rgba(20, 45, 70, 0.6);
  border: 1px solid rgba(var(--color-star-cyan-rgb), 0.15);
  border-radius: 12px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.3s ease;
  .line {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--color-mist-light);
    border-radius: 1px;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    transform-origin: center;
  }
  .button-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(
      circle,
      rgba(var(--color-star-blue-rgb), 0.3),
      transparent 70%
    );
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.4s ease, height 0.4s ease;
  }
  &:hover {
    background: rgba(30, 65, 100, 0.7);
    border-color: rgba(var(--color-star-cyan-rgb), 0.3);
    .button-glow {
      width: 80px;
      height: 80px;
    }
  }
  &.active {
    .line-top {
      transform: translateY(7px) rotate(45deg);
    }
    .line-mid {
      opacity: 0;
      width: 0;
    }
    .line-bot {
      transform: translateY(-7px) rotate(-45deg);
    }
    .button-glow {
      width: 100px;
      height: 100px;
    }
  }
}

/* 星光粒子背景 */
.starlight-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(
        1px at 20% 30%,
        rgba(255, 255, 255, 0.8) 1px,
        transparent 2px
      ),
      radial-gradient(
        1px at 60% 70%,
        rgba(127, 191, 255, 0.7) 1px,
        transparent 2px
      );
    background-size: 100px 100px, 150px 150px;
    opacity: 0.15;
    animation: particles-float 80s linear infinite;
  }
  &::after {
    background-image: radial-gradient(
        1.5px at 80% 40%,
        rgba(79, 233, 223, 0.6) 1px,
        transparent 2px
      ),
      radial-gradient(
        1px at 40% 80%,
        rgba(255, 255, 255, 0.5) 1px,
        transparent 2px
      );
    animation-direction: reverse;
    animation-duration: 100s;
  }
}

/* 移动端响应式适配 */
@media (max-width: 1024px) {
  .online-indicator .label {
    display: none;
  }
  .nav-link {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
}
@media (max-width: 768px) {
  .shouanren-header {
    padding: 0 16px;
    min-height: 64px;
  }
  .online-indicator {
    order: 3;
    margin-left: auto;
    padding: 6px 12px;
    .online-text {
      flex-direction: row;
      gap: 6px;
    }
    .label {
      display: block;
      font-size: 0.7rem;
    }
    .count {
      font-size: 0.9rem;
    }
  }
  .stellar-hamburger {
    display: flex;
    order: 2;
  }
  .stellar-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    visibility: hidden;
    z-index: 10000;
    .nav-backdrop {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(5, 15, 30, 0.85);
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .nav-content {
      position: absolute;
      top: 0;
      right: 0;
      width: 85%;
      max-width: 320px;
      height: 100%;
      flex-direction: column;
      gap: 2px;
      padding: 80px 20px 30px;
      border-radius: 0;
      border-left: 1px solid rgba(var(--color-star-cyan-rgb), 0.1);
      background: rgba(10, 26, 42, 0.95);
      transform: translateX(100%);
      transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
      overflow-y: auto;
    }
    &.mobile-active {
      visibility: visible;
      .nav-backdrop {
        opacity: 1;
      }
      .nav-content {
        transform: translateX(0);
      }
    }
  }
  .nav-link {
    padding: 16px 20px;
    border-radius: 10px;
    border-left: 3px solid transparent;
    .link-text {
      flex-grow: 1;
    }
    &.nav-active {
      border-left-color: var(--color-star-blue);
      background: rgba(var(--color-star-blue-rgb), 0.1);
      &::before {
        display: none;
      }
    }
  }
  .mobile-nav-footer {
    margin-top: auto;
    padding-top: 30px;
    text-align: center;
    .footer-ornament {
      width: 60px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-star-cyan),
        transparent
      );
      margin: 0 auto 15px;
      opacity: 0.5;
    }
    .footer-quote {
      font-size: 0.85rem;
      color: rgba(var(--color-mist-light-rgb), 0.6);
      font-style: italic;
    }
  }
}

/* 关键帧动画 */
@keyframes star-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}
@keyframes glow-rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
@keyframes signal-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(79, 233, 223, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(79, 233, 223, 0);
  }
}
@keyframes wave-expand {
  0% {
    transform: translateY(-50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-50%) scale(3);
    opacity: 0;
  }
}
@keyframes particles-float {
  0% {
    transform: translateY(0) translateX(0);
  }
  100% {
    transform: translateY(-100px) translateX(50px);
  }
}
</style>