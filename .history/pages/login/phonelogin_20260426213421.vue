<template>
  <view class="page">
    <view class="card">
      <text class="title">验证码登录</text>
      <input v-model="form.phone" class="input" type="number" placeholder="手机号" />
      <view class="code-row">
        <input v-model="form.code" class="input code-input" type="number" placeholder="验证码" />
        <button class="ghost" :disabled="countdown > 0" @click="getCode">{{ countdown > 0 ? countdown + '秒' : '获取验证码' }}</button>
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
import { request } from '../../utils/api'
import { openPage } from '../../utils/navigation'

export default {
  data() {
    return {
      form: {
        phone: '',
        code: ''
      },
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
    getCode() {
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' })
        return
      }

      request({
        url: `/api/user/sendcode?phone=${this.form.phone}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
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
      if (!this.form.code) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }

      request({
        url: `/api/user/checkcode?phone=${this.form.phone}&code=${this.form.code}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            uni.setStorageSync('token', `sms-token-${Date.now()}`)
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

.code-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.input {
  flex: 1;
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.65);
  border: 2rpx solid rgba(15, 23, 42, 0.12);
  box-sizing: border-box;
}

.code-input {
  margin-bottom: 0;
}

.ghost,
.primary {
  border-radius: 16rpx;
}

.ghost {
  width: 220rpx;
  background: var(--c-primary-soft);
  color: var(--c-primary);
}

.primary {
  background: var(--c-primary);
  color: #ffffff;
}

.ghost::after,
.primary::after {
  border: none;
}

.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  font-size: 24rpx;
  color: var(--c-muted);
}

.link {
  color: var(--c-primary);
}
</style>
