<template>
  <view class="page">
    <view class="hero">
      <view class="brand-badge">ZCY</view>
      <text class="brand-name">智车云</text>
      <text class="brand-tagline">连接车源、检测与交易服务</text>
    </view>

    <view class="card">
      <view class="card-head">
        <text class="eyebrow">WELCOME BACK</text>
        <text class="title">账号登录</text>
        <text class="subtitle">登录智车云，继续管理你的车辆业务</text>
      </view>

      <view class="field">
        <text class="label">账号</text>
        <input v-model="form.account" class="input" placeholder="请输入用户名或手机号" placeholder-class="input-placeholder" />
      </view>

      <view class="field">
        <text class="label">密码</text>
        <view class="password-row">
          <input
            v-model="form.password"
            class="input password-input"
            :password="!showPassword"
            placeholder="请输入登录密码"
            placeholder-class="input-placeholder"
          />
          <view class="toggle-eye" @click="togglePasswordVisibility">
            <svg v-if="showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a20.26 20.26 0 0 1 5.06-6.94" />
              <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a20.26 20.26 0 0 1-2.31 3.19" />
              <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          </view>
        </view>
      </view>

      <view class="actions">
        <text class="link" @click="phoneVerification">使用验证码登录</text>
      </view>

      <button class="primary" :disabled="loading" @click="login">
        {{ loading ? '登录中...' : '登录智车云' }}
      </button>

      <view class="footer">
        <text class="footer-text">还没有账号？</text>
        <text class="link" @click="register">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { openPage } from '../../utils/navigation'

export default {
  data() {
    return {
      form: {
        account: '',
        password: ''
      },
      loading: false,
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
      if (this.loading) {
        return
      }

      const account = this.form.account.trim()
      if (!account) {
        uni.showToast({ title: '请输入用户名或手机号', icon: 'none' })
        return
      }
      if (!this.form.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }

      const isPhone = /^1[3-9]\d{9}$/.test(account)
      this.loading = true
      request({
        url: '/api/user/numberlogin',
        method: 'POST',
        data: {
          username: isPhone ? '' : account,
          phone: isPhone ? account : '',
          password: this.form.password
        },
        success: (res) => {
          this.loading = false
          if (res.statusCode === 200 && res.data.code === 200) {
            const token = res.data.data && res.data.data.token
            if (token) {
              uni.setStorageSync('token', token)
            }
            if (res.data.data && res.data.data.user) {
              uni.setStorageSync('user', res.data.data.user)
            }
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => {
              openPage('/pages/index/index')
            }, 500)
            return
          }
          uni.showToast({ title: (res.data && res.data.message) || '登录失败', icon: 'none' })
        },
        fail: () => {
          this.loading = false
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
      })
    },
    register() {
      openPage('/pages/register/register')
    }
  }
}
</script>

<style scoped>
.page {
  --brand-primary: #0f766e;
  --brand-primary-deep: #115e59;
  --brand-accent: #f59e0b;
  --brand-surface: rgba(255, 255, 255, 0.92);
  --brand-border: rgba(15, 118, 110, 0.12);
  --brand-text: #0f172a;
  --brand-muted: #64748b;
  min-height: 100vh;
  padding: 96rpx 32rpx 40rpx;
  background:
    radial-gradient(circle at top left, rgba(245, 158, 11, 0.2) 0, rgba(245, 158, 11, 0) 34%),
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.24) 0, rgba(15, 118, 110, 0) 36%),
    linear-gradient(180deg, #e6f6f3 0%, #f7fafc 52%, #eef4f8 100%);
  box-sizing: border-box;
}

.hero {
  margin: 0 auto 36rpx;
  text-align: center;
}

.brand-badge {
  width: 108rpx;
  height: 108rpx;
  margin: 0 auto 20rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-deep) 100%);
  box-shadow: 0 20rpx 48rpx rgba(15, 118, 110, 0.22);
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 108rpx;
  letter-spacing: 4rpx;
}

.brand-name {
  display: block;
  margin-bottom: 10rpx;
  color: var(--brand-text);
  font-size: 52rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.brand-tagline {
  color: var(--brand-muted);
  font-size: 24rpx;
}

.card {
  width: 100%;
  max-width: 620rpx;
  margin: 0 auto;
  padding: 40rpx 34rpx 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.65);
  border-radius: 32rpx;
  background: var(--brand-surface);
  box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(16rpx);
  box-sizing: border-box;
}

.card-head {
  margin-bottom: 28rpx;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 12rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(15, 118, 110, 0.1);
  color: var(--brand-primary);
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.title {
  display: block;
  margin-bottom: 12rpx;
  color: var(--brand-text);
  font-size: 42rpx;
  font-weight: 700;
}

.subtitle {
  color: var(--brand-muted);
  font-size: 24rpx;
  line-height: 1.6;
}

.field {
  margin-bottom: 22rpx;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 600;
}

.input {
  width: 100%;
  height: 92rpx;
  padding: 0 24rpx;
  border: 2rpx solid var(--brand-border);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.96);
  box-sizing: border-box;
  font-size: 28rpx;
  color: var(--brand-text);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.input-placeholder {
  color: #94a3b8;
}

.password-row {
  position: relative;
}

.password-input {
  padding-right: 88rpx;
}

.toggle-eye {
  position: absolute;
  top: 0;
  right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 92rpx;
  color: #64748b;
}

.eye-icon {
  width: 38rpx;
  height: 38rpx;
}

.actions,
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.actions {
  margin: 8rpx 0 28rpx;
  justify-content: flex-end;
}

.primary {
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-deep) 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 16rpx 36rpx rgba(15, 118, 110, 0.24);
}

.primary::after {
  border: none;
}

.primary[disabled] {
  opacity: 0.72;
}

.footer {
  margin-top: 26rpx;
}

.footer-text {
  color: var(--brand-muted);
  font-size: 24rpx;
}

.link {
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 600;
}
</style>
