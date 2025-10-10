<template>
  <div class="tsubaki-snake" ref="rootRef" role="application" aria-label="红椿风格贪吃蛇游戏">
    <header class="topbar">
      <div class="title">
        <div class="logo" aria-hidden="true"></div>
        <div>
          <h1>椿之盛放 · 贪吃蛇</h1>
          <p class="tagline">把花瓣吞成节奏 — 滑动 / 按钮 / ←↑→↓</p>
        </div>
      </div>

      <div class="controls">
        <label class="wrap-toggle">
          <input type="checkbox" v-model="wrapMode" :disabled="!gameOver" />环绕模式（穿墙）
        </label>

        <button class="btn ghost" @click="togglePause" :aria-pressed="paused">{{ paused ? '继续' : '暂停' }}</button>
        <button class="btn" @click="resetGame">重玩</button>
      </div>
    </header>

    <main class="game-area">
      <div class="left-panel">
        <div class="score-panel">
          <div class="score">得分 <span class="num">{{ score }}</span></div>
          <div class="best">记录 <span class="num">{{ bestScore }}</span></div>
          <div class="info-small">长度 <strong>{{ snake.length }}</strong></div>
          <div class="info-small">速度 <strong>{{ Math.round(currentSpeed * 10) / 10 }}</strong> 格/秒</div>
        </div>

        <div class="info">
          <p>模式：<strong>{{ wrapMode ? '环绕（穿墙）' : '边界致死' }}</strong></p>
          <p v-if="gameOver" class="over">游戏结束 — 点击重玩或切换模式</p>
        </div>
      </div>

      <div class="canvas-wrap" ref="canvasWrap">
        <canvas ref="canvasRef" tabindex="0" aria-label="游戏画布（贪吃蛇）"></canvas>


      </div>

      <aside class="right-panel">
        <div class="panel card">
          <h3>说明</h3>
          <ul>
            <li>吃到小花瓣增长并得分；吃到阿漂分值更高（阿漂存在时间有限并临近消失会闪烁）。</li>
            <li>每吃 3 个小花瓣后，有概率生成一次阿漂。</li>
            <li>环绕模式穿墙不死，但食物得分会下降（折扣）。</li>
          </ul>
        </div>

        <div class="panel card ranking-panel">
          <h3>排行榜</h3>

          <div class="ranking-actions">
            <label class="nick-wrap" aria-label="上传昵称">
              <input v-model="uploaderNick" @keydown.enter.prevent="uploadScore" type="text" maxlength="32"
                placeholder="输入昵称" aria-placeholder="昵称" class="nick-input" />
            </label>
            <button class="btn small" @click="uploadScore()" :disabled="!gameOver">上传当前模式最高记录</button>
            <button class="btn small ghost" @click="openRankingModal(true)">查看环绕榜</button>
            <button class="btn small ghost" @click="openRankingModal(false)">查看边界榜</button>
          </div>


        </div>

        <!-- 排行榜弹窗（放在组件末尾模板处） -->

        <div v-if="rankingModal.visible" class="ranking-modal-overlay" @click.self="closeRankingModal">
          <div class="ranking-modal card" role="dialog" aria-modal="true" :aria-label="rankingModal.title">
            <header class="rm-head">
              <h3>{{ rankingModal.title }}</h3>
              <div class="rm-actions">

                <button class="btn small" @click="closeRankingModal">x</button>
              </div>
            </header>

            <div class="rm-body">
              <p v-if="rankingLoading" class="muted">加载中…</p>
              <ol v-else class="ranking-list">
                <li v-for="(it, idx) in rankingData" :key="it.id || idx">
                  <span class="rank">{{ idx + 1 }}</span>
                  <span class="nick">{{ it.nickname || '匿名' }}</span>
                  <span class="score">{{ it.count ?? it.score ?? 0 }}</span>
                </li>
              </ol>
              <p v-if="!rankingLoading && rankingData.length === 0" class="muted">暂无榜单数据。</p>
            </div>
          </div>
        </div>


      </aside>
    </main>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { getRankingList, addRankingItem } from "@/api/modules/ranking";

type Dir = 'up' | 'down' | 'left' | 'right';
const STORAGE_KEY = 'tsubaki_snake_best_wrap_v4';

/* 速度与分值配置 */
const BASE_SPEED = 7;
const SPEED_STEP = 1;
const STEP_LENGTH = 5;
const MAX_SPEED = 26;
const SMALL_SCORE = 10;
const BIG_SCORE = 30;
const WRAP_SCORE_FACTOR = 0.7;

