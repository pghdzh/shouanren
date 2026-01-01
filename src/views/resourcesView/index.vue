<template>
  <div class="shorekeeper-resources">
    <!-- 装饰性背景元素 -->
    <div class="background-effects">
      <div
        class="crystal-particle"
        v-for="i in 12"
        :key="i"
        :style="getParticleStyle(i)"
      ></div>
    </div>

    <!-- 页面头部 -->
    <header class="hero-section">
      <div class="hero-content">
        <div class="title-container">
          <h1 class="main-title">
            <span class="title-text">回音资源库</span>
            <span class="crystal-badge">守岸人</span>
          </h1>
          <p class="subtitle">汇聚关于「岸宝」的一切链接与资料</p>
        </div>
        <div class="hero-ornament">
          <div class="crystal-shard"></div>
          <div class="energy-orb"></div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- 上传区域 -->
      <section class="upload-section" :class="{ collapsed: uploaderCollapsed }">
        <div class="section-header" @click="toggleUploader">
          <div class="header-left">
            <div class="crystal-icon"></div>
            <h2>上传新区</h2>
            <div class="badge new">NEW</div>
          </div>
          <button class="toggle-btn" :aria-expanded="!uploaderCollapsed">
            <span class="toggle-icon">{{ uploaderCollapsed ? "▾" : "▴" }}</span>
            <span class="toggle-text">{{
              uploaderCollapsed ? "展开" : "收起"
            }}</span>
          </button>
        </div>

        <transition name="slide-fade">
          <div v-if="!uploaderCollapsed" class="upload-form-container">
            <div class="form-grid">
              <div class="form-group">
                <label class="input-label">
                  <span class="label-text">资源标题</span>
                  <span class="label-hint">（必填，可包含解压码等信息）</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="请输入资源标题..."
                  class="crystal-input"
                  aria-label="标题"
                />
              </div>

              <div class="form-group">
                <label class="input-label">
                  <span class="label-text">链接类型</span>
                </label>
                <div class="type-selector">
                  <button
                    v-for="type in linkTypes"
                    :key="type"
                    @click="form.type = type"
                    :class="{ active: form.type === type }"
                    class="type-option"
                  >
                    {{ type }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="input-label">
                  <span class="label-text">上传者</span>
                  <span class="label-hint">（可选，留空则为匿名）</span>
                </label>
                <input
                  v-model="form.uploader"
                  type="text"
                  placeholder="你的名字..."
                  class="crystal-input"
                  aria-label="上传人"
                />
              </div>

              <div class="form-group">
                <label class="input-label">
                  <span class="label-text">资源链接</span>
                </label>
                <div class="link-input-container">
                  <input
                    v-model="form.link"
                    type="url"
                    placeholder="https://..."
                    class="crystal-input link-input"
                    aria-label="链接"
                  />
                  <span class="link-prefix">🔗</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button @click="resetForm" class="btn secondary">
                <span class="btn-icon">↺</span>
                清空
              </button>
              <button
                @click="addResource"
                class="btn primary"
                :disabled="!canSubmit"
              >
                <span class="btn-icon">↑</span>
                上传资源
              </button>
            </div>
          </div>
        </transition>
      </section>

      <!-- 资源列表 -->
      <section class="resources-section">
        <div class="section-header">
          <div class="header-left">
            <div class="crystal-icon"></div>
            <h2>回音列表</h2>
            <div class="count-badge">{{ resources.length }}</div>
          </div>

          <div class="sort-controls">
            <div class="sort-label">排序方式</div>
            <div class="sort-options">
              <button
                @click="sortBy = 'time'"
                :class="{ active: sortBy === 'time' }"
                class="sort-option"
              >
                <span class="sort-icon">🕒</span>
                <span class="sort-text">时间</span>
              </button>
              <button
                @click="sortBy = 'likes'"
                :class="{ active: sortBy === 'likes' }"
                class="sort-option"
              >
                <span class="sort-icon">❤️</span>
                <span class="sort-text">热度</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 资源列表内容 -->
        <div v-if="resources.length > 0" class="resources-grid">
          <div
            v-for="item in sortedResources"
            :key="item.id"
            class="resource-card"
            :class="{ featured: item.likes >= 10 }"
          >
            <div class="card-header">
              <div class="type-badge" :style="getTypeColor(item.type)">
                {{ item.type }}
              </div>
              <div class="card-actions">
                <button
                  @click="handleLike(item)"
                  :aria-pressed="likedIds.has(String(item.id))"
                  class="like-btn"
                  :class="{ active: likedIds.has(String(item.id)) }"
                >
                  <i
                    class="heart"
                    :class="{ liked: likedIds.has(String(item.id)) }"
                  ></i>

                  <span class="like-count">{{ item.likes }}</span>
                </button>
              </div>
            </div>

            <a
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="card-title"
            >
              {{ item.title }}
              <span class="external-icon">↗</span>
            </a>

            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span class="meta-text">{{ item.uploader || "匿名行者" }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🕒</span>
                <span class="meta-text">{{ formatTime(item.time) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div
                class="energy-level"
                :style="getEnergyLevel(item.likes)"
              ></div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">🌊</div>
          <h3>海域静谧</h3>
          <p>这里还没有回音，成为第一个上传者吧</p>
          <button @click="uploaderCollapsed = false" class="btn outline">
            <span class="btn-icon">+</span>
            上传第一条资源
          </button>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="page-footer">
      <div class="footer-content">
        <div class="footer-notice">
          <span class="notice-icon">💡</span>
          提示：点击资源标题将直接跳转至对应链接
        </div>
        <div class="footer-copyright">· 守岸人之畔 · 回音永存 ·</div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  getResourceList,
  createResource,
  likeResource,
} from "@/api/modules/resource";
import { ElMessage } from "element-plus";

interface Resource {
  id: number | string;
  title: string;
  uploader?: string;
  time: string;
  likes: number;
  link: string;
  type: string;
  role_key?: string;
}

const STORAGE_KEY = "shou_resources_v1";
const DEFAULT_ROLE = "shou";
const linkTypes = ["网页链接", "B站视频", "网盘资源", "其他"];

const form = ref({
  title: "",
  uploader: "",
  link: "",
  type: "网页链接",
});

const resources = ref<Resource[]>([]);
const likedIds = ref(new Set<string>());
const sortBy = ref<"time" | "likes">("time");
const uploaderCollapsed = ref(false);

// 粒子背景样式
function getParticleStyle(index: number) {
  const size = 2 + Math.random() * 4;
  const delay = index * 0.5;
  const duration = 8 + Math.random() * 12;
  const x = Math.random() * 100;
  const y = Math.random() * 100;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}

// 获取类型颜色
function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    网页链接: "#66dff0",
    B站视频: "#ff66c4",
    网盘资源: "#6ec8ff",

    其他: "#8ee8ff",
  };
  return { backgroundColor: colors[type] || "#8ee8ff" };
}

// 获取能量等级（根据点赞数）
function getEnergyLevel(likes: number) {
  const percentage = Math.min(100, (likes / 50) * 100);
  return { width: `${percentage}%` };
}

// 原有逻辑保持不变...
function mapServerToLocal(row: any): Resource {
  return {
    id: row.id,
    title: row.title,
    uploader: row.uploader || "匿名",
    time: row.created_at || row.time || new Date().toISOString(),
    likes: row.likes ?? 0,
    link: row.link,
    type: row.storage_type || row.type || "other",
    role_key: row.role_key,
  };
}

async function loadResources() {
  try {
    const res: any = await getResourceList({
      role_key: DEFAULT_ROLE,
      page: 1,
      pageSize: 100,
    });
    if (res && res.success && Array.isArray(res.data)) {
      resources.value = res.data.map(mapServerToLocal);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.liked && Array.isArray(parsed.liked)) {
            parsed.liked.forEach((id: string) => likedIds.value.add(id));
          }
        } catch (e) {}
      }
      return;
    }
  } catch (err) {
    console.warn("拉取资源失败，使用本地缓存", err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.liked && Array.isArray(parsed.liked)) {
        parsed.liked.forEach((id: string) => likedIds.value.add(id));
      }
    }
  } catch (e) {
    console.warn("本地加载失败", e);
  }
}

