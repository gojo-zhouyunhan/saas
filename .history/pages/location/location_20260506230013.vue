<template>
  <view class="page">
    <view class="hero">
      <view class="hero-copy">
        <view>
        <text class="section-title">附近推荐</text>
        <text class="section-subtitle">结合当前区域筛选的精选车源</text>
      </view>
      </view>

    </view>

    <view class="location-card">
      <view class="location-card-head">
        <view class="location-badge">
          <view class="pin-icon">
            <view class="pin-drop"></view>
            <view class="pin-hole"></view>
          </view>
        </view>
        <view class="location-copy">
          <text class="location-label">当前位置</text>
          <text class="location-value">{{ displayLocation }}</text>
                <button class="refresh-btn" @click="getLocation">刷新定位</button>
        </view>
      </view>

      <view class="meta-row">
        <view class="meta-pill">
          <text class="meta-dot"></text>
          <text class="meta-pill-text">{{ latitude && longitude ? '定位已同步' : '等待定位' }}</text>
        </view>
        <view class="meta-pill soft">
          <text class="meta-pill-text">周边车源智能推荐</text>
        </view>
      </view>

      <view class="action-row">
        <button class="primary-btn" @click="chooseLocation">
          <view class="btn-icon">
            <view class="map-fold left"></view>
            <view class="map-fold middle"></view>
            <view class="map-fold right"></view>
          </view>
          <text class="btn-text light">地图选点</text>
        </button>
        <button class="secondary-btn" @click="submitLocation">
          <view class="btn-icon">
            <view class="save-frame"></view>
            <view class="save-slot"></view>
            <view class="save-tab"></view>
          </view>
          <text class="btn-text">保存位置</text>
        </button>
      </view>
    </view>

     

    <view class="masonry">
      <view class="masonry-column left-column">
        <view
          class="car-card"
          v-for="(car, index) in leftCars"
          :key="car.id"
          :class="index === 0 ? 'top-offset' : ''"
          @click="viewCarDetail(car)"
        >
          <image class="thumb image-tall" :src="car.image" mode="aspectFill"></image>
          <view class="card-body">
            <view class="tag-row">
              <text class="tag">严选</text>
              <text class="tag soft">同城可看</text>
            </view>
            <text class="name">{{ car.name }}</text>
            <text class="seller">{{ car.seller }}</text>
            <view class="card-foot">
              <text class="price">¥{{ car.price }}万</text>
              <text class="detail-link">查看详情</text>
            </view>
          </view>
        </view>
      </view>

      <view class="masonry-column right-column">
        <view
          class="car-card"
          v-for="car in rightCars"
          :key="car.id"
          @click="viewCarDetail(car)"
        >
          <image class="thumb image-short" :src="car.image" mode="aspectFill"></image>
          <view class="card-body">
            <view class="tag-row">
              <text class="tag">严选</text>
              <text class="tag soft">同城可看</text>
            </view>
            <text class="name">{{ car.name }}</text>
            <text class="seller">{{ car.seller }}</text>
            <view class="card-foot">
              <text class="price">¥{{ car.price }}万</text>
              <text class="detail-link">查看详情</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <BottomNav currentPage="location" />
  </view>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'
import { request } from '../../utils/api'
import { chooseLocationCompat } from '../../utils/platform'

const DEFAULT_LOCATION = {
  province: '中国',
  city: '北京市',
  district: '',
  latitude: null,
  longitude: null
}

