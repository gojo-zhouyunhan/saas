<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <!-- 同城定位 -->
          <view class="location-box">
            <view @click="openCityPicker" class="location-info">
              当前位置：{{ cityName }} {{ districtName }}
              <text class="location-edit">(点击修改)</text>
            </view>
          </view>
        </view>
        <view class="nav-center">
          <view class="search-box">
            <view class="search-icon-wrapper">
              <text class="search-icon">🔍</text>
            </view>
            <text class="search-placeholder">{{ cityName }}二手车</text>
          </view>
        </view>
        <view class="nav-right">
          <text class="search-btn" @click="getLocation">定位</text>
        </view>
      </view>
      <view class="nav-tabs">
        <text class="nav-tab">关注</text>
        <text class="nav-tab active">推荐</text>
        <text class="nav-tab">新发</text>
        <text class="nav-tab special">省钱神券</text>
        <text class="nav-tab">找服务</text>
        <view class="nav-tab dropdown">
          <text>热点</text>
          <text class="dropdown-arrow">▼</text>
        </view>
      </view>
    </view>

    <!-- 城市选择 -->
    <view class="city-selector">
      <view class="city-item active">
        <text class="city-name">北京</text>
      </view>
      <view class="city-item">
        <text class="city-name">上海</text>
      </view>
      <view class="city-item">
        <text class="city-name">广州</text>
      </view>
      <view class="city-item">
        <text class="city-name">深圳</text>
      </view>
      <view class="city-item">
        <text class="city-name">更多</text>
      </view>
    </view>

    <!-- 快捷入口区 -->
    <view class="quick-entry">
      <view class="entry-item">
        <view class="entry-icon red">
          <view class="icon-wrapper">
            <text class="icon">🧧</text>
          </view>
        </view>
        <text class="entry-text">领红包</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon green">
          <view class="icon-wrapper">
            <text class="icon">💼</text>
          </view>
        </view>
        <text class="entry-text">神奇创业</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon blue">
          <view class="icon-wrapper">
            <text class="icon">📱</text>
          </view>
          <view class="new-badge">新装备</view>
        </view>
        <text class="entry-text">手机数码</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon yellow">
          <view class="icon-wrapper">
            <text class="icon">♻️</text>
          </view>
        </view>
        <text class="entry-text">闲鱼回收</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon purple">
          <view class="icon-wrapper">
            <text class="icon">🔍</text>
          </view>
        </view>
        <text class="entry-text">闲鱼鉴别</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon orange">
          <view class="icon-wrapper">
            <text class="icon">💰</text>
          </view>
        </view>
        <text class="entry-text">鱼币</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon gray">
          <view class="icon-wrapper">
            <text class="icon">🎁</text>
          </view>
        </view>
        <text class="entry-text">抽奖</text>
      </view>
    </view>

    <!-- 车辆列表 -->
    <view class="cars-section">
      <view class="cars-grid">
        <view class="car-card" v-for="(car, index) in carList" :key="index" @click="viewCarDetail(car)">
          <image class="car-image" :src="car.image" mode="aspectFill"></image>
          <view class="car-info">
            <view class="car-tags">
              <text class="car-tag">北京本地</text>
              <text class="car-tag">低价出</text>
            </view>
            <text class="car-name">{{car.name}}</text>
            <view class="car-price-row">
              <text class="car-price">¥{{car.price}}万</text>
              <text class="car-deal">2人小刀价</text>
            </view>
            <view class="car-seller">
              <text class="seller-name">{{car.seller}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <BottomNav currentPage="location" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue';

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      carList: [
        {
          id: 1,
          name: '丰田卡罗拉 2020款 自动豪华版',
          price: '12.8',
          seller: '北京二手车商',
          image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
        },
        {
          id: 2,
          name: '本田思域 2019款 1.5T劲动版',
          price: '11.5',
          seller: '北京本地车主',
          image: 'https://images.unsplash.com/photo-1605816988066-b0a0ce0a166a?w=400'
        },
        {
          id: 3,
          name: '大众帕萨特 2021款 330TSI精英版',
          price: '16.8',
          seller: '北京4S店认证',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'
        },
        {
          id: 4,
          name: '宝马3系 2020款 325Li M运动套装',
          price: '28.5',
          seller: '北京宝马认证',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'
        }
      ],
      // 定位相关数据
      provinceName: "",
      cityName: "北京",
      districtName: "朝阳区"
    }
  },
  onLoad() {
    this.getLocation(); // 进入页面自动定位
  },
  methods: {
    viewCarDetail(car) {
      console.log('查看车辆详情:', car);
      uni.showToast({
        title: '查看详情: ' + car.name,
        icon: 'none'
      });
    }
  }
}
</script>

