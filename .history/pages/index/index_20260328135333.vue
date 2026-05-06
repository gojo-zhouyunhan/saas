<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <view class="sign-btn">
            <text class="sign-icon">🎁</text>
            <text class="sign-text">签到</text>
          </view>
        </view>
        <view class="nav-center">
          <view class="search-box">
            <text class="search-icon">🔍</text>
            <text class="search-placeholder">opencar</text>
          </view>
        </view>
        <view class="nav-right">
          <text class="search-btn">🔍</text>
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

    <!-- 快捷入口区 -->
    <view class="quick-entry">
      <view class="entry-item">
        <view class="entry-icon red">
          <text>🧧</text>
        </view>
        <text class="entry-text">领红包</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon green">
          <text>💼</text>
        </view>
        <text class="entry-text">神奇创业</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon blue">
          <text>📱</text>
          <view class="new-badge">新装备</view>
        </view>
        <text class="entry-text">手机数码</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon yellow">
          <text>♻️</text>
        </view>
        <text class="entry-text">闲鱼回收</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon purple">
          <text>🔍</text>
        </view>
        <text class="entry-text">闲鱼鉴别</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon orange">
          <text>💰</text>
        </view>
        <text class="entry-text">鱼币</text>
      </view>
      <view class="entry-item">
        <view class="entry-icon gray">
          <text>🎁</text>
        </view>
        <text class="entry-text">抽奖</text>
      </view>
    </view>

    <!-- 后端接口提示 -->
    <view class="api-tip">
      <text class="api-tip-icon">⚠️</text>
      <view class="api-tip-content">
        <text class="api-tip-title">后端接口提示</text>
        <text class="api-tip-text">以下功能需要后端接口支持：
1. 签到功能 - 签到获取积分/奖励
2. 搜索功能 - 按关键词搜索车辆
3. 车辆列表 - 获取车辆数据
4. 消息通知 - 获取未读消息数
5. 用户登录/注册 - 个人中心功能</text>
      </view>
    </view>

    <!-- 车辆列表 -->
    <view class="cars-section" id="cars">
      <!-- 车辆卡片列表 -->
      <view class="cars-grid">
        <view class="car-card" v-for="(car, index) in carList" :key="index" @click="viewCarDetail(car)">
          <image class="car-image" :src="car.image" mode="aspectFill"></image>
          <view class="car-info">
            <view class="car-tags">
              <text class="car-tag">包邮</text>
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
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">🐟</text>
        <text class="nav-text">闲鱼</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">📍</text>
        <text class="nav-text">北京</text>
      </view>
      <view class="nav-item sell">
        <text class="nav-icon sell-icon">+</text>
        <text class="nav-text">卖闲置</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">💬</text>
        <text class="nav-text">消息</text>
        <view class="badge">99+</view>
      </view>
      <view class="nav-item">
        <text class="nav-icon">👤</text>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        title: '二手车交易平台',
        brands: ['全部品牌', '丰田', '本田', '大众', '宝马', '奔驰', '奥迪'],
        brandIndex: 0,
        prices: ['全部价格', '5万以下', '5-10万', '10-20万', '20万以上'],
        priceIndex: 0,
        ages: ['全部车龄', '1年以内', '1-3年', '3-5年', '5年以上'],
        ageIndex: 0,
        carList: [
          {
            id: 1,
            name: '丰田卡罗拉 2020款 自动豪华版',
            price: '12.8',
            seller: '小牛牛牛',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
          },
          {
            id: 2,
            name: '本田思域 2019款 1.5T劲动版',
            price: '11.5',
            seller: '异系猫小铺',
            image: 'https://images.unsplash.com/photo-1605816988066-b0a0ce0a166a?w=400'
          },
          {
            id: 3,
            name: '大众帕萨特 2021款 330TSI精英版',
            price: '16.8',
            seller: '车来车往',
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'
          },
          {
            id: 4,
            name: '宝马3系 2020款 325Li M运动套装',
            price: '28.5',
            seller: '宝马官方认证',
            image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'
          }
        ]
      }
    },
    onLoad() {

    },
    methods: {
      goToPage(page) {
        console.log('跳转到页面:', page);
        // uni.navigateTo({ url: '/pages/' + page + '/' + page });
      },
      browseCars() {
        console.log('浏览车辆');
      },
      learnMore() {
        console.log('了解更多');
      },
      onBrandChange(e) {
        this.brandIndex = e.detail.value;
      },
      onPriceChange(e) {
        this.priceIndex = e.detail.value;
      },
      onAgeChange(e) {
        this.ageIndex = e.detail.value;
      },
      searchCars() {
        console.log('搜索车辆:', this.brands[this.brandIndex], this.prices[this.priceIndex], this.ages[this.ageIndex]);
        uni.showToast({
          title: '搜索中...',
          icon: 'loading'
        });
      },
      viewCarDetail(car) {
        console.log('查看车辆详情:', car);
        uni.showToast({
          title: '查看详情: ' + car.name,
          icon: 'none'
        });
      },
      loadMoreCars() {
        console.log('加载更多车辆');
        uni.showToast({
          title: '加载更多...',
          icon: 'loading'
        });
      },
      contactUs() {
        console.log('联系我们');
        uni.makePhoneCall({
          phoneNumber: '4001234567'
        });
      }
    }
  }
