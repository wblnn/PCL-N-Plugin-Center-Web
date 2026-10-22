<template>
  <div ref="root" class="home-page">
    <!-- ============ HERO ============ -->
    <section class="hero-card">
      <p class="hero-badge hero-anim d1"><i aria-hidden="true"></i>{{ en ? '2.0 ALPHA · OFFICIALLY NAMED NEXACL' : '2.0 ALPHA · 已正式命名 NEXACL' }}</p>
      <h1 class="hero-anim d2">{{ en ? 'The Minecraft launcher that asks less from you.' : '一个更省心的 Minecraft 启动器。' }}</h1>
      <p class="hero-sub hero-anim d3">{{ en ? 'NexaCL 2.0 — the next generation of PCL N. Instances, Java, accounts, resources and updates: whatever can be automated is automated. You only make the choices that matter.' : 'NexaCL 2.0，PCL N 的下一代。实例、Java、账号、资源和更新，能自动处理的都交给启动器，你只做真正需要选择的事。' }}</p>
      <div class="hero-actions hero-anim d4">
        <router-link class="hero-btn hero-btn-solid" to="/download">{{ en ? 'Download 2.0 Alpha' : '下载 2.0 Alpha' }} <span aria-hidden="true">↓</span></router-link>
        <router-link class="hero-btn hero-btn-ghost" to="/changelog">{{ en ? 'What’s new' : '看看新在哪' }} <span aria-hidden="true">›</span></router-link>
      </div>
      <p class="hero-version hero-anim d5" v-if="latestVersion">{{ en ? 'Current build' : '当前测试版本' }} <code>{{ latestVersion }}</code> · {{ en ? 'Windows / macOS / Linux' : '三大平台 · x64 与 ARM64' }}</p>
      <div class="product-stage hero-anim d6">
        <div class="product-window" role="img" :aria-label="en ? 'Illustration of the NexaCL launcher layout' : 'NexaCL 启动器布局示意'">
          <div class="window-caption"><span><img src="/pcln.png" alt="">NexaCL</span><span class="window-controls" aria-hidden="true">−　□　×</span></div>
          <div class="window-body"><div class="window-rail" aria-hidden="true"><span class="active">▷</span><span>▧</span><span>▦</span><span>⚙</span></div>
            <div class="window-account"><div class="mock-label">{{ en ? 'Profile' : '档案' }}<span>＋</span></div><div class="player-mark" aria-hidden="true"><span></span><i></i></div><strong>Player</strong><small>{{ en ? 'Offline profile' : '离线档案' }}</small><div class="mock-chip">{{ en ? 'Switch profile' : '切换档案' }}　⌄</div></div>
            <div class="window-right"><div class="window-version"><div class="mock-label">{{ en ? 'Version' : '版本' }}<span>☷</span></div><div class="version-detail"><div class="grass-block" aria-hidden="true">▧</div><div><strong>1.21.1</strong><small>Minecraft Java Edition</small></div><span>›</span></div><div class="mock-launch">▷　{{ en ? 'Launch game' : '启动游戏' }}</div></div><div class="window-about"><span class="about-mark">N</span><div><strong>NexaCL</strong><p>{{ en ? 'Your next game starts here.' : '下一次游戏，从这里开始。' }}</p></div></div></div>
          </div>
        </div>
        <p class="product-caption">{{ en ? 'Interface illustration. The Alpha interface may change.' : '界面示意。Alpha 版本的界面仍会调整。' }}</p>
      </div>
    </section>

    <!-- ============ STATS ============ -->
    <section class="home-section stats reveal" :aria-label="en ? 'By the numbers' : '数字一览'">
      <div class="stats-strip work-panel">
        <div class="stat"><b data-count="3">0</b><span>{{ en ? 'major platforms — Windows, macOS, Linux' : '个大平台 · Windows / macOS / Linux' }}</span></div>
        <div class="stat"><b data-count="6">0</b><span>{{ en ? 'native build targets, x64 and ARM64' : '组原生构建 · x64 与 ARM64' }}</span></div>
        <div class="stat"><b data-count="4">0</b><span>{{ en ? 'Java generations matched automatically (8–25)' : '个 Java 世代自动匹配（8–25）' }}</span></div>
        <div class="stat"><b data-count="1">0</b><span>{{ en ? 'click upgrade from 1.4.x to 2.0' : '键升级 · 从 1.4.x 到 2.0' }}</span></div>
      </div>
    </section>

    <!-- ============ BENTO FEATURES ============ -->
    <section class="home-section reveal">
      <div class="section-head center"><p class="eyebrow">{{ en ? 'Why you will like it' : '为什么你会喜欢它' }}</p><h2>{{ en ? 'The chores are ours. The game is yours.' : '把麻烦留给启动器，把游戏留给你。' }}</h2><p>{{ en ? 'Twelve things NexaCL handles for you every day.' : '下面这十二件事，NexaCL 每天都替你处理。' }}</p></div>
      <div class="bento stagger">
        <article class="work-panel tile t-launch">
          <div class="launch-steps" aria-hidden="true"><span>{{ en ? 'Find instances' : '查找实例' }}</span><i>→</i><span>{{ en ? 'Pick Java' : '选择 Java' }}</span><i>→</i><span>{{ en ? 'Prepare assets' : '准备资源' }}</span><i>→</i><span>{{ en ? 'Watch process' : '记录进程' }}</span></div>
          <div class="tile-icon">▷</div><h3>{{ en ? 'Launch Minecraft' : '启动 Minecraft' }}</h3>
          <p>{{ en ? 'Pick a profile and a version — the launcher finds local instances, resolves version inheritance, matches the right Java, prepares assets, and keeps watching the process so crashes are traceable.' : '选好档案和版本就好。启动器会找到本地实例、处理版本继承、配好合适的 Java、准备资源依赖，并在游戏运行期间持续记录进程状态，崩溃有迹可循。' }}</p>
        </article>
        <article class="work-panel tile"><div class="tile-icon">☕</div><h3>{{ en ? 'Java? Handled.' : 'Java？不用你管。' }}</h3><p>{{ en ? 'A built-in runtime catalog covers Java 8 / 17 / 21 / 25, downloaded on demand and matched to each game version. No more hunting for paths.' : '内置 Java 运行时目录，覆盖 8 / 17 / 21 / 25 常见世代，按需自动下载、按游戏版本自动匹配，告别手动找路径。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">⇩</div><h3>{{ en ? 'Cut off? Keep going.' : '断网了？接着下。' }}</h3><p>{{ en ? 'Interrupted downloads resume, large files arrive in parallel segments, and a failing source is swapped automatically.' : '下载中断可以续传，大文件分段并行，来源失效自动切换，慢网络也能把东西完整拿回来。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">↻</div><h3>{{ en ? 'Updates, minus the fuss.' : '更新，少折腾。' }}</h3><p>{{ en ? 'It picks a full package or a smaller patch for you, verifies every file before installing, and upgrades 1.4.x straight to 2.0.' : '完整包还是小补丁，它替你决定；每个文件先验证再安装；1.4.x 可以直接升到 2.0。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">☺</div><h3>{{ en ? 'Accounts and looks.' : '账号和外观。' }}</h3><p>{{ en ? 'Microsoft, Yggdrasil and LittleSkin sign-in, with skins, capes and the LittleSkin closet filling in. Credentials stay out of public state.' : 'Microsoft、Yggdrasil、LittleSkin 三种登录，皮肤、披风与 LittleSkin 衣柜持续补齐，凭据不进公开状态。' }}</p></article>
        <article class="work-panel tile t-drop">
          <div class="tile-icon">⤓</div><h3>{{ en ? 'Drop it in. Done.' : '拖进来，就能装。' }}</h3>
          <p>{{ en ? 'Drag files onto the window — imports run as transactions, so a failure changes nothing.' : '把文件拖到窗口上即可安装。导入以事务执行，失败不会留下半成品。' }}</p>
          <div class="chip-row"><span>MRPACK</span><span>CurseForge ZIP</span><span>{{ en ? 'Mod JARs' : '模组 JAR' }}</span><span>Forge / NeoForge / OptiFine</span><span>{{ en ? 'Game folders (inherited import)' : '游戏文件夹（继承导入）' }}</span></div>
        </article>
        <article class="work-panel tile"><div class="tile-icon">▦</div><h3>{{ en ? 'Mods, organized.' : '模组，管得清楚。' }}</h3><p>{{ en ? 'Filter by category, toggle in place, check verified compatible updates, and search resources without leaving the launcher.' : '分类筛选、就地启停、更新前校验兼容性，资源目录直接搜索，不用离开启动器。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">↩</div><h3>{{ en ? 'Broke it? Roll back.' : '装坏了？退回来。' }}</h3><p>{{ en ? 'A successful launch records a baseline snapshot. Review the diff and roll back item by item, or in one click.' : '成功启动即记录基线快照，出问题可查看差异清单，逐条或一键回滚到上次的正常状态。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">⧗</div><h3>{{ en ? 'Progress in view.' : '进度，看得见。' }}</h3><p>{{ en ? 'One task center for downloads and installs: stage-by-stage progress, pause and cancel, persisted checkpoints that resume after a restart.' : '下载与安装统一进任务中心：阶段化进度、可暂停可取消，检查点持久化，重启后接着跑。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">✦</div><h3>{{ en ? 'A brand-new interface.' : '全新的界面。' }}</h3><p>{{ en ? 'New window, navigation and launch page, with fluid motion, reduced-motion support and accessibility wired in.' : '新窗口、新导航、新启动页，动效流畅、支持减少动态效果、无障碍已接入。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">🔒</div><h3>{{ en ? 'Yours stays yours.' : '你的东西是你的。' }}</h3><p>{{ en ? 'Credentials are protected by the system keyring, telemetry is transparent and never collects log bodies, and game data stays local.' : '凭据由系统钥匙串保护，遥测透明、不采集日志正文，游戏数据始终留在本地。' }}</p></article>
        <article class="work-panel tile"><div class="tile-icon">⌘</div><h3>{{ en ? 'Community, open source.' : '社区开发，开源。' }}</h3><p>{{ en ? 'Apache-2.0 licensed and built by the community. Every line is public; feedback lands straight on GitHub.' : 'Apache-2.0 许可，由社区开发。每行代码公开，反馈直达 GitHub。' }}</p><a class="tile-link" :href="NEXA_GITHUB" target="_blank" rel="noreferrer">GitHub ↗</a></article>
      </div>
    </section>

    <!-- ============ PRODUCT LINE ============ -->
    <section class="home-section reveal">
      <div class="section-head center"><p class="eyebrow">{{ en ? 'The name has landed' : '名字已定' }}</p><h2>{{ en ? 'NexaCL. Right now.' : 'NexaCL，就是现在。' }}</h2><p>{{ en ? 'From PCL N to NexaCL: the next generation of the community launcher, officially named and iterating fast in Alpha.' : '从 PCL N 到 NexaCL——社区启动器的下一代已经完成命名，正在 Alpha 中快速迭代。' }}</p></div>
      <ol class="naming-steps stagger">
        <li class="work-panel"><span class="step-no">01</span><h3>PCL N 1.4.x</h3><p>{{ en ? 'The previous stable line. Still the safer daily driver during Alpha.' : '前身稳定线。Alpha 期间仍是更稳妥的日常选择。' }}</p></li>
        <li class="work-panel current"><span class="step-no">02</span><span class="status-pill">Alpha</span><h3>NexaCL 2.0</h3><p>{{ en ? 'Officially named NexaCL, in testing now. Upgrade directly from 1.4.x.' : '已正式命名，正在测试。可从 1.4.x 直接升级。' }}</p></li>
        <li class="work-panel"><span class="step-no">03</span><h3>{{ en ? 'NexaCL Stable' : 'NexaCL 稳定版' }}</h3><p>{{ en ? 'Takes over the stable line once 2.0 passes the cutover checks.' : '通过切换检查后，正式接替稳定线。' }}</p></li>
      </ol>
    </section>

    <!-- ============ PLATFORMS & TRUST ============ -->
    <section class="home-section platform-card work-panel reveal" aria-label="Platforms">
      <div><p class="platform-title">{{ en ? 'Three platforms. Every architecture.' : '三个平台，每种架构。' }}</p><small>{{ en ? 'Installers (EXE / MSI / DMG / DEB / RPM / AppImage) and portable archives for x64 and ARM64.' : '安装包（EXE / MSI / DMG / DEB / RPM / AppImage）与便携包，覆盖 x64 与 ARM64。' }}</small></div>
      <div class="platform-names"><span>Windows</span><span>macOS</span><span>Linux</span></div>
      <p class="platform-sign"><span class="status-pill">SHA256</span><span class="status-pill">GPG {{ en ? 'signed' : '签名' }}</span>{{ en ? 'Every package ships with checksums and signatures.' : '每个安装包都附校验值与签名，来源可验证。' }}</p>
    </section>

    <!-- ============ WHY 2.0 ============ -->
    <section class="home-section reveal">
      <div class="section-head center"><p class="eyebrow">{{ en ? 'Why rewrite for 2.0' : '为什么要做 2.0' }}</p><h2>{{ en ? 'Rebuilt to break less.' : '重做这些，是为了少出问题。' }}</h2><p>{{ en ? 'NexaCL 2.0 runs on an all-new foundation. You never need to remember these names — they exist to fix speed, stability and long-term maintenance.' : 'NexaCL 2.0 的底层换了全新架构。你不需要记住这些名字，它们解决的是速度、稳定性和后续维护的问题。' }}</p></div>
      <div class="tech-grid stagger">
        <article class="work-panel"><h3>{{ en ? 'Fewer detours' : '少绕一层' }}</h3><p>{{ en ? 'Launch and UI updates take a more direct path, with less unnecessary relaying.' : '启动和界面更新尽量走更直接的路径，少做不必要的中转。' }}</p></article>
        <article class="work-panel"><h3>{{ en ? 'Easier to diagnose' : '出问题更好查' }}</h3><p>{{ en ? 'Downloads, updates and plugins have clear boundaries, so failures are easier to locate.' : '下载、更新和插件都有更清楚的边界，某一块出错时更容易找到原因。' }}</p></article>
        <article class="work-panel"><h3>{{ en ? 'Room to grow' : '以后更好加功能' }}</h3><p>{{ en ? 'New pages and plugin capabilities stack on top, instead of bending around legacy code.' : '新页面和插件能力可以继续往上加，不用一直绕着旧代码改。' }}</p></article>
      </div>
      <p class="tech-strip" :aria-label="en ? 'Underlying technologies' : '底层技术'"><span>XSR</span><span>NativeAOT</span><span>UI.Next</span><span>PXML</span><span>Sidecar</span></p>
    </section>

    <!-- ============ ALPHA STATUS ============ -->
    <section class="home-section alpha-row reveal">
      <article class="work-panel alpha-progress"><span class="status-pill">Alpha</span><h2>{{ en ? 'Usable, not finished.' : '能用了，但还没做完。' }}</h2><p>{{ en ? 'The foundation, interface, settings, downloads, updates, accounts and the Minecraft launch flow all have 2.0 versions. Product pages and plugin capabilities are what we are filling in now.' : '启动器底层、界面、设置、下载、更新、账号和 Minecraft 启动流程都已经有 2.0 版本，现在主要在补产品页面和插件能力。' }}</p>
        <ul class="progress-list">
          <li><span>{{ en ? 'Launcher foundation' : '启动器基础功能' }}</span><b class="done">{{ en ? 'Mostly complete' : '主要部分已完成' }}</b></li>
          <li><span>{{ en ? 'Minecraft launch flow' : 'Minecraft 启动流程' }}</span><b class="wip">{{ en ? 'Being polished' : '正在打磨' }}</b></li>
          <li><span>{{ en ? 'Interface and pages' : '界面和页面' }}</span><b class="wip">{{ en ? 'In progress' : '正在做' }}</b></li>
          <li><span>{{ en ? 'Plugins and ecosystem' : '插件和生态' }}</span><b class="later">{{ en ? 'Up next' : '后面再做' }}</b></li>
        </ul>
        <a class="text-link" :href="NEXA_GITHUB + '/issues'" target="_blank" rel="noreferrer">{{ en ? 'Share feedback on GitHub' : '前往 GitHub 反馈问题' }} ↗</a>
      </article>
      <article class="work-panel legacy-note"><span class="legacy-tag">PCL N 1.4.x</span><h3>{{ en ? 'Just want to play?' : '只想稳定玩游戏？' }}</h3><p>{{ en ? '1.4.x remains the stable line during Alpha. Keep using it — NexaCL 2.0 takes over only after it passes the cutover checks.' : 'Alpha 期间，PCL N 1.4.x 仍然是稳定线，不必急着更换。等 NexaCL 2.0 通过切换检查后，才会正式接替它。' }}</p><router-link class="text-link" to="/download?product=legacy">{{ en ? 'Download PCL N 1.4.x' : '下载 PCL N 1.4.x' }} ›</router-link></article>
    </section>

    <!-- ============ FAQ ============ -->
    <section class="home-section reveal">
      <div class="section-head center"><p class="eyebrow">{{ en ? 'FAQ' : '常见问题' }}</p><h2>{{ en ? 'Straight answers.' : '先把问题说清楚。' }}</h2></div>
      <div class="faq-list work-panel">
        <details class="faq-item"><summary>{{ en ? 'How do NexaCL, Nexa and PCL N relate?' : 'NexaCL、Nexa 和 PCL N 是什么关系？' }}</summary><p>{{ en ? 'PCL N 1.x is the previous stable line. “Nexa” was the transitional name during early 2.0 testing. The product is now officially named NexaCL; early Alpha artifacts may still carry the Nexa identifier in file names.' : 'PCL N 1.x 是前身稳定线；「Nexa」是 2.0 测试早期使用的过渡名称；现在产品已正式命名为 NexaCL。早期测试包的文件名可能仍带有 Nexa 标识，后续会统一。' }}</p></details>
        <details class="faq-item"><summary>{{ en ? 'Has NexaCL 2.0 replaced PCL N 1.4.x?' : 'NexaCL 2.0 已经取代 PCL N 1.4.x 了吗？' }}</summary><p>{{ en ? 'Not yet. 1.4.x stays the stable line during Alpha. NexaCL 2.0 takes over only after it is finished and passes the cutover checks.' : '还没有。Alpha 期间 1.4.x 仍是稳定线；等 2.0 做完并通过切换检查后，才会正式接替。' }}</p></details>
        <details class="faq-item"><summary>{{ en ? 'Can 1.4.x upgrade to NexaCL 2.0?' : '1.4.x 能升级到 NexaCL 2.0 吗？' }}</summary><p>{{ en ? 'Yes. The update system upgrades 1.4.x straight to 2.0. After moving to 2.0, downgrades are never offered.' : '可以。更新系统支持从 1.4.x 直接升级到 2.0；进入 2.0 后，启动器不会提供降级选项。' }}</p></details>
        <details class="faq-item"><summary>{{ en ? 'Why rewrite so much?' : '为什么这次要重写这么多？' }}</summary><p>{{ en ? 'The old architecture became harder to change. 2.0 re-lays the foundation of launching, UI, updates and plugins once, so future features land easier.' : '旧架构已经越来越难继续改。NexaCL 2.0 选择一次把启动、界面、更新和插件的基础重新整理好，后面做功能会轻松很多。' }}</p></details>
        <details class="faq-item"><summary>{{ en ? 'Should I use the Alpha now?' : '我现在适合用 Alpha 吗？' }}</summary><p>{{ en ? 'If you want an early look at 2.0 and accept that pages and behavior still change, try it. If you just want stable gaming, stay on 1.4.x.' : '想提前体验 2.0、能接受页面和功能还会变化，可以试 Alpha；只想稳定玩游戏，继续用 1.4.x 更合适。' }}</p></details>
      </div>
    </section>

    <!-- ============ FINAL CTA ============ -->
    <section class="home-section final-cta reveal">
      <div class="cta-panel">
        <p class="eyebrow">NEXACL · 2.0 ALPHA</p>
        <h2>{{ en ? 'Ready to meet NexaCL?' : '准备好认识 NexaCL 了吗？' }}</h2>
        <p>{{ en ? 'The Alpha moves fast, and every piece of feedback shapes the next build.' : 'Alpha 正在快速迭代，你的每一条反馈都会影响下一个版本。' }}</p>
        <div class="cta-actions">
          <router-link class="primary-button hero-cta" to="/download">{{ en ? 'Download NexaCL 2.0 Alpha' : '下载 NexaCL 2.0 Alpha' }} <span aria-hidden="true">↓</span></router-link>
          <router-link class="secondary-button hero-cta" to="/download?product=legacy">{{ en ? 'Stay on PCL N 1.4.x' : '继续用 PCL N 1.4.x' }}</router-link>
        </div>
        <p class="cta-fine">{{ en ? 'Built by the community' : '由社区开发' }} · Apache-2.0 · <a :href="NEXA_GITHUB" target="_blank" rel="noreferrer">GitHub ↗</a></p>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { NEXA_GITHUB, loadNexaCatalog } from '@/utils/nexaReleases';
import { applyPageSeo } from '@/utils/seo';
const { locale } = useI18n();
const en = computed(() => locale.value !== 'zh');
// Show the newest published build when the catalog is reachable; stay quiet otherwise.
const latestVersion = ref('');
const controller = new AbortController();
// Scroll reveal + stat count-up, both disabled under prefers-reduced-motion.
const root = ref<HTMLElement>();
let observer: IntersectionObserver | undefined;
function countUp(el: HTMLElement, target: number) {
  const duration = 750; const started = performance.now();
  const tick = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
onMounted(() => {
  loadNexaCatalog(controller.signal)
    .then(catalog => { latestVersion.value = (catalog.releases[0]?.tag_name ?? '').replace(/^v/, ''); })
    .catch(() => { /* Snapshot or GitHub unavailable — the hero simply omits the build tag. */ });
  if (!root.value) return;
  const nodes = root.value.querySelectorAll<HTMLElement>('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || typeof IntersectionObserver === 'undefined') {
    nodes.forEach(node => { node.classList.add('in'); node.querySelectorAll<HTMLElement>('[data-count]').forEach(b => { b.textContent = b.dataset.count ?? '0'; }); });
    return;
  }
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      el.classList.add('in');
      el.querySelectorAll<HTMLElement>('[data-count]').forEach(b => countUp(b, Number(b.dataset.count ?? 0)));
      observer?.unobserve(el);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  nodes.forEach(node => observer?.observe(node));
});
onBeforeUnmount(() => { controller.abort(); observer?.disconnect(); });
watchEffect(() => { applyPageSeo({ title: en.value ? 'NexaCL — The Minecraft launcher that asks less from you' : 'NexaCL — 一个更省心的 Minecraft 启动器', description: en.value ? 'NexaCL (formerly PCL N) is the next-generation community Minecraft launcher for Windows, macOS and Linux. Java, downloads, updates, accounts and recovery are handled for you. Try the 2.0 Alpha or stay on 1.4.x.' : 'NexaCL（原 PCL N）是新一代社区 Minecraft 启动器，支持 Windows、macOS 和 Linux。Java、下载、更新、账号与崩溃恢复都替你处理。体验 2.0 Alpha，或继续使用 1.4.x 稳定版。', path: '/' }); document.documentElement.lang = en.value ? 'en' : 'zh-CN'; });
</script>
<style scoped>
.home-page{max-width:1080px;margin:0 auto}
/* --- motion system (globally disabled under prefers-reduced-motion) --- */
.reveal{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease}.reveal.in{opacity:1;transform:none}
.stagger>*{opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s ease}.in .stagger>*,.stagger.in>*{opacity:1;transform:none}
.stagger>*:nth-child(2){transition-delay:.06s}.stagger>*:nth-child(3){transition-delay:.12s}.stagger>*:nth-child(4){transition-delay:.18s}.stagger>*:nth-child(5){transition-delay:.24s}.stagger>*:nth-child(6){transition-delay:.3s}.stagger>*:nth-child(n+7){transition-delay:.36s}
@keyframes hero-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.hero-anim{animation:hero-rise .6s cubic-bezier(.22,.8,.32,1) both}.hero-anim.d1{animation-delay:.02s}.hero-anim.d2{animation-delay:.08s}.hero-anim.d3{animation-delay:.15s}.hero-anim.d4{animation-delay:.22s}.hero-anim.d5{animation-delay:.29s}.hero-anim.d6{animation-delay:.36s;animation-duration:.8s}
/* --- hero --- */
.hero-card{position:relative;overflow:hidden;text-align:center;color:#fff;border-radius:22px;padding:58px 40px 40px;background:linear-gradient(135deg,#0d47a1 0%,#1673e6 52%,#4a90ef 100%);box-shadow:0 24px 60px -28px rgba(13,71,161,.5)}
.hero-card:before{content:'';position:absolute;inset:0;background:radial-gradient(620px 320px at 22% -5%,rgba(255,255,255,.22),transparent 62%);pointer-events:none;animation:hero-sheen 9s ease-in-out infinite alternate}
@keyframes hero-sheen{from{transform:translateX(-5%)}to{transform:translateX(5%)}}
.hero-badge{position:relative;display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);padding:6px 15px;border-radius:999px;font-size:11px;font-weight:650;letter-spacing:.08em}
.hero-badge i{width:6px;height:6px;border-radius:50%;background:#8ff0c0;animation:badge-pulse 2.4s ease-in-out infinite}
@keyframes badge-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.8)}}
.hero-card h1{position:relative;font-size:40px;font-weight:700;letter-spacing:-.025em;line-height:1.25;margin:20px auto 0;max-width:720px}
.hero-sub{position:relative;font-size:14.5px;line-height:1.9;color:rgba(255,255,255,.88);max-width:620px;margin:16px auto 0}
.hero-actions{position:relative;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:28px}
.hero-btn{display:inline-flex;align-items:center;gap:9px;border-radius:999px;padding:12px 26px;font-size:14px;font-weight:600;transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
.hero-btn:hover{transform:translateY(-1px)}.hero-btn:active{transform:scale(.97)}
.hero-btn-solid{background:#fff;color:#0f5ecb;box-shadow:0 10px 26px rgba(9,45,94,.35)}.hero-btn-solid:hover{box-shadow:0 14px 32px rgba(9,45,94,.45)}
.hero-btn-ghost{border:1px solid rgba(255,255,255,.55);color:#fff}.hero-btn-ghost:hover{background:rgba(255,255,255,.12)}
.hero-version{position:relative;margin:20px 0 0;font-size:12px;color:rgba(255,255,255,.78)}
.hero-version code{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.25);padding:2px 10px;border-radius:999px;font-size:11.5px;margin:0 4px}
.product-stage{position:relative;padding:42px 0 6px;margin:auto;max-width:880px}
.product-window{border-radius:16px;background:#f8faff;border:1px solid rgba(255,255,255,.5);box-shadow:0 40px 70px -30px rgba(6,32,66,.65),0 6px 18px rgba(6,32,66,.25);overflow:hidden;text-align:left;color:#1e3350}
.window-caption{height:46px;background:#0f5ecb;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 18px;font-size:15px;font-weight:600}
.window-caption>span{display:flex;align-items:center;gap:9px}.window-caption img{width:21px;height:21px}.window-controls{font-weight:400;opacity:.85}
.window-body{display:grid;grid-template-columns:46px .8fr 1.2fr;gap:16px;padding:20px 20px 20px 0;height:330px}
.window-rail{display:flex;align-items:center;flex-direction:column;gap:22px;color:#5e718a;font-size:20px}.window-rail .active{color:#1673e6}
.window-account,.window-version,.window-about{border:1px solid #e5eaf3;border-radius:14px;background:#fff}
.window-account{display:flex;align-items:center;flex-direction:column;padding:16px}
.mock-label{display:flex;justify-content:space-between;width:100%;font-size:12.5px;color:#617188}.mock-label span{color:#1673e6}
.player-mark{width:48px;height:48px;background:#bd9676;margin:26px 0 12px;position:relative;border-top:15px solid #493a32;border-bottom:11px solid #77583f}
.player-mark span,.player-mark i{position:absolute;top:7px;width:10px;height:6px;background:#4c7c92}.player-mark span{left:6px}.player-mark i{right:6px}
.window-account strong{font-size:19px}.window-account small{color:#67798d;font-size:12px}
.mock-chip{margin-top:16px;border-radius:40px;background:#e8f0fe;color:#0f5ecb;font-size:12px;padding:5px 13px}
.window-right{display:grid;grid-template-rows:1.65fr 1fr;gap:14px}.window-version{padding:16px}
.version-detail{display:flex;gap:12px;align-items:center;margin:13px 0}.version-detail strong{font-size:17px}.version-detail small{display:block;color:#6d7d90;font-size:11px}.version-detail>span:last-child{margin-left:auto;color:#8094ac}
.grass-block{color:#56814c;font-size:29px}
.mock-launch{background:#1673e6;border-radius:10px;text-align:center;padding:8px;color:#fff;font-size:14px;animation:launch-pulse 3.2s ease-in-out infinite}
@keyframes launch-pulse{0%,100%{box-shadow:0 0 0 0 rgba(22,115,230,.35)}55%{box-shadow:0 0 0 7px rgba(22,115,230,0)}}
.window-about{display:flex;align-items:center;gap:15px;padding:18px}.about-mark{font-size:30px;color:#1673e6;font-weight:650}.window-about p{font-size:12px;color:#748196;margin-top:3px}
.product-caption{color:rgba(255,255,255,.66);font-size:11px;margin-top:14px}
/* --- sections --- */
.home-section{margin-top:56px}.section-head{max-width:660px;margin-bottom:26px}.section-head.center{text-align:center;margin-inline:auto}.section-head h2{font-size:24px;font-weight:700;letter-spacing:-.015em;margin:9px 0 0}.section-head>p:not(.eyebrow){font-size:13.5px;color:var(--market-muted);margin-top:10px;line-height:1.8}.home-section .work-panel{margin:0;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
.stats{margin-top:26px}.stats-strip{display:grid;grid-template-columns:repeat(4,1fr);padding:0;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px -18px rgba(23,43,77,.25)}
.stat{padding:24px}.stat+.stat{border-left:1px solid var(--market-border)}.stat b{display:block;font-size:30px;font-weight:700;letter-spacing:-.03em;color:var(--nc-accent);line-height:1.1}.stat span{display:block;font-size:12px;color:var(--market-muted);margin-top:8px;line-height:1.6}
/* --- bento --- */
.bento{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.tile{position:relative;border-radius:16px;padding:22px;display:flex;flex-direction:column}
.tile:hover{transform:translateY(-3px);border-color:#c9d8ee;box-shadow:0 14px 30px rgba(23,43,77,.10)}
.tile-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:var(--market-accent-soft);color:var(--nc-accent);font-size:17px;margin-bottom:14px}
.tile h3{font-size:14.5px;font-weight:650}.tile p{font-size:12px;line-height:1.8;color:var(--market-muted);margin-top:8px}
.tile-link{font-size:12px;color:var(--nc-accent);margin-top:10px}
.t-launch{grid-column:span 2;grid-row:span 2;justify-content:flex-end;background:linear-gradient(165deg,var(--market-accent-soft),#fff 62%)}
.t-launch .tile-icon{width:44px;height:44px;font-size:19px}.t-launch h3{font-size:19px}.t-launch p{font-size:13px;max-width:420px}
.launch-steps{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:auto;padding:2px 0 26px}
.launch-steps span{background:#fff;border:1px solid var(--market-border);border-radius:999px;padding:7px 14px;font-size:12px;font-weight:550;box-shadow:0 1px 2px rgba(23,43,77,.05);animation:step-glow 3.2s ease-in-out infinite}
.launch-steps span:nth-of-type(2){animation-delay:.4s}.launch-steps span:nth-of-type(3){animation-delay:.8s}.launch-steps span:nth-of-type(4){animation-delay:1.2s}
@keyframes step-glow{0%,72%,100%{border-color:var(--market-border)}20%{border-color:var(--nc-accent);color:var(--nc-accent);box-shadow:0 2px 10px rgba(22,115,230,.18)}}
.launch-steps i{color:var(--nc-accent);font-style:normal;font-size:13px}
.t-drop{grid-column:span 2;background:linear-gradient(180deg,#f7faff,#fff);border-style:dashed;border-color:#c4d4ec}
.t-drop:hover{border-color:var(--nc-accent)}
.chip-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.chip-row span{background:var(--market-accent-soft);color:var(--nc-accent);border-radius:999px;padding:4px 11px;font-size:11px;font-weight:550}
/* --- product line --- */
.naming-steps{list-style:none;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:0;padding:0}
.naming-steps li{position:relative;padding:24px;border-radius:16px}
.naming-steps li:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(23,43,77,.08)}
.naming-steps li.current{border-color:var(--nc-accent);box-shadow:0 8px 24px rgba(22,115,230,.12)}
.naming-steps .status-pill{position:absolute;top:20px;right:20px}
.step-no{display:block;font-size:11px;font-weight:650;color:var(--market-muted);letter-spacing:.08em;margin-bottom:12px}
.naming-steps h3{font-size:17px;font-weight:650;margin-bottom:8px}.naming-steps p{font-size:12.5px;line-height:1.75;color:var(--market-muted)}
/* --- platform card --- */
.platform-card{display:grid;grid-template-columns:1fr auto;gap:18px 30px;align-items:center;padding:26px 30px;border-radius:16px}
.platform-title{font-size:16px;font-weight:650}
.platform-card small{display:block;font-size:12px;color:var(--market-muted);margin-top:6px;line-height:1.7}
.platform-names{display:flex;gap:26px;font-size:17px;font-weight:700;letter-spacing:-.02em}
.platform-sign{grid-column:1/-1;display:flex;align-items:center;gap:8px;border-top:1px solid var(--market-border);padding-top:16px;font-size:12px;color:var(--market-muted)}
/* --- tech --- */
.tech-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.tech-grid .work-panel{padding:24px;border-radius:16px}.tech-grid .work-panel:hover{transform:translateY(-2px);border-color:#c9d8ee;box-shadow:0 10px 26px rgba(23,43,77,.08)}
.tech-grid h3{font-size:15px;font-weight:650}.tech-grid p{margin-top:9px;font-size:12.5px;line-height:1.8;color:var(--market-muted)}
.tech-strip{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin-top:22px}
.tech-strip span{border:1px dashed var(--market-border);color:var(--market-muted);border-radius:999px;padding:6px 15px;font-size:12px;transition:color .2s ease,border-color .2s ease}
.tech-strip span:hover{color:var(--nc-accent);border-color:var(--nc-accent)}
/* --- alpha status --- */
.alpha-row{display:grid;grid-template-columns:1.25fr 1fr;gap:16px;align-items:start}
.alpha-row .work-panel{border-radius:16px;padding:26px}
.alpha-progress h2{font-size:19px;font-weight:650;margin:14px 0 0}.alpha-progress>p{font-size:12.5px;line-height:1.8;color:var(--market-muted);margin:10px 0 18px}
.progress-list{list-style:none;margin:0 0 20px;padding:0;border-top:1px solid #e8edf3}
.progress-list li{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 2px;border-bottom:1px solid #e8edf3;font-size:13px}
.progress-list b{font-size:11px;font-weight:550;border-radius:999px;padding:4px 11px;white-space:nowrap}
.progress-list b.done{background:var(--market-accent-soft);color:var(--nc-accent)}
.progress-list b.wip{background:rgba(230,160,20,.14);color:#a06a00}
.progress-list b.later{background:var(--market-surface-soft);color:var(--market-muted)}
.legacy-note{display:flex;flex-direction:column}
.legacy-tag{font-size:11px;color:var(--market-muted);letter-spacing:.06em;margin-bottom:14px}
.legacy-note h3{font-size:17px;font-weight:650}.legacy-note p{font-size:12.5px;line-height:1.8;color:var(--market-muted);margin:10px 0 16px}
/* --- faq & cta --- */
.faq-list{border-radius:16px;padding:8px 24px}
.faq-item{border-bottom:1px solid #e8edf3}.faq-item:last-child{border-bottom:0}
.faq-item summary{cursor:pointer;padding:16px 2px;font-size:13.5px;font-weight:600;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;transition:color .15s ease}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary:after{content:'+';font-size:16px;font-weight:400;color:var(--market-muted);transition:transform .2s ease}
.faq-item[open] summary:after{transform:rotate(45deg)}
.faq-item summary:hover{color:var(--nc-accent)}
.faq-item p{font-size:12.5px;line-height:1.85;color:var(--market-muted);padding:0 2px 18px;max-width:760px}
.final-cta{margin-bottom:16px}
.cta-panel{position:relative;overflow:hidden;text-align:center;border-radius:20px;padding:56px 32px;color:#fff;background:linear-gradient(135deg,#0d47a1 0%,#1673e6 55%,#4a90ef 100%);box-shadow:0 20px 50px -24px rgba(13,71,161,.5)}
.cta-panel:before{content:'';position:absolute;inset:0;background:radial-gradient(560px 280px at 78% 0%,rgba(255,255,255,.2),transparent 60%);pointer-events:none}
.cta-panel .eyebrow{color:rgba(255,255,255,.75)}
.cta-panel h2{position:relative;font-size:28px;font-weight:700;letter-spacing:-.02em;margin:10px 0 0}
.cta-panel>p:not(.eyebrow):not(.cta-fine){position:relative;font-size:13px;color:rgba(255,255,255,.85);margin-top:12px}
.cta-actions{position:relative;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:28px}
.cta-panel .hero-cta{min-height:44px;padding:12px 28px;font-size:14px}
.cta-panel .primary-button{background:#fff;color:#0f5ecb;border-color:#fff}
.cta-panel .primary-button:hover{background:#f0f6ff;box-shadow:0 10px 26px rgba(9,45,94,.35)}
.cta-panel .secondary-button{background:transparent;border-color:rgba(255,255,255,.55);color:#fff}
.cta-panel .secondary-button:hover{background:rgba(255,255,255,.12);border-color:#fff}
.cta-fine{position:relative;font-size:11.5px;color:rgba(255,255,255,.72);margin-top:24px}.cta-fine a{color:#fff;text-decoration:underline}
/* --- tablet / phone --- */
@media(max-width:800px){
.hero-card{padding:42px 22px 30px;border-radius:18px}.hero-card h1{font-size:28px}.hero-sub{font-size:13px}
.product-stage{padding-top:30px}.window-body{height:235px;grid-template-columns:24px .8fr 1.2fr;gap:9px;padding:12px 12px 12px 0}
.window-caption{height:38px;font-size:13px;padding:0 12px}.window-caption img{width:18px;height:18px}
.window-account,.window-version{padding:10px}.window-account strong{font-size:16px}.window-account small{font-size:11px}
.player-mark{margin:18px 0 9px;width:36px;height:36px;border-top-width:9px;border-bottom-width:8px}.player-mark span,.player-mark i{top:5px;width:7px;height:5px}
.mock-chip{font-size:10px;margin-top:14px;padding:4px 8px}.window-rail{font-size:16px;gap:15px}.mock-label{font-size:11px}
.window-right{gap:9px}.window-about{padding:10px;gap:9px}.window-about strong{font-size:12px}.window-about p{font-size:10px}.about-mark{font-size:22px}
.version-detail{gap:7px;margin:10px 0}.version-detail strong{font-size:15px}.version-detail small{font-size:10px}.mock-launch{font-size:11px;padding:6px}.grass-block{font-size:22px}
.stats-strip{grid-template-columns:repeat(2,1fr)}.stat{padding:18px 20px}.stat+.stat{border-left:0}.stat:nth-child(even){border-left:1px solid var(--market-border)}.stat:nth-child(n+3){border-top:1px solid var(--market-border)}.stat b{font-size:26px}
.bento{grid-template-columns:repeat(2,minmax(0,1fr))}.t-launch{grid-column:span 2;grid-row:auto}.t-drop{grid-column:span 2}
.naming-steps,.tech-grid,.alpha-row{grid-template-columns:1fr}
.platform-card{grid-template-columns:1fr}.platform-names{gap:20px;font-size:15px}
.home-section{margin-top:42px}.cta-panel{padding:42px 22px}.cta-panel h2{font-size:23px}}
@media(max-width:480px){
.hero-card h1{font-size:24px}.hero-actions{flex-direction:column;width:100%}.hero-btn{width:100%;justify-content:center}
.hero-version{font-size:11px}.bento{grid-template-columns:1fr}.t-launch,.t-drop{grid-column:auto}
.tile{padding:18px}.section-head h2{font-size:20px}.faq-list{padding:4px 16px}.faq-item summary{font-size:13px;padding:14px 2px}
.cta-actions{flex-direction:column}.cta-panel .hero-cta{width:100%}.stat span{font-size:11px}.window-body{height:200px}}
</style>
