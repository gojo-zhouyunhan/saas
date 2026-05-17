<template>
  <view class="container">
    <view class="header">
      <view class="header-top">
        <view class="search-box">
          <text class="search-placeholder">搜索车辆品牌、车型、关键词</text>
        </view>
        <text class="header-action">搜索</text>
      </view>
    </view>

    <view class="cars-section">
      <view class="section-head">
        <view>
          <text class="section-title">推荐车源</text>
          <text class="section-subtitle">为你挑选更值得看的热门车型</text>
        </view>
        <text class="section-link" @click="loadMoreCars">查看更多</text>
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
            <image class="car-image image-tall" :src="car.image" mode="aspectFill"></image>
            <view class="car-info">
              <view class="car-tags">
                <text class="car-tag">包过户</text>
                <text class="car-tag">可分期</text>
              </view>
              <text class="car-name">{{ car.name }}</text>
              <view class="car-price-row">
                <text class="car-price">¥{{ car.price }}万</text>
                <text class="car-deal">支持议价</text>
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
                <text class="car-tag">包过户</text>
                <text class="car-tag">可分期</text>
              </view>
              <text class="car-name">{{ car.name }}</text>
              <view class="car-price-row">
                <text class="car-price">¥{{ car.price }}万</text>
                <text class="car-deal">支持议价</text>
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
          seller: '小牛严选',
          image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
        },
        {
          id: 2,
          name: '本田思域 2019款 220TURBO 劲动版',
          price: '11.5',
          seller: '个人一手车',
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
      ]
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
    }
  },
  methods: {
    viewCarDetail(car) {
      uni.showToast({
        title: car.name,
        icon: 'none'
      })
    },
    loadMoreCars() {
      uni.showToast({
        title: '更多车源整理中',
        icon: 'none'
      })
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
