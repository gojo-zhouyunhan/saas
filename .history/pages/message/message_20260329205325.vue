<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <text class="nav-back" @click="goBack">←</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">消息</text>
        </view>
        <view class="nav-right">
          <text class="nav-setting" @click="goToSetting">设置</text>
        </view>
      </view>
    </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <!-- 系统消息 -->
      <view class="message-section">
        <text class="section-title">系统消息</text>
        <view class="message-item" v-for="(msg, index) in systemMessages" :key="index">
          <view class="message-avatar system">
            <text class="avatar-icon">📢</text>
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{msg.title}}</text>
              <text class="message-time">{{msg.time}}</text>
            </view>
            <text class="message-desc">{{msg.content}}</text>
          </view>
          <view class="message-badge" v-if="!msg.read">●</view>
        </view>
      </view>

      <!-- 交易消息 -->
      <view class="message-section">
        <text class="section-title">交易消息</text>
        <view class="message-item" v-for="(msg, index) in tradeMessages" :key="index">
          <view class="message-avatar trade">
            <text class="avatar-icon">💬</text>
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{msg.title}}</text>
              <text class="message-time">{{msg.time}}</text>
            </view>
            <text class="message-desc">{{msg.content}}</text>
          </view>
          <view class="message-badge" v-if="!msg.read">●</view>
        </view>
      </view>

      <!-- 互动消息 -->
      <view class="message-section">
        <text class="section-title">互动消息</text>
        <view class="message-item" v-for="(msg, index) in interactionMessages" :key="index">
          <view class="message-avatar interaction">
            <text class="avatar-icon">👍</text>
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{msg.title}}</text>
              <text class="message-time">{{msg.time}}</text>
            </view>
            <text class="message-desc">{{msg.content}}</text>
          </view>
          <view class="message-badge" v-if="!msg.read">●</view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <BottomNav currentPage="message" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue';

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      systemMessages: [
        {
          id: 1,
          title: '系统通知',
          content: '您的账号已成功绑定手机，现在可以使用更多功能了',
          time: '10分钟前',
          read: false
        },
        {
          id: 2,
          title: '活动通知',
          content: '新用户注册送红包，快来领取吧！',
          time: '2小时前',
          read: true
        }
      ],
      tradeMessages: [
        {
          id: 3,
          title: '交易提醒',
          content: '您发布的二手车有新的买家询问，快去查看吧',
          time: '3小时前',
          read: false
        },
        {
          id: 4,
          title: '交易提醒',
          content: '您的订单已成功支付，等待卖家发货',
          time: '昨天',
          read: true
        }
      ],
      interactionMessages: [
        {
          id: 5,
          title: '互动消息',
          content: '您的商品被收藏了',
          time: '昨天',
          read: false
        },
        {
          id: 6,
          title: '互动消息',
          content: '您的评论收到了回复',
          time: '2天前',
          read: true
        }
      ]
    }
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

  /* 消息列表 */
  .message-list {
    padding: 20rpx 30rpx;
  }

  .message-section {
    margin-bottom: 30rpx;
  }

  .section-title {
    font-size: 24rpx;
    font-weight: bold;
    color: #64748B;
    margin-bottom: 16rpx;
  }

  .message-item {
    display: flex;
    align-items: flex-start;
    padding: 20rpx;
    background-color: #FFFFFF;
    border-radius: 12rpx;
    margin-bottom: 12rpx;
  }

  .message-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
  }

  .message-avatar.system {
    background-color: #EFF6FF;
  }

  .message-avatar.trade {
    background-color: #F0FDF4;
  }

  .message-avatar.interaction {
    background-color: #FEF3C7;
  }

  .avatar-icon {
    font-size: 32rpx;
  }

  .message-content {
    flex: 1;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
  }

  .message-title {
    font-size: 26rpx;
    font-weight: bold;
    color: #1E293B;
  }

  .message-time {
    font-size: 20rpx;
    color: #94A3B8;
  }

  .message-desc {
    font-size: 24rpx;
    color: #64748B;
    line-height: 1.4;
  }

  .message-badge {
    font-size: 20rpx;
    color: #FF6B6B;
    margin-left: 12rpx;
  }
</style>