<template>
  <transition name="stellar-fade">
    <div
      v-if="showIntro"
      class="shouanren-splash"
      :class="{ 'reduced-motion': prefersReducedMotion }"
      @click="handleSkip"
      tabindex="0"
      role="dialog"
      aria-label="守岸人星域迎宾界面"
      aria-live="polite"
    >
      <!-- 多层动态背景 -->
      <div class="splash-background">
        <div class="stellar-field"></div>
        <div class="tidal-waves"></div>
        <div class="nebula-glow"></div>
      </div>

      <!-- 主内容容器 -->
      <div class="splash-content">
        <!-- 左侧：星辉徽章与标题 -->
        <div class="stellar-brand">
          <div class="stellar-emblem">
            <div class="emblem-core">
              <div class="core-glow"></div>
              <div class="core-rings">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
                <div class="ring ring-3"></div>
              </div>
            </div>
            <div class="emblem-constellation">
              <div
                class="star-point"
                v-for="point in starPoints"
                :key="point.id"
                :style="point.style"
              ></div>
            </div>
          </div>

          <div class="brand-text">
            <h1 class="main-title">
              <span class="title-gradient">守岸人</span>
              <span class="title-sub">· 星域守望</span>
            </h1>
            <p class="brand-subtitle">Shouanren · Stellar Watch</p>
          </div>
        </div>

        <!-- 中央分隔：潮汐引线 -->
        <div class="tidal-divider">
          <div class="divider-line"></div>
          <div class="divider-orb">
            <div class="orb-pulse"></div>
          </div>
        </div>

        <!-- 右侧：回声语句展示 -->
        <div class="echo-display">
          <div class="echo-container">
            <!-- 打字机区域 -->
            <div class="typewriter-scope">
              <div class="echo-prefix">
                <span class="prefix-text">星海回声</span>
              </div>
              <div class="typewriter-wrapper">
                <p
                  class="stellar-typewriter"
                  :class="{ 'typing-active': isTyping }"
                  aria-live="polite"
                  :aria-label="'当前回声：' + currentLine"
                >
                  <span class="typed-text">{{ displayText }}</span>
                  <span
                    class="cursor"
                    :class="{ blinking: isTyping || showCursor }"
                    aria-hidden="true"
                  ></span>
                </p>
                <div class="echo-underline">
                  <div class="underline-wave"></div>
                </div>
              </div>
            </div>

            <!-- 进度与跳过提示 -->
            <div class="splash-controls">
              <div class="auto-progress" v-if="!prefersReducedMotion">
                <div
                  class="progress-bar"
                  :style="{ width: progressPercent + '%' }"
                ></div>
                <span class="progress-text">{{ countdown }}秒后进入</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部引导提示 -->
        <div class="splash-footer" v-if="!prefersReducedMotion">
          <div class="hint-float">
          
            <span class="hint-text">点击跳过</span>
          </div>
        </div>

        <!-- 动态星光粒子 -->
        <canvas
          ref="particlesCanvas"
          class="particles-canvas"
          aria-hidden="true"
        ></canvas>
      </div>
    </div>
    <div v-else>
      <navbar />
      <router-view></router-view>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { RouterView } from "vue-router";
import navbar from "./components/navbar.vue";

// 状态控制
const showIntro = ref(true);

// 回声语句库 - 增强守岸人主题
const echoLines = [
  "潮声为灯，静候归人",
  "回声为路，引你归来",
  "夜海低语，星域守望",
  "潮汐脉动，寄望彼岸",
  "以星为证，声留海间",
  "共鸣之晶，静候唤醒",
  "星辉作帆，渡你回航",
  "海岸线外，皆是回响",
  "每一次潮涌，都是呼唤",
  "守望深空，静听回声",
  "星潮引路，彼岸有光",
  "于寂静处，听见世界",
] as const;

// 打字机状态
const displayText = ref("");
const currentLine = ref("");
const isTyping = ref(false);
const showCursor = ref(true);
const typingSpeed = ref(220); // 打字速度 ms/字符

// 自动进度
const countdown = ref(4); // 延长至7秒，给予足够观赏时间
const progressPercent = ref(0);
const countdownInterval = ref<number | null>(null);

// 性能与偏好
const prefersReducedMotion = ref(false);

// 星座节点生成
const starPoints = ref<Array<{ id: number; style: string }>>([]);

// Refs
const particlesCanvas = ref<HTMLCanvasElement | null>(null);

// 随机选择回声
function pickRandomEcho(): string {
  const idx = Math.floor(Math.random() * echoLines.length);
  return echoLines[idx];
}

