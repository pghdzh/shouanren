<template>
  <section
    class="shorekeeper-player"
    @keydown.space.prevent="onSpace"
    tabindex="0"
    aria-label="守岸人音乐播放器"
  >
    <!-- 星空背景层 -->
    <div class="stellar-bg"></div>

    <!-- 晶体碎片装饰 -->
    <div class="crystal-fragment" style="top: 10%; left: 5%"></div>
    <div class="crystal-fragment" style="bottom: 15%; right: 8%"></div>

    <div class="stage">
      <!-- 左侧：封面与控制区 -->
      <div class="left" role="region" aria-label="播放器控制区">
        <!-- 封面区域 - 包含视频背景 -->
        <div class="cover" :style="coverStyle">
          <!-- 视频背景 -->
          <video
            v-if="videoSrc"
            class="video-background"
            :src="videoSrc"
            autoplay
            muted
            loop
            playsinline
            aria-hidden="true"
            tabindex="-1"
            :class="videoClass"
          ></video>

          <!-- 覆盖层 - 增加深海效果 -->
          <div class="cover-overlay">
            <div class="crystal-shine"></div>
            <div class="wave-effect"></div>
          </div>

          <!-- 加载遮罩 -->
          <div v-if="loadingAudio" class="loading-overlay" aria-hidden="true">
            <div class="spinner">
              <div class="crystal-spinner"></div>
            </div>
            <div class="loading-text">星域加载中…</div>
          </div>

          <!-- 当前播放标识 -->
          <div class="now-playing" v-if="current && playing">
            <span class="pulse-dot"></span>
            <span class="now-text">回响中</span>
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="controls">
          <div class="track-info">
            <div class="title" :title="current?.title || '未选择曲目'">
              <span class="icon-note">♪</span>
              {{ current?.title || "星域静谧" }}
            </div>
            <div class="subtitle" v-if="current?.title">
              深海回响 · 晶体频率
            </div>
          </div>

          <!-- 时间与进度 -->
          <div class="time-display">
            <span class="time current">{{ formatTime(currentTime) }}</span>
            <div
              class="progress-wrap"
              ref="progressWrap"
              @click="seekByClick"
              @pointerdown.prevent="onPointerDownProgress"
              role="slider"
              :aria-valuemin="0"
              :aria-valuemax="duration"
              :aria-valuenow="currentTime"
              aria-label="播放进度"
            >
              <div class="progress-bar">
                <div class="progress-track"></div>
                <div
                  class="progress-fill"
                  :style="{ width: progressPercent + '%' }"
                ></div>
                <div
                  class="progress-glow"
                  :style="{ width: progressPercent + '%' }"
                ></div>
              </div>
              <div
                class="progress-handle"
                :style="{ left: progressPercent + '%' }"
                aria-hidden="true"
              >
                <div class="handle-glow"></div>
              </div>
            </div>
            <span class="time total">{{ formatTime(duration) }}</span>
          </div>

          <!-- 主要控制按钮 -->
          <div class="primary-controls">
            <button
              class="control-btn prev"
              @click="prev"
              aria-label="上一频率"
              title="溯洄"
            >
              <span class="icon">⟵</span>
            </button>

            <button
              class="play-btn"
              @click="togglePlay"
              :aria-pressed="playing"
              :aria-label="playing ? '暂停回响' : '开始回响'"
              :class="{ playing: playing }"
            >
              <div class="play-icon">
                <div class="play-triangle" v-if="!playing"></div>
                <div class="pause-bars" v-else>
                  <div class="pause-bar"></div>
                  <div class="pause-bar"></div>
                </div>
              </div>
              <div class="pulse-ring" v-if="playing"></div>
            </button>

            <button
              class="control-btn next"
              @click="next"
              aria-label="下一频率"
              title="溯游"
            >
              <span class="icon">⟶</span>
            </button>
          </div>

          <!-- 次要控制 -->
          <div class="secondary-controls">
            <!-- 播放模式 -->
            <div class="mode-controls" role="group" aria-label="回响模式">
              <button
                :class="['mode-btn', { active: shuffle }]"
                @click="toggleShuffle"
                :title="shuffle ? '随机共鸣' : '顺序共鸣'"
              >
                <span class="icon">🔀</span>
                <span class="tooltip">{{ shuffle ? "随机" : "顺序" }}</span>
              </button>
              <button
                :class="['mode-btn', { active: repeatMode !== 'off' }]"
                @click="toggleRepeat"
                :title="
                  repeatMode === 'one'
                    ? '单曲循环'
                    : repeatMode === 'all'
                    ? '列表循环'
                    : '循环关闭'
                "
              >
                <span class="icon">🔁</span>
                <span class="tooltip">{{
                  repeatMode === "one"
                    ? "单曲"
                    : repeatMode === "all"
                    ? "循环"
                    : "关闭"
                }}</span>
              </button>
            </div>

            <!-- 音量控制 -->
            <div class="volume-control" aria-label="音量调节">
              <div class="volume-icon">♪</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="volume"
                class="volume-slider"
                aria-label="音量大小"
              />
              <div
                class="volume-level"
                :style="{ width: volume * 100 + '%' }"
              ></div>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="errorMessage" class="error-msg" role="status">
            <span class="error-icon">⚠</span>
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- 右侧：播放列表 -->
      <div
        class="right"
        :class="{ collapsed: !playlistOpen && isMobile }"
        role="region"
        aria-label="回响序列"
      >
        <!-- 列表头部 -->
        <div class="playlist-header">
          <div class="header-main">
            <h3>
              <span class="icon-list">📜</span>
              回响序列
              <span class="count" v-if="!searchTerm">({{ list.length }})</span>
              <span class="count" v-else
                >({{ filteredList.length }}/{{ list.length }})</span
              >
            </h3>

            <!-- 移动端切换按钮 -->
            <button
              class="toggle-playlist"
              @click="togglePlaylist"
              :title="playlistOpen ? '收起序列' : '展开序列'"
              v-if="isMobile"
            >
              <span class="toggle-icon">{{ playlistOpen ? "▽" : "△" }}</span>
              <span class="toggle-text">{{
                playlistOpen ? "收起" : "展开"
              }}</span>
            </button>
          </div>

          <!-- 搜索框 -->
          <div class="search-wrap">
            <div class="search-icon">🔍</div>
            <input
              v-model="searchTerm"
              @input="onSearchInput"
              placeholder="解析频率..."
              aria-label="搜索回响"
              class="search-input"
            />
            <button
              v-if="searchTerm"
              class="clear-search"
              @click="clearSearch"
              aria-label="清除搜索"
            >
              <span class="clear-icon">✕</span>
            </button>
          </div>

          <!-- 状态提示 -->
          <div class="status-hint">
            <span v-if="loading">🔄 加载序列中…</span>
            <span v-else-if="!list.length">🌌 序列空置</span>
            <span v-else-if="searchTerm && !filteredList.length"
              >🔍 无匹配频率</span
            >
          </div>
        </div>

        <!-- 列表区域 -->
        <div class="list-area">
          <!-- 加载状态 -->
          <div v-if="loading" class="list-loading">
            <div class="loading-crystal"></div>
            <span>共鸣加载中…</span>
          </div>

          <!-- 列表内容 -->
          <ul class="playlist" role="list" v-else>
            <li
              v-for="(item, idx) in filteredList"
              :key="item.name || idx"
              :class="{
                active: idx === index,
                playing: idx === index && playing,
              }"
              @click="selectTrack(idx)"
              @keyup.enter="selectTrack(idx)"
              tabindex="0"
              role="listitem"
              :aria-current="idx === index ? 'true' : 'false'"
            >
              <!-- 曲目序号与状态 -->
              <div class="track-index">
                <div class="index-number">{{ idx + 1 }}</div>
                <div class="playing-indicator" v-if="idx === index && playing">
                  <div class="sound-wave">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                  </div>
                </div>
              </div>

              <!-- 曲目信息 -->
              <div class="track-info">
                <div class="track-title" :title="item.title">
                  {{ item.title }}
                </div>
                <div class="track-meta">
                  <span class="meta-item">频率 {{ idx + 1 }}</span>
                  <span class="meta-divider">•</span>
                  <span class="meta-item">{{
                    item.duration ? formatTime(item.duration) : "--:--"
                  }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="track-actions">
                <button
                  class="action-btn play-track"
                  @click.stop="selectTrack(idx)"
                  :title="idx === index && playing ? '暂停' : '播放'"
                >
                  {{ idx === index && playing ? "⏸" : "▶" }}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- audio元素 -->
    <audio
      crossorigin="anonymous"
      ref="audioRef"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @loadedmetadata="onLoadedMetadata"
      @error="onAudioError"
      preload="metadata"
    ></audio>

    <!-- 音频可视化背景 -->
    <canvas class="visualizer" ref="visualizer" v-if="playing"></canvas>
  </section>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { getMusicList, getMusicUrl } from "@/api/modules/music";

// 类型定义
type MusicItem = {
  name: string;
  title: string;
  url?: string;
  duration?: number | null;
};

// 响应式数据
const list = ref<MusicItem[]>([]);
const loading = ref(false);
const index = ref<number>(-1);
const playing = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);
const currentTime = ref<number>(0);
const duration = ref<number>(0);
const volume = ref<number>(
  Number(localStorage.getItem("shorekeeper_volume") ?? 0.7)
);
const shuffle = ref<boolean>(false);
const repeatMode = ref<"off" | "one" | "all">("off");

