<template>
  <div id="app">
    <transition name="fade" v-if="showIntro">
      <div class="intro-container" @click="showIntro = false">
        <video class="video-background" :src="videoSrc" autoplay muted loop playsinline></video>
        <div class="intro-content">
          <h1 class="welcome-text">欢迎进入</h1>
          <h2 class="title">椿电子设定集</h2>
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



onMounted(() => {
  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768;
  const folder = isMobile ? "/mp2" : "/mp1";
  const index = Math.floor(Math.random() * 4) + 1; // 随机 1 或 2
  videoSrc.value = `${folder}/1 (${index}).mp4`;

  setTimeout(() => {
    showIntro.value = false;
  }, 5000); // 播放动画 4 秒后进入主页

 
});

onBeforeUnmount(() => {
  model?.destroy();
  app?.destroy();
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
  text-align: center;
  color: #fff;
  z-index: 10;
  animation: zoomIn 2s ease-out;
}

.welcome-text {
  font-size: 2.5rem;
  letter-spacing: 2px;
  opacity: 0;
  animation: fadeIn 1.5s ease forwards;
}

.title {
  margin-top: 20px;
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(90deg, #b71c1c, #ffd7db);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 10px 40px rgba(183, 28, 28, 0.06);
  opacity: 0;
  animation: fadeIn 1.5s ease forwards;
  animation-delay: 1s;
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
