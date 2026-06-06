<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-top">
        <text class="nav-title">{{ label('profile') }}</text>
        <text class="nav-setting" @click="goToSetting">{{ label('settings') }}</text>
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
        <text class="level-text">{{ memberLevelText }}</text>
      </view>
    </view>

    <view class="wallet-panel">
      <view>
        <text class="wallet-label">{{ label('balance') }}</text>
        <text class="wallet-amount">{{ label('currencyPrefix') }}{{ balanceText }}</text>
      </view>
      <button class="recharge-button" @click="goToRecharge">{{ label('recharge') }}</button>
    </view>

    <view class="member-panel">
      <view>
        <text class="member-label">{{ label('currentMember') }}</text>
        <text class="member-name">{{ memberLevelText }}</text>
        <text class="member-expire">{{ memberExpireText }}</text>
      </view>
      <button class="member-button" @click="goToMembership">{{ label('upgradeMember') }}</button>
    </view>

    <view class="function-list">
      <view class="function-section">
        <view class="function-item" @click="goToMyCars">
          <text class="function-name">{{ label('myCars') }}</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToDrafts">
          <text class="function-name">{{ label('drafts') }}</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToMyOrders">
          <text class="function-name">{{ label('orders') }}</text>
          <text class="function-arrow">></text>
        </view>
      </view>

      <view class="function-section">
        <view class="function-item" @click="goToFavorites">
          <text class="function-name">{{ label('favorites') }}</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToPoints">
          <text class="function-name">{{ label('points') }}</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToHelp">
          <text class="function-name">{{ label('helpCenter') }}</text>
          <text class="function-arrow">></text>
        </view>
      </view>

      <view class="function-section">
        <view class="function-item" @click="goToFeedback">
          <text class="function-name">{{ label('feedback') }}</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item" @click="goToAbout">
          <text class="function-name">{{ label('about') }}</text>
          <text class="function-arrow">></text>
        </view>
        <view class="function-item logout" @click="logout">
          <text class="function-name logout-text">{{ label('logOut') }}</text>
          <text class="function-arrow">></text>
        </view>
      </view>
    </view>

    <BottomNav currentPage="profile" />
    <AppDialog
      :visible="logoutDialogVisible"
      :title="label('logOutTitle')"
      :content="label('logOutContent')"
      :cancel-text="label('back')"
      :confirm-text="label('logOutConfirm')"
      @cancel="logoutDialogVisible = false"
      @confirm="confirmLogout"
    />
  </view>
</template>

<script>
import AppDialog from '../../components/AppDialog.vue'
import BottomNav from '../../components/BottomNav.vue'
import { request } from '../../utils/api'
import { getUiLabel } from '../../utils/field-label'
import { openPage } from '../../utils/navigation'

const MEMBER_LEVEL_TEXT = {
  BASIC: 'basicMember',
  PRO: 'proMember',
  ENTERPRISE: 'enterpriseMember'
}

