<template>
  <view class="summary-card">
    <text class="summary-card-text">{{ summary }}</text>
  </view>
</template>

<script>
import { readSummaryContent } from './shared'

export default {
  props: {
    data: {
      type: [Object, String],
      default: ''
    }
  },
  computed: {
    summary() {
      return readSummaryContent(this.data)
    }
  }
}
</script>

<style scoped>
.summary-card {
  padding: 24rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.08) 0%, rgba(54, 191, 250, 0.06) 100%);
}

.summary-card-text {
  font-size: 26rpx;
  line-height: 1.8;
  color: #1d2129;
}
</style>