/* 大食物规则 */
const SMALLS_TO_TRIGGER = 3;
const BIG_APPEAR_PROB = 0.5;
const BIG_LIFETIME = 8000; // ms
const BIG_FLASH_THRESHOLD = 2800; // 当剩余时间小于此阈值开始闪烁（ms）
const FLASH_FREQ = 240; // 闪烁频率，ms（影响 sin 速度）

/* 状态 refs */
const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWrap = ref<HTMLElement | null>(null);

const paused = ref(false);
const gameOver = ref(false);
const score = ref(0);
const wrapMode = ref(true); // 默认开启环绕模式（按你要求）

const bests = reactive<Record<string, number>>({ wrap_false: 0, wrap_true: 0 });

/* canvas 游戏数据 */
let ctx: CanvasRenderingContext2D | null = null;
let rafId = 0;
let lastTime = 0;
let acc = 0;

let gridSize = 22;
let cellPx = 20;
let cols = 22, rows = 22;

interface Cell { x: number; y: number }
const snake = ref<Cell[]>([]);
let dir: Dir = 'right';
let nextDir: Dir | null = null;

/* 食物 */
let food: Cell | null = null;
let foodIsBig = false;
let smallsEatenSinceTrigger = 0;
let bigExpiresAt = 0;
let bigVariant = 1;

/* 图片资源（替换为你项目真实路径） */
const smallFoodSrc = new URL('@/assets/gameImg/petal-small.jpg', import.meta.url).href;
const bigFood1Src = new URL('@/assets/gameImg/petal-big-1.png', import.meta.url).href;
const bigFood2Src = new URL('@/assets/gameImg/petal-big-2.png', import.meta.url).href;
const headImgSrc = new URL('@/assets/avatar/chun.webp', import.meta.url).href;

const imgSmall = new Image();
const imgBig1 = new Image();
const imgBig2 = new Image();
const imgHead = new Image();
imgSmall.src = smallFoodSrc;
imgBig1.src = bigFood1Src;
imgBig2.src = bigFood2Src;
imgHead.src = headImgSrc;

/* 计算属性 */
const SPEED_PER_CELL = 0.12;
const currentSpeed = computed(() => {
  const len = Math.max(0, snake.value.length - 3);
  const speed = BASE_SPEED + len * SPEED_PER_CELL;
  return Math.min(MAX_SPEED, speed);
});
const bestScore = computed(() => bests[wrapMode.value ? 'wrap_true' : 'wrap_false'] ?? 0);

/* 本地缓存 */
function loadBests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(bests, JSON.parse(raw));
  } catch (e) { }
}
function saveBests() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bests)); } catch (e) { }
}

//排行榜
// 新增响应式状态
const rankingModal = ref({
  visible: false,
  isWrap: true,   // true => 环绕榜， false => 边界榜
  title: "排行榜"
});
const rankingLoading = ref(false);
const rankingData = ref<any[]>([]);

// helper：根据模式返回 character_key
function charKeyForMode(isWrap: boolean) {
  return isWrap ? "chunGame_wrap" : "chunGame";
}

// 打开弹窗（isWrap: boolean）
function openRankingModal(isWrap: boolean) {
  rankingModal.value.isWrap = isWrap;
  rankingModal.value.title = isWrap ? "环绕模式榜单" : "边界模式榜单";
  console.log('res', rankingModal.value.title)
  rankingModal.value.visible = true;
  console.log('res', rankingModal.value.visible)
  fetchRanking();
}
function closeRankingModal() {
  rankingModal.value.visible = false;
  rankingData.value = [];
}

// 拉取榜单（简单取前 50）
// 后端接口约定：getRankingList({ character_key, page, pageSize })
async function fetchRanking() {
  rankingLoading.value = true;
  try {
    const key = charKeyForMode(rankingModal.value.isWrap);
    const res: any = await getRankingList({ character_key: key, page: 1, pageSize: 50 });
    // 假设返回结构为 { success: true, data: [...] } 或直接 data
    const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
    // 对返回的条目做容错处理：期望每项包含 nickname 与 count（或 score）
    rankingData.value = (list || []).map((r: any) => ({
      id: r.id ?? r._id ?? undefined,
      nickname: r.nickname ?? r.name ?? '匿名',
      count: r.count ?? r.score ?? r.value ?? 0,
    })).sort((a: any, b: any) => (b.count || 0) - (a.count || 0));
  } catch (e) {
    console.warn('拉取榜单失败', e);
    rankingData.value = [];
  } finally {
    rankingLoading.value = false;
  }
}
const uploaderNick = ref<string>(localStorage.getItem('chun_uploader_nick') || '');
const uploading = ref(false);
// 上传当前分数（会提示昵称），上传后刷新对应榜单
async function uploadScore() {
  // 如果没有分数或为 0，提示并返回
  if (!bestScore.value || bestScore.value <= 0) {
    alert('当前最高分数为空，无法上传。');
    return;
  }

  if (!uploaderNick.value.trim()) {
    alert('请输入昵称');
    return;
  }
  if (uploading.value) return;
  uploading.value = true;
  // 选择模式（使用当前 wrapMode 状态作为目标）
  const isWrap = Boolean(wrapMode.value);



  // post payload：{ character_key, nickname, count }
  const payload = {
    character_key: charKeyForMode(isWrap),
    nickname: uploaderNick.value,
    count: bestScore.value
  };

  try {
    const res: any = await addRankingItem(payload);
    // 假设返回 success 字段：成功后刷新对应榜
    if (res && (res.success === true || res.code === 0 || res.status === 200)) {
      alert('上传成功！');
    } else {
      // 如果后端直接返回 data 或无 success 判断也视为成功（容错）
      alert('上传已尝试（若未生效请检查网络或后端）。');
    }
  } catch (e) {
    console.error('上传失败', e);
    alert('上传失败，请稍后再试。');
  } finally {
    uploading.value = false;
    // 如果对应榜单弹窗打开且为当前模式，刷新；否则不自动打开（避免打扰）
    if (rankingModal.value.visible && rankingModal.value.isWrap === isWrap) {
      fetchRanking();
    }
  }

}

