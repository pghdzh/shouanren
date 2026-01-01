<template>
  <div class="shouanren-page" aria-live="polite">
    <!-- 星域背景层 -->
    <div class="stellar-background" aria-hidden="true">
      <div class="nebula-layer"></div>
      <div class="tidal-layer"></div>
      <div class="starlight-layer"></div>
    </div>

    <!-- 漂浮星光粒子 -->
    <canvas ref="starsCanvas" class="stars-canvas" aria-hidden="true"></canvas>

    <main class="stellar-container" ref="mainContainer">
      <!-- HERO 区域 - 重新设计为星域守望者风格 -->
      <header class="stellar-hero" role="banner">
        <!-- 左侧：星辉徽章 -->
        <div class="stellar-emblem">
          <div class="emblem-core">
            <div class="core-glow"></div>
            <div class="core-ripple"></div>
          </div>
          <div class="emblem-orbits">
            <div class="orbit orbit-1"></div>
            <div class="orbit orbit-2"></div>
          </div>
        </div>

        <!-- 中心：人物信息 -->
        <div class="hero-content">
          <div class="hero-title">
            <h1 class="character-name">
              <span class="name-main">守岸人</span>
              <span class="name-sub">· 黑海岸的守望者</span>
            </h1>
            <div class="title-divider">
              <div class="divider-line"></div>
              <div class="divider-star">✦</div>
              <div class="divider-line"></div>
            </div>
            <p class="character-title">回声为灯 · 潮汐为路 · 星域为证</p>
          </div>

          <!-- 共鸣能力标签 -->
          <div class="resonance-tags">
            <span class="tag primary">共鸣能力：叙响织构</span>
            <span class="tag secondary">衍射属性</span>
            <span class="tag tertiary">治疗/辅助型</span>
          </div>

          <!-- 人物引言 -->
          <div class="hero-quote">
         
            <p class="quote-text">
              神秘清冷、超然物外。她因你的唤醒而生，在漫长的守望中萌生出情感和渴望——守护与世界，与你之间的羁绊。
            </p>
          </div>
        </div>

        <!-- 右侧：人物立绘 -->
        <div class="hero-portrait">
          <div class="portrait-frame">
            <img
              src="@/assets/images1/slty1 (8).webp"
              alt="守岸人 星域守望者立绘"
              class="portrait-image"
              loading="eager"
              decoding="async"
            />
            <div class="portrait-glow"></div>
            <div class="portrait-border"></div>
          </div>
          <div class="portrait-caption">星海回响 · 织构为形</div>
        </div>
      </header>

      <!-- 核心机制卡片 -->
      <section id="mechanism" class="stellar-card mechanism-card">
        <div class="card-header">
          <div class="header-icon">⚙️</div>
          <h2 class="card-title">星域核心机制</h2>
          <div class="header-line"></div>
        </div>

        <div class="mechanism-grid">
          <!-- 实论数据 -->
          <div class="mechanism-item">
            <div class="item-icon">⎈</div>
            <h3 class="item-title">【实论数据】</h3>
            <p class="item-desc">
              角色血量上方上限为5的特殊能量条，达到上限后施放重击演绎或空中攻击衍变消耗全部【实论数据】。
            </p>
          </div>

          <!-- 星域系统 -->
          <div class="mechanism-item highlight">
            <div class="item-icon">✦</div>
            <h3 class="item-title">【星域系统】</h3>
            <p class="item-desc">
              施放共鸣解放终末回环展开的领域。根据队伍中使用变奏技能的次数，星域会逐渐升级：
              <span class="domain-stage">浅析星域（蓝色）</span> →
              <span class="domain-stage">深潜星域（紫色）</span> →
              <span class="domain-stage">解限星域（金色）</span>，
              依次获得回血、暴击提升、暴伤提升的效果。
            </p>
            <div class="domain-note">
              <span class="note-icon">ℹ️</span>
              需要守岸人拥有250%共鸣效率才能获得最高收益
            </div>
          </div>

          <!-- 输出流程 -->
          <div class="mechanism-item wide">
            <div class="item-icon">↯</div>
            <h3 class="item-title">星域输出流程</h3>
            <div class="combo-grid">
              <div class="combo-item">
                <h4>基础流程</h4>
                <code class="combo-code"
                  >A-A-A-A-Z —（可切人）— A-A-A-A-Z-E-Q-R</code
                >
              </div>
              <div class="combo-item">
                <h4>高效技巧</h4>
                <p>守岸人闪避反击收益极高，蹭到闪避可直接 E-Q-R 启动</p>
              </div>
              <div class="combo-item">
                <h4>技能缩写</h4>
                <div class="skill-abbr">
                  <span>普攻 = A</span>
                  <span>重击 = Z</span>
                  <span>共鸣技能 = E</span>
                  <span>共鸣解放 = R</span>
                  <span>声骸 = Q</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 角色背景与形象 -->
      <section id="background" class="stellar-card background-card">
        <div class="card-header">
          <div class="header-icon">📜</div>
          <h2 class="card-title">星辉档案 · 起源与形貌</h2>
          <div class="header-line"></div>
        </div>

        <div class="background-grid">
          <!-- 起源背景 -->
          <article class="background-item">
            <div class="item-label">
              <span class="label-icon">🌌</span>
              <h3>星海起源</h3>
            </div>
            <div class="item-content">
              <p>
                沉眠于黑海岸地中星河下的生命体，身体构造、生平年龄均不详。在泰缇斯系统高度抽象化的代码语言中，"守岸人"这个名字还有着"保守秘密者"的意义。
              </p>
              <p>
                第二实例，即守岸人，通体由高纯度回音能量晶体构成，其核心诞生于世界在凛冽中迈入死寂之时。守岸人在意识存在之前，在理解如何做到之前，就已经知道了自己需要完成的一切。
              </p>
              <blockquote class="origin-quote">
                "被漂泊者触及之刻，二者的频率引发共振，晶体就此解构，化作蝴蝶，最终织构出少女的姿态。"
              </blockquote>
            </div>
          </article>

          <!-- 外貌形象 -->
          <article class="background-item">
            <div class="item-label">
              <span class="label-icon">👁️</span>
              <h3>星辉形貌</h3>
            </div>
            <div class="item-content">
              <p>
                守岸人蓝发紫眼，头上戴着左蓝右白的头巾，头巾内侧闪耀深蓝的光辉。海蓝的短发垂下两绺至胸前的鬓发。
              </p>
              <p>
                胸口处存在一道向外延伸的晶体裂痕，微光闪烁，内里涌动的是守岸人生命本源的力量。身着一件蓝白色的连衣短裙，背后与胸口有着大面积的镂空。
              </p>
              <div class="appearance-details">
                <div class="detail-item">
                  <span class="detail-icon">🎀</span>
                  <span>双手系有别着小花的白色缎带</span>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">👣</span>
                  <span>白色坡跟凉鞋，鞋跟样式似波浪</span>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">💎</span>
                  <span>手脚指甲均为星辉蓝色</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- 共鸣状况 -->
      <section id="resonance-status" class="stellar-card status-card">
        <div class="card-header">
          <div class="header-icon">⚠️</div>
          <h2 class="card-title">共鸣状况报告</h2>
          <div class="header-line"></div>
        </div>

        <div class="status-content">
          <div class="status-alert">
            <div class="alert-icon">🔬</div>
            <div class="alert-text">
              守岸人的测试结果基本处可控区间，但体内回音能量多次呈溃散态，存在损耗过度、晶体碎裂脱落的情况。
            </div>
          </div>

          <div class="status-details">
            <p>
              本机推测为海算解析悲鸣数据所致。值得关注的是，守岸人同样发现了这一情况，会使用全新能量晶体替换自身受损部分，进行缓解。
            </p>
            <p class="status-note">
              <span class="note-icon">💡</span>
              推断其肩臂和小腿处的弦状波痕，为愈合后遗留的裂口痕迹。不排除再度发生此类情况的可能，或需提高对能量体的检测和替换频次。
            </p>
          </div>
        </div>
      </section>

      <!-- 共鸣链详解 -->
      <section id="resonance-chain" class="stellar-card chain-card">
        <div class="card-header">
          <div class="header-icon">🔗</div>
          <h2 class="card-title">共鸣链详解 · 星域升华</h2>
          <div class="header-line"></div>
        </div>

        <div class="chain-timeline">
          <div class="timeline-track">
            <div class="track-line"></div>
            <div class="track-nodes">
              <div
                v-for="(chain, index) in resonanceChains"
                :key="index"
                class="chain-node"
                :class="{ 'node-active': activeChain === index }"
                @mouseenter="activeChain = index"
                @mouseleave="activeChain = null"
              >
                <div class="node-marker">
                  <div class="marker-core"></div>
                  <div class="marker-ring"></div>
                  <span class="node-number">{{ index + 1 }}</span>
                </div>
                <div class="node-card">
                  <div class="chain-header">
                    <h3 class="chain-title">{{ chain.title }}</h3>
                    <span class="chain-level">第{{ index + 1 }}链</span>
                  </div>
                  <p class="chain-desc">{{ chain.desc }}</p>
                  <div class="chain-effect">
                    <span class="effect-icon">✨</span>
                    <span class="effect-text">{{ chain.effect }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 守岸人纪事 -->
      <section
        id="chronicles"
        class="stellar-card chronicles-card"
        ref="chroniclesRef"
      >
        <div class="card-header">
          <div class="header-icon">📖</div>
          <h2 class="card-title">守岸人纪事 · 星海回响</h2>
          <div class="header-line"></div>
        </div>

        <div class="chronicles-content">
          <!-- 故事内容 -->
          <transition name="story-fade" mode="out-in">
            <article
              :key="chronicles[currentStory].id"
              class="story-content"
              :aria-labelledby="`story-${chronicles[currentStory].id}`"
            >
              <header class="story-header">
                <h3 class="story-title">
                  {{ chronicles[currentStory].title }}
                </h3>
                <div class="story-meta">
                  <span class="meta-item">📅 纪元 {{ currentStory + 1 }}</span>
                  <span class="meta-item"
                    >⏱️ {{ chronicles[currentStory].duration }}</span
                  >
                </div>
              </header>

              <div class="story-body">
                <div class="story-text">
                  {{ chronicles[currentStory].content }}
                </div>

                <!-- 故事引语 -->
                <blockquote
                  class="story-quote"
                  v-if="chronicles[currentStory].quote"
                >
                  {{ chronicles[currentStory].quote }}
                </blockquote>
              </div>

              <!-- 故事控制 -->
              <footer class="story-controls">
                <button
                  class="control-btn prev-btn"
                  @click="prevStory"
                  :disabled="currentStory === 0"
                  aria-label="上一则纪事"
                >
                  <span class="btn-icon">←</span>
                  <span class="btn-text">前尘</span>
                </button>

                <div class="story-pagination">
                  <span class="current-page">{{ currentStory + 1 }}</span>
                  <span class="page-separator">/</span>
                  <span class="total-pages">{{ chronicles.length }}</span>
                </div>

                <button
                  class="control-btn next-btn"
                  @click="nextStory"
                  :disabled="currentStory === chronicles.length - 1"
                  aria-label="下一则纪事"
                >
                  <span class="btn-text">后续</span>
                  <span class="btn-icon">→</span>
                </button>
              </footer>
            </article>
          </transition>
        </div>
      </section>

      <!-- 物品展示区域 -->
      <section id="artifacts" class="stellar-card artifacts-card">
        <div class="card-header">
          <div class="header-icon">🗃️</div>
          <h2 class="card-title">星海遗物 · 记忆载体</h2>
          <div class="header-line"></div>
        </div>

        <div class="artifacts-grid">
          <article
            v-for="artifact in artifacts"
            :key="artifact.id"
            class="artifact-item"
          >
            <div class="artifact-image">
              <img
                :src="artifact.image"
                :alt="artifact.name"
                loading="lazy"
                decoding="async"
              />
              <div class="image-overlay"></div>
            </div>
            <div class="artifact-content">
              <h3 class="artifact-name">{{ artifact.name }}</h3>
              <p class="artifact-type">{{ artifact.type }}</p>
              <p class="artifact-desc">{{ artifact.description }}</p>
              <div class="artifact-significance">
                <span class="sig-icon">💫</span>
                <span class="sig-text">{{ artifact.significance }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- 星海彩蛋 · 隐藏细节 -->
      <section id="easter-eggs" class="stellar-card eggs-card">
        <div class="card-header">
          <div class="header-icon">🔍</div>
          <h2 class="card-title">星海彩蛋 · 隐藏细节</h2>
          <div class="header-line"></div>
        </div>

        <!-- 彩蛋网格 -->
        <div class="eggs-grid">
          <article
            v-for="detail in characterDetails"
            :key="detail.id"
            class="egg-item"
            :class="`egg-category-${detail.category}`"
          >
            <div class="egg-header">
              <div class="egg-icon">{{ detail.icon }}</div>
              <div class="egg-titles">
                <h3 class="egg-title">{{ detail.title }}</h3>
                <span class="egg-category">{{ detail.category }}</span>
              </div>
              <div class="egg-number">
                #{{ detail.id.toString().padStart(2, "0") }}
              </div>
            </div>

            <div class="egg-content">
              <p class="egg-desc">{{ detail.content }}</p>
              <div class="egg-significance">
                <span class="sig-icon">✨</span>
                <span class="sig-text">{{ detail.significance }}</span>
              </div>
            </div>

            <!-- 根据类别添加特殊装饰 -->
            <div class="egg-decoration" v-if="detail.id === 4">
              <div class="heart-trail">
                <div class="heart-piece piece-1"></div>
                <div class="heart-piece piece-2"></div>
                <div class="heart-piece piece-3"></div>
              </div>
            </div>

            <div class="egg-decoration" v-if="detail.id === 5">
              <div class="butterfly-pair">
                <div class="butterfly butterfly-blue"></div>
                <div class="butterfly butterfly-purple"></div>
              </div>
            </div>

            <div class="egg-decoration" v-if="detail.id === 8">
              <div class="flower-glyph">桔梗</div>
            </div>
          </article>
        </div>

        <!-- 彩蛋提示 -->
        <div class="eggs-footer">
          <div class="footer-note">
            <span class="note-icon">💡</span>
            <span class="note-text"
              >这些细节如同星海中散落的微光，共同织构出守岸人完整的形象</span
            >
          </div>
        </div>
      </section>
    </main>

    <!-- 页面底部 -->
    <footer class="stellar-footer" role="contentinfo">
      <div class="footer-content">
        <div class="footer-echo">
          <div class="echo-line"></div>
          <p class="echo-text">潮声不止 · 守望不息</p>
          <div class="echo-line"></div>
        </div>
        <p class="footer-meta">
          守岸人星域档案库 ·
          <span class="meta-year">纪元 {{ currentYear }}</span> ·
          <span class="meta-author">记录者：霜落天亦</span>
        </p>
      </div>
    </footer>

    <!-- 浮动星光装饰 -->
    <div class="floating-stars">
      <div
        v-for="star in floatingStars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

// ========== 基础数据与状态 ==========
const currentYear = new Date().getFullYear();
const currentStory = ref(0);
const activeChain = ref<number | null>(null);

// ========== 共鸣链数据 ==========
const resonanceChains = [
  {
    title: "不语者假想",
    desc: "星域范围与持续时间显著增强",
    effect: "星域范围+150%，持续时间+10秒，施放洞悉不结束星域",
  },
  {
    title: "夜幕的赠予与拒绝",
    desc: "浅析星域获得额外攻击增益",
    effect: "浅析星域新增效果：队伍攻击提升40%",
  },
  {
    title: "无限正将我等待",
    desc: "共鸣解放能量回复增强",
    effect: "施放共鸣解放时额外回复20点协奏能量，25秒触发一次",
  },
  {
    title: "万物寂静满溢",
    desc: "共鸣技能治疗效果大幅提升",
    effect: "施放共鸣技能时，治疗效果加成提升70%",
  },
  {
    title: "来自缄默的回声",
    desc: "牵引范围扩展",
    effect: "普攻第三段牵引范围+50%，共鸣回路牵引范围+30%",
  },
  {
    title: "我所驶向的新世界",
    desc: "变奏技能伤害质变",
    effect: "变奏洞悉伤害倍率+42%，暴击伤害提升500%",
  },
];

const chronicles = [
  {
    id: "1",
    title: "最初的守岸人",
    duration: "创生纪元",
    content: `击鼓之后，我们将黑暗中舞动的心脏称做月亮。这月亮主要由你构成。

有的生命诞生于偶然，有的，则出于某种必然。

世界在凛冽中迈入死寂，必将经历那个时刻的人们将希望交付给那个人。他们祝福{TA}，愿{TA}替他们抵达那个足够温暖的未来。只是那过程可能艰辛、漫长、孤独，{TA}需要能够补全残响的介质，还需要足以跨越时间的维系，而为{TA}准备好足以应付所有情况的工具，就是他们能为{TA}做的最后一件事。必然性的理由就此出现，他们以“锚点”吸附回音能量，聚合成淡蓝色的茧状晶体。

守岸人，在意识存在之前，在理解如何做到之前，它就已经知道了自己需要完成的一切。

但除了被赋予的使命，工具的启用还需要一位下达指令的人。

那之后的很长一段时间里，它都在没有实质的空白中等待着。

直至海潮涌向尽头，咸涩的湿气中，它隐约感受到靠得越来越近的心跳。

万籁俱寂，调律者环视所在的大地，悲鸣间歇性的咆哮变得渺远，黑夜里隐现的唯有{TA}如鼓般的心声。

大地之下，或许会需要一片同样璀璨的星空……{TA}这样思考着，确立了想要构建的岸基，却在启动泰缇斯之前，先一步触及那块自己也不知道有何用处的晶体。频率引发共振，晶体就此解构，内里的能量物质喷涌着，像恒星诞生时抛出的星云，又像破茧而出的“蝴蝶”。

“蝴蝶”翩跹，持续喷涌的能量织构出更多的部分，它以少女的姿态显现，对“唤醒”自己的生命做出回应。

“我是守岸人，因你而被制造出的工具。”

“我将承载您的需要，满足您的指令。我会帮助你和泰缇斯推演悲鸣的本源。”

刚刚化作人形的守岸人以无起伏的语调阐明情况，却迟迟没有等到对方下达更为具体的指令。

“守岸人……保守秘密、守护不受侵蚀的岸基。听起来言简意赅，但一点都不像名字。”

“工具无所谓名字，指代而已，并不影响我完成指令。”

面面相对，调律者微微皱眉，像不知该如何回应般没再言语，守岸人看对方金色的眼眸溢出某种她无法识别的情绪。

但最终，那位调律者只是以一句柔和的喟叹打破了沉默。

“……好吧，我们还有很多时间来讨论这件事。”`,
    quote: "我是守岸人，因你而被制造出的工具。",
  },
  {
    id: "2",
    title: "比活着更重要的",
    duration: "探索纪元",
    content: `白日的梦游者，看见了夜里的太阳。

作为演算核心被限制在地下之前，守岸人也曾去过黑海岸外的其他地方。

文明逐渐发展，调律者以“黑海岸”为组织命名，吸纳更多成员，守岸人则以复现的方式解析成员们带回的残响，完成推演。

复现出的索诺拉中，守岸人保持着全知的观察者视角，只要她想，她可以随时溯源数据看到任意人类的行为和反应。她试图像归纳其他事物那样，对人类进行总结和解读，但她发现她做不到。人类，令她困惑。

为什么快乐和痛苦时都会落泪，为什么想要的和所做的截然相反，为什么知道会后悔还是要尝试，为什么知道不可能还是不放弃，为什么能毫不避讳地伤害他人又义无反顾地牺牲自己……完全没有能被总结出的范式，每当守岸人以为自己更接近本质，就会有意想不到的实例颠覆她的既有结论。她困惑，但她同样疑惑这种困惑是否有意义，说到底，这其实并不影响她完成自己的指令。但偏偏，守岸人收到了调律者的提议，已知区域有出现局部性悲鸣爆发的先兆，他们要一起前往，回收足够支撑解析的数据……顺带，看看还能做些什么。

正好是作物成熟的季节，守岸人跟着调律者走在那片区域的乡野，土地看着松软踩上去却很扎实，垂下腰的麦穗颗粒饱满，风吹过都是稻谷的熟香。这些名词，不，或许该说这些事物的解释她是完全掌握了的，但现在它们变得很陌生，很不一样……守岸人因感知到的感受愣神，全然不知自己的神情和第一次踏出家门的孩童一般新奇、讶异。调律者和当地人热络地聊着，讲述和掺杂俚语的家常闹哄哄挤在一起，好心的老妇人递来自家的吃食，她的皮肤粗粝，怀中抱着的婴儿手指却汗津津的。

但泰缇斯的推演从不出错，先兆很快应验，灾厄降临吞噬了原有的一切。

还是先前见过的那些人，他们恐慌、哀嚎，他们推搡着抢夺物资，神情狠戾……也是第一次，守岸人没有透过复现出的索诺拉观察人类的反应，置身于悲鸣爆发的瞬间，直观而真实地看着人类本身，看到人类本身。

出乎守岸人预料的还有调律者，{TA}带领所有共鸣者一同抵御残象，鼓励大家坚持到申请的支援到来。{TA}……在试图扭转既定的结局，但为什么要为素昧平生的大家做到这种程度，泰缇斯明明说过——

“已被改变的明天注定是要被改变的，我们不应尝试改变既定的节点。”

“我做不到无动于衷。如果这就是通往明天的必要代价，我质疑那样的明天是否还有前往的必要。”

“……无法理解。但不论如何，我会以你的需要为先。”

黑发金眸的身影旁，守岸人以自身为源不断展开星域，弥散疗愈和守护的力量。

夜幕低垂，支援终于赶到。准备离去之际，两人却被一个失去双亲的孩子拦住去路。

“等、等等，你们要去哪？我想和你们一起……对付那些坏家伙！”

望着孩子亮亮的眼睛，调律者蹲下身，指了指自己身上的黑花。

“我们现在要做的事，对你来说还太危险。但如果等你长大，还想像我们一样，那就来找戴有这种花的人吧。”

船行渐远，望着仍在渡口向他们挥手的孩子，守岸人似乎已经习惯对人类感到的困惑，但她开始尝试向身侧之人表达这种困惑。

“泰缇斯并没给出推演，那个孩子不是我们需要的成员。”

“不一定非要等泰缇斯下达指令，人类不是这样被限制的存在。况且，只是现在不是，至于以后……他会自己找到答案。”

“可以选择的自由，远比答案更重要。这也是我想给你的东西。”

“我希望你能亲自看看、亲自感受这些。我们不是数据，也不是存在记录中的某种概念，你可以考虑将我们当作同伴。”

“当作同伴……”守岸人无意识重复着句尾的话语，她不知道，正如调律者所说，{TA}给出的不是指令也不是答案，但自那一刻起，她的心中涌现出一种隐秘的、连她自己都尚未意识到的期待——人类，真是相当复杂的生物……我还是不懂人类，但我希望，我可以懂。`,
    quote: "我希望你能亲自看看、亲自感受这些。我们可以是同伴。",
  },
  {
    id: "3",
    title: "比等待更漫长的",
    duration: "守望纪元",
    content: `别为我叹息，我不在那里，也没有离去。

听小机器人们提到德罗涅这个名字的时候，守岸人几乎没花什么时间就回忆起了和这个名字有关的全部信息。这不仅因为能量体适应存储、记录的特质，也因为德罗涅很特别——她是为数不多自己找到黑海岸来请求加入的成员。

明快爽朗的少女热血沸腾，一边抱怨着自己多不容易找来这里，一边带着点小得意地挑眉，“我就知道！为了阻止悲鸣带来更多的异象，一定会有人聚集起来做些什么的！”

那时候，曾掌握最高权限的调律者还没漂泊太久，她也还会在黑海岸地上活动。看着少女兴致满满一把抓住自己的手，恳切地表达着想要加入的决心，守岸人一时间竟不知道怎么反应，只觉得少女的手热热的、烫烫的，和少女眼里的温度一样。

守岸人为德罗涅申请了成员考核的资格，这其实不符合泰缇斯推演判定的招募流程，但没来由地，守岸人回忆起起调律者曾对自己说过的那句话，“人类不是这样被限制的存在……我们不是数据，也不是存在记录中的某种概念”。守岸人想，如果是{TA}的话应该也会这样做吧，为了不让少女的那份温度冷却。后来，德罗涅通过了考核，正式成为了黑海岸的一员。

所以守岸人没有想过，再和德罗涅相见会是在这样的情况之下。

时隔十多年，曾经热血的少女已经长成了沉着冷静的女人，她冲着到来的守岸人颤巍巍伸出手，被洞穿的腹部汩汩往外流血。守岸人看得出来，德罗涅的生命在流失，属于她的结局只有一个。

“别看我现在这样，悲鸣爆发的时候，可是一口气解决了八个残象呢。但特瓦拉……他们运气不太好，收集到的残像数据只能由我带回来啦。”

送别的氛围渐渐浓厚，在场的其他成员们神情肃穆，并不知晓守岸人身份的他们只当她是与德罗涅特别亲近的朋友，自发将最后的时间留给两人。

“原来时间已经过去这么久了，我，我都……但你还和之前一样。”

“我做得很好吧？没让你失望吧？”

德罗涅的声音因虚弱显得有些抖，但眼睛依旧像第一次见面时那样亮。如果是调律者{TA}会怎么做？不知道，没有答案，甚至没有可以参考的范例，守岸人只知道对上那双眼睛，自己的胸口就闷闷的，仿佛有一种她无法形容的感受要从那里长出来。那感受迫使她像多年前那样，再一次做出破例的举动。

“辛苦了，你做得很好。非常非常好。”

她回答了女人，并主动握住对方的手，下意识地，她觉得对方会需要自己做出这样的动作，当时的她不想让少女的温度冷却，现在的她也是一样。

“谢谢你……谢谢你，守岸人。”

像是得到了莫大的安慰一般，女人整个人都松弛下来，开始发出断断续续的呓语，“星星……真亮啊，我之后也会变成它们中一颗么……还有很多我无法看见了，但你会看见的，他们会看见的。”

一滴泪从眼眶滑落，带走了女人的最后一丝温度。

是的，正如德罗涅所说，每一个逝去成员的频率都会被守岸人化作“星星”留在那片由数据映射出的星河之中。她不记得自己是从什么时候开始这样做的了，但时间催折的不仅黑花，潮汐侵蚀的不止海岸，逝去的成员们需要被铭记，这片永远闪耀的星空就是唯一一块埋人的土地。

而群星之下，守岸人站在被星光照拂的黑海岸上远眺，调律者将权限交给自己是否是正确的选择？她所做的一切是否已经足够？她有像{TA}叮嘱的那样，照顾好黑海岸吗？等待太过漫长……可她只能等待，因为她所拥有的，只有比漫长更漫长的时间。`,
    quote: "谢谢你……谢谢你，守岸人。",
  },
  {
    id: "4",
    title: "始于漫响回环",
    duration: "重构纪元",
    content: `我给你我设法保全的自己的核心——不营字造句，不和梦交易，不被时间、欢乐和逆境触动的核心。

只是事后的补救对真正遭受那一切的人是不够的，不愿像之前那样在悲鸣爆发后收集数据、平复已发生的危机，调律者试图从根源上阻止悲鸣的发生，{TA}带领守岸人和其他黑海岸成员给出预警、采取干预，但他们成功的次数十不足一。

为了跳出莫比乌斯的循环，为了真正拥有已知之外的可能性，调律者提出了一个方案。

为此，别离将至。

调律者决定舍弃记忆，去黑海岸之外的地方漂泊。而跟随{TA}一直走到现在的其他人，理所应当地、毫不犹豫地，跟随{TA}的脚步做出了相同的选择。

只有守岸人留在了原地。

但不要紧，因为存在只有留在原地的人才能做到的事情。黑海岸选择的方向违背了泰缇斯系统以悲鸣预测悲鸣的算法，必须有辅助转译和演算的核心，而接受了调律者让渡权限的守岸人就是最合适的存在。

每个人都做出了自己的选择，守岸人也一样。她发挥能量体最基础的作用，化为介质，任所有流入泰缇斯的悲鸣数据流经她的核心。从此每次解析，每次复现与溯源的过程，她都不再是旁观者，而是切身遭受与数据中相同灾难的亲历者。

沉重。抵触。枯竭。坏死。

惊惶的鸟扑楞楞落下，空洞的眼睛死死地瞪着大地。

苦难。混乱。失去。消亡。

零落的花被碾出汁液，僵化的双手保留着抓取的动作，姿势扭曲。

惊惧。憎恶。愤怒。怨恨。

裂纹从某一点开始延伸，变成断裂的截面，咔啦、咔啦，碎裂的声音不断从体内响起。

痛苦？痛苦……痛苦，痛苦！

已经发生的一切、正在发生的一切、假定发生的一切全部汇聚在她这一点。她变得黯淡，变得不再平整，她能感受到自己身体是怎样碎裂、怎样一块块脱落的。

没有关系的，对工具而言只有还能使用和不能使用的差别，会坏掉是很正常的。只是能量体而已，能量消散之后，还会再有被重新聚合的实体，还可以有下一个完好的守岸人。

没有关系的。

就像那些被既定的选择一样，你也是莫比乌斯中的一环，漂泊之人不知道，但你一直清楚吧，这是他们赋予你使命时，为你定下的结局。

所以……为什么不舍？

这就是……不舍吗？

“第一次出去之后，我注意到了你的变化。”

“你不再笃定被泰缇斯告知一切，你感到困惑，并学会说出自己的困惑。”

“但你的那些问题，我似乎很少正面回答，就像我说的，我希望你会找到自己的答案。可这个问题不一样，在我们……再见之前，我想告诉你我的想法。”

“这片海岸意味着什么？作为拥有最高权限的管理者，这时候我也许该讲一些振奋人心的话，但我想说的却是，我希望这片海岸能成为每个成员的家。”

“它是我们的起点，而我们是彼此的同伴。现在是，之后也一直是。”

所以……怎么会没有关系。

那个在星夜下被你唤醒的是我。

那个因为你而显现出现在形态的是我。

那个和你一起漫步在乡野的人是我。

那个被你告诉要自己寻找答案的是我。

那个保守秘密、守护岸基、延续这座海岸、等待你回来的人是我。

不是其他的能量体，不是其他的人，是我啊。

用来束缚和限制的回环，骤然停滞。她从将使一切溺亡的数据海中挣脱出来，大口大口喘息着。不想失去那些，不想停留在这里，不想要这样消散，因为、因为——

我是守岸人。

是因你而诞生的守岸人。

是被你视作同伴的守岸人。

是拥有了这些全部经历、记忆、感受而逐渐被丰满的守岸人。

是……因为你才变得独一无二的守岸人。`,
    quote: "我是守岸人。是因你而诞生的守岸人。",
  },
  {
    id: "5",
    title: "最后的守岸人",
    duration: "新生纪元",
    content: `你就像黑夜，拥有寂静与群星。

漫长的等待以和漂泊之人的重逢告终，{TA}如期回到这座海岸。尽管失去了记忆，但{TA}的选择还是和从前一样，他们一起矫正了泰缇斯的错误，将安息归还给噬亡星中的人们。

但比起纯粹的喜悦，此时内心或许还掺杂着称作迷惘的情绪，他们赋予的也好，泰缇斯下达的也好，调律者告诉自己的也好，已经知道的路就到此为止了，那么尽头之后呢……守岸人看着喧闹着庆祝的成员们，悄声离去，不知不觉间，她又来到那片自己熟悉的海岸线。

像先前每一次一样，守岸人不带任何目的地在这条海岸线上散步，那是等待漂泊的调律者回到黑海岸时养成的习惯。睡眠对她没有太多意义，她更宁愿睁着眼睛看海岸上存在的事物，回忆时间叠加在它们身上的痕迹，毕竟……当漂泊之人回到这片海岸，至少会需要一位记得所有的守望者。

这次散步，似乎和以往没什么不同。地底的昼夜仍不流转，一抬头，可以望到的还是那片星空。但前路从脚下不断延伸，翻涌的浪潮中，守岸人朝那并不能真正望见的尽头伸出手——她很确信有什么已经改变，就像是，尽管她现在还不完全明晰该做些什么，要做些什么，尽管她现在的状态似乎和等待被启用的原始状态一样，空白无措，但她已经能毫不困惑地分清两者之间的差异。

可以选择的自由，终于真正来到了她自己手中，这世界是他们的，也同样是她的。

“填满它吧，用你想要的一切。“

“填满它吧。”

“填满它吧。”

“填满它吧。”

所有曾被她指引的星星仿佛都在发出无声低吟，它们静默地注视着她，也照耀着她，鼓舞她朝触手可得的新开始迈进。

脚步声渐渐靠近，那个陪守岸人从最开始一路走到现在的同伴，总是第一时间注意到她微小的情绪。{TA}走近她，又一次来到她的身边。

而这一次，她决定做两人中率先打破沉默的那个。

“我的名字……你曾说我们会有很多时间来讨论这件事。”

“所以你已经想好了吗？”

“守岸人，这就是我的名字。不是保守秘密、守护岸基的意思，而是说，守望着漂泊之人的人。”

“它代表着从过去到现在，所有构成我的部分，而未来……我希望……在属于我们的故事里，我可以是你漂泊之后停驻的海岸。”

“以及……”少女说着露出微笑，少有地卖了个关子“那些我们一起弹奏过的旋律，我以它们为基础创作了一首曲子。”

“我也为它起了名字，那个名字……下次演奏的时候，再告诉你吧？”

`,
    quote: "守岸人，这就是我的名字。守望着漂泊之人的人。",
  },
];
import foodImg from "./img/food.webp";
import item1Img from "./img/item1.webp";
import item2Img from "./img/item2.webp";
import item3Img from "./img/item3.webp";
// ========== 物品数据 ==========
const artifacts = [
  {
    id: 1,
    name: "雪烩浓汤",
    type: "记忆味道",
    image: foodImg,
    description:
      "守岸人为了复制记忆中那人带来的温度所制作的浓汤，带有海鲜的鲜甜和牛奶的醇厚。",
    significance: "简单却扎实的幸福感",
  },
  {
    id: 2,
    name: "陨坏死星",
    type: "生命碎片",
    image: item1Img,
    description: "从守岸人体内剥离出的碎裂晶体，因能量耗尽而呈现死寂状态。",
    significance: "过去与更迭的明证",
  },
  {
    id: 3,
    name: "周期时计",
    type: "时间赠礼",
    image: item2Img,
    description:
      "漂泊者制作的计时装置，以42天为周期，展示一场兴盛与湮灭的交替。",
    significance: "有限与无限的集合",
  },
  {
    id: 4,
    name: "我们唱片",
    type: "回声载体",
    image: item3Img,
    description:
      "由附有回音能量的介质制成的唱片，收录了星球上所有的声音与旋律。",
    significance: "存在留下的痕迹",
  },
];
const chroniclesRef = ref<HTMLElement | null>(null);

function prevStory() {
  if (currentStory.value > 0) {
    currentStory.value--;
    chroniclesRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function nextStory() {
  if (currentStory.value < chronicles.length - 1) {
    currentStory.value++;
    chroniclesRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
// ========== 彩蛋与细节数据 ==========
const characterDetails = [
  {
    id: 1,
    category: "场景彩蛋",
    icon: "🎹",
    title: "漂泊的终点",
    content: "场景代码：yuehuifuben，钢琴位置坐标：(0,0,0)",
    significance: "浪漫的坐标原点",
  },
  {
    id: 2,
    category: "角色设定",
    icon: "💎",
    title: "胸口晶体",
    content: "胸口的晶体不是声痕，是核心外露的能力裂痕",
    significance: "力量本质的显现",
  },
  {
    id: 3,
    category: "语音彩蛋",
    icon: "🎂",
    title: "生日祝福",
    content: "岸宝生日祝福语音中说过送的晶体是她身体的一部分",
    significance: "最珍贵的赠礼",
  },
  {
    id: 4,
    category: "战斗细节",
    icon: "💖",
    title: "平A轨迹",
    content: "岸宝平A身体划过的轨迹是一个爱心形状",
    significance: "无声的温柔",
  },
  {
    id: 5,
    category: "视觉设计",
    icon: "🦋",
    title: "大招蝴蝶",
    content: "岸宝大招的两只蝴蝶一只是蓝色一只是暗紫色，与岸宝和阿漂的配色一致",
    significance: "羁绊的象征",
  },
  {
    id: 6,
    category: "台词联动",
    icon: "💬",
    title: "命运回响",
    content: "阿漂：'为我所用' / 岸宝：'我将为你所用'",
    significance: "命运的回应",
  },
  {
    id: 7,
    category: "战斗机制",
    icon: "⚡",
    title: "共鸣加成",
    content: "阿漂在岸宝大招里会额外获得10%共鸣效率",
    significance: "特殊的羁绊加成",
  },
  {
    id: 8,
    category: "NPC彩蛋",
    icon: "🌸",
    title: "桔梗之约",
    content: "岸宝钢琴下方有概率刷新名为'桔梗'的NPC，桔梗花语：永恒的爱",
    significance: "永恒的守望",
  },
  {
    id: 9,
    category: "登录彩蛋",
    icon: "💺",
    title: "相伴而坐",
    content: "在漂泊的终点钢琴附近下线，再次上线时会坐在岸宝旁边",
    significance: "永远的陪伴",
  },
  {
    id: 10,
    category: "必听语音",
    icon: "🎧",
    title: "突破语音",
    content: "没听过岸宝突破5语音的，罚你听一万遍",
    significance: "不可错过的感动",
  },
];

// ========== 浮动星光 ==========
interface FloatingStar {
  id: number;
  style: {
    top: string;
    left: string;
    width: string;
    height: string;
    animationDelay: string;
  };
}

const floatingStars = ref<FloatingStar[]>([]);

function initFloatingStars() {
  const stars: FloatingStar[] = [];
  const starCount = 15;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      id: i,
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`,
        animationDelay: `${Math.random() * 5}s`,
      },
    });
  }

  floatingStars.value = stars;
}

// ========== 星空Canvas ==========
const starsCanvas = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number | null = null;

function initStarsCanvas() {
  const canvas = starsCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 设置画布尺寸
  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // 创建星星
  const stars: Array<{
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
  }> = [];

  const starCount = 50;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 1.5,
      speed: 0.1 + Math.random() * 0.3,
      opacity: 0.3 + Math.random() * 0.7,
    });
  }

  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制星星
    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 233, 223, ${star.opacity})`;
      ctx.fill();

      // 添加光晕
      const gradient = ctx.createRadialGradient(
        star.x,
        star.y,
        0,
        star.x,
        star.y,
        star.size * 3
      );
      gradient.addColorStop(0, `rgba(79, 233, 223, ${star.opacity * 0.5})`);
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.fillRect(
        star.x - star.size * 3,
        star.y - star.size * 3,
        star.size * 6,
        star.size * 6
      );
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  return () => {
    window.removeEventListener("resize", resizeCanvas);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}

// ========== 生命周期 ==========
onMounted(() => {
  initFloatingStars();
  const cleanup = initStarsCanvas();

  return () => {
    if (cleanup) cleanup();
  };
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped lang="scss">
/* 守岸人主题变量 */
.shouanren-page {
  --color-deep-space: #020f19;
  --color-stellar-blue: #0a1a2a;
  --color-tidal-blue: #0f2b3f;
  --color-star-cyan: #4fe9df;
  --color-star-blue: #7fbfff;
  --color-mist-light: #e6f7ff;
  --color-echo-glow: #a6e9ff;
  --color-crystal-pink: #ff79c6;

  --gradient-space: linear-gradient(
    180deg,
    var(--color-deep-space) 0%,
    var(--color-stellar-blue) 70%
  );
  --gradient-tidal: linear-gradient(
    180deg,
    transparent,
    rgba(15, 43, 63, 0.4) 30%,
    rgba(15, 43, 63, 0.2)
  );
  --gradient-card: linear-gradient(
    135deg,
    rgba(10, 26, 42, 0.8),
    rgba(15, 43, 63, 0.6)
  );

  min-height: 100vh;
  background: var(--gradient-space);
  color: var(--color-mist-light);
  font-family: "Inter", "Noto Sans SC", system-ui, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* 星域背景层 */
.stellar-background {
  position: fixed;
  inset: 0;
  z-index: 0;

  .nebula-layer {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 20% 30%,
        rgba(79, 233, 223, 0.05) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 70%,
        rgba(127, 191, 255, 0.03) 0%,
        transparent 50%
      );
    opacity: 0.4;
  }

  .tidal-layer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: var(--gradient-tidal);
    mask-image: linear-gradient(to top, black 20%, transparent);
  }

  .starlight-layer {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        1px at 20% 20%,
        rgba(255, 255, 255, 0.8) 1px,
        transparent 2px
      ),
      radial-gradient(
        1px at 60% 60%,
        rgba(127, 191, 255, 0.7) 1px,
        transparent 2px
      );
    background-size: 200px 200px, 300px 300px;
    opacity: 0.08;
    animation: stars-drift 120s linear infinite;
  }
}

/* 星空Canvas */
.stars-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.6;
}

/* 主容器 */
.stellar-container {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 60px;
}

/* HERO 区域 */
.stellar-hero {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 40px;
  align-items: center;
  padding: 40px;
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(127, 191, 255, 0.1);
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 60%,
      rgba(79, 233, 223, 0.03)
    );
    z-index: -1;
  }
}

/* 星辉徽章 */
.stellar-emblem {
  position: relative;
  width: 120px;
  height: 120px;

  .emblem-core {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle at 30% 30%,
      var(--color-star-cyan),
      var(--color-star-blue) 70%,
      transparent 90%
    );
    filter: blur(1px);
    animation: core-pulse 6s ease-in-out infinite;

    .core-glow {
      position: absolute;
      inset: -15px;
      background: radial-gradient(
        circle,
        var(--color-star-cyan) 0%,
        transparent 70%
      );
      opacity: 0.3;
      filter: blur(20px);
      animation: glow-breathe 8s ease-in-out infinite;
    }

    .core-ripple {
      position: absolute;
      inset: 0;
      border: 1px solid rgba(127, 191, 255, 0.3);
      border-radius: 50%;
      animation: ripple-expand 3s ease-out infinite;
    }
  }

  .emblem-orbits {
    position: absolute;
    inset: 0;

    .orbit {
      position: absolute;
      border: 1px solid rgba(79, 233, 223, 0.15);
      border-radius: 50%;

      &.orbit-1 {
        inset: -20px;
        animation: orbit-rotate 20s linear infinite;
      }

      &.orbit-2 {
        inset: -40px;
        animation: orbit-rotate 30s linear infinite reverse;
      }
    }
  }
}

/* 英雄内容区域 */
.hero-content {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .character-name {
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    font-weight: 800;
    line-height: 1;
    margin: 0;

    .name-main {
      background: linear-gradient(
        135deg,
        var(--color-mist-light),
        var(--color-star-cyan)
      );
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
    }

    .name-sub {
      font-size: 0.5em;
      color: var(--color-star-blue);
      font-weight: 400;
      letter-spacing: 0.3em;
      margin-top: 10px;
      display: block;
    }
  }

  .title-divider {
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 10px 0;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(79, 233, 223, 0.5),
        transparent
      );
    }

    .divider-star {
      color: var(--color-star-cyan);
      font-size: 1.2rem;
    }
  }

  .character-title {
    font-size: 1.2rem;
    color: var(--color-echo-glow);
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.1em;
  }
}

/* 共鸣标签 */
.resonance-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  .tag {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;

    &.primary {
      background: rgba(79, 233, 223, 0.15);
      color: var(--color-star-cyan);
      border: 1px solid rgba(79, 233, 223, 0.3);

      &:hover {
        background: rgba(79, 233, 223, 0.25);
        transform: translateY(-2px);
      }
    }

    &.secondary {
      background: rgba(127, 191, 255, 0.1);
      color: var(--color-star-blue);
      border: 1px solid rgba(127, 191, 255, 0.2);
    }

    &.tertiary {
      background: rgba(166, 233, 255, 0.08);
      color: var(--color-echo-glow);
      border: 1px solid rgba(166, 233, 255, 0.15);
    }
  }
}

