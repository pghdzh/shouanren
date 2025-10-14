<template>
    <main class="home">
        <canvas ref="canvasEl" class="rose-canvas" aria-hidden="true"></canvas>

        <!-- 背景轮播（两组用于桌面/移动不同裁切） -->
        <div class="carousel carousel1" aria-hidden="true">
            <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" />
        </div>
        <div class="carousel carousel2" aria-hidden="true">
            <img v-for="(src, idx) in randomFive2" :key="idx" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" />
        </div>

        <section class="center" role="main">
            <h1 class="title">独属于我的蒙娜丽莎 · 守岸人</h1>

            <div class="subtitle" aria-live="polite">
                <span class="typed">{{ typed }}</span><span class="cursor" aria-hidden="true">▍</span>
            </div>

        </section>

        <footer class="shore-footer-simple" role="contentinfo" aria-label="页面页脚">
            <div class="inner container">


                <div class="center">
                    <div class="slogan">回声为灯 · 潮汐为路</div>
                    <div class="meta">© <span>{{ year }}</span> 守岸人电子设定集 · 制作：霜落天亦</div>
                </div>


            </div>


        </footer>

    </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import violet from '@/assets/violet.png' // 若希望更贴合风格，可替换为“贝壳/羽毛/萤光点”贴图
const year = new Date().getFullYear()
const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D
let animationId = 0
let lastTime = 0
let elapsed = 0

interface Rose {
    baseX: number
    y: number
    size: number
    speed: number
    swayAmp: number
    swayFreq: number
    phase: number
    angle: number
    angularSpeed: number
}

const roses: Rose[] = []
const ROSE_COUNT_DESKTOP = 18
const ROSE_COUNT_MOBILE = 6
const ROSE_IMG = new Image()
ROSE_IMG.src = violet

function initRoses(count: number) {
    roses.length = 0
    const canvas = canvasEl.value!
    const w = canvas.width / (window.devicePixelRatio || 1)
    const h = canvas.height / (window.devicePixelRatio || 1)

    for (let i = 0; i < count; i++) {
        const baseX = Math.random() * w
        roses.push({
            baseX,
            y: Math.random() * -h,
            size: 18 + Math.random() * 38, // 稍微精简尺寸
            speed: 12 + Math.random() * 36, // 速度更缓
            swayAmp: 12 + Math.random() * 26,
            swayFreq: 0.15 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (Math.random() - 0.5) * 1.2
        })
    }
    elapsed = 0
}

let resizeTimeout: number
function resizeCanvas() {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
        cancelAnimationFrame(animationId)
        const canvas = canvasEl.value!
        const parent = canvas.parentElement!
        const dpr = window.devicePixelRatio || 1
        const w = parent.clientWidth
        const h = Math.max(parent.clientHeight, 420) // 给个最小高度，避免太窄时粒子不明显

        canvas.style.width = w + 'px'
        canvas.style.height = h + 'px'
        canvas.width = w * dpr
        canvas.height = h * dpr

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)

        const isMobile = w < 768
        initRoses(isMobile ? ROSE_COUNT_MOBILE : ROSE_COUNT_DESKTOP)
        lastTime = 0
        animationId = requestAnimationFrame(tickCanvas)
    }, 160)
}



