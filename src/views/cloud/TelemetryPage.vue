<template>
  <div class="telemetry-page">
    <p v-if="checking" class="empty-state" role="status">正在检查会话…</p>
    <section v-else-if="!session" class="work-panel gate">
      <h2>需要登录</h2>
      <p>遥测与诊断控制台仅对登录的网站管理员开放。</p>
      <router-link class="primary-button" to="/account">前往登录</router-link>
    </section>
    <section v-else-if="!session.staff" class="work-panel gate">
      <span class="status-pill">权限不足</span>
      <h2>仅网站管理员可见</h2>
      <p>你的账户目前不是网站管理员，可在「账户 → 网站管理」中了解申请通道。</p>
      <router-link class="secondary-button" to="/account?section=website">返回账户</router-link>
    </section>
    <template v-else>
      <router-link class="text-link back-link" to="/account?section=website">‹ 返回网站管理</router-link>
      <Telemetry />
    </template>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { platform, type Session } from '@/api/platform';
import Telemetry from '@/views/admin/telemetry/index.vue';
import { applyPageSeo } from '@/utils/seo';
const session = ref<Session>(), checking = ref(true);
onMounted(async () => { try { session.value = await platform.session(); } finally { checking.value = false; } });
watchEffect(() => { applyPageSeo({ title: '遥测与诊断 · Nexa Cloud', description: '网站管理员的启动器遥测、诊断与灰度控制台。', path: '/operations/telemetry' }); });
</script>
<style scoped>
.telemetry-page{min-width:0}
.back-link{display:inline-block;margin-bottom:18px}
.gate{max-width:520px;margin:48px auto;text-align:center;padding:40px 36px}
.gate h2{margin:10px 0 8px}
.gate p{font-size:13px;color:var(--market-muted);margin-bottom:22px;line-height:1.8}
.gate .status-pill+h2{margin-top:12px}
</style>
