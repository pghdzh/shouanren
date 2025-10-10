<template>
    <div class="yuzuki-resources">
        <header class="hero">
            <div class="hero-inner">
                <h1>资源分享</h1>
                <p class="subtitle">可自由上传关于椿的相关链接</p>
            </div>
        </header>

        <main class="container">
            <section class="uploader" :class="{ collapsed: uploaderCollapsed }">
                <div class="uploader-head">
                    <button class="toggle" @click="toggleUploader" :aria-expanded="!uploaderCollapsed">
                        <span v-if="uploaderCollapsed">展开上传区</span>
                        <span v-else>收起上传区</span>
                    </button>
                </div>

                <form @submit.prevent="addResource" class="upload-form" :aria-hidden="uploaderCollapsed">
                    <div class="row">
                        <input v-model="form.title" type="text" placeholder="标题（必填，如果有解压码之类的也写这里吧）" aria-label="标题" />
                        <input v-model="form.type" type="text" placeholder="链接类型(网页链接、b站视频、网盘链接等等)" aria-label="来源" />
                    </div>

                    <div class="row">
                        <input v-model="form.uploader" type="text" placeholder="上传人（可选）" aria-label="上传人" />
                        <input v-model="form.link" type="url" placeholder="链接(只输入网址不能有中文)" aria-label="链接" />
                    </div>

                    <div class="actions">
                        <button type="submit" class="btn primary">上传</button>
                    </div>
                </form>
            </section>

            <section class="list">
                <div class="list-header">
                    <h2>资源列表（{{ resources.length }}）</h2>
                    <div class="sort">
                        <label>
                            排序：
                            <select v-model="sortBy">
                                <option value="time">按时间（新→旧）</option>
                                <option value="likes">按点赞（高→低）</option>
                            </select>
                        </label>
                    </div>
                </div>

                <ul class="items">
                    <li v-for="item in sortedResources" :key="item.id" class="item">
                        <a :href="item.link" target="_blank" rel="noopener noreferrer" class="title">{{ item.title
                        }}</a>

                        <div class="meta">
                            <div class="left">
                                <span class="uploader">{{ item.uploader || '匿名' }}</span>
                                <span class="dot">•</span>
                                <time :datetime="item.time">{{ formatTime(item.time) }}</time>
                            </div>

                            <div class="right">
                                <button @click.prevent="handleLike(item)" :aria-pressed="likedIds.has(String(item.id))"
                                    class="like-btn" :class="{ active: likedIds.has(String(item.id)) }">

                                    <img :src="likedIds.has(String(item.id))
                                        ? '/icons/heart-red-filled.svg'
                                        : '/icons/heart-red-outline.svg'" class="heart-icon" alt="heart" />
                                    <span class="count">{{ item.likes }}</span>
                                </button>


                                <span class="badge">{{ item.type }}</span>
                            </div>
                        </div>
                    </li>
                </ul>

                <p v-if="resources.length === 0" class="empty">目前没有资源，快来上传第一条吧！</p>
            </section>
        </main>

        <footer class="foot">提示：点击标题将直接跳转</footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 如果你的工程使用 ts 路径别名 @ 指向 src，可以用 '@/api/resource'，否则根据实际路径调整
import { getResourceList, createResource, likeResource } from '@/api/modules/resource'
import { ElMessage } from 'element-plus'
type ResourceType = 'baidu' | 'quark'
interface Resource {
    id: number | string
    title: string
    uploader?: string
    time: string // ISO 或 created_at
    likes: number
    link: string
    type: ResourceType
    role_key?: string
}

const STORAGE_KEY = 'chun_resources_v1'
const DEFAULT_ROLE = 'chun'

const form = ref<{ title: string; uploader: string; link: string; type: ResourceType }>({
    title: '',
    uploader: '',
    link: '',
    type: '',
})

const resources = ref<Resource[]>([])
const likedIds = ref(new Set<string>())
const sortBy = ref<'time' | 'likes'>('time')
const uploaderCollapsed = ref(false)

