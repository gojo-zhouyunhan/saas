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
        <view class="car-top">
          <view class="car-left">
            <text class="car-title">{{ car.title || label('unnamedDraft') }}</text>
            <view class="car-meta">
              <text class="car-pill">{{ car.vehicleVin || label('noVin') }}</text>
              <text class="car-pill">{{ formatTime(car.updatedAt) }}</text>
            </view>
          </view>
          <view class="car-right">
            <image v-if="coverImage(car)" class="car-cover" :src="coverImage(car)" mode="aspectFill"></image>
            <view v-else class="car-cover car-cover-placeholder">
              <text class="placeholder-text">{{ label('noImage') || 'No Image' }}</text>
            </view>
          </view>
        </view>
        <view class="car-actions">
          <button class="action-button edit-button" @click.stop="editCar(car)">{{ label('edit') }}</button>
          <button class="action-button delete-button" @click.stop="confirmDelete(car)">{{ label('delete') }}</button>
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
.car-card { margin-bottom: 20rpx; padding: 22rpx; border-radius: var(--radius-lg); background: rgba(255,255,255,0.96); box-shadow: var(--shadow-md); border: 1rpx solid rgba(15,23,42,0.06); }
.car-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.car-left { flex: 1; min-width: 0; padding-top: 4rpx; }
.car-right { flex-shrink: 0; }
.car-cover { width: 168rpx; height: 168rpx; border-radius: 16rpx; background: rgba(148,163,184,0.16); overflow: hidden; }
.car-cover-placeholder { display: flex; align-items: center; justify-content: center; background: rgba(11,60,93,0.08); }
.placeholder-text { color: var(--c-primary); font-size: 22rpx; font-weight: 600; opacity: 0.78; }
.car-title { display: block; color: var(--c-text); font-size: 32rpx; line-height: 1.3; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.car-meta { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.car-pill { max-width: 100%; padding: 8rpx 12rpx; border-radius: 999rpx; background: rgba(11,60,93,0.08); color: var(--c-primary); font-size: 21rpx; line-height: 1.3; }
.car-actions { display: flex; gap: 12rpx; margin-top: 18rpx; }
.action-button { flex: 1; height: 60rpx; line-height: 60rpx; margin: 0; padding: 0; border-radius: 12rpx; font-size: 24rpx; font-weight: 800; }
.edit-button { color: #ffffff; background: var(--c-primary); }
.delete-button { color: #ffffff; background: var(--c-danger); }
</style>
