<template>
  <view class="bottom-nav">
    <view class="nav-item" :class="{ active: currentPage === 'index' }" @click="navigateTo('index')">
      <view class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      </view>
      <text class="nav-text">首页</text>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'location' }" @click="navigateTo('location')">
      <view class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </view>
      <text class="nav-text">同城</text>
    </view>
    <view class="nav-item sell" @click="navigateTo('sell')">
      <view class="nav-icon-wrapper sell-icon">
        <svg class="nav-icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </view>
      <text class="nav-text">卖闲置</text>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'message' }" @click="navigateTo('message')">
      <view class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </view>
      <text class="nav-text">消息</text>
      <view class="badge">99+</view>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'profile' }" @click="navigateTo('profile')">
      <view class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </view>
      <text class="nav-text">我的</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    currentPage: {
      type: String,
      default: 'index'
    }
  },
  methods: {
    navigateTo(page) {
      uni.navigateTo({
        url: `/pages/${page}/${page}`
      });
    }
  }
}
</script>

<style scoped>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #FFFFFF;
    border-top: 1rpx solid rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12rpx 0;
    padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
    z-index: 99;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    cursor-pointer: true;
    transition: all 0.2s ease;
    padding: 8rpx 16rpx;
  }

  .nav-item:active {
    opacity: 0.7;
    transform: scale(0.95);
  }

  .nav-item.active .nav-text {
    color: #7C3AED;
    font-weight: 600;
  }

  .nav-item.active .nav-icon-wrapper svg {
    color: #7C3AED;
  }

  .nav-icon-wrapper {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4rpx;
  }

  .nav-icon {
    width: 40rpx;
    height: 40rpx;
    color: #64748B;
    transition: color 0.2s ease;
  }

  .nav-text {
    font-size: 22rpx;
    color: #64748B;
    transition: color 0.2s ease;
  }

  .nav-item.sell {
    position: relative;
    top: -24rpx;
  }

  .sell-icon {
    width: 96rpx;
    height: 96rpx;
    background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(124, 58, 237, 0.35);
    transition: all 0.2s ease;
  }

  .sell-icon:active {
    transform: scale(0.92);
    box-shadow: 0 4rpx 12rpx rgba(124, 58, 237, 0.25);
  }

  .nav-icon-plus {
    width: 44rpx;
    height: 44rpx;
    color: #FFFFFF;
  }

  .badge {
    position: absolute;
    top: 0rpx;
    right: 8rpx;
    background-color: #EF4444;
    color: #FFFFFF;
    font-size: 18rpx;
    padding: 2rpx 10rpx;
    border-radius: 14rpx;
    font-weight: 600;
    min-width: 32rpx;
    text-align: center;
  }
</style>