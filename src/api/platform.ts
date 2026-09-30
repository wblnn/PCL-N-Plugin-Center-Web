import type { RegisterOptions, AssertOptions, CreatedPasskey, PasskeyAssertion } from '../utils/webauthnClient';

export interface Session { id: string; name: string; email?: string | null; staff?: 0 | 1; developer?: 0 | 1; termsAccepted?: number; handle?: string | null; setupRequired?: 0 | 1; scope: 'console' | 'operations' }
export interface LinkedIdentity { provider: 'github' | 'microsoft' | 'google'; email?: string | null; created_at: string }
export interface PolicyStatus { kind: string; version: string; effectiveAt: string; contentHash: string; acceptedAt: string | null }
export interface DeletionRequest { id: string; state: 'pending' | 'cancelled' | 'finalized'; requestedAt: string; executeAfter?: number; cancelledAt: string | null; finalizedAt: string | null }
export interface PrivacyRequest { id: string; type: string; state: string; createdAt: string; updatedAt: string }
export interface Entitlements { cloudPlus: boolean; subscriptions: { subscription_id: string; status: string; price_id: string; product_id: string; scheduled_change_action: string | null }[] }
export interface LoginChallenge { challenge: string; factors: string[]; user: { name: string } }
export interface MfaPasskey { credentialId: string; name: string | null; createdAt: string; lastUsedAt: string | null }
export interface MfaTotpDevice { id: string; name: string | null; confirmed: boolean; createdAt: string; confirmedAt: string | null }
export interface MfaFactors { passwordSet: boolean; passkeys: MfaPasskey[]; totp: MfaTotpDevice[]; recovery: { count: number } }
export interface MinecraftProfile { microsoftLinked: boolean; owned: number | null; profileId: string | null; profileName: string | null; error: string | null; checkedAt: string | null }

// ---------- 等级 / 经验 / 铭牌墙 ----------
// 规则与阈值的权威定义在后端 nexa-auth(src/nameplates.mjs);这里只做类型声明与展示。
export type PlateKind = 'subscription' | 'level' | 'badge';
export interface PlateProgress { have: number; need: number; unit: string | null }
export interface PlatePart { label: string; done: boolean; have?: number; need?: number; unit?: string }
export interface Nameplate {
  id: string; kind: PlateKind; label: string; tier?: string;
  xpBonus: number; replacesLevel: boolean; requirement: string; detail: string;
  // 以下字段仅登录后的接口返回;公开目录不含运行时状态。
  owned?: boolean; progress?: PlateProgress; parts?: PlatePart[];
}
export interface XpSource {
  type: string; label: string; reporter: 'launcher' | 'launcher-or-web';
  mode: 'daily' | 'duration' | 'once';
  xp?: number; xpPerMinute?: number; unit?: string; perEventUnitCap?: number;
  dailyCap: number | null; countsTowardDailyCap: boolean;
  advancesLaunchStreak?: boolean; unlocksLevelOne?: boolean; claimedToday?: boolean | null;
}
export interface NameplateWall {
  plates: Nameplate[]; levels: Record<string, number>; maxLevel: number;
  xpSources: XpSource[]; dailyCap: number; bonusStacking: boolean; bonusNote: string;
}
export interface LevelNext { level: number; threshold: number; remaining: number }
export interface MyNameplates { plates: Nameplate[]; bonus: number; equipped: string | null; hidesLevel: boolean; displayLevel: number | null }
export interface AccountLevel {
  level: number; xp: number; micro: number; launched: boolean; firstLaunchAt: string | null;
  next: LevelNext | null; maxLevel: number; dailyCap: number; thresholds: Record<string, number>;
  lastLoginDay: string | null; lastLaunchDay: string | null;
  streak: number; streakBest: number; gameMinutes: number; launcherMinutes: number;
  equippedPlate: string | null;
  roles: { staff: boolean; developer: boolean; trustedDeveloper: boolean };
  popularPlugin: { evidence: string | null; setAt: string } | null;
  xpSources: XpSource[]; nameplates: MyNameplates & { bonusStacking: boolean; equippedPlate: Nameplate | null };
  requirements: Record<string, { level: number; met: boolean }>;
  applications: { id: string; kind: string; state: string; note: string | null; created_at: string; reviewed_at: string | null }[];
}
export interface StoreItem { id: string; name: string; summary: string; category: string; version: string; publisher: string; description: string }
export interface Ticket { id: string; subject: string; body: string; status: string; created_at: string; version: number }
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }

// 开发环境走同源相对路径（vite 代理 → 本地 nexa-auth :5733）；生产仍直连认证域。
const AUTH_BASE = import.meta.env.DEV ? '' : 'https://auth.pcln.top';
export const POLICY_VERSION = '1.0';
export interface RegisterCompletePayload { name: string; handle: string; password?: string; totpId?: string; totpCode?: string }

let accessToken = '', currentUser: Session | undefined, restoring: Promise<Session | undefined> | undefined;

const authHeaders = (): Record<string, string> => accessToken ? { Authorization: 'Bearer ' + accessToken } : {};

async function authFetch(path: string, init: RequestInit = {}) {
  return fetch(AUTH_BASE + path, {
    ...init, credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Nexa-Request': '1', ...authHeaders(), ...init.headers },
    signal: init.signal ?? AbortSignal.timeout(15000)
  });
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init, credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Nexa-Request': '1', ...authHeaders(), ...init.headers },
    signal: init.signal ?? AbortSignal.timeout(15000)
  });
  if (response.status === 204) return undefined as T;
  if (!response.headers.get('content-type')?.match(/application\/(?:problem\+)?json/)) throw new Error('暂时无法连接平台服务，请稍后重试。');
  const body = await response.json();
  if (!response.ok) throw new ApiError(body.detail || body.message || `请求失败 (${response.status})`, response.status);
  return body as T;
}

export interface Page<T> { data: T[]; pagination: { limit: number; offset: number; total: number } }

// 访问令牌仅保存在内存中；页面刷新后用 auth 域 Cookie 会话静默换取新令牌。
async function mintToken(): Promise<Session | undefined> {
  const response = await authFetch('/auth/v1/tokens', { method: 'POST', body: '{}' });
  if (!response.ok) return undefined;
  const data = await response.json() as { token: string; user: { id: string; name: string; email?: string | null; staff?: 0 | 1; developer?: 0 | 1; termsAccepted?: number } };
  if (!data.token || !data.user?.id) return undefined;
  accessToken = data.token;
  currentUser = { ...data.user, scope: 'console' };
  return currentUser;
}

async function authJson<T>(response: Response | Promise<Response>, fallback: string): Promise<T> {
  const resolved = await response;
  if (!resolved.ok) {
    const body = await resolved.json().catch(() => ({ detail: '' }));
    throw new ApiError(body.detail || fallback, resolved.status);
  }
  return await resolved.json() as T;
}

// ---------- 仅前端测试账户（控制台输入 test_login() / test_logout()） ----------
// 只写本地内存 UI 状态：不签发真实令牌、不请求后端、不获得任何真实权限。
// 刷新页面即消失；所有真实接口仍然只信任服务端会话。
let testSession: Session | undefined;
const testState = {
  identities: [] as LinkedIdentity[],
  tickets: [] as Ticket[],
  privacy: [] as PrivacyRequest[],
  deletion: null as DeletionRequest | null,
  entitlements: {
    cloudPlus: true,
    subscriptions: [{ subscription_id: 'sub_local_test', status: 'active', price_id: 'pri_local_test', product_id: 'pro_cloud_plus', scheduled_change_action: null }]
  } as Entitlements
};
const testNow = () => new Date().toISOString();
const isTest = () => testSession !== undefined;
// 全局会话变更事件：登录 / 登出 / 测试账户切换都会广播，壳层与账户页据此同步，
// 修复“在账户页登出后不会回到登录卡”的问题。
export const SESSION_EVENT = 'nexa:session-changed';
const notifySessionChange = () => { try { window.dispatchEvent(new Event(SESSION_EVENT)); } catch { /* 非浏览器环境 */ } };
// 供 pluginCenter 等 API 层判断“测试账户 → 走本地桩数据”。
export const isTestSession = isTest;
const TEST_STORAGE_KEY = 'nexa.cloud.test-session.v1';

function seedTestState(session: Session): void {
  testState.identities = [
    { provider: 'github', email: session.email, created_at: testNow() },
    { provider: 'microsoft', email: session.email, created_at: testNow() }
  ];
  testState.tickets = [
    { id: 'ticket-local-1', subject: '示例支持请求', body: '这是仅前端的测试数据，可用来预览工单闭环。', status: 'open', created_at: testNow(), version: 1 },
    { id: 'ticket-local-2', subject: '已解决的示例请求', body: '用来预览“已解决”列表与状态徽章。', status: 'resolved', created_at: testNow(), version: 2 }
  ];
  testState.privacy = [];
  testState.deletion = null;
}

