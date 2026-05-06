<template>
  <view class="stat-grid">
    <view v-for="(item, index) in items" :key="index" class="stat-item">
      <text class="stat-label">{{ item.label || item.name || item.key || '--' }}</text>
      <text class="stat-value">{{ formatDisplayValue(item.value) }}</text>
      <text v-if="item.reference || item.status" class="stat-note">{{ item.reference || item.status }}</text>
    </view>
  </view>
</template>

<script>
import { ensureArray, formatDisplayValue } from './shared'

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    items() {
      return ensureArray(this.data)
    }
  },
  methods: {
    formatDisplayValue
  }
}
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.stat-item {
  min-height: 160rpx;
  padding: 20rpx;
  border-radius: 14rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.08);
  background-color: rgba(247, 248, 250, 0.75);
  box-sizing: border-box;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
}

.stat-value {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
  line-height: 1.2;
  color: #1d2129;
  font-weight: 700;
}

.stat-note {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: #4b5563;
}
</style>
