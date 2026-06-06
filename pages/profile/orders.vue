<template>
  <view class="container">
    <view class="page-head">
      <text class="page-title">{{ label('orders') }}</text>
      <text class="page-action" @click="createMockOrder">{{ label('createMockOrder') }}</text>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-text">{{ label('loadingOrders') }}</text>
    </view>

    <view v-else-if="!orders.length" class="state-card">
      <text class="state-title">{{ label('noOrders') }}</text>
      <text class="state-text">{{ label('noOrdersDesc') }}</text>
      <view class="primary-btn" @click="createMockOrder">{{ label('createMockOrder') }}</view>
    </view>

    <view v-else class="order-list">
      <view v-for="item in orders" :key="item.orderId" class="order-card">
        <view class="order-top">
          <view>
            <text class="order-name">{{ item.productName || label('mockOrder') }}</text>
            <text class="order-no">{{ label('orderNoLabel') }}{{ item.orderNo || '--' }}</text>
          </view>
          <text class="order-status" :class="statusClass(item.status)">{{ statusText(item.status) }}</text>
        </view>

        <view class="order-body">
          <view class="meta-row">
            <text class="meta-label">{{ label('amount') }}</text>
            <text class="amount">{{ label('currencyPrefix') }}{{ formatAmount(item.amount) }}</text>
          </view>
          <view class="meta-row">
            <text class="meta-label">{{ label('createdAt') }}</text>
            <text class="meta-value">{{ formatTime(item.createdAt) }}</text>
          </view>
          <view v-if="item.payTime" class="meta-row">
            <text class="meta-label">{{ label('paidAt') }}</text>
            <text class="meta-value">{{ formatTime(item.payTime) }}</text>
          </view>
          <view v-if="item.payTransactionId" class="meta-row">
            <text class="meta-label">{{ label('tradeNo') }}</text>
            <text class="meta-value">{{ item.payTransactionId }}</text>
          </view>
        </view>

        <view v-if="Number(item.status) === 0" class="action-row">
          <view class="pay-btn wechat" @click="mockPay(item, 1)">{{ label('wechatPay') }}</view>
          <view class="pay-btn alipay" @click="mockPay(item, 2)">{{ label('alipay') }}</view>
        </view>
      </view>
    </view>

    <AppDialog
      :visible="payDialogVisible"
      :title="payDialogTitle"
      :content="label('mockPayDone')"
      :cancel-text="label('back')"
      :confirm-text="label('gotIt')"
      @cancel="closePayDialog"
      @confirm="closePayDialog"
    />
  </view>
</template>

<script>
import AppDialog from '../../components/AppDialog.vue'
import { request } from '../../utils/api'
import { getUiLabel } from '../../utils/field-label'

export default {
  components: { AppDialog },
  data() {
    return {
      loading: false,
      orders: [],
      payDialogVisible: false,
      payDialogTitle: ''
    }
  },
  onShow() {
    this.loadOrders()
  },
  methods: {
    label(key) {
      return getUiLabel(key)
    },
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
          uni.showToast({ title: this.label('orderLoadFailed'), icon: 'none' })
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
          productName: this.label('mockOrder'),
          amount: 99,
          orderType: 1
        },
        success: (res) => {
          const payload = res.data || {}
          if (payload.code !== 200) {
            uni.showToast({ title: payload.message || this.label('createFailed'), icon: 'none' })
            return
          }
          uni.showToast({ title: this.label('orderCreated'), icon: 'success' })
          this.loadOrders()
        },
        fail: () => {
          uni.showToast({ title: this.label('createFailed'), icon: 'none' })
        }
      })
    },
    mockPay(item, paymentMethod) {
      const channelName = paymentMethod === 1 ? this.label('wechatPay') : this.label('alipay')
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
            uni.showToast({ title: payload.message || this.label('payFailed'), icon: 'none' })
            return
          }
          this.payDialogTitle = channelName
          this.payDialogVisible = true
        },
        fail: () => {
          uni.showToast({ title: this.label('payFailed'), icon: 'none' })
        }
      })
    },
    closePayDialog() {
      this.payDialogVisible = false
      this.loadOrders()
    },
    statusText(status) {
      switch (Number(status)) {
        case 0:
          return this.label('pendingPay')
        case 1:
          return this.label('paid')
        case 2:
          return this.label('completed')
        case 3:
          return this.label('cancelled')
        case 4:
          return this.label('refunded')
        default:
          return this.label('unknownStatus')
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
.container { min-height: 100vh; padding: 0 24rpx 40rpx; background: linear-gradient(180deg, #eef3f7 0%, var(--c-bg) 34%, var(--c-bg) 100%); }
.page-head { display: flex; align-items: center; justify-content: space-between; margin: 0 -24rpx 24rpx; padding: var(--nav-pt) var(--nav-px) var(--nav-pb); background: var(--c-nav); }
.page-title { font-size: 34rpx; font-weight: 700; color: #ffffff; }
.page-action { font-size: 24rpx; color: rgba(255,255,255,0.92); font-weight: 600; }
.state-card, .order-card { background: var(--c-surface); border-radius: 18rpx; box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); border: 1rpx solid rgba(15,23,42,0.04); }
.state-card { padding: 40rpx 32rpx; text-align: center; }
.state-title { display: block; font-size: 32rpx; font-weight: 700; color: var(--c-text); }
.state-text { display: block; margin-top: 14rpx; font-size: 24rpx; line-height: 1.6; color: var(--c-muted); }
.primary-btn { margin-top: 28rpx; padding: 22rpx 0; border-radius: 14rpx; background: linear-gradient(135deg, #1f2937 0%, #0b3c5d 100%); color: #ffffff; font-size: 28rpx; font-weight: 700; }
.order-list { display: grid; gap: 24rpx; }
.order-card { padding: 28rpx; }
.order-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16rpx; }
.order-name { display: block; font-size: 30rpx; font-weight: 700; color: var(--c-text); }
.order-no { display: block; margin-top: 10rpx; font-size: 22rpx; color: var(--c-muted-2); }
.order-status { padding: 10rpx 18rpx; border-radius: 999rpx; font-size: 22rpx; font-weight: 700; }
.order-status.pending { background: #fef3c7; color: #b45309; }
.order-status.paid { background: #dcfce7; color: #15803d; }
.order-body { margin-top: 26rpx; display: grid; gap: 14rpx; }
.meta-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.meta-label, .meta-value { font-size: 24rpx; color: var(--c-muted); }
.amount { font-size: 36rpx; font-weight: 800; color: #111827; }
.action-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18rpx; margin-top: 28rpx; }
.pay-btn { padding: 22rpx 0; border-radius: 14rpx; text-align: center; color: #ffffff; font-size: 28rpx; font-weight: 700; }
.pay-btn.wechat { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
.pay-btn.alipay { background: linear-gradient(135deg, #1677ff 0%, #0f5fd7 100%); }
</style>
