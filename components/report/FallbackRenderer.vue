<template>
  <view>
    <text class="fallback-text">{{ content }}</text>
  </view>
</template>

<script>
import { stringifyData } from './shared'

export default {
  props: {
    data: {
      type: [Object, Array, String, Number, Boolean],
      default: ''
    }
  },
  computed: {
    content() {
      return stringifyData(this.data)
    }
  }
}
</script>

<style scoped>
.fallback-text {
  font-size: 24rpx;
  line-height: 1.8;
  color: #4b5563;
}
</style>
