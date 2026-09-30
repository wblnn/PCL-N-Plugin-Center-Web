<template>
  <p v-if="checking" class="empty-state" role="status">正在检查会话…</p>
  <div v-else-if="session && !session.termsAccepted" class="account-panel">
    <section class="work-panel accept-panel">
      <span class="status-pill">需要确认</span>
      <h2>接受《Nexa Cloud 服务条款 v1.0》</h2>
      <p>在继续使用账户功能前，请阅读并接受当前生效的服务条款。《<router-link to="/legal/privacy">隐私政策</router-link>》说明了数据处理方式，将随接受一并记录。</p>
      <label class="accept-check"><input type="checkbox" v-model="acceptChecked" />我已阅读并接受《<router-link to="/legal/terms">Nexa Cloud 服务条款 v1.0</router-link>》，并知悉《隐私政策》的内容。</label>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <button class="primary-button" :disabled="busy || !acceptChecked" @click="accept">接受并继续</button>
    </section>
  </div>
  <div v-else-if="session" class="account-layout">
    <nav class="account-nav" aria-label="账户分类">
      <button v-for="item in navItems" :key="item.key" type="button" :class="{ active: section === item.key }" @click="section = item.key"><span class="nav-icon" :style="{ background: item.color }" aria-hidden="true"><KoiIcon :name="item.icon" /></span>{{ item.label }}</button>
    </nav>
    <div class="account-panel">
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>

      <template v-if="section === 'overview'">
        <section class="work-panel"><div class="overview-hero"><span class="overview-avatar" aria-hidden="true">{{ (session.name || 'N')[0].toUpperCase() }}</span><div><p class="eyebrow">ACCOUNT</p><h1>{{ session.name }}</h1><p class="overview-mail">{{ session.email || '第三方身份账户' }}</p><div class="overview-chips"><!-- 佩戴了可代替等级的铭牌时只显示铭牌,否则显示 Lv + 铭牌 --><span v-if="levelInfo && !levelInfo.nameplates.hidesLevel" class="status-pill plate-pill level">Lv{{ levelInfo.level }}</span><span v-if="equippedPlate" class="status-pill plate-pill" :style="{ background: artFor(equippedPlate.id).tint, color: artFor(equippedPlate.id).accent }"><KoiIcon :name="artFor(equippedPlate.id).icon" />{{ equippedPlate.label }}</span><span class="status-pill">已登录</span></div></div></div><div class="shortcut-grid"><button v-for="item in navItems.filter(i => i.key !== 'overview')" :key="item.key" type="button" @click="section = item.key"><span class="nav-icon" :style="{ background: item.color }" aria-hidden="true"><KoiIcon :name="item.icon" /></span><span>{{ item.label }}</span></button></div></section>
        <section class="work-panel"><h2>会话</h2><p>登录状态 24 小时有效。</p><button class="danger-button" :disabled="busy" @click="logout">退出登录</button></section>
      </template>

      <template v-else-if="section === 'level'">
        <!-- 等级与当前展示 -->
        <section class="work-panel">
          <div class="section-heading">
            <div><p class="eyebrow">LEVEL</p><h2>等级与经验</h2></div>
            <button class="secondary-button" :disabled="levelLoading" @click="loadLevel">刷新</button>
          </div>
          <p v-if="levelLoading && !levelInfo">正在读取…</p>
          <template v-else-if="levelInfo">
            <div class="level-hero">
              <!-- 佩戴了 replacesLevel 铭牌时,只显示铭牌、隐藏 Lv 数字 -->
              <span v-if="levelInfo.nameplates.hidesLevel && equippedPlate" class="level-badge plate" :style="{ background: artFor(equippedPlate.id).tint, color: artFor(equippedPlate.id).accent }">
                <KoiIcon :name="artFor(equippedPlate.id).icon" />{{ equippedPlate.label }}
              </span>
              <span v-else class="level-badge">Lv{{ levelInfo.level }}</span>
              <div class="level-hero-meta">
                <p class="level-xp"><strong>{{ formatCount(levelInfo.xp) }}</strong> XP<span v-if="levelInfo.nameplates.bonus > 1"> · 铭牌加成 ×{{ levelInfo.nameplates.bonus.toFixed(2) }}</span></p>
                <p v-if="levelInfo.next" class="level-next">距 Lv{{ levelInfo.next.level }} 还需 {{ formatCount(levelInfo.next.remaining) }} XP</p>
                <p v-else class="level-next">已达到最高等级 Lv{{ levelInfo.maxLevel }}</p>
                <div class="level-track"><i :style="{ width: levelProgress + '%' }"></i></div>
              </div>
            </div>
            <div class="level-stats">
              <div><b>{{ levelInfo.streak }}</b><span>当前连续启动</span></div>
              <div><b>{{ levelInfo.streakBest }}</b><span>最长连续启动（天）</span></div>
              <div><b>{{ formatMinutes(levelInfo.gameMinutes) }}</b><span>Minecraft 累计时长</span></div>
              <div><b>{{ formatMinutes(levelInfo.launcherMinutes) }}</b><span>Nexa 在线累计</span></div>
            </div>
            <p v-if="!levelInfo.launched" class="form-error" role="status">尚未启动过游戏：启动一次 Minecraft 即可从 Lv0 升到 Lv1。</p>
            <p v-if="levelMsg" class="form-success" role="status">{{ levelMsg }}</p>
            <p v-if="levelError" class="form-error" role="alert">{{ levelError }}</p>
          </template>
        </section>

        <!-- 经验来源 -->
        <section v-if="levelInfo" class="work-panel">
          <h2>怎么加经验</h2>
          <p>经验全部由<strong>启动器上报</strong>，数值由服务端决定。每日上限 {{ levelInfo.dailyCap }} XP{{ dailyXpToday ? `，今日已领取 ${dailyXpToday} 项定额经验。` : '。' }}</p>
          <div class="source-list">
            <div v-for="source in levelInfo.xpSources" :key="source.type" class="source-item">
              <span class="source-icon" aria-hidden="true"><KoiIcon :name="sourceIcon(source.type)" /></span>
              <div class="source-meta">
                <h3>{{ source.label }}</h3>
                <small>{{ sourceValue(source) }} · {{ sourceClaimText(source) }}</small>
              </div>
              <span v-if="source.mode === 'daily'" class="status-pill" :class="{ claimed: source.claimedToday }">{{ source.claimedToday ? '已领取' : '待领取' }}</span>
              <span v-else-if="source.mode === 'once'" class="status-pill" :class="{ claimed: Boolean(levelInfo.firstLaunchAt) }">{{ levelInfo.firstLaunchAt ? '已完成' : '未完成' }}</span>
              <span v-else class="status-pill">{{ source.dailyCap }} XP/日</span>
            </div>
          </div>
          <p class="source-hint">完整规则、日上限与等级阈值见 <router-link to="/nameplates">铭牌墙</router-link>。</p>
        </section>

        <!-- 我的铭牌 -->
        <section v-if="levelInfo" class="work-panel">
          <div class="section-heading">
            <div><h2>我的铭牌</h2></div>
            <router-link class="secondary-button" to="/nameplates">查看全部规则</router-link>
          </div>
          <p>已获得 {{ ownedPlateCount }} / {{ myPlates.length }} 枚。{{ levelInfo.nameplates.bonus > 1 ? `当前生效加成 ×${levelInfo.nameplates.bonus.toFixed(2)}` : '暂无经验加成' }}（{{ levelInfo.nameplates.bonusStacking ? '多枚铭牌加成相乘叠加' : '多枚铭牌不叠加，取最高' }}）。</p>
          <template v-for="group in plateGroups" :key="group.kind">
            <h3 class="plate-group-title">{{ group.title }}</h3>
            <div class="my-plate-grid">
              <article v-for="plate in group.plates" :key="plate.id" class="my-plate" :class="{ owned: plate.owned }">
                <span class="plate-art" :style="{ background: artFor(plate.id).tint, color: artFor(plate.id).accent }" aria-hidden="true"><KoiIcon :name="artFor(plate.id).icon" /></span>
                <div class="plate-info">
                  <div class="plate-line">
                    <h4>{{ plate.label }}</h4>
                    <span class="plate-bonus-tag" :style="{ color: artFor(plate.id).accent }">{{ bonusLabel(plate.xpBonus) }}</span>
                  </div>
                  <p v-if="plate.replacesLevel" class="plate-replace">可代替等级</p>
                  <p class="plate-req">{{ plate.requirement }}</p>
                  <template v-if="!plate.owned">
                    <ul v-if="plate.parts" class="plate-parts">
                      <li v-for="part in plate.parts" :key="part.label" :class="{ done: part.done }">
                        <span>{{ part.label }}</span><b v-if="part.need">{{ formatCount(part.have ?? 0) }}/{{ formatCount(part.need) }}</b>
                      </li>
                    </ul>
                    <template v-else-if="plate.progress">
                      <div class="plate-track"><i :style="{ width: platePercent(plate.progress) + '%' }"></i></div>
                      <small>{{ plateProgressText(plate.progress) }}</small>
                    </template>
                  </template>
                </div>
                <div class="plate-actions">
                  <button v-if="plate.owned && levelInfo.nameplates.equipped !== plate.id" class="secondary-button" :disabled="plateBusy !== null" @click="equipPlate(plate)">佩戴</button>
                  <button v-else-if="plate.owned" class="primary-button" :disabled="plateBusy !== null" @click="equipPlate(null)">卸下</button>
                  <span v-else class="status-pill locked">未达成</span>
                </div>
              </article>
            </div>
          </template>
          <p class="source-hint">「b站来的」「小黄标」「我喜欢你」需人工核验：提交证明后由运营写入，随后在此自动出现。</p>
        </section>
      </template>

      <template v-else-if="section === 'linked'">
        <section class="work-panel"><h2>关联的账号</h2><p>可同时关联 GitHub、Google 和 Microsoft；至少保留一个登录方式。绑定 Microsoft 会请求 Xbox 权限，用于同步 Minecraft 拥有状况与游戏档案。</p><div v-for="p in providers" :key="p.id" class="identity-row"><span class="identity-icon" aria-hidden="true" v-html="PROVIDER_SVG[p.id]"></span><div class="meta"><h3>{{ p.name }}</h3><small v-if="bound(p.id)">{{ identityMail(p.id) }} · 已关联<template v-if="p.id === 'microsoft' && minecraftText"> · {{ minecraftText }}</template></small><small v-else>尚未关联</small></div><button v-if="!bound(p.id)" class="secondary-button" :disabled="busy" @click="bind(p.id)">关联 {{ p.name }}</button><button v-else-if="identities && identities.length > 1" class="danger-button" :disabled="busy" @click="unbind(p.id)">解除关联</button><span v-else class="status-pill">唯一登录方式</span></div></section>
      </template>

      <template v-else-if="section === 'security'">
        <section class="work-panel">
          <h2>安全性与登录</h2>
          <div class="profile-row"><span>登录方式</span><strong>{{ factors?.passwordSet ? '第三方 OAuth + 用户 ID 密码（强制两步验证）' : '第三方 OAuth（GitHub / Google / Microsoft）' }}</strong></div>
          <div class="profile-row"><span>登录密码</span><strong>{{ factors ? (factors.passwordSet ? '已设置' : '未设置') : '正在读取…' }}</strong><button v-if="!testMode && factors" class="secondary-button row-action" :disabled="pwDialog.busy" @click="openPasswordDialog">{{ factors.passwordSet ? '修改密码' : '设置密码' }}</button></div>
          <div class="profile-row"><span>会话有效期</span><strong>24 小时</strong></div>
          
          <p v-if="securityMsg" class="form-success" role="status">{{ securityMsg }}</p>
          
          <button class="danger-button" :disabled="busy" @click="logout">退出所有设备</button>
        </section>
        <p v-if="testMode" class="test-mode-note">前端测试账户不连接真实认证服务。</p>
        <section v-else class="work-panel">
          <div class="section-heading"><div><h2>两步验证（2FA）</h2></div><button class="secondary-button" :disabled="factorsLoading" @click="refreshFactors">刷新</button></div>
          <p>优先级：<strong>Passkey › 验证器应用 › 恢复码</strong>。</p>
          <p v-if="factorsLoading && !factors">正在读取…</p>
          <template v-else-if="factors">
            <h3 class="factor-title">Passkey（{{ factors.passkeys.length }}/10）</h3>
            <p v-if="!factors.passkeys.length" class="factor-empty">推荐：指纹 / 面容 / 设备 PIN，无需记码。</p>
            <div v-for="pk in factors.passkeys" :key="pk.credentialId" class="identity-row"><span class="identity-icon" aria-hidden="true"><KoiIcon name="key-square" /></span><div class="meta"><h3>{{ pk.name || '未命名 passkey' }}</h3><small>注册于 {{ new Date(pk.createdAt).toLocaleString() }}{{ pk.lastUsedAt ? ` · 最近使用 ${new Date(pk.lastUsedAt).toLocaleString()}` : '' }}</small></div><button class="danger-button" :disabled="mfaBusy" @click="removePasskey(pk.credentialId, pk.name)">移除</button></div>
            <div class="actions"><button class="primary-button" :disabled="mfaBusy || passkeyDialog.busy || factors.passkeys.length >= 10" @click="openPasskeyDialog">添加 passkey</button></div>
            <h3 class="factor-title">验证器应用（TOTP · {{ confirmedTotpCount }}/10）</h3>
            <p v-if="!factors.totp.length" class="factor-empty">用 Authenticator 应用生成 6 位动态码，可注册多台设备。</p>
            <div v-for="device in factors.totp.filter(t => t.confirmed)" :key="device.id" class="identity-row"><span class="identity-icon" aria-hidden="true"><KoiIcon name="timer" /></span><div class="meta"><h3>{{ device.name || '未命名验证器' }}</h3><small>启用于 {{ device.confirmedAt ? new Date(device.confirmedAt).toLocaleString() : '—' }}</small></div><button class="danger-button" :disabled="mfaBusy" @click="removeTotp(device.id, device.name)">停用</button></div>
            <p v-if="factors.totp.some(t => !t.confirmed)" class="factor-empty">存在未确认的注册（15 分钟后自动清理），可重新发起。</p>
            <div class="actions"><button class="secondary-button" :disabled="mfaBusy || totpDialog.busy || factors.totp.length >= 10" @click="startTotp">添加验证器应用</button></div>
            <h3 class="factor-title">恢复码（剩余 {{ factors.recovery.count }}）</h3>
            <p class="factor-empty">应急登录用，一次性；重新生成作废旧码。</p>
            <div class="actions"><button class="secondary-button" :disabled="mfaBusy || (!confirmedTotpCount && !factors.passkeys.length)" @click="generateRecovery">生成 10 个恢复码</button><button v-if="factors.recovery.count" class="secondary-button" :disabled="mfaBusy" @click="revealRecovery">查看 / 打印</button></div>
            <p v-if="mfaError" class="form-error" role="alert">{{ mfaError }}</p>
            <p v-if="mfaMsg" class="form-success" role="status">{{ mfaMsg }}</p>
          </template>
        </section>
      </template>

      <template v-else-if="section === 'privacy'">
        <section class="work-panel"><h2>政策接受状态</h2><template v-if="policies.length"><div v-for="p in policies" :key="p.kind" class="profile-row"><span>{{ p.kind === 'terms' ? '服务条款' : '隐私政策' }} v{{ p.version }}</span><strong>{{ p.acceptedAt ? `已接受 · ${new Date(p.acceptedAt).toLocaleString()}` : '未接受' }}</strong></div><p class="legal-hashes">文档哈希（SHA-256）：{{ policies.map(p => `${p.kind}:${p.contentHash.slice(0, 16)}…`).join('　') }}</p></template><p v-else>正在读取…</p><p>历史版本见 <router-link to="/legal">法律文档索引</router-link>。</p></section>
        <section class="work-panel"><h2>数据导出</h2><p>导出账户资料、关联身份、会话状态、政策接受与隐私请求记录（JSON，不含凭据与哈希）。</p><button class="primary-button" :disabled="busy" @click="exportData">下载我的数据</button></section>
        <section class="work-panel"><h2>隐私请求</h2><p>根据《隐私政策》第 11 条，你可以在此提交查阅、更正、删除、可携带、限制或异议请求，我们会通过 privacy@pcln.top 处理。</p><label class="privacy-select">请求类型<select v-model="privacyType"><option value="access">查阅 / 复制</option><option value="correction">更正 / 补充</option><option value="portability">数据可携带副本</option><option value="objection">限制或异议</option><option value="other">其他</option></select></label><button class="secondary-button" :disabled="busy" @click="submitPrivacy">提交请求</button><div v-if="privacyList.length" class="privacy-list"><div v-for="r in privacyList" :key="r.id" class="profile-row"><span>{{ privacyLabel(r.type) }} · {{ new Date(r.createdAt).toLocaleDateString() }}</span><span class="status-pill">{{ privacyState(r.state) }}</span></div></div></section>
      </template>

      <template v-else-if="section === 'delete'">
        <section class="work-panel"><h2>删除账户</h2><template v-if="deletion && deletion.state === 'pending'"><span class="status-pill">注销已申请</span><p>注销将于 <strong>{{ new Date(deletion.executeAfter || 0).toLocaleString() }}</strong> 生效（7 天冷静期）。在此之前登录并撤销，即可取消注销。</p><button class="danger-button" :disabled="busy" @click="cancelDeletion">撤销注销申请</button></template><template v-else-if="deletion && deletion.state === 'finalized'"><span class="status-pill">已注销</span><p>该账户已完成注销，个人资料已删除或匿名化。此页面仅为记录。</p></template><template v-else><p>注销申请设有 <strong>7 天冷静期</strong>。生效后将撤销全部会话、解绑第三方身份、删除或匿名化账户资料；依法需要保留的记录将与普通账户分离受限保存。与组织或发布资源相关的关系将转移至不可登录的系统保管主体，资源立即下架。</p><label class="delete-confirm">输入账户名 <strong>{{ session.name }}</strong> 以确认<input v-model="deleteConfirm" :placeholder="session.name" /></label><p v-if="deleteError" class="form-error" role="alert">{{ deleteError }}</p><button class="danger-button" :disabled="busy || deleteConfirm !== session.name" @click="requestDeletion">申请删除账户</button></template></section>
      </template>

      <template v-else-if="section === 'tickets'">
        <section class="work-panel"><div class="section-heading"><div><h2>支持工单</h2></div><button class="secondary-button" :disabled="busy" @click="loadTickets">刷新</button></div><div class="category-tabs"><button :class="{active: !showResolved}" @click="showResolved = false">待处理</button><button :class="{active: showResolved}" @click="showResolved = true">已解决</button></div><div v-if="ticketsLoaded && !visibleTickets.length" class="empty-state"><h3>{{ showResolved ? '还没有已解决的请求' : '暂无待办' }}</h3></div><article v-for="ticket in visibleTickets" :key="ticket.id" class="ticket-row"><div><small>{{ new Date(ticket.created_at).toLocaleString() }}</small><h3>{{ ticket.subject }}</h3><p>{{ ticket.body }}</p></div><span class="status-pill">{{ ticket.status === 'open' ? '待处理' : '已解决' }}</span></article><div class="pagination" v-if="total > 50"><button class="secondary-button" :disabled="offset === 0 || busy" @click="offset -= 50; loadTickets()">上一页</button><span>{{ offset + 1 }}–{{ Math.min(offset + 50, total) }} / {{ total }}</span><button class="secondary-button" :disabled="offset + 50 >= total || busy" @click="offset += 50; loadTickets()">下一页</button></div></section>
        <form class="work-panel support-form" @submit.prevent="submit"><h2>新建工单</h2><label>标题<input v-model="subject" required maxlength="120" /></label><label>详细说明<textarea v-model="body" required maxlength="4000" rows="4" /></label><button class="primary-button" :disabled="busy">提交</button><span v-if="message" class="form-success" role="status">{{ message }}</span></form>
      </template>

      <template v-else-if="section === 'profile'">
        <section class="work-panel">
          <h2>个人信息</h2>
          <div class="profile-row"><span>账户名</span><strong>{{ session.name }}</strong><button v-if="!testMode" class="secondary-button row-action" :disabled="nameDialog.busy" @click="openNameDialog">修改</button></div>
          <div class="profile-row"><span>用户 ID</span><strong>{{ session.handle ? '@' + session.handle : '未设置' }}</strong><button v-if="!testMode" class="secondary-button row-action" :disabled="handleDialog.busy" @click="openHandleDialog">{{ session.handle ? '修改' : '设置' }}</button></div>
          <div class="profile-row"><span>邮箱</span><strong>{{ session.email || '未提供' }}</strong></div>
          <div class="profile-row"><span>账户 ID</span><strong>{{ session.id }}</strong></div>
          <p>邮箱只读，来自第三方身份提供商。</p>
          <p v-if="profileMsg" class="form-success" role="status">{{ profileMsg }}</p>
        </section>
        <p v-if="testMode" class="test-mode-note">前端测试账户不连接真实认证服务。</p>
      </template>

      <template v-else-if="section === 'wallet'">
        <section class="work-panel"><h2>钱包与订阅</h2><div class="profile-row"><span>Cloud+</span><strong>{{ entitlements ? (entitlements.cloudPlus ? '已激活' : '未激活') : '正在读取…' }}</strong></div><p v-if="entitlements && !entitlements.cloudPlus" class="hint">订阅权益由 Paddle 事件实时同步；完成订阅后几秒内生效。</p><p v-if="entitlements?.subscriptions.some(s => s.scheduled_change_action)" class="hint">注意：当前订阅存在待生效的变更（如已排期取消），在变更生效前权益仍可用。</p><div class="actions"><router-link class="primary-button" to="/pricing">查看套餐与价格</router-link><button class="secondary-button" :disabled="busy" @click="openPortal">管理订阅</button></div><p v-if="portalError" class="form-error" role="alert">{{ portalError }}</p><p class="login-fine">支付方式更新、取消与发票在 Paddle 客户门户完成；取消与退款适用 <router-link to="/legal/refunds">退款政策</router-link>。</p></section>
      </template>

      <template v-else-if="section === 'developer'">
        <section v-if="session.developer" class="work-panel"><span class="status-pill">已具备资格</span><h2>开发者管理控制台</h2><p>发布者工作空间、资源提交与管理功能正在接入，入口将在此开放。</p></section>
        <section v-else class="work-panel"><h2>申请开发者资格</h2><p>获得资格后可以创建发布者组织并提交插件、界面资源与模板。审批流程即将开放，届时可直接在此提交申请。</p><button class="primary-button" disabled>申请入口即将开放</button></section>
      </template>

      <template v-else-if="section === 'website'">
        <template v-if="session.staff">
          <section class="work-panel">
            <div class="section-heading"><div><span class="status-pill">已具备资格</span><h2>网站后台管理</h2></div>
              <div class="actions"><a class="primary-button" href="https://manage.pcln.top/" target="_blank" rel="noreferrer">进入后台 ↗</a><button class="secondary-button" :disabled="summaryLoading" @click="loadSummary">刷新摘要</button></div></div>
            <p>完整控制台位于独立后台 <strong>manage.pcln.top</strong>（接线中）；此处为最近 7 天摘要{{ testMode ? '（测试账户为模拟数据）' : '' }}。</p>
          </section>
          <section class="work-panel">
            <div class="section-heading"><div><h2>遥测摘要</h2></div><span class="status-pill">最近 7 天</span></div>
            <p v-if="summaryLoading && !summary" class="summary-note" role="status">正在读取摘要…</p>
            <p v-else-if="summaryError" class="form-error" role="alert">{{ summaryError }}</p>
            <template v-else-if="summary">
              <div class="summary-grid">
                <div class="summary-cell"><b>{{ summary.starts.toLocaleString() }}</b><span>启动器启动</span></div>
                <div class="summary-cell"><b>{{ summary.gameStarts.toLocaleString() }}</b><span>游戏启动</span></div>
                <div class="summary-cell"><b>{{ summary.sessions.toLocaleString() }}</b><span>诊断会话</span></div>
                <div class="summary-cell"><b>{{ summary.errors.toLocaleString() }}</b><span>错误样本</span></div>
              </div>
              <div class="summary-cols">
                <div class="summary-block"><h3>活跃版本</h3>
                  <div v-for="v in summary.versions" :key="v.version" class="summary-line"><span>{{ v.version }}</span><div class="track"><i :style="{ width: barWidth(v.count, summary.versionMax) }" /></div><b>{{ v.count.toLocaleString() }}</b></div>
                </div>
                <div class="summary-block"><h3>平台分布</h3>
                  <div v-for="p in summary.platforms" :key="p.os" class="summary-line"><span>{{ platformLabel(p.os) }}</span><div class="track"><i :style="{ width: barWidth(p.count, summary.platformTotal) }" /></div><b>{{ Math.round(p.count / summary.platformTotal * 100) }}%</b></div>
                </div>
              </div>
              <p class="summary-note">数据生成于 {{ summary.generatedAt }}。</p>
            </template>
          </section>
        </template>
        <section v-else class="work-panel"><h2>申请网站管理员</h2><p>网站管理员负责处理支持工单、运营待办与平台诊断。申请通道即将开放，届时可直接在此提交申请。</p><button class="primary-button" disabled>申请入口即将开放</button></section>
      </template>
    </div>

    <!-- ===== 二级模态框：所有修改类操作统一入口 ===== -->
    <PasswordConfirmDialog v-model="pwDialog.visible" :mode="pwDialog.mode" :title="pwDialog.title" :description="pwDialog.description" :busy="pwDialog.busy" :error="pwDialog.error" @confirm="onPasswordConfirm" />

    <FormDialog v-model="nameDialog.visible" title="修改用户名" description="1–60 个字符。" :busy="nameDialog.busy" :error="nameDialog.error" confirm-label="保存用户名" :can-confirm="Boolean(nameInput)" @confirm="saveName">
      <label class="dialog-field">用户名<input v-model.trim="nameInput" minlength="1" maxlength="60" required /></label>
    </FormDialog>

    <FormDialog v-model="handleDialog.visible" :title="session.handle ? '修改用户 ID' : '设置用户 ID'" description="6–20 位，字母开头，可含数字 / _ / -；每 30 天限改一次。" :busy="handleDialog.busy" :error="handleDialog.error" :hint="handleDialog.hint" :confirm-label="session.handle ? '修改用户 ID' : '设置用户 ID'" :can-confirm="handleValid" @confirm="saveHandle">
      <label class="dialog-field">用户 ID<input v-model.trim="handleInput" minlength="6" maxlength="20" pattern="[A-Za-z][A-Za-z0-9_-]{5,19}" required placeholder="例如 player_one" @blur="checkHandle" /></label>
    </FormDialog>

    <FormDialog v-model="passkeyDialog.visible" title="添加 passkey" description="浏览器将弹出系统验证（指纹 / 面容 / PIN）。" :busy="passkeyDialog.busy" :error="passkeyDialog.error" busy-label="等待系统验证…" confirm-label="继续并验证" @confirm="runAddPasskey">
      <label class="dialog-field">名称（可留空）<input v-model.trim="passkeyName" maxlength="60" placeholder="例如 我的 Windows 电脑" /></label>
    </FormDialog>

    <FormDialog v-model="totpDialog.visible" title="添加验证器应用" :description="totpEnroll ? '用验证器应用扫码或输入密钥，再填写 6 位动态码。' : '正在生成密钥…'" :busy="totpDialog.busy" :error="totpDialog.error" confirm-label="确认并启用" :can-confirm="Boolean(totpEnroll) && totpCode.length === 6" @confirm="confirmTotp">
      <template v-if="totpEnroll">
        <label class="dialog-field">设备名称（可留空）<input v-model.trim="totpDeviceName" maxlength="60" placeholder="例如 我的手机" /></label>
        <p class="secret-box"><code>{{ totpEnroll.secret }}</code><button class="secondary-button" type="button" @click="copyText(totpEnroll.secret)">复制</button></p>
        <p class="login-fine break-all">{{ totpEnroll.otpauthUrl }}</p>
        <span class="seg-label">6 位动态码</span>
        <SegmentedCode v-model="totpCode" :length="6" charset="digits" label="验证器动态码" :disabled="totpDialog.busy" />
      </template>
    </FormDialog>

    <FormDialog v-model="recoveryDialog.visible" :title="recoveryDialog.title" :description="recoveryDialog.title === '恢复码已生成' ? '一次性使用；建议打印或存入密码管理器。' : '查看操作已记入审计。'" confirm-label="我已妥善保存" @confirm="recoveryDialog.visible = false">
      <p v-if="recoveryMissing" class="login-fine">有 {{ recoveryMissing }} 个旧恢复码不支持在线查看；重新生成一批即可查看全部。</p>
      <div class="recovery-grid"><code v-for="code in recoveryCodes" :key="code">{{ code }}</code></div>
      <div class="actions"><button class="secondary-button" type="button" @click="copyText(recoveryCodes.join('\n'))">复制全部</button><button class="secondary-button" type="button" @click="printCodes">打印</button></div>
    </FormDialog>
  </div>
  <p v-else class="empty-state" role="status">正在前往登录页…</p>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { platform, ApiError, isTestSession, SESSION_EVENT, type Session, type Ticket, type LinkedIdentity, type PolicyStatus, type DeletionRequest, type PrivacyRequest, type Entitlements, type MfaFactors, type MinecraftProfile, type AccountLevel, type Nameplate, type PlateProgress, type XpSource } from '@/api/platform';
