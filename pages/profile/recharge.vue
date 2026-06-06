<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-top">
        <text class="back" @click="goBack">&lt;</text>
        <text class="nav-title">{{ label('rechargeTitle') }}</text>
        <text class="nav-placeholder"></text>
      </view>
    </view>

    <view class="balance-panel">
      <text class="balance-label">{{ label('currentBalance') }}</text>
      <text class="balance-amount">{{ label('currencyPrefix') }}{{ balanceText }}</text>
    </view>

    <view class="section">
      <text class="section-title">{{ label('amount') }}</text>
      <view class="amount-grid">
        <view
          v-for="item in presetAmounts"
          :key="item"
          class="amount-item"
          :class="{ active: Number(amount) === item }"
          @click="selectAmount(item)"
        >
          <text>{{ label('currencyPrefix') }}{{ item }}</text>
        </view>
      </view>
      <input
        class="amount-input"
        type="digit"
        v-model="amount"
        :placeholder="label('enterAnotherAmount')"
        placeholder-class="input-placeholder"
      />
    </view>

    <view class="section">
      <text class="section-title">{{ label('paymentMethod') }}</text>
      <view class="pay-options">
        <view class="pay-option" @click="createOrder('WECHAT')">
          <view class="pay-icon wechat">{{ label('wechatShort') }}</view>
          <view class="pay-copy">
            <text class="pay-name">{{ label('wechatPay') }}</text>
            <text class="pay-desc">{{ label('openMockWechatCheckout') }}</text>
          </view>
          <text class="pay-arrow">></text>
        </view>
        <view class="pay-option" @click="createOrder('ALIPAY')">
          <view class="pay-icon alipay">{{ label('alipayShort') }}</view>
          <view class="pay-copy">
            <text class="pay-name">{{ label('alipay') }}</text>
            <text class="pay-desc">{{ label('openMockAlipayCheckout') }}</text>
          </view>
          <text class="pay-arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { getUiLabel } from '../../utils/field-label'
import { openPage, goBackOrFallback } from '../../utils/navigation'

export default {
  data() {
    return {
      balance: 0,
      amount: 100,
      presetAmounts: [50, 100, 200, 500, 1000, 2000],
      submitting: false
    }
  },
  computed: {
    balanceText() {
      return Number(this.balance || 0).toFixed(2)
    }
  },
  onShow() {
    this.loadAccount()
  },
  methods: {
    label(key) {
      return getUiLabel(key)
    },
    loadAccount() {
      request({
        url: '/api/recharge/account',
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.code === 200 && res.data.data) {
            this.balance = Number(res.data.data.balance || 0)
          }
        }
      })
    },
    selectAmount(value) {
      this.amount = value
    },
    createOrder(payChannel) {
      if (this.submitting) {
        return
      }
      const amount = Number(this.amount)
      if (!amount || amount < 1) {
        uni.showToast({ title: this.label('minimumAmount'), icon: 'none' })
        return
      }
      this.submitting = true
      request({
        url: '/api/recharge/create',
        method: 'POST',
        data: {
          amount,
          payChannel
        },
        success: (res) => {
          if (!res.data || res.data.code !== 200 || !res.data.data) {
            uni.showToast({ title: (res.data && res.data.message) || this.label('orderFailed'), icon: 'none' })
            return
          }
          const order = res.data.data
          openPage(`/pages/profile/recharge-pay?orderId=${order.orderId}&channel=${payChannel}`)
        },
        fail: () => {
          uni.showToast({ title: this.label('networkError'), icon: 'none' })
        },
        complete: () => {
          this.submitting = false
        }
      })
    },
    goBack() {
      goBackOrFallback('/pages/profile/profile')
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: linear-gradient(180deg, #eef3f7 0%, var(--c-bg) 32%, var(--c-bg) 100%); }
.nav-bar { background-color: var(--c-nav); }
.nav-top { display: flex; align-items: center; justify-content: space-between; padding: var(--nav-pt) var(--nav-px) var(--nav-pb); }
.back { width: 72rpx; color: #fff; font-size: 40rpx; line-height: 1; }
.nav-title { color: #fff; font-size: 32rpx; font-weight: 700; }
.nav-placeholder { width: 72rpx; }
.balance-panel { margin: 24rpx; padding: 36rpx 30rpx; border-radius: 18rpx; background: linear-gradient(135deg, #1f2937 0%, #0b3c5d 100%); box-shadow: 0 18rpx 42rpx rgba(11,60,93,0.18); }
.balance-label { display: block; color: rgba(255, 255, 255, 0.72); font-size: 24rpx; margin-bottom: 12rpx; }
.balance-amount { display: block; color: #fff; font-size: 48rpx; font-weight: 800; }
.section { margin: 24rpx; padding: 30rpx; border-radius: 18rpx; background: rgba(255,255,255,0.98); box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); border: 1rpx solid rgba(15,23,42,0.04); }
.section-title { display: block; margin-bottom: 24rpx; color: var(--c-text); font-size: 30rpx; font-weight: 700; }
.amount-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18rpx; }
.amount-item { height: 88rpx; display: flex; align-items: center; justify-content: center; border-radius: 14rpx; border: 1rpx solid #e5e7eb; background: #fff; color: var(--c-text); font-size: 28rpx; font-weight: 700; box-shadow: 0 4rpx 14rpx rgba(15,23,42,0.04); }
.amount-item.active { border-color: #0b3c5d; background: #e6f0f6; color: #0b3c5d; box-shadow: 0 8rpx 22rpx rgba(11,60,93,0.12); }
.amount-input { height: 88rpx; margin-top: 18rpx; padding: 0 24rpx; border-radius: 14rpx; background: #f8fafc; color: var(--c-text); font-size: 30rpx; border: 1rpx solid #e5e7eb; }
.input-placeholder { color: #9ca3af; }
.pay-options { display: flex; flex-direction: column; gap: 18rpx; }
.pay-option { display: flex; align-items: center; min-height: 112rpx; padding: 22rpx; border-radius: 14rpx; background: #f8fafc; border: 1rpx solid #edf2f7; }
.pay-icon { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; border-radius: 14rpx; color: #fff; font-size: 28rpx; font-weight: 800; margin-right: 20rpx; }
.wechat { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
.alipay { background: linear-gradient(135deg, #1677ff 0%, #0f5fd7 100%); }
.pay-copy { flex: 1; min-width: 0; }
.pay-name { display: block; color: var(--c-text); font-size: 30rpx; font-weight: 700; margin-bottom: 6rpx; }
.pay-desc { display: block; color: var(--c-muted-2); font-size: 24rpx; }
.pay-arrow { color: #cbd5e1; font-size: 32rpx; }
</style>
