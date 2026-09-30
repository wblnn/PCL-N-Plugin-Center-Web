<template>
  <div class="cloud-shell">
    <a class="skip-link" href="#cloud-content">跳至内容</a>
    <header class="cloud-header">
      <router-link class="cloud-brand" to="/"><strong>NexaCL</strong></router-link>
      <nav aria-label="平台入口"><router-link to="/" :class="{active: route.path === '/'}">主页</router-link><router-link to="/download" :class="{active: route.path.startsWith('/download')}">下载</router-link><router-link to="/store" :class="{active: route.path.startsWith('/store')}">商店</router-link><router-link to="/nameplates" :class="{active: route.path.startsWith('/nameplates')}">铭牌墙</router-link><router-link to="/docs" :class="{active: route.path.startsWith('/docs')}">文档</router-link></nav>
      <div class="account-menu">
        <button class="account-status" type="button" :aria-expanded="Boolean(session && menuOpen)" aria-haspopup="menu" @click="openAccount"><span class="status-dot" aria-hidden="true"></span>{{ accountLabel }}</button>
        <div v-if="session && menuOpen" class="account-dropdown" role="menu"><router-link role="menuitem" to="/account" @click="menuOpen = false">我的账户</router-link><router-link role="menuitem" to="/account?section=level" @click="menuOpen = false">等级与铭牌</router-link><router-link role="menuitem" to="/account?section=developer" @click="menuOpen = false">开发者控制台</router-link><router-link role="menuitem" to="/account?section=website" @click="menuOpen = false">网站管理</router-link><div class="account-divider" role="separator"></div><button type="button" role="menuitem" @click="logout">退出登录</button></div>
      </div>
    </header>
    <div class="cloud-body">
      <main id="cloud-content" class="cloud-content"><router-view :key="route.path.startsWith('/store') ? 'store' : route.path" /></main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { platform, SESSION_EVENT, type Session } from '@/api/platform';
const route = useRoute(), router = useRouter();
const session = ref<Session>(), menuOpen = ref(false);
const accountLabel = computed(() => session.value ? (session.value.name || '账户管理') : '登录 / 注册');
async function loadSession() { session.value = await platform.session(); if (session.value && session.value.setupRequired) { void router.push('/register?setup=1'); return; } if (session.value && !session.value.termsAccepted && route.path !== '/account') void router.push('/account'); }
function openAccount() { if (!session.value) { menuOpen.value = false; void router.push({ path: '/login', query: { return: route.fullPath } }); return; } menuOpen.value = !menuOpen.value; }
async function logout() { menuOpen.value = false; if (!session.value) return router.push({ path: '/login', query: { return: route.fullPath } }); await platform.logout(); session.value = undefined; await router.push({ path: '/login', query: { return: route.fullPath } }); }
const onFocus = () => void loadSession();
// Close the account dropdown when clicking anywhere outside of it.
function onDocumentClick(event: MouseEvent) {
  if (!menuOpen.value) return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.closest('.account-menu')) menuOpen.value = false;
}
router.afterEach(() => { menuOpen.value = false; });
onMounted(() => { void loadSession(); window.addEventListener('focus', onFocus); window.addEventListener(SESSION_EVENT, onFocus); });
onUnmounted(() => { window.removeEventListener('focus', onFocus); window.removeEventListener(SESSION_EVENT, onFocus); document.removeEventListener('click', onDocumentClick); });
</script>
