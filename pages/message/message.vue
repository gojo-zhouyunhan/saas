<template>
  <view class="container">
    <view class="page-head">
      <text class="page-title">消息中心</text>
      <text class="page-action" @click="goToSetting">设置</text>
    </view>

    <view class="message-list">
      <view class="message-section">
        <text class="section-title">系统消息</text>
        <view class="message-item" v-for="msg in systemMessages" :key="msg.id">
          <view class="message-avatar system">
            <text class="avatar-text">系</text>
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{ msg.title }}</text>
              <text class="message-time">{{ msg.time }}</text>
            </view>
            <text class="message-desc">{{ msg.content }}</text>
          </view>
          <view v-if="!msg.read" class="message-badge"></view>
        </view>
      </view>

      <view class="message-section">
        <text class="section-title">交易消息</text>
        <view class="message-item" v-for="msg in tradeMessages" :key="msg.id">
          <view class="message-avatar trade">
            <text class="avatar-text">交</text>
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{ msg.title }}</text>
              <text class="message-time">{{ msg.time }}</text>
            </view>
            <text class="message-desc">{{ msg.content }}</text>
          </view>
          <view v-if="!msg.read" class="message-badge"></view>
        </view>
      </view>

      <view class="message-section">
        <text class="section-title">互动消息</text>
        <view class="message-item" v-for="msg in interactionMessages" :key="msg.id">
          <view class="message-avatar interaction">
            <text class="avatar-text">动</text>
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{ msg.title }}</text>
              <text class="message-time">{{ msg.time }}</text>
            </view>
            <text class="message-desc">{{ msg.content }}</text>
          </view>
          <view v-if="!msg.read" class="message-badge"></view>
        </view>
      </view>
    </view>

    <BottomNav currentPage="message" />
  </view>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'

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
          content: '您的账号已成功绑定手机号，现在可以使用更多车辆服务。',
          time: '10分钟前',
          read: false
        },
        {
          id: 2,
          title: '活动提醒',
          content: '新人注册礼包已到账，记得在个人中心查看。',
          time: '2小时前',
          read: true
        }
      ],
      tradeMessages: [
        {
          id: 3,
          title: '交易提醒',
          content: '您发布的车辆收到新的询问，请尽快回复买家。',
          time: '3小时前',
          read: false
        },
        {
          id: 4,
          title: '订单更新',
          content: '订单已支付成功，等待卖家确认后进入下一步流程。',
          time: '昨天',
          read: true
        }
      ],
      interactionMessages: [
        {
          id: 5,
          title: '互动提醒',
          content: '有用户收藏了您的车辆，曝光正在提升。',
          time: '昨天',
          read: false
        },
        {
          id: 6,
          title: '评论回复',
          content: '您参与的讨论有了新回复，点击查看详情。',
          time: '2天前',
          read: true
        }
      ]
    }
  },
  methods: {
    goToSetting() {
      uni.showToast({
        title: '设置页待接入',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: calc(24rpx + var(--status-bar-height)) 24rpx 180rpx;
  background: var(--c-bg);
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.page-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--c-text);
}

.page-action {
  font-size: 24rpx;
  color: var(--c-primary);
}

.message-list {
  display: grid;
  gap: 24rpx;
}

.message-section {
  display: grid;
  gap: 14rpx;
}

.section-title {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--c-muted);
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: var(--c-surface);
  box-shadow: var(--shadow-sm);
}

.message-avatar {
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar.system {
  background: var(--c-primary-soft);
  color: var(--c-primary);
}

.message-avatar.trade {
  background: #dcfce7;
  color: #15803d;
}

.message-avatar.interaction {
  background: #fef3c7;
  color: #b45309;
}

.avatar-text {
  font-size: 28rpx;
  font-weight: 700;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.message-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text);
}

.message-time {
  font-size: 22rpx;
  color: var(--c-muted-2);
  flex-shrink: 0;
}

.message-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--c-muted);
}

.message-badge {
  width: 14rpx;
  height: 14rpx;
  margin-top: 12rpx;
  border-radius: 50%;
  background: var(--c-danger);
  flex-shrink: 0;
}
</style>
