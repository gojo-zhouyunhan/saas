<template>
  <view class="bottom-nav-shell">
    <view class="bottom-nav">
      <view
        v-for="item in items"
        :key="item.key"
        class="nav-item"
        :class="{ active: currentPage === item.key, publish: item.key === 'sell' }"
        @click="navigateTo(item.path)"
      >
        <view class="nav-icon-wrapper" :class="{ 'publish-icon': item.key === 'sell' }">
          <view v-if="item.key === 'index'" class="icon-home">
            <view class="home-roof"></view>
            <view class="home-base"></view>
            <view class="home-door"></view>
          </view>

          <view v-else-if="item.key === 'location'" class="icon-location">
            <view class="location-drop"></view>
            <view class="location-hole"></view>
          </view>

          <view v-else-if="item.key === 'sell'" class="icon-publish">
            <view class="publish-bar bar-h"></view>
            <view class="publish-bar bar-v"></view>
          </view>

          <view v-else-if="item.key === 'message'" class="icon-message">
            <view class="message-box"></view>
            <view class="message-tail"></view>
            <view class="message-line line-top"></view>
            <view class="message-line line-bottom"></view>
          </view>

          <view v-else class="icon-profile">
            <view class="profile-head"></view>
            <view class="profile-shoulder"></view>
          </view>
        </view>

        <text class="nav-text">{{ item.text }}</text>
        <view v-if="item.badge" class="badge">{{ item.badge }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { openPage } from '../utils/navigation'

export default {
  props: {
    currentPage: {
      type: String,
      default: 'index'
    }
  },
  data() {
    return {
      items: [
        { key: 'index', text: '首页', path: '/pages/index/index' },
        { key: 'location', text: '同城', path: '/pages/location/location' },
        { key: 'sell', text: '发布', path: '/pages/sell/sell' },
        { key: 'message', text: '消息', path: '/pages/message/message' },
        { key: 'profile', text: '我的', path: '/pages/profile/profile' }
      ]
    }
  },
  methods: {
    navigateTo(path) {
      openPage(path)
    }
  }
}
</script>

<style scoped>
.bottom-nav-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 220;
  padding: 0 18rpx calc(12rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(243, 244, 246, 0) 0%, rgba(243, 244, 246, 0.9) 42%, rgba(243, 244, 246, 1) 100%);
}

.bottom-nav {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 14rpx 14rpx 10rpx;
  border: 1rpx solid rgba(11, 60, 93, 0.08);
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18rpx);
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.08);
}

.nav-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 0;
}

.nav-item.publish {
  transform: translateY(-18rpx);
}

.nav-icon-wrapper {
  position: relative;
  width: 78rpx;
  height: 78rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: all 0.25s ease;
}

.publish-icon {
  background: var(--gradient-primary);
  box-shadow: 0 16rpx 28rpx rgba(11, 60, 93, 0.22);
}

.nav-text {
  font-size: 22rpx;
  line-height: 1.2;
  color: var(--c-muted);
  transition: color 0.25s ease;
}

.active .nav-icon-wrapper:not(.publish-icon) {
  background: linear-gradient(180deg, rgba(230, 240, 246, 1) 0%, rgba(219, 233, 243, 0.82) 100%);
  box-shadow: inset 0 0 0 1rpx rgba(11, 60, 93, 0.04);
}

.active .nav-text {
  color: var(--c-primary);
  font-weight: 600;
}

.badge {
  position: absolute;
  top: 0;
  right: 22rpx;
  min-width: 34rpx;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  background: var(--c-danger);
  color: #ffffff;
  font-size: 18rpx;
  text-align: center;
}

.icon-home,
.icon-location,
.icon-publish,
.icon-message,
.icon-profile {
  position: relative;
  width: 42rpx;
  height: 42rpx;
}

.home-roof {
  position: absolute;
  left: 10rpx;
  top: 7rpx;
  width: 22rpx;
  height: 22rpx;
  border-top: 4rpx solid var(--c-muted);
  border-left: 4rpx solid var(--c-muted);
  transform: rotate(45deg);
  border-top-left-radius: 3rpx;
}

.home-base {
  position: absolute;
  left: 10rpx;
  bottom: 7rpx;
  width: 22rpx;
  height: 16rpx;
  border: 4rpx solid var(--c-muted);
  border-radius: 8rpx;
  background: transparent;
}

.home-door {
  position: absolute;
  left: 18rpx;
  bottom: 7rpx;
  width: 6rpx;
  height: 10rpx;
  border-radius: 4rpx 4rpx 0 0;
  background: var(--c-muted);
}

.location-drop {
  position: absolute;
  left: 11rpx;
  top: 5rpx;
  width: 20rpx;
  height: 20rpx;
  border: 4rpx solid var(--c-muted);
  border-radius: 20rpx 20rpx 20rpx 2rpx;
  transform: rotate(-45deg);
}

.location-hole {
  position: absolute;
  left: 18rpx;
  top: 13rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: var(--c-muted);
}

.publish-bar {
  position: absolute;
  left: 8rpx;
  top: 19rpx;
  width: 26rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.bar-v {
  left: 19rpx;
  top: 8rpx;
  width: 4rpx;
  height: 26rpx;
}

.message-box {
  position: absolute;
  left: 6rpx;
  top: 8rpx;
  width: 28rpx;
  height: 20rpx;
  border: 4rpx solid var(--c-muted);
  border-radius: 12rpx;
}

.message-tail {
  position: absolute;
  left: 14rpx;
  bottom: 6rpx;
  width: 10rpx;
  height: 10rpx;
  border-left: 4rpx solid var(--c-muted);
  border-bottom: 4rpx solid var(--c-muted);
  transform: skewX(-20deg) rotate(-24deg);
  border-bottom-left-radius: 4rpx;
}

.message-line {
  position: absolute;
  left: 14rpx;
  height: 3rpx;
  border-radius: 999rpx;
  background: var(--c-muted);
}

.line-top {
  top: 16rpx;
  width: 12rpx;
}

.line-bottom {
  top: 23rpx;
  width: 16rpx;
}

.profile-head {
  position: absolute;
  left: 13rpx;
  top: 5rpx;
  width: 16rpx;
  height: 16rpx;
  border: 4rpx solid var(--c-muted);
  border-radius: 999rpx;
}

.profile-shoulder {
  position: absolute;
  left: 8rpx;
  bottom: 5rpx;
  width: 26rpx;
  height: 14rpx;
  border: 4rpx solid var(--c-muted);
  border-top-left-radius: 18rpx;
  border-top-right-radius: 18rpx;
  border-bottom: none;
}

.active .home-roof,
.active .home-base,
.active .location-drop,
.active .message-box,
.active .message-tail,
.active .profile-head,
.active .profile-shoulder {
  border-color: var(--c-primary);
}

.active .home-door,
.active .location-hole,
.active .message-line {
  background: var(--c-primary);
}
</style>
