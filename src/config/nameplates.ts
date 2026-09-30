// 铭牌墙的展示层配置。
//
// 分工:铭牌的**规则与达成条件**由后端(src/nameplates.mjs,经 GET /auth/v1/nameplates 下发)
// 单一权威定义;这里只放纯展示信息 —— 主题色、图标名(对应 src/assets/icons/koi-*.svg)、
// 分组标题与排序。改配色/图标不需要动后端,改阈值/加成也不需要动这里。
import type { PlateKind } from '@/api/platform';

// 一并转出,便于页面从展示配置单点引入,不必同时 import 两个模块。
export type { PlateKind };

export interface PlateArt {
  icon: string;      // KoiIcon 名称,不带 koi- 前缀与 .svg 后缀
  accent: string;    // 主题色:描边、光晕与徽标底色
  tint: string;      // 底色(浅色),用于未达成时的置灰对比
}

// 未在表中的铭牌 id 会回退到 DEFAULT_ART,新增铭牌不会导致页面渲染失败。
export const PLATE_ART: Record<string, PlateArt> = {
  // ---- Cloud+ 订阅:蓝 → 靛 → 紫 → 金,档位越高越暖 ----
  sub_lite: { icon: 'cloud-drizzle', accent: '#4f8ef7', tint: '#eaf2ff' },
  sub_standard: { icon: 'folder-cloud', accent: '#3f6fe0', tint: '#e8effd' },
  sub_advanced: { icon: 'document-cloud', accent: '#6d4ae0', tint: '#efeafd' },
  sub_ultimate: { icon: 'flash', accent: '#d99400', tint: '#fdf4e0' },
  // ---- 可代替等级 ----
  lv_infinity: { icon: 'affixed', accent: '#7b3ff2', tint: '#f1eafe' },
  lv_minus_one: { icon: 'shield-tick', accent: '#e8546e', tint: '#fdeaee' },
  lv_mc: { icon: 'refresh-arrow', accent: '#1e8e3e', tint: '#e7f6ec' },
  // ---- 不可代替等级的荣誉铭牌 ----
  from_bilibili: { icon: 'video-play', accent: '#fb7299', tint: '#fdeef4' },  // B 站品牌粉
  yellow_badge: { icon: 'status-up', accent: '#f5a623', tint: '#fdf3e2' },
  i_like_you: { icon: 'love-letter', accent: '#e0447c', tint: '#fdeaf2' }
};

export const DEFAULT_ART: PlateArt = { icon: 'tag', accent: '#5f6368', tint: '#f1f4f9' };

export const artFor = (id: string): PlateArt => PLATE_ART[id] ?? DEFAULT_ART;

export const PLATE_GROUPS: { kind: PlateKind; title: string; hint: string }[] = [
  {
    kind: 'subscription',
    title: '订阅铭牌',
    hint: '每个 Cloud+ 档位一枚，各自附带经验加成。按当前生效的订阅档位授予，退订后铭牌与加成一并失效。'
  },
  {
    kind: 'level',
    title: '可代替等级的铭牌',
    hint: '佩戴后可以只显示铭牌、隐藏 Lv 数字。'
  },
  {
    kind: 'badge',
    title: '荣誉铭牌',
    hint: '不可代替等级，与 Lv 数字并列展示。部分需要人工核验后由运营写入。'
  }
];

export const groupTitle = (kind: PlateKind): string => PLATE_GROUPS.find(g => g.kind === kind)?.title ?? '其他铭牌';

// 加成倍率展示:1.10 → "+10%"，2 → "+100%"。
export const bonusLabel = (bonus: number): string => {
  const percent = Math.round((Number(bonus) - 1) * 100);
  return percent > 0 ? `+${percent}%` : '无加成';
};

// 分钟数转「X 小时 Y 分」，用于 MC 时长进度展示。
export const formatMinutes = (minutes: number): string => {
  const total = Math.max(0, Math.floor(Number(minutes) || 0));
  const hours = Math.floor(total / 60), rest = total % 60;
  if (hours === 0) return `${rest} 分钟`;
  return rest ? `${hours} 小时 ${rest} 分` : `${hours} 小时`;
};

// 大数字加千分位，用于粉丝数等。
export const formatCount = (value: number): string => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('zh-CN');