import { PLATE_GROUPS, artFor, bonusLabel, formatCount, formatMinutes, type PlateKind } from '@/config/nameplates';
import { pluginCenterApi } from '@/api/pluginCenter';
import { createPasskey } from '@/utils/webauthnClient';
import SegmentedCode from '@/components/SegmentedCode.vue';
import KoiIcon from '@/components/KoiIcon.vue';
import FormDialog from '@/components/FormDialog.vue';
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog.vue';
const route = useRoute();
const router = useRouter();
const session = ref<Session>(), checking = ref(true), busy = ref(false), error = ref('');
const acceptChecked = ref(false);
async function accept(){ busy.value = true; error.value = ''; try { await platform.acceptPolicies(); session.value = { ...session.value!, termsAccepted: 1 }; } catch (e) { error.value = e instanceof ApiError ? e.message : '接受条款失败，请重试。'; } finally { busy.value = false; } }
async function logout(){ busy.value=true; error.value=''; await platform.logout(); session.value=undefined; busy.value=false; }
// 登录表单已独立为 /login 页（也为启动器设备流确认页做准备）。
function gotoLogin() { void router.replace({ path: '/login', query: { return: route.fullPath } }); }

const navItems = [
  { key: 'overview', label: '概览', icon: 'home', color: '#1a73e8' },
  { key: 'level', label: '等级与铭牌', icon: 'ranking', color: '#7b3ff2' },
  { key: 'linked', label: '关联的账号', icon: 'arrow-left-right', color: '#1e8e3e' },
  { key: 'security', label: '安全性与登录', icon: 'shield-tick', color: '#f2a100' },
  { key: 'profile', label: '个人信息', icon: 'personal-card', color: '#9334e6' },
  { key: 'privacy', label: '隐私与数据', icon: 'lock-circle', color: '#00897b' },
  { key: 'wallet', label: '钱包与订阅', icon: 'card', color: '#c5221f' },
  { key: 'tickets', label: '支持工单', icon: 'conversation-box', color: '#12a5af' },
  { key: 'developer', label: '开发者控制台', icon: 'console', color: '#3f51b5' },
  { key: 'website', label: '网站管理', icon: 'setting', color: '#e8546e' },
  { key: 'delete', label: '删除账户', icon: 'trash-square', color: '#5f6368' }
];
const validSections = navItems.map(i => i.key);
const section = ref(validSections.includes(String(route.query.section)) ? String(route.query.section) : 'overview');
watch(() => route.query.section, value => { if (validSections.includes(String(value))) section.value = String(value); });
watch(section, value => {
  if (value === 'tickets' && !ticketsLoaded.value) void loadTickets();
  if (value === 'level' && !levelInfo.value && !levelLoading.value) void loadLevel();
  if (value === 'privacy') { void loadPolicies(); void loadPrivacy(); }
  if (value === 'delete') void loadDeletion();
  if (value === 'wallet') void loadEntitlements();
  if (value === 'linked') void loadMinecraft();
  if (value === 'website' && session.value?.staff && !summary.value && !summaryLoading.value) void loadSummary();
  if (value === 'security' && session.value && !testMode.value && !factors.value) void refreshFactors();
});

