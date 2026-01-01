<template>
  <main class="shouanren-home" role="main" aria-label="守岸人星域主页">
    <!-- 动态星域背景 -->
    <div class="stellar-bg" aria-hidden="true">
      <div class="nebula-layer"></div>
      <div class="tidal-layer"></div>
      <div class="starlight-particles"></div>
    </div>

    <!-- 星空飘落物 (优化版) -->
    <canvas
      ref="canvasEl"
      class="starfall-canvas"
      aria-hidden="true"
      :data-count="isMobile ? 8 : 15"
    ></canvas>

    <!-- 背景轮播优化 -->
    <div class="gallery-display" aria-hidden="true">
      <transition-group name="gallery-fade" tag="div" class="gallery-container">
        <div
          v-for="(src, idx) in activeImages"
          :key="`gallery-${src}`"
          class="gallery-frame"
          :class="{ active: idx === currentIndex }"
          :style="{ '--delay': idx * 0.1 + 's' }"
        >
          <img
            :src="src"
            :alt="`守岸人主题图 ${idx + 1}`"
            class="gallery-image"
            loading="lazy"
          />
          <div class="frame-overlay"></div>
        </div>
      </transition-group>
    </div>

    <!-- 主内容区域 -->
    <section class="stellar-content">
      <!-- 星域徽标 -->
      <div class="stellar-logo">
        <div class="logo-core">
          <div class="core-light"></div>
          <div class="core-ripple"></div>
        </div>
        <div class="logo-orbits">
          <div class="orbit orbit-1"></div>
          <div class="orbit orbit-2"></div>
        </div>
      </div>

      <!-- 标题区域 -->
      <div class="title-section">
        <h1 class="main-title">
          <span class="title-part title-part-1">星域守望者</span>
          <span class="title-part title-part-2">  ·守岸人</span>
        </h1>

        <!-- 动态副标题 -->
        <div class="echo-subtitle" aria-live="polite">
          <div class="echo-prefix" aria-hidden="true">
            <span class="prefix-text">潮光低语</span>
          </div>
          <div class="echo-typing">
            <p class="typing-text">
              <span class="typed">{{ typed }}</span>
              <span
                class="typing-cursor"
                :class="{ blinking: isTypingActive }"
                aria-hidden="true"
              ></span>
            </p>
            <div class="echo-wave"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 简洁页脚 -->
    <footer class="stellar-footer" role="contentinfo">
      <div class="footer-content">
        <div class="footer-echo">
          <div class="echo-line"></div>
          <p class="echo-text">潮声为灯 · 星海为路</p>
          <div class="echo-line"></div>
        </div>
        <p class="footer-copyright">
          © {{ year }} 守岸人星域 ·
          <span class="author">织梦者：霜落天亦</span>
        </p>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

// ========== 基础状态 ==========
const year = new Date().getFullYear();
const isMobile = ref(false);

// ========== Canvas 星落效果 ==========
const canvasEl = ref<HTMLCanvasElement | null>(null);
let animationId = 0;
let lastTime = 0;

interface StarParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  swaySpeed: number;
  swayPhase: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
}

const particles = ref<StarParticle[]>([]);
const PARTICLE_COUNT = computed(() => (isMobile.value ? 8 : 15));

// 守岸人主题颜色
const STAR_COLORS = [
  "rgba(79, 233, 223, 0.8)", // 星辉青
  "rgba(127, 191, 255, 0.7)", // 星芒蓝
  "rgba(166, 233, 255, 0.6)", // 淡海蓝
  "rgba(255, 255, 255, 0.5)", // 纯白光点
];

function initParticles() {
  particles.value = [];
  const canvas = canvasEl.value;
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  for (let i = 0; i < PARTICLE_COUNT.value; i++) {
    particles.value.push({
      x: Math.random() * width,
      y: Math.random() * -height * 0.5,
      size: 3 + Math.random() * 8,
      speed: 20 + Math.random() * 40,
      sway: 2 + Math.random() * 8,
      swaySpeed: 0.5 + Math.random() * 1.5,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      opacity: 0.3 + Math.random() * 0.7,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    });
  }
}

function updateParticles(deltaTime: number) {
  const canvas = canvasEl.value;
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  particles.value.forEach((p) => {
    // 垂直下落
    p.y += p.speed * deltaTime;

    // 水平漂移 (潮汐效果)
    p.swayPhase += p.swaySpeed * deltaTime;
    p.x += Math.sin(p.swayPhase) * p.sway * deltaTime;

    // 旋转
    p.rotation += p.rotationSpeed;

    // 边界重置
    if (p.y > height + p.size) {
      p.y = -p.size;
      p.x = Math.random() * width;
      p.swayPhase = Math.random() * Math.PI * 2;
    }

    if (p.x > width + p.size || p.x < -p.size) {
      p.x = Math.random() * width;
    }
  });
}