</script>

<style>
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

  .sign-btn {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
  }

  .sign-icon {
    font-size: 24rpx;
    margin-right: 8rpx;
  }

  .sign-text {
    font-size: 24rpx;
    font-weight: bold;
    color: #FFFFFF;
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

  .search-icon {
    font-size: 24rpx;
    color: #64748B;
    margin-right: 12rpx;
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

  .entry-icon text {
    font-size: 40rpx;
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

  /* 英雄区域 */
  .hero-section {
    background: linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%);
    padding: 60rpx 30rpx;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
  }

  .hero-left {
    margin-bottom: 40rpx;
  }

  .hero-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #2563EB;
    display: block;
    margin-bottom: 20rpx;
    line-height: 1.3;
  }

  .hero-subtitle {
    font-size: 28rpx;
    color: #1E293B;
    display: block;
    margin-bottom: 40rpx;
    line-height: 1.5;
  }

  .hero-buttons {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .btn-primary {
    background-color: #2563EB;
    color: #FFFFFF;
    font-size: 28rpx;
    padding: 24rpx 48rpx;
    border-radius: 12rpx;
    border: none;
    line-height: 1;
  }

  .btn-primary:active {
    background-color: #3B82F6;
  }

  .btn-outline {
    background-color: transparent;
    color: #2563EB;
    font-size: 28rpx;
    padding: 24rpx 48rpx;
    border-radius: 12rpx;
    border: 2rpx solid #2563EB;
    line-height: 1;
  }

  .btn-outline:active {
    background-color: #2563EB;
    color: #FFFFFF;
  }

  .hero-right {
    width: 100%;
  }

  .hero-image {
    width: 100%;
    height: 400rpx;
    border-radius: 20rpx;
    box-shadow: 0 20rpx 60rpx rgba(37, 99, 235, 0.15);
  }

  /* 特色服务 */
  .features-section {
    padding: 80rpx 30rpx;
    background-color: #FFFFFF;
  }

  .section-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #2563EB;
    text-align: center;
    display: block;
    margin-bottom: 60rpx;
  }

  .features-grid {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }

  .feature-card {
    background-color: #FFFFFF;
    border-radius: 20rpx;
    padding: 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .feature-icon {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24rpx;
  }

  .iconfont {
    font-size: 48rpx;
    color: #FFFFFF;
  }

  .feature-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
    display: block;
    margin-bottom: 16rpx;
  }

  .feature-desc {
    font-size: 26rpx;
    color: #64748B;
    display: block;
    line-height: 1.5;
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

  /* 底部导航栏 */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #FFFFFF;
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 16rpx 0;
    z-index: 99;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .nav-item.active .nav-text {
    color: #2563EB;
    font-weight: bold;
  }

  .nav-icon {
    font-size: 40rpx;
    margin-bottom: 4rpx;
  }

  .nav-text {
    font-size: 20rpx;
    color: #64748B;
  }

  .nav-item.sell {
    position: relative;
    top: -20rpx;
  }

  .sell-icon {
    width: 72rpx;
    height: 72rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #FFFFFF;
    font-weight: bold;
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.4);
  }

  .badge {
    position: absolute;
    top: -8rpx;
    right: -16rpx;
    background-color: #FF6B6B;
    color: #FFFFFF;
    font-size: 16rpx;
    padding: 2rpx 8rpx;
    border-radius: 12rpx;
    font-weight: bold;
  }

  /* 后端接口提示 */
  .api-tip {
    background-color: #FFF3CD;
    border: 2rpx solid #FFEAA7;
    border-radius: 12rpx;
    padding: 20rpx;
    margin: 20rpx 30rpx;
    display: flex;
    align-items: center;
  }

  .api-tip-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
    color: #856404;
  }

  .api-tip-content {
    flex: 1;
  }

  .api-tip-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #856404;
    margin-bottom: 8rpx;
  }

  .api-tip-text {
    font-size: 24rpx;
    color: #856404;
    line-height: 1.4;
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