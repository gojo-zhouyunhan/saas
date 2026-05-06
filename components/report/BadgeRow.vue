<template>
  <view class="badge-row">
    <view v-for="(item, index) in items" :key="index" class="badge-item">
      <text class="badge-text">{{ readTagText(item) }}</text>
    </view>
  </view>
</template>

<script>
import { ensureArray, readTagText } from './shared'

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
    readTagText
  }
}
</script>

<style scoped>
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.badge-item {
  padding: 10rpx 18rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(22, 93, 255, 0.18);
  background-color: #f8fbff;
}

.badge-text {
  font-size: 24rpx;
  color: #165dff;
  font-weight: 600;
}
</style>