function drawParticles() {
  const canvas = canvasEl.value;
  const ctx = canvas?.getContext("2d");
  if (!ctx || !canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  // 清空画布 (带渐变淡出效果)
  ctx.fillStyle = "rgba(2, 15, 25, 0.1)";
  ctx.fillRect(0, 0, width, height);

  particles.value.forEach((p) => {
    const currentY = p.y;
    const distanceFactor = 1 - Math.min(currentY / height, 0.7);

    ctx.save();

    // 移动到粒子位置
    ctx.translate(p.x, currentY);
    ctx.rotate(p.rotation);

    // 绘制星形
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity * distanceFactor;

    // 绘制简单星形
    const size = p.size * distanceFactor;
    drawStar(ctx, size);

    // 添加光晕
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
    glow.addColorStop(0, p.color.replace("0.8", "0.3"));
    glow.addColorStop(1, "transparent");

    ctx.globalAlpha = 0.15 * distanceFactor;
    ctx.fillStyle = glow;
    ctx.fillRect(-size * 1.5, -size * 1.5, size * 3, size * 3);

    ctx.restore();
  });
}

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikes;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function animate(time: number) {
  if (!lastTime) lastTime = time;
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  updateParticles(deltaTime);
  drawParticles();

  animationId = requestAnimationFrame(animate);
}

function resizeCanvas() {
  const canvas = canvasEl.value;
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  initParticles();
}

// ========== 打字机效果 ==========
const typed = ref("");
const isTypingActive = ref(true);

// 精简版语录
const echoLines = [
  "回声为灯，潮汐为路。",
  "她在岸边，静静守候。",
  "潮息低语，替你守住话语。",
  "织纹一缝，弥补散落的诺言。",
  "以叙响织构为笔，她把回声缀连成路。",
  "当潮退去，岸边仍留一盏不灭的光。",
  "她用静默与耐心，替迷途的人留下一条回航的径。",
  "黑海岸的夜很深，她以回声为灯，替你送回未说的话。",
];

let lineIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimer: number | null = null;

const TYPING_SPEED = 80;
const DELETING_SPEED = 40;
const LINE_PAUSE = 1800;

function typeTick() {
  const currentLine = echoLines[lineIndex];

  if (!isDeleting) {
    // 打字
    typed.value = currentLine.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex >= currentLine.length) {
      // 完整显示后暂停
      typingTimer = setTimeout(() => {
        isDeleting = true;
        typeTick();
      }, LINE_PAUSE);
      return;
    }

    typingTimer = setTimeout(typeTick, TYPING_SPEED);
  } else {
    // 删除
    typed.value = currentLine.slice(0, charIndex - 1);
    charIndex--;

    if (charIndex <= 0) {
      // 删除完成后切换到下一句
      isDeleting = false;
      lineIndex = (lineIndex + 1) % echoLines.length;
      typingTimer = setTimeout(typeTick, 500);
      return;
    }

    typingTimer = setTimeout(typeTick, DELETING_SPEED);
  }
}

// ========== 图片加载逻辑 ==========
const modules1 = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
  eager: true,
});
const modules2 = import.meta.glob("@/assets/images2/*.{jpg,png,jpeg,webp}", {
  eager: true,
});

const allHorizontalImages: string[] = Object.values(modules1).map(
  (mod: any) => mod.default
);
const allVerticalImages: string[] = Object.values(modules2).map(
  (mod: any) => mod.default
);

const activeImages = ref<string[]>([]);
const currentIndex = ref(0);
const imagesLoaded = ref(0);
let galleryTimer: number | undefined;

function shuffleArray<T>(array: T[]): T[] {
  if (!array || array.length === 0) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function initGallery() {
  // 根据设备类型选择图片源
  const sourceImages = isMobile.value ? allVerticalImages : allHorizontalImages;

  if (!sourceImages || sourceImages.length === 0) {
    console.warn(`没有找到${isMobile.value ? "竖版" : "横版"}图片资源`);
    activeImages.value = [];
    return;
  }

  // 随机选择图片数量
  const maxCount = isMobile.value ? 3 : 5;
  const count = Math.min(maxCount, sourceImages.length);

  // 随机选择图片
  const shuffled = shuffleArray(sourceImages);
  activeImages.value = shuffled.slice(0, count);

  // 重置状态
  currentIndex.value = 0;
  imagesLoaded.value = 0;

  console.log(
    `已加载 ${activeImages.value.length} 张${
      isMobile.value ? "竖版" : "横版"
    }图片`
  );
}

function startGalleryTimer() {
  // 清理现有定时器
  if (galleryTimer) {
    clearInterval(galleryTimer);
  }

  // 只有多于1张图片时才启动轮播
  if (activeImages.value.length > 1) {
    galleryTimer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % activeImages.value.length;
    }, 5000);
  }
}

