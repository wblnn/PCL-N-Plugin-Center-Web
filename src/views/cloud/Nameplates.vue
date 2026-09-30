<template>
  <section class="plates-page">
    <div class="section-heading">
      <div>
        <p class="eyebrow">NAMEPLATES</p>
        <h1>铭牌墙</h1>
      </div>
      <router-link v-if="session" class="secondary-button" to="/account?section=level">我的等级与铭牌</router-link>
    </div>
    <p class="plates-intro">
      铭牌是显示在你账户名旁的身份标识。每个 Cloud+ 订阅档位都有各自的铭牌与经验加成；
      少数铭牌可以<strong>代替等级</strong>显示 —— 佩戴后只展示铭牌、隐藏 Lv 数字。
      多枚铭牌的加成<strong>不叠加</strong>，{{ bonusNote }}。
    </p>

    <!-- 当前佩戴:仅登录后可见 -->
    <div v-if="session && mine" class="work-panel equipped-panel">
      <div class="equipped-head">
        <div>
          <h2>当前展示</h2>
          <p>这是其他人在你的账户名旁看到的样子。</p>
        </div>
        <div class="equipped-preview" aria-live="polite">
          <span class="preview-name">{{ session.name }}</span>
          <span v-if="!mine.hidesLevel" class="plate-chip level-chip">Lv{{ mine.displayLevel ?? 0 }}</span>
          <span v-if="equippedPlate" class="plate-chip" :style="chipStyle(equippedPlate.id)">
            <KoiIcon :name="artFor(equippedPlate.id).icon" />{{ equippedPlate.label }}
          </span>
        </div>
      </div>
      <div class="equipped-meta">
        <span class="status-pill">经验加成 ×{{ mine.bonus.toFixed(2) }}</span>
        <span class="equipped-note">{{ equippedPlate ? (equippedPlate.replacesLevel ? '该铭牌代替等级显示' : '该铭牌与等级并列显示') : '未佩戴铭牌，仅显示等级' }}</span>
        <button v-if="mine.equipped" class="secondary-button" :disabled="busy" @click="equip(null)">卸下铭牌</button>
        <router-link class="text-link" to="/account?section=level">更换佩戴 →</router-link>
      </div>
    </div>

    <p v-if="loading" class="empty-state" role="status">正在读取铭牌墙…</p>
    <p v-else-if="error" class="empty-state" role="alert">{{ error }}　<button class="secondary-button" @click="load">重试</button></p>

    <template v-else-if="wall">
      <!-- 铭牌分组 -->
      <section v-for="group in groups" :key="group.kind" class="work-panel">
        <h2>{{ group.title }}</h2>
        <p>{{ group.hint }}</p>
        <div class="plate-grid">
          <article v-for="plate in group.plates" :key="plate.id" class="plate-card" :class="{ owned: plate.owned, locked: plate.owned === false }">
            <span class="plate-art" :style="{ background: artFor(plate.id).tint, color: artFor(plate.id).accent }" aria-hidden="true">
              <KoiIcon :name="artFor(plate.id).icon" />
            </span>
            <div class="plate-body">
              <div class="plate-title">
                <h3>{{ plate.label }}</h3>
                <span v-if="plate.replacesLevel" class="plate-flag" title="佩戴后可只显示铭牌、隐藏 Lv 数字">可代替等级</span>
              </div>
              <p class="plate-bonus">经验加成 <strong :style="{ color: artFor(plate.id).accent }">×{{ plate.xpBonus.toFixed(2) }}</strong></p>
              <p class="plate-req">{{ plate.requirement }}</p>
              <p class="plate-detail">{{ plate.detail }}</p>
              <!-- 登录后展示达成状态与进度 -->
              <template v-if="plate.owned !== undefined">
                <p v-if="plate.owned" class="plate-state got"><KoiIcon name="shield-tick" />已获得</p>
                <template v-else>
                  <p class="plate-state"><KoiIcon name="lock-circle" />未达成</p>
                  <ul v-if="plate.parts" class="plate-parts">
                    <li v-for="part in plate.parts" :key="part.label" :class="{ done: part.done }">
                      <span>{{ part.label }}</span>
                      <b v-if="part.need">{{ formatPartProgress(part) }}</b>
                    </li>
                  </ul>
                  <div v-else-if="plate.progress" class="plate-track">
                    <i :style="{ width: percent(plate.progress) + '%' }"></i>
                  </div>
                  <p v-if="plate.progress" class="plate-progress-text">{{ formatProgress(plate.progress) }}</p>
                </template>
              </template>
            </div>
          </article>
        </div>
      </section>

      <!-- 经验来源 -->
      <section class="work-panel">
        <h2>怎么加经验</h2>
        <p>
          经验全部由<strong>启动器上报事件</strong>，数值由服务端权威决定 —— 启动器只能声明「发生了什么、持续了多少分钟」，
          不能自行声明这值多少经验。每用户每日上限 <strong>{{ wall.dailyCap }} XP</strong>（按事件发生日计，历史补报不占今天的额度）。
        </p>
        <div class="source-table">
          <div class="source-row source-head"><span>来源</span><span>数值</span><span>单日上限</span><span>上报方</span></div>
          <div v-for="source in wall.xpSources" :key="source.type" class="source-row">
            <span class="source-label">{{ source.label }}<code>{{ source.type }}</code></span>
            <span>{{ sourceLabel(source) }}</span>
            <span>{{ source.dailyCap === null ? '豁免' : source.dailyCap + ' XP' }}</span>
            <span class="source-reporter">{{ source.reporter === 'launcher' ? '启动器' : '启动器 / 网站登录' }}</span>
          </div>
        </div>
        <p class="source-note">
          首次启动游戏（<code>game.first_launch</code>）是把等级从 Lv0 推到 Lv1 的必要条件；「每日启动」同时推进连续启动天数，
          是 <strong>LvMC</strong> 铭牌的依据。「Nexa 在线时长」指启动器挂机在线（未启动 Minecraft）的时间，与游戏时长分开计。
        </p>
      </section>

      <!-- 等级阈值 -->
      <section class="work-panel">
        <h2>等级阈值</h2>
        <p>Lv0 → Lv1 需要启动过一次游戏；Lv2 起按累计经验判定，Lv{{ wall.maxLevel }} 封顶。</p>
        <ol class="level-track">
          <li v-for="step in levelSteps" :key="step.level">
            <b>Lv{{ step.level }}</b>
            <span>{{ step.threshold === null ? '启动一次游戏' : step.threshold.toLocaleString('zh-CN') + ' XP' }}</span>
          </li>
        </ol>
      </section>
    </template>

    <p class="login-fine">
      需要人工核验的铭牌（b站来的 / 小黄标 / 我喜欢你）请在提交证明后由运营写入；
      订阅铭牌按当前生效的 Cloud+ 档位自动授予，退订后铭牌与加成一并失效。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { platform, type Nameplate, type NameplateWall, type PlatePart, type PlateProgress, type Session, type XpSource } from '@/api/platform';