function saveLocalCache() {
  try {
    const liked = Array.from(likedIds.value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ liked }));
  } catch (e) {
    console.warn("保存本地缓存失败", e);
  }
}

onMounted(() => {
  loadResources();
  uploaderCollapsed.value = window.innerWidth <= 768;
});

function toggleUploader() {
  uploaderCollapsed.value = !uploaderCollapsed.value;
}

const canSubmit = computed(() => {
  return form.value.title.trim() && form.value.link.trim();
});

async function addResource() {
  if (!canSubmit.value) {
    return ElMessage.warning("请填写完整信息");
  }

  const t = form.value.title.trim();
  const l = form.value.link.trim();

  if (!/^https?:\/\//i.test(l)) {
    return ElMessage.error("请输入正确的链接(https开头)");
  }

  try {
    const payload = {
      title: t,
      uploader: form.value.uploader.trim() || "匿名",
      link: l,
      storage_type: form.value.type,
      role_key: DEFAULT_ROLE,
    };

    const res: any = await createResource(payload);
    if (res && res.success && res.data) {
      const added = mapServerToLocal(res.data);
      resources.value.unshift(added);
      saveLocalCache();
      resetForm();
      ElMessage.success("上传成功");
      return;
    }
    ElMessage.error("上传失败");
  } catch (err) {
    console.warn("创建资源失败", err);
    ElMessage.error("上传失败，请稍后重试");
  }
}