function handleImageLoad() {
  imagesLoaded.value++;
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  console.error(`图片加载失败: ${img.src}`);
}

function handleResize() {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth <= 768;

  // 如果设备类型发生变化，重新初始化画廊
  if (wasMobile !== isMobile.value) {
    console.log(
      `设备类型切换: ${wasMobile ? "移动端" : "桌面端"} -> ${
        isMobile.value ? "移动端" : "桌面端"
      }`
    );
    initGallery();
    startGalleryTimer();
  }
}
// ========== 生命周期 ==========
onMounted(() => {
  // 检测设备类型
  isMobile.value = window.innerWidth <= 768;

  // 初始化画廊
  initGallery();

  // 启动画廊轮播
  startGalleryTimer();
  // 启动打字效果
  typingTimer = setTimeout(typeTick, 800);

  // 初始化Canvas
  if (canvasEl.value) {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 延迟启动动画确保Canvas已就绪
    setTimeout(() => {
      lastTime = 0;
      animationId = requestAnimationFrame(animate);
    }, 100);
  }
});

onBeforeUnmount(() => {
  // 清理所有定时器和监听器
  if (typingTimer) clearTimeout(typingTimer);
  if (galleryTimer) clearInterval(galleryTimer);
  if (animationId) cancelAnimationFrame(animationId);

  window.removeEventListener("resize", handleResize); // 修改为新的处理函数
});
</script>

<style scoped lang="scss">
/* 守岸人主题变量 */
.shouanren-home {
  --color-deep-space: #020f19;
  --color-stellar-blue: #0a1a2a;
  --color-tidal-blue: #0f2b3f;
  --color-star-cyan: #4fe9df;
  --color-star-blue: #7fbfff;
  --color-mist-light: #e6f7ff;
  --color-echo-glow: #a6e9ff;

  --gradient-space: linear-gradient(
    180deg,
    var(--color-deep-space) 0%,
    var(--color-stellar-blue) 70%
  );
  --gradient-tidal: linear-gradient(
    180deg,
    transparent,
    rgba(15, 43, 63, 0.4) 30%,
    rgba(15, 43, 63, 0.2)
  );

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--gradient-space);
  color: var(--color-mist-light);
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  position: relative;
  overflow: hidden;
}

/* 星域背景层 */
.stellar-bg {
  position: absolute;
  inset: 0;
  z-index: 0;

  .nebula-layer {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 20% 30%,
        rgba(79, 233, 223, 0.05) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 70%,
        rgba(127, 191, 255, 0.03) 0%,
        transparent 50%
      );
    opacity: 0.6;
  }

  .tidal-layer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: var(--gradient-tidal);
    mask-image: linear-gradient(to top, black 20%, transparent);
  }

  .starlight-particles {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        1px at 10% 20%,
        rgba(255, 255, 255, 0.8) 1px,
        transparent 2px
      ),
      radial-gradient(
        1px at 90% 80%,
        rgba(127, 191, 255, 0.7) 1px,
        transparent 2px
      );
    background-size: 150px 150px, 200px 200px;
    opacity: 0.1;
    animation: stars-drift 120s linear infinite;
  }
}

/* 星空飘落Canvas */
.starfall-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.7;
}

/* 画廊展示 */
.gallery-display {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 30%,
      rgba(2, 15, 25, 0.7) 70%
    );
    z-index: 1;
  }
}

.gallery-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.gallery-frame {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.2s ease;

  &.active {
    opacity: 1;
  }

  &:nth-child(1) {
    z-index: 4;
  }
  &:nth-child(2) {
    z-index: 3;
  }
  &:nth-child(3) {
    z-index: 2;
  }
  &:nth-child(4) {
    z-index: 1;
  }
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7) contrast(1.1) saturate(0.9);
  animation: gallery-float 60s ease-in-out infinite;
}

.frame-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    rgba(2, 15, 25, 0.4) 0%,
    transparent 50%,
    rgba(2, 15, 25, 0.6) 100%
  );
}

/* 主内容区域 */
.stellar-content {
  position: relative;
  z-index: 5;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 40px;
}

