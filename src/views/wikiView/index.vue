<template>
  <div class="shorekeeper-page">
    <!-- 动态星光背景层 -->
    <div class="stellar-bg"></div>

    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img
        v-for="(src, idx) in randomFive"
        :key="idx"
        :src="src"
        class="carousel-image"
        :class="{ active: idx === currentIndex }"
      />
    </div>

    <header class="wiki-header">
      <div class="title">
        <!-- 使用蝴蝶图标装饰标题 -->
        <h1> 回音档案库</h1>
        <p class="subtitle">于此，凝听海岸的回响</p>
      </div>
      <div class="actions">
        <input
          v-model="search"
          class="search"
          placeholder="解析频率，搜寻记录..."
        />
        <button class="btn btn-new" @click="openCreate">
          <span class="icon-add">✧</span> 织构新篇
        </button>
      </div>
    </header>

    <main class="wiki-body">
      <div v-if="filteredEntries.length === 0" class="empty">
        <p>「星域静谧，暂无此频率的回响。」</p>
        <p class="empty-hint">尝试不同的关键词，或谱写全新的旋律。</p>
      </div>

      <ul class="entry-list">
        <li v-for="entry in filteredEntries" :key="entry.id" class="entry-card">
          <!-- 卡片左上角装饰性晶体裂痕 -->
          <div class="card-crystal"></div>
          <div class="entry-head">
            <div class="entry-meta" @click="openDetail(entry)">
              <div class="entry-title-wrap">
                <h2 class="entry-title">{{ entry.title }}</h2>
                <span class="entry-badge">#{{ entry.slug || "未定义" }}</span>
              </div>
              <div class="entry-info">
                <span class="meta-item">
                  <span class="icon-author">✎</span>
                  {{ entry.author || "匿名记录者" }}
                </span>
                <span class="meta-item">
                  <span class="icon-time">⌛</span>
                  {{ formatTime(entry.updatedAt) }}
                </span>
              </div>
            </div>

            <div class="entry-actions">
              <button
                class="like"
                :class="{ active: isLiked(entry.id) }"
                :aria-pressed="isLiked(entry.id)"
                @click.stop="toggleLike(entry.id)"
              >
                <!-- 替换为晶体主题的爱心 -->
                <span class="like-icon">
                  <svg
                    v-if="isLiked(entry.id)"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                  <svg
                    v-else
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                </span>
                <span class="like-count">{{ entry.likes || 0 }}</span>
              </button>
              <div class="edit-delete" v-if="canEdit(entry.id)">
                <button class="small" @click="openEdit(entry)">
                  <span class="icon-edit">📝</span> 重构
                </button>
                <button class="small danger" @click="remove(entry.id)">
                  <span class="icon-delete">✕</span> 湮灭
                </button>
              </div>
            </div>
          </div>
          <!-- 卡片底部的能量光带 -->
          <div class="card-glow"></div>
        </li>
      </ul>
    </main>

    <!-- Edit/Create Modal -->
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
        <div class="modal">
          <header class="modal-header">
            <h3>
              <span class="icon-modal">🦋</span>
              {{ editing ? "重构词条频率" : "织构全新回响" }}
            </h3>
            <button class="close" @click="closeModal">✕</button>
          </header>
          <section class="modal-body">
            <label>
              频率标题
              <input v-model="form.title" placeholder="输入记录的标题..." />
            </label>
            <label>
              回音标签
              <input
                v-model="form.slug"
                placeholder="例如：星域、蝶影、海岸..."
              />
            </label>
            <label>
              记录者
              <input v-model="form.author" placeholder="你的称谓 (可选)" />
            </label>
            <label>
              回响内容
              <textarea
                v-model="form.content"
                rows="8"
                placeholder="在此缀连你的思绪与回音..."
              ></textarea>
            </label>
          </section>
          <footer class="modal-footer">
            <button class="btn ghost" @click="closeModal">取消</button>
            <button class="btn" @click="submit" :disabled="!canSubmit">
              {{ editing ? "频率覆盖" : "织构完成" }}
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- Detail Modal -->
    <transition name="modal-fade">
      <div
        class="modal-overlay"
        v-if="detailEntry"
        @click.self="detailEntry = null"
      >
        <div class="modal detail-modal">
          <header class="modal-header">
            <h3>
              <span class="icon-detail">📜</span>
              {{ detailEntry.title }}
            </h3>
            <button class="close" @click="detailEntry = null">✕</button>
          </header>
          <section class="modal-body">
            <div class="detail-meta">
              <span>记录者：{{ detailEntry.author || "匿名" }}</span>
              <span>时间：{{ formatTime(detailEntry.updatedAt) }}</span>
              <span v-if="detailEntry.slug">标签：#{{ detailEntry.slug }}</span>
            </div>
            <div class="detail-content">{{ detailEntry.content }}</div>
          </section>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
