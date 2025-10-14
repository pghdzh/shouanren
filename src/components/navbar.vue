<template>
  <header class="app-header">
    <h1 class="title">守岸人电子设定集</h1>
    <!-- 在线人数展示 -->
    <div class="online-count" v-if="onlineCount !== null">
      当前在线：<span class="count">{{ onlineCount }}人</span>
    </div>

    <!-- 随机播放控件（在 logo 右侧） -->
    <div class="player">
      <div class="player__info" v-if="currentSongName">
        <span class="player__song">{{ currentSongName }}</span>
      </div>
      <button @click="togglePlay" class="player__btn">
        {{ playing ? '⏸️' : '▶️' }}
      </button>
      <button @click="playRandom" class="player__btn">🔀</button>
    </div>
    <!-- 移动端汉堡按钮 -->
    <button class="hamburger" @click="toggleMobileNav" aria-label="Toggle navigation">
      <span :class="{ open: mobileNavOpen }"></span>
      <span :class="{ open: mobileNavOpen }"></span>
      <span :class="{ open: mobileNavOpen }"></span>
    </button>

    <!-- 普通导航 & 移动端下拉导航 -->
    <nav :class="['nav-links', { 'mobile-open': mobileNavOpen }]">
      <RouterLink v-for="item in navItems" :key="item.name" :to="item.path" class="nav-item" active-class="active-link"
        @click="mobileNavOpen = false">
        {{ item.name }}
      </RouterLink>

      <a href="http://slty.site/#/redirector" target="_blank" rel="noopener" class="nav-item" active-class="active-link"
        @click="mobileNavOpen = false">
        霜落映界
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { io } from "socket.io-client";

const navItems = [
  { name: "潮息·守望", path: "/" }, // 首页 — 潮的呼吸与守望感，适合波纹或呼吸光效
  { name: "潮纹年谱", path: "/timeLine" }, // 人物简介 — 年谱/时间线感，像潮纹记录记忆
  { name: "潮铭·寄愿", path: "/message" }, // 留言板 — 将愿望刻为潮铭，适合涟漪留言动效
  { name: "岸影典藏", path: "/gallery" }, // 图集 — 「岸影」与「典藏」，更有珍藏感
  { name: "织典·器匣", path: "/resources" }, // 资源分享 — 织物/器匣意象，适配资料库与素材下载
   { name: "潮愿·祈引", path: "/wish" }, // 资源分享 — 织物/器匣意象，适配资料库与素材下载
   { name: "回音馆·泠语", path: "/voice" }, // 语音馆 — 回声与低语，适合波形/共鸣动画
  { name: "潮祭·铭恩", path: "/thanks" },   
 
];

const mobileNavOpen = ref(false);
function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value;
}

const siteId = "shouanren";

const onlineCount = ref<number | null>(null);

// 连接时带上 query.siteId
const socket: any = io("http://1.94.189.79:3000", {
  query: { siteId },
});


// 音频播放器
const audio = new Audio();
audio.preload = 'auto';
const playing = ref(false);
const currentSong = ref<string | null>(null);

// 从 public/songs 目录下的文件名列表（需在构建时或通过接口获取）
const songList = [
  '漂泊的终点(守岸人主题钢琴曲)-千里星寻.mp3',
  '守岸人PV溯而复始-千里星寻.mp3',
  '守岸人剧情告白EP-千里星寻.mp3',
  '守岸人剧情告别EP-千里星寻.mp3',
  '守岸人剧情结局主题曲-千里星寻.mp3'
].map(name => `/songs/${name}`);

// 随机播放

function playRandom() {
  const idx = Math.floor(Math.random() * songList.length);
  currentSong.value = songList[idx];

  audio.src = currentSong.value;
  audio.play();
  playing.value = true;
}

// 播放/暂停 切换
function togglePlay() {
  if (!currentSong.value) {
    playRandom();
  } else if (playing.value) {
    audio.pause();
    playing.value = false;
  } else {
    audio.play();
    playing.value = true;
  }
}

// 监听音频播放结束，自动下一曲
audio.addEventListener('ended', () => {
  playRandom();
});



const currentSongName = computed(() => {
  if (!currentSong.value) return '';
  const parts = currentSong.value.split('/');
  return parts[parts.length - 1];
});


onMounted(() => {
  socket.on("onlineCount", (count: number) => {
    onlineCount.value = count;
  });
});

onBeforeUnmount(() => {
  socket.disconnect();
});
</script>

<style scoped lang="scss">
.app-header {
  /* 主题色变量（便于统一调整） */
  --deep-bg: rgba(3, 18, 38, 0.72);
  /* 深海底色（半透明玻璃） */
  --glass-accent: rgba(6, 30, 56, 0.5);
  --accent: #4fe9df;
  /* 主点光（海蓝青） */
  --accent-2: #7fbfff;
  /* 次级冷光（淡蓝） */
  --muted-text: #d9eef6;
  --faint: rgba(127, 191, 255, 0.08);

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background: linear-gradient(180deg, var(--deep-bg), rgba(2, 12, 28, 0.6));
  backdrop-filter: blur(14px) saturate(1.05);
  box-shadow: 0 6px 30px rgba(11, 30, 48, 0.45),
    0 0 18px rgba(79, 233, 223, 0.06) inset;
  border-bottom: 1px solid rgba(127, 191, 255, 0.06);
  animation: fadeInDown 0.6s ease-out both;
}

