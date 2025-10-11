<template>
  <div class="megumi-message-board" aria-live="polite">
    <!-- 半透明顶部标题 -->
    <header class="board-header" role="banner">
      <div class="title-wrap">
        <h1>留言板</h1>
        <span class="title-count">（共{{ count }}条）</span>

        <p class="subtitle">潮汐轻语，寄望远方</p>
      </div>
    </header>

    <!-- 留言展示区 -->
    <section class="message-list">
      <transition-group name="msg" tag="div" class="message-list-inner">
        <!-- skeleton loading -->
        <div v-if="loading" class="skeleton-wrap" key="skeleton">
          <div class="skeleton" v-for="i in 4" :key="i">
            <div class="sk-avatar"></div>
            <div class="sk-lines">
              <div class="sk-line short"></div>
              <div class="sk-line"></div>
            </div>
          </div>
        </div>

        <!-- messages -->
        <div
          v-for="(msg, idx) in messages"
          :key="msg.id || msg._tempId || idx"
          class="message-card"
          :data-index="idx"
          tabindex="0"
          role="article"
          :aria-label="`留言来自 ${msg.name || '匿名'}，内容：${msg.content}`"
        >
          <div class="message-meta">
            <div class="left-meta">
              <div class="name-avatar" :title="msg.name || '匿名'">
                {{ getInitial(msg.name) }}
              </div>
              <div class="meta-texts">
                <div class="message-name">{{ msg.name || "匿名" }}</div>
                <div class="message-time">{{ formatTime(msg.created_at) }}</div>
              </div>
            </div>
            <!-- HTML：把 id/class 复制到对应位置 -->
            <div
              class="shouan-icon"
              role="button"
              tabindex="0"
              aria-label="共鸣之晶"
            >
              <svg
                viewBox="0 0 48 48"
                width="36"
                height="36"
                aria-hidden="true"
                focusable="false"
              >
                <!-- 外层晶格 -->
                <g class="crystal-frame">
                  <path d="M24 4 L36 12 L40 26 L30 38 L18 38 L8 26 L12 12 Z" />
                </g>
                <!-- 中心晶核 -->
                <g class="crystal-core">
                  <path d="M24 12 L31 18 L28 28 L24 32 L20 28 L17 18 Z" />
                </g>
                <!-- 小光点群 -->
                <g class="crystal-sparks" aria-hidden="true">
                  <circle cx="6" cy="10" r="0.9" />
                  <circle cx="42" cy="14" r="0.8" />
                  <circle cx="38" cy="36" r="0.7" />
                  <circle cx="10" cy="34" r="0.7" />
                </g>
              </svg>
            </div>
          </div>

          <p class="message-content">{{ msg.content }}</p>
        </div>
      </transition-group>
    </section>

    <!-- 底部发送区 -->
    <section class="message-form" aria-label="写下你的留言">
      <label class="sr-only" for="mb-name">你的昵称</label>
      <input
        id="mb-name"
        v-model="name"
        type="text"
        placeholder="你的昵称"
        @keydown.enter.prevent
      />

      <label class="sr-only" for="mb-content">留言内容</label>
      <textarea
        id="mb-content"
        v-model="content"
        placeholder="写下你的留言..."
        @keydown.ctrl.enter.prevent="submitMessage"
        @input="autoGrow"
        ref="textareaRef"
      />

      <div class="form-row">
        <div class="hint">按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快捷发送</div>
        <button @click="submitMessage" :disabled="isSending || !content.trim()">
          <span v-if="!isSending">发送</span>
          <span v-else>发送中…</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { getMessageList, createMessage } from "@/api/modules/message";