<style scoped>
  /* 基础样式 */
  .container {
    background-color: #F8FAFC;
    min-height: 100vh;
  }

  /* 导航栏 */
  .nav-bar {
    background-color: #FFFFFF;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  }

  .nav-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 30rpx;
  }

  .nav-center {
    flex: 1;
    margin: 0 20rpx;
  }

  .search-box {
    background-color: #F1F5F9;
    border-radius: 24rpx;
    padding: 12rpx 20rpx;
    display: flex;
    align-items: center;
  }

  .search-icon-wrapper {
    width: 24rpx;
    height: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12rpx;
  }

  .search-icon {
    font-size: 24rpx;
    color: #64748B;
  }

  .search-placeholder {
    font-size: 26rpx;
    color: #94A3B8;
  }

  .search-btn {
    font-size: 32rpx;
    color: #1E293B;
  }

  .nav-tabs {
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    overflow-x: auto;
    white-space: nowrap;
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  }

  .nav-tab {
    font-size: 28rpx;
    color: #1E293B;
    padding: 20rpx 16rpx;
    margin-right: 16rpx;
    position: relative;
  }

  .nav-tab.active {
    color: #2563EB;
    font-weight: bold;
  }

  .nav-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16rpx;
    right: 16rpx;
    height: 4rpx;
    background-color: #2563EB;
    border-radius: 2rpx;
  }

  .nav-tab.special {
    color: #FF6B6B;
    font-weight: bold;
  }

  .dropdown {
    display: flex;
    align-items: center;
  }

  .dropdown-arrow {
    font-size: 20rpx;
    margin-left: 4rpx;
    color: #64748B;
  }

  /* 城市选择 */
  .city-selector {
    display: flex;
    padding: 20rpx 30rpx;
    background-color: #FFFFFF;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  }

  .city-item {
    padding: 8rpx 16rpx;
    margin-right: 20rpx;
    border-radius: 20rpx;
    background-color: #F1F5F9;
  }

  .city-item.active {
    background-color: #2563EB;
  }

  .city-item.active .city-name {
    color: #FFFFFF;
  }

  .city-name {
    font-size: 24rpx;
    color: #1E293B;
  }

  /* 快捷入口区 */
  .quick-entry {
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 30rpx;
    background-color: #FFFFFF;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  }

  .entry-item {
    flex: 1;
    min-width: 120rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .entry-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
    position: relative;
  }

  .icon-wrapper {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    font-size: 40rpx;
  }

  .entry-icon.red {
    background-color: #FFF5F5;
  }

  .entry-icon.green {
    background-color: #F0FDF4;
  }

  .entry-icon.blue {
    background-color: #EFF6FF;
  }

  .entry-icon.yellow {
    background-color: #FEF3C7;
  }

  .entry-icon.purple {
    background-color: #F3E8FF;
  }

  .entry-icon.orange {
    background-color: #FFF7ED;
  }

  .entry-icon.gray {
    background-color: #F3F4F6;
  }

  .new-badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    background-color: #FF6B6B;
    color: #FFFFFF;
    font-size: 16rpx;
    padding: 4rpx 8rpx;
    border-radius: 12rpx;
    font-weight: bold;
  }

  .entry-text {
    font-size: 24rpx;
    color: #1E293B;
  }

  /* 车辆列表 */
  .cars-section {
    padding: 20rpx 30rpx;
    background-color: #F8FAFC;
  }

  .cars-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }

  .car-card {
    background-color: #FFFFFF;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }

  .car-card:active {
    transform: scale(0.98);
  }

  .car-image {
    width: 100%;
    height: 300rpx;
  }

  .car-info {
    padding: 20rpx;
  }

  .car-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-bottom: 12rpx;
  }

  .car-tag {
    font-size: 20rpx;
    color: #FF6B6B;
    background-color: #FFF5F5;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
  }

  .car-name {
    font-size: 26rpx;
    font-weight: bold;
    color: #1E293B;
    display: block;
    margin-bottom: 12rpx;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .car-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
  }

  .car-price {
    font-size: 32rpx;
    font-weight: bold;
    color: #FF6B6B;
  }

  .car-deal {
    font-size: 20rpx;
    color: #94A3B8;
  }

  .car-seller {
    display: flex;
    align-items: center;
  }

  .seller-name {
    font-size: 22rpx;
    color: #94A3B8;
  }

  /* 响应式适配 */
  @media screen and (min-width: 768px) {
    .cars-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media screen and (min-width: 1024px) {
    .cars-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>