// 网站管理：仅保留 7 天遥测摘要；完整控制台属于 manage.pcln.top 独立后台。
interface TelemetrySummary { starts: number; gameStarts: number; sessions: number; errors: number; versions: { version: string; count: number }[]; versionMax: number; platforms: { os: string; count: number }[]; platformTotal: number; generatedAt: string }
const summary = ref<TelemetrySummary | null>(null), summaryLoading = ref(false), summaryError = ref('');
const testMode = computed(() => isTestSession());
const platformLabel = (os: string) => ({ windows: 'Windows', macos: 'macOS', linux: 'Linux' }[os] ?? os);
const barWidth = (count: number, max: number) => max > 0 ? `${Math.max(2, Math.round(count / max * 100))}%` : '0%';
async function loadSummary() {
  summaryLoading.value = true; summaryError.value = '';
  try {
    const [tele, diag] = await Promise.all([pluginCenterApi.launcherTelemetry(7), pluginCenterApi.launcherDiagnostics(7)]);
    const total = (event: string) => tele.daily.filter(row => row.event === event).reduce((n, row) => n + row.count, 0);
    const platformTotals = new Map<string, number>();
    for (const row of tele.platforms) platformTotals.set(row.os, (platformTotals.get(row.os) ?? 0) + row.count);
    const versions = tele.versions.slice(0, 4);
    summary.value = {
      starts: total('app.started'), gameStarts: total('game.started'),
      sessions: diag.sessions,
      errors: diag.errors.reduce((n, row) => n + row.count, 0),
      versions, versionMax: Math.max(1, ...versions.map(v => v.count)),
      platforms: [...platformTotals].map(([os, count]) => ({ os, count })).sort((a, b) => b.count - a.count),
      platformTotal: Math.max(1, [...platformTotals.values()].reduce((n, c) => n + c, 0)),
      generatedAt: new Date(tele.generatedAt).toLocaleString()
    };
  } catch { summaryError.value = '暂时无法读取遥测摘要，请稍后重试。'; }
  finally { summaryLoading.value = false; }
}

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'microsoft', name: 'Microsoft' }
] as const;
// 品牌官方标识(与登录按钮同款内联 SVG),用于关联账号列表。
const PROVIDER_SVG: Record<string, string> = {
  github: '<svg viewBox="0 0 16 16" width="18" height="18"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
  google: '<svg viewBox="0 0 48 48" width="17" height="17"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
  microsoft: '<svg viewBox="0 0 23 23" width="16" height="16"><rect x="1" y="1" width="10" height="10" fill="#f25022"/><rect x="12" y="1" width="10" height="10" fill="#7fba00"/><rect x="1" y="12" width="10" height="10" fill="#00a4ef"/><rect x="12" y="12" width="10" height="10" fill="#ffb900"/></svg>'
};
const identities = ref<LinkedIdentity[]>();
const bound = (id: LinkedIdentity['provider']) => Boolean(identities.value?.some(i => i.provider === id));
const identityMail = (id: LinkedIdentity['provider']) => identities.value?.find(i => i.provider === id)?.email || '已关联';
async function loadIdentities(){ try { identities.value = (await platform.identities()).identities; } catch (e) { error.value = e instanceof Error ? e.message : '暂时无法读取已关联的账号。'; } }
// Microsoft 绑定附带的 Minecraft 拥有状况与档案（供启动器自动添加档案）。
const minecraft = ref<MinecraftProfile | null>(null);
const minecraftText = computed(() => {
  const m = minecraft.value;
  if (!m || !m.microsoftLinked) return '';
  if (m.owned === 1) return `Minecraft 已拥有${m.profileName ? ` · ${m.profileName}` : ''}${m.profileId ? ` · ${m.profileId.slice(0, 8)}…` : ''}`;
  if (m.owned === 0) return 'Minecraft 未拥有';
  return m.error ? `Minecraft 核查未完成（${m.error}）` : 'Minecraft 尚未核查';
});
async function loadMinecraft(){ try { minecraft.value = await platform.minecraftProfile(); } catch { minecraft.value = null; } }
async function bind(id: LinkedIdentity['provider']){ busy.value = true; platform.oauthStart(id, '/account?section=linked', 'link'); }
async function unbind(id: LinkedIdentity['provider']){ busy.value = true; error.value = ''; try { await platform.unbind(id); await loadIdentities(); } catch (e) { error.value = e instanceof ApiError ? e.message : '解绑失败，请重试。'; } finally { busy.value = false; } }

