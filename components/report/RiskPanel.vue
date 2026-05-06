<template>
  <view class="risk-panel" :style="{ backgroundColor: panelColor }">
    <view class="risk-panel-head">
      <text class="risk-level-label">风险等级</text>
      <text class="risk-level-value">{{ level }}</text>
    </view>
    <text class="component-data">{{ content }}</text>
  </view>
</template>

<script>
import { readRiskContent, readRiskLevel } from './shared'

export default {
  props: {
    data: {
      type: [Object, String],
      default: ''
    }
  },
  computed: {
    level() {
      return readRiskLevel(this.data)
    },
    content() {
      return readRiskContent(this.data)
    },
    panelColor() {
      if (this.level === '高') {
        return '#fef2f2'
      }
      if (this.level === '中') {
        return '#fff7ed'
      }
      return '#f0fdf4'
    }
  }
}
</script>

<style scoped>
.risk-panel {
  padding: 20rpx;
  border-radius: 14rpx;
}

.risk-panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.risk-level-label {
  font-size: 24rpx;
  color: #6b7280;
}

.risk-level-value {
  font-size: 24rpx;
  font-weight: 700;
  color: #c2410c;
}

.component-data {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #4b5563;
}
</style>
