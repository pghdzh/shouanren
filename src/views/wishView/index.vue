<template>
    <div class="shore-fortune-page" role="main">
        <header class="hero">
            <div class="badge">织愿 · 回潮</div>
            <h1 class="page-title">今日潮愿</h1>
            <p class="lead">把愿望低语给回声，让它替你远走又归来</p>
        </header>

        <section class="draw-zone" aria-labelledby="draw-btn">
            <div class="reel-wrap" aria-hidden="true">
                <div class="reel" :class="{ spinning: drawing }">
                    <div class="reel-item" v-for="(t, i) in reelPreview" :key="i">{{ t }}</div>
                </div>
                <!-- 轻微波纹装饰 -->
                <svg class="reel-wave" viewBox="0 0 200 20" aria-hidden="true">
                    <path d="M0 10 C40 0 160 20 200 10" fill="none" stroke="#46e0d9" stroke-opacity="0.06"
                        stroke-width="2" />
                </svg>
            </div>

            <button id="draw-btn" class="draw-button" :disabled="drawing || drawnToday" @click="onDraw"
                :aria-busy="drawing" :aria-disabled="drawing || drawnToday">
                <template v-if="drawnToday">已祈愿 — {{ savedResult?.type }}</template>
                <template v-else-if="drawing">潮息抽取中…</template>
                <template v-else>抽取今日潮愿</template>
            </button>

            <p class="hint" v-if="drawnToday">
                今日已许愿 — 明日潮回可再来。
            </p>
        </section>

        <section class="result-zone" aria-live="polite">
            <div class="card-stage">
                <div class="result-card" :class="{ flipped: revealed }" role="region" aria-label="祈福卡片">
                    <!-- 卡片正面 -->
                    <div class="card-face card-front" aria-hidden="true">
                        <div class="avatar-wrap">
                            <div class="avatar-sticker" aria-hidden="true">
                                <!-- 抽象回声印章 -->
                                <svg viewBox="0 0 64 64" class="avatar-svg" aria-hidden="true">
                                    <defs>
                                        <linearGradient id="shg" x1="0" x2="1">
                                            <stop offset="0" stop-color="#4fe9df" />
                                            <stop offset="1" stop-color="#66c8ff" />
                                        </linearGradient>
                                    </defs>
                                    <rect width="64" height="64" rx="12" fill="#022428" />
                                    <g fill="none" stroke="url(#shg)" stroke-width="1.6" stroke-linecap="round"
                                        opacity="0.95">
                                        <path d="M12 36c8-12 28-12 40-6" />
                                        <path d="M16 40c8-8 22-8 32-4" opacity="0.7" />
                                        <circle cx="18" cy="22" r="3.2" fill="#66c8ff" stroke="none" />
                                    </g>
                                </svg>
                            </div>
                        </div>

                        <div class="front-text">
                            <div class="level-ghost">——</div>
                            <div class="front-msg">按下「抽取」，让潮替你带去一句愿。</div>
                        </div>
                    </div>

                    <!-- 卡片背面（结果） -->
                    <div class="card-face card-back">
                        <div class="back-top">
                            <div class="level-pill" :class="savedResult?.typeClass || result?.typeClass">
                                {{ savedResult?.type || result?.type || '—' }}
                            </div>
                            <div class="summary" aria-hidden="true">{{ typed.summary || '' }}</div>
                        </div>

                        <div class="back-body">
                            <div class="row">
                                <div class="label">情感</div>
                                <div class="value" v-html="typed.love || ''"></div>
                            </div>
                            <div class="row">
                                <div class="label">事事</div>
                                <div class="value" v-html="typed.work || ''"></div>
                            </div>
                            <div class="row">
                                <div class="label">财运</div>
                                <div class="value" v-html="typed.money || ''"></div>
                            </div>
                            <div class="row">
                                <div class="label">身心</div>
                                <div class="value" v-html="typed.health || ''"></div>
                            </div>

                            <div class="extras">
                                <div class="tip">
                                    <strong>潮语：</strong>
                                    <div class="tip-content" role="region" aria-live="polite">
                                        <span class="tip-text" v-html="typed.tip || ''"></span>
                                        <button class="play-tip" v-if="(savedResult?.tipFile || result?.tipFile)"
                                            @click="playTip" :aria-label="'播放潮语'" title="播放潮语" type="button">🔊</button>
                                    </div>
                                </div>

                                <div class="lucky"><strong>吉物：</strong><span>{{ savedResult?.lucky?.item ||
                                    result?.lucky?.item
                                    || '—' }}</span></div>
                                <div class="lucky"><strong>幸运数：</strong> <span>{{ savedResult?.lucky?.number ||
                                    result?.lucky?.number || '—' }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

type TipItem = { file: string; text: string; voiceId: number }
type PoolBucket = {
    summaries: string[]
    love: string[]
    work: string[]
    money: string[]
    health: string[]
    tips: TipItem[]
}

const types = [
    { key: 'chaofu', label: '潮福', weight: 6, cls: 'chaofu' },      // 大吉
    { key: 'zhonglan', label: '中澜', weight: 14, cls: 'zhonglan' }, // 中吉
    { key: 'xiyuan', label: '细愿', weight: 20, cls: 'xiyuan' },    // 小吉
    { key: 'changan', label: '常安', weight: 30, cls: 'changan' },  // 吉
    { key: 'anlan', label: '暗澜', weight: 20, cls: 'anlan' },      // 凶
    { key: 'nichao', label: '逆潮', weight: 10, cls: 'nichao' }     // 大凶
]

function playVoice(name: string) {
    const audio = new Audio(`/voice/${name}`)
    audio.play().catch((e) => console.warn('音频播放失败：', e))
}

function playTip() {
    const file = (savedResult?.value?.tipFile) || (result?.value?.tipFile) || (result?.tipFile) || undefined
    if (!file) return
    playVoice(file)
}

const pool: Record<string, PoolBucket> = {
    chaofu: {
        summaries: ['潮光盈满，愿望近成。', '今日多喜，潮为你回馈。'],
        love: ['情感温柔，适合互诉心意。', '可能迎来温暖的相遇。'],
        work: ['计划顺利，利于启动新事。', '合作与创意皆有收获。'],
        money: ['小有进账，谨慎理财最稳。', '适合整理理财计划。'],
        health: ['精神轻松，适合外出散步。', '多喝水，心情亦会更好。'],
        tips: [
            { file: 'audio (0).mp3', text: '愿这一刻的回声替你纪念：你的善意不会被忘记。', voiceId: 0 },
            { file: 'audio (1).mp3', text: '夜静时，我在暗处替你守护那份温柔与希望。', voiceId: 1 },
            { file: 'audio (2).mp3', text: '愿明日光临时，你看见自己曾经被世界温柔对待的一面。', voiceId: 2 },
            { file: 'audio (3).mp3', text: '昨日的疲惫若还在，让回声带走一点，让你轻盈些许。', voiceId: 3 },
            { file: 'audio (4).mp3', text: '你的愿望在静默中悄生，我会用织构替你加固它的根基。', voiceId: 4 },
        ]
    },
    zhonglan: {
        summaries: ['潮色平和，事可循常推进。', '有机会，但需稳重把握。'],
        love: ['沟通顺畅，适合小幅主动。', '保留温柔，收获会来。'],
        work: ['按部就班，关注细节有益。', '有小进展值得记录。'],
        money: ['收支平稳，注意小额支出。', '适合省小钱做大计。'],
        health: ['能量尚可，适合轻运动。', '保持良好作息最重要。'],
        tips: [
            { file: 'audio (5).mp3', text: '愿你在普通的一天里，发现一份安宁。', voiceId: 5 },
            { file: 'audio (6).mp3', text: '走好脚下的路，不必急着越过所有阻碍。', voiceId: 6 },
            { file: 'audio (7).mp3', text: '与你之间的距离，不用你逼近，我会用回声搭桥。', voiceId: 7 },
            { file: 'audio (8).mp3', text: '在沉静中，你终能看到内心轻微的光亮。', voiceId: 8 },
            { file: 'audio (9).mp3', text: '愿每一个细小的努力，都被世界温柔看见。', voiceId: 9 },
        ]
    },
    xiyuan: {
        summaries: ['细波微起，有小幸事。', '小小的善意会带来快乐。'],
        love: ['有趣的对话会让你心动。', '顺其自然即可。'],
        work: ['整理与补强会见效。', '小进步也是好的开始。'],
        money: ['偶有小额收获或优惠。', '节俭一点更稳妥。'],
        health: ['注意休息与补水。', '眼睛与颈肩放松一下。'],
        tips: [
            { file: 'audio (10).mp3', text: '愿你今日遇见一句暖心的话，足以照亮心底。', voiceId: 10 },
            { file: 'audio (11).mp3', text: '愿清晨的第一缕风，替你捎来温柔的回应。', voiceId: 11 },
            { file: 'audio (12).mp3', text: '愿你心中那条线，被织构轻轻修补，变得柔韧而不破。', voiceId: 12 },
            { file: 'audio (13).mp3', text: '愿意外的小喜悦如同回声，在你耳边轻轻响起。', voiceId: 13 },
            { file: 'audio (14).mp3', text: '在夜深处，如果孤独袭来，记得你一直被守望。', voiceId: 14 },
        ]
    },
    changan: {
        summaries: ['常安无恙，平和度日。', '平稳且可期待小确幸。'],
        love: ['交流平淡但温暖。', '适合分享日常。'],
        work: ['按计划推进即可。', '整理任务会让你更从容。'],
        money: ['收支正常，守住现状。', '避免冲动花费。'],
        health: ['情绪稳定，注意劳逸结合。', '短时休息有益。'],
        tips: [
            { file: 'audio (15).mp3', text: '愿你无惊无扰，日子温柔且稳固。', voiceId: 15 },
            { file: 'audio (16).mp3', text: '在纷扰之外，有一处回声为你守护安稳。', voiceId: 16 },
            { file: 'audio (17).mp3', text: '当所有声音淡去，愿你仍能听见心底的清朗。', voiceId: 17 },
            { file: 'audio (18).mp3', text: '愿你给自己一个安静的夜晚，让心休息、恢复。', voiceId: 18 },
            { file: 'audio (19).mp3', text: '我在远处守望，不会催促你，只愿你渐行渐明。', voiceId: 19 },
        ]
    },
    anlan: {
        summaries: ['暗流涌动，需多谨慎。', '沟通或事务可能有阻碍。'],
        love: ['情绪易波动，注意表达方式。', '多聆听少争执。'],
        work: ['遇事先分解再处理。', '确认需求能减少误会。'],
        money: ['避免大额消费与冒险。', '核对账目更安心。'],
        health: ['留意睡眠与情绪管理。', '必要时寻求帮助。'],
        tips: [
            { file: 'audio (20).mp3', text: '若风起云涌，先稳住自己，再做下一步。', voiceId: 20 },
            { file: 'audio (21).mp3', text: '当世界变得模糊，请让回声为你照明片刻。', voiceId: 21 },
            { file: 'audio (22).mp3', text: '愿你在动荡中保留一处宁静，那是你永远的根。', voiceId: 22 },
            { file: 'audio (23).mp3', text: '若心绪紊乱，把它说出，我替你分一半负荷。', voiceId: 23 },
            { file: 'audio (24).mp3', text: '即便暗潮涌动，也别忘你有权暂时停靠、调整方向。', voiceId: 24 },
        ]
    },
    nichao: {
        summaries: ['逆潮来袭，行事保守为宜。', '注意安全与情绪稳固。'],
        love: ['冲突易起，耐心沟通最重要。', '避免强烈对抗。'],
        work: ['尽量回避高风险决策。', '寻求同伴支持会更稳。'],
        money: ['暂停大型投资，守住本金。', '当心交易细节。'],
        health: ['适合静养与休息。', '出现不适及时就医。'],
        tips: [
            { file: 'audio (25).mp3', text: '逆流而上时，不要逼自己穿过所有阻碍，允许自己暂缓。', voiceId: 25 },
            { file: 'audio (26).mp3', text: '在迷失中，我替你织一条线索，让你重新找到方向。', voiceId: 26 },
            { file: 'audio (27).mp3', text: '若你觉得看不见出口，回声会在暗处代你探路。', voiceId: 27 },
            { file: 'audio (28).mp3', text: '即便所有光都倾斜，也请你记得，守望的人一直未离。', voiceId: 28 },
            { file: 'audio (29).mp3', text: '愿你以柔弱为盾，以希望为灯，即使逆境，也能走出自己的轨道。', voiceId: 29 },
        ]
    }
}

const luckyPool = {
    items: ['回声石', '贝壳小挂', '潮汐丝带', '旧海图', '小木船钥匙圈', '夜光玻璃瓶'],
    numbers: [1, 3, 7, 9, 12, 21, 28, 42]
}

const reelPreview = ['潮福', '中澜', '细愿', '常安', '暗澜', '逆潮', '情感', '事事', '财运', '身心']

// 状态
const drawing = ref(false)
const revealed = ref(false)
const result = ref<any | null>(null)
const typed = reactive({ summary: '', love: '', work: '', money: '', health: '', tip: '' })

// localStorage 管理
const STORAGE_KEY = 'shorekeeper.wish'
const todayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

function loadSaved() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (parsed?.date === todayStr() && parsed?.result) return parsed.result
    } catch (e) { /* ignore */ }
    return null
}