// 原script逻辑完全保留，无需改变。
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getWikiList,
  createWiki,
  updateWiki,
  deleteWiki,
  likeWiki,
} from "@/api/modules/wiki";

// ... (所有原有的JavaScript/Vue逻辑，从 `const LS_MY_WIKI_IDS` 到 `onUnmounted` 函数，均保持不变)
// 本地存储自己创建的词条 ID
const LS_MY_WIKI_IDS = "yuzuriha:wiki:my_ids";
const myWikiIds: string[] = JSON.parse(
  localStorage.getItem(LS_MY_WIKI_IDS) || "[]"
);
const markAsMine = (id: string | number) => {
  if (!myWikiIds.includes(String(id))) {
    myWikiIds.push(String(id));
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds));
  }
};
const canEdit = (id: string | number) => myWikiIds.includes(String(id));

// 数据状态
const entries = ref<any[]>([]);

// 本地存储键
const LS_LIKED_IDS = "yuzuriha:wiki:liked_ids";
// 从 localStorage 读取已点赞 id 列表（字符串形式）
const likedIds = ref<string[]>(
  JSON.parse(localStorage.getItem(LS_LIKED_IDS) || "[]")
);

const showModal = ref(false);
const editing = ref(false);
const editingId = ref<string | number | null>(null);
const detailEntry = ref<any>(null);
const form = reactive({ title: "", slug: "", author: "", content: "" });
const search = ref("");

// 时间格式化
function formatTime(ts: string | number | null | undefined) {
  if (!ts) return "时间未定";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "时间未定";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// 加载词条列表
async function loadEntries() {
  try {
    const res: any = await getWikiList();
    entries.value = res.data.map((e: any) => ({
      ...e,
      createdAt: e.createdAt || e.created_at,
      updatedAt: e.updatedAt || e.updated_at,
    }));
  } catch (err) {
    console.error(err);
    ElMessage.error("加载词条失败");
  }
}

// 打开/关闭弹窗
function openCreate() {
  editing.value = false;
  editingId.value = null;
  form.title = "";
  form.slug = "";
  form.author = "";
  form.content = "";
  showModal.value = true;
}
function openEdit(entry: any) {
  if (!canEdit(entry.id)) {
    ElMessage.warning("只有创建者可以编辑");
    return;
  }
  editing.value = true;
  editingId.value = entry.id;
  form.title = entry.title;
  form.slug = entry.slug;
  form.author = entry.author;
  form.content = entry.content;
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}

const canSubmit = computed(() => form.title.trim() && form.content.trim());

// 提交
async function submit() {
  if (!canSubmit.value) {
    ElMessage.warning("请填写标题和内容");
    return;
  }
  const payload = {
    title: form.title.trim(),
    author: form.author.trim() || "匿名记录者",
    content: form.content.trim(),
    slug: null,
  };
  if (form.slug.trim()) payload.slug = form.slug.trim();
  try {
    if (editing.value && editingId.value) {
      await updateWiki(editingId.value, payload);
      ElMessage.success("编辑成功");
    } else {
      const res: any = await createWiki(payload);
      markAsMine(res.data.id);
      editingId.value = res.data.id;
      ElMessage.success("创建成功");
    }
    showModal.value = false;
    loadEntries();
  } catch (err) {
    console.error(err);
    ElMessage.error("提交失败");
  }
}

// 删除
async function remove(id: string | number) {
  if (!canEdit(id)) {
    ElMessage.warning("只有创建者可以删除");
    return;
  }
  if (!confirm("确认湮灭此回响？此操作不可逆")) return;
  try {
    await deleteWiki(id);
    const index = myWikiIds.indexOf(String(id));
    if (index !== -1) myWikiIds.splice(index, 1);
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds));
    ElMessage.success("删除成功");
    loadEntries();
  } catch (err) {
    console.error(err);
    ElMessage.error("删除失败");
  }
}