/* 游戏初始化 / 重置 */
function resetState() {
  gridSize = 22;
  cols = gridSize; rows = gridSize;
  score.value = 0; gameOver.value = false; paused.value = false;
  dir = 'right'; nextDir = null;
  snake.value = [];
  const midX = Math.floor(cols / 2), midY = Math.floor(rows / 2);
  snake.value.push({ x: midX - 1, y: midY }, { x: midX, y: midY }, { x: midX + 1, y: midY });

  smallsEatenSinceTrigger = 0;
  foodIsBig = false; bigExpiresAt = 0;
  placeFood();
  resizeCanvas();
  lastTime = performance.now();
  acc = 0;
}

function placeFood() {
  const occupied = new Set(snake.value.map(s => `${s.x},${s.y}`));
  let spawnBig = false;
  if (smallsEatenSinceTrigger >= SMALLS_TO_TRIGGER) {
    if (Math.random() < BIG_APPEAR_PROB) spawnBig = true;
    smallsEatenSinceTrigger = 0;
  }
  let tries = 0;
  while (tries < 2000) {
    const fx = Math.floor(Math.random() * cols);
    const fy = Math.floor(Math.random() * rows);
    if (!occupied.has(`${fx},${fy}`)) {
      food = { x: fx, y: fy };
      foodIsBig = spawnBig;
      if (spawnBig) { bigVariant = Math.random() < 0.5 ? 1 : 2; bigExpiresAt = Date.now() + BIG_LIFETIME; }
      else bigExpiresAt = 0;
      return;
    }
    tries++;
  }
  // 兜底扫描
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (!occupied.has(`${x},${y}`)) {
      food = { x, y }; foodIsBig = spawnBig;
      if (spawnBig) { bigVariant = Math.random() < 0.5 ? 1 : 2; bigExpiresAt = Date.now() + BIG_LIFETIME; } else bigExpiresAt = 0;
      return;
    }
  }
  food = null; foodIsBig = false; bigExpiresAt = 0;
}

/* 方向 / 移动逻辑 */
function dirToVec(d: Dir) { if (d === 'up') return { x: 0, y: -1 }; if (d === 'down') return { x: 0, y: 1 }; if (d === 'left') return { x: -1, y: 0 }; return { x: 1, y: 0 }; }
function isOpposite(a: Dir, b: Dir) { return (a === 'left' && b === 'right') || (a === 'right' && b === 'left') || (a === 'up' && b === 'down') || (a === 'down' && b === 'up'); }

