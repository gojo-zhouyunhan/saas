<template>
  <view class="component-list">
    <view v-for="(item, index) in items" :key="index" class="component-item">
      <view class="item-head">
        <text class="component-title">{{ item.label || item.item || item.name || '检查项' }}</text>
        <text class="item-status">{{ item.result || item.status || '已记录' }}</text>
      </view>
      <text class="component-data">{{ item.note || item.description || formatDisplayValue(item.value) }}</text>
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
.component-list {
  display: grid;
  gap: 16rpx;
}

.component-item {
  min-height: 140rpx;
  padding: 20rpx;
  border-radius: 14rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.12);
  background-color: #ffffff;
  box-sizing: border-box;
}

.item-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.component-title {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
}

.item-status {
  font-size: 22rpx;
  color: #165dff;
}

.component-data {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #4b5563;
}
</style>