/* 标题 - 保持高识别但色系偏冷光 */
.title {
  font-size: 26px;
  font-weight: 700;
  color: var(--muted-text);
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 20px rgba(31, 60, 80, 0.35);
  transition: transform 0.28s ease, text-shadow 0.28s ease;
  letter-spacing: 0.6px;
}

.title:hover {
  transform: translateY(-2px) scale(1.03);
  text-shadow: 0 6px 28px rgba(79, 233, 223, 0.12);
}

/* 在线人数 */
.online-count {
  position: relative;
  margin-left: 16px;
  padding: 6px 14px;
  font-family: "Cinzel Decorative", serif;
  font-size: 1rem;
  color: var(--muted-text);
  background: linear-gradient(135deg,
      rgba(79, 233, 223, 0.04),
      rgba(127, 191, 255, 0.03));
  border: 1px solid rgba(79, 233, 223, 0.12);
  border-radius: 24px;
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 20px rgba(3, 18, 38, 0.45),
    0 0 10px rgba(79, 233, 223, 0.06);
  overflow: hidden;
  cursor: default;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.online-count::before {
  content: "";
  position: absolute;
  bottom: -2px;
  left: -40%;
  width: 180%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-2), transparent);
  opacity: 0.9;
  filter: blur(6px);
  transform: translateZ(0);
}

.online-count:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(3, 18, 38, 0.55),
    0 0 20px rgba(79, 233, 223, 0.08);
}

.online-count .count {
  display: inline-block;
  margin-left: 6px;
  font-weight: 700;
  color: var(--accent-2);
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 8px rgba(79, 233, 223, 0.08);
}

/* 随机播放器样式 */
.player {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 1.5rem;
  backdrop-filter: blur(4px);

  .player__info {
    margin-right: 0.5rem;

    .player__song {
      color: #FFFFFF;
      font-size: 0.875rem;
    }
  }

  .player__btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    margin: 0 0.25rem;
    cursor: pointer;
    color: #FFFFFF;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }
}


/* 导航链接 */
.nav-links {
  display: flex;
  gap: 22px;
  align-items: center;
}

.nav-item {
  position: relative;
  color: var(--muted-text);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.18s ease;
  padding: 6px 4px;
  border-radius: 6px;
}

/* 下划线使用渐变流光 + 缓动展开以表现潮汐/回声感 */
.nav-item::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg,
      transparent,
      var(--accent),
      var(--accent-2),
      transparent);
  transition: width 0.36s cubic-bezier(0.2, 0.9, 0.2, 1),
    left 0.36s cubic-bezier(0.2, 0.9, 0.2, 1), opacity 0.28s;
  transform: translateX(-50%);
  opacity: 0.9;
  border-radius: 3px;
  filter: blur(0.6px);
}

.nav-item:hover {
  color: var(--accent-2);
  transform: translateY(-2px);
  text-shadow: 0 0 8px rgba(127, 191, 255, 0.04);
}

.nav-item:hover::after {
  width: 70%;
  left: 50%;
  opacity: 1;
}

/* 激活态 */
.active-link {
  color: var(--accent);
  font-weight: 600;
}

.active-link::after {
  width: 100%;
  opacity: 1;
}

/* 给导航下划线增加缓慢的“流动感” */
@keyframes flow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 将动画仅用于 ::after 的背景（需要浏览器支持）*/
.nav-item::after {
  background-size: 200% 100%;
  animation: flow 6s linear infinite;
}

/* 汉堡按钮 */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 28px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 3px;
  background: rgba(220, 245, 243, 0.9);
  border-radius: 2px;
  transition: transform 0.28s ease, opacity 0.28s ease, background 0.28s;
  box-shadow: 0 2px 8px rgba(12, 30, 40, 0.35);
}

.hamburger span.open:nth-child(1) {
  transform: translateY(10px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: translateY(-10px) rotate(-45deg);
}

/* 响应式：小屏折叠导航 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 20px;
  }

  .title {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: linear-gradient(180deg,
        rgba(2, 12, 28, 0.96),
        rgba(3, 18, 38, 0.98));
    backdrop-filter: blur(12px);
    gap: 0;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.34s ease;
    border-top: 1px solid rgba(127, 191, 255, 0.04);
  }

  .nav-links.mobile-open {
    max-height: 520px;
  }

  .nav-links .nav-item {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }
}

/* 动效：微弱浮动，增强守望/呼吸感 */
@keyframes float-slow {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }

  100% {
    transform: translateY(0);
  }
}

.title {
  animation: float-slow 8s ease-in-out infinite;
}
</style>
