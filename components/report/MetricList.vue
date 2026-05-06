<template>
  <view class="metric-list">
    <view v-for="(item, index) in items" :key="index" class="metric-item">
      <text class="metric-name">{{ item.name || item.label || item.item || '--' }}</text>
      <text class="metric-value">{{ metricDisplayValue(item) }}</text>
      <text v-if="item.reference || item.status || item.note" class="metric-note">{{ item.reference || item.status || item.note }}</text>
    </view>
  </view>
</template>

<script>
import { ensureArray, metricDisplayValue } from './shared'

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
    metricDisplayValue
  }
}
</script>

<style scoped>
.metric-list {
  display: grid;
  gap: 16rpx;
}

.metric-item {
  padding: 20rpx;
  border-radius: 14rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.12);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.metric-name {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
}

.metric-value {
  display: block;
  margin-top: 12rpx;
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 700;
}

.metric-note {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #4b5563;
}
</style>
