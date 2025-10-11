<template>
  <div id="app">
    <transition name="fade" v-if="showIntro">
      <div class="intro-container" @click="showIntro = false">
        <video
          class="video-background"
          :src="videoSrc"
          autoplay
          muted
          loop
          playsinline
        ></video>
        <div class="intro-content" aria-live="polite">
          <div class="intro-inner">
            <!-- 打字机展示的随机语句 -->
            <div class="typewriter-wrap">
              <p class="typewriter">
                {{ displayText }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div v-else>
      <navbar />

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { RouterView } from "vue-router";
import navbar from "./components/navbar.vue";

const showIntro = ref(true);
const videoSrc = ref(""); // 新增
const lines = [
  "潮声为灯，静候归人",
  "回声为路，等你归来",
  "夜海回响，候你归帆",
  "潮汐轻语，寄望远方",
  "以潮为灯，守望回声",
  "星潮作证，声留海间",
  "共鸣之晶，静候唤醒",
] as const;

const displayText = ref("");

let typingTimer: number | null = null;

/* 打字机参数 */
const typingSpeed = 300; // 每字符间隔 ms

function pickRandomLine(): string {
  const idx = Math.floor(Math.random() * lines.length);
  return lines[idx];
}

/* 逐字打字，完成后启动 5s 隐藏计时（若用户偏好减少动效则直接显示且不自动隐藏） */
function startOnceType(line: string) {
  // 如果用户偏好减少动效，直接显示整句并不启动定时隐藏
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    displayText.value = line;
    return;
  }

  let i = 0;
  typingTimer = window.setInterval(() => {
    i++;
    displayText.value = line.slice(0, i);
    if (i >= line.length) {
      if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }
  }, typingSpeed);
}

onMounted(() => {
  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768;
  const folder = isMobile ? "/mp2" : "/mp1";
  const index = Math.floor(Math.random() * 4) + 1; // 随机 1 或 2
  videoSrc.value = `${folder}/1 (${index}).mp4`;

  setTimeout(() => {
    showIntro.value = false;
  }, 5000); // 播放动画 4 秒后进入主页

  const line = pickRandomLine();
  // 延迟一点开始打字，视觉更舒适
  setTimeout(() => startOnceType(line), 200);
});

onBeforeUnmount(() => {
  if (typingTimer) clearInterval(typingTimer);
});
</script>

<style scoped lang="scss">
#app {
  position: relative;
  min-height: 100vh;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 欢迎页样式 */
.intro-container {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, #111 0%, #000 100%);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-direction: column;
}
.intro-content {
  width: 100%;
  box-sizing: border-box;
  padding: 18px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #dff8ff;
  z-index: 10;

  /* 容器：PC 横向，移动竖向 */
  .intro-inner {
    display: flex;
    flex-direction: row;    /* 横向排列：站名 在 左，打字文字 在 右（或反之） */
    align-items: center;
    gap: 20px;
    transition: opacity 420ms ease, transform 420ms ease;
    /* 初始可见状态 */
    opacity: 1;
    transform: translateY(0);
    /* typewriter 文本样式 */
    .typewriter-wrap {
      display: flex;
      align-items: center;
      min-width: 0; /* 方便在 flex 中换行 */

      .typewriter {
        margin: 0;
        font-weight: 700;
        font-size: clamp(36px, 7.6vw, 58px);
        line-height: 1.1;
        color: #dff8ff;
        /* 渐变文字（冰蓝） */
        background: linear-gradient(
          90deg,
          rgba(190, 245, 255, 0.95),
          rgba(110, 220, 255, 0.9)
        );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        -webkit-text-stroke: 0.2px rgba(0, 0, 0, 0.06);
        text-shadow: 0 6px 18px rgba(6, 40, 56, 0.22);
        white-space: nowrap;
        overflow: hidden;
      }
    }
  }
}

/* PC 横向（桌面）保持并列；移动端竖向 */
@media (max-width: 780px) {
  .intro-inner {
    flex-direction: column;
    gap: 8px;
    align-items: center;
    text-align: center;
  }
  .typewriter {
    font-size: clamp(14px, 5.8vw, 20px);
    white-space: normal;
    max-width: 92vw;
  }

}

.video-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
  z-index: 1;
  pointer-events: none;
  /* 避免遮挡点击 */
}

/* 动画定义 */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
