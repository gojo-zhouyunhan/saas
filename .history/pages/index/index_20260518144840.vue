<template>
  <view class="container">
    <view class="hero-shell">
      <view class="hero-top">
        <view>
          <text class="hero-title">智车云精选车源</text>
          <text class="hero-subtitle">轻松找车，信息清楚，浏览体验更舒服一点。</text>
        </view>
   
      </view>

      <view class="search-panel">
        <view class="search-box">
          <uni-icons type="search" size="18" color="rgba(255,255,255,0.78)"></uni-icons>
          <text class="search-placeholder">搜索品牌、车型或你关心的关键词</text>
        </view>
        <text class="hero-action">筛选</text>
      </view>

     
    </view>

    <view class="content-section">
      <view class="section-head">
        <view>
          <text class="section-title">推荐车源</text>
          <text class="section-subtitle">为你优先挑出信息更完整、视觉更舒适的热门车型</text>
        </view>
        <text class="section-link" @click="loadMoreCars">查看更多</text>
      </view>

      <view class="masonry">
        <view class="masonry-column">
          <view
            class="car-card glass-card"
            v-for="(car, index) in leftCars"
            :key="car.id"
            :class="index === 0 ? 'top-offset' : ''"
            @click="viewCarDetail(car)"
          >
            <image class="car-image image-tall" :src="car.image" mode="aspectFill"></image>
            <view class="car-info">
              <view class="car-tags">
                <text class="car-tag">包过户</text>
                <text class="car-tag soft">可分期</text>
              </view>
              <text class="car-name">{{ car.name }}</text>
              <view class="car-meta">
                <text class="car-seller">{{ car.seller }}</text>
                <text class="car-link">查看详情</text>
              </view>
              <text class="car-price">{{ car.price }}万</text>
            </view>
          </view>
        </view>

        <view class="masonry-column">
          <view
            class="car-card glass-card"
            v-for="car in rightCars"
            :key="car.id"
            @click="viewCarDetail(car)"
          >
            <image class="car-image image-short" :src="car.image" mode="aspectFill"></image>
            <view class="car-info">
              <view class="car-tags">
                <text class="car-tag">严选</text>
                <text class="car-tag soft">支持议价</text>
              </view>
              <text class="car-name">{{ car.name }}</text>
              <view class="car-meta">
                <text class="car-seller">{{ car.seller }}</text>
                <text class="car-link">查看详情</text>
              </view>
              <text class="car-price">{{ car.price }}万</text>
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
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
}

.hero-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.78);
}

.hero-badge {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
  backdrop-filter: blur(12rpx);
}

.search-panel {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 26rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 22rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.08);
}

.search-placeholder {
  font-size: 25rpx;
  color: rgba(255, 255, 255, 0.78);
}

.hero-action {
  padding: 18rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
}

.hero-stats {
  display: flex;
  gap: 16rpx;
  margin-top: 26rpx;
}

.stat-pill {
  flex: 1;
  padding: 20rpx 18rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.12);
}

.stat-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.72);
}

.content-section {
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
  font-size: 34rpx;
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
  font-weight: 600;
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
  margin-top: 30rpx;
}

.car-card {
  overflow: hidden;
  margin-bottom: 20rpx;
  border-radius: 28rpx;
}

.car-image {
  width: 100%;
}

.image-tall {
  height: 300rpx;
}

.image-short {
  height: 236rpx;
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
  background: rgba(15, 118, 110, 0.12);
  color: var(--c-primary);
  font-size: 20rpx;
  font-weight: 600;
}

.car-tag.soft {
  background: rgba(37, 99, 235, 0.08);
  color: var(--c-primary-2);
}

.car-name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  min-height: 118rpx;
  font-size: 28rpx;
  line-height: 1.44;
  font-weight: 600;
  color: var(--c-text);
}

.car-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  margin-top: 18rpx;
}

.car-seller,
.car-link {
  font-size: 22rpx;
}

.car-seller {
  color: var(--c-muted);
}

.car-link {
  color: var(--c-primary-2);
}

.car-price {
  display: block;
  margin-top: 14rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--c-primary);
}
</style>