// 增强型打字机效果
async function startEchoTyping() {
  if (prefersReducedMotion.value) {
    displayText.value = currentLine.value;
    return;
  }

  isTyping.value = true;
  const line = currentLine.value;
  const chars = line.split("");

  for (let i = 0; i <= chars.length; i++) {
    if (!showIntro.value) break; // 组件已卸载

    displayText.value = line.slice(0, i);

    // 动态调整速度：开头和结尾稍慢
    let speed = typingSpeed.value;
    if (i < 2 || i > chars.length - 2) speed = speed * 1.5;

    await new Promise((resolve) => setTimeout(resolve, speed));
  }

  isTyping.value = false;

  // 句子显示完成后闪烁光标
  const blinkInterval = setInterval(() => {
    if (!showIntro.value) clearInterval(blinkInterval);
    showCursor.value = !showCursor.value;
  }, 500);

  // 3秒后清除闪烁
  setTimeout(() => {
    clearInterval(blinkInterval);
    showCursor.value = false;
  }, 3000);
}

// 初始化星座节点
function initConstellation() {
  const points = [];
  const pointCount = 9; // 守岸人相关数字

  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const variance = 0.3;
    const radius = 60 + Math.random() * 20;

    const x =
      50 + Math.cos(angle) * radius + (Math.random() - 0.5) * variance * radius;
    const y =
      50 + Math.sin(angle) * radius + (Math.random() - 0.5) * variance * radius;

    points.push({
      id: i,
      style: `left: ${x}%; top: ${y}%; animation-delay: ${i * 0.2}s;`,
    });
  }

  starPoints.value = points;
}

// 初始化粒子系统
function initParticles() {
  const canvas = particlesCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const particles: Array<any> = [];
  const particleCount = 80;

  // 创建粒子
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? "#7fbfff" : "#4fe9df",
    });
  }

  // 动画循环
  function animateParticles() {
    if (!showIntro.value || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      // 边界检查
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      // 绘制粒子
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();

      // 绘制星光光晕
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.size * 3
      );
      gradient.addColorStop(0, p.color + "80");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  return () => {
    window.removeEventListener("resize", resizeCanvas);
  };
}

// 跳过/进入主站
function handleSkip() {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
  showIntro.value = false;
}

// 倒计时进度更新
function startCountdown() {
  if (prefersReducedMotion.value) {
    setTimeout(() => handleSkip(), 5000);
    return;
  }

  const totalTime = countdown.value * 1000;
  const startTime = Date.now();

  countdownInterval.value = window.setInterval(() => {
    const elapsed = Date.now() - startTime;
    progressPercent.value = (elapsed / totalTime) * 100;
    countdown.value = Math.max(0, Math.ceil((totalTime - elapsed) / 1000));

    if (elapsed >= totalTime) {
      if (countdownInterval.value) clearInterval(countdownInterval.value);
      handleSkip();
    }
  }, 100);
}

onMounted(async () => {
  // 检测用户偏好
  prefersReducedMotion.value = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  // 初始化回声
  currentLine.value = pickRandomEcho();

  // 初始化视觉元素
  initConstellation();
  const cleanupParticles = initParticles();

  // 开始倒计时
  startCountdown();

  // 延迟开始打字效果
  setTimeout(() => {
    if (showIntro.value) {
      startEchoTyping();
    }
  }, 800);

  // 焦点管理
  nextTick(() => {
    const container = document.querySelector(
      ".shouanren-splash"
    ) as HTMLElement;
    if (container) container.focus();
  });

  return () => {
    if (cleanupParticles) cleanupParticles();
    if (countdownInterval.value) clearInterval(countdownInterval.value);
  };
});

onBeforeUnmount(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
});
</script>