const progressWrap = ref<HTMLElement | null>(null);
const dragging = ref(false);
const playlistOpen = ref(true);
const errorMessage = ref<string | null>(null);
const loadingAudio = ref(false);
const visualizer = ref<HTMLCanvasElement | null>(null);
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let animationFrameId: number | null = null;

// 响应式设计
const isMobile = ref<boolean>(window.innerWidth <= 920);
window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth <= 920;
});

// 视频源处理
const videoSrc = ref("");
const videoClass = ref("");

// 搜索相关
const searchTerm = ref("");
let searchTimer: any = null;
const searchDebounceMs = 240;

// 计算属性
const current = computed(() =>
  index.value >= 0 && list.value[index.value] ? list.value[index.value] : null
);

const progressPercent = computed(() =>
  duration.value
    ? Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100))
    : 0
);

// 守岸人风格封面渐变
const coverStyle = computed(() => {
  const colors = [
    "rgba(79, 233, 223, 0.1)", // star-cyan
    "rgba(127, 191, 255, 0.08)", // star-blue
    "rgba(166, 233, 255, 0.06)", // echo-glow
    "rgba(255, 121, 198, 0.04)", // crystal-pink
  ];

  const title = current.value?.title || "shorekeeper";
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color1 = colors[Math.abs(hash) % colors.length];
  const color2 = colors[Math.abs(hash * 3) % colors.length];

  return {
    background: `
      radial-gradient(circle at 30% 30%, ${color1}, transparent 40%),
      radial-gradient(circle at 70% 70%, ${color2}, transparent 40%),
      linear-gradient(135deg, rgba(2, 15, 25, 0.3), rgba(10, 26, 42, 0.5))
    `,
  };
});