import { PLATE_GROUPS, artFor, type PlateKind } from '@/config/nameplates';
import KoiIcon from '@/components/KoiIcon.vue';
import { applyPageSeo } from '@/utils/seo';

const wall = ref<NameplateWall | null>(null);
const mine = ref<{ plates: Nameplate[]; bonus: number; equipped: string | null; hidesLevel: boolean; displayLevel: number | null } | null>(null);
const session = ref<Session | undefined>();
const loading = ref(true), error = ref(''), busy = ref(false);

// 已拥有状态叠加到公开目录上:未登录时 plate.owned 为 undefined,卡片只显示规则不显示进度。
const ownedById = computed(() => new Map((mine.value?.plates ?? []).map(p => [p.id, p])));
const groups = computed(() => {
  const plates = wall.value?.plates ?? [];
  return PLATE_GROUPS.map(group => ({
    ...group,
    plates: plates
      .filter(p => p.kind === (group.kind as PlateKind))
      .map(p => ({ ...p, ...overlay(p.id) }))
  })).filter(g => g.plates.length);
});
// 用「我的铭牌」接口返回的运行时字段覆盖公开目录中的同名铭牌。
function overlay(id: string): Partial<Nameplate> {
  const own = ownedById.value.get(id);
  return own ? { owned: own.owned, progress: own.progress, parts: own.parts } : {};
}
const equippedPlate = computed(() => {
  const id = mine.value?.equipped;
  if (!id) return null;
  return (wall.value?.plates ?? mine.value?.plates ?? []).find(p => p.id === id) ?? null;
});
const bonusNote = computed(() => wall.value?.bonusNote ?? '取已拥有铭牌中的最高加成');
const levelSteps = computed(() => {
  const max = wall.value?.maxLevel ?? 7, thresholds = wall.value?.levels ?? {};
  return Array.from({ length: max + 1 }, (_, level) => ({ level, threshold: level <= 1 ? null : (thresholds[level] ?? null) }));
});
const chipStyle = (id: string) => ({ background: artFor(id).tint, color: artFor(id).accent, borderColor: artFor(id).accent });
const percent = (progress: PlateProgress) => progress.need > 0 ? Math.min(100, Math.round((progress.have / progress.need) * 100)) : 0;
const formatProgress = (progress: PlateProgress) =>
  `${progress.have.toLocaleString('zh-CN')} / ${progress.need.toLocaleString('zh-CN')}${progress.unit ? ' ' + progress.unit : ''}（${percent(progress)}%）`;