// 点赞
function persistLikedIds() {
  try {
    localStorage.setItem(LS_LIKED_IDS, JSON.stringify(likedIds.value));
  } catch (e) {
    console.warn("保存 likedIds 失败", e);
  }
}

// 判断是否已点赞（供模板绑定 class/aria-pressed）
function isLiked(id: string | number) {
  return likedIds.value.includes(String(id));
}

// 点赞 / 取消点赞（乐观更新，本地仅存 id，点赞数使用 entry.likes）
async function toggleLike(id: string | number) {
  const entry = entries.value.find((e) => e.id === id);
  if (!entry) return;

  const idStr = String(id);
  const wasLiked = likedIds.value.includes(idStr);

  // 乐观更新 UI（立即反映）
  if (wasLiked) {
    // 取消点赞：保证不低于 0
    entry.likes = Math.max(0, (entry.likes || 0) - 1);
    likedIds.value = likedIds.value.filter((x) => x !== idStr);
  } else {
    // 点赞
    entry.likes = (entry.likes || 0) + 1;
    likedIds.value.push(idStr);
  }
  persistLikedIds();

  try {
    // 调用后端（action: 'like' | 'unlike' | 'toggle'）
    // 我们明确传 'like' 或 'unlike'
    const action = wasLiked ? "unlike" : "like";
    await likeWiki(id, action);

    // 可选：如果后端在响应中返回了最新的 likes 数（res.data.likes），
    // 你可以在这里用后端值覆盖本地（示例注释）
    // const res = await likeWiki(id, action)
    // if (res?.data?.likes !== undefined) entry.likes = res.data.likes
  } catch (err) {
    // 出错则回滚乐观更新
    console.error("toggleLike error", err);
    if (wasLiked) {
      // 取消点赞失败 -> 重新标记为已点赞
      entry.likes = (entry.likes || 0) + 1;
      if (!likedIds.value.includes(idStr)) likedIds.value.push(idStr);
    } else {
      // 点赞失败 -> 取消之前增加的 count
      entry.likes = Math.max(0, (entry.likes || 0) - 1);
      likedIds.value = likedIds.value.filter((x) => x !== idStr);
    }
    persistLikedIds();
    ElMessage.error("共鸣失败，请稍后重试");
  }
}

// 详情弹窗
async function openDetail(entry: any) {
  detailEntry.value = entry;
}

// 搜索过滤
const filteredEntries = computed(() => {
  const q = String(search.value || "")
    .trim()
    .toLowerCase();
  let list = entries.value;

  // 搜索过滤
  if (q) {
    list = list.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.slug || "").toLowerCase().includes(q)
    );
  }

  // 按点赞数排序（默认降序：点赞多的在前）
  return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
});

// 1. 分别导入两套图
const pcModules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
  eager: true,
});
const mobileModules = import.meta.glob(
  "@/assets/images2/*.{jpg,png,jpeg,webp}",
  { eager: true }
);