<style scoped lang="scss">
/* 守岸人开屏主题变量 */
.shouanren-splash {
  --color-deep-space: #0a1525;
  --color-stellar-blue: #0f2b3f;
  --color-star-cyan: #4fe9df;
  --color-star-blue: #7fbfff;
  --color-mist-light: #e6f7ff;
  --color-echo-glow: #a6e9ff;

  --gradient-space: linear-gradient(
    135deg,
    #050f1f 0%,
    #0a1a2a 30%,
    #0f2b3f 70%
  );
  --gradient-stellar: radial-gradient(
    ellipse at 30% 40%,
    rgba(79, 233, 223, 0.15) 0%,
    transparent 60%
  );
  --gradient-tidal: linear-gradient(
    90deg,
    transparent,
    rgba(127, 191, 255, 0.1),
    transparent
  );

  position: fixed;
  inset: 0;
  z-index: 99999;
  background: var(--gradient-space);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;

  &.reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

/* 多层背景系统 */
.splash-background {
  position: absolute;
  inset: 0;

  .stellar-field {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        1px at 20% 30%,
        rgba(255, 255, 255, 0.9) 1px,
        transparent 2px
      ),
      radial-gradient(
        1px at 60% 70%,
        rgba(127, 191, 255, 0.7) 1px,
        transparent 2px
      ),
      radial-gradient(
        1.5px at 80% 40%,
        rgba(79, 233, 223, 0.6) 1px,
        transparent 2px
      );
    background-size: 200px 200px, 300px 300px, 250px 250px;
    opacity: 0.4;
    animation: stars-drift 120s linear infinite;
  }

  .tidal-waves {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30%;
    background: linear-gradient(transparent 60%, rgba(15, 43, 63, 0.7)),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 20px,
        rgba(79, 233, 223, 0.03) 20px,
        rgba(79, 233, 223, 0.03) 40px
      );
    mask-image: linear-gradient(to top, black 10%, transparent);
    animation: waves-flow 20s ease-in-out infinite;
  }

  .nebula-glow {
    position: absolute;
    top: 20%;
    right: 15%;
    width: 40vw;
    height: 40vw;
    max-width: 500px;
    max-height: 500px;
    background: radial-gradient(
      circle,
      rgba(79, 233, 223, 0.08) 0%,
      transparent 70%
    );
    filter: blur(40px);
    animation: nebula-pulse 15s ease-in-out infinite;
  }
}

/* 主内容布局 */
.splash-content {
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  padding: 40px;
}

/* 左侧品牌区域 */
.stellar-brand {
  flex: 0 0 35%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;

  .stellar-emblem {
    position: relative;
    width: 180px;
    height: 180px;

    .emblem-core {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(
        circle at 30% 30%,
        var(--color-star-cyan),
        var(--color-star-blue) 70%
      );
      filter: blur(1px);
      animation: core-pulse 6s ease-in-out infinite;

      .core-glow {
        position: absolute;
        inset: -20px;
        background: radial-gradient(
          circle,
          var(--color-star-cyan) 0%,
          transparent 70%
        );
        opacity: 0.3;
        filter: blur(15px);
        animation: glow-breathe 8s ease-in-out infinite;
      }

      .core-rings {
        position: absolute;
        inset: 0;

        .ring {
          position: absolute;
          border: 1px solid rgba(127, 191, 255, 0.3);
          border-radius: 50%;
          inset: 0;
          opacity: 0;

          &.ring-1 {
            animation: ring-expand 4s ease-out infinite;
          }
          &.ring-2 {
            animation: ring-expand 4s ease-out infinite 1s;
          }
          &.ring-3 {
            animation: ring-expand 4s ease-out infinite 2s;
          }
        }
      }
    }

    .emblem-constellation {
      position: absolute;
      inset: 0;

      .star-point {
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--color-mist-light);
        border-radius: 50%;
        filter: drop-shadow(0 0 3px var(--color-star-blue));
        animation: star-twinkle 3s ease-in-out infinite;

        &::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            var(--color-star-blue) 0%,
            transparent 70%
          );
          opacity: 0.3;
        }
      }
    }
  }

  .brand-text {
    text-align: center;

    .main-title {
      margin: 0 0 8px;
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.1;

      .title-gradient {
        background: linear-gradient(
          135deg,
          var(--color-mist-light),
          var(--color-star-cyan) 50%,
          var(--color-star-blue)
        );
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: block;
        animation: title-shimmer 8s ease-in-out infinite;
      }

      .title-sub {
        color: rgba(127, 191, 255, 0.9);
        font-size: 0.6em;
        font-weight: 400;
        letter-spacing: 0.3em;
        margin-left: 0.5em;
      }
    }

    .brand-subtitle {
      margin: 0;
      font-size: 1rem;
      color: rgba(230, 247, 255, 0.6);
      letter-spacing: 0.2em;
      font-weight: 300;
    }
  }
}

/* 中央分隔线 */
.tidal-divider {
  flex: 0 0 1px;
  align-self: stretch;
  position: relative;

  .divider-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: var(--gradient-tidal);
    transform: translateX(-50%);
  }

  .divider-orb {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;

    .orb-pulse {
      width: 100%;
      height: 100%;
      background: var(--color-star-cyan);
      border-radius: 50%;
      filter: drop-shadow(0 0 6px var(--color-star-cyan));
      animation: orb-float 3s ease-in-out infinite;
    }
  }
}

