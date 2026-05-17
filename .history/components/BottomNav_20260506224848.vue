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
          <uni-icons
            v-if="item.key === 'index'"
            type="home"
            size="30"
            :color="currentPage === item.key ? 'var(--c-primary)' : 'var(--c-muted)'"
          ></uni-icons>

          <uni-icons
            v-else-if="item.key === 'location'"
            type="location"
            size="30"
            :color="currentPage === item.key ? 'var(--c-primary)' : 'var(--c-muted)'"
          ></uni-icons>

          <view v-else-if="item.key === 'sell'" class="icon-publish">
            <view class="publish-bar bar-h"></view>
            <view class="publish-bar bar-v"></view>
          </view>

          <uni-icons
            v-else-if="item.key === 'message'"
            type="chat"
            size="30"
            :color="currentPage === item.key ? 'var(--c-primary)' : 'var(--c-muted)'"
          ></uni-icons>

          <uni-icons
            v-else
            type="person"
            size="30"
            :color="currentPage === item.key ? 'var(--c-primary)' : 'var(--c-muted)'"
          ></uni-icons>
        </view>

        <text class="nav-text">{{ item.text }}</text>
        <view v-if="item.badge" class="badge">{{ item.badge }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { openPage } from '../utils/navigation'
import UniIcons from './uni-icons/uni-icons.vue'

export default {
  components: {
    UniIcons
  },
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

.icon-publish {
  position: relative;
  width: 42rpx;
  height: 42rpx;
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


</style>