const pcSrcs: string[] = Object.values(pcModules).map((m: any) => m.default);
const mobileSrcs: string[] = Object.values(mobileModules).map(
  (m: any) => m.default
);

// 洗牌函数
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const randomFive = ref<string[]>([]);
const currentIndex = ref(0);
let timer: number;

function pickImages() {
  const isMobile = window.innerWidth < 768;
  const all = isMobile ? mobileSrcs : pcSrcs;
  randomFive.value = shuffle(all).slice(0, 5);
}

onMounted(() => {
  loadEntries();
  pickImages(); // 首次判断
  // 监听窗口大小变化
  window.addEventListener("resize", pickImages);

  // 轮播
  timer = window.setInterval(() => {
    if (randomFive.value.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % randomFive.value.length;
    }
  }, 5000);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener("resize", pickImages);
});
</script>

<style scoped lang="scss">
/* ==== 守岸人主题变量 - 基于你提供的配色 ==== */
.shorekeeper-page {
  /* 深空与海洋底色 */
  --color-deep-space: #020f19;
  --color-stellar-blue: #0a1a2a;
  --color-tidal-blue: #0f2b3f;
  /* 星光与晶体亮色 */
  --color-star-cyan: #4fe9df;
  --color-star-blue: #7fbfff;
  --color-mist-light: #e6f7ff;
  --color-echo-glow: #a6e9ff;
  --color-crystal-pink: #ff79c6;

  /* 衍生语义化变量 */
  --bg-primary: var(--color-deep-space);
  --bg-secondary: var(--color-stellar-blue);
  --bg-card: rgba(15, 43, 63, 0.7); /* 基于tidal-blue的透明色 */
  --text-primary: var(--color-mist-light);
  --text-secondary: var(--color-echo-glow);
  --accent-primary: var(--color-star-cyan);
  --accent-secondary: var(--color-star-blue);
  --accent-emotion: var(--color-crystal-pink); /* 用于点赞等情感交互 */
  --border-light: rgba(127, 191, 255, 0.15);
  --border-focus: rgba(79, 233, 223, 0.6);
  --glow-primary: rgba(79, 233, 223, 0.3);
  --glow-secondary: rgba(255, 121, 198, 0.2);
}

/* ==== 全局样式重置与背景 ==== */
.shorekeeper-page {
  min-height: 100vh;
  color: var(--text-primary);
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(
    160deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 40%,
    var(--color-tidal-blue) 100%
  );
  font-family: "Microsoft YaHei UI", "Segoe UI", sans-serif;
  padding-top: 80px;
}

/* 动态星光背景 */
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
    );
  background-size: 300px 300px;
  opacity: 0.4;
  animation: drift 80s linear infinite;
}

/* 轮播图样式调整，增加深海滤镜 */
.carousel {
  position: absolute;
  inset: 0;
  z-index: -9;
  .carousel-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1.2s ease-in-out;
    filter: blur(2px) brightness(0.6) saturate(1.1) hue-rotate(185deg);
    background-blend-mode: overlay;
  }
  .carousel-image.active {
    opacity: 0.25; /* 降低透明度，作为纹理背景 */
  }
}
.carousel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(2, 15, 25, 0.7) 0%,
    rgba(10, 26, 42, 0.5) 50%,
    rgba(15, 43, 63, 0.4) 100%
  );
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: multiply;
}

/* ==== 页面头部 ==== */
.wiki-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: rgba(10, 26, 42, 0.5); /* --color-stellar-blue 半透明 */
  backdrop-filter: blur(12px) saturate(180%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(127, 191, 255, 0.05); /* 极细发光边框 */
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
  border: 1px solid var(--border-light);
}

/* 头部背景能量流动效果 */
.wiki-header::after {
  content: "";
  position: absolute;
  right: -100px;
  top: -50px;
  width: 300px;
  height: 200px;
  background: radial-gradient(circle, var(--glow-primary) 0%, transparent 70%);
  filter: blur(30px);
  opacity: 0.15;
  animation: energy-flow 8s ease-in-out infinite;
}

