<template>
  <view class="container">
    <view class="login-card">
      <view class="logo">
        <text class="logo-text">二手车交易平台</text>
      </view>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input 
            type="tel" 
            v-model="formData.phone" 
            placeholder="请输入手机号" 
            class="form-input"
            maxlength="11"
          />
          <text v-if="errors.phone" class="error-message">{{ errors.phone }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">密码</text>
          <input 
            type="password" 
            v-model="formData.password" 
            placeholder="请输入密码" 
            class="form-input"
          />
          <text v-if="errors.password" class="error-message">{{ errors.password }}</text>
        </view>
        
        <view class="form-actions">
          <text class="forgot-password">忘记密码？</text>
        </view>
        
        <button 
          type="submit" 
          class="login-button" 
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <view class="register-link">
          <text>还没有账号？</text>
          <text @click="goToRegister" class="register-text">立即注册</text>
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
        password: ''
      },
      errors: {},
      loading: false
    }
  },
  methods: {
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
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
      
      return Object.keys(this.errors).length === 0
    },
    handleLogin() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      
      // 模拟登录请求
      setTimeout(() => {
        // 这里应该是实际的登录接口调用
        // 登录成功后保存token到本地存储
        uni.setStorageSync('token', 'mock_token')
        uni.setStorageSync('userInfo', { phone: this.formData.phone })
        
        this.loading = false
        
        // 登录成功后跳转到主页
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    }
  }
}
</script>

<style>
.container {
  background-color: #F8FAFC;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

.login-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 40rpx;
  width: 100%;
  max-width: 500rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 40rpx;
}

.logo-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #2563EB;
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1E293B;
  background-color: #F8FAFC;
}

.form-input:focus {
  border-color: #2563EB;
  outline: none;
}

.error-message {
  font-size: 22rpx;
  color: #EF4444;
  margin-top: 8rpx;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30rpx;
}

.forgot-password {
  font-size: 24rpx;
  color: #2563EB;
}

.login-button {
  width: 100%;
  height: 80rpx;
  background-color: #2563EB;
  color: #FFFFFF;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.login-button:disabled {
  background-color: #93C5FD;
}

.register-link {
  text-align: center;
  font-size: 24rpx;
  color: #64748B;
}

.register-text {
  color: #2563EB;
  margin-left: 8rpx;
}
</style>