/* 英雄引言 */
.hero-quote {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: rgba(15, 43, 63, 0.3);
  border-radius: 12px;
  border-left: 3px solid var(--color-star-cyan);


  .quote-text {
    margin: 0;
    line-height: 1.6;
    color: rgba(230, 247, 255, 0.9);
    font-style: italic;
  }
}

/* 人物立绘 */
.hero-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;

  .portrait-frame {
    position: relative;
    width: 200px;
    height: 300px;
    border-radius: 16px;
    overflow: hidden;

    .portrait-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.9) contrast(1.1);
      transition: transform 0.5s ease;
    }

    .portrait-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at center,
        transparent 30%,
        rgba(79, 233, 223, 0.1) 70%
      );
      pointer-events: none;
    }

    .portrait-border {
      position: absolute;
      inset: 0;
      border: 2px solid rgba(127, 191, 255, 0.2);
      border-radius: 16px;
      pointer-events: none;
    }

    &:hover .portrait-image {
      transform: scale(1.05);
    }
  }

  .portrait-caption {
    font-size: 0.9rem;
    color: var(--color-star-blue);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-align: center;
  }
}

/* 卡片通用样式 */
.stellar-card {
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(127, 191, 255, 0.1);
  padding: 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-star-cyan),
      transparent
    );
    opacity: 0.5;
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;

  .header-icon {
    font-size: 1.5rem;
    color: var(--color-star-cyan);
  }

  .card-title {
    font-size: 1.8rem;
    margin: 0;
    color: var(--color-mist-light);
    font-weight: 700;
  }

  .header-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--color-star-cyan), transparent);
    opacity: 0.3;
  }
}

