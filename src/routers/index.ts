import { createRouter, createWebHistory } from 'vue-router';
import { startProgress, doneProgress } from '@/utils/progressBar';
import CloudShell from '@/views/cloud/CloudShell.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: CloudShell, children: [
      { path: '', component: () => import('@/views/cloud/Home.vue') },
      { path: 'store', component: () => import('@/views/cloud/Store.vue') },
      { path: 'store/:id', component: () => import('@/views/cloud/Store.vue') },
      { path: 'download', component: () => import('@/views/site/download.vue') },
      { path: 'changelog', component: () => import('@/views/site/changelog.vue') },
      { path: 'account', component: () => import('@/views/cloud/Account.vue') },
      { path: 'nameplates', component: () => import('@/views/cloud/Nameplates.vue') },
      { path: 'docs', component: () => import('@/views/cloud/Placeholder.vue'), props: { title: '文档', eyebrow: 'DOCUMENTATION', description: '' } },
      { path: 'pricing', component: () => import('@/views/cloud/Pricing.vue') },
      { path: 'welcome', component: () => import('@/views/cloud/Welcome.vue') },
      { path: 'legal', component: () => import('@/views/cloud/LegalDocs.vue') },
      { path: 'legal/:doc', component: () => import('@/views/cloud/LegalDocs.vue') },
      { path: 'console', redirect: '/account' },
      { path: 'operations', redirect: '/account' },
      { path: 'operations/telemetry', redirect: '/account?section=website' },
      { path: 'about', redirect: '/' }
    ] },
    { path: '/launcher', redirect: '/' },
    { path: '/download/thanks', component: () => import('@/views/site/download-thanks.vue') },
    { path: '/download/legacy', redirect: '/download?product=legacy' },
    { path: '/market', redirect: '/store' },
    { path: '/market/plugins/:id', redirect: to => `/store/${encodeURIComponent(String(to.params.id))}` },
    { path: '/admin/telemetry', redirect: '/account?section=website' },
    { path: '/developer', redirect: '/account?section=developer' },
    { path: '/website-management', redirect: '/account?section=website' },
    { path: '/home', redirect: '/' },
    { path: '/login', component: () => import('@/views/cloud/Login.vue') },
    { path: '/register', component: () => import('@/views/cloud/Register.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/cloud/NotFound.vue') }
  ]
});
// 统一的页面标题体系：<页面名> · NexaCL；主页使用完整品牌标题。
// 带 applyPageSeo 的页面（主页/下载/更新日志/登录/注册）会在挂载时用各自的 SEO 标题覆写。
const ROUTE_TITLES: Record<string, string> = { '/login': '登录', '/register': '创建账户', '/account': '账户', '/store': '商店', '/download': '下载', '/changelog': '更新日志', '/pricing': 'Cloud+ 订阅', '/nameplates': '铭牌墙', '/docs': '文档', '/welcome': '欢迎' };
function titleFor(path: string): string {
  if (path === '/') return 'NexaCL — 一个更省心的 Minecraft 启动器';
  if (ROUTE_TITLES[path]) return `${ROUTE_TITLES[path]} · NexaCL`;
  if (path.startsWith('/legal')) return '法律文档 · NexaCL';
  if (path.startsWith('/store')) return '商店 · NexaCL';
  if (path.startsWith('/download')) return '下载 · NexaCL';
  if (path.startsWith('/account')) return '账户 · NexaCL';
  if (path.startsWith('/nameplates')) return '铭牌墙 · NexaCL';
  return 'NexaCL';
}
router.beforeEach(() => { startProgress(); });
router.afterEach(() => { doneProgress(); });
router.onError(() => { doneProgress(); });
router.afterEach(to => { document.title = titleFor(to.path); });
export default router;