const policies = ref<PolicyStatus[]>([]);
async function loadPolicies(){ try { policies.value = (await platform.policiesStatus()).policies; } catch { /* 状态读取失败不阻塞 */ } }
const privacyType = ref('access'), privacyList = ref<PrivacyRequest[]>([]);
const privacyLabel = (type: string) => ({ access: '查阅 / 复制', correction: '更正 / 补充', deletion: '删除', portability: '数据可携带', objection: '限制或异议', other: '其他' }[type] || type);
const privacyState = (state: string) => ({ received: '已收到', verified: '已验证', processing: '处理中', completed: '已完成', rejected: '已拒绝' }[state] || state);
async function loadPrivacy(){ try { privacyList.value = (await platform.privacyRequests()).requests; } catch { /* 忽略 */ } }
async function submitPrivacy(){ busy.value = true; error.value = ''; try { await platform.createPrivacyRequest(privacyType.value); await loadPrivacy(); } catch (e) { error.value = e instanceof ApiError ? e.message : '提交失败，请重试。'; } finally { busy.value = false; } }
async function exportData(){ busy.value = true; try { const data = await platform.exportData(); const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `nexa-account-export-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); } catch (e) { error.value = e instanceof ApiError ? e.message : '导出失败，请重试。'; } finally { busy.value = false; } }

const deletion = ref<DeletionRequest | null>(), deleteConfirm = ref(''), deleteError = ref('');
const entitlements = ref<Entitlements | null>(), portalError = ref('');
async function loadEntitlements(){ try { entitlements.value = await platform.entitlements(); } catch (e) { portalError.value = e instanceof ApiError ? e.message : '暂时无法读取订阅状态。'; } }
async function openPortal(){ busy.value = true; portalError.value = ''; try { await platform.billingPortal(); } catch (e) { portalError.value = e instanceof ApiError ? e.message : '暂时无法打开订阅管理，请稍后重试。'; busy.value = false; } }
async function loadDeletion(){ try { deletion.value = (await platform.deletionStatus()).request; } catch { /* 忽略 */ } }
async function requestDeletion(){ busy.value = true; deleteError.value = ''; try { deletion.value = (await platform.requestDeletion()).request; deleteConfirm.value = ''; } catch (e) { deleteError.value = e instanceof ApiError ? e.message : '申请失败，请重试。'; } finally { busy.value = false; } }
async function cancelDeletion(){ busy.value = true; deleteError.value = ''; try { await platform.cancelDeletion(); deletion.value = null; } catch (e) { deleteError.value = e instanceof ApiError ? e.message : '撤销失败，请重试。'; } finally { busy.value = false; } }

const tickets = ref<Ticket[]>([]), ticketsLoaded = ref(false), showResolved = ref(false), subject = ref(''), body = ref(''), message = ref('');
const offset = ref(0), total = ref(0);
const visibleTickets = computed(() => tickets.value.filter(t => showResolved.value ? t.status === 'resolved' : t.status === 'open'));
async function loadTickets(){ busy.value = true; error.value = ''; try { const result = await platform.tickets('console', offset.value); tickets.value = result.data; total.value = result.pagination.total; ticketsLoaded.value = true; } catch (e) { error.value = e instanceof Error ? e.message : '操作失败，请重试。'; } finally { busy.value = false; } }
async function submit(){ busy.value = true; error.value = ''; message.value = ''; try { await platform.createTicket(subject.value, body.value); subject.value = ''; body.value = ''; message.value = '请求已提交。'; showResolved.value = false; await loadTickets(); } catch (e) { error.value = e instanceof Error ? e.message : '操作失败，请重试。'; } finally { busy.value = false; } }

// ---- 等级 / 经验 / 铭牌墙 ----
// 数据源:nexa-auth 的 GET /auth/v1/account/level(已含铭牌评估、生效加成与佩戴状态)。
const levelInfo = ref<AccountLevel | null>(null), levelLoading = ref(false), levelError = ref(''), levelMsg = ref('');
const plateBusy = ref<string | null>(null);
async function loadLevel() {
  levelLoading.value = true; levelError.value = '';
  try { levelInfo.value = await platform.accountLevel(); }
  catch (e) { levelError.value = e instanceof Error ? e.message : '暂时无法读取等级与经验。'; }
  finally { levelLoading.value = false; }
}
// 佩戴 / 卸下铭牌。卸下传 null,恢复显示等级数字。
async function equipPlate(plate: Nameplate | null) {
  plateBusy.value = plate?.id ?? 'none'; levelMsg.value = ''; levelError.value = '';
  try {
    await platform.equipNameplate(plate?.id ?? null);
    levelMsg.value = plate ? `已佩戴「${plate.label}」。${plate.replacesLevel ? '等级数字已隐藏。' : ''}` : '已卸下铭牌，恢复显示等级。';
    await loadLevel();
  } catch (e) { levelError.value = e instanceof Error ? e.message : '佩戴铭牌失败，请重试。'; }
  finally { plateBusy.value = null; }
}
const myPlates = computed(() => levelInfo.value?.nameplates.plates ?? []);
const plateGroups = computed(() => PLATE_GROUPS
  .map(group => ({ ...group, plates: myPlates.value.filter(p => p.kind === (group.kind as PlateKind)) }))
  .filter(group => group.plates.length));
const ownedPlateCount = computed(() => myPlates.value.filter(p => p.owned).length);
const equippedPlate = computed(() => myPlates.value.find(p => p.id === levelInfo.value?.nameplates.equipped) ?? null);
// 等级进度:已达 Lv7 时进度条走满且不再显示"距下一级还需"。
const levelProgress = computed(() => {
  const info = levelInfo.value;
  if (!info) return 0;
  if (!info.next) return 100;
  const floor = info.level >= 2 ? (info.thresholds[info.level] ?? 0) : 0;
  const span = Math.max(1, info.next.threshold - floor);
  return Math.max(0, Math.min(100, Math.round(((info.xp - floor) / span) * 100)));
});
const dailyXpToday = computed(() => {
  // 今日已入账的经验:由当日已领取的定额来源 + 时长来源的当日累计推算不可得(后端只回传 claimedToday),
  // 因此这里只展示"今天还能领哪些",不伪造一个总额。
  const sources = levelInfo.value?.xpSources ?? [];
  return sources.filter(s => s.mode === 'daily' && s.claimedToday).length;
});
const platePercent = (progress: PlateProgress) => progress.need > 0 ? Math.min(100, Math.round((progress.have / progress.need) * 100)) : 0;
const plateProgressText = (progress: PlateProgress) =>
  progress.unit === '分钟' ? `${formatMinutes(progress.have)} / ${formatMinutes(progress.need)}`
  : progress.unit === '粉丝' ? `${formatCount(progress.have)} / ${formatCount(progress.need)}`
  : `${formatCount(progress.have)} / ${formatCount(progress.need)}${progress.unit ? ' ' + progress.unit : ''}`;
const sourceValue = (source: XpSource) => source.mode === 'duration' ? `${source.xpPerMinute} XP / 分钟` : `+${source.xp} XP`;
const sourceClaimText = (source: XpSource) => {
  if (source.mode === 'once') return levelInfo.value?.firstLaunchAt ? '已完成' : '未完成';
  if (source.mode === 'daily') return source.claimedToday ? '今日已领取' : '今日未领取';
  return `单日上限 ${source.dailyCap} XP`;
};
// 经验来源图标:全部取自仓库内置的 KOI 图标集,未知类型回退到 activity。
const SOURCE_ICONS: Record<string, string> = {
  'daily.login': 'user-square',
  'daily.launch': 'flash',
  'game.first_launch': 'video-play',
  'game.play_minutes': 'timer-pause',
  'launcher.online_minutes': 'clock'
};
const sourceIcon = (type: string) => SOURCE_ICONS[type] ?? 'activity';

// ---- 统一密码验证框架：所有需要密码的操作都经由同一个对话框 ----
const pwDialog = reactive({ visible: false, mode: 'reauth' as 'reauth' | 'set' | 'change', title: '', description: '', busy: false, error: '' });
let pendingPasswordAction: ((payload: { password?: string; newPassword?: string }) => Promise<void>) | null = null;
function openPwDialog(mode: 'reauth' | 'set' | 'change', action: (payload: { password?: string; newPassword?: string }) => Promise<void>, title = '', description = '') {
  pwDialog.mode = mode; pwDialog.title = title; pwDialog.description = description; pwDialog.error = ''; pwDialog.busy = false;
  pendingPasswordAction = action; pwDialog.visible = true;
}
async function onPasswordConfirm(payload: { password?: string; newPassword?: string }) {
  if (!pendingPasswordAction || pwDialog.busy) return;
  pwDialog.busy = true; pwDialog.error = '';
  try { await pendingPasswordAction(payload); pwDialog.visible = false; pendingPasswordAction = null; }
  catch (e) { pwDialog.error = e instanceof Error ? e.message : '操作失败，请重试。'; }
  finally { pwDialog.busy = false; }
}
// 敏感操作：已设置密码 → 统一走密码复核对话框；未设置密码 → 直接执行（服务端同样不要求复核）。
function sensitive(title: string, description: string, run: (password?: string) => Promise<void>) {
  if (factors.value?.passwordSet) openPwDialog('reauth', ({ password }) => run(password), title, description);
  else void run(undefined).then(() => { /* 成功提示由调用方写入 mfaMsg */ }).catch((e: unknown) => { mfaError.value = e instanceof Error ? e.message : '操作失败，请重试。'; });
}

// ---- 个人信息：用户名 / 用户 ID（模态框） ----
const nameInput = ref(''), handleInput = ref(''), profileMsg = ref('');
const nameDialog = reactive({ visible: false, busy: false, error: '' });
const handleDialog = reactive({ visible: false, busy: false, error: '', hint: '' });
const HANDLE_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{5,19}$/;
const handleValid = computed(() => HANDLE_PATTERN.test(handleInput.value) && handleInput.value.toLowerCase() !== (session.value?.handle ?? ''));
function openNameDialog() { nameInput.value = session.value?.name ?? ''; nameDialog.error = ''; nameDialog.visible = true; }
async function saveName() {
  nameDialog.busy = true; nameDialog.error = ''; profileMsg.value = '';
  try { await platform.updateDisplayName(nameInput.value); session.value = { ...session.value!, name: nameInput.value }; profileMsg.value = '用户名已更新。'; nameDialog.visible = false; }
  catch (e) { nameDialog.error = e instanceof Error ? e.message : '修改失败，请重试。'; }
  finally { nameDialog.busy = false; }
}
function openHandleDialog() { handleInput.value = session.value?.handle ?? ''; handleDialog.error = ''; handleDialog.hint = ''; handleDialog.visible = true; }
async function checkHandle() {
  handleDialog.hint = '';
  const value = handleInput.value.trim();
  if (!value || value.toLowerCase() === (session.value?.handle ?? '')) return;
  try {
    const result = await platform.handleAvailability(value);
    handleDialog.hint = result.available ? '✓ 可用' : result.reason === 'taken' ? '该用户 ID 已被占用' : result.reason === 'reserved' ? '该用户 ID 为系统保留' : '格式不正确：6–20 位，字母开头，仅字母 / 数字 / _ / -';
  } catch { /* 查询失败不阻塞提交 */ }
}
async function saveHandle() {
  handleDialog.busy = true; handleDialog.error = ''; profileMsg.value = '';
  try {
    const result = await platform.updateHandle(handleInput.value);
    session.value = { ...session.value!, handle: result.handle };
    handleInput.value = result.handle;
    profileMsg.value = `用户 ID 已更新，下次可修改时间：${new Date(result.nextChangeAt).toLocaleDateString()}。`;
    handleDialog.visible = false;
  } catch (e) { handleDialog.error = e instanceof Error ? e.message : '修改失败，请重试。'; }
  finally { handleDialog.busy = false; }
}

// ---- 密码与两步验证 ----
const factors = ref<MfaFactors | null>(null), factorsLoading = ref(false);
const securityMsg = ref('');
const mfaBusy = ref(false), mfaError = ref(''), mfaMsg = ref('');
const passkeyDialog = reactive({ visible: false, busy: false, error: '' }); const passkeyName = ref('');
const totpDialog = reactive({ visible: false, busy: false, error: '' });
const totpEnroll = ref<{ id: string; secret: string; otpauthUrl: string } | null>(null), totpCode = ref(''), totpDeviceName = ref('');
const confirmedTotpCount = computed(() => factors.value?.totp.filter(t => t.confirmed).length ?? 0);
const recoveryDialog = reactive({ visible: false, title: '恢复码已生成' }); const recoveryCodes = ref<string[]>([]); const recoveryMissing = ref(0);
async function refreshFactors() { factorsLoading.value = true; try { factors.value = await platform.mfaFactors(); } catch (e) { mfaError.value = e instanceof Error ? e.message : '读取两步验证状态失败'; } finally { factorsLoading.value = false; } }
function openPasswordDialog() {
  securityMsg.value = '';
  openPwDialog(factors.value?.passwordSet ? 'change' : 'set', async ({ password, newPassword }) => {
    const result = await platform.setPassword(newPassword!, password);
    securityMsg.value = result.mfa.factors.length ? '密码已保存。' : '密码已保存。请先注册两步验证，否则密码登录不可用。';
    await refreshFactors();
  }, factors.value?.passwordSet ? '修改登录密码' : '设置登录密码', factors.value?.passwordSet ? '需先验证当前密码。' : '密码 14–256 位；密码登录强制两步验证。');
}
function openPasskeyDialog() { passkeyName.value = ''; passkeyDialog.error = ''; passkeyDialog.visible = true; }
async function runAddPasskey() {
  passkeyDialog.busy = true; passkeyDialog.error = '';
  try {
    const options = await platform.passkeyRegisterOptions();
    const credential = await createPasskey(options);
    await platform.passkeyRegister(options.challenge, passkeyName.value.trim() || null, credential);
    passkeyDialog.visible = false; mfaMsg.value = 'passkey 已注册。';
    await refreshFactors();
  } catch (e) { passkeyDialog.error = e instanceof Error ? e.message : '注册失败'; }
  finally { passkeyDialog.busy = false; }
}
function removePasskey(credentialId: string, name: string | null) {
  mfaMsg.value = '';
  sensitive('移除 passkey', `移除「${name || '未命名 passkey'}」后，该设备无法再用它验证登录。`, async password => {
    await platform.passkeyRemove(credentialId, password);
    mfaMsg.value = 'passkey 已移除。';
    await refreshFactors();
  });
}
async function startTotp() {
  mfaMsg.value = ''; totpDialog.visible = true; totpDialog.busy = true; totpDialog.error = ''; totpEnroll.value = null; totpCode.value = ''; totpDeviceName.value = '';
  try { const result = await platform.totpEnroll(); totpEnroll.value = { id: result.id, secret: result.secret, otpauthUrl: result.otpauthUrl }; await refreshFactors(); }
  catch (e) { totpDialog.error = e instanceof Error ? e.message : '发起注册失败'; }
  finally { totpDialog.busy = false; }
}
async function confirmTotp() {
  if (!totpEnroll.value) return;
  totpDialog.busy = true; totpDialog.error = '';
  try { await platform.totpConfirm(totpEnroll.value.id, totpCode.value, totpDeviceName.value || null); totpDialog.visible = false; totpEnroll.value = null; totpCode.value = ''; mfaMsg.value = '验证器应用已启用。'; await refreshFactors(); }
  catch (e) { totpDialog.error = e instanceof Error ? e.message : '确认失败，请检查动态码'; }
  finally { totpDialog.busy = false; }
}
function removeTotp(id: string, name: string | null) {
  mfaMsg.value = '';
  sensitive('停用验证器应用', `停用「${name || '未命名验证器'}」后无法再用它登录。`, async password => {
    await platform.totpRemove(id, password);
    mfaMsg.value = '验证器应用已停用。';
    await refreshFactors();
  });
}
function generateRecovery() {
  mfaMsg.value = ''; recoveryDialog.title = '恢复码已生成';
  sensitive('生成恢复码', '新码生成后，旧码全部作废。', async password => {
    const result = await platform.recoveryGenerate(password);
    recoveryCodes.value = result.codes; recoveryMissing.value = 0;
    recoveryDialog.visible = true;
    await refreshFactors();
  });
}
function revealRecovery() {
  mfaMsg.value = ''; recoveryDialog.title = '查看恢复码';
  sensitive('查看恢复码', '查看操作将记入审计。', async password => {
    const result = await platform.recoveryReveal(password);
    recoveryCodes.value = result.codes; recoveryMissing.value = result.missing;
    recoveryDialog.visible = true;
  });
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
function printCodes() {
  const win = window.open('', '_blank');
  if (!win) { mfaMsg.value = '浏览器阻止了弹窗，请允许后重试，或使用「复制全部」。'; return; }
  const account = session.value ? `${session.value.name}${session.value.handle ? ' (@' + session.value.handle + ')' : ''}` : '';
  win.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Nexa Cloud 恢复码</title></head><body style="font-family:system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;max-width:640px;margin:40px auto;padding:0 24px;color:#1f2733">
<h1 style="font-size:22px;margin:0 0 6px">Nexa Cloud · 两步验证恢复码</h1>
<p style="font-size:13px;color:#66738a;margin:0 0 18px">账户：${escapeHtml(account)}　·　打印时间：${new Date().toLocaleString()}</p>
<p style="font-size:13px;line-height:1.8">每个恢复码仅可使用一次，用后作废；重新生成会使整批旧码失效。请离线保存此页，不要截图上传或存入云端笔记。</p>
<ol style="font-family:ui-monospace,Consolas,monospace;font-size:16px;line-height:2.3;letter-spacing:.1em;padding-left:28px">${recoveryCodes.value.map(code => `<li>${escapeHtml(code)}</li>`).join('')}</ol>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
async function copyText(text: string) { try { await navigator.clipboard.writeText(text); mfaMsg.value = '已复制到剪贴板。'; } catch { mfaMsg.value = '复制失败，请手动选择复制。'; } }

// 会话全局同步：登出（含顶栏菜单发起的）或测试账户切换时立即响应；登出后前往独立登录页。
async function syncSession() {
  const next = await platform.session();
  session.value = next;
  if (!next) { factors.value = null; identities.value = undefined; summary.value = null; gotoLogin(); return; }
  if (next.setupRequired) { void router.replace('/register?setup=1'); return; }
  nameInput.value = next.name ?? ''; handleInput.value = next.handle ?? '';
  if (section.value === 'security' && !testMode.value && !factors.value) void refreshFactors();
}

onMounted(async () => {
  window.addEventListener(SESSION_EVENT, syncSession);
  session.value = await platform.session();
  checking.value = false;
  if (!session.value) { gotoLogin(); return; }
  if (session.value.setupRequired) { void router.replace('/register?setup=1'); return; }
  void loadIdentities();
  nameInput.value = session.value.name ?? '';
  handleInput.value = session.value.handle ?? '';
  if (section.value === 'tickets') void loadTickets();
  // 等级与铭牌在概览页也要显示徽章,故进入账户页即加载(单个请求)。
  void loadLevel();
  if (section.value === 'privacy') { void loadPolicies(); void loadPrivacy(); }
  if (section.value === 'delete') void loadDeletion();
  if (section.value === 'wallet') void loadEntitlements();
  if (section.value === 'linked') void loadMinecraft();
  if (section.value === 'website' && session.value.staff) void loadSummary();
  if (section.value === 'security' && !testMode.value) void refreshFactors();
});
onUnmounted(() => { window.removeEventListener(SESSION_EVENT, syncSession); });
</script>
<style scoped>
/* ---- 等级与铭牌 ---- */
.overview-chips{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.plate-pill{display:inline-flex;align-items:center;gap:5px;font-weight:650}
.plate-pill :deep(.koi-icon){font-size:12px}
.plate-pill.level{background:#e9eef6;color:#0d4fa8}
.level-hero{display:flex;align-items:center;gap:20px;margin:18px 0 4px;flex-wrap:wrap}
.level-badge{width:76px;height:76px;border-radius:20px;display:grid;place-items:center;font-size:26px;font-weight:700;letter-spacing:-.03em;background:var(--nc-accent);color:#fff;flex-shrink:0}
.level-badge.plate{font-size:19px;gap:6px;grid-auto-flow:column;padding:0 14px;width:auto;min-width:76px}
.level-badge.plate :deep(.koi-icon){font-size:22px}
.level-hero-meta{flex:1;min-width:220px}
.level-xp{font-size:13px;color:var(--market-muted);margin:0 0 4px}
.level-xp strong{font-size:24px;font-weight:700;letter-spacing:-.02em;color:var(--market-text);font-variant-numeric:tabular-nums;margin-right:4px}
.level-next{font-size:12px;color:var(--market-muted);margin:0 0 10px}
.level-track,.plate-track{height:8px;background:var(--market-surface-soft);border:1px solid var(--market-border);border-radius:999px;overflow:hidden}
.level-track i,.plate-track i{display:block;height:100%;background:var(--nc-accent);border-radius:999px;transition:width .4s ease}
.level-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0 4px}
.level-stats>div{background:var(--market-surface-soft);border:1px solid var(--market-border);border-radius:12px;padding:14px 16px}
.level-stats b{display:block;font-size:19px;font-weight:700;letter-spacing:-.02em;color:var(--nc-accent);line-height:1.2}
.level-stats span{display:block;font-size:11.5px;color:var(--market-muted);margin-top:5px}
.source-list{display:grid;gap:2px;margin-top:14px}
.source-item{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid #e8edf3}
.source-item:last-child{border-bottom:0}
.source-icon{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#f1f4f9;color:#3f4f5f;font-size:16px;flex-shrink:0}
.source-meta{flex:1;min-width:0}
.source-meta h3{font-size:13px;font-weight:600}
.source-meta small{display:block;color:#8a99a8;margin-top:3px;font-size:11.5px}
.status-pill.claimed{background:#e7f6ec;color:#1e8e3e}
.status-pill.locked{background:var(--market-surface-soft);color:#91a1a9}
.source-hint{font-size:11.5px;color:#91a1a9;margin:16px 0 0;line-height:1.75}
.source-hint a{color:var(--nc-accent)}
.plate-group-title{font-size:12.5px;font-weight:650;margin:24px 0 10px;padding-top:16px;border-top:1px solid #e8edf3;color:var(--market-muted)}
.my-plate-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.my-plate{display:flex;gap:13px;align-items:flex-start;padding:15px;border:1px solid #e3e8f0;border-radius:12px;background:#fff}
.my-plate.owned{border-color:var(--nc-accent);box-shadow:0 1px 8px rgba(22,115,230,.09)}
.my-plate .plate-art{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;font-size:19px;flex-shrink:0}
.plate-info{flex:1;min-width:0}
.plate-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.plate-line h4{font-size:13.5px;font-weight:650;margin:0}
.plate-bonus-tag{font-size:11px;font-weight:650;font-variant-numeric:tabular-nums}
.plate-replace{display:inline-block;font-size:10px;font-weight:650;color:#7b3ff2;background:#f1eafe;border-radius:999px;padding:1px 7px;margin:5px 0 0}
.plate-info .plate-req{font-size:11.5px;color:var(--market-muted);margin:6px 0 0;line-height:1.6}
.plate-info .plate-parts{list-style:none;padding:8px 0 0;margin:0;display:grid;gap:4px;font-size:11px;color:#91a1a9}
.plate-info .plate-parts li{display:flex;justify-content:space-between;gap:10px}
.plate-info .plate-parts li.done{color:#1e8e3e}
.plate-info .plate-parts li b{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.plate-info .plate-track{margin-top:9px;height:6px}
.plate-info small{display:block;font-size:11px;color:#91a1a9;margin-top:5px;font-variant-numeric:tabular-nums}
.plate-actions{flex-shrink:0;align-self:center}
.plate-actions .secondary-button,.plate-actions .primary-button{min-height:32px;padding:6px 14px;font-size:11.5px}
@media(max-width:800px){
  .level-stats{grid-template-columns:repeat(2,1fr)}
  .my-plate-grid{grid-template-columns:1fr}
  .level-badge{width:62px;height:62px;font-size:21px;border-radius:16px}
}
</style>
<style scoped>
.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0 6px}
.summary-cell{background:var(--market-surface-soft);border:1px solid var(--market-border);border-radius:12px;padding:16px 18px}
.summary-cell b{display:block;font-size:24px;font-weight:700;letter-spacing:-.02em;color:var(--nc-accent);line-height:1.15}
.summary-cell span{display:block;font-size:11.5px;color:var(--market-muted);margin-top:5px}
.summary-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-top:20px}
.summary-block h3{font-size:13px;font-weight:650;margin-bottom:10px}
.summary-line{display:grid;grid-template-columns:110px minmax(0,1fr) 56px;align-items:center;gap:12px;padding:7px 0;font-size:12px;color:var(--market-muted)}
.summary-line>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.summary-line>b{text-align:right;font-weight:600;color:var(--market-text);font-variant-numeric:tabular-nums}
.summary-line .track{height:7px;background:var(--market-surface-soft);border:1px solid var(--market-border);border-radius:999px;overflow:hidden}
.summary-line .track i{display:block;height:100%;background:var(--nc-accent);border-radius:999px;transition:width .4s ease}
.summary-note{font-size:11.5px;color:var(--market-muted);margin-top:16px;line-height:1.7}
@media(max-width:800px){.summary-grid{grid-template-columns:repeat(2,1fr)}.summary-cols{grid-template-columns:1fr;gap:14px}.summary-line{grid-template-columns:92px minmax(0,1fr) 48px}}
.test-mode-note{font-size:12px;color:var(--market-muted);background:var(--market-surface-soft);border:1px dashed var(--market-border);border-radius:10px;padding:12px 16px;margin:18px 0 0}
.seg-label{display:block;text-align:center;font-size:12px;color:#708693;margin:6px 0 10px}
.row-action{flex-shrink:0;margin-top:6px}
.nav-icon{font-size:15px}
.identity-icon :deep(svg){width:18px;height:18px}
.identity-icon .koi-icon{font-size:17px}
.factor-title{font-size:13px;font-weight:650;margin:22px 0 6px;padding-top:16px;border-top:1px solid #e8edf3}.factor-empty{font-size:12px;color:var(--market-muted);margin-bottom:10px;line-height:1.7}
.secret-box{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--market-surface-soft);border:1px solid var(--market-border);border-radius:10px;padding:12px 14px;margin:0}
.secret-box code{font-size:14px;letter-spacing:.12em;font-weight:650;color:var(--nc-accent);overflow-wrap:anywhere}
.break-all{overflow-wrap:anywhere;font-size:11px;margin:0}
.recovery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.recovery-grid code{background:#fff;border:1px solid var(--market-border);border-radius:8px;padding:8px 10px;font-size:13px;letter-spacing:.06em;text-align:center}
.dialog-field{display:grid;gap:8px;font-size:12px;color:#708693}.dialog-field input{padding:10px 12px;border:1px solid #dce7ed;border-radius:6px;color:#355260;background:#fff;width:100%}
@media(max-width:480px){.recovery-grid{grid-template-columns:1fr}.secret-box{flex-direction:column;align-items:flex-start}}
</style>