/* 机制卡片 */
.mechanism-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.mechanism-item {
  background: rgba(15, 43, 63, 0.4);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(79, 233, 223, 0.1);
  transition: all 0.3s ease;

  &.highlight {
    background: rgba(79, 233, 223, 0.1);
    border-color: rgba(79, 233, 223, 0.3);
  }

  &.wide {
    grid-column: 1 / -1;
  }

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(79, 233, 223, 0.4);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .item-icon {
    font-size: 2rem;
    color: var(--color-star-cyan);
    margin-bottom: 10px;
  }

  .item-title {
    font-size: 1.2rem;
    color: var(--color-star-cyan);
    margin: 0 0 10px;
    font-weight: 600;
  }

  .item-desc {
    color: rgba(230, 247, 255, 0.9);
    line-height: 1.6;
    margin: 0;
  }

  .domain-stage {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(127, 191, 255, 0.1);
    margin: 0 5px;
    color: var(--color-star-blue);
    font-weight: 500;
  }

  .domain-note {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 15px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border-left: 3px solid var(--color-star-cyan);

    .note-icon {
      color: var(--color-star-cyan);
    }
  }
}

/* 连招网格 */
.combo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;

  .combo-item {
    h4 {
      color: var(--color-star-blue);
      margin: 0 0 10px;
      font-size: 1rem;
    }

    .combo-code {
      display: block;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      font-family: "Courier New", monospace;
      color: var(--color-echo-glow);
      overflow-x: auto;
    }

    .skill-abbr {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      span {
        padding: 5px 10px;
        background: rgba(127, 191, 255, 0.1);
        border-radius: 4px;
        font-size: 0.9rem;
      }
    }
  }
}

