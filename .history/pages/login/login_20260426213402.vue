<template>
  <view class="page">
    <view class="card">
      <text class="title">账号登录</text>
      <input v-model="form.phone" class="input" type="number" placeholder="手机号" />
      <input v-model="form.password" class="input" :password="!showPassword" placeholder="密码" />
      <view class="actions">
        <text class="link" @click="phoneVerification">验证码登录</text>
        <text class="link" @click="togglePasswordVisibility">{{ showPassword ? '隐藏密码' : '显示密码' }}</text>
      </view>
      <button class="primary" @click="login">登录</button>
      <view class="footer">
        <text>还没有账号？</text>
        <text class="link" @click="register">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script>
import { openPage } from '../../utils/navigation'

export default {
  data() {
    return {
      form: {
        phone: '',
        password: ''
      },
      showPassword: false
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    phoneVerification() {
      openPage('/pages/login/phonelogin')
    },
    login() {
      if (!this.form.phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return
      }
      if (!this.form.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }

      uni.setStorageSync('token', `demo-token-${Date.now()}`)
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        openPage('/pages/index/index')
      }, 500)
    },
    register() {
      openPage('/pages/register/register')
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: var(--c-bg);
}

.card {
  width: 100%;
  max-width: 560rpx;
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background: var(--c-surface);
  box-shadow: var(--shadow-md);
}

.title {
  display: block;
  margin-bottom: 32rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--c-text);
  text-align: center;
}

.input {
  width: 100%;
  height: 88rpx;
  margin-bottom: 24rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.65);
  border: 2rpx solid rgba(15, 23, 42, 0.12);
  box-sizing: border-box;
}

.actions,
.footer {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
  font-size: 24rpx;
  color: var(--c-muted);
}

.primary {
  background: var(--c-primary);
  color: #ffffff;
  border-radius: 16rpx;
}

.primary::after {
  border: none;
}

.link {
  color: var(--c-primary);
}
</style>