const filteredList = computed(() => {
  const term = (searchTerm.value || "").trim().toLowerCase();
  if (!term) return list.value;
  return list.value.filter(
    (i) =>
      (i.title || "").toLowerCase().includes(term) ||
      (i.name || "").toLowerCase().includes(term)
  );
});

// 音频可视化
function initVisualizer() {
  if (!visualizer.value || !audioRef.value) return;

  const canvas = visualizer.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaElementSource(audioRef.value);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  function draw() {
    if (!playing.value || !analyser || !ctx) {
      animationFrameId = null;
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制深海波纹效果
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    // 渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(79, 233, 223, 0.05)");
    gradient.addColorStop(1, "rgba(127, 191, 255, 0.02)");

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;

      // 创建晶体渐变
      const barGradient = ctx.createLinearGradient(
        x,
        canvas.height - barHeight,
        x + barWidth,
        canvas.height
      );
      barGradient.addColorStop(0, "rgba(79, 233, 223, 0.8)");
      barGradient.addColorStop(0.5, "rgba(127, 191, 255, 0.6)");
      barGradient.addColorStop(1, "rgba(255, 121, 198, 0.4)");

      ctx.fillStyle = barGradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      // 添加光晕效果
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(79, 233, 223, 0.5)";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, 2);
      ctx.shadowBlur = 0;

      x += barWidth + 1;
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();
}

// 原有方法（保持功能不变，仅调整部分文案）
async function fetchList() {
  loading.value = true;
  try {
    const res = await getMusicList();
    const items =
      res?.ok && Array.isArray(res.list)
        ? res.list
        : Array.isArray(res)
        ? res
        : res?.list ?? [];

    list.value = items.map((it: any) => ({
      name: it.name,
      title:
        it.title ?? (it.name ? it.name.replace(/\.mp3$/i, "") : "未知频率"),
      url: getMusicUrl(it.name),
      duration: null,
    }));
  } catch (e) {
    console.error("获取回响序列失败", e);
    list.value = [];
    errorMessage.value = "序列加载失败";
  } finally {
    loading.value = false;
  }
}

async function safeSetSrc(url: string) {
  const a = audioRef.value!;
  errorMessage.value = null;
  loadingAudio.value = true;

  try {
    // 测试资源可用性
    try {
      await fetch(url, { method: "HEAD" });
    } catch (e) {
      console.warn("HEAD请求失败，继续尝试", e);
    }

    a.src = url;
    a.load();
  } catch (err) {
    console.error("设置音源失败", err);
    errorMessage.value = "频率解析失败";
    throw err;
  }
}

async function loadCurrent(doPlay = false) {
  const a = audioRef.value;
  const curr = current.value;
  if (!a || !curr) return;

  a.pause();
  duration.value = 0;
  currentTime.value = 0;

  try {
    await safeSetSrc(curr.url || getMusicUrl(curr.name));
    if (doPlay) {
      await play();
      if (visualizer.value) {
        initVisualizer();
      }
    }
  } catch {
    playing.value = false;
    loadingAudio.value = false;
  }
}

async function play() {
  const a = audioRef.value;
  if (!a) return;

  try {
    // 尝试恢复AudioContext（如果被暂停）
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }

    await a.play();
    playing.value = true;
    errorMessage.value = null;

    // 启动可视化
    if (visualizer.value && !animationFrameId) {
      initVisualizer();
    }
  } catch (e: any) {
    console.warn("回响失败", e);
    playing.value = false;
    errorMessage.value = "共鸣被阻止或频率不可用";
  }
}

function pause() {
  audioRef.value?.pause();
  playing.value = false;

  // 停止可视化
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function togglePlay() {
  if (!audioRef.value) return;
  if (playing.value) pause();
  else play();
}

function selectTrack(i: number) {
  if (i < 0 || i >= list.value.length) return;
  index.value = i;
  loadCurrent(true);
}

// 音频事件处理
function onTimeUpdate(e: Event) {
  const t = e.target as HTMLAudioElement;
  currentTime.value = t.currentTime || 0;
}

function onLoadedMetadata(e: Event) {
  const t = e.target as HTMLAudioElement;
  duration.value = isFinite(t.duration) ? t.duration : 0;
  if (current.value && !current.value.duration) {
    current.value.duration = duration.value;
  }
  loadingAudio.value = false;
}

function onEnded() {
  loadingAudio.value = false;

  if (repeatMode.value === "one") {
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      play();
    }
    return;
  }

  if (shuffle.value) {
    playRandom();
    return;
  }

  if (index.value < list.value.length - 1) {
    selectTrack(index.value + 1);
  } else {
    if (repeatMode.value === "all") {
      selectTrack(0);
    } else {
      playing.value = false;
    }
  }
}

function onAudioError(e: Event) {
  const a = audioRef.value;
  console.error("audio error", a?.error);
  errorMessage.value = "频率共振异常";
  playing.value = false;
  loadingAudio.value = false;
}

// 播放控制
function next() {
  if (!list.value.length) return;
  if (shuffle.value) {
    playRandom();
    return;
  }
  if (index.value < list.value.length - 1) selectTrack(index.value + 1);
  else if (repeatMode.value === "all") selectTrack(0);
}

function prev() {
  if (!audioRef.value) return;
  if (audioRef.value.currentTime > 4) {
    audioRef.value.currentTime = 0;
    return;
  }
  if (index.value > 0) selectTrack(index.value - 1);
  else if (repeatMode.value === "all") selectTrack(list.value.length - 1);
}

function playRandom() {
  if (!list.value.length) return;
  if (list.value.length === 1) {
    selectTrack(0);
    return;
  }
  let i = index.value;
  while (i === index.value) {
    i = Math.floor(Math.random() * list.value.length);
  }
  selectTrack(i);
}

// 进度条控制
function seekByClick(e: MouseEvent | TouchEvent) {
  if (!progressWrap.value || !duration.value || !audioRef.value) return;

  const rect = progressWrap.value.getBoundingClientRect();
  const clientX =
    (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX;
  if (clientX == null) return;

  const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
  const ratio = x / rect.width;
  audioRef.value.currentTime = ratio * duration.value;
  currentTime.value = audioRef.value.currentTime;
}

function onPointerDownProgress(e: PointerEvent) {
  if (!progressWrap.value || !audioRef.value || !duration.value) return;

  dragging.value = true;
  (e.target as Element).setPointerCapture?.(e.pointerId);
  window.addEventListener("pointermove", onPointerMoveProgress);
  window.addEventListener("pointerup", onPointerUpProgress);
  handlePointer(e);
}

function onPointerMoveProgress(e: PointerEvent) {
  handlePointer(e);
}

function onPointerUpProgress(e: PointerEvent) {
  dragging.value = false;
  window.removeEventListener("pointermove", onPointerMoveProgress);
  window.removeEventListener("pointerup", onPointerUpProgress);
}

function handlePointer(e: PointerEvent) {
  if (!progressWrap.value || !audioRef.value || !duration.value) return;

  const rect = progressWrap.value.getBoundingClientRect();
  const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
  const ratio = x / rect.width;
  audioRef.value.currentTime = ratio * duration.value;
  currentTime.value = audioRef.value.currentTime;
}

// 设置相关
watch(volume, (v) => {
  if (audioRef.value) audioRef.value.volume = v;
  localStorage.setItem("shorekeeper_volume", String(v));
});

function toggleShuffle() {
  shuffle.value = !shuffle.value;
}

function toggleRepeat() {
  if (repeatMode.value === "off") repeatMode.value = "all";
  else if (repeatMode.value === "all") repeatMode.value = "one";
  else repeatMode.value = "off";
}

// 键盘控制
function onSpace() {
  if (
    document.activeElement &&
    ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  )
    return;
  togglePlay();
}

// 播放列表控制
function togglePlaylist() {
  playlistOpen.value = !playlistOpen.value;
  if (playlistOpen.value) {
    nextTick(() => {
      const el = document.querySelector(".playlist li.active");
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }
}

// 搜索功能
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchTimer = null;
  }, searchDebounceMs);
}

function clearSearch() {
  searchTerm.value = "";
}

// 工具函数
function formatTime(sec?: number) {
  if (!sec || !isFinite(sec)) return "--:--";
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 生命周期
onMounted(async () => {
  audioRef.value = document.querySelector(
    ".shorekeeper-player audio"
  ) as HTMLAudioElement;
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }

  // 设置视频源
  const isM = isMobile.value;
  const folder = isM ? "/mp1" : "/mp2"; // 移动端用竖版，桌面端用横版
  const idx = Math.floor(Math.random() * 4) + 1;
  videoSrc.value = `${folder}/1 (${idx}).mp4`;
  videoClass.value = isM ? "landscape" : "portrait";

  await fetchList();

  window.addEventListener("keydown", globalKeydown);

  // 初始化可视化canvas尺寸
  if (visualizer.value) {
    const resizeObserver = new ResizeObserver(() => {
      if (visualizer.value) {
        visualizer.value.width = visualizer.value.offsetWidth;
        visualizer.value.height = visualizer.value.offsetHeight;
      }
    });
    resizeObserver.observe(visualizer.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", globalKeydown);

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  if (audioContext) {
    audioContext.close();
  }
});

// 全局键盘快捷键
function globalKeydown(e: KeyboardEvent) {
  if (e.code === "Space") {
    if (
      document.activeElement &&
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    )
      return;
    e.preventDefault();
    togglePlay();
  } else if (e.code === "Escape") {
    pause();
  } else if (e.code === "ArrowRight" && e.ctrlKey) {
    e.preventDefault();
    next();
  } else if (e.code === "ArrowLeft" && e.ctrlKey) {
    e.preventDefault();
    prev();
  }
}
</script>

<style scoped lang="scss">
/* ==== 守岸人主题变量 ==== */
.shorekeeper-player {
  --color-deep-space: #020f19;
  --color-stellar-blue: #0a1a2a;
  --color-tidal-blue: #0f2b3f;
  --color-star-cyan: #4fe9df;
  --color-star-blue: #7fbfff;
  --color-mist-light: #e6f7ff;
  --color-echo-glow: #a6e9ff;
  --color-crystal-pink: #ff79c6;

  /* 衍生变量 */
  --bg-primary: var(--color-deep-space);
  --bg-secondary: var(--color-stellar-blue);
  --bg-card: rgba(15, 43, 63, 0.7);
  --text-primary: var(--color-mist-light);
  --text-secondary: var(--color-echo-glow);
  --accent-primary: var(--color-star-cyan);
  --accent-secondary: var(--color-star-blue);
  --accent-emotion: var(--color-crystal-pink);
  --border-light: rgba(127, 191, 255, 0.15);
  --border-focus: rgba(79, 233, 223, 0.6);
  --glow-primary: rgba(79, 233, 223, 0.3);
  --glow-secondary: rgba(255, 121, 198, 0.2);
}

/* ==== 基础样式 ==== */
.shorekeeper-player {
  min-height: 100vh;
  color: var(--text-primary);
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC",
    system-ui, sans-serif;
  background: linear-gradient(
    160deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 40%,
    var(--color-tidal-blue) 100%
  );
  outline: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding-top: 80px;
}

/* 星空背景 */
.stellar-bg {
  position: absolute;
  inset: 0;
  z-index: -10;
  background-image: radial-gradient(
      1px 1px at 10% 20%,
      var(--color-star-blue) 1px,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 30% 50%,
      var(--color-echo-glow) 1px,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 70% 80%,
      var(--color-star-cyan) 1px,
      transparent 100%
    ),
    radial-gradient(
      2px 2px at 90% 30%,
      var(--color-crystal-pink) 1px,
      transparent 100%
    );
  background-size: 300px 300px;
  opacity: 0.4;
  animation: drift 80s linear infinite;
}

@keyframes drift {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 300px 300px;
  }
}

/* 晶体碎片 */
.crystal-fragment {
  position: absolute;
  width: 60px;
  height: 60px;
  opacity: 0.1;
  pointer-events: none;
  z-index: -5;
  background-image: linear-gradient(
      45deg,
      transparent 45%,
      var(--accent-primary) 50%,
      transparent 55%
    ),
    linear-gradient(
      -45deg,
      transparent 45%,
      var(--accent-secondary) 50%,
      transparent 55%
    );
  background-size: 20px 20px;
  filter: blur(0.8px);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(120deg);
  }
  66% {
    transform: translateY(5px) rotate(240deg);
  }
}

/* ==== 主布局 ==== */
.stage {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: flex-start;
}

/* ==== 左侧区域 ==== */
.left {
  flex: 0 0 360px;
  background: var(--bg-card);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(127, 191, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.left::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 20% 30%,
      rgba(79, 233, 223, 0.05),
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(127, 191, 255, 0.03),
      transparent 50%
    );
  pointer-events: none;
  z-index: -1;
}

/* 封面区域 */
.cover {
  width: 100%;

  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 -10px 30px rgba(0, 0, 0, 0.5),
    0 10px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
}

.video-background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity 0.3s ease;
}

