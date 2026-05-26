<template>
  <view class="container">
    <view class="page-head">
      <text class="page-title">我的订单</text>
      <text class="page-action" @click="createMockOrder">创建模拟订单</text>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-text">订单加载中...</text>
    </view>

    <view v-else-if="!orders.length" class="state-card">
      <text class="state-title">还没有订单</text>
      <text class="state-text">点击右上角先创建一个模拟订单，再测试微信或支付宝按钮。</text>
      <view class="primary-btn" @click="createMockOrder">创建模拟订单</view>
    </view>

    <view v-else class="order-list">
      <view v-for="item in orders" :key="item.orderId" class="order-card">
        <view class="order-top">
          <view>
            <text class="order-name">{{ item.productName || '模拟订单' }}</text>
            <text class="order-no">订单号：{{ item.orderNo || '--' }}</text>
          </view>
          <text class="order-status" :class="statusClass(item.status)">{{ statusText(item.status) }}</text>
        </view>

        <view class="order-body">
          <view class="meta-row">
            <text class="meta-label">金额</text>
            <text class="amount">¥{{ formatAmount(item.amount) }}</text>
          </view>
          <view class="meta-row">
            <text class="meta-label">创建时间</text>
            <text class="meta-value">{{ formatTime(item.createdAt) }}</text>
          </view>
          <view v-if="item.payTime" class="meta-row">
            <text class="meta-label">支付时间</text>
            <text class="meta-value">{{ formatTime(item.payTime) }}</text>
          </view>
          <view v-if="item.payTransactionId" class="meta-row">
            <text class="meta-label">流水号</text>
            <text class="meta-value">{{ item.payTransactionId }}</text>
          </view>
        </view>

        <view v-if="Number(item.status) === 0" class="action-row">
          <view class="pay-btn wechat" @click="mockPay(item, 1)">微信支付</view>
          <view class="pay-btn alipay" @click="mockPay(item, 2)">支付宝支付</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'

export default {
  data() {
    return {
      loading: false,
      orders: []
    }
  },
  onShow() {
    this.loadOrders()
  },
  methods: {
    loadOrders() {
      this.loading = true
      request({
        url: '/api/orders/my',
        method: 'GET',
        success: (res) => {
          const payload = res.data || {}
          this.orders = payload.code === 200 && Array.isArray(payload.data) ? payload.data : []
        },
        fail: () => {
          uni.showToast({ title: '订单加载失败', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    createMockOrder() {
      request({
        url: '/api/orders/mock/create',
        method: 'POST',
        data: {
          productCode: 'MOCK_PAY',
          productName: '模拟支付测试订单',
          amount: 99,
          orderType: 1
        },
        success: (res) => {
          const payload = res.data || {}
          if (payload.code !== 200) {
            uni.showToast({ title: payload.message || '创建失败', icon: 'none' })
            return
          }
          uni.showToast({ title: '订单已创建', icon: 'success' })
          this.loadOrders()
        },
        fail: () => {
          uni.showToast({ title: '创建失败', icon: 'none' })
        }
      })
    },
    mockPay(item, paymentMethod) {
      const channelName = paymentMethod === 1 ? '微信支付' : '支付宝支付'
      request({
        url: '/api/orders/mock/pay',
        method: 'POST',
        data: {
          orderId: item.orderId,
          paymentMethod
        },
        success: (res) => {
          const payload = res.data || {}
          if (payload.code !== 200) {
            uni.showToast({ title: payload.message || '支付失败', icon: 'none' })
            return
          }
          uni.showModal({
            title: channelName,
            content: `${channelName}模拟完成，支付成功。`,
            showCancel: false,
            confirmText: '知道了',
            success: () => this.loadOrders()
          })
        },
        fail: () => {
          uni.showToast({ title: '支付失败', icon: 'none' })
        }
      })
    },
    statusText(status) {
      switch (Number(status)) {
        case 0:
          return '待支付'
        case 1:
          return '已支付'
        case 2:
          return '已完成'
        case 3:
          return '已取消'
        case 4:
          return '已退款'
        default:
          return '未知状态'
      }
    },
    statusClass(status) {
      return Number(status) === 0 ? 'pending' : 'paid'
    },
    formatAmount(value) {
      const amount = Number(value || 0)
      return amount.toFixed(2)
    },
    formatTime(value) {
      if (!value) {
        return '--'
      }
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return String(value)
      }
      const pad = (num) => String(num).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background: var(--c-bg);
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 -24rpx 24rpx;
  padding: var(--nav-pt) var(--nav-px) var(--nav-pb);
  background: var(--c-nav);
}

.page-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
}

.page-action {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
}

.state-card,
.order-card {
  background: var(--c-surface);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
}

.state-card {
  padding: 40rpx 32rpx;
  text-align: center;
}

.state-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-text);
}

.state-text {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--c-muted);
}

.primary-btn {
  margin-top: 28rpx;
  padding: 22rpx 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.order-list {
  display: grid;
  gap: 24rpx;
}

.order-card {
  padding: 28rpx;
}

.order-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.order-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--c-text);
}

.order-no {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--c-muted-2);
}

.order-status {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.order-status.pending {
  background: #fef3c7;
  color: #b45309;
}

.order-status.paid {
  background: #dcfce7;
  color: #15803d;
}

.order-body {
  margin-top: 26rpx;
  display: grid;
  gap: 14rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.meta-label,
.meta-value {
  font-size: 24rpx;
  color: var(--c-muted);
}

.amount {
  font-size: 36rpx;
  font-weight: 800;
  color: #111827;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
  margin-top: 28rpx;
}

.pay-btn {
  padding: 22rpx 0;
  border-radius: 18rpx;
  text-align: center;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.pay-btn.wechat {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.pay-btn.alipay {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
}
</style>
