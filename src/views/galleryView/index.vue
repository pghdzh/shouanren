<template>
  <div class="gallery-container">
    <button class="upload-btn" @click="openUploadModal">上传图片</button>

    <section class="gallery section">
      <div class="sort-controls">
        <button @click="toggleSort" class="sort-btn">
          按 {{ sortBy === "like_count" ? "点赞量" : "最新上传" }} 排序
        </button>
      </div>
      <div class="gallery-grid">
        <div
          v-for="(img, index) in images"
          :key="img.id"
          class="card"
          @click="openLightbox(index)"
          ref="cards"
        >
          <div class="card-inner">
            <img
              :src="img.src"
              :alt="img.alt"
              loading="lazy"
              @load="onImageLoad($event)"
            />
            <div class="overlay">
              <span>查看大图</span>
            </div>
            <button class="like-btn" @click.stop="handleLike(img)">
              <i class="heart" :class="{ liked: img.liked }"></i>
              <span class="like-count">{{ img.likeCount }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- sentinel：用于触发无限滚动 -->
      <div ref="sentinel" class="sentinel"></div>
      <!-- 可选：加载中/结束提示 -->
      <div class="loading" v-if="loading">加载中...</div>
      <div class="finished" v-if="finished">已全部加载</div>
    </section>
    <aside class="ranking-panel">
      <div class="panel-header" @click="expanded = !expanded">
        <h3 class="ranking-title">排行榜</h3>
        <span>共{{ imgTotal }}张</span>
        <span class="toggle-icon">{{ expanded ? "▾" : "▸" }}</span>
      </div>
      <transition name="fade">
        <ul v-if="expanded" class="ranking-list">
          <li
            v-for="(item, idx) in rankingList"
            :key="idx"
            class="ranking-item"
            :class="`rank-${idx + 1}`"
          >
            <span class="rank">{{ idx + 1 }}</span>
            <span class="name">{{ item.nickname }}</span>
            <span class="count">{{ item.count }} 张</span>
          </li>
        </ul>
      </transition>
    </aside>
    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <span class="close" @click="closeLightbox">✕</span>
      <span class="prev" @click.stop="prevImage">‹</span>
      <img :src="images[currentIndex].src" :alt="images[currentIndex].alt" />
      <span class="next" @click.stop="nextImage">›</span>
    </div>

    <!-- 上传弹窗 -->
    <div
      v-if="uploadModalOpen"
      class="upload-modal-overlay"
      @click.self="closeUploadModal"
    >
      <div class="upload-modal">
        <h3>批量上传图片</h3>
        <div class="tip-container">
          <ul class="tips-list">
            <li>审核规则：1.不要 AI 图 2.不要色情倾向 3.要我能认出是岸宝。</li>
            <li>
              由于没有用户系统，我这边不好做审核反馈，但只要显示上传成功，我这边肯定能收到。
            </li>
            <li>
              如果图片数量较多请在b站私信联系我给我网盘链接，因为我云服务器比较小一次性上传太多图片可能会导致上传不上，感谢理解。
            </li>
            <li>
              因为审核上传一次比较麻烦，所以审核时间不定，最晚一周，感谢谅解。
            </li>
          </ul>
        </div>
        <p class="stats">
          今日已上传：<strong>{{ uploadedToday }}</strong> 张，
          剩余可上传：<strong>{{ remaining }}</strong> 张
        </p>
        <label>
          昵称：
          <input v-model="nickname" type="text" placeholder="请输入昵称" />
        </label>
        <label>
          选择图片（最多 {{ remaining }} 张）：
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
          />
        </label>
        <p class="tip" v-if="selectedFiles.length">
          已选 {{ selectedFiles.length }} 张
        </p>
        <div class="modal-actions">
          <button :disabled="!canSubmit || isUploading" @click="submitUpload">
            {{ isUploading ? "上传中..." : "立即上传" }}
          </button>
          <button class="cancel" @click="closeUploadModal">取消</button>
        </div>
      </div>
    </div>

    <div class="floating-chibis">
      <img
        v-for="(pet, i) in chibiList"
        :key="i"
        :src="pet.src"
        :style="{ top: pet.top + 'px', left: pet.left + 'px' }"
        class="chibi-img"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from "vue";
import { uploadImages } from "@/api/modules/images"; // 前面封装的上传接口
import { getRankingList } from "@/api/modules/ranking"; // 根据你的实际路径调整
import { gsap } from "gsap"; // ← 本地引入
import { getImagesLikesList, likeImage } from "@/api/modules/imagesLikes";
import { debounce } from "lodash";

const sortBy = ref<"uploaded_at" | "like_count">("like_count");
const order = ref<"asc" | "desc">("desc");
function toggleSort() {
  if (sortBy.value === "uploaded_at") {
    sortBy.value = "like_count";
    order.value = "desc";
  } else {
    sortBy.value = "uploaded_at";
    order.value = "desc";
  }
  pageImage.value = 1;
  images.value = [];
  finished.value = false;
  window.scrollTo(0, 0);
  loadNextPage();
}
// 获取已点赞 ID 数组
function getLikedIds(): number[] {
  const data = localStorage.getItem("likedImageIds");
  return data ? JSON.parse(data) : [];
}

// 保存已点赞 ID 数组
function setLikedIds(ids: number[]) {
  localStorage.setItem("likedImageIds", JSON.stringify(ids));
}

async function handleLike(img: ImageItem) {
  if (img.liked) return; // 已点过就不重复调用

  try {
    await likeImage(img.id); // 调用后端接口
    img.likeCount += 1; // 本地更新点赞数
    img.liked = true; // 标记已点赞

    // 更新 localStorage
    const likedIds = getLikedIds();
    likedIds.push(img.id);
    setLikedIds(likedIds);
  } catch (error) {
    console.error("点赞失败", error);
    alert("点赞失败，请稍后重试");
  }
}

interface ImageItem {
  src: string;
  alt: string;
  likeCount: number;
  id: number;
  liked: Boolean;
}

interface RankingItem {
  id?: number; // 如果接口返回有 id，可加上
  nickname: string;
  count: number;
}
const rankingList = ref<RankingItem[]>([]);
const expanded = ref(true);

// 默认分页参数（如不分页可省略）
const page = 1;
const pageSize = 99;

const fetchRanking = async () => {
  const res = await getRankingList({ page, pageSize, character_key: "shou" });
  if (res.success) {
    rankingList.value = res.data;
  } else {
    console.error("获取排行榜失败", res.message);
  }
};

// 响应式存放最终图片列表
const images = ref<ImageItem[]>([]);

const pageImage = ref(1);
const limit = ref(10);
const loading = ref(false);
const finished = ref(false);

const sentinel = ref<HTMLElement | null>(null);

// 1. 在外层创建一个单例 observerCard
const observerCard = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observerCard.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
// 2. 每次有新卡片时，都调用这个方法去挂载观察
async function observeNewCards(startIndex = 0) {
  await nextTick();
  const cards = document.querySelectorAll<HTMLElement>(".card");
  for (let i = startIndex; i < cards.length; i++) {
    observerCard.observe(cards[i]);
  }
}
const imgTotal = ref(0);
async function loadNextPage() {
  if (loading.value || finished.value) return;
  loading.value = true;
  try {
    const res = await getImagesLikesList({
      page: pageImage.value,
      limit: limit.value,
      sortBy: sortBy.value,
      character_key: "shou",
      order: order.value,
    });
    imgTotal.value = res.total;
    const likedIds = getLikedIds();
    const list = (
      res.images as Array<{ url: string; like_count: number; id: number }>
    ).map((item) => ({
      src: item.url,
      alt: "",
      likeCount: item.like_count,
      id: item.id, // 如果需要的话，方便点赞用
      liked: likedIds.includes(item.id),
    }));
    if (list.length === 0) {
      finished.value = true;
      return;
    }
    // 记录加载前的长度，方便后面找出“新增”节点
    const oldLength = images.value.length;
    const existingIds = new Set(images.value.map((i) => i.id));
    const filtered = list.filter((item) => !existingIds.has(item.id));
    images.value.push(...filtered);
    pageImage.value++;

    observeNewCards(oldLength);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// 3. 给 loadNextPage 包装一个防抖版
const debouncedLoad = debounce(
  () => {
    loadNextPage();
  },
  200,
  { leading: true, trailing: false }
);

const lightboxOpen = ref(false);
const currentIndex = ref(0);

function openLightbox(index: number) {
  currentIndex.value = index;
  lightboxOpen.value = true;
}
function closeLightbox() {
  lightboxOpen.value = false;
}
function prevImage() {
  currentIndex.value =
    (currentIndex.value + images.value.length - 1) % images.value.length;
}
function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
}

// 渐显＆Blur‑Up 效果
function onImageLoad(e: Event) {
  const img = e.target as HTMLImageElement;
  const card = img.closest(".card");
  card?.classList.add("loaded");
}

// 上传弹窗逻辑

const uploadModalOpen = ref(false);
const nickname = ref("");
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);

// 从 localStorage 读取“今天”已上传数量
function getTodayKey() {
  return `uploaded_${new Date().toISOString().slice(0, 10)}`;
}
const uploadedToday = ref<number>(
  Number(localStorage.getItem(getTodayKey()) || 0)
);
const remaining = computed(() => Math.max(42 - uploadedToday.value, 0));

// 控制提交按钮
const canSubmit = computed(() => {
  return (
    nickname.value.trim().length > 0 &&
    selectedFiles.value.length > 0 &&
    selectedFiles.value.length <= remaining.value
  );
});

// 放在 script 顶部，或者 utils 里
function clearOldUploadRecords() {
  const today = new Date();
  const storage = window.localStorage;
  for (const key of Object.keys(storage)) {
    if (!key.startsWith("uploaded_")) continue;

    // key 格式 uploaded_YYYY-MM-DD
    const dateStr = key.slice("uploaded_".length);
    const recordDate = new Date(dateStr);
    if (isNaN(recordDate.getTime())) continue;

    // 计算相差天数
    const diffMs = today.getTime() - recordDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // 如果超过 2 天，就删掉
    if (diffDays > 2) {
      storage.removeItem(key);
    }
  }
}

function openUploadModal() {
  clearOldUploadRecords();
  nickname.value = "";
  selectedFiles.value = [];
  if (fileInput.value) fileInput.value.value = "";
  // 每次打开重新刷新已上传数
  uploadedToday.value = Number(localStorage.getItem(getTodayKey()) || 0);
  uploadModalOpen.value = true;
}
function closeUploadModal() {
  uploadModalOpen.value = false;
}

// 本地截断到剩余数量
function handleFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || []);

  if (!files) return;

  const validFiles: File[] = [];
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) {
      alert(`文件太大：${file.name}，请控制在 20MB 内`);
      continue;
    }
    validFiles.push(file);
  }

  if (validFiles.length === 0) return;

  if (validFiles.length > remaining.value) {
    alert(
      `今天最多还能上传 ${remaining.value} 张，已为你截取前 ${remaining.value} 张`
    );
    selectedFiles.value = files.slice(0, remaining.value);
  } else {
    selectedFiles.value = files;
  }
}
const isUploading = ref(false);
async function submitUpload() {
  if (!canSubmit.value) return;
  isUploading.value = true;
  try {
    const res = await uploadImages(
      selectedFiles.value,
      nickname.value.trim(),
      "shou"
    );
    const uploadedCount = res.data.length;
    // 更新 localStorage
    uploadedToday.value += uploadedCount;
    localStorage.setItem(getTodayKey(), String(uploadedToday.value));

    alert(`成功上传 ${uploadedCount} 张图片`);
    closeUploadModal();
    // …可选：刷新画廊列表或把新图片追加到 images …
  } catch (err: any) {
    console.error(err);
    alert(err.message || "上传失败");
  } finally {
    isUploading.value = false;
  }
}

