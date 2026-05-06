<template>
  <view class="container">
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="gradient-circle circle-1"></view>
      <view class="gradient-circle circle-2"></view>
      <view class="gradient-circle circle-3"></view>
    </view>

    <!-- 注册卡片 -->
    <view class="register-card">
      <!-- 应用Logo -->
      <view class="app-logo">
        <view class="logo-container">
          <view class="logo-icon">
            <view class="car-icon">
              <view class="car-body"></view>
              <view class="car-wheel wheel-1"></view>
              <view class="car-wheel wheel-2"></view>
            </view>
          </view>
        </view>
        <text class="app-name">智车云</text>
        <text class="app-tagline">智能汽车管理平台</text>
      </view>

      <!-- 表单 -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 手机号输入 -->
        <view class="form-group">
          <text class="form-label">手机号</text>
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="phone-icon"></view>
            </view>
            <input 
              type="tel" 
              v-model="formData.phone" 
              placeholder="请输入手机号" 
              placeholder-style="color: #94A3B8;"
              class="input"
              maxlength="11"
            />
          </view>
          <text v-if="errors.phone" class="error-message">{{ errors.phone }}</text>
        </view>
        
        <!-- 密码输入 -->
        <view class="form-group">
          <text class="form-label">密码</text>
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="lock-icon"></view>
            </view>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="formData.password" 
              placeholder="请输入密码" 
              placeholder-style="color: #94A3B8;"
              class="input"
            />
            <view class="toggle-password" @click="togglePasswordVisibility">
              <view v-if="showPassword" class="eye-icon open"></view>
              <view v-else class="eye-icon closed"></view>
            </view>
          </view>
          <text v-if="errors.password" class="error-message">{{ errors.password }}</text>
        </view>
        
        <!-- 验证码输入 -->
        <view class="form-group">
          <text class="form-label">验证码</text>
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="lock-icon"></view>
            </view>
            <input 
              type="number" 
              v-model="formData.code" 
              placeholder="请输入验证码" 
              placeholder-style="color: #94A3B8;"
              class="input"
            />
            <button 
              class="get-code-button" 
              @click="getCode" 
              :disabled="countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
          <text v-if="errors.code" class="error-message">{{ errors.code }}</text>
        </view>
        
        <!-- 昵称输入 -->
        <view class="form-group">
          <text class="form-label">昵称</text>
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="lock-icon"></view>
            </view>
            <input 
              type="text" 
              v-model="formData.nickname" 
              placeholder="请输入昵称" 
              placeholder-style="color: #94A3B8;"
              class="input"
            />
          </view>
          <text v-if="errors.nickname" class="error-message">{{ errors.nickname }}</text>
        </view>
        
        <!-- 城市输入 -->
        <view class="form-group">
          <text class="form-label">城市</text>
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="lock-icon"></view>
            </view>
            <input 
              type="text" 
              v-model="formData.city" 
              placeholder="请输入城市" 
              placeholder-style="color: #94A3B8;"
              class="input"
            />
          </view>
          <text v-if="errors.city" class="error-message">{{ errors.city }}</text>
        </view>
        
        <!-- 用户类型选择 -->
        <view class="form-group">
          <text class="form-label">用户类型</text>
          <view class="user-type-selector">
            <view 
              class="user-type-option" 
              :class="{ active: formData.userType === 1 }"
              @click="formData.userType = 1"
            >
              <text>个人用户</text>
            </view>
            <view 
              class="user-type-option" 
              :class="{ active: formData.userType === 2 }"
              @click="formData.userType = 2"
            >
              <text>车商用户</text>
            </view>
          </view>
        </view>
        
        <!-- 车商公司名称（仅当用户类型为B端车商时显示） -->
        <view v-if="formData.userType === 2" class="form-group">
          <text class="form-label">公司名称</text>
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="lock-icon"></view>
            </view>
            <input 
              type="text" 
              v-model="formData.companyName" 
              placeholder="请输入公司名称" 
              placeholder-style="color: #94A3B8;"
              class="input"
            />
          </view>
          <text v-if="errors.companyName" class="error-message">{{ errors.companyName }}</text>
        </view>
        
        <button 
          type="submit" 
          class="register-button" 
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
        
        <view class="login-link">
          <text>已有账号？</text>
          <text @click="goToLogin" class="login-text">立即登录</text>
        </view>
      </form>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        phone: '',
        password: '',
        nickname: '',
        companyName: '',
        code: ''
      },
      errors: {},
      loading: false,
      showPassword: false,
      countdown: 0
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    getCode() {
      if (!this.formData.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }
      
      // 模拟发送验证码
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      });
      
      // 开始倒计时
      this.countdown = 60;
      const timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(timer);
        }
      }, 1000);
    },
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    },
    validateForm() {
      this.errors = {}
      
      if (!this.formData.phone) {
        this.errors.phone = '请输入手机号'
      } else if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        this.errors.phone = '请输入正确的手机号'
      }
      
      if (!this.formData.password) {
        this.errors.password = '请输入密码'
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码长度至少6位'
      }
      
      if (!this.formData.code) {
        this.errors.code = '请输入验证码'
      }
      
      if (!this.formData.nickname) {
        this.errors.nickname = '请输入昵称'
      }
      
      if (!this.formData.city) {
        this.errors.city = '请输入城市'
      }
      
      if (this.formData.userType === 2 && !this.formData.companyName) {
        this.errors.companyName = '请输入公司名称'
      }
      
      return Object.keys(this.errors).length === 0
    },
    handleRegister() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      
      // 准备注册数据
      const currentTime = new Date().toISOString()
      const registerData = {
        phone: this.formData.phone,
        nickname: this.formData.nickname,
        userType: this.formData.userType,
        companyName: this.formData.companyName,
        password: this.formData.password,
        status: 1, // 1-正常，0-禁用
        lastLoginAt: currentTime,
        createdAt: currentTime,
        updatedAt: currentTime,
        code: this.formData.code
      }
      
      console.log('注册数据:', registerData)
      
      // 模拟注册请求
      setTimeout(() => {
        // 这里应该是实际的注册接口调用
        // uni.request({
        //   url: '你的注册接口地址',
        //   method: 'POST',
        //   data: registerData,
        //   success: (res) => {
        //     // 处理成功响应
        //   },
        //   fail: (err) => {
        //     // 处理失败响应
        //   }
        // })
        
        this.loading = false
        
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        // 注册成功后跳转到登录页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }, 1500)
      }, 1000)
    }
  }
}
</script>

