<template>
  <view class="tag-list">
    <text v-for="(item, index) in items" :key="index" class="tag-chip">{{ readTagText(item) }}</text>
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
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-chip {
  padding: 10rpx 18rpx;
  background-color: rgba(22, 93, 255, 0.08);
  color: #165dff;
  border-radius: 999rpx;
  font-size: 24rpx;
}
</style>