/* 背景卡片 */
.background-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.background-item {
  .item-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;

    .label-icon {
      font-size: 1.5rem;
      color: var(--color-star-cyan);
    }

    h3 {
      font-size: 1.4rem;
      margin: 0;
      color: var(--color-mist-light);
      font-weight: 600;
    }
  }

  .item-content {
    p {
      color: rgba(230, 247, 255, 0.9);
      line-height: 1.7;
      margin: 0 0 15px;
    }

    .origin-quote {
      padding: 15px;
      margin: 20px 0;
      border-left: 3px solid var(--color-star-cyan);
      background: rgba(79, 233, 223, 0.05);
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: var(--color-echo-glow);
    }

    .appearance-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;

      .detail-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: rgba(127, 191, 255, 0.05);
        border-radius: 6px;

        .detail-icon {
          color: var(--color-star-blue);
        }
      }
    }
  }
}

/* 状态卡片 */
.status-content {
  .status-alert {
    display: flex;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 12px;
    border-left: 4px solid #ff6b6b;
    margin-bottom: 20px;

    .alert-icon {
      font-size: 1.5rem;
      color: #ff6b6b;
      flex-shrink: 0;
    }

    .alert-text {
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin: 0;
    }
  }

  .status-details {
    p {
      color: rgba(230, 247, 255, 0.9);
      line-height: 1.7;
      margin: 0 0 15px;
    }

    .status-note {
      display: flex;
      gap: 10px;
      padding: 15px;
      background: rgba(79, 233, 223, 0.08);
      border-radius: 8px;
      border-left: 3px solid var(--color-star-cyan);

      .note-icon {
        color: var(--color-star-cyan);
        flex-shrink: 0;
      }
    }
  }
}

