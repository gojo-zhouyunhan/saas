<template>
  <view class="rating-list">
    <view v-for="(item, index) in items" :key="index" class="rating-item">
      <view class="rating-item-head">
        <text class="rating-label">{{ item.item || item.label || '--' }}</text>
        <text class="rating-stars">{{ readRatingText(item) }}</text>
      </view>
      <text v-if="item.note" class="rating-note">{{ item.note }}</text>
    </view>
  </view>
</template>

<script>
import { ensureArray, readRatingText } from './shared'

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
    readRatingText
  }
}
</script>

<style scoped>
.rating-list {
  display: grid;
  gap: 16rpx;
}

.rating-item {
  padding: 20rpx;
  border-radius: 14rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.12);
  background-color: #ffffff;
}

.rating-item-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.rating-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
}

.rating-stars {
  font-size: 26rpx;
  font-weight: 700;
  color: #d97706;
}

.rating-note {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #4b5563;
}
</style>
