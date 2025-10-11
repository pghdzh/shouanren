<template>
  <div class="megumi-page" aria-live="polite">
    <main class="container" ref="mainContainer">
      <!-- HERO 区域 -->
      <header class="hero" role="banner">
        <div class="left-col">
          <button class="avatar-card">
            <picture class="avatar-wrap">
              <img
                src="@/assets/images1/slty1 (8).webp"
                alt="守岸人 头像"
                class="avatar"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div class="avatar-meta">
              <span class="avatar-badge">共鸣能力：叙响织构</span>
            </div>
          </button>
        </div>
        <div class="right-col" ref="metaCard">
          <div class="hero-panel">
            <h1 class="name">
              守岸人 <span class="jp">（黑海岸的守望者）</span>
            </h1>
            <p class="subtitle">
              回声为灯，潮汐为路，她在黑海岸静守每一个迷途的誓言。
            </p>
            <p class="lead">
              神秘清冷、超然物外。她因你的唤醒而生，在漫长的守望中萌生出情感和渴望——守护与世界，与你之间的羁绊。
            </p>
          </div>
        </div>
      </header>

      <!-- 内容卡片区 -->
      <section id="personality" class="card personality">
        <div class="card-head">
          <h2>核心机制</h2>
        </div>
        <ul class="traits">
          <li>
            【实论数据】：角色血量上方上限为5的特殊能量条，达到上限后施放重击演绎或空中攻击衍变消耗全部【实论数据】。
          </li>
          <li>
            【星域】：施放共鸣解放终末回环展开的领域。根据队伍中使用变奏技能的次数，变为不同的星域：浅析星域（蓝色）→
            深潜星域（紫色）→
            解限星域（金色），累计获得回血／暴击提升／暴伤提升的效果。在解限星域中施放变奏技能时会替换成洞悉。需要守岸人拥有
            250% 共鸣效率才能获得最高收益。
          </li>
          <li style="font-weight: bold">输出流程：</li>
          <li>基础流程：A-A-A-A-Z —（可切人）— A-A-A-A-Z-E-Q-R</li>
          <li>
            守岸人闪避反击收益极高，蹭到一个或两个闪第二段可以直接 E-Q-R
            启动，EQR 大致有四分之一的协奏圈。
          </li>
          <li>
            技能缩写：普攻 = A，重击 = Z，共鸣技能 = E，共鸣解放 = R，声骸 = Q
          </li>
        </ul>
      </section>

      <section id="overview" class="card overview">
        <div class="card-head">
          <h2>角色背景与形象</h2>
        </div>
        <div class="two-col">
          <div class="text-block">
            <h3>背景</h3>
            <p>
              沉眠于黑海岸地中星河下的生命体，身体构造、生平年龄均不详。在泰缇斯系统高度抽象化的代码语言中，“守岸人”这个名字还有着“保守秘密者”的意义，但她仍然选择了“守岸人”作为她的名字，用以守望离开这片海岸的漂泊他乡之人
              第二实例，即守岸人，通体由高纯度回音能量晶体构成，其核心诞生于世界在凛冽中迈入死寂之时，诞生于人们对漂泊者的希望与助力，人们以“锚点”吸附回音能量，聚合成那淡蓝色的茧状晶体。守岸人，在意识存在之前，在理解如何做到之前，它就已经知道了自己需要完成的一切。但除了被赋予的使命，工具的启用还需要一位下达指令的人。那之后的很长一段时间里，它都在没有实质的空白中等待着，直到被漂泊者触及之刻，二者的频率引发共振，晶体就此解构，内里的能量物质喷涌着，化作蝴蝶，最终织构出少女的姿态，守岸人便诞生了。
            </p>
          </div>
          <div class="text-block">
            <h3>外貌／着装</h3>
            <p>
              守岸人蓝发紫眼，头上戴着左蓝右白的头巾，头巾的内侧闪耀深蓝的光辉，海蓝的短发是两绺垂至胸前的鬓发，胸口处存在一道向外延伸的晶体裂痕，微光闪烁，它既像被包裹着的果核，又像跳动着的心脏，内里涌动的是守岸人生命本源的力量。守岸人身着一件蓝白色的连衣短裙，连衣裙的背后与胸口有着大面积的镂空，裙子两侧有着两条长长的深蓝色裙带。守岸人手上指甲是蓝色的，双手中指上系有别着小花的白色缎带，带子缠绕她纤细的双手；脚上穿着白色坡跟凉鞋，鞋跟样式好似波浪，脚趾上的指甲也是蓝色的。
            </p>
          </div>
        </div>
      </section>

      <section id="resonance-status" class="card overview">
        <div class="card-head">
          <h2>共鸣状况</h2>
        </div>
        <div class="two-col">
          <div class="text-block">
            <p>
              守岸人的测试结果基本处可控区间，但体内回音能量多次呈溃散态，存在损耗过度、晶体碎裂脱落的情况。本机推测为海算解析悲鸣数据所致。值得关注的是，守岸人同样发现了这一情况，会使用全新能量晶体替换自身受损部分，进行缓解。推断其肩臂和小腿处的弦状波痕，为愈合后遗留的裂口痕迹。不排除再度发生此类情况的可能，或需提高对能量体的检测和替换频次。如测试结果超出可控区间，则有必要采用其他备用方案。
            </p>
          </div>
        </div>
      </section>

      <!-- 新增三大主题区域 -->
      <section id="food" class="card special-section">
        <div class="card-head">
          <h2>雪烩浓汤</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <!-- 预留图片插槽 -->
            <img
              src="./img/food.webp"
              alt="雪烩浓汤"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>
              守岸人喜欢的一种浓汤，不需要什么昂贵特殊的食材，直接用沿岸现有的海鲜就能做成，秘诀在于醇厚的牛奶和炖煮得够久的时间。
            </p>
            <p>
              鲜少有人知道的是，这是守岸人为了复制记忆中那人带来的温度所做。她按照相同做法和步骤，却在一次次的尝试中，摸索出自己的味道。现煮的浓汤带有海鲜的鲜甜，佐以烤好的面包片，一碗下去，热意向四肢百骸蔓延……或许，这就是那人曾告诉她的简单却扎实的幸福感。
            </p>
          </div>
        </div>
      </section>
      <section id="shattered-crystal" class="card special-section">
        <div class="card-head">
          <h2>陨坏死星</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <!-- 预留图片插槽 -->
            <img
              src="./img/item1.webp"
              alt="陨坏死星"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>从守岸人体内剥离出的碎裂晶体，此时因能量耗尽而呈现死寂状态。</p>
            <p>
              浪潮褪去，群星给出了自己的答案，守岸人也决定面对应尽的使命。以身为介，不断重演的悲鸣几乎使她摧折。她将黯淡失色的部分从体内剥离，又捕获全新的回音，凝成晶体，填补自身的缺口。
            </p>
            <p>
              割舍部分的自己，以换取另一部分的延续……航行中的忒修斯之船，目睹自身的更迭，并拾取弃用的碎片。那是她的过去，也是她存在至今的明证。
            </p>
          </div>
        </div>
      </section>

      <section id="cyclic-clock" class="card special-section">
        <div class="card-head">
          <h2>周期时计</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <img
              src="./img/item2.webp"
              alt="周期时计"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>
              黑海岸地下，群星在永无止息的夜空高悬，时间流转，却没有四季的分别。为使正流逝的一切更容易被实际感知，漂泊者仿照沙漏外形制作了这款自运行的计时装置，赠予守岸人。
            </p>
            <p>
              装置运行无需手动倒转，内里的能量介质会以42天为周期，在一上一下的对称结构中回旋跌宕、循环往复。42天，足够装置透过杯壁展示一场兴盛与湮灭的交替，正对应泰缇斯系统进行一次完形、推演的标准周期。漂泊者以“42”这一包含了有限与无限集合的数字，在守岸人的漫长使命手动划下句点，为她的等待提供些许慰藉。
            </p>
          </div>
        </div>
      </section>

      <section id="collective-album" class="card special-section">
        <div class="card-head">
          <h2>“我们”唱片</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <img
              src="./img/item3.webp"
              alt="我们 唱片"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>一张由附有回音能量的介质制成的唱片，有着近乎无限的存储空间。</p>
            <p>
              唱片收录了守岸人能搜集到的所有这颗星球的声音，风雨雷雪、鸟鸣鲸歌，来自不同年代的音乐，已知超过50种语言的元音字句……发声是存在留下的痕迹，亦是存在本身，它们代表着这颗星球上有或曾有过的生命、科学和文明。
            </p>
            <p>
              当前，守岸人将漂泊者与自己合奏的旋律视作两人留下的痕迹，收录在唱片的最末段。但只要记录者仍在，只要还有发声，这张唱片的内容就会一直更新下去。
            </p>
          </div>
        </div>
      </section>

      <section
        id="timeline"
        class="card timeline"
        aria-labelledby="timeline-heading"
      >
        <div class="card-head">
          <h2 id="timeline-heading">共鸣链详解 · 提升</h2>
        </div>
        <div class="tl-wrap" role="list">
          <div class="vl" aria-hidden="true"></div>
          <ol class="tl-list">
            <li
              v-for="(ev, i) in timeline"
              :key="i"
              class="tl-item"
              role="listitem"
              tabindex="0"
              :aria-label="``"
            >
              <div class="tl-card">
                <h3 class="tl-title">第 {{ i + 1 }} 链 · {{ ev.title }}</h3>
                <p class="tl-desc">{{ ev.desc }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const timeline = ref([
  {
    title: "不语者假想",
    desc: `共鸣解放终末回环展开的星域获得加强：治疗和增益效果生效范围增加150%。持续时间增加10秒。施放变奏技能洞悉后不再结束星域。`,
  },
  {
    title: "夜幕的赠予与拒绝",
    desc: `浅析星域新增额外效果：队伍中的角色攻击提升 40%。`,
  },
  {
    title: "无限正将我等待",
    desc: `施放共鸣解放时，守岸人额外回复 20 点协奏能量，每 25 秒触发一次。`,
  },
  {
    title: "万物寂静满溢",
    desc: `施放共鸣技能时，治疗效果加成提升 70%。`,
  },
  {
    title: "来自缄默的回声",
    desc: `普攻第三段牵引范围 +50%，共鸣回路牵引范围 +30%。`,
  },
  {
    title: "我所驶向的新世界",
    desc: `变奏技能洞悉伤害倍率 +42%。施放变奏洞悉时，暴击伤害提升 500%。`,
  },
]);

const reducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

onMounted(() => {
  if (!reducedMotion) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".avatar-card", {
      duration: 0.8,
      y: 18,
      opacity: 0,
      scale: 0.99,
    }).from(
      ".right-col > .hero-panel .name",
      { duration: 0.9, x: 24, opacity: 0 },
      "-=0.45"
    );

    gsap.utils.toArray(".tl-item").forEach((it: any, idx: number) => {
      gsap.from(it.querySelector(".tl-card"), {
        scrollTrigger: {
          trigger: it,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 22,
        duration: 0.7,
        delay: idx * 0.06,
      });
    });

    gsap.to(".avatar-card", {
      scale: 1.007,
      duration: 2.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  } else {
    document.documentElement.classList.add("reduced-motion");
  }
});
</script>

<style scoped lang="scss">
.megumi-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #2a5f8f 0%, #487db2 60%, #8bbcd8 100%);
  /* 更偏向深海 — 渐变从深蓝到浅蓝 */
  font-family: "Noto Sans SC", system-ui, -apple-system, "Segoe UI", Roboto,
    Arial;
  color: #eef2f7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: clamp(20px, 4vw, 80px);
  box-sizing: border-box;
  padding-top: 60px;

  &.reduced-motion * {
    transition: none !important;
    animation: none !important;
  }

  .container {
    position: relative;
    z-index: 10;
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(12px, 2vw, 40px);
  }
}

/* ========== HERO 区域 ========== */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: start;
  padding: 12px;
  margin-bottom: 12px;

  .left-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .avatar-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 12px;
    display: grid;
    justify-items: center;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
    width: 100%;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35);
    }
  }

  .avatar-wrap {
    width: 100%;
    display: block;
  }

  .avatar {
    width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    border: 3px solid rgba(255, 255, 255, 0.7);
    transition: transform 0.5s ease;
  }

  .avatar-card:hover .avatar {
    transform: translateY(-4px) scale(1.01);
  }

  .avatar-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .avatar-badge {
    font-size: 0.9rem;
    color: #f0e9e1;
    background: rgba(0, 0, 0, 0.25);
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hero-panel {
    position: relative;
    z-index: 9;
    padding: 20px;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.16);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
  }

  .name {
    font-size: clamp(1.8rem, 3vw, 2.8rem);
    margin: 0;
    background: linear-gradient(90deg, #b3e5fc 0%, #ffffff 50%, #e1f5fe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    font-weight: 900;
    letter-spacing: 1px;
    display: inline-block;
    -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.2);
  }

  .jp {
    font-size: 0.95rem;
    color: #cfd8dc;
    margin-left: 8px;
    font-weight: 400;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 1.1rem;
    color: #e0f7fa;
    font-weight: 600;
    line-height: 1.4;
  }

  .lead {
    margin: 10px 0 0;
    color: #cfd8dc;
    line-height: 1.7;
    max-width: 72ch;
  }
}

