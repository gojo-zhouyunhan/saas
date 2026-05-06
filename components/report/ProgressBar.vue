<template>
  <view class="bar-list">
    <view v-for="(item, index) in items" :key="index" class="bar-row">
      <view class="bar-meta">
        <text class="bar-label">{{ item.name || item.label || item.item || '--' }}</text>
        <text class="bar-value">{{ metricDisplayValue(item) }}</text>
      </view>
      <view class="bar-track">
        <view class="bar-fill" :style="{ width: metricBarWidth(item) + '%', backgroundColor: toneColor(item.status || item.tone || item.level, '#165DFF') }"></view>
      </view>
      <text v-if="item.reference || item.status || item.note" class="bar-note">{{ item.reference || item.status || item.note }}</text>
    </view>
  </view>
</template>

<script>
import { ensureArray, metricBarWidth, metricDisplayValue, toneColor } from './shared'

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
    metricBarWidth,
    metricDisplayValue,
    toneColor
  }
}
</script>

<style scoped>
.bar-row + .bar-row {
  margin-top: 18rpx;
}

.bar-meta {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.bar-label,
.bar-value {
  font-size: 24rpx;
  line-height: 1.5;
}

.bar-label {
  color: #6b7280;
}

.bar-value {
  color: #1d2129;
  text-align: right;
}

.bar-track {
  width: 100%;
  height: 14rpx;
  margin-top: 10rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background-color: rgba(15, 23, 42, 0.12);
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
}

.bar-note {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #4b5563;
}
</style>