export function testLogin(overrides: Partial<Session> = {}): Session {
  // 默认即最高权限测试账户：staff + developer，解锁全部页面与入口；数据为本地桩，不触达真实 API。
  testSession = { id: 'local-test', name: 'Test', email: 'test@local.dev', staff: 1, developer: 1, termsAccepted: 1, scope: 'console', ...overrides };
  seedTestState(testSession);
  accessToken = ''; currentUser = testSession; restoring = undefined;
  try { localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(testSession)); } catch { /* 存储不可用时退化为非持久会话 */ }
  console.info('%c Nexa Cloud %c 已进入前端测试账户「Test」：staff + developer 全 UI 权限；数据为本地模拟，不触达真实 API。已持久化，刷新不失效；test_logout() 退出。', 'background:#1673e6;color:#fff;border-radius:4px 0 0 4px;padding:1px 6px', 'background:#e8f0fe;color:#0f5ecb;border-radius:0 4px 4px 0;padding:1px 6px');
  notifySessionChange();
  return testSession;
}

export function testLogout(): void {
  testSession = undefined; currentUser = undefined; accessToken = ''; restoring = undefined;
  try { localStorage.removeItem(TEST_STORAGE_KEY); } catch { /* ignore */ }
  console.info('已退出前端测试账户。');
  notifySessionChange();
}

// 页面加载即恢复持久化的测试会话：刷新后登录态与访问、跳转逻辑保持完整。
try {
  const stored = localStorage.getItem(TEST_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as Session;
    if (parsed && typeof parsed.name === 'string' && parsed.id === 'local-test') {
      testSession = parsed; currentUser = parsed; seedTestState(parsed);
    } else {
      localStorage.removeItem(TEST_STORAGE_KEY);
    }
  }
} catch { try { localStorage.removeItem(TEST_STORAGE_KEY); } catch { /* ignore */ } }

const testPolicyFixtures = (): PolicyStatus[] => {
  const acceptedAt = testSession?.termsAccepted ? '2026-09-26T08:00:00.000Z' : null;
  return [
    { kind: 'terms', version: POLICY_VERSION, effectiveAt: '2026-09-26T00:00:00.000Z', contentHash: '0123456789abcdef'.repeat(4), acceptedAt },
    { kind: 'privacy', version: POLICY_VERSION, effectiveAt: '2026-09-26T00:00:00.000Z', contentHash: 'abcdef0123456789'.repeat(4), acceptedAt }
  ];
};

