<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
        </view>
        <view class="nav-center">
          <view class="search-box">
            <view class="search-icon-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </view>
            <text class="search-placeholder">opencar</text>
          </view>
        </view>
        <view class="nav-right">
          <svg class="search-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </view>
      </view>
       
    </view>

    <!-- 快捷入口区 -->
    <view class="quick-entry">
      <view class="entry-item" v-for="(item, index) in quickEntries" :key="index">
        <view class="entry-icon" :class="item.colorClass">
          <view class="icon-wrapper">
            <svg class="entry-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="item.iconPath"/>
            </svg>
          </view>
          <view class="new-badge" v-if="item.badge">{{item.badge}}</view>
        </view>
        <text class="entry-text">{{item.text}}</text>
      </view>
    </view>

    <!-- 后端接口提示 -->
    <view class="api-tip">
      <svg class="api-tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4"/>
        <path d="M12 16h.01"/>
      </svg>
      <view class="api-tip-content">
        <text class="api-tip-title">后端接口提示</text>
        <text class="api-tip-text">以下功能需要后端接口支持：
1. 搜索功能 - 按关键词搜索车辆
2. 车辆列表 - 获取车辆数据
3. 消息通知 - 获取未读消息数
4. 用户登录/注册 - 个人中心功能</text>
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
    <BottomNav currentPage="index" />
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
       
      brands: ['全部品牌', '丰田', '本田', '大众', '宝马', '奔驰', '奥迪'],
      brandIndex: 0,
      prices: ['全部价格', '5万以下', '5-10万', '10-20万', '20万以上'],
      priceIndex: 0,
      ages: ['全部车龄', '1年以内', '1-3年', '3-5年', '5年以上'],
      ageIndex: 0,
      quickEntries: [
        { text: '领红包', colorClass: 'red', iconPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', badge: '' },
        { text: '神奇创业', colorClass: 'green', iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', badge: '' },
        { text: '手机数码', colorClass: 'blue', iconPath: 'M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z', badge: '新装备' },
        { text: '闲鱼回收', colorClass: 'yellow', iconPath: 'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8V3', badge: '' },
        { text: '闲鱼鉴别', colorClass: 'purple', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', badge: '' },
        { text: '鱼币', colorClass: 'orange', iconPath: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z', badge: '' },
        { text: '抽奖', colorClass: 'gray', iconPath: 'M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4', badge: '' }
      ],
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
    // 检查是否登录
    const token = uni.getStorageSync('token')
    if (!token) {
      // 未登录，跳转到登录页面
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }
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
    background-color: #FAF5FF;
    min-height: 100vh;
    padding-bottom: 140rpx;
  }

  /* 导航栏 */
  .nav-bar {
    background-color: #FFFFFF;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
  }

  .nav-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
  }

  .nav-center {
    flex: 1;
    margin: 0 20rpx;
  }

  .search-box {
    background-color: #F3E8FF;
    border-radius: 24rpx;
    padding: 16rpx 24rpx;
    display: flex;
    align-items: center;
  }

  .search-icon-wrapper {
    width: 32rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
  }

  .search-icon {
    width: 32rpx;
    height: 32rpx;
    color: #7C3AED;
  }

  .search-placeholder {
    font-size: 28rpx;
    color: #A78BFA;
  }

  .nav-right {
    display: flex;
    align-items: center;
  }

  .search-btn-icon {
    width: 40rpx;
    height: 40rpx;
    color: #7C3AED;
    cursor-pointer: true;
  }

  .nav-tabs {
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    overflow-x: auto;
    white-space: nowrap;
    border-top: 1rpx solid rgba(0, 0, 0, 0.04);
  }

  .nav-tab {
    font-size: 28rpx;
    color: #64748B;
    padding: 20rpx 16rpx;
    margin-right: 16rpx;
    position: relative;
    cursor-pointer: true;
    transition: color 0.2s ease;
  }

  .nav-tab.active {
    color: #7C3AED;
    font-weight: 600;
  }

  .nav-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16rpx;
    right: 16rpx;
    height: 4rpx;
    background-color: #7C3AED;
    border-radius: 2rpx;
  }

  .nav-tab.special {
    color: #7C3AED;
    font-weight: 600;
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
    padding: 24rpx 30rpx;
    background-color: #FFFFFF;
    margin-bottom: 20rpx;
  }

  .entry-item {
    flex: 1;
    min-width: 100rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16rpx;
    cursor-pointer: true;
  }

  .entry-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .entry-icon:active {
    transform: scale(0.92);
  }

  .icon-wrapper {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .entry-svg-icon {
    width: 40rpx;
    height: 40rpx;
  }

  .entry-icon.red {
    background-color: #FEE2E2;
  }
  .entry-icon.red .entry-svg-icon {
    color: #EF4444;
  }

  .entry-icon.green {
    background-color: #DCFCE7;
  }
  .entry-icon.green .entry-svg-icon {
    color: #22C55E;
  }

  .entry-icon.blue {
    background-color: #DBEAFE;
  }
  .entry-icon.blue .entry-svg-icon {
    color: #3B82F6;
  }

  .entry-icon.yellow {
    background-color: #FEF3C7;
  }
  .entry-icon.yellow .entry-svg-icon {
    color: #F59E0B;
  }

  .entry-icon.purple {
    background-color: #F3E8FF;
  }
  .entry-icon.purple .entry-svg-icon {
    color: #7C3AED;
  }

  .entry-icon.orange {
    background-color: #FFEDD5;
  }
  .entry-icon.orange .entry-svg-icon {
    color: #F97316;
  }

  .entry-icon.gray {
    background-color: #F3F4F6;
  }
  .entry-icon.gray .entry-svg-icon {
    color: #6B7280;
  }

  .new-badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    background-color: #7C3AED;
    color: #FFFFFF;
    font-size: 18rpx;
    padding: 4rpx 10rpx;
    border-radius: 12rpx;
    font-weight: 600;
  }

  .entry-text {
    font-size: 24rpx;
    color: #1E293B;
  }

  /* 后端接口提示 */
  .api-tip {
    background-color: #F3E8FF;
    border: 1rpx solid #DDD6FE;
    border-radius: 16rpx;
    padding: 24rpx;
    margin: 0 30rpx 24rpx;
    display: flex;
    align-items: flex-start;
  }

  .api-tip-icon {
    width: 36rpx;
    height: 36rpx;
    color: #7C3AED;
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  .api-tip-content {
    flex: 1;
  }

  .api-tip-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #7C3AED;
    margin-bottom: 8rpx;
  }

  .api-tip-text {
    font-size: 24rpx;
    color: #64748B;
    line-height: 1.5;
  }

  /* 车辆列表 */
  .cars-section {
    padding: 24rpx 30rpx;
    background-color: #FAF5FF;
  }

  .cars-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }

  .car-card {
    background-color: #FFFFFF;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(124, 58, 237, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor-pointer: true;
  }

  .car-card:active {
    transform: scale(0.97);
    box-shadow: 0 2rpx 8rpx rgba(124, 58, 237, 0.06);
  }

  .car-image {
    width: 100%;
    height: 320rpx;
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
    color: #7C3AED;
    background-color: #F3E8FF;
    padding: 6rpx 14rpx;
    border-radius: 8rpx;
  }

  .car-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1E293B;
    margin-bottom: 14rpx;
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
    margin-bottom: 10rpx;
  }

  .car-price {
    font-size: 34rpx;
    font-weight: 700;
    color: #7C3AED;
  }

  .car-deal {
    font-size: 22rpx;
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