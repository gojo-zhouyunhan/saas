<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <!-- 同城定位 -->
          <view class="location-item" @click="chooseLocation">
            <text>当前位置：{{ district || "获取定位中..." }}</text>
            <text class="tip">点击修改</text>
          </view>
        </view>
        <view class="nav-center">
          <view class="search-box">
            <view class="search-icon-wrapper">
              <text class="search-icon">🔍</text>
            </view>
            <text class="search-placeholder">{{ city }}二手车</text>
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
      province: "",
      city: "北京",
      district: "朝阳区",
      userId: 1 // 这里换成你登录后的真实用户ID
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
    },
    // 1. 获取定位（高德）
    getLocation() {
      uni.getLocation({
        type: "gcj02",
        success: (res) => {
          const lng = res.longitude;
          const lat = res.latitude;

          // 高德逆地理 API
          uni.request({
            url: "https://restapi.amap.com/v3/geocode/regeo",
            data: {
              key: "你自己的高德Web端Key", // 这里填你申请的Web Key
              location: lng + "," + lat
            },
            success: (result) => {
              const ad = result.data.regeocode.addressComponent;
              this.province = ad.province;
              this.city = ad.city;
              this.district = ad.district;

              console.log("定位成功：", this.province, this.city, this.district);
            }
          });
        },
        fail: () => {
          uni.showToast({ title: "定位失败，手动选择", icon: "none" });
          this.chooseLocation();
        }
      });
    },

    // 2. 手动选择地址
    chooseLocation() {
      uni.chooseAddress({
        success: (res) => {
          this.province = res.provinceName;
          this.city = res.cityName;
          this.district = res.districtName;
        }
      });
    },

    // 3. 提交给后端
    submitLocation() {
      if (!this.district) {
        uni.showToast({ title: "请获取位置", icon: "none" });
        return;
      }

      uni.request({
        url: "http://192.168.1.133:9090/api/user/save-location",
        method: "POST",
        data: {
          userId: this.userId,
          province: this.province,
          city: this.city,
          district: this.district
        },
        success: (res) => {
          uni.showToast({ title: "保存成功" });
        }
      });
    }
  }
}
</script>

<style scoped>
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
    padding: 16rpx 30rpx;
  }

  .nav-left {
    min-width: 200rpx;
  }

  /* 定位样式 */
  .location-item {
    padding: 14rpx 18rpx;
    background: #F3E8FF;
    border-radius: 12rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tip {
    color: #A78BFA;
    font-size: 20rpx;
  }

  .nav-center {
    flex: 1;
    margin: 0 20rpx;
  }

  .search-box {
    background-color: #F3E8FF;
    border-radius: 24rpx;
    padding: 14rpx 20rpx;
    display: flex;
    align-items: center;
  }

  .search-icon-wrapper {
    width: 28rpx;
    height: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12rpx;
  }

  .search-icon {
    width: 28rpx;
    height: 28rpx;
    color: #7C3AED;
  }

  .search-placeholder {
    font-size: 26rpx;
    color: #A78BFA;
  }

  .search-btn {
    font-size: 28rpx;
    color: #7C3AED;
    font-weight: 500;
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
    font-size: 18rpx;
    margin-left: 4rpx;
    color: #64748B;
  }

  /* 城市选择 */
  .city-selector {
    display: flex;
    padding: 20rpx 30rpx;
    background-color: #FFFFFF;
    margin-bottom: 16rpx;
  }

  .city-item {
    padding: 10rpx 20rpx;
    margin-right: 20rpx;
    border-radius: 20rpx;
    background-color: #F3E8FF;
    cursor-pointer: true;
    transition: all 0.2s ease;
  }

  .city-item:active {
    transform: scale(0.95);
  }

  .city-item.active {
    background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
  }

  .city-item.active .city-name {
    color: #FFFFFF;
  }

  .city-name {
    font-size: 24rpx;
    color: #7C3AED;
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
    transition: transform 0.2s ease;
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

  .icon {
    font-size: 40rpx;
  }

  .entry-icon.red {
    background-color: #FEE2E2;
  }
  .entry-icon.red .icon {
    color: #EF4444;
  }

  .entry-icon.green {
    background-color: #DCFCE7;
  }
  .entry-icon.green .icon {
    color: #22C55E;
  }

  .entry-icon.blue {
    background-color: #DBEAFE;
  }
  .entry-icon.blue .icon {
    color: #3B82F6;
  }

  .entry-icon.yellow {
    background-color: #FEF3C7;
  }
  .entry-icon.yellow .icon {
    color: #F59E0B;
  }

  .entry-icon.purple {
    background-color: #F3E8FF;
  }
  .entry-icon.purple .icon {
    color: #7C3AED;
  }

  .entry-icon.orange {
    background-color: #FFEDD5;
  }
  .entry-icon.orange .icon {
    color: #F97316;
  }

  .entry-icon.gray {
    background-color: #F3F4F6;
  }
  .entry-icon.gray .icon {
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
    transition: transform 0.2s ease;
    cursor-pointer: true;
  }

  .car-card:active {
    transform: scale(0.97);
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