/* 共鸣链时间线 */
.chain-timeline {
  padding: 20px;

  .timeline-track {
    position: relative;

    .track-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 40px;
      width: 2px;
      background: linear-gradient(
        to bottom,
        transparent,
        var(--color-star-cyan),
        transparent
      );
    }

    .track-nodes {
      position: relative;
      z-index: 2;
    }
  }
}

.chain-node {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    .node-card {
      transform: translateX(10px);
      border-color: rgba(79, 233, 223, 0.4);
    }
  }

  &.node-active {
    .node-marker .marker-core {
      background: var(--color-star-cyan);
      box-shadow: 0 0 20px var(--color-star-cyan);
    }
  }
}

.node-marker {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;

  .marker-core {
    position: absolute;
    inset: 0;
    background: rgba(79, 233, 223, 0.3);
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .marker-ring {
    position: absolute;
    inset: -10px;
    border: 2px solid rgba(79, 233, 223, 0.2);
    border-radius: 50%;
    animation: ring-pulse 3s ease-in-out infinite;
  }

  .node-number {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    z-index: 2;
  }
}

.node-card {
  flex: 1;
  background: rgba(15, 43, 63, 0.4);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(79, 233, 223, 0.2);
  transition: all 0.3s ease;

  .chain-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .chain-title {
      font-size: 1.3rem;
      color: var(--color-star-cyan);
      margin: 0;
      font-weight: 600;
    }

    .chain-level {
      font-size: 0.9rem;
      color: var(--color-star-blue);
      padding: 4px 12px;
      background: rgba(127, 191, 255, 0.1);
      border-radius: 12px;
    }
  }

  .chain-desc {
    color: rgba(230, 247, 255, 0.9);
    margin: 0 0 15px;
    line-height: 1.6;
  }

  .chain-effect {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: rgba(79, 233, 223, 0.08);
    border-radius: 6px;
    border-left: 3px solid var(--color-star-cyan);

    .effect-icon {
      color: var(--color-star-cyan);
    }

    .effect-text {
      color: var(--color-echo-glow);
      font-size: 0.95rem;
    }
  }
}