/* 星域徽标 */
.stellar-logo {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 20px;

  .logo-core {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle at 30% 30%,
      var(--color-star-cyan),
      var(--color-star-blue) 70%,
      transparent 90%
    );
    filter: blur(1px);
    animation: core-pulse 6s ease-in-out infinite;

    .core-light {
      position: absolute;
      inset: -10px;
      background: radial-gradient(
        circle,
        var(--color-star-cyan) 0%,
        transparent 70%
      );
      opacity: 0.4;
      filter: blur(15px);
      animation: light-breathe 4s ease-in-out infinite;
    }

    .core-ripple {
      position: absolute;
      inset: 0;
      border: 1px solid rgba(127, 191, 255, 0.3);
      border-radius: 50%;
      animation: ripple-expand 3s ease-out infinite;
    }
  }

  .logo-orbits {
    position: absolute;
    inset: 0;

    .orbit {
      position: absolute;
      border: 1px solid rgba(79, 233, 223, 0.2);
      border-radius: 50%;

      &.orbit-1 {
        inset: -20px;
        animation: orbit-rotate 20s linear infinite;
      }

      &.orbit-2 {
        inset: -40px;
        animation: orbit-rotate 30s linear infinite reverse;
      }
    }
  }
}

/* 标题区域 */
.title-section {
  max-width: 800px;
  margin: 0 auto;

  .main-title {
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 30px;

    .title-part {
    
      &-1 {
        background: linear-gradient(
          135deg,
          var(--color-mist-light) 0%,
          var(--color-star-cyan) 50%
        );
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: title-shimmer 8s ease-in-out infinite;
      }

      &-2 {
        color: var(--color-star-blue);
        font-size: 0.8em;
        font-weight: 400;
        letter-spacing: 0.3em;
        margin-top: 10px;
      }
    }
  }
}

/* 回声副标题 */
.echo-subtitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;

  .echo-prefix {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(230, 247, 255, 0.8);
    font-size: 1rem;
  }

  .echo-typing {
    position: relative;
    min-height: 80px;
    width: 100%;

    .typing-text {
      font-size: clamp(1.2rem, 3vw, 1.8rem);
      font-weight: 500;
      line-height: 1.4;
      color: var(--color-echo-glow);
      text-shadow: 0 2px 10px rgba(79, 233, 223, 0.2);
      min-height: 1.4em;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

      .typed {
        display: inline-block;
        letter-spacing: 0.5px;
      }

      .typing-cursor {
        display: inline-block;
        width: 3px;
        height: 1.2em;
        background: var(--color-star-blue);
        margin-left: 5px;
        vertical-align: middle;

        &.blinking {
          animation: cursor-blink 1s step-end infinite;
        }
      }
    }

    .echo-wave {
      width: 100%;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(79, 233, 223, 0.3),
        transparent
      );
      margin-top: 10px;
      overflow: hidden;

      &::after {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
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
}

/* 简洁页脚 */
.stellar-footer {
  position: relative;
  z-index: 5;
  padding: 30px 20px;
  background: rgba(2, 15, 25, 0.5);
  border-top: 1px solid rgba(127, 191, 255, 0.1);
  backdrop-filter: blur(5px);

  .footer-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .footer-echo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 15px;

    .echo-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(79, 233, 223, 0.3),
        transparent
      );
    }

    .echo-text {
      font-size: 1.1rem;
      color: var(--color-star-cyan);
      font-weight: 500;
      white-space: nowrap;
    }
  }

  .footer-copyright {
    font-size: 0.9rem;
    color: rgba(230, 247, 255, 0.6);

    .author {
      color: rgba(127, 191, 255, 0.8);
      margin-left: 5px;
    }
  }
}

/* 动画关键帧 */
@keyframes stars-drift {
  0% {
    background-position: 0 0, 100px 100px;
  }
  100% {
    background-position: 150px 150px, 250px 250px;
  }
}

@keyframes core-pulse {
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

@keyframes light-breathe {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes ripple-expand {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes orbit-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

@keyframes gallery-float {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.02) translateY(-10px);
  }
}

.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 1.2s ease !important;
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shouanren-home {
    min-height: 100vh;
  }

  .stellar-content {
    padding: 30px 15px;
    gap: 30px;
  }

  .stellar-logo {
    width: 90px;
    height: 90px;
  }

  .echo-subtitle .echo-typing {
    min-height: 70px;

    .typing-text {
      font-size: 1.1rem;
    }
  }

  .stellar-footer {
    padding: 20px 15px;

    .footer-echo {
      gap: 10px;

      .echo-text {
        font-size: 1rem;
      }
    }

    .footer-copyright {
      font-size: 0.8rem;
    }
  }
}
</style>