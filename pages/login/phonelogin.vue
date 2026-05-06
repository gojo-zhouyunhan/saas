<template>
  <view class="page">
    <view class="hero">
      <view class="brand-badge">ZCY</view>
      <text class="brand-name">智车云</text>
      <text class="brand-tagline">安全快捷的验证码登录入口</text>
    </view>

    <view class="card">
      <view class="card-head">
        <text class="eyebrow">FAST SIGN IN</text>
        <text class="title">验证码登录</text>
        <text class="subtitle">输入手机号并完成验证，快速进入智车云</text>
      </view>

      <view class="field">
        <text class="label">手机号</text>
        <input
          v-model="form.phone"
          class="input"
          type="number"
          placeholder="请输入手机号"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="field">
        <text class="label">验证码</text>
        <view class="code-row">
          <input
            v-model="form.code"
            class="input code-input"
            type="number"
            placeholder="请输入验证码"
            placeholder-class="input-placeholder"
          />
          <button class="ghost" :disabled="countdown > 0" @click="getCode">
            {{ countdown > 0 ? countdown + '秒后重试' : '获取验证码' }}
          </button>
        </view>
      </view>

      <button class="primary" @click="login">登录智车云</button>

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
        phone: '',
        code: ''
      },
      serverCode: '',
      countdown: 0,
      timer: null
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    startCountdown() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.countdown = 60
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown -= 1
          return
        }
        clearInterval(this.timer)
        this.timer = null
      }, 1000)
    },
    resolveSmsCode(payload) {
      const data = payload && payload.data
      if (typeof data === 'string' || typeof data === 'number') {
        return String(data)
      }
      if (data && typeof data === 'object') {
        return String(data.smsCode || data.verificationCode || data.captcha || data.code || '')
      }
      return ''
    },
    getCode() {
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' })
        return
      }

      request({
        url: `/api/user/sendcode?phone=${this.form.phone}&scene=phonelogin`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const smsCode = this.resolveSmsCode(res.data)
            if (smsCode) {
              this.serverCode = smsCode
              this.form.code = smsCode
            }
            uni.showToast({ title: '验证码已发送', icon: 'success' })
            this.startCountdown()
            return
          }
          uni.showToast({ title: (res.data && res.data.message) || '发送失败', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
      })
    },
    login() {
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' })
        return
      }
      if (!this.form.code && !this.serverCode) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }

      request({
        url: '/api/user/phonelogin',
        method: 'POST',
        data: {
          phone: this.form.phone,
          code: this.form.code || this.serverCode
        },
        success: (res) => {
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
          uni.showToast({ title: (res.data && res.data.message) || '验证码错误', icon: 'none' })
        },
        fail: () => {
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

.code-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.input {
  flex: 1;
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

.code-input {
  margin-bottom: 0;
}

.ghost,
.primary {
  border-radius: 20rpx;
}

.ghost {
  width: 220rpx;
  height: 92rpx;
  line-height: 92rpx;
  padding: 0 16rpx;
  background: rgba(15, 118, 110, 0.1);
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.primary {
  height: 92rpx;
  line-height: 92rpx;
  margin-top: 8rpx;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-deep) 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 16rpx 36rpx rgba(15, 118, 110, 0.24);
}

.ghost::after,
.primary::after {
  border: none;
}

.ghost[disabled] {
  opacity: 0.72;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
