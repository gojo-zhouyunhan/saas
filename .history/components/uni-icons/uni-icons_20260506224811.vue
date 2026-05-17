<template>
  <view class="uni-icons" :style="wrapperStyle">
    <template v-if="type === 'home'">
      <view class="home-roof" :style="homeRoofStyle"></view>
      <view class="home-base" :style="homeBaseStyle"></view>
      <view class="home-door" :style="homeDoorStyle"></view>
    </template>
    <template v-else-if="type === 'location'">
      <view :style="locationDropStyle"></view>
      <view :style="locationHoleStyle"></view>
    </template>
    <template v-else-if="type === 'chat'">
      <view :style="chatBoxStyle"></view>
      <view :style="chatTailStyle"></view>
      <view :style="chatLineTopStyle"></view>
      <view :style="chatLineBottomStyle"></view>
    </template>
    <template v-else-if="type === 'person'">
      <view :style="personHeadStyle"></view>
      <view :style="personShoulderStyle"></view>
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
    },
    locationDropStyle() {
      const s = this.normalizedSize
      const w = this.strokeWidth
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.26)}px`,
        top: `${Math.round(s * 0.12)}px`,
        width: `${Math.round(s * 0.48)}px`,
        height: `${Math.round(s * 0.48)}px`,
        border: `${w}px solid ${this.color}`,
        borderRadius: `${Math.round(s * 0.48)}px ${Math.round(s * 0.48)}px ${Math.round(s * 0.48)}px ${Math.round(s * 0.06)}px`,
        transform: 'rotate(-45deg)',
        boxSizing: 'border-box'
      }
    },
    locationHoleStyle() {
      const s = this.normalizedSize
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.43)}px`,
        top: `${Math.round(s * 0.31)}px`,
        width: `${Math.round(s * 0.18)}px`,
        height: `${Math.round(s * 0.18)}px`,
        borderRadius: '999px',
        backgroundColor: this.color
      }
    },
    chatBoxStyle() {
      const s = this.normalizedSize
      const w = this.strokeWidth
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.14)}px`,
        top: `${Math.round(s * 0.18)}px`,
        width: `${Math.round(s * 0.68)}px`,
        height: `${Math.round(s * 0.5)}px`,
        border: `${w}px solid ${this.color}`,
        borderRadius: `${Math.round(s * 0.28)}px`,
        boxSizing: 'border-box'
      }
    },
    chatTailStyle() {
      const s = this.normalizedSize
      const w = this.strokeWidth
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.34)}px`,
        bottom: `${Math.round(s * 0.14)}px`,
        width: `${Math.round(s * 0.22)}px`,
        height: `${Math.round(s * 0.22)}px`,
        borderLeft: `${w}px solid ${this.color}`,
        borderBottom: `${w}px solid ${this.color}`,
        transform: 'skewX(-20deg) rotate(-24deg)',
        borderBottomLeftRadius: `${Math.round(s * 0.08)}px`,
        boxSizing: 'border-box'
      }
    },
    chatLineTopStyle() {
      const s = this.normalizedSize
      const h = Math.max(2, Math.round(s * 0.08))
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.34)}px`,
        top: `${Math.round(s * 0.37)}px`,
        width: `${Math.round(s * 0.3)}px`,
        height: `${h}px`,
        borderRadius: '999px',
        backgroundColor: this.color
      }
    },
    chatLineBottomStyle() {
      const s = this.normalizedSize
      const h = Math.max(2, Math.round(s * 0.08))
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.34)}px`,
        top: `${Math.round(s * 0.52)}px`,
        width: `${Math.round(s * 0.38)}px`,
        height: `${h}px`,
        borderRadius: '999px',
        backgroundColor: this.color
      }
    },
    personHeadStyle() {
      const s = this.normalizedSize
      const w = this.strokeWidth
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.31)}px`,
        top: `${Math.round(s * 0.12)}px`,
        width: `${Math.round(s * 0.38)}px`,
        height: `${Math.round(s * 0.38)}px`,
        border: `${w}px solid ${this.color}`,
        borderRadius: '999px',
        boxSizing: 'border-box'
      }
    },
    personShoulderStyle() {
      const s = this.normalizedSize
      const w = this.strokeWidth
      return {
        position: 'absolute',
        left: `${Math.round(s * 0.19)}px`,
        bottom: `${Math.round(s * 0.12)}px`,
        width: `${Math.round(s * 0.62)}px`,
        height: `${Math.round(s * 0.34)}px`,
        border: `${w}px solid ${this.color}`,
        borderTopLeftRadius: `${Math.round(s * 0.42)}px`,
        borderTopRightRadius: `${Math.round(s * 0.42)}px`,
        borderBottom: 'none',
        boxSizing: 'border-box'
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