interface Chibi {
  src: string;
  top: number;
  left: number;
}

const chibiList = ref<Chibi[]>([]);
let sentinelObserver: IntersectionObserver;
// Scroll-triggered lazy animation
onMounted(async () => {
  // 1. 拉排行榜
  await fetchRanking();

  // 2. 拉第一页图片并挂载动画 observer
  await loadNextPage(); // 内部会调用 observeNewCards(oldLen)
  // 对首次卡片做一次完整 observe
  observeNewCards(0);

  // 3. 初始化 sentinelObserver，再 observe
  sentinelObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) debouncedLoad();
    },
    { rootMargin: "0px", threshold: 0.1 }
  );
  if (sentinel.value) {
    sentinelObserver.observe(sentinel.value);
  }
  // 1. 基础配置信息
  const total = 9;
  let pickCount = 3; // 每次抽取 3 张
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = window.innerWidth <= 768;
  // 如果已知单张小人图片的宽高，可避免超出边界；
  // 假设小人图片宽 100px、高 100px，按需替换：
  const imgWidth = 100;
  const imgHeight = 100;

  // 2. Fisher–Yates 洗牌函数
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 3. 随机选出 3 个编号
  if (isMobile) {
    pickCount = 1;
  }
  const nums = shuffle(Array.from({ length: total }, (_, k) => k + 1));
  const picks = nums.slice(0, pickCount);

  // 4. 生成随机位置并填充 chibiList
  chibiList.value = []; // 先清空
  picks.forEach((i) => {
    chibiList.value.push({
      src: `/QImages/1 (${i}).png`,
      left: Math.random() * (vw - imgWidth), // 保证不超出左右边界
      top: Math.random() * (vh - imgHeight), // 保证不超出上下边界
    });
  });

  // 2. 等 img 渲染到 DOM
  await nextTick();

  // 3. 给每个小人绑定 GSAP 动画
  const imgs = document.querySelectorAll<HTMLImageElement>(".chibi-img");
  imgs.forEach((img, index) => {
    const padding = 200; // 边缘预留空间
    // ✅ 初始出场动画（闪现）
    gsap.fromTo(
      img,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(2)",
        delay: 0.2 * index,
      }
    );

    // ✅ 鼠标靠近闪避
    img.addEventListener("mouseenter", () => {
      gsap.killTweensOf(img);

      gsap.to(img, {
        x: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        y: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        duration: 1.2,
        ease: "back.out(2)",
        onComplete: () => {
          // 闪避完成后，再重新启用动画
          animate(img);
        },
      });
    });

    const animate = (img: HTMLImageElement) => {
      let { x, y } = img.getBoundingClientRect();
      let deltaX = (Math.random() - 0.5) * 200;
      let deltaY = (Math.random() - 0.5) * 200;

      // 预测一下偏移后的位置
      let nextX = x + deltaX;
      let nextY = y + deltaY;

      // 校正：防漂出左、右、上、下边界
      if (nextX < padding) deltaX = padding - x;
      if (nextX + img.width > window.innerWidth - padding)
        deltaX = window.innerWidth - padding - (x + img.width);
      if (nextY < padding) deltaY = padding - y;
      if (nextY + img.height > window.innerHeight - padding)
        deltaY = window.innerHeight - padding - (y + img.height);

      gsap.to(img, {
        x: `+=${deltaX.toFixed(0)}`,
        y: `+=${deltaY.toFixed(0)}`,
        rotation: `+=${((Math.random() - 0.5) * 60).toFixed(0)}`,
        duration: 2 + Math.random() * 2,
        ease: "power1.inOut",
        onComplete: () => animate(img),
      });
    };
    animate(img);
  });
});

