<template>
  <view class="container">
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="gradient-circle circle-1"></view>
      <view class="gradient-circle circle-2"></view>
      <view class="gradient-circle circle-3"></view>
    </view>

    <!-- 登录卡片 -->
    <view class="login-card">
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
         
      </view>

      <!-- 表单 -->
      <form class="login-form">
        <!-- 手机号输入 -->
        <view class="form-group">
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="phone-icon"></view>
            </view>
            <input 
              type="number" 
              v-model="form.phone" 
              placeholder="请输入手机号" 
              placeholder-style="color: #94A3B8;"
              class="input"
            />
          </view>
        </view>

        <!-- 验证码输入 -->
        <view class="form-group">
          <view class="input-wrapper">
            <view class="input-icon">
              <view class="lock-icon"></view>
            </view>
            <input 
              type="number" 
              v-model="form.code" 
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
        </view>

        <!-- 登录按钮 -->
        <button class="login-button" @click="login">
          登录
        </button>

        <!-- 注册链接 -->
        <view class="register-link">
          <text>还没有账号？</text>
          <text class="register-text" @click="register">立即注册</text>
        </view>

        
      </form>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        phone: '',
        code: ''
      },
      countdown: 0
    }
  },
  methods: {


    getCode() {
      if (!this.form.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }
      
      // 发送验证码请求
      uni.request({
        url: `http://localhost:8081/api/usedcar/sendcode?phone=${this.form.phone}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
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
          } else {
            uni.showToast({
              title: res.data.message || '验证码发送失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          console.error('验证码发送失败:', err);
        }
      });
    },
    login() {
      if (!this.form.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      if (!this.form.code) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        });
        return;
      }
      
      // 发送验证码验证请求
      uni.request({
        url: `http://localhost:8081/api/usedcar/checkcode?phone=${this.form.phone}&code=${this.form.code}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/index/index'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '验证码错误',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          console.error('登录失败:', err);
        }
      });
    },
    register() {
      
      uni.navigateTo({
        url: '/pages/register/register'
      })
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

  /* 登录卡片 */
  .login-card {
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
  .login-form {
    width: 100%;
  }

  .form-group {
    margin-bottom: 32rpx;
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

  .login-button {
    width: 100%;
    background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: bold;
    padding: 24rpx;
    border-radius: 12rpx;
    border: none;
    margin-bottom: 24rpx;
    transition: all 0.3s ease;
    box-shadow: 0 10rpx 30rpx rgba(249, 115, 22, 0.3);
  }

  .login-button:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(249, 115, 22, 0.4);
  }

  .register-link {
    text-align: center;
    font-size: 24rpx;
    color: #64748B;
  }

  .register-text {
    color: #2563EB;
    font-weight: bold;
    margin-left: 8rpx;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .register-text:active {
    color: #1D4ED8;
  }

  /* 响应式适配 */
  @media screen and (min-width: 768px) {
    .login-card {
      padding: 64rpx 48rpx;
    }
  }
</style>