.story-content {
  background: rgba(15, 43, 63, 0.3);
  border-radius: 12px;
  padding: 30px;
  border: 1px solid rgba(127, 191, 255, 0.1);

  .story-header {
    margin-bottom: 25px;

    .story-title {
      font-size: 1.8rem;
      color: var(--color-mist-light);
      margin: 0 0 10px;
      font-weight: 700;
    }

    .story-meta {
      display: flex;
      gap: 20px;

      .meta-item {
        color: var(--color-star-blue);
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
  }

  .story-body {
    .story-text {
      color: rgba(230, 247, 255, 0.95);
      line-height: 1.8;
      margin-bottom: 25px;
      white-space: pre-wrap;
      &::first-letter {
        font-size: 2em;
        color: var(--color-star-cyan);
        font-weight: bold;
        float: left;
        margin-right: 8px;
        line-height: 1;
      }
    }

    .story-quote {
      padding: 20px;
      margin: 30px 0;
      border-left: 3px solid var(--color-star-cyan);
      background: rgba(79, 233, 223, 0.05);
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: var(--color-echo-glow);
      font-size: 1.1rem;
      line-height: 1.6;
    }
  }

  .story-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid rgba(127, 191, 255, 0.1);

    .control-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(15, 43, 63, 0.5);
      border: 1px solid rgba(127, 191, 255, 0.2);
      border-radius: 8px;
      color: var(--color-star-blue);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: rgba(30, 65, 100, 0.7);
        border-color: var(--color-star-cyan);
        color: var(--color-star-cyan);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-icon {
        font-size: 1.2rem;
      }

      .btn-text {
        font-weight: 500;
      }
    }

    .story-pagination {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;

      .current-page {
        color: var(--color-star-cyan);
        font-weight: 700;
      }

      .page-separator {
        color: var(--color-star-blue);
      }

      .total-pages {
        color: rgba(230, 247, 255, 0.7);
      }
    }
  }
}

