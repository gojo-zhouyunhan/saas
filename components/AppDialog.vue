<template>
  <view v-if="visible" class="dialog-mask">
    <view class="dialog-card">
      <text class="dialog-title">{{ title }}</text>
      <text v-if="content" class="dialog-content">{{ content }}</text>
      <view class="dialog-actions">
        <button class="dialog-action cancel" @click="cancel">{{ cancelText }}</button>
        <button class="dialog-action confirm" @click="confirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AppDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: '\u5426'
    },
    confirmText: {
      type: String,
      default: '\u662f'
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    confirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  background: rgba(0, 0, 0, 0.48);
}

.dialog-card {
  width: 100%;
  max-width: 640rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #ffffff;
  box-shadow: 0 24rpx 80rpx rgba(15, 23, 42, 0.24);
}

.dialog-title {
  display: block;
  padding: 58rpx 44rpx 0;
  color: #111827;
  font-size: 36rpx;
  line-height: 1.35;
  font-weight: 700;
  text-align: center;
}

.dialog-content {
  display: block;
  padding: 44rpx 44rpx 48rpx;
  color: #9ca3af;
  font-size: 30rpx;
  line-height: 1.65;
  font-weight: 600;
  text-align: center;
}

.dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1rpx solid #e5e7eb;
}

.dialog-action {
  height: 96rpx;
  line-height: 96rpx;
  margin: 0;
  padding: 0;
  border-radius: 0;
  background: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
}

.dialog-action::after {
  border: 0;
}

.dialog-action.cancel {
  color: #111827;
  border-right: 1rpx solid #e5e7eb;
}

.dialog-action.confirm {
  color: #007aff;
}
</style>