function tickCanvas(now: number) {
    if (!lastTime) lastTime = now
    const dt = (now - lastTime) / 1000
    lastTime = now
    elapsed += dt

    const canvas = canvasEl.value!
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    ctx.clearRect(0, 0, w, h)

    // 轻微整体雾层，增强深度（透明度低，避免影响可读性）
    ctx.fillStyle = 'rgba(2,8,14,0.08)'
    ctx.fillRect(0, 0, w, h)

    roses.forEach(r => {
        r.y += r.speed * dt
        const sway = r.swayAmp * Math.sin(r.phase + elapsed * r.swayFreq)
        const x = r.baseX + sway
        r.angle += r.angularSpeed * dt

        if (r.y > h + r.size) {
            r.y = -r.size * 0.6
            r.baseX = Math.random() * w
            r.phase = Math.random() * Math.PI * 2
        }

        if (x > w + r.size || x < -r.size) return

        // 计算透明度：越远看上去越淡
        const alpha = Math.max(0, Math.min(1, 1 - (r.y / h) * 0.6))

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(x, r.y)
        ctx.rotate(r.angle)

        if (ROSE_IMG && ROSE_IMG.complete && ROSE_IMG.naturalWidth > 0) {
            // 使用图片绘制，但加上一层冷色调叠加（globalCompositeOperation 简单处理）
            ctx.drawImage(ROSE_IMG, -r.size / 2, -r.size / 2, r.size, r.size)

            // 轻微冷光叠加，提升风格一致性
            ctx.globalCompositeOperation = 'lighter'
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r.size)
            grad.addColorStop(0, `rgba(79,233,223,${0.08 * alpha})`)
            grad.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = grad
            ctx.fillRect(-r.size / 2, -r.size / 2, r.size, r.size)
            ctx.globalCompositeOperation = 'source-over'
        }

        ctx.restore()
    })

    animationId = requestAnimationFrame(tickCanvas)
}

// ========== 打字机文案 ==========
const lines = [
    '回声为灯，潮汐为路。',
    '她在岸边，静静守候。',
    '潮息低语，替你守住话语。',
    '织纹一缝，弥补散落的诺言。',
    '回声会记住你的名字。',
    '他人的喧嚣消失后，她仍在潮光里守望。',
    '以叙响织构为笔，她把回声缀连成路。',
    '当潮退去，岸边仍留一盏不灭的光。',
    '她用静默与耐心，替迷途的人留下一条回航的径。',
    '织成细密的纹理，护住最易碎的愿望。',
    '黑海岸的夜很深，她以回声为灯，替你把未说出口的话，送回岸边。',
    '在潮汐与回响之间，她悄悄缝合那些被时间撕裂的誓言与记忆。',
    '无须誓言喧嚣，她只用潮光与织纹，慢慢把散落的诺言缝成完整的路。',
    '她不是急于救赎的英雄，而是守望者：耐心、稳重且始终如一，像岸边那盏静亮的灯。',
    '潮光会带走疲惫，回声会替你守住无声的愿望——那是她最温柔的守护方式。'
]


const typed = ref('')
let lineIndex = 0
let charIndex = 0
let deleting = false
let timer: number | null = null

const TYPING = 120
const DELETING = 40
const PAUSE = 1200

function tick() {
    const cur = lines[lineIndex]
    if (!deleting) {
        typed.value = cur.slice(0, charIndex + 1)
        charIndex++
        if (charIndex >= cur.length) {
            timer = window.setTimeout(() => { deleting = true; tick() }, PAUSE)
            return
        }
        timer = window.setTimeout(tick, TYPING)
    } else {
        typed.value = cur.slice(0, charIndex - 1)
        charIndex--
        if (charIndex <= 0) {
            deleting = false
            lineIndex = (lineIndex + 1) % lines.length
            timer = window.setTimeout(tick, 360)
            return
        }
        timer = window.setTimeout(tick, DELETING)
    }
}

// ========== 背景图片导入与轮播 ==========
const modules = import.meta.glob('@/assets/images1/*.{jpg,png,jpeg,webp}', { eager: true })
const allSrcs: string[] = Object.values(modules).map((mod: any) => mod.default)

const modules2 = import.meta.glob('@/assets/images2/*.{jpg,png,jpeg,webp}', { eager: true })
const allSrcs2: string[] = Object.values(modules2).map((mod: any) => mod.default)

function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}
const randomFive = ref<string[]>(shuffle(allSrcs).slice(0, 5))
const randomFive2 = ref<string[]>(shuffle(allSrcs2).slice(0, 5))

const currentIndex = ref(0)
let Imgtimer: number | undefined

