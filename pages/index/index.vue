<template>
  <view class="container">
    <view class="header">
      <view class="header-top">
        <view class="search-box">
          <text class="search-placeholder">搜索品牌、车型或关键词</text>
        </view>
        <text class="header-action" @click="fetchPublishedCars">搜索</text>
      </view>
    </view>

    <view class="cars-section">
      <view class="section-head">
        <view>
          <text class="section-title">推荐车源</text>
          <text class="section-subtitle">基于已发布 AI 检测记录，为你展示最新车源</text>
        </view>
        <text class="section-link" @click="loadMoreCars">查看更多</text>
      </view>

      <view v-if="!carList.length" class="empty-state">
        <text class="empty-text">暂无已发布车源</text>
      </view>

      <view v-else class="masonry">
        <view class="masonry-column left-column">
          <view
            class="car-card"
            v-for="(car, index) in leftCars"
            :key="car.id"
            :class="index === 0 ? 'top-offset' : ''"
            @click="viewCarDetail(car)"
          >
            <image class="car-image image-tall" :src="car.image" mode="aspectFill"></image>
            <view class="car-info">
              <view class="car-tags">
                <text class="car-tag">AI车况</text>
                <text class="car-tag">{{ car.tradeTypeText }}</text>
              </view>
              <text class="car-name">{{ car.name }}</text>
              <view class="car-price-row">
                <text class="car-price">¥{{ car.price }}万</text>
                <text class="car-deal">查看详情</text>
              </view>
              <text class="seller-name">{{ car.seller }}</text>
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
            <image class="car-image image-short" :src="car.image" mode="aspectFill"></image>
            <view class="car-info">
              <view class="car-tags">
                <text class="car-tag">AI车况</text>
                <text class="car-tag">{{ car.tradeTypeText }}</text>
              </view>
              <text class="car-name">{{ car.name }}</text>
              <view class="car-price-row">
                <text class="car-price">¥{{ car.price }}万</text>
                <text class="car-deal">查看详情</text>
              </view>
              <text class="seller-name">{{ car.seller }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <BottomNav currentPage="index" />
  </view>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'
import { buildApiUrl, request } from '../../utils/api'
import { openPage } from '../../utils/navigation'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      carList: []
    }
  },
  computed: {
    leftCars() {
      return this.carList.filter((_, index) => index % 2 === 0)
    },
    rightCars() {
      return this.carList.filter((_, index) => index % 2 === 1)
    }
  },
  onLoad() {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    this.fetchPublishedCars()
  },
  onShow() {
    if (uni.getStorageSync('token')) {
      this.fetchPublishedCars()
    }
  },
  methods: {
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
          this.showToast('车源加载失败')
        }
      })
    },
    mapCarCard(item) {
      const schema = item.aiReportSchema || {}
      const hero = schema.hero || {}
      const basicInfo = item.basicInfo || (item.structuredReport && item.structuredReport.basicInfo) || {}
      const imageList = this.normalizeImageList(item.imageUrls)
      const tradeTypeText = this.formatTradeType(item.tradeType)
      return {
        id: item.reportId,
        reportId: item.reportId,
        name: item.title || hero.title || basicInfo.vehicleName || '未命名车源',
        price: this.formatPrice(item.sellerPrice),
        seller: item.vehicleVin ? `VIN ${String(item.vehicleVin).slice(-6)}` : 'AI检测记录',
        tradeTypeText,
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
    formatTradeType(tradeType) {
      if (tradeType === 'offline') {
        return '线下看车'
      }
      if (tradeType === 'online') {
        return '在线议价'
      }
      return '车况详情'
    },
    viewCarDetail(car) {
      openPage(`/pages/car/detail?reportId=${car.reportId}`)
    },
    loadMoreCars() {
      this.fetchPublishedCars()
    },
    showToast(title) {
      uni.showToast({ title, icon: 'none' })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding-bottom: 210rpx;
  background: var(--c-bg);
}

.header {
  padding: var(--nav-pt) var(--nav-px) var(--nav-pb);
  background: var(--c-nav);
}

.header-top {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-box {
  flex: 1;
  padding: 18rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
}

.search-placeholder {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.76);
}

.header-action {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 600;
}

.cars-section {
  margin: 26rpx 24rpx 20rpx;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 24rpx;
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

.section-link {
  font-size: 24rpx;
  color: var(--c-primary);
}

.empty-state {
  padding: 48rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: var(--c-muted);
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
  border-radius: 24rpx;
  background: var(--c-surface);
  box-shadow: var(--shadow-sm);
}

.car-image {
  width: 100%;
}

.image-tall {
  height: 286rpx;
}

.image-short {
  height: 228rpx;
}

.car-info {
  padding: 22rpx 20rpx 20rpx;
}

.car-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 14rpx;
}

.car-tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: var(--c-primary-soft);
  color: var(--c-primary);
  font-size: 20rpx;
}

.car-name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  min-height: 118rpx;
  font-size: 28rpx;
  line-height: 1.42;
  font-weight: 600;
  color: var(--c-text);
}

.car-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10rpx;
  margin-top: 16rpx;
}

.car-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-primary);
}

.car-deal,
.seller-name {
  font-size: 22rpx;
  color: var(--c-muted);
}

.seller-name {
  display: block;
  margin-top: 12rpx;
}
</style>
