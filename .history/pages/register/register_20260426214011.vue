<template>
  <view class="page">
    <view class="card">
      <text class="title">注册</text>
      <input v-model="formData.nickname" class="input" placeholder="昵称" />
      <input v-model="formData.phone" class="input" type="number" placeholder="手机号" />
      <input v-model="formData.password" class="input" :password="!showPassword" placeholder="密码" />
      <input v-model="formData.confirmPassword" class="input" :password="!showPassword" placeholder="确认密码" />
      <view class="toggle-row">
        <text class="link" @click="togglePasswordVisibility">{{ showPassword ? '隐藏密码' : '显示密码' }}</text>
      </view>
      <view class="code-row">
        <input v-model="formData.code" class="input code-input" type="number" placeholder="验证码" />
        <button class="ghost" :disabled="countdown > 0" @click="getCode">{{ countdown > 0 ? countdown + '秒' : '获取验证码' }}</button>
      </view>
      <button class="primary" :disabled="loading" @click="handleRegister">{{ loading ? '注册中...' : '注册' }}</button>
      <view class="footer">
        <text>已有账号？</text>
        <text class="link" @click="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { openPage, redirectToPage } from '../../utils/navigation'

export default {
  data() {
    return {
      formData: {
        phone: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        code: ''
      },
      loading: false,
      showPassword: false,
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
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
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
      if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' })
        return
      }

      request({
        url: `/api/user/sendcode?phone=${this.formData.phone}&scene=register`,
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
    goToLogin() {
      openPage('/pages/login/login')
    },
    validateForm() {
      if (!this.formData.nickname) {
        return '请输入昵称'
      }
      if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        return '手机号格式不正确'
      }
      if (!this.formData.password || this.formData.password.length < 6) {
        return '密码至少6位'
      }
      if (this.formData.confirmPassword !== this.formData.password) {
        return '两次输入的密码不一致'
      }
      if (!this.formData.code) {
        return '请输入验证码'
      }
      return ''
    },
    handleRegister() {
      if (this.loading) {
        return
      }

      const validationMessage = this.validateForm()
      if (validationMessage) {
        uni.showToast({ title: validationMessage, icon: 'none' })
        return
      }

      this.loading = true
      request({
        url: `/api/user/checkcode?phone=${this.formData.phone}&code=${this.formData.code}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode !== 200 || res.data.code !== 200) {
            this.loading = false
            uni.showToast({ title: (res.data && res.data.message) || '验证码错误', icon: 'none' })
            return
          }

          request({
            url: '/api/user/register',
            method: 'POST',
            data: {
              phone: this.formData.phone,
              nickname: this.formData.nickname,
              password: this.formData.password,
              code: this.formData.code
            },
            success: (registerRes) => {
              this.loading = false
              if (registerRes.statusCode === 200 && registerRes.data.code === 200) {
                uni.showToast({ title: '注册成功', icon: 'success' })
                setTimeout(() => {
                  redirectToPage('/pages/login/login')
                }, 500)
                return
              }
              uni.showToast({ title: (registerRes.data && registerRes.data.message) || '注册失败', icon: 'none' })
            },
            fail: () => {
              this.loading = false
              uni.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        },
        fail: () => {
          this.loading = false
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
      })
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

.toggle-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24rpx;
}

.code-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.code-input {
  flex: 1;
  margin-bottom: 0;
}

.ghost,
.primary {
  border-radius: 16rpx;
}

.ghost {
  width: 200rpx;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  text-align: center;
  white-space: nowrap;
  background: var(--c-primary-soft);
  color: var(--c-primary);
}

.primary {
  background: var(--c-primary);
  color: #ffffff;
  height: 88rpx;
  line-height: 88rpx;
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