onMounted(() => {
    timer = window.setTimeout(tick, 420)

    Imgtimer = window.setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % (Math.max(1, randomFive.value.length))
    }, 5200)

    const canvas = canvasEl.value!
    ctx = canvas.getContext('2d')!

    // 当图片加载或资源就绪后调整 canvas 大小并启动渲染
    ROSE_IMG.onload = () => {
        resizeCanvas()
    }
    // 如果图片已经加载完（缓存情况），也要触发 init
    if (ROSE_IMG.complete && ROSE_IMG.naturalWidth > 0) {
        resizeCanvas()
    }

    window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
    if (Imgtimer) clearInterval(Imgtimer)
    if (timer) window.clearTimeout(timer)

    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resizeCanvas)
})
</script>

<style lang="scss" scoped>
/* 守岸人色票：深海底色 + 冷青光 */
$bg-deep: #02131a;
$deep-2: #021e2a;
$muted: #cfeff6;
$accent: #4fe9df;
$accent-2: #66c8ff;
$glass: rgba(255, 255, 255, 0.02);

.home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(180deg, $bg-deep 0%, $deep-2 70%);
    color: $muted;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Noto Sans CJK SC', sans-serif;
    position: relative;
    overflow: hidden;

    .rose-canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
    }

    .carousel {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        &::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(2, 8, 14, 0.25), rgba(2, 8, 14, 0.45));
            pointer-events: none;
            z-index: 1;
        }

        .carousel-image {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 1s ease, transform 10s linear;
            filter: blur(0.8px) saturate(0.92);
            transform: scale(1.05);

            &.active {
                opacity: 1;
                transform: scale(1);
            }
        }
    }

    /* 可在小屏使用第二组竖图，避免裁切失衡 */
    .carousel2 {
        display: none;
    }

    .center {
        position: relative;
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 34px 20px;
        gap: 12px;
        z-index: 3;


        .title {
            z-index: 9;
            font-size: 2rem;
            margin: 0;
            font-weight: 800;
            line-height: 1;
            background: linear-gradient(90deg, $accent 0%, $accent-2 80%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 8px 28px rgba(6, 30, 40, 0.28);
        }

        .subtitle {
            font-size: 1.02rem;
            min-height: 1.6em;
            color: rgba($muted, 0.88);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            z-index: 9;

            .typed {
                display: inline-block;
                letter-spacing: 0.4px;
                font-weight: 600;
            }

            .cursor {
                display: inline-block;
                width: 12px;
                height: 1.05em;
                margin-left: 6px;

                animation: blink 1s steps(1) infinite;
                transform: translateY(2px);
                opacity: 0.95;
            }
        }
    }

    .shore-footer-simple {
        /* 背景与边线（颜色写死） */
        background: linear-gradient(180deg, rgba(2, 8, 12, 0.55), rgba(2, 10, 14, 0.75));
        border-top: 1px solid rgba(127, 191, 255, 0.04);
        color: #cfeff6;
        /* 固定文本色 */
        font-size: 13px;

        position: relative;
        overflow: visible;

        /* 容器：左右中三分（移动堆叠） */
        .inner.container {
            width: min(1100px, 94%);
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }



        /* 中间文本：口号 + 版权（两行紧凑） */
        .center {
            text-align: center;
            flex: 1 1 auto;

            .slogan {
                font-weight: 600;
                /* 渐变流光效果（写死颜色） */
                background: linear-gradient(90deg, #4fe9df 0%, #66c8ff 40%, #66c8ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: inline-block;
                position: relative;
            }

            .meta {
                color: rgba(207, 239, 246, 0.6);
                margin-top: 4px;
                font-size: 12px;
            }
        }
    }
}



@keyframes blink {
    0% {
        opacity: 1
    }

    50% {
        opacity: 0
    }

    100% {
        opacity: 1
    }
}

/* 响应式：移动优先 */
@media (max-width: 720px) {
    .home {
        .carousel1 {
            display: none;
        }

        .carousel2 {
            display: block;
        }

        .center {
            padding: 18px 14px;

            .title {
                font-size: 1.4rem;
            }

            .subtitle {
                font-size: 0.98rem;
            }
        }


    }
}
</style>
