<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-top">
        <text class="nav-title">我的</text>
        <text class="nav-setting" @click="goToSetting">设置</text>
      </view>
    </view>

    <view class="user-info">
      <view class="avatar">
        <image :src="avatarUrl" mode="aspectFill"></image>
      </view>
      <view class="user-details">
        <text class="user-name">{{ displayName }}</text>
        <text class="user-id">{{ userNumber }}</text>
      </view>
      <view class="user-level">
        <text class="level-text">{{ memberLevel }}</text>
      </view>
    </view>

    <view class="function-list">
      <view class="function-section">
        <view class="function-item" @click="goToMyCars">
          <text class="function-name">我的车辆</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToDrafts">
          <text class="function-name">草稿箱</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToMyOrders">
          <text class="function-name">我的订单</text>
          <text class="function-arrow">></text>
        </view>
      </view>

      <view class="function-section">
        <view class="function-item" @click="goToFavorites">
          <text class="function-name">我的收藏</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToPoints">
          <text class="function-name">我的积分</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToHelp">
          <text class="function-name">帮助中心</text>
          <text class="function-arrow">></text>
        </view>
      </view>

      <view class="function-section">
        <view class="function-item" @click="goToFeedback">
          <text class="function-name">意见反馈</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToAbout">
          <text class="function-name">关于我们</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item logout" @click="logout">
          <text class="function-name logout-text">退出登录</text>
          <text class="function-arrow">></text>
        </view>
      </view>
    </view>

    <BottomNav currentPage="profile" />
  </view>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'
import { request } from '../../utils/api'
import { openPage } from '../../utils/navigation'

export default {
  components: { BottomNav },
  data() {
    return { userInfo: {} }
  },
  computed: {
    displayName() {
      const user = this.userInfo || {}
      return user.nickname || user.nickName || user.name || user.username || user.userName || user.phone || '用户名'
    },
    userNumber() {
      const user = this.userInfo || {}
      const id = user.userId || user.id || user.number || user.userNo || user.uid
      return id ? `编号：${id}` : '编号：--'
    },
    memberLevel() {
      const user = this.userInfo || {}
      return user.levelName || user.memberLevel || user.level || '普通会员'
    },
    avatarUrl() {
      const user = this.userInfo || {}
      return user.avatar || user.avatarUrl || user.headImg || '/static/images/default-avatar.png'
    }
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      const storedUser = uni.getStorageSync('user')
      if (!storedUser) {
        this.userInfo = {}
        return
      }
      try {
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser
        this.userInfo = parsedUser.user || parsedUser.userInfo || parsedUser
      } catch (error) {
        this.userInfo = {}
      }
    },
    goToSetting() {
      uni.showToast({ title: '设置页开发中', icon: 'none' })
    },
    goToMyCars() {
      uni.showToast({ title: '我的车辆页开发中', icon: 'none' })
    },
    goToDrafts() {
      openPage('/pages/profile/drafts')
    },
    goToMyOrders() {
      openPage('/pages/profile/orders')
    },
    goToFavorites() {
      uni.showToast({ title: '我的收藏页开发中', icon: 'none' })
    },
    goToPoints() {
      uni.showToast({ title: '我的积分页开发中', icon: 'none' })
    },
    goToHelp() {
      uni.showToast({ title: '帮助中心页开发中', icon: 'none' })
    },
    goToFeedback() {
      uni.showToast({ title: '意见反馈页开发中', icon: 'none' })
    },
    goToAbout() {
      uni.showToast({ title: '关于我们页开发中', icon: 'none' })
    },
    clearLoginState() {
      uni.removeStorageSync('token')
      uni.removeStorageSync('user')
      uni.reLaunch({ url: '/pages/login/login' })
    },
    logout() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '未登录', icon: 'none' })
        return
      }
      uni.showModal({
        title: '确认退出登录',
        content: '退出后需要重新登录。',
        confirmText: '退出',
        success: (res) => {
          if (!res.confirm) {
            return
          }
          request({
            url: '/api/user/unlogin',
            method: 'POST',
            complete: () => this.clearLoginState()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; padding-bottom: 180rpx; background: var(--c-bg); }
.nav-bar { background-color: var(--c-nav); }
.nav-top { display: flex; justify-content: space-between; align-items: center; padding: var(--nav-pt) var(--nav-px) var(--nav-pb); }
.nav-title { font-size: 32rpx; font-weight: 600; color: var(--c-nav-text); }
.nav-setting { font-size: 28rpx; color: rgba(255, 255, 255, 0.85); }
.user-info { display: flex; align-items: center; padding: 40rpx 30rpx; background-color: var(--c-surface); margin: 24rpx; border-radius: 24rpx; box-shadow: var(--shadow-sm); }
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; overflow: hidden; flex: 0 0 120rpx; margin-right: 24rpx; }
.avatar image { width: 100%; height: 100%; }
.user-details { flex: 1; min-width: 0; }
.user-name { display: block; font-size: 36rpx; font-weight: 700; color: var(--c-text); margin-bottom: 8rpx; }
.user-id { display: block; font-size: 24rpx; color: var(--c-muted-2); }
.user-level { padding: 10rpx 20rpx; background: var(--gradient-primary); border-radius: 20rpx; }
.level-text { font-size: 22rpx; color: #fff; }
.function-list { padding: 0 24rpx; }
.function-section { background-color: var(--c-surface); border-radius: 20rpx; margin-bottom: 24rpx; overflow: hidden; box-shadow: var(--shadow-sm); }
.function-item { display: flex; align-items: center; padding: 28rpx; border-bottom: 1rpx solid rgba(0, 0, 0, 0.04); }
.function-item:last-child { border-bottom: none; }
.function-name { flex: 1; font-size: 30rpx; color: var(--c-text); }
.function-arrow { font-size: 32rpx; color: #cbd5e1; }
.logout-text { color: #dc2626; }
</style>