.title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(
    90deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-butterfly {
  font-size: 24px;
  animation: butterfly-float 3s ease-in-out infinite;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
}

/* 搜索框 */
.search {
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  background: rgba(2, 15, 25, 0.5); /* --color-deep-space 半透明 */
  color: var(--text-primary);
  font-size: 15px;
  min-width: 260px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
}
.search::placeholder {
  color: rgba(166, 233, 255, 0.5); /* --color-echo-glow 半透明 */
}
.search:focus {
  border-color: var(--border-focus);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 0 15px var(--glow-primary);
  outline: none;
  background: rgba(2, 15, 25, 0.7);
}

/* 主按钮 */
.btn-new {
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  color: var(--bg-primary);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(79, 233, 223, 0.25),
    0 0 0 1px rgba(79, 233, 223, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-new:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(79, 233, 223, 0.4),
    0 0 0 1px rgba(79, 233, 223, 0.2);
}
.btn-new:active {
  transform: translateY(0);
}
.btn-new::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s;
}
.btn-new:hover::after {
  opacity: 1;
}

/* ==== 词条列表区域 ==== */
.wiki-body {
  margin-top: 20px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 16px;
  background: rgba(15, 43, 63, 0.3); /* --color-tidal-blue 半透明 */
  border-radius: 20px;
  backdrop-filter: blur(5px);
  border: 1px dashed var(--border-light);
}
.empty-hint {
  font-size: 13px;
  opacity: 0.7;
  margin-top: 10px;
}

.entry-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 24px;
}

/* ==== 词条卡片 ==== */
.entry-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px) saturate(180%);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);
  opacity: 0.98;
  border: 1px solid var(--border-light);
  overflow: hidden;
  position: relative;
}
.entry-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 25px var(--glow-primary),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-color: rgba(79, 233, 223, 0.3);
}

/* 卡片晶体裂痕装饰 */
.card-crystal {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 40px;
  height: 20px;
  opacity: 0.1;
  background-image: linear-gradient(
    45deg,
    transparent 45%,
    var(--accent-primary) 50%,
    transparent 55%
  );
  background-size: 10px 10px;
  filter: blur(0.5px);
}

/* 卡片底部能量光带 */
.card-glow {
  position: absolute;
  bottom: 0;
  left: 5%;
  width: 90%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--accent-primary),
    transparent
  );
  filter: blur(1px);
  opacity: 0;
  transition: opacity 0.4s;
}
.entry-card:hover .card-glow {
  opacity: 0.6;
}

.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.entry-meta {
  flex: 1;
  cursor: pointer;
  min-width: 250px;
}

.entry-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.entry-title {
  font-size: 22px;
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  background: linear-gradient(
    90deg,
    var(--text-primary),
    var(--text-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.3;
}

.entry-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;
  background: rgba(79, 233, 223, 0.1);
  color: var(--accent-primary);
  font-size: 13px;
  border: 1px solid rgba(79, 233, 223, 0.2);
  font-weight: 500;
}

.entry-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.meta-item {
  font-size: 13px;
  color: var(--text-secondary);
  background: rgba(127, 191, 255, 0.05);
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(127, 191, 255, 0.05);
}
.icon-author,
.icon-time {
  opacity: 0.8;
}

/* ==== 卡片操作区域 ==== */
.entry-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

/* 点赞按钮 */
.like {
  background: transparent;
  border: 1px solid rgba(255, 121, 198, 0.2); /* --color-crystal-pink */
  border-radius: 10px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-crystal-pink);
}
.like:hover {
  background: rgba(255, 121, 198, 0.08);
  border-color: rgba(255, 121, 198, 0.4);
  transform: scale(1.05);
}
.like.active {
  background: rgba(255, 121, 198, 0.15);
  border-color: var(--color-crystal-pink);
  color: var(--color-crystal-pink);
  box-shadow: 0 0 15px var(--glow-secondary);
}
.like-icon {
  display: flex;
  align-items: center;
}
.like-count {
  font-size: 15px;
  font-weight: 500;
}

