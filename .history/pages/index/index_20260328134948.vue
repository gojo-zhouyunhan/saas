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

    <!-- 英雄区域 -->
    <view class="hero-section">
      <view class="hero-content">
        <view class="hero-left">
          <text class="hero-title">专业二手车交易平台</text>
          <text class="hero-subtitle">提供优质的二手车买卖服务，让您的交易更加安全、便捷</text>
          <view class="hero-buttons">
            <button class="btn-primary" @click="browseCars">立即浏览</button>
            <button class="btn-outline" @click="learnMore">了解更多</button>
          </view>
        </view>
        <view class="hero-right">
          <image class="hero-image" src="https://images.unsplash.com/photo-1562141989-c5c79ac8f576?w=800" mode="aspectFill"></image>
        </view>
      </view>
    </view>

    <!-- 特色服务 -->
    <view class="features-section" id="features">
      <text class="section-title">我们的特色服务</text>
      <view class="features-grid">
        <view class="feature-card">
          <view class="feature-icon">
            <text class="iconfont icon-car">&#xe6a2;</text>
          </view>
          <text class="feature-title">优质车源</text>
          <text class="feature-desc">严格筛选每一辆车，确保车况真实可靠</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon">
            <text class="iconfont icon-shield">&#xe6a3;</text>
          </view>
          <text class="feature-title">安全保障</text>
          <text class="feature-desc">专业检测认证，提供详细车况报告</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon">
            <text class="iconfont icon-service">&#xe6a4;</text>
          </view>
          <text class="feature-title">便捷服务</text>
          <text class="feature-desc">一站式服务，从选车到过户，全程无忧</text>
        </view>
      </view>
    </view>

    <!-- 车辆列表 -->
    <view class="cars-section" id="cars">
      <text class="section-title">热门车辆</text>
      
      <!-- 搜索筛选 -->
      <view class="search-filter">
        <view class="filter-item">
          <picker mode="selector" :range="brands" :value="brandIndex" @change="onBrandChange">
            <view class="picker-view">
              <text>{{brands[brandIndex]}}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <picker mode="selector" :range="prices" :value="priceIndex" @change="onPriceChange">
            <view class="picker-view">
              <text>{{prices[priceIndex]}}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <picker mode="selector" :range="ages" :value="ageIndex" @change="onAgeChange">
            <view class="picker-view">
              <text>{{ages[ageIndex]}}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <button class="btn-search" @click="searchCars">搜索</button>
      </view>

      <!-- 车辆卡片列表 -->
      <view class="cars-list">
        <view class="car-card" v-for="(car, index) in carList" :key="index" @click="viewCarDetail(car)">
          <image class="car-image" :src="car.image" mode="aspectFill"></image>
          <view class="car-info">
            <text class="car-name">{{car.name}}</text>
            <view class="car-tags">
              <text class="car-tag">{{car.year}}年</text>
              <text class="car-tag">{{car.mileage}}万公里</text>
              <text class="car-tag">{{car.transmission}}</text>
            </view>
            <text class="car-price">{{car.price}}万</text>
            <button class="btn-detail">查看详情</button>
          </view>
        </view>
      </view>

      <button class="btn-more" @click="loadMoreCars">查看更多车辆</button>
    </view>

    <!-- CTA区域 -->
    <view class="cta-section">
      <text class="cta-title">准备好开始您的二手车交易了吗？</text>
      <text class="cta-subtitle">联系我们，我们将为您提供专业的服务</text>
      <button class="btn-cta" @click="contactUs">立即联系</button>
    </view>

    <!-- 联系信息 -->
    <view class="contact-section" id="contact">
      <text class="section-title">联系我们</text>
      <view class="contact-grid">
        <view class="contact-item">
          <view class="contact-icon">
            <text class="iconfont icon-location">&#xe6a5;</text>
          </view>
          <text class="contact-label">地址</text>
          <text class="contact-value">北京市朝阳区建国路88号</text>
        </view>
        <view class="contact-item">
          <view class="contact-icon">
            <text class="iconfont icon-phone">&#xe6a6;</text>
          </view>
          <text class="contact-label">电话</text>
          <text class="contact-value">400-123-4567</text>
        </view>
        <view class="contact-item">
          <view class="contact-icon">
            <text class="iconfont icon-email">&#xe6a7;</text>
          </view>
          <text class="contact-label">邮箱</text>
          <text class="contact-value">info@example.com</text>
        </view>
      </view>
    </view>

    <!-- 页脚 -->
    <view class="footer">
      <view class="footer-content">
        <view class="footer-section">
          <text class="footer-title">二手车交易平台</text>
          <text class="footer-desc">专业的二手车交易服务，让您的交易更加安全、便捷</text>
        </view>
        <view class="footer-section">
          <text class="footer-title">快速链接</text>
          <view class="footer-links">
            <text class="footer-link" @click="goToPage('index')">首页</text>
            <text class="footer-link" @click="goToPage('cars')">车辆列表</text>
            <text class="footer-link" @click="goToPage('features')">特色服务</text>
            <text class="footer-link" @click="goToPage('contact')">联系我们</text>
          </view>
        </view>
        <view class="footer-section">
          <text class="footer-title">服务支持</text>
          <view class="footer-links">
            <text class="footer-link">常见问题</text>
            <text class="footer-link">交易流程</text>
            <text class="footer-link">隐私政策</text>
            <text class="footer-link">用户协议</text>
          </view>
        </view>
      </view>
      <view class="footer-bottom">
        <text class="copyright">© 2026 二手车交易平台 版权所有</text>
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
            name: '丰田卡罗拉 2020款',
            year: '2020',
            mileage: '3',
            transmission: '自动',
            price: '12.8',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
          },
          {
            id: 2,
            name: '本田思域 2019款',
            year: '2019',
            mileage: '4.5',
            transmission: '自动',
            price: '11.5',
            image: 'https://images.unsplash.com/photo-1605816988066-b0a0ce0a166a?w=400'
          },
          {
            id: 3,
            name: '大众帕萨特 2021款',
            year: '2021',
            mileage: '2',
            transmission: '自动',
            price: '16.8',
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'
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
    padding: 80rpx 30rpx;
    background-color: #F8FAFC;
  }

  .search-filter {
    background-color: #FFFFFF;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  }

  .filter-item {
    margin-bottom: 20rpx;
  }

  .picker-view {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    background-color: #F1F5F9;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #1E293B;
  }

  .picker-arrow {
    font-size: 20rpx;
    color: #64748B;
  }

  .btn-search {
    background-color: #2563EB;
    color: #FFFFFF;
    font-size: 28rpx;
    padding: 24rpx 48rpx;
    border-radius: 12rpx;
    border: none;
    width: 100%;
    margin-top: 10rpx;
  }

  .btn-search:active {
    background-color: #3B82F6;
  }

  .cars-list {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }

  .car-card {
    background-color: #FFFFFF;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  }

  .car-card:active {
    transform: scale(0.98);
  }

  .car-image {
    width: 100%;
    height: 400rpx;
  }

  .car-info {
    padding: 30rpx;
  }

  .car-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
    display: block;
    margin-bottom: 16rpx;
  }

  .car-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 20rpx;
  }

  .car-tag {
    font-size: 24rpx;
    color: #64748B;
    background-color: #F1F5F9;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
  }

  .car-price {
    font-size: 40rpx;
    font-weight: bold;
    color: #2563EB;
    display: block;
    margin-bottom: 20rpx;
  }

  .btn-detail {
    background-color: #2563EB;
    color: #FFFFFF;
    font-size: 28rpx;
    padding: 20rpx 0;
    border-radius: 12rpx;
    border: none;
    width: 100%;
  }

  .btn-detail:active {
    background-color: #3B82F6;
  }

  .btn-more {
    background-color: transparent;
    color: #2563EB;
    font-size: 28rpx;
    padding: 24rpx 48rpx;
    border-radius: 12rpx;
    border: 2rpx solid #2563EB;
    margin-top: 40rpx;
    width: 100%;
  }

  .btn-more:active {
    background-color: #2563EB;
    color: #FFFFFF;
  }

  /* CTA区域 */
  .cta-section {
    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
    padding: 80rpx 30rpx;
    text-align: center;
  }

  .cta-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #FFFFFF;
    display: block;
    margin-bottom: 20rpx;
  }

  .cta-subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    display: block;
    margin-bottom: 40rpx;
  }

  .btn-cta {
    background-color: #FFFFFF;
    color: #2563EB;
    font-size: 28rpx;
    padding: 24rpx 60rpx;
    border-radius: 12rpx;
    border: none;
    font-weight: bold;
  }

  .btn-cta:active {
    background-color: #F1F5F9;
  }

  /* 联系信息 */
  .contact-section {
    padding: 80rpx 30rpx;
    background-color: #FFFFFF;
  }

  .contact-grid {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }

  .contact-item {
    background-color: #FFFFFF;
    border-radius: 20rpx;
    padding: 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .contact-icon {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20rpx;
  }

  .contact-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #1E293B;
    display: block;
    margin-bottom: 12rpx;
  }

  .contact-value {
    font-size: 26rpx;
    color: #64748B;
    display: block;
  }

  /* 页脚 */
  .footer {
    background-color: #1E293B;
    padding: 60rpx 30rpx 30rpx;
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    gap: 40rpx;
    margin-bottom: 40rpx;
  }

  .footer-section {
    text-align: center;
  }

  .footer-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #FFFFFF;
    display: block;
    margin-bottom: 20rpx;
  }

  .footer-desc {
    font-size: 24rpx;
    color: #94A3B8;
    display: block;
    line-height: 1.5;
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .footer-link {
    font-size: 24rpx;
    color: #94A3B8;
  }

  .footer-link:active {
    color: #FFFFFF;
  }

  .footer-bottom {
    border-top: 1rpx solid #334155;
    padding-top: 30rpx;
    text-align: center;
  }

  .copyright {
    font-size: 22rpx;
    color: #64748B;
  }

  /* 响应式适配 - 平板 */
  @media screen and (min-width: 768px) {
    .hero-content {
      flex-direction: row;
      align-items: center;
    }

    .hero-left {
      flex: 1;
      margin-bottom: 0;
      margin-right: 40rpx;
    }

    .hero-right {
      flex: 1;
    }

    .hero-buttons {
      flex-direction: row;
    }

    .features-grid {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .feature-card {
      flex: 1;
      min-width: 300rpx;
    }

    .search-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      align-items: flex-end;
    }

    .filter-item {
      flex: 1;
      min-width: 200rpx;
      margin-bottom: 0;
    }

    .btn-search {
      width: auto;
      margin-top: 0;
    }

    .cars-list {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .car-card {
      flex: 1;
      min-width: 300rpx;
      max-width: calc(50% - 15rpx);
    }

    .contact-grid {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .contact-item {
      flex: 1;
      min-width: 300rpx;
    }

    .footer-content {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .footer-section {
      flex: 1;
      min-width: 300rpx;
      text-align: left;
    }
  }

  /* 响应式适配 - 桌面 */
  @media screen and (min-width: 1024px) {
    .nav-content,
    .hero-section,
    .features-section,
    .cars-section,
    .cta-section,
    .contact-section,
    .footer {
      padding-left: 60rpx;
      padding-right: 60rpx;
    }

    .car-card {
      max-width: calc(33.333% - 20rpx);
    }
  }
</style>