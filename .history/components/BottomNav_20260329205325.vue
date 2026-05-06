<template>
  <view class="bottom-nav">
    <view class="nav-item" :class="{ active: currentPage === 'index' }" @click="navigateTo('index')">
      <view class="nav-icon-wrapper">
        <text class="nav-icon">🐟</text>
      </view>
      <text class="nav-text">闲鱼</text>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'location' }" @click="navigateTo('location')">
      <view class="nav-icon-wrapper">
        <text class="nav-icon">📍</text>
      </view>
      <text class="nav-text">北京</text>
    </view>
    <view class="nav-item sell" @click="navigateTo('sell')">
      <view class="nav-icon-wrapper sell-icon">
        <text class="nav-icon">+</text>
      </view>
      <text class="nav-text">卖闲置</text>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'message' }" @click="navigateTo('message')">
      <view class="nav-icon-wrapper">
        <text class="nav-icon">💬</text>
      </view>
      <text class="nav-text">消息</text>
      <view class="badge">99+</view>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'profile' }" @click="navigateTo('profile')">
      <view class="nav-icon-wrapper">
        <text class="nav-icon">👤</text>
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
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 16rpx 0;
    z-index: 99;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .nav-item.active .nav-text {
    color: #2563EB;
    font-weight: bold;
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
    font-size: 40rpx;
  }

  .nav-text {
    font-size: 20rpx;
    color: #64748B;
  }

  .nav-item.sell {
    position: relative;
    top: -20rpx;
  }

  .sell-icon {
    width: 72rpx;
    height: 72rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #FFFFFF;
    font-weight: bold;
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.4);
  }

  .badge {
    position: absolute;
    top: -8rpx;
    right: -16rpx;
    background-color: #FF6B6B;
    color: #FFFFFF;
    font-size: 16rpx;
    padding: 2rpx 8rpx;
    border-radius: 12rpx;
    font-weight: bold;
  }
</style>