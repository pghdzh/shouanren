<template>
    <section class="voice-gallery" aria-label="珂莱塔 · 语音馆">
        <!-- 背景轮播层（单组：PC 用 randomFive，移动端用 randomFive2） -->
        <div class="bg-carousel" aria-hidden="true">
            <transition-group name="bg-fade" tag="div" class="bg-layer">
                <!-- activeImages 返回当前设备应使用的图片组 -->
                <img v-for="(src, idx) in activeImages" :key="`bg-${idx}-${isMobile ? 'm' : 'd'}`" :src="src"
                    :class="['bg-img', { active: idx === currentIndex }]" alt="" />

            </transition-group>

        </div>

        <div class="vg__wrap">
            <!-- header（只保留 logo + 标题/副标题） -->
            <header class="vg__header">
                <div class="logo">
                    <div class="ribbon" aria-hidden="true">🎀</div>
                    <div class="title-group">
                        <h1 class="title">珂莱塔 · 语音馆</h1>
                        <p class="subtitle">收集并播放已触发的珂莱塔语音彩蛋。未解锁项会显示为锁定状态。</p>
                    </div>
                </div>
            </header>

            <!-- 列表（已解锁放前，未解锁放后） -->
            <ul class="vg__list" role="list">
                <li v-for="id in allVoiceIds" :key="id" class="vg__item"
                    :class="{ unlocked: isUnlocked(id), locked: !isUnlocked(id), playing: id === currentId }">
                    <div class="item__left">
                        <div class="index">{{ String(id).padStart(3, '0') }}</div>
                        <div class="info">
                            <div class="name">语音 {{ String(id).padStart(3, '0') }}</div>
                            <div class="note" v-if="isUnlocked(id)">已解锁</div>
                            <div class="note note--locked" v-else>未解锁</div>
                        </div>
                    </div>

                    <div class="item__right">
                        <button class="btn btn--icon" :disabled="!isUnlocked(id)" @click="playEntry(id)"
                            :title="isUnlocked(id) ? (currentId === id && isPlaying ? '暂停' : '播放') : '尚未解锁'">
                            <span v-if="!isUnlocked(id)">🔒</span>
                            <span v-else-if="currentId === id && isPlaying">❚❚</span>
                            <span v-else>▶</span>
                        </button>

                        <a v-if="isUnlocked(id)" :href="voicePath(id)" :download="`audio_${id}.mp3`" title="下载">
                            <el-button type="primary" :icon="Download" circle />
                        </a>
                        <span v-else class="btn btn--hint" aria-hidden="true">—</span>
                    </div>
                </li>
            </ul>


        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import {
    Download
} from '@element-plus/icons-vue'
/* ================== 配置 ================== */
const TOTAL_VOICES = 34; // 语音总数，按实际替换
const BG_INTERVAL_MS = 4500; // 背景切换间隔（毫秒）
const MOBILE_BREAKPOINT = 720; // 小于这个宽度视为移动端
/* ========================================= */

/* ========== 导入图片资源（Vite：eager） ========== */
/* 横图（用于 PC） */
const modules: Record<string, any> = import.meta.glob('@/assets/images1/*.{jpg,png,jpeg,webp}', { eager: true });
const allSrcs: string[] = Object.values(modules).map((m: any) => m.default || m);

/* 竖图（用于移动端） */
const modules2: Record<string, any> = import.meta.glob('@/assets/images2/*.{jpg,png,jpeg,webp}', { eager: true });
const allSrcs2: string[] = Object.values(modules2).map((m: any) => m.default || m);

/* 简单洗牌函数 */
function shuffle<T>(arr: T[]) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* 随机取 5 张（若不足 5 张则全部） */
const randomFive = ref<string[]>(shuffle(allSrcs).slice(0, Math.min(5, allSrcs.length)));
const randomFive2 = ref<string[]>(shuffle(allSrcs2).slice(0, Math.min(5, allSrcs2.length)));

/* 轮播索引（共享，但 index 会根据 activeImages 长度做取模） */
const currentIndex = ref(0);
let imgTimer: number | null = null;

/* ========== 设备判断（响应式） ========== */
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);
function handleResize() {
    const nowMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (nowMobile !== isMobile.value) {
        isMobile.value = nowMobile;
        // 切换图片组时重置索引以避免越界
        currentIndex.value = 0;
    }
}

/* activeImages 根据 isMobile 返回对应数组 */
const activeImages = computed(() => (isMobile.value ? randomFive2.value : randomFive.value));
/* ========== 语音列表与播放逻辑 ========== */

/* 已解锁集合（由 localStorage.triggeredVoices 提供，数组） */
const unlockedSet = ref<Set<number>>(new Set<number>());

