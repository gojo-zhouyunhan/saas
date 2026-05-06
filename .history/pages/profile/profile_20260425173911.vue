<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <text class="nav-back" @click="goBack">←</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">我的</text>
        </view>
        <view class="nav-right">
          <text class="nav-setting" @click="goToSetting">设置</text>
        </view>
      </view>
    </view>

    <!-- 用户信息 -->
    <view class="user-info">
      <view class="avatar">
        <image src="/static/images/default-avatar.png" mode="aspectFill"></image>
      </view>
      <view class="user-details">
        <text class="user-name">用户名</text>
        <text class="user-id">ID: 12345678</text>
      </view>
      <view class="user-level">
        <text class="level-text">普通会员</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="function-list">
      <!-- 我的交易 -->
      <view class="function-section">
        <view class="function-item" @click="goToMyCars">
          <view class="function-icon car">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </view>
          <text class="function-name">我的车辆</text>
          <text class="function-arrow">›</text>
        </view>
        <view class="function-item" @click="goToMyOrders">
          <view class="function-icon order">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </view>
          <text class="function-name">我的订单</text>
          <text class="function-arrow">›</text>
        </view>
        <view class="function-item" @click="goToFavorites">
          <view class="function-icon favorite">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </view>
          <text class="function-name">我的收藏</text>
          <text class="function-arrow">›</text>
        </view>
      </view>

      <!-- 我的服务 -->
      <view class="function-section">
        <view class="function-item" @click="goToCoupons">
          <view class="function-icon coupon">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </view>
          <text class="function-name">优惠券</text>
          <text class="function-arrow">›</text>
        </view>
        <view class="function-item" @click="goToPoints">
          <view class="function-icon point">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </view>
          <text class="function-name">我的积分</text>
          <text class="function-arrow">›</text>
        </view>
        <view class="function-item" @click="goToHelp">
          <view class="function-icon help">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </view>
          <text class="function-name">帮助中心</text>
          <text class="function-arrow">›</text>
        </view>
      </view>

      <!-- 其他功能 -->
      <view class="function-section">
        <view class="function-item" @click="goToFeedback">
          <view class="function-icon feedback">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </view>
          <text class="function-name">意见反馈</text>
          <text class="function-arrow">›</text>
        </view>
        <view class="function-item" @click="goToAbout">
          <view class="function-icon about">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </view>
          <text class="function-name">关于我们</text>
          <text class="function-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <BottomNav currentPage="profile" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue';

export default {
  components: {
    BottomNav
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goToSetting() {
      console.log('跳转到设置页面');
      uni.showToast({
        title: '跳转到设置页面',
        icon: 'none'
      });
    },
    goToMyCars() {
      console.log('跳转到我的车辆页面');
      uni.showToast({
        title: '跳转到我的车辆页面',
        icon: 'none'
      });
    },
    goToMyOrders() {
      console.log('跳转到我的订单页面');
      uni.showToast({
        title: '跳转到我的订单页面',
        icon: 'none'
      });
    },
    goToFavorites() {
      console.log('跳转到我的收藏页面');
      uni.showToast({
        title: '跳转到我的收藏页面',
        icon: 'none'
      });
    },
    goToCoupons() {
      console.log('跳转到优惠券页面');
      uni.showToast({
        title: '跳转到优惠券页面',
        icon: 'none'
      });
    },
    goToPoints() {
      console.log('跳转到我的积分页面');
      uni.showToast({
        title: '跳转到我的积分页面',
        icon: 'none'
      });
    },
    goToHelp() {
      console.log('跳转到帮助中心页面');
      uni.showToast({
        title: '跳转到帮助中心页面',
        icon: 'none'
      });
    },
    goToFeedback() {
      console.log('跳转到意见反馈页面');
      uni.showToast({
        title: '跳转到意见反馈页面',
        icon: 'none'
      });
    },
    goToAbout() {
      console.log('跳转到关于我们页面');
      uni.showToast({
        title: '跳转到关于我们页面',
        icon: 'none'
      });
    }
  }
}
</script>

<style scoped>
  /* 基础样式 */
  .container {
    background-color: #F8FAFC;
    min-height: 100vh;
    padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
  }

  /* 导航栏 */
  .nav-bar {
    background-color: #FFFFFF;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  }

  .nav-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 30rpx;
  }

  .nav-back {
    font-size: 32rpx;
    color: #1E293B;
  }

  .nav-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
  }

  .nav-setting {
    font-size: 28rpx;
    color: #2563EB;
  }

  /* 用户信息 */
  .user-info {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background-color: #FFFFFF;
    margin-bottom: 20rpx;
  }

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20rpx;
  }

  .avatar image {
    width: 100%;
    height: 100%;
  }

  .user-details {
    flex: 1;
  }

  .user-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
    margin-bottom: 8rpx;
  }

  .user-id {
    font-size: 24rpx;
    color: #94A3B8;
  }

  .user-level {
    padding: 8rpx 16rpx;
    background-color: #EFF6FF;
    border-radius: 20rpx;
  }

  .level-text {
    font-size: 20rpx;
    color: #2563EB;
  }

  /* 功能列表 */
  .function-list {
    padding: 0 30rpx;
  }

  .function-section {
    background-color: #FFFFFF;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
  }

  .function-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  }

  .function-item:last-child {
    border-bottom: none;
  }

  .function-icon {
    width: 48rpx;
    height: 48rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
  }

  .function-icon.car {
    background-color: #EFF6FF;
  }

  .function-icon.order {
    background-color: #F0FDF4;
  }

  .function-icon.favorite {
    background-color: #FEF2F2;
  }

  .function-icon.coupon {
    background-color: #FEF3C7;
  }

  .function-icon.point {
    background-color: #F3E8FF;
  }

  .function-icon.help {
    background-color: #EFF6FF;
  }

  .function-icon.feedback {
    background-color: #F0FDF4;
  }

  .function-icon.about {
    background-color: #F1F5F9;
  }

  .icon {
    font-size: 32rpx;
  }

  .function-name {
    flex: 1;
    font-size: 28rpx;
    color: #1E293B;
  }

  .function-arrow {
    font-size: 24rpx;
    color: #94A3B8;
  }
</style>