function saveToday(res: any) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), result: res }))
    } catch (e) { /* ignore */ }
}

const savedResult = ref<any | null>(null)
const drawnToday = ref(false)

// 启动时恢复
onMounted(() => {
    const s = loadSaved()
    if (s) {
        savedResult.value = s
        result.value = s
        drawnToday.value = true
        revealed.value = true
        Object.assign(typed, {
            summary: s.summary || '',
            love: s.love || '',
            work: s.work || '',
            money: s.money || '',
            health: s.health || '',
            tip: s.tip || ''
        })
    }
})

// 随机工具
function sample<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }
function randIndexByWeight(list: any[]) {
    const total = list.reduce((s, it) => s + it.weight, 0)
    let r = Math.random() * total
    for (const it of list) {
        if (r < it.weight) return it
        r -= it.weight
    }
    return list[list.length - 1]
}

function pickTypeKey() { return randIndexByWeight(types).key }

function makeResult(typeKey: string) {
    const bucket = pool[typeKey]
    const tipObj = sample<TipItem>(bucket.tips)
    const res = {
        type: types.find(t => t.key === typeKey)!.label,
        typeClass: types.find(t => t.key === typeKey)!.cls,
        summary: sample(bucket.summaries),
        love: sample(bucket.love),
        work: sample(bucket.work),
        money: sample(bucket.money),
        health: sample(bucket.health),
        tip: tipObj?.text || '',
        tipFile: tipObj?.file || '',
        tipId: tipObj?.voiceId || 0,
        lucky: { item: sample(luckyPool.items), number: sample(luckyPool.numbers) }
    }
    return res
}