/* 纪事过渡动画 */
.story-fade-enter-active,
.story-fade-leave-active {
  transition: all 0.4s ease;
}

.story-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.story-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 物品展示 */
.artifacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.artifact-item {
  background: rgba(15, 43, 63, 0.4);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(127, 191, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(79, 233, 223, 0.3);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  .artifact-image {
    position: relative;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent,
        rgba(10, 26, 42, 0.8)
      );
    }

    &:hover img {
      transform: scale(1.1);
    }
  }

  .artifact-content {
    padding: 20px;

    .artifact-name {
      font-size: 1.3rem;
      color: var(--color-mist-light);
      margin: 0 0 8px;
      font-weight: 600;
    }

    .artifact-type {
      font-size: 0.9rem;
      color: var(--color-star-blue);
      margin: 0 0 15px;
      font-weight: 500;
    }

    .artifact-desc {
      color: rgba(230, 247, 255, 0.9);
      line-height: 1.6;
      margin: 0 0 15px;
      font-size: 0.95rem;
    }

    .artifact-significance {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: rgba(79, 233, 223, 0.08);
      border-radius: 6px;
      border-left: 3px solid var(--color-star-cyan);

      .sig-icon {
        color: var(--color-star-cyan);
      }

      .sig-text {
        color: var(--color-echo-glow);
        font-size: 0.9rem;
        font-style: italic;
      }
    }
  }
}