function resetForm() {
  form.value.title = "";
  form.value.uploader = "";
  form.value.link = "";
  form.value.type = "网页链接";
}

async function handleLike(item: Resource) {
  const id = item.id;
  const wasLiked = likedIds.value.has(String(id));

  if (wasLiked) {
    likedIds.value.delete(String(id));
    item.likes = Math.max(0, item.likes - 1);
  } else {
    likedIds.value.add(String(id));
    item.likes++;
  }

  saveLocalCache();

  try {
    const action = wasLiked ? "unlike" : "like";
    const res: any = await likeResource(id, action);
    if (
      res &&
      res.success &&
      res.data &&
      typeof res.data.likes !== "undefined"
    ) {
      item.likes = res.data.likes;
    }
  } catch (err) {
    console.warn("点赞接口调用失败，回滚本地状态", err);
    if (wasLiked) {
      likedIds.value.add(String(id));
      item.likes++;
    } else {
      likedIds.value.delete(String(id));
      item.likes = Math.max(0, item.likes - 1);
    }
    saveLocalCache();
  }
}

const sortedResources = computed(() => {
  const arr = [...resources.value];
  if (sortBy.value === "time") {
    arr.sort((a, b) => +new Date(b.time) - +new Date(a.time));
  } else {
    arr.sort((a, b) => b.likes - a.likes);
  }
  return arr;
});

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch (e) {
    return iso;
  }
}
</script>

