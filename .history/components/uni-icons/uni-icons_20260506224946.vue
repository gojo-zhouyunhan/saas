<template>
  <view class="uni-icons" :style="wrapperStyle">
    <template v-if="type === 'home'">
      <view class="home-roof" :style="homeRoofStyle"></view>
      <view class="home-base" :style="homeBaseStyle"></view>
      <view class="home-door" :style="homeDoorStyle"></view>
    </template>
  </view>
</template>

<script>
export default {
  name: 'UniIcons',
  props: {
    type: {
      type: String,
      default: ''
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: '#6B7280'
    }
  },
  computed: {
    normalizedSize() {
      const n = Number(this.size)
      return Number.isFinite(n) && n > 0 ? n : 24
    },
    strokeWidth() {
      return Math.max(2, Math.round(this.normalizedSize * 0.12))
    },
    wrapperStyle() {
      return {
        width: `${this.normalizedSize}px`,
        height: `${this.normalizedSize}px`,
        position: 'relative'
      }
    },
    homeRoofStyle() {
      const s = this.normalizedSize
      const w = this.strokeWidth
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.24)}px`,
        top: `${Math.round(s * 0.14)}px`,
        width: `${Math.round(s * 0.52)}px`,
        height: `${Math.round(s * 0.52)}px`,
        borderTop: `${w}px solid ${this.color}`,
        borderLeft: `${w}px solid ${this.color}`,
        transform: 'rotate(45deg)',
        borderTopLeftRadius: `${Math.max(2, Math.round(s * 0.08))}px`
      }
    },
    homeBaseStyle() {
      const s = this.normalizedSize
      const w = this.strokeWidth
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.24)}px`,
        bottom: `${Math.round(s * 0.14)}px`,
        width: `${Math.round(s * 0.52)}px`,
        height: `${Math.round(s * 0.38)}px`,
        border: `${w}px solid ${this.color}`,
        borderRadius: `${Math.max(4, Math.round(s * 0.18))}px`,
        backgroundColor: 'transparent',
        boxSizing: 'border-box'
      }
    },
    homeDoorStyle() {
      const s = this.normalizedSize
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.43)}px`,
        bottom: `${Math.round(s * 0.14)}px`,
        width: `${Math.max(4, Math.round(s * 0.14))}px`,
        height: `${Math.round(s * 0.24)}px`,
        borderRadius: `${Math.max(3, Math.round(s * 0.1))}px ${Math.max(3, Math.round(s * 0.1))}px 0 0`,
        backgroundColor: this.color
      }
    }
  }
}
</script>

<style scoped>
.uni-icons {
  display: block;
}
</style>
