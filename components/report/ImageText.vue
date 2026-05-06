<template>
  <view class="image-text">
    <image v-if="imageUrl" class="image-text-media" :src="imageUrl" mode="widthFix" />
    <text class="component-data">{{ content }}</text>
  </view>
</template>

<script>
import { readImageTextContent, readImageUrl } from './shared'

export default {
  props: {
    data: {
      type: [Object, String],
      default: ''
    }
  },
  computed: {
    imageUrl() {
      return readImageUrl(this.data)
    },
    content() {
      return readImageTextContent(this.data)
    }
  }
}
</script>

<style scoped>
.image-text-media {
  width: 100%;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  background-color: #f7f8fa;
}

.component-data {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
  color: #4b5563;
}
</style>