/* ========== 通用卡片 ========== */
.card {
  margin-top: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  color: #eef2f7;
  border: 1px solid rgba(255, 255, 255, 0.15);
  
  &:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.45);
    transition: transform 0.28s ease;
  }

  h2 {
    margin: 0 0 12px 0;
    font-size: 1.3rem;
    color: #e3f2fd;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
}

/* personality 列表样式 */
.personality .traits li {
  padding: 12px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.25);
  font-size: 1rem;
  color: #dce4e8;
}

/* overview 双栏布局 */
.overview .two-col {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.overview .text-block {
  flex: 1 1 40%;
  min-width: 240px;
  line-height: 1.6;
}

/* special-section：三大主题区公共布局 */
.special-section {
  position: relative;
  overflow: hidden;

  .content {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-top: 16px;
  }

  .img-area {
    flex: 0 0 200px;

    img {
      width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
    }
  }

  .text-block {
    flex: 1;
    line-height: 1.6;
  }
}

/* timeline 样式（略微调整色调） */
.timeline {
  position: relative;

  .tl-wrap {
    position: relative;
    padding: 24px 12px 12px 96px;
  }

  .vl {
    position: absolute;
    left: 80px;
    top: 32px;
    bottom: 20px;
    width: 4px;
    border-radius: 6px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.1)
    );
    box-shadow: 0 6px 18px rgba(255, 255, 255, 0.1),
      inset 0 0 10px rgba(255, 255, 255, 0.05);
    opacity: 0.9;
  }

  .tl-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .tl-item {
    position: relative;
    display: flex;
    gap: 18px;
    align-items: flex-start;
    margin: 20px 0;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
  }

  .tl-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    width: calc(100% - 130px);
    border-left: 4px solid transparent;
    transition: transform 0.28s ease, box-shadow 0.28s ease,
      border-color 0.28s ease;
    position: relative;
    z-index: 2;
  }

  .tl-item:hover .tl-card,
  .tl-item:focus-within .tl-card {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    border-left-color: rgba(255, 255, 255, 0.3);
  }

  .tl-title {
    margin: 0 0 6px 0;
    font-size: 1.1rem;
    color: #f1f8fc;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .tl-desc {
    margin: 0;
    color: #d8e6ef;
    white-space: pre-wrap;
  }
}

/* 小屏响应式调整 */
@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 8px;
  }

  .avatar-card {
    width: 140px;
    padding: 8px;
  }

  .hero-panel {
    padding: 14px;
  }

  .name {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .lead {
    font-size: 0.95rem;
  }

  .card {
    padding: 18px;
    border-radius: 12px;
  }

  .overview .two-col {
    flex-direction: column;
  }

  .special-section .content {
    flex-direction: column;
  }

  .timeline {
    /* 取消可能的 overflow 隐藏 */
    overflow: visible;
  }
  .timeline .tl-wrap {
    padding-left: 14px !important;
    padding-right: 14px; /* 也给右边留出 padding */
    /* 如果 tl-wrap 是 flex 子项，强制可压缩 */
    min-height: 0;
  }
  .timeline .vl {
    display: none !important;
  }
  .timeline .tl-list {
    /* 保证列表不被挤出 */
    overflow: visible;
  }
  .timeline .tl-item {
    display: block !important;
    margin: 14px 0 !important;
    width: 100%;
  }
  .timeline .tl-card {
    width: 100% !important;
    padding: 14px !important;
    border-left: 0 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    transform: none !important;
  }
}
</style>