<style scoped>
  /* 基础样式 */
  .container {
    background-color: #F8FAFC;
    min-height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx;
    overflow: hidden;
  }

  /* 背景装饰 */
  .background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }

  .gradient-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(60rpx);
    opacity: 0.6;
  }

  .circle-1 {
    width: 400rpx;
    height: 400rpx;
    top: -200rpx;
    left: -200rpx;
    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
  }

  .circle-2 {
    width: 300rpx;
    height: 300rpx;
    top: 50%;
    right: -150rpx;
    background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
  }

  .circle-3 {
    width: 200rpx;
    height: 200rpx;
    bottom: -100rpx;
    left: 50%;
    background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  }

  /* 注册卡片 */
  .register-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20rpx);
    border-radius: 24rpx;
    padding: 48rpx 36rpx;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 480rpx;
    z-index: 10;
    animation: slideUp 0.5s ease-out;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 应用Logo */
  .app-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 48rpx;
  }

  .logo-container {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
    box-shadow: 0 10rpx 30rpx rgba(37, 99, 235, 0.3);
  }

  .car-icon {
    position: relative;
    width: 60rpx;
    height: 30rpx;
  }

  .car-body {
    position: absolute;
    width: 60rpx;
    height: 20rpx;
    background-color: white;
    border-radius: 10rpx;
    top: 0;
  }

  .car-wheel {
    position: absolute;
    width: 12rpx;
    height: 12rpx;
    background-color: #1E293B;
    border-radius: 50%;
    bottom: 0;
  }

  .wheel-1 {
    left: 8rpx;
  }

  .wheel-2 {
    right: 8rpx;
  }

  .app-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #1E293B;
    margin-bottom: 8rpx;
  }

  .app-tagline {
    font-size: 20rpx;
    color: #64748B;
  }

  /* 表单 */
  .register-form {
    width: 100%;
  }

  .form-group {
    margin-bottom: 32rpx;
  }

  .form-label {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: #1E293B;
    margin-bottom: 12rpx;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16rpx;
    padding: 0 24rpx;
    border: 2rpx solid #E2E8F0;
    transition: all 0.3s ease;
  }

  .input-wrapper:focus-within {
    border-color: #2563EB;
    background: #FFFFFF;
    box-shadow: 0 0 0 6rpx rgba(37, 99, 235, 0.1);
  }

  .input-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .phone-icon {
    width: 18rpx;
    height: 18rpx;
    border: 2rpx solid #64748B;
    border-radius: 4rpx;
    position: relative;
  }

  .phone-icon::after {
    content: '';
    position: absolute;
    bottom: -4rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 6rpx;
    height: 6rpx;
    border: 2rpx solid #64748B;
    border-radius: 50%;
  }

  .lock-icon {
    width: 16rpx;
    height: 20rpx;
    border: 2rpx solid #64748B;
    border-radius: 4rpx;
    position: relative;
  }

  .lock-icon::after {
    content: '';
    position: absolute;
    top: -6rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 8rpx;
    height: 8rpx;
    border: 2rpx solid #64748B;
    border-radius: 50%;
  }

  .eye-icon {
    width: 20rpx;
    height: 14rpx;
    border: 2rpx solid #64748B;
    border-radius: 7rpx;
    position: relative;
  }

  .eye-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8rpx;
    height: 8rpx;
    background-color: #64748B;
    border-radius: 50%;
  }

  .eye-icon.closed::before {
    content: '';
    position: absolute;
    top: -2rpx;
    left: -2rpx;
    right: -2rpx;
    bottom: -2rpx;
    border: 2rpx solid #64748B;
    transform: rotate(45deg);
  }

  .input {
    flex: 1;
    padding: 24rpx 0;
    font-size: 28rpx;
    color: #1E293B;
  }

  .toggle-password {
    width: 24rpx;
    height: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .get-code-button {
    padding: 12rpx 24rpx;
    font-size: 24rpx;
    color: #2563EB;
    background: transparent;
    border: none;
    border-left: 2rpx solid #E2E8F0;
    margin-left: 24rpx;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .get-code-button:active {
    color: #1D4ED8;
  }

  .get-code-button:disabled {
    color: #94A3B8;
    cursor: not-allowed;
  }

  .user-type-selector {
    display: flex;
    gap: 16rpx;
    margin-top: 12rpx;
  }

  .user-type-option {
    flex: 1;
    padding: 20rpx;
    border: 2rpx solid #E2E8F0;
    border-radius: 12rpx;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .user-type-option.active {
    border-color: #2563EB;
    background-color: rgba(37, 99, 235, 0.1);
  }

  .user-type-option text {
    font-size: 24rpx;
    color: #1E293B;
  }

  .user-type-option.active text {
    color: #2563EB;
    font-weight: 500;
  }

  .error-message {
    font-size: 22rpx;
    color: #EF4444;
    margin-top: 8rpx;
    display: block;
  }

  .register-button {
    width: 100%;
    background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: bold;
    padding: 24rpx;
    border-radius: 16rpx;
    border: none;
    margin-bottom: 24rpx;
    transition: all 0.3s ease;
    box-shadow: 0 10rpx 30rpx rgba(249, 115, 22, 0.3);
  }

  .register-button:disabled {
    background: #93C5FD;
    box-shadow: none;
  }

  .register-button:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(249, 115, 22, 0.4);
  }

  .login-link {
    text-align: center;
    font-size: 24rpx;
    color: #64748B;
  }

  .login-text {
    color: #2563EB;
    font-weight: bold;
    margin-left: 8rpx;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .login-text:active {
    color: #1D4ED8;
  }

  /* 响应式适配 */
  @media screen and (min-width: 768px) {
    .register-card {
      padding: 64rpx 48rpx;
    }
  }
</style>