function mapServerToLocal(row: any): Resource {

    return {
        id: row.id,
        title: row.title,
        uploader: row.uploader || '匿名',
        time: row.created_at || row.time || new Date().toISOString(),
        likes: row.likes ?? 0,
        link: row.link,
        type: (row.storage_type || row.type || 'other') as ResourceType,
        role_key: row.role_key,
    }
}



async function loadResources() {
    try {
        // 尝试从后端拉取（分页可扩展，这里一次拉足够 demo）
        const res: any = await getResourceList({ role_key: DEFAULT_ROLE, page: 1, pageSize: 100 })
        if (res && res.success && Array.isArray(res.data)) {
            resources.value = res.data.map(mapServerToLocal)
            // 可恢复本地点赞状态（仅 UI 记忆）
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                try {
                    const parsed = JSON.parse(raw)
                    if (parsed.liked && Array.isArray(parsed.liked)) {
                        parsed.liked.forEach((id: string) => likedIds.value.add(id))
                    }
                } catch (e) { /* ignore */ }
            }
            return
        }
    } catch (err) {
        console.warn('拉取资源失败，使用本地缓存', err)
    }
    // 回退：本地缓存（仅恢复点赞状态）
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.liked && Array.isArray(parsed.liked)) {
                parsed.liked.forEach((id: string) => likedIds.value.add(id))
            }
        }
    } catch (e) {
        console.warn('本地加载失败', e)
    }
}

function saveLocalCache() {
    try {
        const liked = Array.from(likedIds.value)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ liked }))
    } catch (e) {
        console.warn('保存本地缓存失败', e)
    }
}

onMounted(() => {
    loadResources()
    // 移动端默认收起上传区以节省空间
    uploaderCollapsed.value = window.innerWidth <= 640
})
function toggleUploader() {
    uploaderCollapsed.value = !uploaderCollapsed.value
}


async function addResource() {
    const t = form.value.title.trim()
    const l = form.value.link.trim()
    if (!form.value.title.trim() || !form.value.link.trim()) {
        return ElMessage.warning('请填写完整信息')
    }
    if (!/^https?:\/\//i.test(l)) {
        return ElMessage.error('请输入正确的链接(https开头)')
    }
    // 尝试调用后端接口
    try {
        const payload = {
            title: t,
            uploader: form.value.uploader.trim() || '匿名',
            link: l,
            storage_type: form.value.type,
            role_key: DEFAULT_ROLE,
        }
        const res: any = await createResource(payload)
        if (res && res.success && res.data) {
            const added = mapServerToLocal(res.data)
            resources.value.unshift(added)
            // 自动展开到顶部展示（可选）
            saveLocalCache()
            resetForm()
            ElMessage.success('上传成功')
            return
        }
        ElMessage.error('上传失败')
    } catch (err) {
        console.warn('创建资源失败', err)
    }
}

function resetForm() {
    form.value.title = ''
    form.value.uploader = ''
    form.value.link = ''
    form.value.type = ''
}

async function handleLike(item: Resource) {
    // UI 乐观更新
    const id = item.id
    const wasLiked = likedIds.value.has(String(id))
    if (wasLiked) {
        likedIds.value.delete(String(id))
        item.likes = Math.max(0, item.likes - 1)
    } else {
        likedIds.value.add(String(id))
        item.likes++
    }
    saveLocalCache()

    // 同步后端（不依赖返回值进行 UI 回滚，简单处理：若失败则回退）
    try {
        const action = wasLiked ? 'unlike' : 'like'
        const res: any = await likeResource(id, action)
        if (res && res.success && res.data && typeof res.data.likes !== 'undefined') {
            item.likes = res.data.likes
        }
    } catch (err) {
        console.warn('点赞接口调用失败，回滚本地状态', err)
        // 回滚
        if (wasLiked) {
            // 本来是已赞，取消失败 -> 重新添加
            likedIds.value.add(String(id))
            item.likes++
        } else {
            likedIds.value.delete(String(id))
            item.likes = Math.max(0, item.likes - 1)
        }
        saveLocalCache()
    }
}