export default {
  components: { AppDialog, BottomNav },
  data() {
    return {
      userInfo: {},
      balance: 0,
      logoutDialogVisible: false
    }
  },
  computed: {
    displayName() {
      const user = this.userInfo || {}
      return user.nickname || user.nickName || user.name || user.username || user.userName || user.phone || this.label('user')
    },
    userNumber() {
      const user = this.userInfo || {}
      const id = user.userId || user.id || user.number || user.userNo || user.uid
      return id ? `${this.label('idPrefix')}${id}` : `${this.label('idPrefix')}-`
    },
    memberLevelText() {
      const level = this.activeMemberLevel()
      return level ? this.label(MEMBER_LEVEL_TEXT[level] || level) : this.label('ordinaryUser')
    },
    memberExpireText() {
      const value = this.userInfo && this.userInfo.memberExpireAt
      if (!this.activeMemberLevel() || !value) {
        return this.label('noExpireTime')
      }
      return `${this.label('expireAt')}：${String(value).slice(0, 10)}`
    },
    balanceText() {
      const amount = Number(this.balance || 0)
      return amount.toFixed(2)
    },
    avatarUrl() {
      const user = this.userInfo || {}
      return user.avatar || user.avatarUrl || user.headImg || '/static/images/default-avatar.png'
    }
  },
  onShow() {
    this.loadUserInfo()
    this.loadAccount()
  },
  methods: {
    label(key) {
      return getUiLabel(key)
    },
    activeMemberLevel() {
      const user = this.userInfo || {}
      const level = user.memberLevel || user.levelName || user.level || ''
      const expireAt = user.memberExpireAt
      if (!level || !expireAt || new Date(expireAt).getTime() <= Date.now()) {
        return ''
      }
      return level
    },
    loadUserInfo() {
      const storedUser = uni.getStorageSync('user')
      if (!storedUser) {
        this.userInfo = {}
        this.balance = 0
        return
      }
      try {
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser
        this.userInfo = parsedUser.user || parsedUser.userInfo || parsedUser
        this.balance = Number(this.userInfo.balance || 0)
      } catch (error) {
        this.userInfo = {}
        this.balance = 0
      }
    },
    loadAccount() {
      const token = uni.getStorageSync('token')
      if (!token) {
        return
      }
      request({
        url: '/api/recharge/account',
        method: 'GET',
        success: (res) => {
          if (!res.data || res.data.code !== 200 || !res.data.data) {
            return
          }
          const account = res.data.data
          this.userInfo = account.user || this.userInfo
          this.balance = Number(account.balance || this.userInfo.balance || 0)
          uni.setStorageSync('user', this.userInfo)
        }
      })
    },
    goToRecharge() {
      openPage('/pages/profile/recharge')
    },
    goToMembership() {
      openPage('/pages/profile/member-upgrade')
    },
    goToSetting() {
      uni.showToast({ title: this.label('comingSoon'), icon: 'none' })
    },
    goToMyCars() {
      openPage('/pages/profile/my-cars')
    },
    goToDrafts() {
      openPage('/pages/profile/drafts')
    },
    goToMyOrders() {
      openPage('/pages/profile/orders')
    },
    goToFavorites() {
      uni.showToast({ title: this.label('comingSoon'), icon: 'none' })
    },
    goToPoints() {
      uni.showToast({ title: this.label('comingSoon'), icon: 'none' })
    },
    goToHelp() {
      uni.showToast({ title: this.label('comingSoon'), icon: 'none' })
    },
    goToFeedback() {
      uni.showToast({ title: this.label('comingSoon'), icon: 'none' })
    },
    goToAbout() {
      uni.showToast({ title: this.label('comingSoon'), icon: 'none' })
    },
    clearLoginState() {
      uni.removeStorageSync('token')
      uni.removeStorageSync('user')
      uni.reLaunch({ url: '/pages/login/login' })
    },
    logout() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: this.label('notLoggedIn'), icon: 'none' })
        return
      }
      this.logoutDialogVisible = true
    },
    confirmLogout() {
      this.logoutDialogVisible = false
      request({
        url: '/api/user/unlogin',
        method: 'POST',
        complete: () => this.clearLoginState()
      })
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; padding-bottom: 180rpx; background: linear-gradient(180deg, #eef3f7 0%, var(--c-bg) 34%, var(--c-bg) 100%); }
.nav-bar { background-color: var(--c-nav); }
.nav-top { display: flex; justify-content: space-between; align-items: center; padding: var(--nav-pt) var(--nav-px) var(--nav-pb); }
.nav-title { font-size: 32rpx; font-weight: 600; color: var(--c-nav-text); }
.nav-setting { font-size: 28rpx; color: rgba(255, 255, 255, 0.85); }
.user-info { display: flex; align-items: center; padding: 40rpx 30rpx; background: rgba(255,255,255,0.98); margin: 24rpx; border-radius: 18rpx; box-shadow: 0 16rpx 42rpx rgba(15,23,42,0.08); border: 1rpx solid rgba(255,255,255,0.8); }
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; overflow: hidden; flex: 0 0 120rpx; margin-right: 24rpx; }
.avatar image { width: 100%; height: 100%; }
.user-details { flex: 1; min-width: 0; }
.user-name { display: block; font-size: 36rpx; font-weight: 700; color: var(--c-text); margin-bottom: 8rpx; }
.user-id { display: block; font-size: 24rpx; color: var(--c-muted-2); }
.user-level { padding: 10rpx 20rpx; background: var(--gradient-primary); border-radius: 14rpx; box-shadow: 0 8rpx 20rpx rgba(11,60,93,0.18); }
.level-text { font-size: 22rpx; color: #fff; }
.wallet-panel { display: flex; align-items: center; justify-content: space-between; margin: 0 24rpx 24rpx; padding: 34rpx 30rpx; background: linear-gradient(135deg, #1f2937 0%, #0b3c5d 100%); border-radius: 18rpx; box-shadow: 0 18rpx 42rpx rgba(11,60,93,0.18); }
.wallet-label { display: block; color: rgba(255, 255, 255, 0.72); font-size: 24rpx; margin-bottom: 10rpx; }
.wallet-amount { display: block; color: #fff; font-size: 42rpx; font-weight: 800; }
.recharge-button { width: 170rpx; height: 64rpx; line-height: 64rpx; margin: 0; padding: 0; background: #ffffff; color: #111827; border-radius: 14rpx; font-size: 26rpx; font-weight: 700; box-shadow: 0 8rpx 22rpx rgba(255,255,255,0.18); }
.member-panel { display: flex; align-items: center; justify-content: space-between; margin: 0 24rpx 24rpx; padding: 30rpx; background: #ffffff; border-radius: 18rpx; box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); border: 1rpx solid rgba(15,23,42,0.04); }
.member-label { display: block; color: var(--c-muted-2); font-size: 24rpx; margin-bottom: 8rpx; }
.member-name { display: block; color: var(--c-text); font-size: 34rpx; font-weight: 800; }
.member-expire { display: block; color: var(--c-muted-2); font-size: 22rpx; margin-top: 8rpx; }
.member-button { width: 190rpx; height: 64rpx; line-height: 64rpx; margin: 0; padding: 0; background: #111827; color: #fff; border-radius: 14rpx; font-size: 26rpx; font-weight: 700; }
.function-list { padding: 0 24rpx; }
.function-section { background-color: var(--c-surface); border-radius: 18rpx; margin-bottom: 24rpx; overflow: hidden; box-shadow: 0 10rpx 30rpx rgba(15,23,42,0.06); border: 1rpx solid rgba(15,23,42,0.04); }
.function-item { display: flex; align-items: center; padding: 28rpx; border-bottom: 1rpx solid rgba(0, 0, 0, 0.04); }
.function-item:last-child { border-bottom: none; }
.function-name { flex: 1; font-size: 30rpx; color: var(--c-text); }
.function-arrow { font-size: 32rpx; color: #cbd5e1; }
.logout-text { color: #dc2626; }
</style>