.video-background.landscape {
  aspect-ratio: 16 / 9;
}

.video-background.portrait {
  aspect-ratio: 9 / 16;
}

.crystal-shine {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: linear-gradient(
    45deg,
    transparent 45%,
    var(--accent-primary) 50%,
    transparent 55%
  );
  opacity: 0.4;
  filter: blur(1px);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.wave-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, rgba(79, 233, 223, 0.1));
  mask-image: url("data:image/svg+xml,%3Csvg width='400' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,20 Q100,5 200,20 T400,20' stroke='white' fill='none' stroke-width='2'/%3E%3C/svg%3E");
  mask-size: 400px 40px;
  animation: wave 15s linear infinite;
}

@keyframes wave {
  0% {
    mask-position: 0 0;
  }
  100% {
    mask-position: 400px 0;
  }
}

.now-playing {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(2, 15, 25, 0.6);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(79, 233, 223, 0.2);
  z-index: 2;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-emotion);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.now-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 加载遮罩 */
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(2, 15, 25, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.crystal-spinner {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: conic-gradient(
    from 0deg,
    var(--accent-primary),
    var(--accent-secondary),
    var(--accent-emotion),
    var(--accent-primary)
  );
  animation: spin 1.5s linear infinite;
  position: relative;
}

.crystal-spinner::after {
  content: "";
  position: absolute;
  inset: 2px;
  background: var(--bg-card);
  border-radius: 6px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

/* 控制面板 */
.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.track-info {
  text-align: center;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.icon-note {
  color: var(--accent-primary);
  animation: float-note 3s ease-in-out infinite;
}

@keyframes float-note {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* 时间与进度条 */
.time-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 40px;
  font-variant-numeric: tabular-nums;
}

.progress-wrap {
  flex: 1;
  height: 24px;
  cursor: pointer;
  touch-action: none;
  position: relative;
  display: flex;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-track {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.03) 50%,
    transparent
  );
  animation: track-shine 3s linear infinite;
}

@keyframes track-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  border-radius: 3px;
  position: relative;
  z-index: 1;
  transition: width 0.1s linear;
}

.progress-glow {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), transparent);
  opacity: 0.3;
  filter: blur(4px);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  z-index: 2;
}