/* 页面底部 */
.stellar-footer {
  margin-top: 60px;
  padding: 30px 20px;
  background: rgba(2, 15, 25, 0.5);
  border-top: 1px solid rgba(127, 191, 255, 0.1);
  backdrop-filter: blur(5px);

  .footer-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .footer-echo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 15px;

    .echo-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(79, 233, 223, 0.3),
        transparent
      );
    }

    .echo-text {
      font-size: 1.1rem;
      color: var(--color-star-cyan);
      font-weight: 500;
      white-space: nowrap;
    }
  }

  .footer-meta {
    font-size: 0.9rem;
    color: rgba(230, 247, 255, 0.6);

    .meta-year {
      color: var(--color-star-blue);
    }

    .meta-author {
      color: rgba(127, 191, 255, 0.8);
    }
  }
}

/* 浮动星光 */
.floating-stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 5;

  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
    animation: star-twinkle 3s ease-in-out infinite;

    &::before {
      content: "";
      position: absolute;
      inset: -3px;
      background: inherit;
      border-radius: inherit;
      filter: blur(3px);
      opacity: 0.5;
    }
  }
}

/* 关键帧动画 */
@keyframes stars-drift {
  0% {
    background-position: 0 0, 100px 100px;
  }
  100% {
    background-position: 200px 200px, 300px 300px;
  }
}

@keyframes core-pulse {
  0%,
  100% {
    transform: scale(1);
    filter: blur(1px);
  }
  50% {
    transform: scale(1.05);
    filter: blur(1.5px);
  }
}

@keyframes glow-breathe {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

@keyframes ripple-expand {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes orbit-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes ring-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .stellar-hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 30px;

    .stellar-emblem {
      margin: 0 auto;
    }

    .hero-portrait {
      order: -1;
    }
  }

  .hero-content {
    .title-divider {
      justify-content: center;
    }

    .resonance-tags {
      justify-content: center;
    }
  }

  .chain-node {
    flex-direction: column;
    gap: 20px;
    align-items: center;
    text-align: center;

    .node-card {
      text-align: left;
    }
  }

  .timeline-track {
    .track-line {
      left: 50% !important;
      transform: translateX(-50%);
    }
  }
}

@media (max-width: 768px) {
  .stellar-container {
    padding: 15px;
    padding-top: 40px;
  }

  .stellar-hero {
    padding: 25px;
  }

  .stellar-card {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .header-line {
      display: none;
    }
  }

  .mechanism-grid {
    grid-template-columns: 1fr;
  }

  .background-grid {
    grid-template-columns: 1fr;
  }

  .artifacts-grid {
    grid-template-columns: 1fr;
  }

  .story-controls {
    flex-direction: column;
    gap: 15px;

    .control-btn {
      width: 100%;
      justify-content: center;
    }
  }

  .floating-stars {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero-portrait .portrait-frame {
    width: 150px;
    height: 225px;
  }

  .character-name {
    font-size: 2rem !important;
  }

  .stellar-card {
    padding: 15px;
  }
}

/* 彩蛋卡片样式 */
.eggs-card {
  position: relative;
  overflow: visible;

  &::after {
    content: "";
    position: absolute;
    top: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: radial-gradient(
      circle,
      rgba(79, 233, 223, 0.1) 0%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(10px);
    z-index: 0;
  }
}

/* 彩蛋网格 */
.eggs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.egg-item {
  background: rgba(15, 43, 63, 0.4);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(127, 191, 255, 0.1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(79, 233, 223, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(79, 233, 223, 0.1);

    .egg-header .egg-icon {
      transform: scale(1.2) rotate(5deg);
    }
  }

  /* 按类别区分边框颜色 */
  &.egg-category-场景彩蛋 {
    border-left: 3px solid #ff79c6;
  }

  &.egg-category-角色设定 {
    border-left: 3px solid #4fe9df;
  }

  &.egg-category-语音彩蛋 {
    border-left: 3px solid #f1fa8c;
  }

  &.egg-category-战斗细节 {
    border-left: 3px solid #ff6b6b;
  }

  &.egg-category-视觉设计 {
    border-left: 3px solid #bd93f9;
  }

  &.egg-category-台词联动 {
    border-left: 3px solid #8be9fd;
  }

  &.egg-category-战斗机制 {
    border-left: 3px solid #50fa7b;
  }

  &.egg-category-NPC彩蛋 {
    border-left: 3px solid #ffb86c;
  }

  &.egg-category-登录彩蛋 {
    border-left: 3px solid #57c7ff;
  }

  &.egg-category-必听语音 {
    border-left: 3px solid #ff5555;
  }
}

.egg-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;

  .egg-icon {
    font-size: 1.8rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    transition: transform 0.3s ease;
  }

  .egg-titles {
    flex: 1;

    .egg-title {
      font-size: 1.2rem;
      color: var(--color-mist-light);
      margin: 0 0 5px;
      font-weight: 600;
    }

    .egg-category {
      font-size: 0.8rem;
      color: var(--color-star-blue);
      padding: 2px 8px;
      background: rgba(127, 191, 255, 0.1);
      border-radius: 4px;
    }
  }

  .egg-number {
    font-size: 0.9rem;
    color: rgba(230, 247, 255, 0.4);
    font-family: "Courier New", monospace;
    font-weight: 700;
  }
}

.egg-content {
  .egg-desc {
    color: rgba(230, 247, 255, 0.9);
    line-height: 1.6;
    margin: 0 0 15px;
    font-size: 0.95rem;
  }

  .egg-significance {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(79, 233, 223, 0.08);
    border-radius: 6px;
    border-left: 3px solid var(--color-star-cyan);

    .sig-icon {
      color: var(--color-star-cyan);
    }

    .sig-text {
      color: var(--color-echo-glow);
      font-size: 0.9rem;
      font-style: italic;
    }
  }
}

/* 特殊装饰 */
.egg-decoration {
  position: absolute;
  pointer-events: none;

  .heart-trail {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;

    .heart-piece {
      position: absolute;
      background: rgba(255, 107, 107, 0.6);
      border-radius: 50%;
      animation: heart-float 3s ease-in-out infinite;

      &.piece-1 {
        width: 8px;
        height: 8px;
        top: 0;
        left: 16px;
        animation-delay: 0s;
      }

      &.piece-2 {
        width: 6px;
        height: 6px;
        top: 8px;
        left: 8px;
        animation-delay: 0.3s;
      }

      &.piece-3 {
        width: 6px;
        height: 6px;
        top: 8px;
        right: 8px;
        animation-delay: 0.6s;
      }
    }
  }

  .butterfly-pair {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 50px;
    height: 30px;

    .butterfly {
      position: absolute;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      animation: butterfly-flutter 2s ease-in-out infinite;

      &.butterfly-blue {
        background: linear-gradient(45deg, #4fe9df, #7fbfff);
        top: 0;
        left: 0;
        animation-delay: 0s;
      }

      &.butterfly-purple {
        background: linear-gradient(45deg, #bd93f9, #6272a4);
        bottom: 0;
        right: 0;
        animation-delay: 0.5s;
      }
    }
  }

  .flower-glyph {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
    color: #ffb86c;
    font-family: "Noto Serif SC", serif;
    font-weight: 700;
    opacity: 0.7;
    transform: rotate(-10deg);
  }
}

/* 彩蛋页脚 */
.eggs-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(127, 191, 255, 0.1);

  .footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px;
    background: rgba(15, 43, 63, 0.3);
    border-radius: 10px;

    .note-icon {
      font-size: 1.2rem;
      color: var(--color-star-cyan);
    }

    .note-text {
      color: rgba(230, 247, 255, 0.8);
      font-size: 0.95rem;
      font-style: italic;
    }
  }
}

/* 装饰动画 */
@keyframes heart-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
}

@keyframes butterfly-flutter {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(5deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(3px) rotate(-5deg);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .eggs-grid {
    grid-template-columns: 1fr;
  }

  .egg-header {
    flex-wrap: wrap;

    .egg-titles {
      order: 3;
      width: 100%;
      margin-top: 10px;
    }
  }
}

@media (max-width: 480px) {
  .egg-item {
    padding: 15px;
  }

  .filter-tag {
    font-size: 0.8rem;
    padding: 5px 10px;
  }
}
</style>