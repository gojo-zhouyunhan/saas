<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-top">
        <text class="back" @click="goBack">&lt;</text>
        <text class="nav-title">{{ label('membershipTitle') }}</text>
        <text class="nav-placeholder"></text>
      </view>
    </view>

    <view class="current-panel">
      <text class="current-label">{{ label('currentMember') }}</text>
      <text class="current-name">{{ currentMemberText }}</text>
      <text class="current-expire">{{ memberExpireText }}</text>
    </view>

    <view class="plan-list">
      <view v-if="!plans.length" class="empty">{{ label('planEmpty') }}</view>
      <view
        v-for="plan in plans"
        :key="plan.planId"
        class="plan-card"
        :class="{ active: selectedPlanId === plan.planId, disabled: isPlanDisabled(plan) }"
        @click="selectPlan(plan)"
      >
        <view class="plan-head">
          <text class="plan-name">{{ planName(plan) }}</text>
          <text class="plan-price">{{ label('currencyPrefix') }}{{ priceText(payablePrice(plan)) }}{{ label('monthly') }}</text>
        </view>
        <text class="plan-desc">{{ plan.description || planName(plan) }}</text>
        <text v-if="currentPlan && !isPlanDisabled(plan)" class="plan-note">
          {{ label('upgradePayAmount') }} {{ label('currencyPrefix') }}{{ priceText(payablePrice(plan)) }}
        </text>
        <text v-if="planDisabledText(plan)" class="plan-note disabled-note">{{ planDisabledText(plan) }}</text>
      </view>
    </view>

    <view class="pay-options">
      <button class="pay-button wechat-button" :class="{ disabled: !canSubmit }" @click="createOrder('WECHAT')">{{ label('wechatPay') }}</button>
      <button class="pay-button alipay-button" :class="{ disabled: !canSubmit }" @click="createOrder('ALIPAY')">{{ label('alipay') }}</button>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { getUiLabel } from '../../utils/field-label'
import { openPage, goBackOrFallback } from '../../utils/navigation'

const PLAN_LABEL_KEY = {
  BASIC: 'basicPlan',
  PRO: 'proPlan',
  ENTERPRISE: 'enterprisePlan'
}

const MEMBER_LABEL_KEY = {
  BASIC: 'basicMember',
  PRO: 'proMember',
  ENTERPRISE: 'enterpriseMember'
}

const PLAN_LEVEL = {
  BASIC: 1,
  PRO: 2,
  ENTERPRISE: 3
}

