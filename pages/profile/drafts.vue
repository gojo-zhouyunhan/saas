<template>
  <view class="container">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <text class="nav-title">{{ label('drafts') }}</text>
      <text class="nav-right" @click="loadDrafts">{{ label('refresh') }}</text>
    </view>

    <view v-if="loading" class="empty-box">
      <text class="empty-text">{{ label('loadingDrafts') }}</text>
    </view>

    <view v-else-if="!drafts.length" class="empty-box">
      <text class="empty-title">{{ label('noDrafts') }}</text>
      <text class="empty-text">{{ label('draftEmptyDesc') }}</text>
    </view>

    <view v-else class="draft-list">
      <view class="draft-card" v-for="draft in drafts" :key="draft.draftId" @click="openDraft(draft)">
        <image v-if="draftCover(draft)" class="draft-cover" :src="draftCover(draft)" mode="aspectFill"></image>
        <view class="draft-head">
          <text class="draft-title">{{ draft.title || label('unnamedDraft') }}</text>
          <text class="draft-time">{{ formatTime(draft.updatedAt) }}</text>
        </view>
        <text class="draft-desc">{{ draft.description || label('noDescription') }}</text>
        <view class="draft-meta">
          <text class="draft-pill">{{ draft.vehicleVin || label('noVin') }}</text>
          <text class="draft-pill">{{ draft.tradeType === 'offline' ? label('offlineTrade') : label('onlineTrade') }}</text>
          <text class="draft-pill">{{ draft.price ? `${label('currencyPrefix')}${draft.price}` : label('unpriced') }}</text>
        </view>
      </view>
    </view>

    <AppDialog
      :visible="continueDialogVisible"
      :title="label('continueEditTitle')"
      :content="label('continueEditContent')"
      :cancel-text="label('no')"
      :confirm-text="label('yes')"
      @cancel="continueDialogVisible = false"
      @confirm="confirmOpenDraft"
    />
  </view>
</template>

<script>
import AppDialog from '../../components/AppDialog.vue'
import { buildApiUrl } from '../../utils/api'
import { getUiLabel } from '../../utils/field-label'
import { goBackOrFallback, openPage } from '../../utils/navigation'

export default {
  components: { AppDialog },
  data() {
    return {
      loading: false,
      drafts: [],
      userId: '',
      selectedDraft: null,
      continueDialogVisible: false
    }
  },
  onShow() {
    this.hydrateUser()
    this.loadDrafts()
  },
  methods: {
    label(key) {
      return getUiLabel(key)
    },
    hydrateUser() {
      const storedUser = uni.getStorageSync('user')
      if (!storedUser) {
        return
      }
      try {
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser
        const user = parsedUser.user || parsedUser.userInfo || parsedUser
        this.userId = user.userId || user.id || user.uid || ''
      } catch (error) {
        this.userId = ''
      }
    },
    buildAuthHeader() {
      const token = uni.getStorageSync('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    loadDrafts() {
      if (!this.userId) {
        this.drafts = []
        return
      }
      this.loading = true
      uni.request({
        url: buildApiUrl(`/api/sell/draft/list?userId=${this.userId}`),
        header: this.buildAuthHeader(),
        success: (res) => {
          const payload = res.data || {}
          this.drafts = payload.code === 200 && Array.isArray(payload.data) ? payload.data : []
        },
        fail: () => {
          this.drafts = []
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    openDraft(draft) {
      if (!draft || !draft.draftId) {
        return
      }
      this.selectedDraft = draft
      this.continueDialogVisible = true
    },
    confirmOpenDraft() {
      const draft = this.selectedDraft
      this.continueDialogVisible = false
      this.selectedDraft = null
      if (draft && draft.draftId) {
        openPage(`/pages/sell/sell?draftId=${draft.draftId}`)
      }
    },
    draftCover(draft) {
      const images = this.normalizeImageList(draft && draft.imageUrls)
      return images[0] || ''
    },
    normalizeImageList(images) {
      if (!Array.isArray(images)) {
        return []
      }
      return images.map((image) => {
        if (typeof image !== 'string' || !image.trim()) {
          return ''
        }
        const value = image.trim()
        if (/^(https?:)?\/\//.test(value) || /^(blob:|data:|file:|wxfile:)/.test(value)) {
          return value
        }
        if (value.startsWith('/upload/')) {
          return buildApiUrl(value)
        }
        return value
      }).filter(Boolean)
    },
    goBack() {
      goBackOrFallback('/pages/profile/profile')
    },
    formatTime(value) {
      if (!value) {
        return this.label('savedJustNow')
      }
      return String(value).replace('T', ' ').slice(0, 16)
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: linear-gradient(180deg, #eef3f7 0%, var(--c-bg) 34%, var(--c-bg) 100%); padding-bottom: 60rpx; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: calc(24rpx + var(--status-bar-height)) 24rpx 20rpx; }
.nav-back, .nav-right { font-size: 28rpx; color: var(--c-primary); }
.nav-title { font-size: 32rpx; font-weight: 700; color: var(--c-text); }
.empty-box { margin: 24rpx; padding: 60rpx 30rpx; border-radius: 18rpx; background: rgba(255,255,255,0.96); text-align: center; box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); }
.empty-title { display: block; font-size: 30rpx; font-weight: 700; color: var(--c-text); }
.empty-text { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-muted); }
.draft-list { padding: 0 24rpx; }
.draft-card { margin-bottom: 20rpx; padding: 24rpx; border-radius: 18rpx; background: rgba(255,255,255,0.96); box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); border: 1rpx solid rgba(15,23,42,0.04); }
.draft-cover { width: 100%; height: 260rpx; margin-bottom: 18rpx; border-radius: 14rpx; background: rgba(148,163,184,0.16); }
.draft-head { display: flex; justify-content: space-between; gap: 16rpx; align-items: flex-start; }
.draft-title { flex: 1; font-size: 30rpx; font-weight: 700; color: var(--c-text); }
.draft-time { font-size: 22rpx; color: var(--c-muted); }
.draft-desc { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-text-2); }
.draft-meta { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 18rpx; }
.draft-pill { padding: 10rpx 16rpx; border-radius: 999rpx; background: rgba(11,60,93,0.08); color: var(--c-primary); font-size: 22rpx; }
</style>
