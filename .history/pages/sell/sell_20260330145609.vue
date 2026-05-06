<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <text class="nav-back" @click="goBack">←</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">发布闲置</text>
        </view>
        <view class="nav-right">
          <text class="nav-submit" @click="submit">发布</text>
        </view>
      </view>
    </view>

    <!-- 发布表单 -->
    <view class="sell-form">
      <!-- 商品图片 -->
      <view class="form-item">
        <text class="form-label">商品图片</text>
        <view class="image-uploader">
          <view class="upload-item add" @click="chooseImage">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
          <view class="upload-item" v-for="(image, index) in images" :key="index">
            <image :src="image" mode="aspectFill"></image>
            <text class="delete-icon" @click="deleteImage(index)">×</text>
          </view>
        </view>
      </view>

      <!-- 商品标题 -->
      <view class="form-item">
        <text class="form-label">商品标题</text>
        <input type="text" class="form-input" v-model="form.title" placeholder="请输入商品标题" placeholder-style="color: #94A3B8;"></input>
      </view>

      <!-- 商品描述 -->
      <view class="form-item">
        <text class="form-label">商品描述</text>
        <textarea class="form-textarea" v-model="form.description" placeholder="请详细描述商品的成色、使用情况等信息" placeholder-style="color: #94A3B8;"></textarea>
      </view>

      <!-- 价格 -->
      <view class="form-item">
        <text class="form-label">价格</text>
        <view class="price-input">
          <text class="price-symbol">¥</text>
          <input type="number" class="form-input price" v-model="form.price" placeholder="0.00" placeholder-style="color: #94A3B8;"></input>
        </view>
      </view>

      <!-- 分类 -->
      <view class="form-item">
        <text class="form-label">分类</text>
        <view class="category-selector">
          <view class="category-item" :class="{ active: form.category === 'car' }" @click="form.category = 'car'">
            <text class="category-name">二手车</text>
          </view>
          <view class="category-item" :class="{ active: form.category === 'phone' }" @click="form.category = 'phone'">
            <text class="category-name">手机数码</text>
          </view>
          <view class="category-item" :class="{ active: form.category === 'clothing' }" @click="form.category = 'clothing'">
            <text class="category-name">服装鞋包</text>
          </view>
          <view class="category-item" :class="{ active: form.category === 'other' }" @click="form.category = 'other'">
            <text class="category-name">其他</text>
          </view>
        </view>
      </view>

      <!-- 交易方式 -->
      <view class="form-item">
        <text class="form-label">交易方式</text>
        <view class="trade-type">
          <view class="trade-item" :class="{ active: form.tradeType === 'online' }" @click="form.tradeType = 'online'">
            <text class="trade-name">线上交易</text>
          </view>
          <view class="trade-item" :class="{ active: form.tradeType === 'offline' }" @click="form.tradeType = 'offline'">
            <text class="trade-name">线下交易</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <BottomNav currentPage="sell" />
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
      form: {
        title: '',
        description: '',
        price: '',
        category: 'car',
        tradeType: 'online'
      },
      images: []
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    submit() {
      if (!this.form.title) {
        uni.showToast({
          title: '请输入商品标题',
          icon: 'none'
        });
        return;
      }
      if (!this.form.description) {
        uni.showToast({
          title: '请输入商品描述',
          icon: 'none'
        });
        return;
      }
      if (!this.form.price) {
        uni.showToast({
          title: '请输入价格',
          icon: 'none'
        });
        return;
      }
      if (this.images.length === 0) {
        uni.showToast({
          title: '请添加商品图片',
          icon: 'none'
        });
        return;
      }
      
      // 提交表单
      console.log('提交表单:', this.form, this.images);
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      });
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/index/index'
        });
      }, 1500);
    },
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.images.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.images = this.images.concat(res.tempFilePaths);
        }
      });
    },
    deleteImage(index) {
      this.images.splice(index, 1);
    }
  }
}
</script>

<style scoped>
  /* 基础样式 */
  .container {
    background-color: #F8FAFC;
    min-height: 100vh;
    padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
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

  .nav-back {
    font-size: 32rpx;
    color: #1E293B;
  }

  .nav-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
  }

  .nav-submit {
    font-size: 28rpx;
    color: #2563EB;
    font-weight: bold;
  }

  /* 发布表单 */
  .sell-form {
    padding: 20rpx 30rpx;
    background-color: #FFFFFF;
  }

  .form-item {
    margin-bottom: 30rpx;
  }

  .form-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #1E293B;
    display: block;
    margin-bottom: 16rpx;
  }

  .image-uploader {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .upload-item {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    overflow: hidden;
    position: relative;
  }

  .upload-item.add {
    border: 2rpx dashed #CBD5E1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #F8FAFC;
  }

  .add-icon {
    font-size: 48rpx;
    color: #94A3B8;
    margin-bottom: 8rpx;
  }

  .add-text {
    font-size: 20rpx;
    color: #94A3B8;
  }

  .upload-item image {
    width: 100%;
    height: 100%;
  }

  .delete-icon {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 32rpx;
    height: 32rpx;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-input {
    width: 100%;
    padding: 20rpx;
    border: 2rpx solid #E2E8F0;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #1E293B;
  }

  .form-textarea {
    width: 100%;
    height: 200rpx;
    padding: 20rpx;
    border: 2rpx solid #E2E8F0;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #1E293B;
    resize: none;
  }

  .price-input {
    display: flex;
    align-items: center;
    border: 2rpx solid #E2E8F0;
    border-radius: 12rpx;
    padding: 0 20rpx;
  }

  .price-symbol {
    font-size: 28rpx;
    color: #1E293B;
    margin-right: 8rpx;
  }

  .price-input .price {
    flex: 1;
    border: none;
    padding: 20rpx 0;
  }

  .category-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .category-item {
    padding: 12rpx 24rpx;
    border: 2rpx solid #E2E8F0;
    border-radius: 24rpx;
    background-color: #F8FAFC;
  }

  .category-item.active {
    border-color: #2563EB;
    background-color: #EFF6FF;
  }

  .category-name {
    font-size: 24rpx;
    color: #1E293B;
  }

  .category-item.active .category-name {
    color: #2563EB;
  }

  .trade-type {
    display: flex;
    gap: 20rpx;
  }

  .trade-item {
    flex: 1;
    padding: 20rpx;
    border: 2rpx solid #E2E8F0;
    border-radius: 12rpx;
    text-align: center;
  }

  .trade-item.active {
    border-color: #2563EB;
    background-color: #EFF6FF;
  }

  .trade-name {
    font-size: 24rpx;
    color: #1E293B;
  }

  .trade-item.active .trade-name {
    color: #2563EB;
  }
</style>