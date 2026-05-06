<template>
  <view class="timeline-list">
    <view v-for="(item, index) in items" :key="index" class="timeline-item">
      <text class="timeline-time">{{ item.time || item.date || item.label || '--' }}</text>
      <text class="timeline-content">{{ item.content || item.description || formatDisplayValue(item.value) }}</text>
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
.timeline-item {
  position: relative;
  padding-left: 28rpx;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 4rpx;
  top: 12rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #165dff;
}

.timeline-item + .timeline-item {
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #eef2f7;
}

.timeline-time {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
}

.timeline-content {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #1d2129;
}
</style>
