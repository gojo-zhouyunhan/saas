<template>
  <view class="container">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <text class="nav-title">草稿箱</text>
      <text class="nav-right" @click="loadDrafts">刷新</text>
    </view>

    <view v-if="loading" class="empty-box">
      <text class="empty-text">正在加载草稿...</text>
    </view>

    <view v-else-if="!drafts.length" class="empty-box">
      <text class="empty-title">暂无草稿</text>
      <text class="empty-text">你在发布车辆过程中保存的文本和图片草稿，会显示在这里。</text>
    </view>

    <view v-else class="draft-list">
      <view class="draft-card" v-for="draft in drafts" :key="draft.draftId" @click="openDraft(draft)">
        <view class="draft-head">
          <text class="draft-title">{{ draft.title || '未命名草稿' }}</text>
          <text class="draft-time">{{ formatTime(draft.updatedAt) }}</text>
        </view>
        <text class="draft-desc">{{ draft.description || '暂无描述' }}</text>
        <view class="draft-meta">
          <text class="draft-pill">{{ draft.vehicleVin || '无 VIN' }}</text>
          <text class="draft-pill">{{ draft.tradeType === 'offline' ? '线下看车' : '线上沟通' }}</text>
          <text class="draft-pill">{{ draft.price ? `¥${draft.price}` : '未定价' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { buildApiUrl } from '../../utils/api'
import { goBackOrFallback, openPage } from '../../utils/navigation'

export default {
  data() {
    return {
      loading: false,
      drafts: [],
      userId: ''
    }
  },
  onShow() {
    this.hydrateUser()
    this.loadDrafts()
  },
  methods: {
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
      openPage(`/pages/sell/sell?draftId=${draft.draftId}`)
    },
    goBack() {
      goBackOrFallback('/pages/profile/profile')
    },
    formatTime(value) {
      if (!value) {
        return '刚刚保存'
      }
      return String(value).replace('T', ' ').slice(0, 16)
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: linear-gradient(180deg, #f3f7fb 0%, #edf3f8 100%); padding-bottom: 60rpx; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: calc(24rpx + var(--status-bar-height)) 24rpx 20rpx; }
.nav-back, .nav-right { font-size: 28rpx; color: var(--c-primary); }
.nav-title { font-size: 32rpx; font-weight: 700; color: var(--c-text); }
.empty-box { margin: 24rpx; padding: 60rpx 30rpx; border-radius: 24rpx; background: rgba(255,255,255,0.94); text-align: center; }
.empty-title { display: block; font-size: 30rpx; font-weight: 700; color: var(--c-text); }
.empty-text { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-muted); }
.draft-list { padding: 0 24rpx; }
.draft-card { margin-bottom: 20rpx; padding: 24rpx; border-radius: 24rpx; background: rgba(255,255,255,0.94); box-shadow: 0 16rpx 40rpx rgba(15,23,42,0.08); }
.draft-head { display: flex; justify-content: space-between; gap: 16rpx; align-items: flex-start; }
.draft-title { flex: 1; font-size: 30rpx; font-weight: 700; color: var(--c-text); }
.draft-time { font-size: 22rpx; color: var(--c-muted); }
.draft-desc { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-text-2); }
.draft-meta { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 18rpx; }
.draft-pill { padding: 10rpx 16rpx; border-radius: 999rpx; background: rgba(11, 60, 93, 0.08); color: var(--c-primary); font-size: 22rpx; }
</style>