const sortedResources = computed(() => {
    const arr = [...resources.value]
    if (sortBy.value === 'time') {
        arr.sort((a, b) => +new Date(b.time) - +new Date(a.time))
    } else {
        arr.sort((a, b) => b.likes - a.likes)
    }
    return arr
})

function formatTime(iso: string) {
    try {
        const d = new Date(iso)
        return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d)
    } catch (e) {
        return iso
    }
}
</script>

<style lang="scss" scoped>
/* 红椿色板（写死 hex，易识别）：
   深红：#9e1820
   中红：#d94e60
   浅粉：#ffd7db
   文本深色：#2b1516
   次要灰：#7b5b5f
*/

.yuzuki-resources {
    min-height: 100vh;
    background: linear-gradient(145deg, #fff6f7 0%, #fff1f3 40%, #fff0f2 100%);
    color: #2b1516;
    display: flex;
    flex-direction: column;
    padding-top: 70px;
    font-family: "Noto Sans SC", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;

    /* 顶区 hero（暖粉玻璃面板感） */
    .hero {
        padding: 18px 12px;
        background: linear-gradient(180deg, rgba(255, 238, 240, 0.46), rgba(255, 243, 244, 0.32));
        -webkit-backdrop-filter: blur(6px) saturate(120%);
        backdrop-filter: blur(6px) saturate(120%);
        border-bottom: 1px solid rgba(158, 24, 32, 0.04);

        .hero-inner {
            max-width: 1000px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 6px;

            h1 {
                margin: 0;
                font-size: 20px;
                display: inline-block;
                width: 120px;
                font-weight: 900;
                letter-spacing: 0.6px;
                /* 文字渐变（椿专用） */
                background: linear-gradient(90deg, #e9acb4 0%, #ff6a7a 45%, #b42229 90%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                -webkit-text-fill-color: transparent;
            }

            .subtitle {
                margin-top: 6px;
                color: #7b5b5f;
                font-size: 13px;
            }
        }
    }

    .container {
        max-width: 1000px;
        margin: 16px auto;
        padding: 0 12px;
        width: 100%;
        box-sizing: border-box;

        /* 上传区（毛玻璃 + 红色强调） */
        .uploader {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 246, 247, 0.96));
            border-radius: 14px;
            padding: 0;
            box-shadow: 0 10px 36px rgba(158, 24, 32, 0.06);
            border: 1px solid rgba(158, 24, 32, 0.06);
            overflow: hidden;

            .uploader-head {
                display: flex;
                justify-content: flex-end;
                padding: 10px 12px;

                .toggle {
                    background: transparent;
                    border: 1px solid rgba(158, 24, 32, 0.08);
                    color: #9e1820;
                    padding: 6px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: background .18s, transform .12s;
                }
            }

            .upload-form {
                padding: 14px;
                max-height: 1600px;
                overflow: hidden;
                transition: max-height 280ms ease, padding 280ms ease;

                .row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 10px;

                    input,
                    select {
                        flex: 1 1 0;
                        padding: 10px 12px;
                        border-radius: 10px;
                        border: 1px solid rgba(59, 22, 28, 0.06);
                        font-size: 14px;
                        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 246, 247, 0.98));
                        color: #2b1516;
                        outline: none;
                        transition: box-shadow .16s, border-color .16s, transform .08s;
                    }

                    select {
                        max-width: 140px;
                    }

                    input:focus,
                    select:focus {
                        border-color: rgba(217, 78, 96, 0.9);
                        box-shadow: 0 8px 26px rgba(217, 78, 96, 0.06);
                        transform: translateY(-1px);
                    }
                }

                .actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;

                    .btn {
                        padding: 8px 12px;
                        border-radius: 10px;
                        border: none;
                        font-weight: 700;
                        cursor: pointer;

                        &.primary {
                            background: linear-gradient(135deg, #ff8aa2 0%, #d94e60 60%, #9e1820 100%);
                            color: #fff;
                            box-shadow: 0 10px 30px rgba(184, 58, 74, 0.12);
                            transition: transform .12s ease, box-shadow .14s ease;
                        }

                        &.primary:active {
                            transform: translateY(1px) scale(.998);
                            box-shadow: 0 6px 16px rgba(158, 24, 32, 0.08);
                        }

                        &.secondary {
                            background: transparent;
                            color: #7b5b5f;
                            border: 1px solid rgba(158, 24, 32, 0.06);
                        }
                    }
                }
            }

            &.collapsed {
                .upload-form {
                    max-height: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
        }

        /* 资源列表区 */
        .list {
            margin-top: 18px;

            .list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;

                h2 {
                    font-size: 16px;
                    margin: 0;
                    color: #4b1a20;
                    font-weight: 800;
                }

                .sort select {
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid rgba(158, 24, 32, 0.06);
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 246, 247, 0.98));
                }
            }

            .items {
                list-style: none;
                padding: 0;
                margin: 0;

                .item {
                    background: linear-gradient(180deg, #fff, #fff8f9);
                    border-radius: 12px;
                    padding: 12px;
                    margin-bottom: 12px;
                    box-shadow: 0 12px 34px rgba(158, 24, 32, 0.04);
                    border: 1px solid rgba(245, 235, 238, 0.7);
                    transition: transform .18s cubic-bezier(.2, .9, .25, 1), box-shadow .18s ease;

                    &:hover {
                        transform: translateY(-6px);
                        box-shadow: 0 20px 56px rgba(158, 24, 32, 0.08);
                    }

                    .title {
                        display: block;
                        color: #2b1516;
                        font-weight: 800;
                        text-decoration: none;
                        margin-bottom: 8px;
                        font-size: 15px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .meta {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        color: #7b5b5f;
                        font-size: 13px;

                        .left {
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            .uploader {
                                color: #8b3a46;
                                font-weight: 700;
                            }

                            .dot {
                                opacity: 0.6;
                            }

                            time {
                                color: #7b5b5f;
                            }
                        }

                        .right {
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            .like-btn,
                            .copy-btn {
                                background: transparent;
                                border: none;
                                cursor: pointer;
                                padding: 6px 8px;
                                border-radius: 8px;
                                font-weight: 700;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                                transition: transform .08s, background .12s;
                            }

                            .like-btn:hover {
                                transform: translateY(-2px);
                            }

                            .heart-icon {
                                width: 18px;
                                height: 18px;
                                display: block;
                                filter: grayscale(100%) opacity(.9);
                            }

                            /* 当 active 时，显示椿色发光（如果你用 svg 可以用 fill 切换） */
                            .like-btn.active .heart-icon {
                                filter: none;
                                transform: scale(1.03);
                                box-shadow: 0 6px 20px rgba(217, 78, 96, 0.12);
                            }

                            .badge {
                                padding: 4px 8px;
                                border-radius: 999px;
                                font-size: 12px;
                                font-weight: 700;
                                background: linear-gradient(180deg, rgba(217, 78, 96, 0.12), rgba(158, 24, 32, 0.06));
                                color: #7a1c25;
                                border: 1px solid rgba(217, 78, 96, 0.06);
                            }
                        }
                    }
                }
            }

            .empty {
                text-align: center;
                color: #7b5b5f;
                padding: 28px 0;
            }
        }
    }

    .foot {
        text-align: center;
        color: #7b5b5f;
        font-size: 12px;
        margin: 20px 0 40px;
    }

    /* 响应式：移动端优化 */
    @media (max-width: 640px) {
        padding-top: 80px;

        .hero {
            padding: 12px 10px;

            .hero-inner h1 {
                font-size: 18px;
            }

            .subtitle {
                font-size: 12px;
            }
        }

        .container {
            padding: 0 14px;

            .upload-form {
                .row {
                    flex-direction: column;
                }

                .actions {
                    flex-direction: column;
                    align-items: stretch;
                }
            }

            .items .item .title {
                white-space: normal;
                /* 移动端允许标题换行以提高可读性 */
            }
        }
    }

 
}
</style>