<style lang="scss" scoped>
.shorekeeper-resources {
  min-height: 100vh;
  position: relative;
  background: radial-gradient(
      ellipse at 20% 30%,
      rgba(20, 60, 100, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(30, 80, 120, 0.1) 0%,
      transparent 30%
    ),
    linear-gradient(180deg, #031726 0%, #052c44 40%, #073c5c 100%);
  color: #dff8ff;
  font-family: "Noto Sans SC", "PingFang SC", "Helvetica Neue", Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-top: 80px;

  .background-effects {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;

    .crystal-particle {
      position: absolute;
      background: rgba(191, 247, 255, 0.3);
      border-radius: 50%;
      filter: blur(1px);
      animation: floatParticle linear infinite;

      @keyframes floatParticle {
        0%,
        100% {
          transform: translateY(0) rotate(0deg);
          opacity: 0.3;
        }
        50% {
          transform: translateY(-20px) rotate(180deg);
          opacity: 0.6;
        }
      }
    }
  }

  .hero-section {
    padding: 0 20px 40px;
    position: relative;
    z-index: 1;

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 40px;

      .title-container {
        flex: 1;

        .main-title {
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;

          .title-text {
            font-size: 2.5rem;
            font-weight: 900;
            background: linear-gradient(
              135deg,
              #bff7ff 0%,
              #66dff0 45%,
              #2aa7c7 90%
            );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 4px 20px rgba(0, 40, 60, 0.3);

            @media (max-width: 768px) {
              font-size: 2rem;
            }
          }

          .crystal-badge {
            background: linear-gradient(
              135deg,
              rgba(191, 247, 255, 0.2),
              rgba(102, 223, 240, 0.1)
            );
            border: 1px solid rgba(191, 247, 255, 0.3);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #bff7ff;
            backdrop-filter: blur(10px);
          }
        }

        .subtitle {
          margin: 0;
          font-size: 1.1rem;
          color: rgba(191, 247, 255, 0.8);
          line-height: 1.6;

          @media (max-width: 768px) {
            font-size: 1rem;
          }
        }
      }

      .hero-ornament {
        .crystal-shard {
          width: 80px;
          height: 120px;
          background: linear-gradient(
            45deg,
            transparent 40%,
            rgba(191, 247, 255, 0.1)
          );
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          animation: pulse 4s ease-in-out infinite;

          @keyframes pulse {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.6;
            }
          }
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: 24px;

        .hero-ornament {
          display: none;
        }
      }
    }
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 60px;
    position: relative;
    z-index: 1;
  }

  // 上传区域
  .upload-section {
    background: linear-gradient(
      180deg,
      rgba(6, 30, 45, 0.7),
      rgba(8, 40, 60, 0.6)
    );
    border-radius: 20px;
    border: 1px solid rgba(191, 247, 255, 0.1);
    backdrop-filter: blur(10px);
    margin-bottom: 30px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 20, 40, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    .section-header {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: rgba(191, 247, 255, 0.05);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .crystal-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #bff7ff, #66dff0);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }

        h2 {
          margin: 0;
          font-size: 1.3rem;
          color: #bff7ff;
          font-weight: 700;
        }

        .badge.new {
          background: linear-gradient(135deg, #ff6b6b, #ff8e53);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }
      }

      .toggle-btn {
        background: transparent;
        border: 1px solid rgba(191, 247, 255, 0.2);
        color: #bff7ff;
        padding: 8px 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(191, 247, 255, 0.1);
          transform: translateY(-2px);
        }
      }
    }

    .upload-form-container {
      padding: 0 24px 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      .input-label {
        display: block;
        margin-bottom: 8px;

        .label-text {
          color: #bff7ff;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .label-hint {
          color: rgba(191, 247, 255, 0.6);
          font-size: 0.85rem;
          margin-left: 8px;
        }
      }

      .crystal-input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(3, 20, 35, 0.6);
        border: 1px solid rgba(191, 247, 255, 0.2);
        border-radius: 12px;
        color: #dff8ff;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #66dff0;
          box-shadow: 0 0 0 3px rgba(102, 223, 240, 0.1);
        }

        &::placeholder {
          color: rgba(191, 247, 255, 0.4);
        }
      }

      .type-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .type-option {
          padding: 8px 16px;
          background: rgba(3, 20, 35, 0.6);
          border: 1px solid rgba(191, 247, 255, 0.2);
          border-radius: 20px;
          color: rgba(191, 247, 255, 0.8);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover,
          &.active {
            background: linear-gradient(
              135deg,
              rgba(191, 247, 255, 0.2),
              rgba(102, 223, 240, 0.1)
            );
            border-color: #66dff0;
            color: #bff7ff;
          }
        }
      }

      .link-input-container {
        position: relative;

        .link-prefix {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(191, 247, 255, 0.6);
        }

        .link-input {
          padding-left: 40px;
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }

  // 资源列表区域
  .resources-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .crystal-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #bff7ff, #66dff0);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #bff7ff;
          font-weight: 700;
        }

        .count-badge {
          background: rgba(191, 247, 255, 0.1);
          border: 1px solid rgba(191, 247, 255, 0.3);
          color: #bff7ff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
      }

      .sort-controls {
        display: flex;
        align-items: center;
        gap: 12px;

        .sort-label {
          color: rgba(191, 247, 255, 0.8);
          font-size: 0.9rem;
        }

        .sort-options {
          display: flex;
          gap: 8px;
          background: rgba(3, 20, 35, 0.6);
          border: 1px solid rgba(191, 247, 255, 0.2);
          border-radius: 12px;
          padding: 4px;

          .sort-option {
            padding: 8px 16px;
            background: transparent;
            border: none;
            border-radius: 8px;
            color: rgba(191, 247, 255, 0.8);
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover,
            &.active {
              background: linear-gradient(
                135deg,
                rgba(191, 247, 255, 0.2),
                rgba(102, 223, 240, 0.1)
              );
              color: #bff7ff;
            }
          }
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;

        .sort-controls {
          justify-content: space-between;
        }
      }
    }

    .resources-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .resource-card {
        background: linear-gradient(
          180deg,
          rgba(8, 35, 55, 0.7),
          rgba(10, 45, 65, 0.6)
        );
        border-radius: 16px;
        border: 1px solid rgba(191, 247, 255, 0.1);
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
          transform: translateY(-5px);
          border-color: rgba(102, 223, 240, 0.3);
          box-shadow: 0 20px 40px rgba(0, 30, 60, 0.3);

          &::before {
            opacity: 1;
          }
        }

        &::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent 40%,
            rgba(191, 247, 255, 0.03)
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        &.featured {
          border-color: rgba(255, 215, 0, 0.3);

          &::after {
            content: "✨";
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 1.2rem;
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .type-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #031726;
          }

          .card-actions {
            .like-btn {
              display: flex;
              align-items: center;
              gap: 6px;
              background: transparent;
              border: none;
              cursor: pointer;
              padding: 6px;
              border-radius: 8px;
              transition: all 0.3s ease;

              &:hover {
                background: rgba(191, 247, 255, 0.1);
              }

           
              .heart {
                width: 22px;
                height: 22px;
                background: url("/icons/heart-red-outline.svg") no-repeat center;
                background-size: contain;
                transition: all 0.3s ease;

                &.liked {
                  background: url("/icons/heart-red-filled.svg") no-repeat
                    center;
                  background-size: contain;
                  animation: pulseGlow 0.6s ease;
                  filter: drop-shadow(0 0 8px rgba(red, 0.8));
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
                color: rgba(191, 247, 255, 0.9);
                font-weight: 600;
                font-size: 0.9rem;
              }
            }
          }
        }

        .card-title {
          display: block;
          color: #dff8ff;
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.5;
          margin-bottom: 16px;
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            color: #bff7ff;

            .external-icon {
              transform: translate(3px, -3px);
            }
          }

          .external-icon {
            display: inline-block;
            margin-left: 8px;
            transition: transform 0.3s ease;
          }
        }

        .card-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: rgba(191, 247, 255, 0.7);
            font-size: 0.9rem;

            .meta-icon {
              font-size: 0.9rem;
            }
          }
        }

        .card-footer {
          .energy-level {
            height: 4px;
            background: linear-gradient(90deg, #66dff0, #bff7ff);
            border-radius: 2px;
            transition: width 0.5s ease;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        opacity: 0.5;
      }

      h3 {
        color: #bff7ff;
        margin: 0 0 12px 0;
        font-size: 1.5rem;
      }

      p {
        color: rgba(191, 247, 255, 0.7);
        margin: 0 0 24px 0;
      }
    }
  }

  // 按钮样式
  .btn {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;

    .btn-icon {
      font-size: 1rem;
    }

    &.primary {
      background: linear-gradient(135deg, #66dff0 0%, #2aa7c7 100%);
      color: #031726;

      &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(102, 223, 240, 0.3);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &.secondary {
      background: rgba(191, 247, 255, 0.1);
      border: 1px solid rgba(191, 247, 255, 0.2);
      color: #bff7ff;

      &:hover {
        background: rgba(191, 247, 255, 0.2);
      }
    }

    &.outline {
      background: transparent;
      border: 2px solid rgba(191, 247, 255, 0.3);
      color: #bff7ff;

      &:hover {
        border-color: #66dff0;
        background: rgba(102, 223, 240, 0.1);
      }
    }
  }

  // 页脚
  .page-footer {
    padding: 30px 20px;
    border-top: 1px solid rgba(191, 247, 255, 0.1);

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;

      .footer-notice {
        color: rgba(191, 247, 255, 0.7);
        font-size: 0.9rem;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .notice-icon {
          font-size: 1rem;
        }
      }

      .footer-copyright {
        color: rgba(191, 247, 255, 0.5);
        font-size: 0.85rem;
        letter-spacing: 1px;
      }
    }
  }

  // 过渡动画
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

// 移动端优化
@media (max-width: 768px) {
  .shorekeeper-resources {
    padding-top: 100px;

    .hero-section {
      padding: 0 16px 30px;
    }

    .main-content {
      padding: 0 16px 40px;
    }

    .upload-section {
      margin-bottom: 24px;
    }

    .resources-section {
      .section-header {
        .header-left {
          h2 {
            font-size: 1.3rem;
          }
        }
      }

      .resources-grid {
        gap: 16px;
      }
    }

    .btn {
      width: 100%;
      padding: 14px 24px;
    }

    .form-actions {
      flex-direction: column;
    }
  }
}
</style>