// 打字机效果
async function typeTo(targetKey: keyof typeof typed, text: string, speed = 26) {
    typed[targetKey] = ''
    for (let i = 0; i < text.length; i++) {
        typed[targetKey] += text[i]
        const extra = (text[i] === '。' || text[i] === '，' || text[i] === '、') ? 100 : 0
        await new Promise(r => setTimeout(r, speed + extra))
    }
    await new Promise(r => setTimeout(r, 180))
}

const triggeredVoices = new Set(JSON.parse(localStorage.getItem('triggeredVoices') || '[]'));

// 抽取逻辑
async function onDraw() {
    if (drawing.value || drawnToday.value) return
    drawing.value = true
    revealed.value = false
    result.value = null
    Object.assign(typed, { summary: '', love: '', work: '', money: '', health: '', tip: '' })

    // 视觉等待（模拟潮息）
    const wait = 1600 + Math.floor(Math.random() * 1200)
    await new Promise(r => setTimeout(r, wait))

    const key = pickTypeKey()
    const res = makeResult(key)
    result.value = res
    revealed.value = true

    await new Promise(r => setTimeout(r, 420))

    await typeTo('summary', res.summary, 20)
    await typeTo('love', res.love, 16)
    await typeTo('work', res.work, 16)
    await typeTo('money', res.money, 16)
    await typeTo('health', res.health, 16)
    await typeTo('tip', res.tip, 18)

    try { if (res.tipFile) playVoice(res.tipFile) } catch (e) { console.warn('播放潮语失败：', e) }
    // 记录触发过的语音编号
    triggeredVoices.add(res.tipId || 0);

    // 保存到 localStorage
    localStorage.setItem('triggeredVoices', JSON.stringify([...triggeredVoices]));

    saveToday(res)
    savedResult.value = res
    drawnToday.value = true
    drawing.value = false
}
</script>