function loadUnlocked() {
    try {
        const raw = localStorage.getItem('triggeredVoices') || '[]';
        const arr = JSON.parse(raw);
        const s = new Set<number>();
        if (Array.isArray(arr)) {
            arr.forEach((v: any) => {
                const n = Number(v);
                if (!Number.isNaN(n)) s.add(n);
            });
        }
        unlockedSet.value = s;
    } catch (e) {
        console.warn('读取 triggeredVoices 失败', e);
        unlockedSet.value = new Set<number>();
    }
}

/* 生成所有 id，并保持已解锁在前、未解锁在后 */
const allIds = Array.from({ length: TOTAL_VOICES }, (_, i) => i + 1);
const allVoiceIds = computed(() => {
    const unlocked = Array.from(unlockedSet.value).filter(n => allIds.includes(n)).sort((a, b) => a - b);
    const locked = allIds.filter(id => !unlockedSet.value.has(id));
    return [...unlocked, ...locked];
});

/* audio 单例 */
let currentAudio: HTMLAudioElement | null = null;
const currentId = ref<number | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const currentDuration = ref(0);

function createAudio(src?: string) {
    destroyAudio();
    currentAudio = new Audio();
    currentAudio.preload = 'auto';
    if (src) currentAudio.src = src;
    currentAudio.addEventListener('timeupdate', onTimeUpdate);
    currentAudio.addEventListener('loadedmetadata', onLoadedMeta);
    currentAudio.addEventListener('ended', onEnded);
    currentAudio.addEventListener('error', onAudioError);
}
function destroyAudio() {
    if (!currentAudio) return;
    try {
        currentAudio.pause();
        currentAudio.removeEventListener('timeupdate', onTimeUpdate);
        currentAudio.removeEventListener('loadedmetadata', onLoadedMeta);
        currentAudio.removeEventListener('ended', onEnded);
        currentAudio.removeEventListener('error', onAudioError);
        currentAudio.src = '';
    } catch (e) { }
    currentAudio = null;
}
function onTimeUpdate() { if (currentAudio) currentTime.value = currentAudio.currentTime || 0; }
function onLoadedMeta() { if (currentAudio) currentDuration.value = currentAudio.duration || 0; }
function onEnded() { isPlaying.value = false; /* 不自动下一条 */ }
function onAudioError(e?: any) { console.error('audio error', e); isPlaying.value = false; }

function voicePath(id: number) {
    return `/gameAudio/audio (${id}).mp3`;
}
function isUnlocked(id: number) {
    return unlockedSet.value.has(id);
}

async function playEntry(id: number) {
    if (!isUnlocked(id)) return;
    // 同一条 -> 切换暂停/恢复
    if (currentId.value === id && isPlaying.value) {
        currentAudio?.pause();
        isPlaying.value = false;
        return;
    }
    if (currentId.value === id && !isPlaying.value && currentAudio) {
        try { await currentAudio.play(); isPlaying.value = true; } catch (e) { console.warn(e); }
        return;
    }

    // 新条目
    currentId.value = id;
    createAudio(voicePath(id));
    try {
        await currentAudio!.play();
        isPlaying.value = true;
    } catch (e) {
        console.warn('播放被阻止或失败', e);
        isPlaying.value = false;
    }
}

/* ========== 背景轮播控制 ========== */
function startBgTimer() {
    stopBgTimer();
    imgTimer = window.setInterval(() => {
        const len = Math.max(1, activeImages.value.length);
        // 保证在当前 activeImages 长度范围内循环
        currentIndex.value = (currentIndex.value + 1) % len;
    }, BG_INTERVAL_MS);
}
function stopBgTimer() {
    if (imgTimer !== null) {
        clearInterval(imgTimer);
        imgTimer = null;
    }
}

/* 监听 storage 事件（跨 tab 更新） */
function onStorage(e: StorageEvent) {
    if (e.key === 'triggeredVoices') loadUnlocked();
}

/* 生命周期 */
onMounted(() => {
    loadUnlocked();
    window.addEventListener('storage', onStorage);
    window.addEventListener('resize', handleResize);

    // 如果数组为空（没有图片），也避免报错：确保至少有一个占位空数组
    if (!randomFive.value.length && allSrcs.length) randomFive.value = shuffle(allSrcs).slice(0, Math.min(5, allSrcs.length));
    if (!randomFive2.value.length && allSrcs2.length) randomFive2.value = shuffle(allSrcs2).slice(0, Math.min(5, allSrcs2.length));

    // 启动轮播
    startBgTimer();
});

onBeforeUnmount(() => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('resize', handleResize);
    stopBgTimer();
    destroyAudio();
});

/* 监听 activeImages 长度变化（切换设备时重置 index 并保持循环） */
watch(activeImages, (nv) => {
    currentIndex.value = 0;
});
</script>

<style lang="scss" scoped>
/* 全局基调：珂莱塔蓝粉＋欧泊感，颜色写死 */
$ice-blue: #bff7ff;
$neon-pink: #ff66c4;

