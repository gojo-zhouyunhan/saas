<template>
  <view class="container">
    <view class="pay-card">
      <view class="pay-logo" :class="channelClass">{{ channelShortName }}</view>
      <text class="pay-title">{{ label('memberPayTitle') }}</text>
      <text class="pay-subtitle">{{ channelName }}</text>

      <view class="amount-row">
        <text class="amount-label">{{ label('payAmount') }}</text>
        <text class="amount-value">{{ label('currencyPrefix') }}{{ amountText }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">{{ label('planName') }}</text>
        <text class="info-value">{{ planText }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">{{ label('orderNo') }}</text>
        <text class="info-value">{{ orderNo || '-' }}</text>
      </view>

      <button class="pay-button" :loading="paying" :disabled="paying || paid" @click="pay">
        {{ paid ? label('paid') : label('payNow') }}
      </button>
      <button class="cancel-button" @click="goBack">{{ label('back') }}</button>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { getUiLabel } from '../../utils/field-label'
import { goBackOrFallback } from '../../utils/navigation'

const PLAN_LABEL_KEY = {
  BASIC: 'basicPlan',
  PRO: 'proPlan',
  ENTERPRISE: 'enterprisePlan'
}

export default {
  data() {
    return {
      orderId: null,
      channel: 'WECHAT',
      orderNo: '',
      amount: 0,
      planText: '',
      paying: false,
      paid: false
    }
  },
  computed: {
    channelName() {
      return this.channel === 'ALIPAY' ? this.label('alipay') : this.label('wechatPay')
    },
    channelShortName() {
      return this.channel === 'ALIPAY' ? this.label('alipayShort') : this.label('wechatShort')
    },
    channelClass() {
      return this.channel === 'ALIPAY' ? 'alipay' : 'wechat'
    },
    amountText() {
      return Number(this.amount || 0).toFixed(2)
    }
  },
  onLoad(options) {
    this.orderId = options.orderId
    this.channel = options.channel === 'ALIPAY' ? 'ALIPAY' : 'WECHAT'
    this.loadOrder()
  },
  methods: {
    label(key) {
      return getUiLabel(key)
    },
    loadOrder() {
      request({
        url: '/api/membership/orders',
        method: 'GET',
        success: (res) => {
          if (!res.data || res.data.code !== 200 || !Array.isArray(res.data.data)) {
            return
          }
          const order = res.data.data.find((item) => String(item.orderId) === String(this.orderId))
          if (!order) {
            return
          }
          this.orderNo = order.orderNo
          this.amount = Number(order.amount || 0)
          this.paid = Number(order.status) === 1
          this.loadPlanText(order.planId)
        }
      })
    },
    loadPlanText(planId) {
      request({
        url: '/api/membership/plans',
        method: 'GET',
        success: (res) => {
          if (!res.data || res.data.code !== 200 || !Array.isArray(res.data.data)) {
            return
          }
          const plan = res.data.data.find((item) => String(item.planId) === String(planId))
          if (plan) {
            this.planText = this.label(PLAN_LABEL_KEY[plan.planCode] || plan.planName || plan.planCode)
          }
        }
      })
    },
    pay() {
      if (this.paying || this.paid) {
        return
      }
      this.paying = true
      request({
        url: '/api/membership/mock-pay',
        method: 'POST',
        data: {
          orderId: Number(this.orderId)
        },
        success: (res) => {
          if (!res.data || res.data.code !== 200 || !res.data.data) {
            uni.showToast({ title: (res.data && res.data.message) || this.label('payFailed'), icon: 'none' })
            return
          }
          if (res.data.data.user) {
            uni.setStorageSync('user', res.data.data.user)
          }
          this.paid = true
          uni.showToast({ title: this.label('memberUpgradeSuccess'), icon: 'success' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/profile/profile' })
          }, 700)
        },
        fail: () => {
          uni.showToast({ title: this.label('networkError'), icon: 'none' })
        },
        complete: () => {
          this.paying = false
        }
      })
    },
    goBack() {
      goBackOrFallback('/pages/profile/member-upgrade')
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40rpx 24rpx; background: linear-gradient(180deg, #eef3f7 0%, #f3f4f6 100%); box-sizing: border-box; }
.pay-card { width: 100%; padding: 46rpx 32rpx; border-radius: 18rpx; background: #fff; box-shadow: 0 18rpx 50rpx rgba(15,23,42,0.1); border: 1rpx solid rgba(15,23,42,0.04); box-sizing: border-box; }
.pay-logo { width: 88rpx; height: 88rpx; display: flex; align-items: center; justify-content: center; margin: 0 auto 22rpx; border-radius: 18rpx; color: #fff; font-size: 38rpx; font-weight: 800; }
.wechat { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
.alipay { background: linear-gradient(135deg, #1677ff 0%, #0f5fd7 100%); }
.pay-title { display: block; text-align: center; color: #111827; font-size: 36rpx; font-weight: 800; }
.pay-subtitle { display: block; text-align: center; margin-top: 8rpx; color: #6b7280; font-size: 24rpx; }
.amount-row { margin-top: 42rpx; padding: 34rpx 0; border-top: 1rpx solid #f0f2f5; border-bottom: 1rpx solid #f0f2f5; background: linear-gradient(180deg, rgba(248,250,252,0.8), rgba(255,255,255,0)); }
.amount-label { display: block; text-align: center; color: #6b7280; font-size: 24rpx; margin-bottom: 10rpx; }
.amount-value { display: block; text-align: center; color: #111827; font-size: 58rpx; font-weight: 900; }
.info-row { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 0; border-bottom: 1rpx solid #f0f2f5; gap: 20rpx; }
.info-label { color: #6b7280; font-size: 26rpx; }
.info-value { flex: 1; text-align: right; color: #111827; font-size: 26rpx; word-break: break-all; }
.pay-button { height: 88rpx; line-height: 88rpx; margin-top: 36rpx; background: linear-gradient(135deg, #1f2937 0%, #0b3c5d 100%); color: #fff; border-radius: 14rpx; font-size: 30rpx; font-weight: 800; box-shadow: 0 12rpx 30rpx rgba(11,60,93,0.18); }
.cancel-button { height: 82rpx; line-height: 82rpx; margin-top: 18rpx; background: #f3f4f6; color: #374151; border-radius: 14rpx; font-size: 28rpx; }
</style>