const EMPTY_LOCATION_TEXT = '暂无定位信息'
const LOCATION_CACHE_KEY = 'currentLocationCache'
const LOCATION_CACHE_TTL = 30 * 60 * 1000
const DEFAULT_LOCATION_CACHE_TTL = 5 * 60 * 1000

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      carList: [
        {
          id: 1,
          name: '丰田卡罗拉 2020款 双擎精英版',
          price: '12.8',
          seller: '认证车商',
          image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
        },
        {
          id: 2,
          name: '本田思域 2019款 220TURBO 劲动版',
          price: '11.5',
          seller: '个人卖家',
          image: 'https://images.unsplash.com/photo-1605816988066-b0a0ce0a166a?w=400'
        },
        {
          id: 3,
          name: '大众帕萨特 2021款 330TSI 豪华版',
          price: '16.8',
          seller: '城市精品车行',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'
        },
        {
          id: 4,
          name: '宝马 3系 2020款 325Li M运动套装',
          price: '28.5',
          seller: '认证旗舰店',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'
        }
      ],
      province: DEFAULT_LOCATION.province,
      city: DEFAULT_LOCATION.city,
      district: DEFAULT_LOCATION.district,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      userId: 1
    }
  },
  computed: {
    displayLocation() {
      const parts = [this.province, this.city, this.district]
        .filter(Boolean)
        .filter((part, index) => !(index === 0 && part === '中国'))

      return parts.join(' ') || EMPTY_LOCATION_TEXT
    },
    leftCars() {
      return this.carList.filter((_, index) => index % 2 === 0)
    },
    rightCars() {
      return this.carList.filter((_, index) => index % 2 === 1)
    }
  },
  onShow() {
    this.initLocation()
  },
  methods: {
    viewCarDetail(car) {
      uni.showToast({
        title: car.name,
        icon: 'none'
      })
    },
    initLocation() {
      if (this.applyCachedLocation()) {
        return
      }

      this.getLocation()
    },
    getLocation() {
      uni.getLocation({
        type: 'gcj02',
        geocode: true,
        success: (res) => {
          this.latitude = res.latitude
          this.longitude = res.longitude
          this.applyLocatedAddress(res)
          this.cacheLocation()
        },
        fail: () => {
          this.useDefaultLocation()
          this.cacheLocation(DEFAULT_LOCATION_CACHE_TTL)
          uni.showModal({
            title: '定位失败',
            content: '无法自动获取当前位置，请手动选择位置。当前已默认定位到北京市。',
            confirmText: '手动定位',
            cancelText: '稍后再说',
            success: (res) => {
              if (res.confirm) {
                this.chooseLocation()
              }
            }
          })
        }
      })
    },
    applyCachedLocation() {
      const cache = uni.getStorageSync(LOCATION_CACHE_KEY)

      if (!cache || !cache.expiresAt || Date.now() > cache.expiresAt) {
        uni.removeStorageSync(LOCATION_CACHE_KEY)
        return false
      }

      this.province = cache.province || DEFAULT_LOCATION.province
      this.city = cache.city || DEFAULT_LOCATION.city
      this.district = cache.district || ''
      this.latitude = cache.latitude || null
      this.longitude = cache.longitude || null
      return true
    },
    cacheLocation(ttl = LOCATION_CACHE_TTL) {
      uni.setStorageSync(LOCATION_CACHE_KEY, {
        province: this.province,
        city: this.city,
        district: this.district,
        latitude: this.latitude,
        longitude: this.longitude,
        expiresAt: Date.now() + ttl
      })
    },
    firstNonEmpty(...values) {
      for (const value of values) {
        if (Array.isArray(value)) {
          const nestedValue = this.firstNonEmpty(...value)
          if (nestedValue) {
            return nestedValue
          }
          continue
        }

        if (value === null || value === undefined) {
          continue
        }

        const text = String(value).trim()
        if (text) {
          return text
        }
      }

      return ''
    },
    normalizeCityName(city, province) {
      if (city) {
        return city
      }

      const municipalities = ['北京市', '上海市', '天津市', '重庆市']
      if (municipalities.includes(province)) {
        return province
      }

      return ''
    },
    applyLocatedAddress(res) {
      const address = res.address || {}
      const province = this.firstNonEmpty(
        address.province,
        address.provinceName,
        address.region && address.region.province,
        res.province
      )
      const city = this.normalizeCityName(
        this.firstNonEmpty(
          address.city,
          address.cityName,
          address.region && address.region.city,
          res.city
        ),
        province
      )
      const district = this.firstNonEmpty(
        address.district,
        address.districtName,
        address.region && address.region.district,
        address.street,
        address.streetNum && address.streetNum.street,
        res.district
      )
      const fallbackText = this.firstNonEmpty(
        res.addresses,
        address.poiName,
        address.streetNum && address.streetNum.name
      )

      this.province = province || ''
      this.city = city || fallbackText || '当前位置'
      this.district = city && fallbackText === city ? district : district || fallbackText || ''
    },
    useDefaultLocation() {
      this.province = DEFAULT_LOCATION.province
      this.city = DEFAULT_LOCATION.city
      this.district = DEFAULT_LOCATION.district
      this.latitude = DEFAULT_LOCATION.latitude
      this.longitude = DEFAULT_LOCATION.longitude
    },
    chooseLocation() {
      chooseLocationCompat({
        latitude: this.latitude || undefined,
        longitude: this.longitude || undefined,
        success: (res) => {
          const locationName = res.name && res.name !== '当前位置' ? res.name : ''
          const locationAddress = res.address || ''

          this.latitude = res.latitude || this.latitude
          this.longitude = res.longitude || this.longitude
          this.province = ''
          this.city = locationName || this.city || DEFAULT_LOCATION.city
          this.district = locationAddress && locationAddress !== locationName ? locationAddress : ''
          this.cacheLocation()
        },
        fail: () => {
          uni.showToast({
            title: '地图选点暂不可用',
            icon: 'none'
          })
        }
      })
    },
    submitLocation() {
      if (this.displayLocation === EMPTY_LOCATION_TEXT) {
        uni.showToast({
          title: '请先获取定位',
          icon: 'none'
        })
        return
      }

      request({
        url: '/api/user/save-location',
        method: 'POST',
        data: {
          userId: this.userId,
          province: this.province,
          city: this.city,
          district: this.district,
          latitude: this.latitude,
          longitude: this.longitude
        },
        success: () => {
          uni.showToast({
            title: '位置已保存',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: calc(26rpx + var(--status-bar-height)) 24rpx 210rpx;
  background:
    radial-gradient(circle at top left, rgba(230, 240, 246, 0.95) 0, rgba(230, 240, 246, 0) 32%),
    linear-gradient(180deg, #f7fafc 0%, var(--c-bg) 100%);
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  padding: 10rpx 4rpx 0;
}

.hero-copy {
  flex: 1;
}

.hero-eyebrow {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(230, 240, 246, 0.96);
  color: var(--c-primary);
  font-size: 22rpx;
  font-weight: 600;
}

.hero-title {
  display: block;
  margin-top: 18rpx;
  font-size: 42rpx;
  line-height: 1.24;
  font-weight: 700;
  color: var(--c-text);
}

.hero-subtitle {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--c-text-2);
}

.refresh-btn {
  margin: 0;
  padding: 0 22rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.88);
  color: var(--c-primary);
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.06);
}

.refresh-btn::after {
  border: 1rpx solid rgba(11, 60, 93, 0.08);
  border-radius: 20rpx;
}

.location-card {
  margin-top: 26rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18rpx 36rpx rgba(15, 23, 42, 0.06);
}

.location-card-head {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.location-badge {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #eef6fb 0%, #dbe9f3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pin-icon {
  position: relative;
  width: 34rpx;
  height: 38rpx;
}

.pin-drop {
  position: absolute;
  left: 6rpx;
  top: 2rpx;
  width: 22rpx;
  height: 22rpx;
  border: 4rpx solid var(--c-primary);
  border-radius: 22rpx 22rpx 22rpx 4rpx;
  transform: rotate(-45deg);
}

.pin-hole {
  position: absolute;
  left: 14rpx;
  top: 11rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: var(--c-primary);
}

.location-copy {
  flex: 1;
  min-width: 0;
}

.location-label {
  display: block;
  font-size: 22rpx;
  color: var(--c-muted);
}

.location-value {
  display: block;
  margin-top: 10rpx;
  font-size: 32rpx;
  line-height: 1.5;
  color: var(--c-text);
  font-weight: 600;
  word-break: break-word;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 22rpx;
}

.meta-pill {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(230, 240, 246, 0.92);
}

.meta-pill.soft {
  background: rgba(247, 250, 252, 1);
  border: 1rpx solid rgba(11, 60, 93, 0.08);
}

.meta-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #22c55e;
}

.meta-pill-text {
  font-size: 22rpx;
  color: var(--c-primary);
}

.action-row {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  height: 92rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  padding: 0;
}

.primary-btn {
  background: var(--gradient-primary);
  box-shadow: 0 14rpx 24rpx rgba(11, 60, 93, 0.18);
}

.secondary-btn {
  background: linear-gradient(180deg, #eff6fb 0%, #e3eef6 100%);
}

.primary-btn::after,
.secondary-btn::after {
  border: none;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-primary);
}

.btn-text.light {
  color: #ffffff;
}

.btn-icon {
  position: relative;
  width: 30rpx;
  height: 30rpx;
}

.map-fold {
  position: absolute;
  top: 4rpx;
  width: 9rpx;
  height: 22rpx;
  border: 3rpx solid #ffffff;
  border-radius: 3rpx;
}

.map-fold.left {
  left: 0;
  transform: skewY(8deg);
}

.map-fold.middle {
  left: 10rpx;
  transform: skewY(-8deg);
}

.map-fold.right {
  left: 20rpx;
  transform: skewY(8deg);
}

.save-frame {
  position: absolute;
  inset: 2rpx;
  border: 3rpx solid var(--c-primary);
  border-radius: 6rpx;
}

.save-slot {
  position: absolute;
  left: 8rpx;
  top: 6rpx;
  width: 14rpx;
  height: 7rpx;
  border-radius: 2rpx;
  background: var(--c-primary);
}

.save-tab {
  position: absolute;
  left: 9rpx;
  bottom: 6rpx;
  width: 12rpx;
  height: 7rpx;
  border-radius: 2rpx;
  background: rgba(11, 60, 93, 0.16);
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 30rpx;
  margin-bottom: 22rpx;
  padding: 0 6rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-text);
}

.section-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--c-muted);
}

.section-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  color: var(--c-primary);
  font-size: 22rpx;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
}

.masonry {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.masonry-column {
  flex: 1;
}

.top-offset {
  margin-top: 28rpx;
}

.car-card {
  overflow: hidden;
  margin-bottom: 20rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 14rpx 30rpx rgba(15, 23, 42, 0.05);
}

.thumb {
  width: 100%;
  background: #dfe7ef;
}

.image-tall {
  height: 286rpx;
}

.image-short {
  height: 228rpx;
}

.card-body {
  padding: 18rpx 18rpx 20rpx;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(11, 60, 93, 0.1);
  color: var(--c-primary);
  font-size: 20rpx;
  font-weight: 600;
}

.tag.soft {
  background: rgba(230, 240, 246, 0.85);
}

.name {
  display: -webkit-box;
  margin-top: 14rpx;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  min-height: 118rpx;
  font-size: 28rpx;
  line-height: 1.45;
  font-weight: 600;
  color: var(--c-text);
}

.seller {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--c-muted);
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  margin-top: 16rpx;
}

.price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-primary);
}

.detail-link {
  font-size: 22rpx;
  color: var(--c-primary-2);
}
</style>