function stepGame() {
  if (gameOver.value || paused.value) return;

  // 大食物过期检查（优先）
  if (foodIsBig && bigExpiresAt > 0 && Date.now() > bigExpiresAt) {
    food = null; foodIsBig = false; bigExpiresAt = 0; placeFood();
  }

  if (nextDir && !isOpposite(nextDir, dir)) dir = nextDir;
  const v = dirToVec(dir);
  let headX = snake.value[snake.value.length - 1].x + v.x;
  let headY = snake.value[snake.value.length - 1].y + v.y;

  if (wrapMode.value) {
    // 稳健的 modulo：保证结果永远在 [0, cols-1] / [0, rows-1]
    headX = ((headX % cols) + cols) % cols;
    headY = ((headY % rows) + rows) % rows;
  } else {
    if (headX < 0 || headX >= cols || headY < 0 || headY >= rows) {
      onGameOver();
      return;
    }
  }

  // 自身碰撞
  for (const s of snake.value) {
    if (s.x === headX && s.y === headY) {
      onGameOver();
      return;
    }
  }

  // 推入新头（坐标已被规范化）
  const newHead = { x: Math.trunc(headX), y: Math.trunc(headY) };
  snake.value.push(newHead);

  // 吃到食物？
  if (food && newHead.x === food.x && newHead.y === food.y) {

    if (foodIsBig) {
      const pts = wrapMode.value ? Math.floor(BIG_SCORE * WRAP_SCORE_FACTOR) : BIG_SCORE;
      score.value += pts;
      food = null; foodIsBig = false; bigExpiresAt = 0; smallsEatenSinceTrigger = 0; placeFood();
    } else {
      const pts = wrapMode.value ? Math.floor(SMALL_SCORE * WRAP_SCORE_FACTOR) : SMALL_SCORE;
      score.value += pts; smallsEatenSinceTrigger++; placeFood();
    }
  } else {
    // 正常移动：移除尾巴
    snake.value.shift();
  }

  // 额外保险：移除任何非法格子（理论上不应发生，但防止残留）
  snake.value = snake.value.filter(s => Number.isFinite(s.x) && Number.isFinite(s.y) && s.x >= 0 && s.x < cols && s.y >= 0 && s.y < rows);
}


function onGameOver() {
  gameOver.value = true; paused.value = true;
  const key = wrapMode.value ? 'wrap_true' : 'wrap_false';
  if (score.value > (bests[key] ?? 0)) { bests[key] = score.value; saveBests(); }
}
let dpr = 1; // 全局 devicePixelRatio

