<template>
  <view class="text-block">
    <text class="component-data">{{ content }}</text>
  </view>
</template>

<script>
import { readTextBlockContent } from './shared'

export default {
  props: {
    data: {
      type: [Object, String],
      default: ''
    }
  },
  computed: {
    content() {
      return readTextBlockContent(this.data)
    }
  }
}
</script>

<style scoped>
.component-data {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
  color: #4b5563;
}
</style>