// ---------- 铭牌墙 / 经验:仅前端测试账户的本地桩 ----------
// 规则的权威定义在后端 nexa-auth 的 src/nameplates.mjs,线上由 GET /auth/v1/nameplates 下发。
// 这里的副本只为 test_login() 在没有认证服务时也能渲染页面;调整铭牌请以后端为准并同步此处。
const TEST_THRESHOLDS: Record<string, number> = { 2: 2000, 3: 5000, 4: 10000, 5: 20000, 6: 50000, 7: 100000 };
const TEST_XP_SOURCES: XpSource[] = [
  { type: 'daily.login', label: '每日登录', reporter: 'launcher-or-web', mode: 'daily', xp: 50, dailyCap: 50, countsTowardDailyCap: true, claimedToday: true },
  { type: 'daily.launch', label: '每日启动', reporter: 'launcher', mode: 'daily', xp: 30, dailyCap: 30, countsTowardDailyCap: true, advancesLaunchStreak: true, unlocksLevelOne: true, claimedToday: false },
  { type: 'game.first_launch', label: '首次启动', reporter: 'launcher', mode: 'once', xp: 100, dailyCap: null, countsTowardDailyCap: false, unlocksLevelOne: true },
  { type: 'game.play_minutes', label: '游戏时长', reporter: 'launcher', mode: 'duration', xpPerMinute: 1, unit: 'minute', perEventUnitCap: 720, dailyCap: 480, countsTowardDailyCap: true },
  { type: 'launcher.online_minutes', label: 'Nexa 在线时长', reporter: 'launcher', mode: 'duration', xpPerMinute: 0.5, unit: 'minute', perEventUnitCap: 1440, dailyCap: 180, countsTowardDailyCap: true }
];
const PLATE_SEEDS: Nameplate[] = [
  { id: 'sub_lite', kind: 'subscription', label: 'Cloud+ Lite', tier: 'Lite', xpBonus: 1.10, replacesLevel: false, requirement: '订阅 Cloud+ Lite 或更高档位', detail: '入门档铭牌。订阅期间所有经验来源 +10%。' },
  { id: 'sub_standard', kind: 'subscription', label: 'Cloud+ Standard', tier: 'Standard', xpBonus: 1.25, replacesLevel: false, requirement: '订阅 Cloud+ Standard 或更高档位', detail: '均衡档铭牌。订阅期间所有经验来源 +25%。' },
  { id: 'sub_advanced', kind: 'subscription', label: 'Cloud+ Advanced', tier: 'Advanced', xpBonus: 1.45, replacesLevel: false, requirement: '订阅 Cloud+ Advanced 或更高档位', detail: '进阶档铭牌。订阅期间所有经验来源 +45%。' },
  { id: 'sub_ultimate', kind: 'subscription', label: 'Cloud+ Ultimate', tier: 'Ultimate', xpBonus: 1.75, replacesLevel: false, requirement: '订阅 Cloud+ Ultimate 档位', detail: '全量档铭牌。订阅期间所有经验来源 +75%。' },
  { id: 'lv_infinity', kind: 'level', label: 'Lv∞', xpBonus: 2.00, replacesLevel: true, requirement: '达到 Lv7 + 通过 ∞ 答题 + Minecraft 累计时长超过 1000 小时', detail: '三重门槛的封顶铭牌。三项全部达成后永久保留。' },
  { id: 'lv_minus_one', kind: 'level', label: 'Lv-1', xpBonus: 1.50, replacesLevel: true, requirement: '成为网站管理员', detail: '站务铭牌。与管理员身份绑定,身份被撤销时一并收回。' },
  { id: 'lv_mc', kind: 'level', label: 'LvMC', xpBonus: 1.60, replacesLevel: true, requirement: '连续 100 天启动 Minecraft', detail: '恒心铭牌。以历史最长连击为准,断签后不会消失。' },
  { id: 'from_bilibili', kind: 'badge', label: 'b站来的', xpBonus: 1.05, replacesLevel: false, requirement: '在 Bilibili 达到 Lv6', detail: '需人工核验后由运营写入标记。' },
  { id: 'yellow_badge', kind: 'badge', label: '小黄标', xpBonus: 1.15, replacesLevel: false, requirement: 'Bilibili 粉丝大于 100 万', detail: '需人工核验后由运营写入标记。' },
  { id: 'i_like_you', kind: 'badge', label: '我喜欢你', xpBonus: 1.30, replacesLevel: false, requirement: '为 Nexa 无偿捐献 1000+', detail: '无偿捐献(非购买订阅或商品),需人工核验。' }
];
// 测试账户的铭牌状态:刻意混合「已拥有 / 差一点 / 完全未达成」,便于预览三种视觉状态。
const testPlates = {
  xp: 24680, launched: true, streak: 12, streakBest: 42,
  gameMinutes: 41230, launcherMinutes: 8600,
  owned: ['sub_lite', 'sub_standard', 'sub_advanced', 'from_bilibili', 'i_like_you'] as string[],
  equipped: null as string | null
};
const testWall = (): NameplateWall => ({
  plates: PLATE_SEEDS.map(p => ({ ...p })),
  levels: { ...TEST_THRESHOLDS }, maxLevel: 7,
  xpSources: TEST_XP_SOURCES.map(s => ({ ...s })),
  dailyCap: 700, bonusStacking: false,
  bonusNote: '多枚铭牌不叠加,取已拥有铭牌中的最高加成'
});
// 本地复刻后端的进度派生,让测试账户也能看到进度条与分条件清单。
const testEvaluate = (seed: Nameplate): Nameplate => {
  const t = testPlates, owned = t.owned.includes(seed.id);
  const level = computeTestLevel(t.xp, t.launched);
  switch (seed.id) {
    case 'lv_infinity': return { ...seed, owned, parts: [
      { label: '达到 Lv7', done: level >= 7, have: level, need: 7, unit: '级' },
      { label: '通过 ∞ 答题', done: false },
      { label: 'MC 时长 1000 小时', done: t.gameMinutes >= 60000, have: t.gameMinutes, need: 60000, unit: '分钟' }
    ] };
    case 'lv_minus_one': return { ...seed, owned, progress: { have: owned ? 1 : 0, need: 1, unit: '项' } };
    case 'lv_mc': return { ...seed, owned, progress: { have: Math.min(t.streakBest, 100), need: 100, unit: '天' } };
    case 'from_bilibili': return { ...seed, owned, progress: { have: owned ? 6 : 0, need: 6, unit: '级' } };
    case 'yellow_badge': return { ...seed, owned, progress: { have: 120000, need: 1000000, unit: '粉丝' } };
    case 'i_like_you': return { ...seed, owned, progress: { have: owned ? 1000 : 0, need: 1000, unit: '元' } };
    default: {
      const rank = ['Lite', 'Standard', 'Advanced', 'Ultimate'].indexOf(seed.tier ?? '') + 1;
      const have = owned ? rank : Math.max(0, rank - 1);
      return { ...seed, owned, progress: { have: Math.min(have, rank), need: rank, unit: '档' } };
    }
  }
};
function computeTestLevel(xp: number, launched: boolean): number {
  if (!launched) return 0;
  let level = 1;
  for (let l = 2; l <= 7; l++) { if (xp >= TEST_THRESHOLDS[l]) level = l; else break; }
  return level;
}
const testMyPlates = (): MyNameplates => {
  const plates = PLATE_SEEDS.map(testEvaluate);
  const owned = plates.filter(p => p.owned);
  const bonus = owned.reduce((max, p) => Math.max(max, p.xpBonus), 1);
  const equipped = owned.find(p => p.id === testPlates.equipped) ?? null;
  const level = computeTestLevel(testPlates.xp, testPlates.launched);
  return { plates, bonus, equipped: equipped?.id ?? null, hidesLevel: Boolean(equipped?.replacesLevel), displayLevel: equipped?.replacesLevel ? null : level };
};