/* 编辑删除按钮组 */
.edit-delete {
  display: flex;
  gap: 10px;
}
.small {
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(79, 233, 223, 0.08); /* --accent-primary 半透明 */
  border: 1px solid rgba(79, 233, 223, 0.15);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.small:hover {
  background: rgba(79, 233, 223, 0.15);
  border-color: rgba(79, 233, 223, 0.4);
  color: var(--accent-primary);
}
.small.danger {
  background: rgba(255, 100, 100, 0.08);
  border-color: rgba(255, 100, 100, 0.15);
  color: #ff7b7b;
}
.small.danger:hover {
  background: rgba(255, 100, 100, 0.15);
  border-color: rgba(255, 100, 100, 0.4);
}

/* ==== 模态框 (弹窗) ==== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 15, 25, 0.85); /* --color-deep-space 半透明 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal {
  width: min(800px, 92%);
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(10, 26, 42, 0.9); /* --color-stellar-blue 半透明 */
  backdrop-filter: blur(20px) saturate(200%);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(127, 191, 255, 0.1),
    0 0 40px var(--glow-primary);
  border: 1px solid var(--border-light);
  animation: modal-appear 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 25px;
}
.modal-header h3 {
  margin: 0;
  color: var(--accent-primary);
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.close {
  background: transparent;
  border: none;
  font-size: 22px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.modal-body {
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-body label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: var(--text-secondary);
}
.modal-body input,
.modal-body textarea {
  background: rgba(2, 15, 25, 0.5);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 15px;
  transition: all 0.3s;
  font-family: inherit;
}
.modal-body textarea {
  resize: vertical;
  min-height: 150px;
}
.modal-body input:focus,
.modal-body textarea:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px var(--glow-primary);
  outline: none;
  background: rgba(2, 15, 25, 0.7);
}
.modal-body input::placeholder,
.modal-body textarea::placeholder {
  color: rgba(166, 233, 255, 0.4);
}

/* 详情模态框特定样式 */
.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}
.detail-content {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}
.modal-footer .btn {
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  color: var(--bg-primary);
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(79, 233, 223, 0.25);
  transition: all 0.3s ease;
}
.modal-footer .btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(79, 233, 223, 0.4);
}
.modal-footer .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.modal-footer .btn.ghost {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  box-shadow: none;
}
.modal-footer .btn.ghost:hover {
  background: rgba(127, 191, 255, 0.05);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* ==== 动画定义 ==== */
@keyframes drift {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 300px 300px;
  }
}
@keyframes energy-flow {
  0%,
  100% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 0.15;
  }
  50% {
    transform: translateX(30px) translateY(-20px) scale(1.05);
    opacity: 0.25;
  }
}
@keyframes butterfly-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-4px) rotate(2deg);
  }
  66% {
    transform: translateY(2px) rotate(-1deg);
  }
}
@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal,
.modal-fade-leave-to .modal {
  transform: translateY(40px) scale(0.98);
}

/* ==== 响应式设计 ==== */
@media (max-width: 768px) {
  .shorekeeper-page {
    padding: 15px;
  }
  .wiki-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    padding: 20px;
  }
  .search {
    min-width: auto;
    width: 100%;
  }
  .btn-new {
    width: 100%;
    justify-content: center;
  }
  .entry-head {
    flex-direction: column;
    gap: 20px;
  }
  .entry-actions {
    width: 100%;
    justify-content: space-between;
  }
  .entry-title {
    font-size: 20px;
  }
  .modal {
    width: 96%;
    padding: 20px;
    max-height: 85vh;
  }
}
</style>