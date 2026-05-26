<template>
  <view class="page">
    <view class="hero">
      <view class="hero-copy">
        <view class="recommend-head">
          <text class="section-title">附近推荐</text>
          <text class="section-subtitle">结合当前位置，智能推荐周边优质车源</text>
        </view>
      </view>
    </view>

    <view class="location-card">
      <view class="location-card-head">
        <view class="location-badge">
          <uni-icons type="location-filled" size="22" color="#0b3c5d"></uni-icons>
        </view>
        <view class="location-copy">
          <text class="location-label">当前位置</text>
          <text class="location-value">{{ displayLocation }}</text>
        </view>
        <button class="refresh-btn" @click="getLocation">刷新定位</button>
      </view>

      <view class="meta-row">
        <view class="meta-pill">
          <text class="meta-dot"></text>
          <text class="meta-pill-text">{{ hasLocation ? '定位已同步' : '等待定位' }}</text>
        </view>
        <view class="meta-pill soft">
          <text class="meta-pill-text">周边车源智能推荐</text>
        </view>
      </view>

      <view class="action-row">
        <button class="primary-btn" @click="chooseLocation">
          <text class="btn-text light">地图选点</text>
        </button>
      </view>
    </view>

    <view class="masonry">
      <view class="masonry-column left-column">
        <view
          v-for="(car, index) in leftCars"
          :key="car.id"
          class="car-card"
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
              <text class="price">{{ car.price }}万</text>
              <text class="detail-link">查看详情</text>
            </view>
          </view>
        </view>
      </view>

      <view class="masonry-column right-column">
        <view
          v-for="car in rightCars"
          :key="car.id"
          class="car-card"
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
              <text class="price">{{ car.price }}万</text>
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
import { buildApiUrl, request } from '../../utils/api'
import { openPage } from '../../utils/navigation'
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
const MUNICIPALITIES = ['北京市', '上海市', '天津市', '重庆市']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      carList: [],
      province: DEFAULT_LOCATION.province,
      city: DEFAULT_LOCATION.city,
      district: DEFAULT_LOCATION.district,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      userId: ''
    }
  },
  computed: {
    hasLocation() {
      return this.latitude !== null && this.longitude !== null
    },
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
    this.fetchPublishedCars()
  },
  methods: {
    viewCarDetail(car) {
      openPage(`/pages/car/detail?reportId=${car.reportId}`)
    },
    fetchPublishedCars() {
      request({
        url: '/api/ai/report/published/list?limit=20',
        method: 'GET',
        success: (res) => {
          const payload = res.data || {}
          const list = Array.isArray(payload.data) ? payload.data : []
          this.carList = list.map((item) => this.mapCarCard(item)).filter((item) => item.reportId)
        },
        fail: () => {
          uni.showToast({
            title: '车源加载失败',
            icon: 'none'
          })
        }
      })
    },
    mapCarCard(item) {
      const schema = item.aiReportSchema || {}
      const hero = schema.hero || {}
      const basicInfo = item.basicInfo || (item.structuredReport && item.structuredReport.basicInfo) || {}
      const imageList = this.normalizeImageList(item.imageUrls)
      return {
        id: item.reportId,
        reportId: item.reportId,
        name: item.title || hero.title || basicInfo.vehicleName || '未命名车源',
        price: this.formatPrice(item.sellerPrice),
        seller: item.vehicleVin ? `VIN ${String(item.vehicleVin).slice(-6)}` : 'AI检测记录',
        image: imageList[0] || FALLBACK_IMAGE
      }
    },
    normalizeImageList(images) {
      if (!Array.isArray(images)) {
        return []
      }
      return images.map((image) => {
        if (typeof image !== 'string' || !image) {
          return ''
        }
        if (image.startsWith('http') || image.startsWith('blob:') || image.startsWith('data:')) {
          return image
        }
        return buildApiUrl(image)
      }).filter(Boolean)
    },
    formatPrice(value) {
      if (value === undefined || value === null || value === '') {
        return '--'
      }
      return String(value)
    },
    initLocation() {
      this.userId = this.getCurrentUserId()
      this.applyCachedLocation()
      this.getLocation({
        silent: true,
        syncToServer: true
      })
    },
    getCurrentUserId() {
      const storedUser = uni.getStorageSync('user')
      if (!storedUser) {
        return ''
      }

      try {
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser
        const user = parsedUser.user || parsedUser.userInfo || parsedUser || {}
        return user.userId || user.id || user.uid || user.number || user.userNo || ''
      } catch (error) {
        return ''
      }
    },
    getLocation(options = {}) {
      const { silent = false, syncToServer = false } = options
      uni.getLocation({
        type: 'gcj02',
        geocode: true,
        success: (res) => {
          this.latitude = res.latitude
          this.longitude = res.longitude
          this.applyLocatedAddress(res)
          this.cacheLocation()
          if (syncToServer) {
            this.submitLocation({ silentSuccess: silent })
          }
        },
        fail: () => {
          this.useDefaultLocation()
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

      if (MUNICIPALITIES.includes(province)) {
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
          this.submitLocation()
        },
        fail: () => {
          uni.showToast({
            title: '地图选点暂不可用',
            icon: 'none'
          })
        }
      })
    },
    submitLocation(options = {}) {
      const { silentSuccess = false } = options
      if (!this.userId) {
        this.userId = this.getCurrentUserId()
      }

      if (!this.userId) {
        uni.showToast({
          title: '璇峰厛鐧诲綍',
          icon: 'none'
        })
        return
      }

      if (this.displayLocation === EMPTY_LOCATION_TEXT) {
        uni.showToast({
          title: '璇峰厛鑾峰彇瀹氫綅',
          icon: 'none'
        })
        return
      }

      request({
        url: '/api/user/nearby-address',
        method: 'POST',
        data: {
          userId: this.userId,
          nearbyAddress: this.displayLocation
        },
        success: () => {
          if (!silentSuccess) {
            uni.showToast({
              title: '位置已保存',
              icon: 'success'
            })
          }
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
  padding: 0 24rpx 210rpx;
  background:
    radial-gradient(circle at top left, rgba(230, 240, 246, 0.95) 0, rgba(230, 240, 246, 0) 32%),
    linear-gradient(180deg, #f7fafc 0%, var(--c-bg) 100%);
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin: 0 -24rpx;
  padding: var(--nav-pt) var(--nav-px) var(--nav-pb);
  background: var(--c-nav);
}

.hero-copy {
  flex: 1;
}

.recommend-head {
  width: 100%;
  background: transparent;
}

.recommend-head .section-title {
  color: #ffffff;
}

.recommend-head .section-subtitle {
  color: rgba(255, 255, 255, 0.72);
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
  flex-shrink: 0;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #eef6fb 0%, #dbe9f3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
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

.refresh-btn {
  margin: 0;
  padding: 0 22rpx;
  height: 72rpx;
  line-height: 72rpx;
  flex-shrink: 0;
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

.primary-btn {
  flex: 1;
  height: 92rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.primary-btn {
  background: var(--gradient-primary);
  box-shadow: 0 14rpx 24rpx rgba(11, 60, 93, 0.18);
}

.primary-btn::after {
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
