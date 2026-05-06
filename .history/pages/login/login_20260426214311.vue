<template>
  <view class="page">
    <view class="card">
      <text class="title">账号登录</text>
      <input v-model="form.phone" class="input" type="number" placeholder="手机号" />
      <view class="password-row">
        <input v-model="form.password" class="input password-input" :password="!showPassword" placeholder="密码" />
        <view class="toggle-eye" @click="togglePasswordVisibility">
          <svg v-if="showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a20.26 20.26 0 0 1 5.06-6.94"/>
            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a20.26 20.26 0 0 1-2.31 3.19"/>
            <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24"/>
            <path d="M1 1l22 22"/>
          </svg>
        </view>
      </view>
      <view class="actions">
        <text class="link" @click="phoneVerification">验证码登录</text>
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

.password-row {
  position: relative;
}

.password-input {
  padding-right: 88rpx;
}

.toggle-eye {
  position: absolute;
  right: 18rpx;
  top: 0;
  height: 88rpx;
  width: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-muted);
}

.eye-icon {
  width: 38rpx;
  height: 38rpx;
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
  height: 88rpx;
  line-height: 88rpx;
}

.primary::after {
  border: none;
}

.link {
  color: var(--c-primary);
}
</style>
