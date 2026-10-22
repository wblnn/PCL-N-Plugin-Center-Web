<template><main id="main-content" class="changes-main"><section class="changes-intro"><p class="eyebrow">PCL NEXA</p><h1>{{ en ? 'What’s new.' : '每一步，都有记录。' }}</h1><p>{{ en ? 'Release notes for NexaCL 2.0.' : 'NexaCL 2.0 的版本更新与改进。' }}</p></section><div class="changes-toolbar"><router-link to="/download">‹ {{ en ? 'Downloads' : '返回下载' }}</router-link><a :href="NEXA_GITHUB + '/releases'" target="_blank" rel="noreferrer">GitHub Releases ↗</a></div><p v-if="loading" class="load-message" role="status">{{ en ? 'Loading release notes…' : '正在读取更新日志…' }}</p><p v-else-if="!releases.length" class="load-message" role="status">{{ en ? 'Release notes are unavailable here. View them on GitHub.' : '暂时无法读取更新日志，请前往 GitHub 查看。' }}</p><p v-if="snapshot" class="release-source" role="status">{{ en ? "GitHub is unavailable. Showing saved release notes." : "暂时无法连接 GitHub，当前显示已保存的更新记录。" }}</p><article v-for="release in releases" :key="release.tag_name" class="release-entry"><header><span class="status-pill">{{ nexaChannel(release.tag_name)?.toUpperCase() }}</span><h2>{{ release.tag_name.replace(/^v/, '') }}</h2><time :datetime="release.published_at">{{ formatDate(release.published_at) }}</time><a :href="release.html_url" target="_blank" rel="noreferrer">{{ en ? 'View on GitHub' : '在 GitHub 查看' }} ↗</a></header><div class="release-body"><p class="release-source">{{ en ? 'From the project’s published release notes. Original language retained.' : '以下为项目发布的原始更新记录。' }}</p><p v-if="!release.body">{{ en ? 'No release notes were provided for this version.' : '此版本未提供更新说明。' }}</p><div v-for="(line, index) in notes(release.body)" :key="index" :class="line.kind">{{ line.text }}</div></div></article></main></template>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { NEXA_GITHUB, loadNexaCatalog, nexaChannel, type NexaRelease } from '@/utils/nexaReleases';
import { watchReleaseUpdates } from '@/utils/githubReleases';
import { applyPageSeo } from '@/utils/seo';
const { locale } = useI18n(); const en = computed(() => locale.value !== 'zh');
const releases = ref<NexaRelease[]>([]); const loading = ref(true); const controller = new AbortController();
const snapshot = ref(false); let refreshing = false; let stopUpdates: (() => void) | undefined;
async function refresh() {
  if (refreshing) return; refreshing = true;
  try { const catalog = await loadNexaCatalog(controller.signal); if (!controller.signal.aborted) { if (catalog.source === "github" || !releases.value.length) releases.value = catalog.releases; snapshot.value = catalog.source === 'snapshot'; } }
  catch { /* Keep the last displayed release notes during a transient outage. */ }
  finally { if (!controller.signal.aborted) loading.value = false; }
}
onMounted(() => { void refresh(); stopUpdates = watchReleaseUpdates(() => { void refresh(); }); });
onBeforeUnmount(() => { stopUpdates?.(); controller.abort(); });
const formatDate = (date: string) => new Intl.DateTimeFormat(en.value ? 'en' : 'zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
function notes(body: string) { const start = body.search(/^## (更新内容|更新日志|Changes|Changelog|What's Changed)/mi); const content = start >= 0 ? body.slice(start) : body; return content.split('\n').filter(l => l.trim()).map(line => ({ kind: line.startsWith('#') ? 'note-heading' : /^\s*[-*] /.test(line) ? 'note-item' : 'note-paragraph', text: line.replace(/^#{1,6}\s+/g, '').replace(/^\s*[-*]\s+/g, '').replace(/\*\*|`/g, '') })); }
watchEffect(() => { applyPageSeo({ title: en.value ? 'NexaCL — Changelog' : 'NexaCL — 更新日志', description: en.value ? 'Read the published release notes for NexaCL 2.0.' : '查看 NexaCL 2.0 的发布记录、更新内容和改进。', path: '/changelog' }); document.documentElement.lang = en.value ? 'en' : 'zh-CN'; });
</script>
<style scoped>
.changes-main{max-width:1000px;margin:0 auto;padding-bottom:40px}
.changes-intro{text-align:center;padding:22px 0 30px}.changes-intro h1{font-size:28px;font-weight:650;letter-spacing:-.02em;margin:10px 0 0}.changes-intro>p:not(.eyebrow){font-size:13.5px;color:var(--market-muted);margin-top:10px}
.changes-toolbar{display:flex;justify-content:space-between;border-bottom:1px solid var(--market-border);padding:10px 0 18px;gap:20px;font-size:12.5px}
.release-entry{display:grid;grid-template-columns:190px minmax(0,1fr);gap:44px;padding:38px 0;border-bottom:1px solid var(--market-border)}
.release-entry header{display:flex;align-items:flex-start;flex-direction:column;gap:13px}
.release-entry h2{font-size:19px;font-weight:650;overflow-wrap:anywhere}
.release-entry time{font-size:12px;color:var(--market-muted)}
.release-entry header>a{font-size:12px}
.release-source{color:var(--market-muted);font-size:12px;margin-bottom:16px}
.release-body{overflow-wrap:anywhere}
.note-heading{font-size:16px;font-weight:650;margin:20px 0 13px}
.note-item{position:relative;padding-left:16px;margin:9px 0;line-height:1.85;font-size:13px;color:var(--market-text)}
.note-item:before{content:'•';position:absolute;left:0;color:var(--market-muted)}
.note-paragraph{margin:9px 0;line-height:1.85;font-size:13px;color:var(--market-text)}
.load-message{padding:40px 0;color:var(--market-muted);font-size:13px}
@media(max-width:700px){.release-entry{grid-template-columns:1fr;gap:18px;padding:28px 0}.release-entry header{gap:9px}.changes-main{padding-bottom:24px}.changes-intro h1{font-size:24px}}
</style>