/* 右侧回声展示 */
.echo-display {
  flex: 0 0 50%;

  .echo-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
}

.echo-prefix {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  .prefix-text {
    font-size: 1.2rem;
    color: rgba(230, 247, 255, 0.8);
    font-weight: 500;
    letter-spacing: 0.2em;
  }
}

.typewriter-wrapper {
  position: relative;

  .stellar-typewriter {
    margin: 0 0 16px;
    min-height: 120px;
    font-size: clamp(2rem, 3.5vw, 3rem);
    font-weight: 600;
    line-height: 1.3;
    color: transparent;
    background: linear-gradient(
      135deg,
      var(--color-mist-light),
      var(--color-echo-glow) 40%,
      var(--color-star-cyan)
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 4px 20px rgba(79, 233, 223, 0.2),
      0 0 40px rgba(127, 191, 255, 0.1);

    .typed-text {
      display: inline-block;
      white-space: pre-wrap;
      word-break: keep-all;
    }

    .cursor {
      display: inline-block;
      width: 3px;
      height: 1.2em;
      background: var(--color-star-blue);
      margin-left: 4px;
      vertical-align: middle;
      transform: translateY(-2px);
      opacity: 1;

      &.blinking {
        animation: cursor-blink 1s step-end infinite;
      }
    }
  }

  .echo-underline {
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(79, 233, 223, 0.3),
      transparent
    );
    overflow: hidden;

    .underline-wave {
      height: 100%;
      width: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-star-cyan),
        transparent
      );
      animation: wave-travel 3s ease-in-out infinite;
    }
  }
}

/* 控制区域 */
.splash-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;

  .auto-progress {
    position: relative;
    height: 3px;
    background: rgba(127, 191, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;

    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(
        90deg,
        var(--color-star-cyan),
        var(--color-star-blue)
      );
      border-radius: 2px;
      transition: width 0.1s linear;
      box-shadow: 0 0 8px rgba(79, 233, 223, 0.5);
    }

    .progress-text {
      position: absolute;
      right: 0;
      top: -25px;
      font-size: 0.9rem;
      color: rgba(230, 247, 255, 0.6);
    }
  }
}

/* 底部提示 */
.splash-footer {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  text-align: center;

  .hint-float {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(15, 43, 63, 0.4);
    border-radius: 20px;
    animation: hint-float 3s ease-in-out infinite;

  

    .hint-text {
      font-size: 0.9rem;
      color: rgba(230, 247, 255, 0.7);
    }
  }
}

/* 粒子画布 */
.particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

/* 过渡动画 */
.stellar-fade-enter-active,
.stellar-fade-leave-active {
  transition: opacity 1.2s ease, transform 1s ease;
}

.stellar-fade-enter-from {
  opacity: 0;
 
}

.stellar-fade-leave-to {
  opacity: 0;
 
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .splash-content {
    flex-direction: column;
    gap: 30px;
    text-align: center;
  }

  .tidal-divider {
    flex: none;
    width: 80%;
    height: 1px;

    .divider-line {
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      width: 100%;
    }

    .divider-orb {
      top: 50%;
      left: 50%;
    }
  }

  .stellar-brand,
  .echo-display {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .splash-content {
    padding: 20px;
    gap: 25px;
  }

  .stellar-emblem {
    width: 140px !important;
    height: 140px !important;
  }

  .stellar-typewriter {
    font-size: clamp(1.8rem, 5vw, 2.2rem) !important;
    min-height: 90px !important;
  }

 
}

/* 关键帧动画 */
@keyframes stars-drift {
  0% {
    background-position: 0 0, 100px 150px, 200px 300px;
  }
  100% {
    background-position: 200px 200px, 300px 350px, 400px 500px;
  }
}

@keyframes waves-flow {
  0%,
  100% {
    transform: translateY(0) scaleY(1);
  }
  50% {
    transform: translateY(-10px) scaleY(1.05);
  }
}

@keyframes nebula-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

@keyframes core-pulse {
  0%,
  100% {
    transform: scale(1);
    filter: blur(1px);
  }
  50% {
    transform: scale(1.03);
    filter: blur(1.5px);
  }
}

@keyframes glow-breathe {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

@keyframes ring-expand {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes title-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes orb-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes cursor-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.3;
  }
}

@keyframes wave-travel {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes hint-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes hint-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>