const messages = ref<any[]>([]);
const count = ref(0);
const name = ref(localStorage.getItem("shou_name") || "");
const content = ref("");
const loading = ref(true);
const isSending = ref(false);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const fetchMessages = async () => {
  loading.value = true;
  try {
    const res = await getMessageList({ page: 1, pageSize: 9999 });
    messages.value = res.data || [];
    count.value = res.pagination.total;
    await nextTick();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const submitMessage = async () => {
  if (!content.value.trim() || isSending.value) return;
  isSending.value = true;
  const payload = { name: name.value || "匿名", content: content.value };
  try {
    localStorage.setItem("shou_name", name.value);
    content.value = "";
    await nextTick();
    // 发送请求
    await createMessage(payload);
    // 重新同步列表（更可靠）
    await fetchMessages();
  } catch (err) {
    console.error(err);
  } finally {
    isSending.value = false;
  }
};

const formatTime = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  // 例如：2025-08-11 15:30
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const getInitial = (n?: string) => {
  if (!n) return "匿";
  return n.trim().slice(0, 1).toUpperCase();
};

const autoGrow = (e?: Event) => {
  const ta = textareaRef.value;
  if (!ta) return;
  ta.style.height = "auto";
  const h = Math.min(ta.scrollHeight, 220);
  ta.style.height = h + "px";
};

onMounted(() => {
  fetchMessages();
  // ensure textarea autosize initial
  nextTick(() => autoGrow());
});
</script>

<style scoped lang="scss">
/* ---------------- 守岸人 主题 - 替换版 .megumi-message-board ---------------- */
.megumi-message-board {
  position: relative;
  min-height: 100vh;
  padding-top: 110px;
  display: flex;
  flex-direction: column;
  /* 深海 / 黑海岸色调：深蓝 -> 海蓝 -> 冰蓝（带微弱星尘） */
  background: linear-gradient(
    180deg,
    #031726 0%,
    #07384a 36%,
    #0b5d78 68%,
    #052f47 100%
  );

  font-family: "Noto Sans SC", "Noto Sans", system-ui, -apple-system, "Segoe UI",
    Roboto, Arial;
  color: #e6f7fb;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* 深海暗角 + 星尘光晕（把视线引向中心列表） */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
        600px 280px at 18% 10%,
        rgba(10, 40, 60, 0.28),
        transparent 18%
      ),
      radial-gradient(
        700px 300px at 82% 88%,
        rgba(80, 140, 170, 0.06),
        transparent 22%
      ),
      linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.24));
    z-index: 0;
    mix-blend-mode: overlay;
  }

  /* 细微浮动星粒 - 使用伪元素渲染，轻量级动画 */
  &::before {
    content: "";
    position: absolute;
    inset: -20% -10%;
    background-image: radial-gradient(
        circle at 10% 20%,
        rgba(168, 240, 255, 0.06) 0 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 70% 30%,
        rgba(168, 240, 255, 0.04) 0 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 40% 70%,
        rgba(120, 200, 255, 0.03) 0 1px,
        transparent 2px
      );
    opacity: 0.85;
    z-index: 0;
    filter: blur(1px);
    animation: floatStars 18s linear infinite;
    pointer-events: none;
  }

  @keyframes floatStars {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0.9;
    }
    50% {
      transform: translateY(-12px) translateX(6px);
      opacity: 1;
    }
    100% {
      transform: translateY(0) translateX(0);
      opacity: 0.9;
    }
  }

  /* ---------- 顶部标题（毛玻璃 + 晶体装饰） ---------- */
  .board-header {
    position: absolute;
    top: 72px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 960px;
    /* 冷色毛玻璃 */
    background: linear-gradient(
      180deg,
      rgba(8, 28, 40, 0.48),
      rgba(6, 34, 50, 0.36)
    );
    padding: 14px 18px;
    border-radius: 14px;
    box-shadow: 0 14px 44px rgba(2, 18, 28, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px) saturate(120%);
    z-index: 6;
    border: 1px solid rgba(120, 200, 255, 0.06);

    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;

      h1 {
        margin: 0;
        font-size: 18px;
        color: #8ee8ff; /* 冷光色标题 */
        letter-spacing: 0.4px;
        font-weight: 900;
        text-shadow: 0 2px 10px rgba(30, 120, 160, 0.18);
      }
      .title-count {
        color: #bff7ff; /* 冰蓝色，契合守岸人风格 */
        font-size: 12px; /* 稍微小一点 */
        font-weight: 700;
        margin-left: 6px;
      }

      .subtitle {
        margin: 0;
        margin-left: auto;
        color: rgba(190, 230, 245, 0.9);
        font-size: 13px;
        font-weight: 600;
      }
    }

    /* 角落的晶体光晕装饰（视觉） */
    &::before {
      content: "";
      position: absolute;
      right: 12px;
      top: 8px;
      width: 72px;
      height: 44px;
      background: radial-gradient(
          14px 8px at 20% 40%,
          rgba(110, 210, 255, 0.12),
          transparent 30%
        ),
        radial-gradient(
          20px 10px at 60% 60%,
          rgba(90, 160, 200, 0.08),
          transparent 30%
        );
      filter: blur(6px);
      pointer-events: none;
      z-index: -1;
    }
  }

  /* ---------- 留言列表 ---------- */
  .message-list {
    z-index: 2;
    position: relative;
    flex: 1;
    overflow-y: auto;
    padding: 28px 20px 340px; /* 给底部输入更多空间 */
    margin-top: 18px;

    .message-list-inner {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      z-index: 2;
    }

    /* skeleton 样式替换成守岸人色系 */
    .skeleton-wrap {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .skeleton {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px;
        background: linear-gradient(
          180deg,
          rgba(8, 36, 48, 0.36),
          rgba(6, 34, 44, 0.28)
        );
        border-radius: 12px;
        box-shadow: 0 6px 18px rgba(2, 18, 26, 0.5);
        border: 1px solid rgba(80, 160, 200, 0.03);
      }

      .sk-avatar {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: linear-gradient(90deg, #0f8aa6, #72d0ff);
      }

      .sk-lines {
        flex: 1;

        .sk-line {
          height: 10px;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.06),
            rgba(150, 220, 250, 0.03)
          );
          margin-bottom: 8px;
        }

        .sk-line.short {
          width: 40%;
        }
      }
    }
  }

  /* ---------- 单条消息卡片（守岸人版） ---------- */
  .message-card {
    /* 采用半透明深色玻璃感 + 冰蓝边缘高光 */
    background: linear-gradient(
      180deg,
      rgba(6, 30, 40, 0.72),
      rgba(5, 25, 34, 0.68)
    );
    border-radius: 14px;
    padding: 14px 16px;
    margin: 0 auto;
    width: calc(100% - 48px);
    max-width: 960px;
    box-shadow: 0 18px 60px rgba(2, 18, 26, 0.6);
    border: 1px solid rgba(110, 200, 255, 0.06);
    transition: transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.32s,
      border-color 0.32s;
    transform-origin: center;
    position: relative;
    z-index: 3;
    overflow: visible;

    /* 右上角的“晶格光斑”装饰 */
    .crystal-badge {
      position: absolute;
      right: 10px;
      top: 8px;
      width: 40px;
      height: 40px;
      pointer-events: none;
      z-index: 4;
      background: radial-gradient(
          circle at 30% 35%,
          rgba(160, 240, 255, 0.18),
          transparent 30%
        ),
        radial-gradient(
          circle at 70% 70%,
          rgba(120, 200, 255, 0.06),
          transparent 30%
        );
      filter: blur(3px);
      border-radius: 8px;
    }

    &:hover {
      transform: translateY(-8px) scale(1.01);
      box-shadow: 0 30px 90px rgba(0, 20, 30, 0.68);
      border-color: rgba(140, 220, 255, 0.12);
    }

    /* hover 时左侧晶体发光动效 */
    &:hover::before {
      box-shadow: 0 14px 46px rgba(60, 180, 210, 0.12),
        inset 0 2px 8px rgba(255, 255, 255, 0.03);
      transform: translateX(-2px) scaleY(1.02);
    }

    .message-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;

      .left-meta {
        display: flex;
        gap: 12px;
        align-items: center;

        .name-avatar {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #002a35;
          background: linear-gradient(180deg, #bff7ff 0%, #66dff0 60%);
          border: 2px solid rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 -6px 18px rgba(0, 20, 30, 0.08);
          font-size: 16px;
          flex-shrink: 0;
        }

        .meta-texts {
          .message-name {
            font-size: 15px;
            color: #bff7ff;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 3px 8px rgba(0, 40, 60, 0.35);
          }

          .message-time {
            font-size: 12px;
            color: rgba(180, 215, 230, 0.9);
            margin-top: 2px;
          }
        }
      }

      /* ===========================================================
   守岸人风格 图标 完整 SCSS（嵌套写法）
   适配 HTML 结构：
   <div class="shouan-icon" role="button" tabindex="0" aria-label="共鸣之晶">
     <svg> ... <g class="crystal-frame">... </g> <g class="crystal-core">... </g> <g class="crystal-sparks">... </g> </svg>
   </div>
   =========================================================== */

      .shouan-icon {
        display: inline-grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        cursor: pointer;
        user-select: none;
        position: relative;
        z-index: 1;

        /* 背景与内阴影，塑造深海玻璃感 */
        background: linear-gradient(
          180deg,
          rgba(6, 30, 40, 0.92),
          rgba(8, 44, 60, 0.84)
        );
        border: 1px solid rgba(120, 200, 255, 0.06);
        box-shadow: 0 8px 30px rgba(2, 12, 18, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.02);
        transition: transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1),
          box-shadow 260ms, background 260ms;
        -webkit-tap-highlight-color: transparent;
        will-change: transform, box-shadow;

        /* svg 基础尺寸 */
        svg {
          width: 36px;
          height: 36px;
          display: block;
          overflow: visible;
        }

        /* ---------- 外层晶格（描边） ---------- */
        .crystal-frame {
          path {
            fill: none;
            stroke: rgba(140, 220, 255, 0.22);
            stroke-width: 1.2;
            stroke-linejoin: round;
            filter: drop-shadow(0 6px 14px rgba(40, 140, 170, 0.06));
            transition: stroke 260ms, opacity 260ms, transform 260ms;
            transform-origin: 50% 50%;
            opacity: 0.96;
          }
        }

        /* ---------- 中心晶核（填充） ---------- */
        .crystal-core {
          path {
            fill: #7be8ff; /* 高亮色（默认弱） */
            opacity: 0.14;
            transform-origin: 50% 50%;
            transition: fill 260ms, opacity 260ms, transform 260ms, filter 260ms;
            filter: drop-shadow(0 10px 26px rgba(50, 160, 200, 0.08));
          }
        }

        /* ---------- 小光点（星屑） ---------- */
        .crystal-sparks {
          circle {
            fill: rgba(180, 245, 255, 0.95);
            opacity: 0;
            transform-origin: center;
            transition: opacity 240ms, transform 360ms;
          }
        }

        /* ---------- hover / focus（交互） ---------- */
        &:hover,
        &:focus {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 26px 86px rgba(2, 18, 30, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.02);
          background: linear-gradient(
            180deg,
            rgba(6, 36, 48, 0.95),
            rgba(10, 52, 72, 0.9)
          );

          .crystal-frame path {
            stroke: rgba(110, 230, 255, 0.95);
            opacity: 1;
          }
          .crystal-core path {
            opacity: 1;
            transform: scale(1.03);
            fill: #7be8ff;
            filter: drop-shadow(0 18px 46px rgba(50, 180, 220, 0.12));
          }
          .crystal-sparks circle {
            opacity: 1;
            &:nth-child(1) {
              transform: translate(-4px, -6px) scale(1.4);
            }
            &:nth-child(2) {
              transform: translate(6px, -4px) scale(1.2);
            }
            &:nth-child(3) {
              transform: translate(4px, 6px) scale(1.1);
            }
            &:nth-child(4) {
              transform: translate(-6px, 4px) scale(1.15);
            }
          }
        }

        /* 点击态短反馈 */
        &:active {
          transform: translateY(-2px) scale(0.99);
        }

        /* focus 可访问样式（键盘） */
        &:focus {
          outline: none;
          box-shadow: 0 26px 86px rgba(2, 18, 30, 0.7),
            0 0 0 6px rgba(64, 180, 220, 0.06);
        }

        /* ---------- active 类（外层手动加上 .active 时更强的呼吸） ---------- */
        &.active {
          .crystal-core path {
            opacity: 1;
            animation: corePulse 2000ms ease-in-out infinite;
          }
          .crystal-frame path {
            stroke: rgba(110, 230, 255, 0.95);
          }
        }

        /* disabled 表现（如果需要） */
        &.disabled {
          cursor: not-allowed;
          opacity: 0.5;
          transform: none;
          box-shadow: none;

          .crystal-core path {
            opacity: 0.06;
            fill: #3b6aa8;
            filter: none;
          }
          .crystal-frame path {
            stroke: rgba(120, 160, 180, 0.06);
          }
          .crystal-sparks circle {
            opacity: 0;
            transform: none;
          }
        }

        /* ---------- 常驻循环动效（轻浮 / 晶核呼吸 / 外框摆动 / 星点循环） ---------- */
        /* 把这些放在 .shouan-icon 下以便 scope 管理 */
        animation: shouanFloat 8s ease-in-out infinite;
        will-change: transform, opacity;

        .crystal-frame {
          path {
            transform-origin: 50% 50%;
            animation: frameSway 12s ease-in-out infinite;
          }
        }

        .crystal-core {
          path {
            animation: coreBreathe 4.6s ease-in-out infinite;
            transform-origin: 50% 50%;
          }
        }

        .crystal-sparks {
          circle {
            opacity: 0;
            transform-origin: center;
            animation: sparkFloat 1800ms ease-in-out infinite;
          }
          circle:nth-child(1) {
            animation-delay: 0ms;
          }
          circle:nth-child(2) {
            animation-delay: 220ms;
          }
          circle:nth-child(3) {
            animation-delay: 420ms;
          }
          circle:nth-child(4) {
            animation-delay: 640ms;
          }
        }

        /* 小屏适配：尺寸微调 */
        @media (max-width: 480px) {
          width: 44px;
          height: 44px;
          svg {
            width: 30px;
            height: 30px;
          }

          .crystal-frame path {
            stroke-width: 1;
          }
          .crystal-core path {
            filter: drop-shadow(0 6px 16px rgba(40, 160, 200, 0.06));
          }
        }
      }

      /* ================= keyframes ================= */

      @keyframes shouanFloat {
        0% {
          transform: translateY(0) scale(1);
        }
        40% {
          transform: translateY(-6px) scale(1.015);
        }
        70% {
          transform: translateY(-3px) scale(1.008);
        }
        100% {
          transform: translateY(0) scale(1);
        }
      }

      @keyframes frameSway {
        0% {
          transform: rotate(-0.6deg) translateY(0);
        }
        50% {
          transform: rotate(0.6deg) translateY(-2px);
        }
        100% {
          transform: rotate(-0.6deg) translateY(0);
        }
      }

      @keyframes coreBreathe {
        0% {
          transform: scale(1);
          opacity: 0.92;
          filter: drop-shadow(0 6px 18px rgba(40, 160, 200, 0.06));
        }
        50% {
          transform: scale(1.04);
          opacity: 1;
          filter: drop-shadow(0 18px 46px rgba(50, 180, 220, 0.12));
        }
        100% {
          transform: scale(1);
          opacity: 0.92;
          filter: drop-shadow(0 6px 18px rgba(40, 160, 200, 0.06));
        }
      }

      @keyframes sparkFloat {
        0% {
          opacity: 0;
          transform: translateY(0) scale(0.8);
          filter: blur(0);
        }
        35% {
          opacity: 1;
          transform: translateY(-6px) scale(1.15);
          filter: blur(0.2px);
        }
        70% {
          opacity: 0.6;
          transform: translateY(-10px) scale(1.25);
          filter: blur(0.8px);
        }
        100% {
          opacity: 0;
          transform: translateY(-14px) scale(1.35);
          filter: blur(1.6px);
        }
      }

      @keyframes corePulse {
        0% {
          transform: scale(1);
          filter: drop-shadow(0 6px 18px rgba(40, 160, 200, 0.06));
        }
        50% {
          transform: scale(1.06);
          filter: drop-shadow(0 18px 46px rgba(50, 180, 220, 0.12));
        }
        100% {
          transform: scale(1);
          filter: drop-shadow(0 6px 18px rgba(40, 160, 200, 0.06));
        }
      }

      /* ================= Accessibility: 减少动效支持 ================= */
      @media (prefers-reduced-motion: reduce) {
        .shouan-icon,
        .shouan-icon * {
          animation: none !important;
          transition: none !important;
        }
      }
    }

    .message-content {
      font-size: 15px;
      color: rgba(230, 248, 255, 0.95);
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      padding-bottom: 2px;
      letter-spacing: 0.2px;
    }
  }

  /* 列表项进场动效（保留原 transition-group 类名） */
  .msg-enter-from,
  .msg-leave-to {
    opacity: 0;
    transform: translateY(18px);
    filter: blur(0.8px);
  }

  .msg-enter-active,
  .msg-leave-active {
    transition: all 420ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  /* ---------- 固定底部输入区（守岸人风格） ---------- */
  .message-form {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 18px;
    width: calc(100% - 32px);
    max-width: 960px;
    background: linear-gradient(
      180deg,
      rgba(6, 28, 36, 0.84),
      rgba(6, 30, 40, 0.78)
    );
    padding: 14px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 18px 48px rgba(2, 18, 28, 0.6);
    z-index: 6;
    border: 1px solid rgba(120, 200, 255, 0.04);

    input,
    textarea {
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid rgba(120, 200, 255, 0.06);
      font-size: 14px;
      outline: none;
      transition: box-shadow 0.18s, border-color 0.18s, background 0.18s;
      background: linear-gradient(
        180deg,
        rgba(10, 30, 36, 0.6),
        rgba(6, 24, 34, 0.6)
      );
      box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.28);
      color: #e6f7fb;
      resize: none;
    }

    input:focus,
    textarea:focus {
      border-color: rgba(110, 200, 255, 0.18);
      box-shadow: 0 8px 26px rgba(40, 120, 150, 0.12);
      background: linear-gradient(
        180deg,
        rgba(12, 40, 54, 0.7),
        rgba(8, 30, 44, 0.68)
      );
    }

    textarea {
      min-height: 64px;
      max-height: 220px;
      line-height: 1.6;
    }

    .form-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .hint {
        color: rgba(170, 210, 230, 0.9);
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;

        kbd {
          background: rgba(10, 30, 40, 0.72);
          border-radius: 6px;
          padding: 2px 6px;
          border: 1px solid rgba(80, 160, 200, 0.06);
          font-size: 12px;
          box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.3);
          color: #bfefff;
        }
      }

      button {
        padding: 10px 18px;
        background: linear-gradient(180deg, #6feaff 0%, #2bb7d6 100%);
        color: #002a32;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 800;
        box-shadow: 0 12px 36px rgba(40, 160, 200, 0.14);
        transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
        background: linear-gradient(
          180deg,
          rgba(8, 30, 36, 0.6),
          rgba(6, 24, 32, 0.6)
        );
        color: rgba(170, 200, 220, 0.7);
      }

      button:not(:disabled):active {
        transform: translateY(1px);
      }
    }
  }

  /* ---------- 响应式：移动端收敛（守岸人样式） ---------- */
  @media (max-width: 980px) {
    padding-top: 90px;

    .board-header {
      left: 12px;
      transform: none;
      width: calc(100% - 24px);
    }

    .message-list {
      padding: 18px 12px 260px;

      .message-list-inner {
        gap: 12px;
      }
    }

    .message-card {
      width: calc(100% - 28px);
      border-radius: 12px;
      padding: 12px;

      .name-avatar {
        width: 44px;
        height: 44px;
      }
    }

    .message-form {
      left: 12px;
      transform: none;
      width: calc(100% - 24px);
      bottom: 12px;
      padding: 12px;
    }
  }

  /* sr-only（无障碍隐藏） */
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
}
</style>