const formatPartProgress = (part: PlatePart) => {
  if (!part.need) return part.done ? '✓' : '—';
  const unit = part.unit === '分钟' ? '' : (part.unit ?? '');
  return `${part.have?.toLocaleString('zh-CN') ?? 0}${unit} / ${part.need.toLocaleString('zh-CN')}${unit}`;
};
const sourceLabel = (source: XpSource) => {
  if (source.mode === 'duration') return `${source.xpPerMinute} XP / 分钟`;
  if (source.mode === 'once') return `+${source.xp} XP（一次性）`;
  return `+${source.xp} XP / 日`;
};

async function load() {
  loading.value = true; error.value = '';
  try {
    wall.value = await platform.nameplateWall();
    // 登录后才拉取个人状态;公开目录不依赖会话,失败也不影响规则展示。
    if (session.value) mine.value = await platform.myNameplates().catch(() => null);
  } catch (e) { error.value = e instanceof Error ? e.message : '暂时无法读取铭牌墙，请稍后重试。'; }
  finally { loading.value = false; }
}
async function equip(plate: string | null) {
  busy.value = true; error.value = '';
  try { mine.value = await platform.equipNameplate(plate); }
  catch (e) { error.value = e instanceof Error ? e.message : '佩戴铭牌失败，请重试。'; }
  finally { busy.value = false; }
}
onMounted(async () => {
  applyPageSeo({ title: '铭牌墙 · NexaCL', description: '查看 NexaCL 的全部铭牌：Cloud+ 各订阅档位的铭牌与经验加成，以及 Lv∞、Lv-1、LvMC 等可代替等级的铭牌达成条件。', path: '/nameplates' });
  session.value = await platform.session().catch(() => undefined);
  await load();
});
</script>