function resizeCanvas() {
  const canvas = canvasRef.value;
  const wrap = canvasWrap.value;
  if (!canvas || !wrap) return;

  // 取真实可用空间：减去 wrap 的 padding
  const wrapStyle = getComputedStyle(wrap);
  const padLeft = parseFloat(wrapStyle.paddingLeft || '0');
  const padRight = parseFloat(wrapStyle.paddingRight || '0');
  const padTop = parseFloat(wrapStyle.paddingTop || '0');
  const padBottom = parseFloat(wrapStyle.paddingBottom || '0');

  const topBarHeight = (document.querySelector('.topbar') as HTMLElement)?.offsetHeight || 84;
  const maxH = Math.max(240, window.innerHeight - topBarHeight - 120);

  const availableW = Math.max(100, wrap.clientWidth - padLeft - padRight);
  const availableH = Math.max(100, maxH - padTop - padBottom);

  // 取最小边长作为画布 CSS 尺寸（像素），并向下取整
  const cssSize = Math.floor(Math.min(availableW, availableH));

  // 强制按照 cols 等分：cellPx = cssSize / cols（浮点）
  cellPx = Math.max(6, cssSize / cols);

  // 但为了避免小数累积导致最后一列空白，我们把 canvas CSS 尺寸设置为 cols * cellPx（可能是 float，但会被 CSS 接受）
  const canvasCssSize = Math.floor(cols * cellPx); // 向下取整为整数 CSS px

  // device pixel ratio 处理：canvas.width/height 使用整数 device px
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.style.width = `${canvasCssSize}px`;
  canvas.style.height = `${canvasCssSize}px`;
  canvas.width = Math.round(canvasCssSize * dpr);
  canvas.height = Math.round(canvasCssSize * dpr);

  // 设置 transform 到 dpr，使后面以 CSS px 为单位绘制
  ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw() {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;

  // 以 device-pixel 空间先清空整张画布，彻底清除残留
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // 确保 transform 是 dpr（后续以 CSS px 单位绘制）
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = canvas.clientWidth; // CSS px
  const h = canvas.clientHeight;

  // 背景
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#fff6f7');
  g.addColorStop(0.5, '#ffeef0');
  g.addColorStop(1, '#ffe6e8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 计算大食物闪烁 alpha（保留原逻辑）
  let flashAlpha = 1;
  if (foodIsBig && bigExpiresAt > 0) {
    const remaining = bigExpiresAt - Date.now();
    if (remaining <= BIG_FLASH_THRESHOLD) {
      flashAlpha = 0.5 + 0.5 * Math.abs(Math.sin((Date.now() % (FLASH_FREQ * 8)) / FLASH_FREQ));
      flashAlpha = Math.max(0.45, Math.min(1, flashAlpha));
    }
  }

  // 先绘制食物（合法检查）
  if (food && Number.isFinite(food.x) && Number.isFinite(food.y) && food.x >= 0 && food.x < cols && food.y >= 0 && food.y < rows) {
    drawFoodImage(food.x, food.y, foodIsBig, flashAlpha);
  }

  // 绘制蛇（只绘制合法格子）并把坐标按像素对齐
  for (let i = 0; i < snake.value.length; i++) {
    const cell = snake.value[i];
    if (!Number.isFinite(cell.x) || !Number.isFinite(cell.y)) continue;
    if (cell.x < 0 || cell.x >= cols || cell.y < 0 || cell.y >= rows) continue;
    const isHead = i === snake.value.length - 1;
    drawSnakeCell(cell.x, cell.y, isHead);
  }

  // 边框：用整数像素宽度，防止一侧被抗锯齿"挤出"一像素
  ctx.strokeStyle = 'rgba(158,24,32,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0.5, 0.5, Math.round(w) - 1, Math.round(h) - 1);
}


// --------- 替换 drawSnakeCell() ----------
function drawSnakeCell(x: number, y: number, isHead = false) {
  if (!ctx) return;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  if (x < 0 || x >= cols || y < 0 || y >= rows) return;

  // 像素对齐
  const px = Math.round(x * cellPx);
  const py = Math.round(y * cellPx);
  const size = Math.max(1, Math.round(cellPx));
  const radius = Math.max(2, Math.round(size * 0.18));

  // 如果不是头部，绘制身体方块（保留现有渐变）
  if (!isHead) {
    const grad = ctx.createLinearGradient(px, py, px + size, py + size);
    grad.addColorStop(0, '#ffccd2');
    grad.addColorStop(0.6, '#ff7b90');
    grad.addColorStop(1, '#9e1820');
    ctx.fillStyle = grad;
    roundRect(ctx, px + 0.5, py + 0.5, size - 1, size - 1, radius);
    ctx.fill();
    return;
  }

  // === 头部绘制：只显示头像（无底色方块） ===
  if (imgHead.complete && imgHead.naturalWidth > 0) {
    // 头像大小与摆放
    const pad = Math.max(2, Math.round(size * 0.06)); // 内边距更小，头像充满格子
    const imgSize = Math.max(4, size - pad);

    const cx = px + Math.round(size / 2);
    const cy = py + Math.round(size / 2);
    const angle = dir === 'up' ? -Math.PI / 2 : dir === 'down' ? Math.PI / 2 : dir === 'left' ? Math.PI : 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 圆形裁剪（也可改成正方形裁剪）
    ctx.beginPath();
    ctx.arc(0, 0, Math.round(imgSize / 2), 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // drawImage 以像素整数放置，避免锯齿
    ctx.drawImage(imgHead, -Math.round(imgSize / 2), -Math.round(imgSize / 2), imgSize, imgSize);
    ctx.restore();

    // 可选：绘制微弱边框增强头像与背景分离（如不需要可注释掉）
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = Math.max(1, Math.round(size * 0.04));
    roundRectStroke(ctx, px + 1, py + 1, size - 2, size - 2, radius);
  } else {
    // 头像未加载时的回退：画一个圆形占位（无方块背景）
    const cx = px + Math.round(size / 2);
    const cy = py + Math.round(size / 2);
    const r = Math.max(4, Math.round(size * 0.36));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd0d6';
    ctx.fill();
  }
}

// --------- 替换 drawFoodImage() ----------
function drawFoodImage(x: number, y: number, big = false, alpha = 1) {
  if (!ctx) return;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  if (x < 0 || x >= cols || y < 0 || y >= rows) return;

  const px = Math.round(x * cellPx);
  const py = Math.round(y * cellPx);
  const cx = px + Math.round(cellPx / 2);
  const cy = py + Math.round(cellPx / 2);
  const size = Math.max(6, Math.round(cellPx * (big ? 1.85 : 1.6)));

  const img = big ? (bigVariant === 1 ? imgBig1 : imgBig2) : imgSmall;
  if (img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, cx - Math.round(size / 2), cy - Math.round(size / 2), size, size);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(cx, cy);
    const r = Math.round(size / 2);
    ctx.fillStyle = big ? '#ff9aa6' : '#ffd0d6';
    ctx.beginPath();
    ctx.ellipse(-Math.round(r * 0.2), 0, Math.round(r * 0.6), Math.round(r * 0.9), 0, 0, Math.PI * 2);
    ctx.ellipse(Math.round(r * 0.2), 0, Math.round(r * 0.6), Math.round(r * 0.9), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* helper */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function roundRectStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  roundRect(ctx, x, y, w, h, r); ctx.stroke();
}

/* ---------- 主循环 ---------- */
function gameLoop(now: number) {
  rafId = requestAnimationFrame(gameLoop);
  if (!ctx) return;
  const speed = currentSpeed.value;

  const secPerCell = 1 / speed;
  const delta = (now - lastTime) / 1000;
  lastTime = now;
  acc += delta;
  if (paused.value || gameOver.value) { draw(); return; }

  // 如果大食物已过期（双重保证）
  if (foodIsBig && bigExpiresAt > 0 && Date.now() > bigExpiresAt) { food = null; foodIsBig = false; bigExpiresAt = 0; placeFood(); }

  while (acc >= secPerCell) { stepGame(); acc -= secPerCell; }
  draw();
}

/* ---------- 输入 ---------- */
function handleKey(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' || e.key === 'w') setNextDir('up');
  if (e.key === 'ArrowDown' || e.key === 's') setNextDir('down');
  if (e.key === 'ArrowLeft' || e.key === 'a') setNextDir('left');
  if (e.key === 'ArrowRight' || e.key === 'd') setNextDir('right');
  if (e.key === ' ' || e.key === 'Spacebar') togglePause();
}
function setNextDir(d: Dir) { if (isOpposite(d, dir)) return; nextDir = d; }

/* 触摸滑动 */
let touchStartX = 0, touchStartY = 0;
function onTouchStart(e: TouchEvent) { if (!e.touches || !e.touches[0]) return; touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }
function onTouchEnd(e: TouchEvent) {
  if (!e.changedTouches || !e.changedTouches[0]) return;
  const dx = e.changedTouches[0].clientX - touchStartX, dy = e.changedTouches[0].clientY - touchStartY;
  const absX = Math.abs(dx), absY = Math.abs(dy), threshold = 20;
  if (Math.max(absX, absY) < threshold) return;
  if (absX > absY) { if (dx > 0) setNextDir('right'); else setNextDir('left'); } else { if (dy > 0) setNextDir('down'); else setNextDir('up'); }
}


/* 控制 */
function togglePause() { if (gameOver.value) return; paused.value = !paused.value; }
function resetGame() { paused.value = false; gameOver.value = false; resetState(); }

/* 生命周期 */
onMounted(() => {
  loadBests(); resetState();
  nextTick(() => {
    resizeCanvas();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('resize', resizeCanvas);
    const c = canvasRef.value;
    if (c) {
      c.addEventListener('touchstart', onTouchStart, { passive: true });
      c.addEventListener('touchend', onTouchEnd, { passive: true });
      c.addEventListener('click', () => c.focus());
    }
    lastTime = performance.now();
    rafId = requestAnimationFrame(gameLoop);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey);
  window.removeEventListener('resize', resizeCanvas);
  const c = canvasRef.value;
  if (c) { c.removeEventListener('touchstart', onTouchStart); c.removeEventListener('touchend', onTouchEnd); }
  cancelAnimationFrame(rafId);
});
</script>

<style scoped lang="scss">
$red-deep: #9e1820;
$red-mid: #d94e60;
$red-soft: #ffd7db;
$muted: #7b5b5f;

.tsubaki-snake {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fff6f7 0%, #fff1f3 60%, #fff0f2 100%);
  color: #2b1516;
  font-family: "Noto Sans SC", "PingFang SC", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  -webkit-font-smoothing: antialiased;
  padding-top: 80px;

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px clamp(12px, 3vw, 28px);
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;

    .title {
      display: flex;
      gap: 12px;
      align-items: center;

      .logo {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: radial-gradient(circle at 30% 30%, rgba(255, 240, 243, 0.9), rgba(255, 220, 226, 0.9)), linear-gradient(135deg, $red-soft 0%, $red-mid 60%, $red-deep 100%);
        box-shadow: 0 8px 28px rgba($red-deep, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.6);
      }

      h1 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 900;
        background: linear-gradient(90deg, #fff0f2 0%, #ff6a7a 45%, #7a1116 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }

      .tagline {
        margin: 0;
        font-size: 0.82rem;
        color: $muted;
      }
    }

    .controls {
      display: flex;
      gap: 10px;
      align-items: center;

      .wrap-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        color: $muted;

        input {
          width: 16px;
          height: 16px;
        }

        &.disabled {
          opacity: 0.64;
          cursor: not-allowed;
          /* 禁用时让整个 label 不可点击（input 本身已 disabled，但这样更直观） */
          pointer-events: none;
        }

        input[disabled] {
          /* 保证禁用时依旧看起来是禁用的（浏览器差异） */
          cursor: not-allowed;
          filter: grayscale(0.06) brightness(0.98);
        }
      }

      .btn {
        padding: 8px 12px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        font-weight: 700;
        background: linear-gradient(135deg, $red-mid 0%, $red-deep 100%);
        color: #fff;
        box-shadow: 0 10px 30px rgba($red-deep, 0.12);
      }

      .btn.ghost {
        background: transparent;
        color: $red-deep;
        border: 1px solid rgba($red-deep, 0.08);
        box-shadow: none;
      }
    }
  }

  .game-area {
    max-width: 1100px;
    margin: 10px auto;
    width: 100%;
    display: grid;
    grid-template-columns: 220px 1fr 260px;
    gap: 18px;
    padding: 12px;

    .left-panel,
    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .canvas-wrap {
      position: relative;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 246, 247, 0.94));
      border-radius: 14px;
      border: 1px solid rgba(158, 24, 32, 0.06);
      box-shadow: 0 18px 50px rgba(158, 24, 32, 0.05);
      padding: 14px;
      min-height: 56vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    canvas {
      background: transparent;
      border-radius: 8px;
      touch-action: none;
      display: block;
      max-width: 100%;
      max-height: 100%;
    }



    .score-panel {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 246, 247, 0.96));
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 8px 26px rgba(158, 24, 32, 0.04);

      .score,
      .best {
        font-weight: 700;
        color: $red-deep;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
      }

      .num {
        font-size: 1.4rem;
        color: $red-mid;
      }

      .info-small {
        color: $muted;
        margin-top: 6px;
        font-size: 0.92rem;
      }
    }

    .panel.card {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 246, 247, 0.96));
      padding: 12px;
      border-radius: 12px;
      border: 1px solid rgba(158, 24, 32, 0.04);
      box-shadow: 0 10px 34px rgba(158, 24, 32, 0.03);

      h3 {
        margin: 0 0 8px 0;
        color: $red-deep;
      }

      p,
      li {
        color: $muted;
        font-size: 0.92rem;
      }

      ol,
      ul {
        margin: 6px 0 0 18px;
        padding: 0;
      }
    }

    /* 排行弹窗与按钮样式 */
    /* 红椿风格：排行榜面板 & 按钮 */
    /* 红椿风格：排行榜面板 & 按钮（写死颜色）*/
    .ranking-panel {
      position: relative;
      padding: 14px;
      border-radius: 14px;
      overflow: hidden;
      /* 背景：淡红到白的柔和渐变 */
      background: linear-gradient(180deg, rgba(#ffd7db, 0.95), rgba(255, 248, 249, 0.94));
      border: 1px solid rgba(#9e1820, 0.12);
      box-shadow: 0 12px 36px rgba(#9e1820, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);

      /* 右上花瓣装饰（装饰性、无交互） */
      &::before {
        content: "";
        position: absolute;
        right: -28px;
        top: -18px;
        width: 140px;
        height: 140px;
        pointer-events: none;
        background:
          radial-gradient(circle at 30% 28%, rgba(#d94e60, 0.12), transparent 18%),
          radial-gradient(circle at 70% 72%, rgba(#9e1820, 0.06), transparent 35%);
        transform: rotate(14deg);
        filter: blur(6px);
        opacity: 0.95;
      }

      h3 {
        margin: 0 0 10px 0;
        color: #9e1820;
        font-weight: 900;
        letter-spacing: 0.3px;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ranking-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }

      .nick-wrap {
        flex: 1 1 200px;
        min-width: 140px;
        max-width: 360px;
      }

      .nick-input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(158, 24, 32, 0.08);
        background: linear-gradient(180deg, #fff, #fff8f9);
        box-shadow: inset 0 -4px 10px rgba(217, 78, 96, 0.03);
        font-size: 0.94rem;
        color: #3b2b2f;
        outline: none;
        transition: box-shadow 160ms ease, transform 120ms;

        &::placeholder {
          color: #bba0a6;
        }

        &:focus {
          box-shadow: 0 8px 30px rgba(217, 78, 96, 0.10);
          transform: translateY(-2px);
        }
      }

      /* 按钮：胶囊形，主按钮为暖红渐变，ghost 为玻璃感边框 */
      .btn.small {
        padding: 7px 12px;
        border-radius: 999px;
        font-size: 0.92rem;
        font-weight: 800;
        letter-spacing: 0.4px;
        cursor: pointer;
        transition: transform 180ms cubic-bezier(.2, .9, .2, 1), box-shadow 200ms ease, background 200ms ease;
        user-select: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;

        /* 主按钮（上传等）*/
        &:not(.ghost) {
          color: #ffffff;
          background: linear-gradient(90deg, #d94e60 0%, #9e1820 100%);
          box-shadow: 0 10px 30px rgba(#9e1820, 0.12), 0 0 28px rgba(#d94e60, 0.04);
        }

        /* ghost 风格（次要操作）*/
        &.ghost {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 250, 250, 0.6));
          border: 1px solid rgba(#9e1820, 0.12);
          color: #9e1820;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        &:hover {
          transform: translateY(-4px);

          &:not(.ghost) {
            box-shadow: 0 18px 46px rgba(#9e1820, 0.18), 0 0 30px rgba(#d94e60, 0.06);
          }

          &.ghost {
            background: linear-gradient(90deg, rgba(#d94e60, 0.06), rgba(#9e1820, 0.04));
          }
        }

        &:active {
          transform: translateY(-1px) scale(0.997);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 6px rgba(#d94e60, 0.12);
        }
      }

      /* 提示文字（颜色偏暖）*/
      .muted {
        color: #b86a74;
        /* 人物风格的暖灰/淡红色 */
        font-size: 0.9rem;
      }

    }

    /* 弹窗覆盖层 */
    /* 红椿风格：排行榜弹窗（写死颜色、嵌套） */
    .ranking-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(8, 10, 12, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 6000;
      padding: 20px;

      .ranking-modal {
        width: min(720px, 94vw);
        max-height: 86vh;
        overflow-x: auto;
        padding: 18px;
        border-radius: 14px;
        position: relative;

        /* 背景与边框：柔和的红白渐变 + 细腻边框与阴影 */
        background: linear-gradient(180deg, #fff6f7 0%, #fff1f3 48%, #fff0f2 100%);
        border: 1px solid rgba(158, 24, 32, 0.06);
        box-shadow: 0 18px 46px rgba(158, 24, 32, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6);



        /* 标题区 */
        .rm-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 12px;

          h3 {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 900;
            /* 渐变文字（椿的主色调）*/
            background: linear-gradient(90deg, #fff0f2 0%, #ff6a7a 45%, #7a1116 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            -webkit-text-fill-color: transparent;
          }

          .rm-actions {
            display: flex;
            gap: 8px;
          }
        }

        .rm-body {
          /* 榜单容器内侧背景（轻微纸纹感）*/
          padding: 6px 2px 10px 2px;

          .ranking-list {
            list-style: none;
            padding: 0;
            margin: 8px 0 0;

            li {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 8px;
              border-radius: 10px;
              transition: background 180ms ease, transform 160ms ease, box-shadow 160ms ease;
              /* 微微分隔线替代，确保在深/浅主题时都好看 */
              background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 249, 0.98));
              border: 1px solid rgba(220, 212, 214, 0.6);
              margin-bottom: 8px;

              &:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 28px rgba(158, 24, 32, 0.06);
                background: linear-gradient(180deg, rgba(255, 241, 244, 0.98), rgba(255, 247, 248, 0.98));
              }

              &:focus-within,
              &:focus {
                outline: none;
                box-shadow: 0 0 0 4px rgba(217, 78, 96, 0.08);
              }

              .rank {
                width: 44px;
                height: 44px;
                display: inline-grid;
                place-items: center;
                font-weight: 900;
                border-radius: 10px;
                font-size: 0.95rem;
                color: #fff;
                /* 默认徽章为柔和粉红 */
                background: linear-gradient(135deg, #ffd7db 0%, #ff99a9 100%);
                box-shadow: 0 6px 18px rgba(158, 24, 32, 0.06);
              }

              .nick {
                flex: 1;
                font-weight: 800;
                color: #3b2b2f;
              }

              .score {
                width: 90px;
                text-align: right;
                font-weight: 900;
                color: #9e1820;
                font-size: 0.98rem;
              }
            }

            /* li end */

            /* 前三名更强的视觉强调 */
            li:nth-child(1) .rank {
              background: linear-gradient(135deg, #ff9aa6 0%, #d94e60 60%, #9e1820 100%);
              box-shadow: 0 8px 30px rgba(217, 78, 96, 0.14);
            }

            li:nth-child(2) .rank {
              background: linear-gradient(135deg, #ffd4d8 0%, #ff8b9a 60%, #d14b57 100%);
              box-shadow: 0 6px 22px rgba(209, 75, 87, 0.10);
            }

            li:nth-child(3) .rank {
              background: linear-gradient(135deg, #ffe6e8 0%, #ffb3bd 60%, #d67a84 100%);
              box-shadow: 0 5px 18px rgba(214, 122, 132, 0.08);
            }
          }

          /* ranking-list end */

          /* 空状态 / 加载文字 */
          .muted {
            color: #b86a74;
            font-size: 0.95rem;
            padding: 12px 6px;
          }
        }

      }




    }

  }



  /* 移动端适配：单列，canvas 占满可用高度 */
  @media (max-width: 980px) {
    .game-area {
      grid-template-columns: 1fr;
      padding: 8px;

      .canvas-wrap {
        min-height: calc(62vh);
        order: 1;
        padding: 10px;
      }

      .left-panel {
        order: 2;
      }

      .right-panel {
        order: 3;

      }
    }

    .topbar {
      padding: 12px;

      .title .logo {
        width: 44px;
        height: 44px;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
}
</style>