.progress-handle::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--text-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--bg-card), 0 0 10px var(--accent-primary);
}

.handle-glow {
  position: absolute;
  inset: -4px;
  background: var(--accent-primary);
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(4px);
  animation: handle-pulse 2s ease-in-out infinite;
}

@keyframes handle-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* 主要控制按钮 */
.primary-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin: 8px 0;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.control-btn:hover {
  background: rgba(79, 233, 223, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 233, 223, 0.2);
}

.play-btn {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px var(--glow-primary), 0 10px 40px rgba(79, 233, 223, 0.3);
}

.play-btn.playing {
  background: linear-gradient(
    135deg,
    var(--accent-emotion),
    var(--accent-primary)
  );
}

.play-icon {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-triangle {
  width: 0;
  height: 0;
  border-left: 16px solid var(--bg-card);
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  margin-left: 4px;
}

.pause-bars {
  display: flex;
  gap: 6px;
  align-items: center;
  height: 100%;
}

.pause-bar {
  width: 6px;
  height: 24px;
  background: var(--bg-card);
  border-radius: 2px;
}

.pulse-ring {
  position: absolute;
  inset: -10px;
  border: 2px solid var(--accent-primary);
  border-radius: 30px;
  animation: ring-pulse 2s ease-out infinite;
  opacity: 0;
}

@keyframes ring-pulse {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

/* 次要控制 */
.secondary-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.mode-controls {
  display: flex;
  gap: 8px;
}

.mode-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-btn:hover {
  background: rgba(79, 233, 223, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.mode-btn.active {
  background: rgba(79, 233, 223, 0.15);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: 0 0 15px var(--glow-primary);
}

.tooltip {
  font-size: 10px;
  opacity: 0.8;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 160px;
  position: relative;
}

.volume-icon {
  color: var(--text-secondary);
  font-size: 16px;
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
  position: relative;
  z-index: 1;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-primary);
  cursor: pointer;
  box-shadow: 0 0 10px var(--glow-primary);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px var(--glow-primary);
}

.volume-level {
  position: absolute;
  left: 30px;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  border-radius: 2px;
  pointer-events: none;
  z-index: 0;
}

/* 错误信息 */
.error-msg {
  margin-top: 12px;
  padding: 10px 16px;
  background: rgba(255, 107, 133, 0.1);
  border: 1px solid rgba(255, 107, 133, 0.2);
  border-radius: 10px;
  color: #ff6b85;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  font-size: 16px;
}

/* ==== 右侧播放列表 ==== */
.right {
  flex: 1;
  background: var(--bg-card);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(127, 191, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  max-height: calc(100vh - 100px);
}

.right.collapsed {
  max-height: 80px;
  overflow: hidden;
}

/* 列表头部 */
.playlist-header {
  margin-bottom: 20px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-main h3 {
  margin: 0;
  color: var(--accent-primary);
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-list {
  font-size: 18px;
  animation: list-float 3s ease-in-out infinite;
}

@keyframes list-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-2px) rotate(5deg);
  }
  66% {
    transform: translateY(2px) rotate(-5deg);
  }
}

.count {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 400;
  margin-left: 4px;
}

.toggle-playlist {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-playlist:hover {
  background: rgba(79, 233, 223, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.toggle-icon {
  font-size: 12px;
}

/* 搜索框 */
.search-wrap {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 14px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 36px;
  background: rgba(2, 15, 25, 0.5);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--glow-primary);
  background: rgba(2, 15, 25, 0.7);
}

.search-input::placeholder {
  color: rgba(166, 233, 255, 0.4);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-search:hover {
  color: var(--accent-primary);
  transform: translateY(-50%) scale(1.1);
}

.clear-icon {
  font-size: 14px;
}

/* 状态提示 */
.status-hint {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  padding: 8px;
  opacity: 0.8;
}

/* 列表区域 */
.list-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-secondary);
  gap: 16px;
}

.loading-crystal {
  width: 40px;
  height: 40px;
  background: linear-gradient(
    45deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  border-radius: 8px;
  animation: crystal-loading 1.5s ease-in-out infinite;
  position: relative;
}

.loading-crystal::before,
.loading-crystal::after {
  content: "";
  position: absolute;
  inset: 2px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

@keyframes crystal-loading {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
}

/* 播放列表 */
.playlist {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: calc(100vh - 280px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist::-webkit-scrollbar {
  width: 6px;
}

.playlist::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.playlist::-webkit-scrollbar-thumb {
  background: var(--accent-primary);
  border-radius: 3px;
}

.playlist li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
}

.playlist li:hover {
  background: rgba(79, 233, 223, 0.05);
  border-color: rgba(79, 233, 223, 0.2);
  transform: translateX(4px);
}

.playlist li.active {
  background: rgba(79, 233, 223, 0.1);
  border-color: rgba(79, 233, 223, 0.3);
  box-shadow: 0 0 20px var(--glow-primary),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.playlist li.playing {
  background: linear-gradient(
    90deg,
    rgba(79, 233, 223, 0.15),
    rgba(127, 191, 255, 0.1)
  );
}

/* 曲目序号 */
.track-index {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.index-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.playing-indicator {
  width: 20px;
  height: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
}

.sound-wave {
  display: flex;
  align-items: flex-end;
  height: 100%;
  gap: 1px;
}

.wave-bar {
  width: 2px;
  background: var(--accent-primary);
  border-radius: 1px;
  animation: wave-animation 1s ease-in-out infinite;
}

.wave-bar:nth-child(1) {
  height: 30%;
  animation-delay: 0s;
}
.wave-bar:nth-child(2) {
  height: 60%;
  animation-delay: 0.2s;
}
.wave-bar:nth-child(3) {
  height: 100%;
  animation-delay: 0.4s;
}

@keyframes wave-animation {
  0%,
  100% {
    height: 30%;
  }
  50% {
    height: 100%;
  }
}

/* 曲目信息 */
.track-info {
  min-width: 0;
}

.track-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-divider {
  opacity: 0.5;
}

/* 操作按钮 */
.track-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist li:hover .track-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(79, 233, 223, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: scale(1.1);
}

/* 音频可视化 */
.visualizer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: -1;
  opacity: 0.3;
  pointer-events: none;
}

/* ==== 响应式设计 ==== */
@media (max-width: 1200px) {
  .stage {
    max-width: 100%;
    gap: 20px;
  }

  .left {
    flex: 0 0 420px;
  }
}

@media (max-width: 920px) {
  .shorekeeper-player {
    padding: 16px;
    padding-top: 80px;
  }

  .stage {
    flex-direction: column;
    gap: 20px;
  }

  .left,
  .right {
    width: 100%;
    flex: none;
  }

  .right {
    max-height: none;
  }

  .right.collapsed {
    max-height: 72px;
  }

  .cover {
    height: 300px;
  }

  .primary-controls {
    gap: 24px;
  }

  .play-btn {
    width: 60px;
    height: 60px;
  }

  .visualizer {
    height: 60px;
  }
}

@media (max-width: 640px) {
  .shorekeeper-player {
    padding: 12px;
    padding-top: 70px;
  }

  .left,
  .right {
    padding: 20px;
  }

  .cover {
    height: 240px;
  }

  .title {
    font-size: 18px;
  }

  .play-btn {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }

  .play-triangle {
    border-left-width: 14px;
    border-top-width: 8px;
    border-bottom-width: 8px;
  }

  .pause-bar {
    width: 5px;
    height: 20px;
  }

  .secondary-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .volume-control {
    flex: none;
    width: 100%;
  }

  .playlist li {
    padding: 10px 12px;
    gap: 12px;
  }

  .track-title {
    font-size: 14px;
  }

  .track-meta {
    font-size: 11px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .cover {
    height: 200px;
  }

  .primary-controls {
    gap: 20px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .play-btn {
    width: 52px;
    height: 52px;
  }

  .playlist-header h3 {
    font-size: 18px;
  }

  .search-input {
    padding: 10px 10px 10px 32px;
    font-size: 13px;
  }
}
</style>