export default {
  data() {
    return {
      userInfo: {},
      plans: [],
      selectedPlanId: null,
      submitting: false
    }
  },
  computed: {
    currentMemberText() {
      const level = this.currentLevel
      return level ? this.label(MEMBER_LABEL_KEY[level] || level) : this.label('ordinaryUser')
    },
    currentLevel() {
      if (!this.isActiveMembership()) {
        return ''
      }
      return (this.userInfo && this.userInfo.memberLevel) || ''
    },
    currentPlan() {
      if (!this.currentLevel) {
        return null
      }
      return this.plans.find((plan) => plan.planCode === this.currentLevel) || null
    },
    canSubmit() {
      const plan = this.plans.find((item) => item.planId === this.selectedPlanId)
      return !!plan && !this.isPlanDisabled(plan) && !this.submitting
    },
    memberExpireText() {
      const value = this.userInfo && this.userInfo.memberExpireAt
      if (!this.currentLevel || !value) {
        return this.label('noExpireTime')
      }
      return `${this.label('expireAt')}：${String(value).slice(0, 10)}`
    }
  },
  onShow() {
    this.loadAccount()
    this.loadPlans()
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
          if (res.data && res.data.code === 200 && res.data.data && res.data.data.user) {
            this.userInfo = res.data.data.user
            uni.setStorageSync('user', this.userInfo)
            this.ensureSelectablePlan()
          }
        }
      })
    },
    loadPlans() {
      request({
        url: '/api/membership/plans',
        method: 'GET',
        success: (res) => {
          if (!res.data || res.data.code !== 200 || !Array.isArray(res.data.data)) {
            uni.showToast({ title: this.label('planLoadFailed'), icon: 'none' })
            return
          }
          this.plans = res.data.data
          this.ensureSelectablePlan()
        }
      })
    },
    ensureSelectablePlan() {
      const selected = this.plans.find((plan) => plan.planId === this.selectedPlanId)
      if (selected && !this.isPlanDisabled(selected)) {
        return
      }
      const firstUpgradeable = this.plans.find((plan) => !this.isPlanDisabled(plan))
      this.selectedPlanId = firstUpgradeable ? firstUpgradeable.planId : null
    },
    selectPlan(plan) {
      if (this.isPlanDisabled(plan)) {
        uni.showToast({ title: this.planDisabledText(plan), icon: 'none' })
        return
      }
      this.selectedPlanId = plan.planId
    },
    planName(plan) {
      return this.label(PLAN_LABEL_KEY[plan.planCode] || plan.planName || plan.planCode)
    },
    priceText(value) {
      return Number(value || 0).toFixed(0)
    },
    payablePrice(plan) {
      const price = Number(plan && plan.price ? plan.price : 0)
      if (!this.currentPlan) {
        return price
      }
      return Math.max(0, price - Number(this.currentPlan.price || 0))
    },
    isActiveMembership() {
      const level = this.userInfo && this.userInfo.memberLevel
      const expireAt = this.userInfo && this.userInfo.memberExpireAt
      if (!level || !expireAt) {
        return false
      }
      return new Date(expireAt).getTime() > Date.now()
    },
    isPlanDisabled(plan) {
      if (!this.currentLevel) {
        return false
      }
      return this.planLevel(plan.planCode) <= this.planLevel(this.currentLevel)
    },
    planDisabledText(plan) {
      if (!this.currentLevel || !this.isPlanDisabled(plan)) {
        return ''
      }
      if (plan.planCode === this.currentLevel) {
        return this.label('currentPlanUnavailable')
      }
      return this.label('downgradeUnavailable')
    },
    planLevel(planCode) {
      return PLAN_LEVEL[planCode] || 0
    },
    createOrder(payChannel) {
      if (this.submitting) {
        return
      }
      const selectedPlan = this.plans.find((plan) => plan.planId === this.selectedPlanId)
      if (!selectedPlan) {
        uni.showToast({ title: this.label(this.currentLevel ? 'noUpgradeablePlan' : 'selectPlanFirst'), icon: 'none' })
        return
      }
      if (this.isPlanDisabled(selectedPlan)) {
        uni.showToast({ title: this.planDisabledText(selectedPlan), icon: 'none' })
        return
      }
      this.submitting = true
      request({
        url: '/api/membership/create',
        method: 'POST',
        data: {
          planId: this.selectedPlanId,
          payChannel
        },
        success: (res) => {
          if (!res.data || res.data.code !== 200 || !res.data.data) {
            uni.showToast({ title: (res.data && res.data.message) || this.label('memberOrderFailed'), icon: 'none' })
            return
          }
          const order = res.data.data
          openPage(`/pages/profile/member-pay?orderId=${order.orderId}&channel=${payChannel}`)
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
.container { min-height: 100vh; padding-bottom: 140rpx; background: linear-gradient(180deg, #eef3f7 0%, var(--c-bg) 32%, var(--c-bg) 100%); }
.nav-bar { background-color: var(--c-nav); }
.nav-top { display: flex; align-items: center; justify-content: space-between; padding: var(--nav-pt) var(--nav-px) var(--nav-pb); }
.back { width: 72rpx; color: #fff; font-size: 40rpx; line-height: 1; }
.nav-title { color: #fff; font-size: 32rpx; font-weight: 700; }
.nav-placeholder { width: 72rpx; }
.current-panel { margin: 24rpx; padding: 34rpx 30rpx; border-radius: 18rpx; background: linear-gradient(135deg, #1f2937 0%, #0b3c5d 100%); box-shadow: 0 18rpx 42rpx rgba(11,60,93,0.18); }
.current-label { display: block; color: rgba(255,255,255,0.72); font-size: 24rpx; }
.current-name { display: block; margin-top: 10rpx; color: #fff; font-size: 42rpx; font-weight: 900; }
.current-expire { display: block; margin-top: 8rpx; color: rgba(255,255,255,0.72); font-size: 24rpx; }
.plan-list { margin: 0 24rpx; display: grid; gap: 20rpx; }
.empty { padding: 40rpx 24rpx; text-align: center; color: var(--c-muted-2); background: #fff; border-radius: 18rpx; }
.plan-card { padding: 30rpx; border-radius: 18rpx; background: #fff; border: 2rpx solid transparent; box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); }
.plan-card.active { border-color: #0b3c5d; background: linear-gradient(180deg, #ffffff 0%, #f4f8fb 100%); box-shadow: 0 16rpx 42rpx rgba(11,60,93,0.12); }
.plan-card.disabled { opacity: 0.52; background: #f8fafc; }
.plan-head { display: flex; align-items: baseline; justify-content: space-between; gap: 20rpx; }
.plan-name { color: var(--c-text); font-size: 34rpx; font-weight: 900; }
.plan-price { color: #111827; font-size: 28rpx; font-weight: 800; }
.plan-desc { display: block; margin-top: 14rpx; color: var(--c-muted-2); font-size: 24rpx; line-height: 1.6; }
.plan-note { display: block; margin-top: 10rpx; color: #0b3c5d; font-size: 22rpx; line-height: 1.5; font-weight: 700; }
.disabled-note { color: #94a3b8; }
.pay-options { position: fixed; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 18rpx; padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,0.96); backdrop-filter: blur(12rpx); box-shadow: 0 -12rpx 30rpx rgba(15,23,42,0.08); }
.pay-button { height: 82rpx; line-height: 82rpx; margin: 0; border-radius: 14rpx; color: #fff; font-size: 28rpx; font-weight: 800; }
.pay-button.disabled { opacity: 0.45; }
.wechat-button { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
.alipay-button { background: linear-gradient(135deg, #1677ff 0%, #0f5fd7 100%); }
</style>