.voice-gallery {
    position: relative;
    min-height: 560px;
    font-family: "PingFang SC", "Noto Sans SC", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    color: #e6eef2;
    overflow: hidden;
    padding: 28px;
    padding-top: 80px;

    /* 背景轮播层，绝对定位在最底层 */
    .bg-carousel {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        .bg-layer {
            position: absolute;
            inset: 0;
            overflow: hidden;

            .bg-img {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block; // <--- 确保是可见元素
                opacity: 0;
                transform: scale(1.02);
                transition: opacity 900ms ease, transform 900ms ease;
                pointer-events: none;
            }

            .bg-img.active {
                opacity: 1;
                transform: scale(1);
            }
        }



    }

    /* 前景包裹器 */
    .vg__wrap {
        position: relative;
        z-index: 2;
        max-width: 980px;
        margin: 0 auto;
        border-radius: 14px;
        padding: 18px;
        box-shadow: 0 12px 48px rgba(2, 6, 12, 0.6);
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.3));
        border: 1px solid rgba(255, 255, 255, 0.04);

    }

    .vg__header {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 18px;

        .logo {
            display: flex;
            gap: 12px;
            align-items: center;

            .ribbon {
                width: 56px;
                height: 56px;
                border-radius: 12px;
                display: grid;
                place-items: center;
                font-size: 22px;
                background: linear-gradient(135deg, #ff66c4, #b84f9a);
                box-shadow: 0 8px 30px rgba(184, 79, 154, 0.22);
            }

            .title-group {
                .title {
                    margin: 0;
                    font-size: 1.35rem;
                    background: linear-gradient(180deg, $ice-blue, $neon-pink);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 10px 40px rgba($ice-blue, 0.06);
                    font-weight: 800;
                    letter-spacing: 0.6px;
                }

                .subtitle {
                    margin: 4px 0 0;
                    color: #c2d6db;
                    font-size: 0.95rem;
                }
            }
        }
    }

    /* 列表 */
    .vg__list {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 0;
        list-style: none;

        /* 关键：最大高度（可按需调整 calc 的数值） */
        max-height: calc(100vh - 200px);
        /* 260px 为 header + footer + 余白，可根据实际微调 */
        overflow-y: auto;
        padding-right: 8px;
        /* 给滚动条留空间，避免遮挡内容 */
        -webkit-overflow-scrolling: touch;
        /* iOS 平滑滚动 */

        /* 可选：桌面端显示更细的滚动条（美观） */
        &::-webkit-scrollbar {
            width: 10px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }
    }

    .vg__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
        border: 1px solid rgba(255, 255, 255, 0.03);
        transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;

        &.playing {
            transform: translateY(-4px);
            box-shadow: 0 16px 40px rgba(8, 16, 28, 0.45);
            border-color: rgba(255, 255, 255, 0.06);
        }

        &.locked {
            opacity: 0.52;
            filter: grayscale(8%);

            .note--locked {
                color: #7f8b90;
                font-style: italic;
            }
        }

        .item__left {
            display: flex;
            gap: 12px;
            align-items: center;

            .index {
                min-width: 60px;
                height: 60px;
                border-radius: 12px;
                display: grid;
                place-items: center;
                background: linear-gradient(180deg, #bff7ff, #9fdcff);
                color: #081018;
                font-weight: 900;
                box-shadow: 0 8px 24px rgba(11, 22, 32, 0.18);
            }

            .info {
                .name {
                    color: #ffffff;
                    font-weight: 700;
                }

                .note {
                    color: #9aa6ad;
                    font-size: 0.92rem;
                    margin-top: 4px;
                }

                .note--locked {
                    color: #7f8b90;
                    font-style: italic;
                }
            }
        }

        .item__right {
            display: flex;
            gap: 10px;
            align-items: center;

            .btn {
                &--icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 12px;
                    border: none;
                    display: inline-grid;
                    place-items: center;
                    background: linear-gradient(180deg, #ffe6a8, #ffd580);
                    color: #1a0f03;
                    font-weight: 700;
                    cursor: pointer;
                }



                &--hint {
                    color: #7f8b90;
                }
            }
        }
    }



    /* 背景淡入淡出过渡，使用 transition-group 名称 bg-fade */
    .bg-fade-enter-active,
    .bg-fade-leave-active {
        transition: opacity 900ms ease, transform 900ms ease;
    }

    .bg-fade-enter-from,
    .bg-fade-leave-to {
        opacity: 0;
        transform: scale(1.05);
    }

    .bg-fade-enter-to,
    .bg-fade-leave-from {
        opacity: 1;
        transform: scale(1);
    }

    /* mobile */
    @media (max-width: 720px) {
        padding: 12px;
        padding-top: 80px;

        .vg__wrap {
            padding: 14px;
        }

        .vg__item {
            padding: 10px;
        }

        .vg__header {
            gap: 8px;
        }

        .index {
            min-width: 48px;
            height: 48px;
            font-size: 0.95rem;
        }
    }
}
</style>
