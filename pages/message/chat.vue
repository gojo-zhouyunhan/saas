<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <view class="nav-center">
        <text class="nav-title">{{ sellerName }}</text>
        <text class="nav-subtitle">{{ vehicleTitle || '在线沟通' }}</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="message-scroll"
      :scroll-into-view="scrollIntoView"
      :show-scrollbar="false"
    >
      <view class="message-list">
        <view
          v-for="item in messages"
          :key="item.id"
          :id="`msg-${item.id}`"
          class="message-row"
          :class="isMine(item) ? 'mine' : 'theirs'"
        >
          <view class="message-bubble" :class="isMine(item) ? 'message-bubble-mine' : 'message-bubble-theirs'">
            <text class="message-text">{{ item.content }}</text>
            <text class="message-time">{{ formatTime(item.createTime) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="composer">
      <input
        v-model="draftMessage"
        class="composer-input"
        type="text"
        confirm-type="send"
        placeholder="发送消息给商家"
        placeholder-style="color: #94a3b8;"
        @confirm="sendMessage"
      />
      <view class="send-button" @click="sendMessage">
        <text class="send-button-text">发送</text>
      </view>
    </view>
  </view>
</template>

<script>
import { goBackOrFallback } from '../../utils/navigation'
import {
  appendChatMessage,
  ensureChatSession,
  getChatMessages,
  getCurrentUserId
} from '../../utils/chat'

export default {
  data() {
    return {
      currentUserId: '',
      sellerUserId: '',
      sellerName: '商家',
      vehicleTitle: '',
      reportId: '',
      sessionId: '',
      draftMessage: '',
      messages: [],
      scrollIntoView: ''
    }
  },
  onLoad(options) {
    this.currentUserId = getCurrentUserId()
    this.sellerUserId = String(options.sellerUserId || '')
    this.sellerName = options.sellerName ? decodeURIComponent(options.sellerName) : `商家 ${this.sellerUserId || ''}`.trim()
    this.vehicleTitle = options.vehicleTitle ? decodeURIComponent(options.vehicleTitle) : ''
    this.reportId = String(options.reportId || '')

    if (!this.currentUserId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        goBackOrFallback('/pages/login/login')
      }, 300)
      return
    }

    if (!this.sellerUserId) {
      uni.showToast({ title: '商家信息缺失', icon: 'none' })
      setTimeout(() => {
        goBackOrFallback('/pages/message/message')
      }, 300)
      return
    }

    if (this.currentUserId === this.sellerUserId) {
      uni.showToast({ title: '这是您自己的车辆', icon: 'none' })
      setTimeout(() => {
        goBackOrFallback('/pages/car/detail')
      }, 300)
      return
    }

    const session = ensureChatSession({
      buyerUserId: this.currentUserId,
      sellerUserId: this.sellerUserId,
      sellerName: this.sellerName,
      vehicleTitle: this.vehicleTitle,
      reportId: this.reportId,
      lastMessage: this.vehicleTitle ? `正在咨询：${this.vehicleTitle}` : '发起了新的咨询'
    })
    this.sessionId = session.sessionId
    this.bootstrapMessages()
  },
  methods: {
    goBack() {
      goBackOrFallback('/pages/message/message')
    },
    bootstrapMessages() {
      const history = getChatMessages(this.sessionId)
      if (!history.length) {
        appendChatMessage(this.sessionId, {
          senderUserId: this.sellerUserId,
          content: this.vehicleTitle
            ? `您好，这台${this.vehicleTitle}还在售，您可以直接问我车况、价格和看车时间。`
            : '您好，欢迎咨询，您可以直接问我车况、价格和看车时间。'
        })
      }
      this.refreshMessages()
    },
    refreshMessages() {
      this.messages = getChatMessages(this.sessionId)
      this.$nextTick(() => {
        const last = this.messages[this.messages.length - 1]
        this.scrollIntoView = last ? `msg-${last.id}` : ''
      })
    },
    isMine(item) {
      return String(item.senderUserId) === String(this.currentUserId)
    },
    sendMessage() {
      const content = String(this.draftMessage || '').trim()
      if (!content) {
        return
      }
      appendChatMessage(this.sessionId, {
        senderUserId: this.currentUserId,
        content
      })
      this.draftMessage = ''
      this.refreshMessages()
      this.mockSellerReply(content)
    },
    mockSellerReply(content) {
      const lowerContent = String(content).toLowerCase()
      let reply = '收到，方便的话我可以继续给您补充这台车的具体情况。'
      if (lowerContent.includes('价格') || lowerContent.includes('多少') || lowerContent.includes('优惠')) {
        reply = '价格还可以再沟通，您如果诚心要，我这边可以和您细聊。'
      } else if (lowerContent.includes('车况') || lowerContent.includes('事故') || lowerContent.includes('保养')) {
        reply = '车况资料和检测记录都在，您关心的事故、保养和过户情况我都可以详细说明。'
      } else if (lowerContent.includes('看车') || lowerContent.includes('时间') || lowerContent.includes('地址')) {
        reply = '可以安排看车，您把方便的时间段发我，我这边和您对一下。'
      }

      setTimeout(() => {
        appendChatMessage(this.sessionId, {
          senderUserId: this.sellerUserId,
          content: reply
        })
        this.refreshMessages()
      }, 500)
    },
    formatTime(value) {
      if (!value) {
        return ''
      }
      const date = new Date(value)
      const hour = `${date.getHours()}`.padStart(2, '0')
      const minute = `${date.getMinutes()}`.padStart(2, '0')
      return `${hour}:${minute}`
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f3f7fb 0%, #edf3f8 100%);
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: calc(24rpx + var(--status-bar-height)) 24rpx 20rpx;
}

.nav-back {
  font-size: 28rpx;
  color: var(--c-primary);
}

.nav-center {
  flex: 1;
  min-width: 0;
}

.nav-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-text);
}

.nav-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--c-muted);
}

.message-scroll {
  flex: 1;
  min-height: 0;
}

.message-list {
  padding: 0 24rpx 24rpx;
}

.message-row {
  display: flex;
  margin-bottom: 18rpx;
}

.message-row.mine {
  justify-content: flex-end;
}

.message-row.theirs {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 78%;
  padding: 18rpx 20rpx 14rpx;
  border-radius: 22rpx;
  box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.08);
}

.message-bubble-mine {
  background: var(--c-primary);
  border-bottom-right-radius: 8rpx;
}

.message-bubble-theirs {
  background: rgba(255, 255, 255, 0.96);
  border-bottom-left-radius: 8rpx;
}

.message-text {
  display: block;
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--c-text);
  word-break: break-word;
}

.message-bubble-mine .message-text {
  color: #ffffff;
}

.message-time {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
  color: rgba(100, 116, 139, 0.92);
}

.message-bubble-mine .message-time {
  color: rgba(255, 255, 255, 0.78);
}

.composer {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -12rpx 30rpx rgba(15, 23, 42, 0.06);
}

.composer-input {
  flex: 1;
  height: 84rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: #f8fafc;
  font-size: 26rpx;
  color: var(--c-text);
}

.send-button {
  padding: 0 32rpx;
  height: 84rpx;
  border-radius: 999rpx;
  background: var(--c-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.send-button-text {
  font-size: 26rpx;
  font-weight: 700;
  color: #ffffff;
}
</style>