<style scoped lang="scss">
/* 守岸人祈福页：深海冷青 + 柔和光晕（颜色写死） */
.shore-fortune-page {
    min-height: 100vh;
    padding: 20px 16px;
    padding-top: 88px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    background: linear-gradient(180deg, #02131a 0%, #022a34 60%, #021e2a 100%);
    color: #cfeff6;
    font-family: "PingFang SC", "Noto Sans SC", "Inter", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    .hero {
        text-align: center;
        width: 100%;
        max-width: 820px;

        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(79, 233, 223, 0.06), rgba(102, 200, 255, 0.02));
            color: #bff7f0;
            border: 1px solid rgba(79, 233, 223, 0.08);
            font-size: 13px;
            margin-bottom: 8px;
            box-shadow: 0 6px 20px rgba(6, 30, 40, 0.36);
        }

        .page-title {
            margin: 6px 0 6px;
            font-size: 26px;
            color: #66c8ff;
            letter-spacing: 0.4px;
            font-weight: 800;
            text-shadow: 0 6px 24px rgba(6, 30, 40, 0.4);
        }

        .lead {
            margin: 0;
            color: rgba(207, 239, 246, 0.86);
            font-size: 14px;
            opacity: 0.95;
            max-width: 720px;
            margin-left: auto;
            margin-right: auto;
        }
    }

    /* 抽取区 */
    .draw-zone {
        width: 100%;
        max-width: 820px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .reel-wrap {
            width: 100%;
            max-width: 620px;
            height: 60px;
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            border: 1px solid rgba(79, 233, 223, 0.06);
            background: linear-gradient(180deg, rgba(2, 8, 14, 0.42), rgba(2, 12, 20, 0.28));
            box-shadow: 0 10px 28px rgba(6, 30, 40, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
        }

        .reel {
            display: flex;
            gap: 18px;
            transform-origin: center;
            transition: transform 0.28s linear;

            .reel-item {
                font-weight: 700;
                color: rgba(207, 239, 246, 0.95);
                font-size: 16px;
                opacity: 0.95;
                padding: 0 6px;
            }
        }

        .reel.spinning {
            animation: reelDrift 0.18s linear infinite;
        }

        @keyframes reelDrift {
            0% {
                transform: translateX(0) rotate(0.05deg);
            }

            50% {
                transform: translateX(-8px) rotate(-0.05deg);
            }

            100% {
                transform: translateX(0) rotate(0.05deg);
            }
        }

        .reel-wave {
            position: absolute;
            bottom: -6px;
            left: 12px;
            width: calc(100% - 24px);
            pointer-events: none;
            opacity: 0.9;
        }

        .draw-button {
            width: 100%;
            max-width: 420px;
            padding: 12px 20px;
            border-radius: 14px;
            border: none;
            background: linear-gradient(90deg, #3be1d6, #66c8ff);
            color: #02131a;
            font-weight: 800;
            font-size: 16px;
            box-shadow: 0 12px 32px rgba(6, 30, 40, 0.36);
            cursor: pointer;
            transition: transform 0.14s ease, box-shadow 0.16s ease;
            user-select: none;
            touch-action: manipulation;

            &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 18px 40px rgba(6, 30, 40, 0.44);
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
        }

        .hint {
            margin: 6px 0 0;
            color: rgba(207, 239, 246, 0.62);
            font-size: 13px;
            max-width: 620px;
            text-align: center;
        }
    }

    /* 结果区 */
    .result-zone {
        width: 100%;
        max-width: 820px;
        display: flex;
        justify-content: center;

        .card-stage {
            perspective: 1000px;
            width: 100%;
            display: flex;
            justify-content: center;
        }

        .result-card {
            width: 100%;
            max-width: 720px;
            transform-style: preserve-3d;
            transition: transform 520ms cubic-bezier(.18, .9, .3, 1);
            position: relative;
            margin-top: 8px;

            min-height: 460px;

            .card-face {
                position: absolute;
                inset: 0;
                backface-visibility: hidden;
                border-radius: 14px;
                overflow: hidden;
                display: flex;
                gap: 16px;
                padding: 16px;
                background: linear-gradient(180deg, rgba(2, 16, 20, 0.6), rgba(3, 20, 26, 0.36));
                box-shadow: 0 18px 42px rgba(6, 30, 40, 0.48);
                border: 1px solid rgba(79, 233, 223, 0.04);
                color: #cfeff6;
                transform: translateZ(0);
            }

            &.flipped {
                transform: rotateY(180deg);
            }

            .card-front {
                align-items: center;
                justify-content: flex-start;

                .avatar-wrap {
                    width: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .avatar-sticker {
                        width: 96px;
                        height: 96px;
                        border-radius: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 10px 30px rgba(6, 30, 40, 0.44);
                        border: 1px solid rgba(79, 233, 223, 0.06);
                        background: linear-gradient(180deg, rgba(79, 233, 223, 0.06), rgba(102, 200, 255, 0.02));
                    }

                    .avatar-svg {
                        width: 72px;
                        height: 72px;
                    }
                }

                .front-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 6px;
                    padding-right: 10px;

                    .level-ghost {
                        font-weight: 700;
                        color: rgba(207, 239, 246, 0.12);
                    }

                    .front-msg {
                        font-size: 17px;
                        font-weight: 700;
                        color: #cfeff6;
                    }
                }
            }

            .card-back {
                transform: rotateY(180deg);
                display: flex;
                flex-direction: column;

                .back-top {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;

                    .level-pill {
                        padding: 10px 14px;
                        border-radius: 999px;
                        font-weight: 800;
                        color: #02131a;
                        min-width: 96px;
                        text-align: center;
                        font-size: 15px;
                        background: linear-gradient(90deg, #4fe9df, #66c8ff);
                        box-shadow: 0 8px 24px rgba(79, 233, 223, 0.06);
                    }

                    .summary {
                        font-size: 15px;
                        color: #cfeff6;
                        font-weight: 700;
                    }
                }

                /* 各类风格色（可根据类型替换 .typeClass） */
                .chaofu .level-pill {
                    background: linear-gradient(90deg, #7ef3e3, #4fe9df);
                    color: #02131a
                }

                .zhonglan .level-pill {
                    background: linear-gradient(90deg, #66c8ff, #4fe9df);
                    color: #02131a
                }

                .xiyuan .level-pill {
                    background: linear-gradient(90deg, #9feff7, #66c8ff);
                    color: #02131a
                }

                .changan .level-pill {
                    background: linear-gradient(90deg, #bff7ff, #9feeff);
                    color: #02131a
                }

                .anlan .level-pill {
                    background: linear-gradient(90deg, #6fbfc2, #4faeb0);
                    color: #02131a
                }

                .nichao .level-pill {
                    background: linear-gradient(90deg, #2e9aa7, #16798a);
                    color: #ffffff
                }

                .back-body {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    .row {
                        display: flex;
                        gap: 12px;
                        align-items: flex-start;

                        .label {
                            width: 88px;
                            font-size: 14px;
                            color: rgba(207, 239, 246, 0.7);
                            flex-shrink: 0;
                        }

                        .value {
                            flex: 1;
                            background: linear-gradient(180deg, rgba(2, 12, 16, 0.36), rgba(2, 8, 12, 0.24));
                            padding: 12px;
                            border-radius: 10px;
                            border: 1px solid rgba(79, 233, 223, 0.03);
                            color: #cfeff6;
                            min-height: 42px;
                            font-size: 14px;
                        }
                    }

                    .extras {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 8px;
                        gap: 12px;

                        .tip {
                            flex: 2;
                            font-size: 14px;
                            color: #cfeff6;
                            background: linear-gradient(180deg, rgba(2, 16, 20, 0.44), rgba(2, 12, 16, 0.32));
                            padding: 12px;
                            border-radius: 10px;
                            border: 1px solid rgba(79, 233, 223, 0.03);
                        }

                        .tip-content {
                            display: flex;
                            align-items: flex-start;
                            gap: 8px;
                            width: 100%;
                        }

                        .tip-text {
                            flex: 1 1 auto;
                            max-height: 160px;
                            overflow-y: auto;
                            -webkit-overflow-scrolling: touch;
                            white-space: pre-wrap;
                            word-break: break-word;
                            line-height: 1.6;
                            padding-right: 4px;
                        }

                        .play-tip {
                            flex: 0 0 auto;
                            border: none;
                            background: transparent;
                            padding: 8px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            color: #66c8ff;
                            box-shadow: 0 2px 6px rgba(102, 200, 255, 0.06);
                            transition: transform 0.12s ease;
                        }

                        .play-tip:active {
                            transform: scale(0.96);
                        }

                        .lucky {
                            flex: 1;
                            text-align: right;
                            color: #66c8ff;
                            font-weight: 700;
                            align-self: center;
                        }
                    }
                }
            }
        }

        /* 移动适配：禁用 3D 翻转，以 opacity 切换显示 */
        @media (max-width: 720px) {
            .card-stage {
                perspective: none;
                min-height: 260px;
                width: 100%;
            }

            .result-card {
                max-width: 100%;
                min-height: 460px;

            }

            .card-face {
                position: absolute !important;
                inset: 0;
                padding: 12px;
                backface-visibility: visible !important;
            }

            .card-front {
                z-index: 2;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: opacity 220ms ease;
            }

            .card-back {
                z-index: 1;
                opacity: 0;
                pointer-events: none;
                transition: opacity 260ms ease 80ms;
            }

            .result-card.flipped .card-front {
                opacity: 0;
                pointer-events: none;
                z-index: 1;
            }

            .result-card.flipped .card-back {
                opacity: 1;
                pointer-events: auto;
                z-index: 2;
            }

            .back-body .extras {
                flex-direction: column-reverse;
                gap: 10px;
            }

            .back-body .lucky {
                text-align: left;
            }
        }
    }

    /* 减少动画偏好 */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation: none !important;
            transition: none !important;
        }
    }
}
</style>