export const platform = {
  oauthStart: (provider: 'github' | 'microsoft' | 'google', returnTo = '/account', mode: 'login' | 'link' = 'login') => {
    if (isTest()) {
      if (mode === 'link' && !testState.identities.some(i => i.provider === provider)) testState.identities.push({ provider, email: testSession?.email ?? null, created_at: testNow() });
      console.info(`[test] 已模拟 ${provider} ${mode === 'link' ? '关联' : '登录'}，未离开页面。`);
      return;
    }
    const target = new URL(`/auth/v1/oauth/${provider}/start`, AUTH_BASE || window.location.origin);
    target.searchParams.set('return_to', returnTo);
    target.searchParams.set('mode', mode);
    target.searchParams.set('scope', 'console');
    if (mode === 'login') target.searchParams.set('tos', POLICY_VERSION);
    window.location.assign(target.toString());
  },
  session: () => {
    if (testSession) return Promise.resolve(testSession);
    if (currentUser) return Promise.resolve(currentUser);
    restoring ??= mintToken().catch(() => undefined).finally(() => { restoring = undefined; });
    return restoring;
  },
  acceptPolicies: async () => {
    if (isTest()) { if (testSession) testSession.termsAccepted = 1; return { terms: { acceptedAt: testNow() } }; }
    const result = await authJson<{ terms: { acceptedAt: string } }>(await authFetch('/auth/v1/policies/accept', { method: 'POST', body: '{}' }), '接受条款失败，请重试。');
    if (currentUser) currentUser.termsAccepted = 1;
    return result;
  },
  policiesStatus: async () => {
    if (isTest()) return { policies: testPolicyFixtures() };
    return authJson<{ policies: PolicyStatus[] }>(authFetch('/auth/v1/policies/status'), '暂时无法读取政策状态。');
  },
  identities: async () => {
    if (isTest()) return { identities: [...testState.identities] };
    const response = await authFetch('/auth/v1/identities');
    if (!response.ok) throw new ApiError('暂时无法读取已关联的账号。', response.status);
    return await response.json() as { identities: LinkedIdentity[] };
  },
  unbind: async (provider: LinkedIdentity['provider']) => {
    if (isTest()) { testState.identities = testState.identities.filter(i => i.provider !== provider); return; }
    const response = await authFetch('/auth/v1/identities/' + provider, { method: 'DELETE' });
    if (!response.ok) {
      const body = await response.json().catch(() => ({ detail: '' }));
      throw new ApiError(body.detail || '解绑失败，请重试。', response.status);
    }
  },
  deletionStatus: async () => {
    if (isTest()) return { request: testState.deletion, cooldownDays: 7 };
    return authJson<{ request: DeletionRequest | null; cooldownDays: number }>(authFetch('/auth/v1/account/delete'), '暂时无法读取注销状态。');
  },
  requestDeletion: async () => {
    if (isTest()) {
      testState.deletion = { id: 'del-local', state: 'pending', requestedAt: testNow(), executeAfter: Date.now() + 7 * 864e5, cancelledAt: null, finalizedAt: null };
      return { request: testState.deletion };
    }
    return authJson<{ request: DeletionRequest }>(authFetch('/auth/v1/account/delete', { method: 'POST', body: '{}' }), '注销申请失败，请重试。');
  },
  cancelDeletion: async () => {
    if (isTest()) { if (testState.deletion) { testState.deletion.state = 'cancelled'; testState.deletion.cancelledAt = testNow(); } return { ok: true }; }
    return authJson<{ ok: boolean }>(authFetch('/auth/v1/account/delete', { method: 'DELETE' }), '撤销注销失败，请重试。');
  },
  exportData: async () => {
    if (isTest()) return { account: testSession, identities: testState.identities, tickets: testState.tickets, privacyRequests: testState.privacy, note: '仅前端测试数据' } as Record<string, unknown>;
    return authJson<Record<string, unknown>>(authFetch('/auth/v1/account/export'), '数据导出失败，请重试。');
  },
  privacyRequests: async () => {
    if (isTest()) return { requests: [...testState.privacy] };
    return authJson<{ requests: PrivacyRequest[] }>(authFetch('/auth/v1/privacy-requests'), '暂时无法读取隐私请求。');
  },
  createPrivacyRequest: async (type: string) => {
    if (isTest()) {
      const entry: PrivacyRequest = { id: 'pr-local-' + (testState.privacy.length + 1), type, state: 'pending', createdAt: testNow(), updatedAt: testNow() };
      testState.privacy.push(entry);
      return { request: entry };
    }
    return authJson<{ request: PrivacyRequest }>(authFetch('/auth/v1/privacy-requests', { method: 'POST', body: JSON.stringify({ type }) }), '隐私请求提交失败，请重试。');
  },
  entitlements: async () => {
    if (isTest()) return testState.entitlements;
    return request<Entitlements>('/billing/entitlements');
  },
  billingPortal: async () => {
    if (isTest()) { console.info('[test] 测试模式不打开支付门户。'); return; }
    const result = await request<{ url: string }>('/billing/portal', { method: 'POST' });
    window.location.assign(result.url);
  },
  // ---- 注册完善与登录（nexa-auth 提供）。注册必须先经第三方身份验证，此处仅完善资料。 ----
  registerComplete: async (payload: RegisterCompletePayload) => {
    const result = await authJson<{ ok: boolean; handle: string; name: string; passwordSet: boolean }>(authFetch('/auth/v1/register/complete', { method: 'POST', body: JSON.stringify(payload) }), '完成注册失败');
    accessToken = ''; currentUser = undefined; restoring = undefined; // 强制刷新缓存的会话（setupRequired 已变化）
    notifySessionChange();
    return result;
  },
  loginWithPassword: async (handle: string, password: string) => {
    const response = await authFetch('/auth/v1/login', { method: 'POST', body: JSON.stringify({ handle, password }) });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}) as { detail?: string; code?: string });
      throw new ApiError(body.code === 'mfa_enrollment_required' ? '该账户尚未注册两步验证：请先用第三方方式登录一次，并在「安全性与登录」中注册 passkey 或验证器应用。' : (body.detail || '用户 ID 或密码不正确'), response.status);
    }
    return await response.json() as LoginChallenge;
  },
  loginWithCode: async (challenge: string, code: string) => {
    const result = await authJson<{ ok: boolean; method: string; recovery?: { remaining: number }; user: { id: string; name: string } }>(authFetch('/auth/v1/login/totp', { method: 'POST', body: JSON.stringify({ challenge, code }) }), '验证码不正确或挑战已过期');
    accessToken = ''; currentUser = undefined; restoring = undefined;
    notifySessionChange();
    return result;
  },
  loginPasskeyOptions: (challenge: string) => authJson<AssertOptions>(authFetch('/auth/v1/login/passkey/options', { method: 'POST', body: JSON.stringify({ challenge }) }), '获取 passkey 选项失败'),
  loginPasskey: async (payload: { challenge: string } & PasskeyAssertion) => {
    const result = await authJson<{ ok: boolean; user: { id: string; name: string } }>(authFetch('/auth/v1/login/passkey', { method: 'POST', body: JSON.stringify(payload) }), 'passkey 校验失败');
    accessToken = ''; currentUser = undefined; restoring = undefined;
    notifySessionChange();
    return result;
  },
  mfaFactors: () => authJson<MfaFactors>(authFetch('/auth/v1/mfa/factors'), '读取两步验证状态失败'),
  updateDisplayName: (name: string) => authJson<{ ok: boolean; name: string }>(authFetch('/auth/v1/account/name', { method: 'PATCH', body: JSON.stringify({ name }) }), '修改用户名失败'),
  handleAvailability: (handle: string) => authJson<{ available: boolean; reason?: string }>(authFetch('/auth/v1/account/handle/availability?handle=' + encodeURIComponent(handle)), '查询失败'),
  updateHandle: (handle: string) => authJson<{ ok: boolean; handle: string; nextChangeAt: string }>(authFetch('/auth/v1/account/handle', { method: 'PUT', body: JSON.stringify({ handle }) }), '修改用户 ID 失败'),
  setPassword: (password: string, currentPassword?: string) => authJson<{ ok: boolean; mfa: { required: boolean; factors: string[]; message: string } }>(authFetch('/auth/v1/account/password', { method: 'POST', body: JSON.stringify(currentPassword ? { password, currentPassword } : { password }) }), '保存密码失败'),
  totpEnroll: () => authJson<{ id: string; secret: string; otpauthUrl: string; expiresAt: string }>(authFetch('/auth/v1/mfa/totp/enroll', { method: 'POST', body: '{}' }), '发起注册失败'),
  totpConfirm: (id: string, code: string, name?: string | null) => authJson<{ ok: boolean; id: string }>(authFetch('/auth/v1/mfa/totp/confirm', { method: 'POST', body: JSON.stringify({ id, code, name }) }), '验证码不正确'),
  totpRemove: (id: string, password?: string) => authJson<{ ok: boolean }>(authFetch('/auth/v1/mfa/totp/' + encodeURIComponent(id), { method: 'DELETE', body: JSON.stringify({ password }) }), '停用失败'),
  passkeyRegisterOptions: () => authJson<RegisterOptions>(authFetch('/auth/v1/mfa/passkey/register/options', { method: 'POST', body: '{}' }), '获取注册选项失败'),
  passkeyRegister: (challenge: string, name: string | null, credential: CreatedPasskey) => authJson<{ ok: boolean; credentialId: string; name: string | null }>(authFetch('/auth/v1/mfa/passkey/register', { method: 'POST', body: JSON.stringify({ challenge, name, credential }) }), 'passkey 注册失败'),
  passkeyRemove: (credentialId: string, password?: string) => authJson<{ ok: boolean }>(authFetch('/auth/v1/mfa/passkey/' + encodeURIComponent(credentialId), { method: 'DELETE', body: JSON.stringify({ password }) }), '移除失败'),
  recoveryGenerate: (password?: string) => authJson<{ codes: string[]; note: string }>(authFetch('/auth/v1/mfa/recovery/generate', { method: 'POST', body: JSON.stringify({ password }) }), '生成恢复码失败'),
  recoveryReveal: (password?: string) => authJson<{ codes: string[]; missing: number }>(authFetch('/auth/v1/mfa/recovery/reveal', { method: 'POST', body: JSON.stringify({ password }) }), '读取恢复码失败'),
  // Microsoft 绑定时查询并存储的 Minecraft 拥有状况与档案（启动器自动添加档案的数据源）。
  minecraftProfile: async () => {
    if (isTest()) return { microsoftLinked: true, owned: 1, profileId: '8f6a1b2c3d4e5f60718293a4b5c6d7e8', profileName: 'TestPlayer', error: null, checkedAt: testNow() } as MinecraftProfile;
    return authJson<MinecraftProfile>(authFetch('/auth/v1/account/minecraft'), '读取 Minecraft 档案失败');
  },
  // ---------- 等级 / 经验 / 铭牌墙 ----------
  // 公开目录:未登录也可读取,供 /nameplates 铭牌墙页面渲染规则。
  nameplateWall: async (): Promise<NameplateWall> => {
    if (isTest()) return testWall();
    return authJson<NameplateWall>(authFetch('/auth/v1/nameplates'), '暂时无法读取铭牌墙，请稍后重试。');
  },
  // 我的铭牌:已拥有清单、未达成进度、生效加成与佩戴状态。
  myNameplates: async (): Promise<MyNameplates> => {
    if (isTest()) return testMyPlates();
    return authJson<MyNameplates>(authFetch('/auth/v1/account/nameplates'), '暂时无法读取我的铭牌。');
  },
  // 佩戴 / 卸下铭牌;只有 replacesLevel 的铭牌能隐藏等级数字。传 null 表示只显示等级。
  equipNameplate: async (plate: string | null): Promise<MyNameplates> => {
    if (isTest()) {
      if (plate && !testPlates.owned.includes(plate)) throw new ApiError('尚未达成该铭牌', 403);
      testPlates.equipped = plate;
      return testMyPlates();
    }
    await authJson<{ ok: boolean; equipped: string | null; hidesLevel: boolean }>(
      authFetch('/auth/v1/account/nameplates/equip', { method: 'PUT', body: JSON.stringify({ plate }) }), '佩戴铭牌失败');
    return platform.myNameplates();
  },
  // 账户等级总览:等级/经验进度/经验来源今日状态/连击/累计时长/铭牌与加成。
  accountLevel: async (): Promise<AccountLevel> => {
    if (isTest()) {
      const level = computeTestLevel(testPlates.xp, testPlates.launched);
      const nextLevel = level < 7 ? level + 1 : null;
      return {
        level, xp: testPlates.xp, micro: testPlates.xp * 1000, launched: testPlates.launched, firstLaunchAt: testNow(),
        next: nextLevel ? { level: nextLevel, threshold: TEST_THRESHOLDS[nextLevel], remaining: Math.max(0, TEST_THRESHOLDS[nextLevel] - testPlates.xp) } : null,
        maxLevel: 7, dailyCap: 700, thresholds: { ...TEST_THRESHOLDS },
        lastLoginDay: new Date().toISOString().slice(0, 10), lastLaunchDay: null,
        streak: testPlates.streak, streakBest: testPlates.streakBest,
        gameMinutes: testPlates.gameMinutes, launcherMinutes: testPlates.launcherMinutes,
        equippedPlate: testPlates.equipped,
        roles: { staff: testSession?.staff === 1, developer: testSession?.developer === 1, trustedDeveloper: false },
        popularPlugin: null,
        xpSources: TEST_XP_SOURCES.map(s => ({ ...s })),
        nameplates: { ...testMyPlates(), bonusStacking: false, equippedPlate: PLATE_SEEDS.map(testEvaluate).find(p => p.id === testPlates.equipped) ?? null },
        requirements: { developer: { level: 2, met: level >= 2 }, trustedDeveloper: { level: 3, met: false }, admin: { level: 4, met: level >= 4 } },
        applications: []
      };
    }
    return authJson<AccountLevel>(authFetch('/auth/v1/account/level'), '暂时无法读取等级与经验。');
  },
  logout: async () => {
    if (isTest()) { testLogout(); return; }
    try { await authFetch('/auth/v1/sessions/current?scope=console', { method: 'DELETE' }); } catch { /* 网络失败也要清除本地凭证 */ }
    accessToken = ''; currentUser = undefined;
    notifySessionChange();
  },
  catalog: (query: URLSearchParams) => request<Page<StoreItem>>('/resources?' + query),
  resource: (id: string) => request<StoreItem>('/resources/' + encodeURIComponent(id)),
  tickets: async (scope: string, offset = 0) => {
    if (isTest()) {
      const data = testState.tickets.slice(offset, offset + 50);
      return { data, pagination: { limit: 50, offset, total: testState.tickets.length } } as Page<Ticket>;
    }
    return request<Page<Ticket>>(`/tickets?scope=${scope}&limit=50&offset=${offset}`);
  },
  createTicket: async (subject: string, body: string) => {
    if (isTest()) { testState.tickets.unshift({ id: 'ticket-local-' + Date.now(), subject, body, status: 'open', created_at: testNow(), version: 1 }); return {}; }
    return request('/tickets', { method: 'POST', body: JSON.stringify({ subject, body }) });
  },
  resolve: async (ticket: Ticket) => {
    if (isTest()) { const target = testState.tickets.find(t => t.id === ticket.id); if (target) { target.status = 'resolved'; target.version += 1; } return {}; }
    return request(`/tickets/${encodeURIComponent(ticket.id)}`, { method: 'PATCH', headers: { 'If-Match': '"' + ticket.version + '"' }, body: JSON.stringify({ status: 'resolved' }) });
  }
};