onBeforeUnmount(() => {
  observerCard.disconnect();
  sentinelObserver.disconnect();
  // 以及你在 onMounted 里新建的其它 Observer
});
</script>

<style lang="scss" scoped>
$bg: #0d0d0d;
$accent: #d14b4b;
$text: #fde8e8;
$highlight: #ffd700;
$ice-blue: #bff7ff;
$neon-pink: #ff66c4;
$deep-sea: #0a1a24;
$crystal-blue: #bff7ff;
$energy-cyan: #12b3d3;
$dark-bg: #0d0d0d;
$text-light: #fde8e8;
@use "sass:color";

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating-chibis {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
}

.chibi-img {
  position: absolute;
  width: 80px;
  user-select: none;
  transform-origin: center center;
  pointer-events: auto;
  position: absolute;
  z-index: 10;
}

.gallery-container {
  background: radial-gradient(
      ellipse at 30% 20%,
      rgba(20, 60, 90, 0.4) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(40, 100, 140, 0.3) 0%,
      transparent 30%
    ),
    linear-gradient(180deg, $deep-sea 0%, #0a1520 100%);
  min-height: 100vh;
  color: $text-light;
  position: relative;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        1px 1px at 20% 30%,
        rgba($crystal-blue, 0.6) 1px,
        transparent 0
      ),
      radial-gradient(
        1px 1px at 60% 70%,
        rgba($crystal-blue, 0.4) 1px,
        transparent 0
      );
    background-size: 100px 100px;
    z-index: 0;
    pointer-events: none;
  }
  .section {
    padding: 80px 20px;


    .sort-controls {
      margin: 16px 0;

      /* 守岸人风格的排序按钮（替换原 .sort-btn） */
      .sort-btn {
        /* 基础布局（保留左侧装饰空间） */
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 28px 10px 56px; /* 左侧留装饰 */
        font-size: 1rem;
        line-height: 1;
        font-family: "PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial,
          sans-serif;
        cursor: pointer;
        border-radius: 28px;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(110, 200, 255, 0.06);

        /* 守岸人：冰蓝晶体渐变 + 深海毛玻璃感 */
        background: linear-gradient(
          90deg,
          rgba(11, 44, 58, 0.28) 0%,
          rgba(8, 36, 48, 0.36) 50%,
          rgba(6, 28, 36, 0.42) 100%
        );
        color: #cfeff8; /* 冰蓝文字 */
        box-shadow: 0 10px 28px rgba(0, 12, 18, 0.48),
          /* 深海投影 */ inset 0 1px 0 rgba(255, 255, 255, 0.02),
          /* 内高光 */ 0 0 18px rgba(80, 200, 240, 0.04); /* 冰蓝光晕 */

        transition: transform 200ms cubic-bezier(0.2, 0.9, 0.25, 1),
          box-shadow 200ms ease, background 260ms ease, color 160ms ease,
          filter 200ms ease;
        -webkit-tap-highlight-color: transparent;

        /* 左侧晶体装饰（替代原花瓣） */
        &::after {
          content: "";
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%) rotate(-12deg);
          width: 18px;
          height: 22px;
          border-radius: 4px;
          background: linear-gradient(
            180deg,
            rgba(191, 247, 255, 0.95),
            rgba(110, 220, 255, 0.9)
          );
          box-shadow: 0 6px 18px rgba(40, 140, 170, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          clip-path: polygon(50% 0, 75% 25%, 50% 100%, 25% 25%); /* 菱形/晶体 */
          pointer-events: none;
          z-index: 3;
          transition: transform 220ms ease, opacity 220ms ease,
            box-shadow 220ms ease;
        }

        /* hover：微抬起，晶体发光 */
        &:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 22px 66px rgba(0, 18, 24, 0.62),
            0 0 44px rgba(80, 200, 240, 0.14),
            inset 0 2px 8px rgba(255, 255, 255, 0.03);
          filter: saturate(1.08) brightness(1.03);
          color: #12b3d3;
          background: linear-gradient(
            90deg,
            rgba(12, 54, 70, 0.38) 0%,
            rgba(10, 46, 62, 0.46) 50%,
            rgba(8, 36, 48, 0.5) 100%
          );
        }

        &:hover::after {
          transform: translateY(-56%) rotate(-6deg) scale(1.06);
          box-shadow: 0 10px 30px rgba(60, 180, 210, 0.16),
            inset 0 2px 6px rgba(255, 255, 255, 0.2);
          opacity: 1;
        }

        /* active（按下）反馈 */
        &:active {
          transform: translateY(-2px) scale(0.995);
          box-shadow: 0 10px 28px rgba(0, 12, 18, 0.5),
            0 0 20px rgba(80, 200, 240, 0.06);
        }

        /* keyboard focus 可见环（无障碍） */
        &:focus-visible {
          outline: none;
          box-shadow: 0 22px 66px rgba(0, 18, 24, 0.62),
            0 0 0 6px rgba(60, 180, 210, 0.06);
        }
      }
    }

    // 2. 守岸人风格卡片 (核心)
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      padding: 20px;
      position: relative;
      z-index: 2;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 12px;
      }

      .card {
        perspective: 1200px;
        border-radius: 16px;
        overflow: hidden;
        opacity: 0;
        transform: translateY(30px);
        animation: cardRise 0.7s ease forwards;

        @keyframes cardRise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        // 晶体边框效果
        &::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          padding: 2px;
          background: linear-gradient(
            135deg,
            rgba($crystal-blue, 0.4),
            rgba($energy-cyan, 0.2),
            transparent 60%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
          pointer-events: none;
        }

        .card-inner {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          border-radius: 16px;
          overflow: hidden;

          &:hover {
            transform: rotateY(8deg) rotateX(2deg) scale(1.03);
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: filter 0.5s ease;
          }

          // 能量覆盖层
          .overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(
              to top,
              rgba($deep-sea, 0.95) 0%,
              rgba($energy-cyan, 0.2) 50%,
              transparent 100%
            );
            padding: 20px 16px 16px;
            transform: translateY(100%);
            transition: transform 0.4s ease;
            text-align: center;

            span {
              color: $crystal-blue;
              font-family: "Segoe UI", system-ui, sans-serif;
              font-size: 0.95rem;
              font-weight: 600;
              letter-spacing: 0.5px;
              text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            }
          }

          &:hover .overlay {
            transform: translateY(0);
          }

          // 守岸人风格点赞按钮
          .like-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba($deep-sea, 0);
           
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 3;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);

            &:hover {
              background: rgba($energy-cyan, 0.2);
              transform: scale(1.1);
            }

            .heart {
              width: 22px;
              height: 22px;
              background: url("/icons/heart-red-outline.svg") no-repeat center;
              background-size: contain;
              transition: all 0.3s ease;

              &.liked {
                background: url("/icons/heart-red-filled.svg") no-repeat center;
                background-size: contain;
                animation: pulseGlow 0.6s ease;
                filter: drop-shadow(0 0 8px rgba($crystal-blue, 0.8));
              }

              @keyframes pulseGlow {
                0% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.3);
                }
                100% {
                  transform: scale(1);
                }
              }
            }

            .like-count {
              position: absolute;
              bottom: -20px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 1.2rem;
              color: red;
              font-weight: bold;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    img {
      max-width: 85%;
      max-height: 85%;
      border: 3px solid $accent;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9);
      animation: fadeInUp 0.4s ease;
    }

    .close,
    .prev,
    .next {
      position: absolute;
      color: $text;
      font-size: 2.5rem;
      cursor: pointer;
      user-select: none;
      padding: 8px;
      background: rgba(27, 27, 27, 0.8);
      border-radius: 50%;
      transition: background 0.3s;

      &:hover {
        background: $accent;
      }
    }

    .close {
      top: 20px;
      right: 20px;
    }

    .prev {
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
    }

    .next {
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .upload-btn {
    /* 位置与布局保持不变 */
    position: fixed;
    bottom: 64px;
    left: 24px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    font-size: 1rem;
    font-family: "PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial,
      sans-serif;
    z-index: 10;
    cursor: pointer;
    user-select: none;

    /* 守岸人 — 冰蓝晶体 + 深海毛玻璃 */
    color: #022b33; /* 深色文字以保证在浅色晶核上可读 */
    background: linear-gradient(
      90deg,
      rgba(191, 247, 255, 0.96) 0%,
      rgba(110, 223, 255, 0.92) 50%,
      rgba(46, 170, 200, 0.96) 100%
    );
    border-radius: 28px;

    backdrop-filter: blur(6px) saturate(120%);
    -webkit-backdrop-filter: blur(6px) saturate(120%);

    /* 卡片质感：深色阴影 + 冰蓝光晕 */
    box-shadow: 0 14px 40px rgba(2, 20, 28, 0.55),
      /* 深海投影 */ 0 0 28px rgba(80, 200, 240, 0.08); /* 冰蓝光晕 */

    overflow: visible;
    transition: transform 220ms cubic-bezier(0.2, 0.9, 0.25, 1),
      box-shadow 220ms ease, background 260ms ease, filter 220ms ease;

    /* hover：微抬起、光晕增强 */
    &:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 28px 80px rgba(2, 24, 34, 0.62),
        0 0 46px rgba(80, 200, 240, 0.16);
      filter: brightness(1.02) saturate(1.05);
    }
  }

  .upload-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 深海暗色 + 微光星尘，突出弹窗并契合守岸人基调 */
    background: linear-gradient(
      180deg,
      rgba(2, 10, 16, 0.78),
      rgba(3, 18, 28, 0.62)
    );
    backdrop-filter: blur(10px) saturate(1.08);
    -webkit-backdrop-filter: blur(10px) saturate(1.08);

    /* 顶层冷色光晕，轻微星尘纹理 */
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(
          700px 260px at 50% 28%,
          rgba(60, 160, 200, 0.06),
          transparent 16%
        ),
        linear-gradient(180deg, rgba(0, 0, 0, 0.24), transparent 40%);
      mix-blend-mode: screen;
    }
  }

  .upload-modal {
    position: relative;
    width: 720px; /* 略宽以容纳内容 */
    max-width: calc(100% - 40px);
    padding: 36px;
    border-radius: 16px;
    overflow: hidden;
    z-index: 2100;
    color: #e6fbff;
    font-family: "Helvetica Neue", "Noto Sans SC", "PingFang SC", sans-serif;
    -webkit-font-smoothing: antialiased;

    /* 背景：半透明深蓝毛玻璃，内侧有冰蓝高光 */
    background: linear-gradient(
      180deg,
      rgba(6, 28, 40, 0.82),
      rgba(4, 20, 30, 0.78)
    );
    border: 1px solid rgba(110, 200, 255, 0.06);
    backdrop-filter: blur(8px) saturate(120%);
    -webkit-backdrop-filter: blur(8px) saturate(120%);
    box-shadow: 0 30px 90px rgba(0, 10, 16, 0.72),
      inset 0 1px 0 rgba(255, 255, 255, 0.02);

    /* 冰晶外发光边（伪元素） */
    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 18px;
      pointer-events: none;
      background: linear-gradient(
        90deg,
        rgba(110, 200, 255, 0.08),
        rgba(30, 120, 160, 0.06),
        rgba(110, 200, 255, 0.06)
      );
      filter: blur(14px);
      mix-blend-mode: screen;
      opacity: 0.95;
    }

    /* 标题 */
    h3 {
      margin: 0 0 16px 0;
      font-size: 1.5rem;
      color: #bff7ff;
      font-weight: 900;
      text-align: center;
      letter-spacing: 0.6px;
      text-shadow: 0 6px 20px rgba(0, 40, 60, 0.3);
    }

    /* 统计文字 */
    .stats {
      margin: 18px 0;
      font-size: 1rem;
      text-align: center;
      color: rgba(190, 245, 255, 0.95);

      strong {
        color: #86f0ff;
      }
    }

    /* tip 区块：深海玻璃 + 左侧冰蓝强调线 */
    .tip-container {
      margin-top: 18px;
      padding: 14px 18px;
      background: linear-gradient(
        180deg,
        rgba(8, 36, 48, 0.42),
        rgba(6, 30, 40, 0.36)
      );
      border-left: 4px solid rgba(110, 200, 255, 0.12);
      border-radius: 10px;
      backdrop-filter: blur(4px);
      color: rgba(210, 240, 255, 0.94);

      .tips-list {
        list-style: none;
        margin: 0;
        padding: 0;

        li {
          position: relative;
          padding-left: 34px;
          margin-bottom: 10px;
          font-size: 0.95rem;
          color: rgba(200, 235, 245, 0.95);

          &::before {
            content: "";
            position: absolute;
            left: 8px;
            top: 8px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: radial-gradient(
              circle at 30% 30%,
              #e6ffff 0%,
              rgba(190, 245, 255, 0.85) 10%,
              #7be8ff 40%,
              #2aa7c7 100%
            );
            box-shadow: 0 6px 18px rgba(40, 160, 200, 0.08);
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .tip {
      margin-top: 10px;
      text-align: right;
      font-size: 0.9rem;
      color: rgba(170, 210, 225, 0.9);
    }

    /* 表单控件：深色输入框 + 冰蓝高光（聚焦时发光） */
    label {
      display: block;
      margin-bottom: 18px;
      font-size: 0.95rem;
      color: rgba(200, 235, 245, 0.95);

      input[type="text"],
      input[type="file"],
      textarea {
        width: 100%;
        margin-top: 8px;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid rgba(110, 200, 255, 0.06);
        background: linear-gradient(
          180deg,
          rgba(3, 18, 26, 0.6),
          rgba(6, 30, 40, 0.64)
        );
        color: rgba(210, 245, 255, 0.96);
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease,
          transform 0.12s ease;
        box-shadow: inset 0 -4px 10px rgba(0, 0, 0, 0.4);
      }

      input[type="text"]::placeholder,
      textarea::placeholder {
        color: rgba(180, 220, 235, 0.6);
      }

      input[type="text"]:focus,
      input[type="file"]:focus,
      textarea:focus {
        border-color: rgba(110, 200, 255, 0.36);
        box-shadow: 0 12px 36px rgba(40, 140, 180, 0.08),
          0 2px 8px rgba(90, 200, 230, 0.04);
        transform: translateY(-1px);
      }
    }

    /* 按钮行（主/取消）：冰蓝主按钮 + 次要透明样式 */
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
      margin-top: 28px;
      flex-wrap: wrap;
      align-items: center;

      button {
        padding: 12px 24px;
        border: none;
        border-radius: 24px;
        cursor: pointer;
        font-weight: 800;
        font-size: 0.95rem;
        transition: background 0.22s ease, box-shadow 0.22s ease,
          transform 0.12s ease;
        min-width: 96px;
        color: #01292e;
      }

      /* 主按钮：冰蓝渐变（可用 .primary 类或非 .cancel） */
      button:not(.cancel) {
        background: linear-gradient(
          135deg,
          #bff7ff 0%,
          #66dff0 55%,
          #2aa7c7 100%
        );
        box-shadow: 0 12px 36px rgba(20, 110, 140, 0.12),
          0 4px 18px rgba(40, 120, 160, 0.06);
        color: #002a32;
      }

      button:not(.cancel):hover:not(:disabled) {
        transform: translateY(-4px);
        box-shadow: 0 22px 66px rgba(10, 60, 80, 0.28),
          0 8px 28px rgba(80, 200, 240, 0.08);
      }

      button:not(.cancel):disabled {
        background: linear-gradient(
          135deg,
          rgba(130, 200, 220, 0.08),
          rgba(80, 160, 190, 0.06)
        );
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
        color: rgba(180, 230, 240, 0.6);
      }

      /* 取消按钮：半透明边框风格 */
      button.cancel {
        background: transparent;
        border: 2px solid rgba(110, 200, 255, 0.06);
        color: rgba(180, 230, 240, 0.9);
        min-width: 86px;
        box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.22);
      }

      button.cancel:hover {
        background: rgba(110, 200, 255, 0.04);
      }
    }
  }

  .ranking-panel {
    width: 220px;
    padding: 16px;
    position: fixed;
    top: 84px;
    right: 12px;
    z-index: 1200;
    color: #e6fbff;
    font-family: "PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial,
      sans-serif;

    /* 深海毛玻璃基底 + 晶体光晕 */
    background: linear-gradient(
      180deg,
      rgba(4, 22, 34, 0.78),
      rgba(6, 38, 54, 0.72)
    );
    border-radius: 18px;
    border: 1px solid rgba(110, 200, 255, 0.06);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    backdrop-filter: blur(10px) saturate(120%);
    box-shadow: 0 14px 40px rgba(0, 12, 20, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.02);

    &.collapsed {
      height: auto;
      padding-bottom: 8px;
    }

    /* panel header */
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;

      .ranking-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 900;
        color: #bff7ff; /* 冰蓝高光 */
        font-family: "Zhi Mang Xing", "STKaiti", serif;
        letter-spacing: 0.6px;
        text-shadow: 0 6px 18px rgba(10, 80, 110, 0.18);
      }

      .toggle-icon {
        font-size: 1rem;
        color: #bff7ff;
        background: linear-gradient(
          180deg,
          rgba(12, 40, 52, 0.5),
          rgba(10, 30, 40, 0.36)
        );
        padding: 6px 8px;
        border-radius: 9px;
        border: 1px solid rgba(110, 200, 255, 0.06);
        box-shadow: 0 6px 14px rgba(0, 12, 20, 0.45),
          inset 0 1px 0 rgba(255, 255, 255, 0.02);
      }
    }

    /* 列表容器 */
    .ranking-list {
      list-style: none;
      padding: 0;
      margin: 12px 0 0;
      overflow-y: auto;
      max-height: 55vh;

      /* 自定义滚动条（深海风） */
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      &::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          rgba(80, 180, 210, 0.16),
          rgba(60, 140, 170, 0.12)
        );
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.02);
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
    }

    .ranking-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      margin-bottom: 8px;
      border-radius: 12px;

      /* 半透明深色卡片 + 细晶体高光 */
      background: linear-gradient(
        180deg,
        rgba(8, 30, 40, 0.48),
        rgba(6, 26, 34, 0.42)
      );
      border: 1px solid rgba(100, 180, 220, 0.04);
      transition: transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1),
        box-shadow 260ms ease, background 260ms ease, color 200ms ease;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 18px 52px rgba(0, 12, 20, 0.6),
          0 0 30px rgba(70, 180, 210, 0.06);
        background: linear-gradient(
          90deg,
          rgba(10, 40, 52, 0.62),
          rgba(8, 34, 48, 0.58)
        );
      }

      .rank {
        width: 36px;
        text-align: center;
        font-weight: 900;
        font-size: 1rem;
        color: #8ee8ff; /* 冰蓝 */
        text-shadow: 0 2px 8px rgba(0, 40, 60, 0.24);
        flex-shrink: 0;
      }

      .name {
        flex: 1;
        padding: 0 8px;
        font-size: 0.95rem;
        color: #dff8ff;
        font-weight: 700;
        white-space: normal; /* 允许换行 */
        word-break: break-word;
        line-height: 1.25;
      }

      .count {
        font-size: 0.9rem;
        color: #9eeeff;
        font-weight: 800;
        min-width: 36px;
        text-align: right;
        text-shadow: 0 2px 6px rgba(0, 30, 40, 0.2);
        flex-shrink: 0;
      }

      /* ---------- 前三名强化（晶体光辉） ---------- */
      &.rank-1 {
        background: linear-gradient(
          135deg,
          #a9f3ff 0%,
          #64dff0 50%,
          #2aa7c7 100%
        );
        color: #022a32;
        border: 1px solid rgba(20, 110, 140, 0.22);
        box-shadow: 0 18px 60px rgba(20, 90, 120, 0.32),
          0 0 30px rgba(100, 200, 255, 0.08);

        .rank {
          color: #002a32;
          text-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
        }
        .name {
          color: #002a32;
        }
        .count {
          color: #002a32;
        }
      }

      &.rank-2 {
        background: linear-gradient(
          135deg,
          #cdeff6 0%,
          #78dff0 55%,
          #2c9fb8 100%
        );
        color: #01282e;
        border: 1px solid rgba(20, 100, 140, 0.16);
        box-shadow: 0 14px 48px rgba(14, 70, 90, 0.28);

        .rank {
          color: #022a32;
        }
        .name {
          color: #e8fbff;
        }
        .count {
          color: #cfeffc;
        }
      }

      &.rank-3 {
        background: linear-gradient(
          135deg,
          rgba(180, 235, 245, 0.12) 0%,
          rgba(120, 200, 220, 0.18) 60%,
          rgba(60, 140, 170, 0.22) 100%
        );
        color: #dff8ff;
        border: 1px solid rgba(80, 160, 190, 0.08);
        box-shadow: 0 10px 36px rgba(8, 40, 60, 0.26);

        .rank {
          color: #bff7ff;
        }
        .name {
          color: #dff8ff;
        }
        .count {
          color: #bff7ff;
        }
      }
    }

    /* 淡入淡出（保留原过渡类） */
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.28s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
  }
}
</style>
