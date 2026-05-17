<template>
  <view class="container">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <view class="nav-center">
        <text class="nav-title">AI预览</text>
        <text class="nav-subtitle">检查 AI 生成内容后再进入发布设置</text>
      </view>
      <text class="nav-action" :class="{ disabled: aiLoading }" @click="goToPublishSettings">发布设置</text>
    </view>

    <view v-if="aiError" class="section ai-error">
      <text class="ai-error-text">{{ aiError }}</text>
    </view>

    <view v-if="aiLoading" class="section">
      <text class="helper-text">正在生成 AI 预览，请稍候...</text>
    </view>

    <view v-else-if="aiPreview" class="section ai-preview">
      <view class="preview-header">
        <view class="preview-heading">
          <text class="preview-title">{{ aiPreview.pageTitle || 'AI 检测报告' }}</text>
          <text class="preview-summary">{{ aiPreview.reportSubtitle || aiPreview.summary || '已生成结构化检测报告内容。' }}</text>
        </view>
      </view>

      <scroll-view scroll-x class="report-tabs-scroll" show-scrollbar="false">
        <view class="report-tabs">
          <view
            v-for="section in previewSections"
            :key="section.key"
            class="report-tab"
            :class="{ active: previewSectionKey === section.key }"
            @click="previewSectionKey = section.key"
          >
            <text class="report-tab-text">{{ section.label }}</text>
          </view>
        </view>
      </scroll-view>

      <template v-if="selectedPreviewSection && selectedPreviewSection.key === 'basicInfo'">
        <view v-if="metaItems.length" class="meta-list">
          <view class="meta-item" v-for="item in metaItems" :key="item.label">
            <text class="meta-label">{{ item.label }}</text>
            <text class="meta-value">{{ item.value }}</text>
          </view>
        </view>

        <view v-if="heroTitle || heroPriceText || heroTags.length" class="preview-block hero-block">
          <text class="hero-title">{{ heroTitle }}</text>
          <text v-if="heroPriceText" class="hero-price">{{ heroPriceText }}</text>
          <text v-if="heroConfidenceText" class="hero-confidence">{{ heroConfidenceText }}</text>
          <view v-if="heroTags.length" class="keyword-list">
            <text class="keyword-chip" v-for="(tag, index) in heroTags" :key="index">{{ tag }}</text>
          </view>
        </view>

        <view v-if="basicInfoRows.length" class="preview-block">
          <text class="block-title">车辆基本信息</text>
          <view class="detail-list">
            <view class="detail-item" v-for="(item, index) in basicInfoRows" :key="index">
              <text class="detail-key">{{ item.label }}</text>
              <view class="detail-value-wrap">
                <text class="detail-value">{{ item.value }}</text>
                <text v-if="item.note" class="detail-note">{{ item.note }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <template v-else-if="selectedPreviewSection && selectedPreviewSection.key === 'appearanceInspection'">
        <view v-if="appearanceImageList.length || appearanceConclusion" class="preview-block">
          <view class="report-card appearance-conclusion-card">
            <view class="report-card-head">
              <view class="report-card-heading">
                <text class="block-title">车辆主视图</text>
                <text v-if="appearanceImageList.length" class="helper-text">当前上传图片生成的外观结论</text>
              </view>
            </view>

            <scroll-view v-if="appearanceImageList.length" scroll-x class="appearance-image-scroll" show-scrollbar="false">
              <view class="appearance-image-row">
                <view class="appearance-image-item" v-for="(image, index) in appearanceImageList" :key="image + index">
                  <image class="appearance-image" :src="image" mode="aspectFill" />
                  <text class="appearance-image-label">{{ appearanceImageLabel(index) }}</text>
                </view>
              </view>
            </scroll-view>

            <view v-if="appearanceConclusion" class="appearance-conclusion-text-wrap">
              <text class="appearance-conclusion-text">{{ appearanceConclusion }}</text>
            </view>
          </view>
        </view>

        <view v-if="selectedStructuredBlocks.length" class="preview-block">
          <view class="report-card" v-for="(block, blockIndex) in selectedStructuredBlocks" :key="blockIndex">
            <view v-if="block.title || block.description" class="report-card-head">
              <view class="report-card-heading">
                <text v-if="block.title" class="block-title">{{ block.title }}</text>
                <text v-if="block.description" class="helper-text">{{ block.description }}</text>
              </view>
            </view>

            <view v-if="block.rows && block.rows.length" class="detail-list">
              <view class="detail-item" v-for="(item, index) in block.rows" :key="index">
                <text class="detail-key">{{ item.label }}</text>
                <view class="detail-value-wrap">
                  <text class="detail-value">{{ item.value }}</text>
                  <text v-if="item.note" class="detail-note">{{ item.note }}</text>
                </view>
              </view>
            </view>

            <view v-else-if="block.tags && block.tags.length" class="keyword-list">
              <text class="keyword-chip" v-for="(tag, index) in block.tags" :key="index">{{ tag }}</text>
            </view>

            <view v-else class="detail-item">
              <text class="detail-value">{{ block.text }}</text>
            </view>
          </view>
        </view>
      </template>

      <template v-else-if="selectedStructuredBlocks.length">
        <view class="preview-block">
          <view class="report-card" v-for="(block, blockIndex) in selectedStructuredBlocks" :key="blockIndex">
            <view v-if="block.title || block.description" class="report-card-head">
              <view class="report-card-heading">
                <text v-if="block.title" class="block-title">{{ block.title }}</text>
                <text v-if="block.description" class="helper-text">{{ block.description }}</text>
              </view>
            </view>

            <view v-if="block.rows && block.rows.length" class="detail-list">
              <view class="detail-item" v-for="(item, index) in block.rows" :key="index">
                <text class="detail-key">{{ item.label }}</text>
                <view class="detail-value-wrap">
                  <text class="detail-value">{{ item.value }}</text>
                  <text v-if="item.note" class="detail-note">{{ item.note }}</text>
                </view>
              </view>
            </view>

            <view v-else-if="block.tags && block.tags.length" class="keyword-list">
              <text class="keyword-chip" v-for="(tag, index) in block.tags" :key="index">{{ tag }}</text>
            </view>

            <view v-else class="detail-item">
              <text class="detail-value">{{ block.text }}</text>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script>
import { request, buildApiUrl, uploadFile } from '../../utils/api'
import { openPage } from '../../utils/navigation'
import { getSellSession, setSellSession } from '../../utils/sell-session'

export default {
  data() {
    return {
      form: {},
      images: [],
      aiLoading: false,
      aiError: '',
      aiPreview: null,
      aiMeta: {
        reportId: '',
        prompt: '',
        rawResponse: ''
      },
      previewSectionKey: 'basicInfo'
    }
  },
  computed: {
    heroTitle() {
      return (this.aiPreview && this.aiPreview.hero && this.aiPreview.hero.title) || this.form.title || 'AI 卖车展示'
    },
    heroPriceText() {
      return (this.aiPreview && this.aiPreview.hero && this.aiPreview.hero.priceText) || ''
    },
    heroConfidenceText() {
      return (this.aiPreview && this.aiPreview.hero && this.aiPreview.hero.confidenceText) || ''
    },
    heroTags() {
      return (this.aiPreview && this.aiPreview.hero && this.aiPreview.hero.tags) || []
    },
    overviewCards() {
      return (this.aiPreview && this.aiPreview.overviewCards) || []
    },
    structuredReport() {
      return (this.aiPreview && this.aiPreview.structuredReport) || {}
    },
    appearanceConclusion() {
      const appearanceInspection = this.structuredReport.appearanceInspection
      return appearanceInspection && appearanceInspection.conclusion ? appearanceInspection.conclusion : ''
    },
    appearanceImageList() {
      return this.images.filter((image) => typeof image === 'string' && image)
    },
    previewSections() {
      return [
        { key: 'basicInfo', label: '基本信息' },
        { key: 'appearanceInspection', label: '外观检测' },
        { key: 'interiorInspection', label: '内饰检测' },
        { key: 'mechanicalPerformance', label: '机械性能' },
        { key: 'maintenanceHistory', label: '维修历史' },
        { key: 'overallEvaluation', label: '综合评估' }
      ]
    },
    selectedPreviewSection() {
      return this.previewSections.find((section) => section.key === this.previewSectionKey) || null
    },
    selectedStructuredBlocks() {
      if (!this.selectedPreviewSection || this.selectedPreviewSection.key === 'basicInfo') {
        return []
      }
      return this.normalizeStructuredBlocks(this.structuredReport[this.selectedPreviewSection.key])
    },
    basicInfoRows() {
      const previewBasicInfo = this.structuredReport.basicInfo || (this.aiPreview && this.aiPreview.basicInfo)
      if (previewBasicInfo) {
        return this.normalizeBasicInfoRows(previewBasicInfo)
      }
      return this.overviewCards.map((card) => ({
        label: card.label || card.name || card.title || card.key,
        value: this.formatDisplayValue(card.value, card.unit),
        note: card.emphasis || ''
      })).filter((item) => item.label)
    },
    metaItems() {
      return [
        { label: '报告 ID', value: this.aiMeta.reportId },
        { label: '场景', value: 'used_car_inspection' },
        { label: '风格', value: 'business' }
      ].filter((item) => item.value)
    }
  },
  onLoad() {
    const session = getSellSession()
    if (!session || !session.form) {
      uni.showToast({ title: '请先填写发布信息', icon: 'none' })
      openPage('/pages/sell/sell')
      return
    }
    this.form = Object.assign({}, session.form)
    this.images = Array.isArray(session.images) ? session.images.slice() : []
    this.aiPreview = session.aiPreview || null
    this.aiMeta = Object.assign({}, this.aiMeta, session.aiMeta || {})
    if (!this.aiPreview) {
      this.generateAiPreview()
    }
  },
  onBackPress() {
    return this.handleExitPrompt()
  },
  methods: {
    goBack() {
      this.handleExitPrompt()
    },
    buildAiInputText() {
      const tradeTypeText = this.form.tradeType === 'online' ? 'online negotiation' : 'offline viewing'
      const parts = [
        `Title: ${this.form.title || 'N/A'}`,
        `Trade Type: ${tradeTypeText}`,
        this.form.price ? `Expected Price: ${this.form.price}` : '',
        `Description: ${this.form.description || 'N/A'}`
      ]
      return parts.filter(Boolean).join('\n')
    },
    buildAiRequestData() {
      const data = {
        inputText: this.buildAiInputText(),
        scene: 'used_car_inspection',
        preferredStyle: 'business',
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
    getRemoteImageUrls() {
      return this.images.filter((image) => /^https?:\/\//.test(image))
    },
    requestGenerateLayout() {
      const localFiles = this.images.filter((image) => !/^https?:\/\//.test(image))
      if (!localFiles.length) {
        return new Promise((resolve, reject) => {
          request({
            url: '/api/ai/report/generate-layout',
            method: 'POST',
            timeout: 180000,
            data: this.buildAiRequestData(),
            success: resolve,
            fail: reject
          })
        })
      }
      return new Promise((resolve, reject) => {
        const requestData = this.buildAiRequestData()
        const wrappedOptions = {
          url: '/api/ai/report/generate-layout',
          formData: Object.keys(requestData).reduce((result, key) => {
            const value = requestData[key]
            if (value !== undefined && value !== null && value !== '') {
              result[key] = String(value)
            }
            return result
          }, {}),
          success: resolve,
          fail: reject
        }
        if (localFiles.length === 1) {
          wrappedOptions.filePath = localFiles[0]
          wrappedOptions.name = 'imageFiles'
        } else {
          wrappedOptions.files = localFiles.map((filePath) => ({
            name: 'imageFiles',
            uri: filePath
          }))
        }
        uploadFile(wrappedOptions)
      })
    },
    async generateAiPreview() {
      if (this.aiLoading) {
        return
      }
      this.aiLoading = true
      this.aiError = ''
      try {
        const res = await this.requestGenerateLayout()
        this.aiLoading = false
        const payload = res.data || {}
        if (res.statusCode === 200 && payload.code === 200 && payload.data && payload.data.schema) {
          this.aiPreview = payload.data.schema
          this.aiMeta = {
            reportId: payload.data.reportId || '',
            prompt: payload.data.prompt || '',
            rawResponse: payload.data.rawResponse || ''
          }
          await this.saveDraftSilently()
          return
        }
        this.aiError = payload.message || 'AI generate failed'
      } catch (error) {
        this.aiLoading = false
        const errMsg = (error && (error.errMsg || error.message)) || ''
        this.aiError = errMsg.includes('timeout') ? 'AI generate timeout' : 'Request failed'
      }
    },
    async saveDraftSilently() {
      const payload = {
        draftId: this.form.draftId || undefined,
        reportId: this.form.reportId || this.aiMeta.reportId || undefined,
        userId: Number(this.form.userId),
        title: this.form.title,
        description: this.form.description,
        price: this.form.price,
        tradeType: this.form.tradeType,
        vehicleVin: this.form.vehicleVin,
        vehicleBaseId: this.form.vehicleBaseId ? Number(this.form.vehicleBaseId) : undefined,
        licensePlate: this.form.licensePlate,
        mileage: this.form.mileage ? Number(this.form.mileage) : undefined,
        imageUrls: this.getRemoteImageUrls(),
        aiReportSchema: this.aiPreview,
        structuredReport: this.aiPreview && this.aiPreview.structuredReport ? this.aiPreview.structuredReport : undefined,
        aiPrompt: this.aiMeta.prompt,
        aiRawResponse: this.aiMeta.rawResponse
      }
      return new Promise((resolve) => {
        uni.request({
          url: buildApiUrl('/api/sell/draft/save'),
          method: 'POST',
          header: Object.assign({ 'Content-Type': 'application/json' }, this.buildAuthHeader()),
          data: payload,
          success: (res) => {
            const result = res.data || {}
            if (result.code === 200 && result.data) {
              this.form.draftId = result.data.draftId || this.form.draftId
              setSellSession({
                form: this.form,
                images: this.images,
                aiPreview: this.aiPreview,
                aiMeta: this.aiMeta,
                updatedAt: new Date().toISOString()
              })
              resolve(true)
              return
            }
            resolve(false)
          },
          fail: () => resolve(false)
        })
      })
    },
    async goToPublishSettings() {
      if (!this.aiPreview) {
        this.showToast('请先等待 AI 生成完成')
        return
      }
      await this.saveDraftSilently()
      openPage('/pages/sell/publish-settings')
    },
    handleExitPrompt() {
      uni.showModal({
        title: '保存草稿',
        content: '离开 AI 预览页前，是否保存到草稿箱？',
        confirmText: '存草稿',
        cancelText: '返回填写',
        success: async (res) => {
          if (res.confirm) {
            await this.saveDraftSilently()
            openPage('/pages/profile/profile')
            return
          }
          openPage('/pages/sell/sell')
        }
      })
      return true
    },
    buildAuthHeader() {
      const token = uni.getStorageSync('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    showToast(title) {
      uni.showToast({ title, icon: 'none' })
    },
    appearanceImageLabel(index) {
      return `图片 ${index + 1}`
    },
    formatDisplayValue(value, unit) {
      if (value === undefined || value === null || value === '') {
        return '--'
      }
      if (typeof value === 'object') {
        if (value.value !== undefined) {
          return this.formatDisplayValue(value.value, value.unit || unit)
        }
        return JSON.stringify(value)
      }
      return String(value) + (unit || '')
    },
    normalizeBasicInfoRows(source) {
      if (Array.isArray(source)) {
        return source.map((item, index) => ({
          label: item.label || item.name || item.key || item.title || `信息 ${index + 1}`,
          value: this.formatDisplayValue(item.value !== undefined ? item.value : item.content, item.unit),
          note: item.note || item.description || item.emphasis || ''
        }))
      }
      if (typeof source === 'object' && source) {
        return Object.keys(source).map((key) => {
          const rawValue = source[key]
          if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
            return {
              label: rawValue.label || rawValue.name || key,
              value: this.formatDisplayValue(rawValue.value !== undefined ? rawValue.value : rawValue.content, rawValue.unit),
              note: rawValue.note || rawValue.description || rawValue.emphasis || ''
            }
          }
          return {
            label: key,
            value: this.formatDisplayValue(rawValue),
            note: ''
          }
        })
      }
      return []
    },
    normalizeStructuredBlocks(source) {
      if (!source) {
        return []
      }
      if (typeof source === 'string' || typeof source === 'number' || typeof source === 'boolean') {
        return [{ text: String(source) }]
      }
      if (Array.isArray(source)) {
        const tags = source
          .filter((item) => typeof item === 'string' || typeof item === 'number')
          .map((item) => String(item))
        if (tags.length === source.length) {
          return [{ tags }]
        }
        return [{ rows: this.normalizeBasicInfoRows(source) }]
      }
      const rows = []
      const blocks = []
      Object.keys(source).forEach((key) => {
        if (this.previewSectionKey === 'appearanceInspection' && key === 'conclusion') {
          return
        }
        const rawValue = source[key]
        if (Array.isArray(rawValue)) {
          blocks.push({ title: this.formatStructuredLabel(key), rows: this.normalizeBasicInfoRows(rawValue) })
          return
        }
        if (rawValue && typeof rawValue === 'object' && rawValue.value === undefined && rawValue.content === undefined) {
          blocks.push({ title: this.formatStructuredLabel(key), rows: this.normalizeBasicInfoRows(rawValue) })
          return
        }
        rows.push({
          label: this.formatStructuredLabel(key),
          value: this.formatDisplayValue(rawValue && rawValue.value !== undefined ? rawValue.value : rawValue, rawValue && rawValue.unit),
          note: rawValue && rawValue.note ? rawValue.note : ''
        })
      })
      if (rows.length) {
        blocks.unshift({ rows })
      }
      return blocks
    },
    formatStructuredLabel(key) {
      const labelMap = {
        basicInfo: '基本信息',
        appearanceInspection: '外观检测',
        interiorInspection: '内饰检测',
        mechanicalPerformance: '机械性能',
        maintenanceHistory: '维修历史',
        overallEvaluation: '综合评估',
        vehicleOverview: '车身概览',
        paintCondition: '漆面状况',
        bodyGlassParts: '车身玻璃与覆盖件',
        tiresWheels: '轮胎轮毂',
        conclusion: '结论'
      }
      return labelMap[key] || key
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: linear-gradient(180deg, #f3f7fb 0%, #edf3f8 100%); padding-bottom: 80rpx; }
.nav-bar { display: flex; align-items: center; gap: 16rpx; padding: calc(24rpx + var(--status-bar-height)) 24rpx 20rpx; }
.nav-back, .nav-action { font-size: 28rpx; color: var(--c-primary); }
.nav-action.disabled { opacity: 0.6; }
.nav-center { flex: 1; min-width: 0; }
.nav-title { display: block; font-size: 32rpx; font-weight: 700; color: var(--c-text); }
.nav-subtitle, .helper-text, .preview-summary { display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-muted); }
.section { margin: 0 24rpx 24rpx; padding: 28rpx; background: rgba(255,255,255,0.94); border-radius: 24rpx; box-shadow: 0 16rpx 40rpx rgba(15,23,42,0.08); }
.ai-error { background: #fff7ed; }
.ai-error-text { color: #c2410c; font-size: 24rpx; line-height: 1.7; }
.preview-title, .hero-title, .block-title { color: var(--c-text); font-weight: 700; }
.preview-title { font-size: 30rpx; }
.report-tabs-scroll { width: 100%; margin-top: 20rpx; }
.report-tabs { display: inline-flex; gap: 8rpx; min-width: 100%; padding: 10rpx 12rpx; background: #2f2f2f; border-radius: 8rpx; box-sizing: border-box; }
.report-tab { min-width: 116rpx; padding: 18rpx 16rpx; border-radius: 8rpx; flex-shrink: 0; }
.report-tab.active { background: #1f5d8b; }
.report-tab-text { font-size: 24rpx; color: #fff; text-align: center; }
.meta-list { margin-top: 20rpx; display: grid; gap: 12rpx; }
.meta-item, .detail-item { display: flex; justify-content: space-between; gap: 20rpx; padding: 18rpx 20rpx; border-radius: 16rpx; background-color: rgba(255,255,255,0.82); }
.meta-label, .meta-value, .detail-key, .detail-value, .detail-note { font-size: 24rpx; line-height: 1.6; }
.meta-label, .detail-key, .detail-note { color: var(--c-muted); }
.meta-value, .detail-value { color: var(--c-text); }
.detail-value-wrap { flex: 1; min-width: 0; }
.preview-block { margin-top: 28rpx; }
.hero-block, .report-card { padding: 24rpx; border: 1rpx solid rgba(15,23,42,0.08); border-radius: 20rpx; background: linear-gradient(135deg, rgba(230,240,246,0.92) 0%, #ffffff 100%); }
.appearance-image-scroll { width: 100%; margin-top: 18rpx; }
.appearance-image-row { display: inline-flex; gap: 18rpx; }
.appearance-image-item { width: 220rpx; flex-shrink: 0; }
.appearance-image { width: 220rpx; height: 148rpx; border-radius: 18rpx; background: rgba(148,163,184,0.16); }
.appearance-image-label { display: block; margin-top: 10rpx; font-size: 22rpx; color: var(--c-muted); text-align: center; }
.appearance-conclusion-text-wrap { margin-top: 22rpx; padding: 20rpx 22rpx; border-radius: 18rpx; background: rgba(255,255,255,0.88); }
.appearance-conclusion-text { font-size: 26rpx; line-height: 1.8; color: var(--c-text); }
.hero-price { display: block; margin-top: 10rpx; font-size: 42rpx; color: var(--c-primary); font-weight: 700; }
.hero-confidence { display: block; margin-top: 10rpx; font-size: 24rpx; color: var(--c-text-2); }
.keyword-list { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.keyword-chip { padding: 10rpx 18rpx; background-color: var(--c-primary-soft); color: var(--c-primary); border-radius: 999rpx; font-size: 24rpx; }
.detail-list { margin-top: 16rpx; display: grid; gap: 12rpx; }
</style>
