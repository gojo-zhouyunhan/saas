<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <text class="nav-back" @click="goBack">&lt;</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">Report Layout</text>
        </view>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="page-body">
      <view class="hero-card">
        <text class="hero-title">AI Report Layout JSON</text>
        <text class="hero-desc">Submit inspection text to render the returned sections and components for report UI debugging.</text>
      </view>

      <view class="section">
        <text class="section-title">Raw Inspection Text</text>
        <textarea
          v-model="form.inputText"
          class="form-textarea"
          placeholder="Paste the raw vehicle inspection report text here"
          placeholder-style="color: #94A3B8;"
        />
      </view>

      <view class="section">
        <text class="section-title">Request Params</text>
        <view class="form-grid">
          <view class="field">
            <text class="field-label">userId</text>
            <input v-model="form.userId" class="form-input" type="number" placeholder="required" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="field">
            <text class="field-label">vehicleVin</text>
            <input v-model="form.vehicleVin" class="form-input" type="text" placeholder="required" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="field">
            <text class="field-label">vehicleBaseId</text>
            <input v-model="form.vehicleBaseId" class="form-input" type="number" placeholder="optional" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="field">
            <text class="field-label">licensePlate</text>
            <input v-model="form.licensePlate" class="form-input" type="text" placeholder="optional" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="field">
            <text class="field-label">mileage</text>
            <input v-model="form.mileage" class="form-input" type="number" placeholder="optional km" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="field">
            <text class="field-label">preferredStyle</text>
            <input v-model="form.preferredStyle" class="form-input" type="text" placeholder="business" placeholder-style="color: #94A3B8;" />
          </view>
        </view>
        <button class="ai-trigger" :loading="aiLoading" @click="generateLayout">Generate Layout</button>
      </view>

      <view v-if="aiError" class="section ai-error">
        <text class="ai-error-text">{{ aiError }}</text>
      </view>

      <view v-if="aiPreview" class="section ai-preview">
        <view class="preview-header">
          <view>
            <text class="preview-title">{{ aiPreview.pageTitle || 'Inspection Report' }}</text>
            <text class="preview-summary">{{ aiPreview.summary || 'Layout generated.' }}</text>
          </view>
          <text class="preview-badge">Rendered</text>
        </view>

        <view v-if="metaItems.length" class="meta-list">
          <view v-for="item in metaItems" :key="item.label" class="meta-item">
            <text class="meta-label">{{ item.label }}</text>
            <text class="meta-value">{{ item.value }}</text>
          </view>
        </view>

        <view class="preview-block hero-block" :style="themeSurfaceStyle">
          <text class="hero-main-title">{{ aiPreview.pageTitle || 'Inspection Report' }}</text>
          <text class="hero-confidence">{{ aiPreview.summary || 'Layout generated.' }}</text>
        </view>

        <view
          v-for="section in renderedSections"
          :key="section.sectionKey || section.sectionTitle"
          class="render-section"
          :style="mergeStyles(section.style, themeSectionStyle)"
        >
          <view class="render-section-header">
            <text class="render-section-title">{{ section.sectionTitle }}</text>
            <text v-if="section.description" class="render-section-desc">{{ section.description }}</text>
          </view>

          <view
            v-for="component in section.components || []"
            :key="component.componentKey || component.title"
            class="render-component"
            :style="mergeStyles(component.style, themeSurfaceStyle)"
          >
            <text v-if="component.title" class="render-component-title">{{ component.title }}</text>
            <report-component-renderer :component="component" />
          </view>
        </view>

        <view v-if="aiMeta.prompt || aiMeta.rawResponse" class="preview-block debug-block">
          <text class="block-title">Debug</text>
          <text v-if="aiMeta.prompt" class="debug-label">prompt</text>
          <text v-if="aiMeta.prompt" class="debug-text">{{ aiMeta.prompt }}</text>
          <text v-if="aiMeta.rawResponse" class="debug-label">rawResponse</text>
          <text v-if="aiMeta.rawResponse" class="debug-text">{{ aiMeta.rawResponse }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { goBackOrFallback } from '../../utils/navigation'
import ReportComponentRenderer from '../../components/report/ComponentRenderer.vue'

export default {
  components: {
    ReportComponentRenderer
  },
  data() {
    return {
      form: {
        inputText: '',
        userId: '',
        vehicleVin: '',
        vehicleBaseId: '',
        licensePlate: '',
        mileage: '',
        preferredStyle: 'business'
      },
      aiLoading: false,
      aiError: '',
      aiPreview: null,
      aiMeta: {
        reportId: '',
        prompt: '',
        rawResponse: ''
      }
    }
  },
  computed: {
    renderedSections() {
      return (this.aiPreview && this.aiPreview.sections) || []
    },
    themeConfig() {
      return (this.aiPreview && this.aiPreview.theme) || {}
    },
    themeSectionStyle() {
      return {
        backgroundColor: this.themeConfig.backgroundColor || '#F7F8FA',
        borderRadius: this.toRpx(this.themeConfig.borderRadius, 18),
        padding: this.toRpx(this.themeConfig.spacing, 16)
      }
    },
    themeSurfaceStyle() {
      return {
        borderColor: this.hexToRgba(this.themeConfig.primaryColor || '#165DFF', 0.12),
        borderRadius: this.toRpx(this.themeConfig.borderRadius, 16)
      }
    },
    metaItems() {
      return [
        { label: 'reportId', value: this.aiMeta.reportId },
        { label: 'scene', value: 'used_car_inspection' },
        { label: 'preferredStyle', value: this.form.preferredStyle || 'business' }
      ].filter((item) => item.value)
    }
  },
  onLoad() {
    this.hydrateUserContext()
  },
  methods: {
    goBack() {
      goBackOrFallback('/pages/index/index')
    },
    hydrateUserContext() {
      const storedUser = uni.getStorageSync('user')
      if (!storedUser) {
        return
      }

      try {
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser
        const user = parsedUser.user || parsedUser.userInfo || parsedUser
        const userId = user.userId || user.id || user.uid
        if (userId && !this.form.userId) {
          this.form.userId = String(userId)
        }
      } catch (error) {
        console.warn('hydrate user context failed', error)
      }
    },
    showToast(title) {
      uni.showToast({
        title,
        icon: 'none'
      })
    },
    resetAiState() {
      this.aiError = ''
      this.aiPreview = null
      this.aiMeta = {
        reportId: '',
        prompt: '',
        rawResponse: ''
      }
    },
    buildRequestData() {
      const data = {
        inputText: this.form.inputText,
        scene: 'used_car_inspection',
        preferredStyle: this.form.preferredStyle || 'business',
        userId: Number(this.form.userId),
        vehicleVin: this.form.vehicleVin
      }

      if (this.form.vehicleBaseId) {
        data.vehicleBaseId = Number(this.form.vehicleBaseId)
      }
      if (this.form.licensePlate) {
        data.licensePlate = this.form.licensePlate
      }
      if (this.form.mileage) {
        data.mileage = Number(this.form.mileage)
      }

      return data
    },
    generateLayout() {
      if (!this.form.inputText) {
        this.showToast('Please enter raw inspection text')
        return
      }
      if (!this.form.userId) {
        this.showToast('Please enter userId')
        return
      }
      if (!this.form.vehicleVin) {
        this.showToast('Please enter vehicleVin')
        return
      }

      this.aiLoading = true
      this.resetAiState()

      request({
        url: '/api/ai/report/generate-layout',
        method: 'POST',
        timeout: 180000,
        data: this.buildRequestData(),
        success: (res) => {
          this.aiLoading = false
          const payload = res.data || {}

          if (res.statusCode === 200 && payload.code === 200 && payload.data && payload.data.schema) {
            this.aiPreview = payload.data.schema
            this.aiMeta = {
              reportId: payload.data.reportId || '',
              prompt: payload.data.prompt || '',
              rawResponse: payload.data.rawResponse || ''
            }
            return
          }

          this.aiError = payload.message || 'Layout generation failed'
        },
        fail: (err) => {
          this.aiLoading = false
          const errMsg = (err && err.errMsg) || ''
          this.aiError = errMsg.includes('timeout')
            ? 'Layout generation timed out, please retry with shorter input'
            : 'Request failed, please check backend service'
          console.error('generate report layout failed', err)
        }
      })
    },
    mergeStyles(sourceStyle, fallbackStyle) {
      return Object.assign({}, fallbackStyle || {}, sourceStyle || {})
    },
    toRpx(value, fallback) {
      const numeric = Number(value)
      return `${Number.isFinite(numeric) ? numeric * 2 : fallback * 2}rpx`
    },
    hexToRgba(hex, alpha) {
      const normalized = (hex || '').replace('#', '')
      if (normalized.length !== 6) {
        return `rgba(22, 93, 255, ${alpha})`
      }
      const r = parseInt(normalized.slice(0, 2), 16)
      const g = parseInt(normalized.slice(2, 4), 16)
      const b = parseInt(normalized.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
}
</script>

<style scoped>
.container {
  background-color: var(--c-bg);
  min-height: 100vh;
}

.nav-bar {
  background-color: var(--c-nav);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.nav-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
}

.nav-left,
.nav-right {
  width: 120rpx;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.nav-back,
.nav-title {
  color: var(--c-nav-text);
}

.nav-back {
  font-size: 36rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
}

.page-body {
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.hero-card,
.section {
  background-color: var(--c-surface);
  border-radius: 18rpx;
  border: 1rpx solid var(--c-border);
  box-shadow: var(--shadow-sm);
}

.hero-card {
  padding: 30rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, rgba(11, 60, 93, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.hero-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--c-text);
}

.hero-desc,
.preview-summary,
.debug-text {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--c-muted);
}

.section {
  padding: 28rpx 30rpx;
  margin-bottom: 24rpx;
}

.section-title,
.block-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text);
}

.form-textarea,
.form-input {
  width: 100%;
  margin-top: 16rpx;
  padding: 20rpx;
  border: 2rpx solid rgba(15, 23, 42, 0.12);
  border-radius: 14rpx;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.72);
  color: var(--c-text);
  font-size: 28rpx;
}

.form-textarea {
  height: 260rpx;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18rpx;
  margin-top: 16rpx;
}

.field-label {
  display: block;
  font-size: 24rpx;
  color: var(--c-muted);
}

.ai-trigger {
  margin-top: 24rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 14rpx;
  background: var(--gradient-primary);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
}

.ai-trigger::after {
  border: none;
}

.ai-error {
  background-color: #fff7ed;
}

.ai-error-text {
  font-size: 24rpx;
  color: #c2410c;
  line-height: 1.6;
}

.ai-preview {
  background: linear-gradient(180deg, rgba(230, 240, 246, 0.72) 0%, #ffffff 100%);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.preview-title,
.hero-main-title {
  display: block;
  color: var(--c-text);
  font-weight: 700;
}

.preview-title {
  font-size: 30rpx;
}

.hero-main-title {
  font-size: 32rpx;
  line-height: 1.4;
}

.preview-badge {
  flex-shrink: 0;
  height: 48rpx;
  line-height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background-color: var(--c-primary-soft);
  color: var(--c-primary);
  font-size: 22rpx;
  font-weight: 600;
}

.meta-list {
  margin-top: 20rpx;
  display: grid;
  gap: 12rpx;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 18rpx 20rpx;
  border-radius: 14rpx;
  background-color: rgba(255, 255, 255, 0.78);
}

.meta-label,
.meta-value {
  font-size: 24rpx;
  line-height: 1.5;
}

.meta-label {
  color: var(--c-muted);
}

.meta-value {
  color: var(--c-text);
  text-align: right;
}

.preview-block {
  margin-top: 28rpx;
}

.hero-block {
  border: 1rpx solid rgba(15, 23, 42, 0.12);
  background-color: var(--c-surface);
  padding: 24rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, rgba(230, 240, 246, 0.85) 0%, #ffffff 100%);
}

.hero-confidence {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--c-text-2);
}

.render-section {
  margin-top: 28rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.08);
}

.render-section-header {
  margin-bottom: 20rpx;
}

.render-section-title,
.render-component-title {
  display: block;
  color: var(--c-text);
  font-weight: 700;
}

.render-section-title {
  font-size: 30rpx;
}

.render-section-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--c-muted);
}

.render-component {
  margin-top: 20rpx;
  padding: 24rpx;
  border-width: 1rpx;
  border-style: solid;
}

.render-component:first-of-type {
  margin-top: 0;
}

.render-component-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
}

.debug-block {
  padding-top: 8rpx;
}

.debug-label {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: var(--c-primary);
}

@media screen and (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
