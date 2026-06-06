<template>
  <view class="container">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <text class="nav-title">{{ label('myCars') }}</text>
      <text class="nav-right" @click="loadCars">{{ label('refresh') }}</text>
    </view>

    <view v-if="loading" class="empty-box">
      <text class="empty-text">{{ label('loadingMyCars') }}</text>
    </view>

    <view v-else-if="!cars.length" class="empty-box">
      <text class="empty-title">{{ label('noMyCars') }}</text>
      <text class="empty-text">{{ label('myCarsEmptyDesc') }}</text>
    </view>

    <view v-else class="car-list">
      <view class="car-card" v-for="car in cars" :key="car.reportId">
        <image v-if="coverImage(car)" class="car-cover" :src="coverImage(car)" mode="aspectFill"></image>
        <view class="car-content">
          <view class="car-head">
            <text class="car-title">{{ car.title || label('unnamedDraft') }}</text>
            <text class="car-time">{{ formatTime(car.updatedAt) }}</text>
          </view>
          <text class="car-desc">{{ car.description || label('noDescription') }}</text>
          <view class="car-meta">
            <text class="car-pill">{{ car.vehicleVin || label('noVin') }}</text>
            <text class="car-pill">{{ car.tradeType === 'offline' ? label('offlineTrade') : label('onlineTrade') }}</text>
            <text class="car-pill">{{ addressText(car) }}</text>
          </view>
          <view class="car-footer">
            <text class="car-status">AI {{ car.reportId }}</text>
            <view class="car-actions">
              <button class="action-button edit-button" @click.stop="editCar(car)">{{ label('edit') }}</button>
              <button class="action-button delete-button" @click.stop="confirmDelete(car)">{{ label('delete') }}</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request, buildApiUrl } from '../../utils/api'
import { getUiLabel } from '../../utils/field-label'
import { goBackOrFallback, openPage } from '../../utils/navigation'

export default {
  data() {
    return {
      loading: false,
      cars: [],
      userId: ''
    }
  },
  onShow() {
    this.hydrateUser()
    this.loadCars()
  },
  methods: {
    label(key) {
      return getUiLabel(key)
    },
    hydrateUser() {
      const storedUser = uni.getStorageSync('user')
      if (!storedUser) {
        this.userId = ''
        return
      }
      try {
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser
        const user = parsedUser.user || parsedUser.userInfo || parsedUser
        this.userId = user.userId || user.id || user.uid || ''
      } catch (error) {
        this.userId = ''
      }
    },
    loadCars() {
      if (!this.userId) {
        this.cars = []
        return
      }
      this.loading = true
      request({
        url: `/api/ai/report/my/list?userId=${this.userId}`,
        method: 'GET',
        success: (res) => {
          const payload = res.data || {}
          this.cars = payload.code === 200 && Array.isArray(payload.data) ? payload.data : []
        },
        fail: () => {
          this.cars = []
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    editCar(car) {
      if (!car || !car.reportId) {
        return
      }
      openPage(`/pages/sell/sell?edit=1&reportId=${car.reportId}`)
    },
    confirmDelete(car) {
      if (!car || !car.reportId) {
        return
      }
      uni.showModal({
        title: this.label('deleteCarTitle'),
        content: this.label('deleteCarContent'),
        confirmText: this.label('delete'),
        cancelText: this.label('back'),
        success: (res) => {
          if (res.confirm) {
            this.deleteCar(car)
          }
        }
      })
    },
    deleteCar(car) {
      request({
        url: `/api/ai/report/my/delete?reportId=${car.reportId}&userId=${this.userId}`,
        method: 'POST',
        success: (res) => {
          const payload = res.data || {}
          if (payload.code !== 200) {
            uni.showToast({ title: payload.message || this.label('deleteFailed'), icon: 'none' })
            return
          }
          uni.showToast({ title: this.label('deleteSuccess'), icon: 'success' })
          this.cars = this.cars.filter((item) => item.reportId !== car.reportId)
        },
        fail: () => {
          uni.showToast({ title: this.label('deleteFailed'), icon: 'none' })
        }
      })
    },
    coverImage(car) {
      const images = this.normalizeImageList(car && car.imageUrls)
      return images[0] || ''
    },
    normalizeImageList(images) {
      if (!Array.isArray(images)) {
        return []
      }
      return images.map((image) => {
        if (typeof image !== 'string' || !image.trim()) {
          return ''
        }
        const value = image.trim()
        if (/^(https?:)?\/\//.test(value) || /^(blob:|data:|file:|wxfile:)/.test(value)) {
          return value
        }
        if (value.startsWith('/upload/')) {
          return buildApiUrl(value)
        }
        return value
      }).filter(Boolean)
    },
    addressText(car) {
      const text = [car.sourceProvince, car.sourceCity, car.sourceDistrict].filter(Boolean).join(' ')
      return text || '-'
    },
    formatTime(value) {
      if (!value) {
        return this.label('savedJustNow')
      }
      return String(value).replace('T', ' ').slice(0, 16)
    },
    goBack() {
      goBackOrFallback('/pages/profile/profile')
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: linear-gradient(180deg, #eef3f7 0%, var(--c-bg) 34%, var(--c-bg) 100%); padding-bottom: 60rpx; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: calc(24rpx + var(--status-bar-height)) 24rpx 20rpx; }
.nav-back, .nav-right { font-size: 28rpx; color: var(--c-primary); }
.nav-title { font-size: 32rpx; font-weight: 700; color: var(--c-text); }
.empty-box { margin: 24rpx; padding: 60rpx 30rpx; border-radius: 8rpx; background: rgba(255,255,255,0.96); text-align: center; box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); }
.empty-title { display: block; font-size: 30rpx; font-weight: 700; color: var(--c-text); }
.empty-text { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-muted); }
.car-list { padding: 0 24rpx; }
.car-card { display: grid; grid-template-columns: 190rpx minmax(0, 1fr); gap: 22rpx; margin-bottom: 20rpx; padding: 22rpx; border-radius: 8rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(15,23,42,0.07); border: 1rpx solid rgba(15,23,42,0.05); }
.car-cover { width: 190rpx; height: 190rpx; border-radius: 8rpx; background: rgba(148,163,184,0.16); }
.car-content { min-width: 0; }
.car-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16rpx; }
.car-title { flex: 1; min-width: 0; color: var(--c-text); font-size: 30rpx; line-height: 1.35; font-weight: 800; }
.car-time { flex-shrink: 0; color: var(--c-muted); font-size: 21rpx; line-height: 1.5; }
.car-desc { display: block; margin-top: 10rpx; color: var(--c-text-2); font-size: 24rpx; line-height: 1.6; }
.car-meta { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.car-pill { max-width: 100%; padding: 8rpx 12rpx; border-radius: 6rpx; background: rgba(11,60,93,0.08); color: var(--c-primary); font-size: 21rpx; line-height: 1.3; }
.car-footer { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; margin-top: 16rpx; }
.car-status { color: var(--c-muted); font-size: 21rpx; }
.car-actions { display: flex; gap: 10rpx; flex-shrink: 0; }
.action-button { width: 96rpx; height: 54rpx; line-height: 54rpx; margin: 0; padding: 0; border-radius: 6rpx; font-size: 23rpx; font-weight: 800; }
.edit-button { color: #ffffff; background: #0b3c5d; }
.delete-button { color: #ffffff; background: #dc2626; }
</style>