<style scoped>
.plates-page{max-width:1240px;margin:0 auto}
.plates-intro{font-size:13px;color:var(--market-muted);margin:14px 0 6px;line-height:1.85;max-width:820px}
.plates-intro strong{color:var(--market-text)}
.equipped-panel{border-color:var(--nc-accent);box-shadow:0 8px 28px rgba(22,115,230,.10)}
.equipped-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
.equipped-head h2{margin-bottom:6px}
.equipped-head p{font-size:12.5px;color:var(--market-muted);margin:0}
.equipped-preview{display:flex;align-items:center;gap:9px;flex-wrap:wrap;background:var(--market-surface-soft);border:1px solid var(--market-border);border-radius:999px;padding:9px 16px}
.preview-name{font-size:14px;font-weight:650;color:var(--market-text)}
.plate-chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:650;padding:4px 11px;border-radius:999px;border:1px solid transparent;white-space:nowrap}
.plate-chip :deep(.koi-icon){font-size:12px}
.level-chip{background:#e9eef6;color:#0d4fa8;border-color:#cddcf5}
.equipped-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid #e8edf3}
.equipped-note{font-size:12px;color:var(--market-muted)}
.plate-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin-top:18px}
.plate-card{display:flex;gap:14px;padding:16px;border:1px solid #e3e8f0;border-radius:12px;background:#fff;transition:border-color .15s,box-shadow .15s}
.plate-card.owned{border-color:var(--nc-accent);box-shadow:0 2px 12px rgba(22,115,230,.10)}
.plate-card.locked{opacity:.82}
.plate-art{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-size:22px;flex-shrink:0}
.plate-body{min-width:0;flex:1}
.plate-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px}
.plate-title h3{font-size:15px;font-weight:650;letter-spacing:-.01em}
.plate-flag{font-size:10px;font-weight:650;color:#7b3ff2;background:#f1eafe;border-radius:999px;padding:2px 8px;white-space:nowrap}
.plate-bonus{font-size:11.5px;color:var(--market-muted);margin:0 0 7px}
.plate-bonus strong{font-size:13px;font-variant-numeric:tabular-nums}
.plate-req{font-size:12.5px;color:var(--market-text);margin:0 0 5px;line-height:1.65}
.plate-detail{font-size:11.5px;color:#91a1a9;margin:0;line-height:1.7}
.plate-state{display:flex;align-items:center;gap:6px;font-size:11.5px;color:#91a1a9;margin:11px 0 0;padding-top:10px;border-top:1px dashed #e8edf3}
.plate-state.got{color:#1e8e3e;font-weight:650}
.plate-state :deep(.koi-icon){font-size:13px}
.plate-parts{list-style:none;padding:9px 0 0;margin:0;display:grid;gap:5px;font-size:11.5px;color:#91a1a9}
.plate-parts li{display:flex;justify-content:space-between;gap:10px}
.plate-parts li.done{color:#1e8e3e}
.plate-parts li b{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.plate-track{height:6px;background:var(--market-surface-soft);border:1px solid var(--market-border);border-radius:999px;overflow:hidden;margin-top:10px}
.plate-track i{display:block;height:100%;background:var(--nc-accent);border-radius:999px;transition:width .4s ease}
.plate-progress-text{font-size:11px;color:#91a1a9;margin:6px 0 0;font-variant-numeric:tabular-nums}
.source-table{margin-top:16px;border:1px solid #e8edf3;border-radius:10px;overflow:hidden}
.source-row{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) 92px minmax(0,1fr);gap:12px;padding:11px 14px;font-size:12.5px;border-top:1px solid #eef2f7;align-items:center}
.source-row:first-child{border-top:0}
.source-head{background:var(--market-surface-soft);font-size:11px;font-weight:650;color:var(--market-muted)}
.source-label{display:grid;gap:2px;min-width:0;color:var(--market-text);font-weight:550}
.source-label code{font-size:10.5px;color:#91a1a9;font-weight:400;overflow-wrap:anywhere}
.source-reporter{color:var(--market-muted)}
.source-note{font-size:11.5px;color:#91a1a9;margin:14px 0 0;line-height:1.8}
.source-note code{background:#f1f4f9;border:1px solid #e3e8f0;border-radius:5px;padding:0 5px;font-size:11px;color:#0d4fa8}
.level-track{list-style:none;padding:0;margin:18px 0 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:10px}
.level-track li{border:1px solid #e3e8f0;border-radius:10px;padding:12px 14px;background:#fff}
.level-track b{display:block;font-size:16px;letter-spacing:-.02em;color:var(--nc-accent)}
.level-track span{display:block;font-size:11.5px;color:var(--market-muted);margin-top:4px;font-variant-numeric:tabular-nums}
@media(max-width:800px){
  .plate-grid{grid-template-columns:1fr}
  .source-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px 12px}
  .source-head{display:none}
  .source-reporter{grid-column:1/-1}
}
</style>
