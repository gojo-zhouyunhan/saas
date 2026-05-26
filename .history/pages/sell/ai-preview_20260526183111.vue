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
          <text class="preview-title">{{ aiPreview['页面标题'] || aiPreview.pageTitle || 'AI 检测报告' }}</text>
          <text class="preview-summary">{{ aiPreview['报告副标题'] || aiPreview.reportSubtitle || aiPreview['摘要'] || aiPreview.summary || '已生成结构化检测报告内容。' }}</text>
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

            <view v-else-if="block.text" class="detail-item detail-item-plain">
              <text class="detail-value">{{ block.text }}</text>
            </view>
          </view>
        </view>
      </template>

      <template v-else-if="selectedPreviewSection && selectedPreviewSection.key === 'maintenanceHistory' && maintenanceHistoryView">
        <view class="preview-block">
          <view class="report-card">
            <view class="report-card-head">
              <view class="report-card-heading">
                <text class="block-title">{{ maintenanceHistoryView.title }}</text>
                <text v-if="maintenanceHistoryView.intro" class="helper-text">{{ maintenanceHistoryView.intro }}</text>
              </view>
            </view>

            <view v-if="maintenanceHistoryView.timelineItems.length" class="maintenance-panel">
              <Timeline :data="maintenanceHistoryView.timelineItems" />
            </view>

            <view v-if="maintenanceHistoryView.progressItems.length" class="maintenance-panel">
              <ProgressBar :data="maintenanceHistoryView.progressItems" />
            </view>

            <view v-if="maintenanceHistoryView.rows.length" class="detail-list maintenance-detail-list">
              <view class="detail-item" v-for="(item, index) in maintenanceHistoryView.rows" :key="index">
                <text class="detail-key">{{ item.label }}</text>
                <view class="detail-value-wrap">
                  <text class="detail-value">{{ item.value }}</text>
                </view>
              </view>
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

            <view v-else-if="block.text" class="detail-item detail-item-plain">
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
import { getBackendFieldLabel, getBackendSectionLabel } from '../../utils/field-label'
import Timeline from '../../components/report/Timeline.vue'
import ProgressBar from '../../components/report/ProgressBar.vue'

export default {
  components: {
    Timeline,
    ProgressBar
  },
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
      const hero = this.getSchemaObject('首屏', 'hero')
      return (hero && this.getFieldValue(hero, '标题', 'title')) || this.form.title || 'AI 卖车展示'
    },
    heroPriceText() {
      const hero = this.getSchemaObject('首屏', 'hero')
      return (hero && this.getFieldValue(hero, '价格文案', 'priceText')) || ''
    },
    heroConfidenceText() {
      const hero = this.getSchemaObject('首屏', 'hero')
      return (hero && this.getFieldValue(hero, '可信文案', 'confidenceText')) || ''
    },
    heroTags() {
      const hero = this.getSchemaObject('首屏', 'hero')
      return (hero && this.getFieldValue(hero, '标签', 'tags')) || []
    },
    overviewCards() {
      return this.getFieldValue(this.aiPreview, '概览卡片', 'overviewCards') || []
    },
    structuredReport() {
      return this.getSchemaObject('结构化报告', 'structuredReport') || {}
    },
    appearanceConclusion() {
      const appearanceInspection = this.getStructuredSection('外观检测', 'appearanceInspection')
      return (appearanceInspection && this.getFieldValue(appearanceInspection, '结论', 'conclusion')) || ''
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
      return this.normalizeStructuredBlocks(this.getStructuredSection(this.selectedPreviewSection.key))
    },
    maintenanceHistoryView() {
      return this.buildMaintenanceHistoryView(this.getStructuredSection('maintenanceHistory'))
    },
    basicInfoRows() {
      const previewBasicInfo = this.getStructuredSection('basicInfo') || this.getSchemaObject('基本信息', 'basicInfo')
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
        { label: '报告 ID', value: this.aiMeta.reportId }
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
    getFieldValue(source, ...keys) {
      if (!source || typeof source !== 'object') {
        return undefined
      }
      for (const key of keys) {
        if (key && source[key] !== undefined) {
          return source[key]
        }
      }
      return undefined
    },
    getSchemaObject(...keys) {
      const value = this.getFieldValue(this.aiPreview, ...keys)
      return value && typeof value === 'object' ? value : null
    },
    getStructuredSection(key) {
      const keyMap = {
        basicInfo: ['基本信息', 'basicInfo'],
        appearanceInspection: ['外观检测', 'appearanceInspection'],
        interiorInspection: ['内饰检测', 'interiorInspection'],
        mechanicalPerformance: ['机械性能', 'mechanicalPerformance'],
        maintenanceHistory: ['维修历史', 'maintenanceHistory'],
        overallEvaluation: ['综合评价', 'overallEvaluation']
      }
      const aliases = keyMap[key] || [key]
      return this.getFieldValue(this.structuredReport, ...aliases)
    },
    resetAiPreviewState() {
      this.aiPreview = null
      this.aiMeta = {
        reportId: '',
        prompt: '',
        rawResponse: ''
      }
      this.form.reportId = ''
    },
    persistEditingSession() {
      setSellSession({
        form: this.form,
        images: this.images,
        aiPreview: null,
        aiMeta: {
          reportId: '',
          prompt: '',
          rawResponse: ''
        },
        updatedAt: new Date().toISOString()
      })
    },
    buildAiInputText() {
      const tradeTypeText = this.form.tradeType === 'online' ? 'online negotiation' : 'offline viewing'
      const parts = [
        this.form.title ? `Title: ${this.form.title}` : '',
        this.form.tradeType ? `Trade Type: ${tradeTypeText}` : '',
        this.form.price ? `Expected Price: ${this.form.price}` : '',
        this.form.description ? `Description: ${this.form.description}` : '',
        this.form.vehicleVin ? `VIN: ${this.form.vehicleVin}` : '',
        this.form.licensePlate ? `License Plate: ${this.form.licensePlate}` : '',
        this.form.mileage ? `Mileage: ${this.form.mileage} km` : ''
      ]
      return parts.filter(Boolean).join('\n')
    },
    buildAiRequestData() {
      const data = {
        inputText: this.buildAiInputText(),
        scene: 'used_car_inspection',
        preferredStyle: 'business',
        userId: Number(this.form.userId),
        vehicleVin: this.form.vehicleVin,
        tradeType: this.form.tradeType
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
      const requestTimeout = 300000
      const localFiles = this.images.filter((image) => !/^https?:\/\//.test(image))
      if (!localFiles.length) {
        return new Promise((resolve, reject) => {
          request({
            url: '/api/ai/report/generate-layout',
            method: 'POST',
            timeout: requestTimeout,
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
          timeout: requestTimeout,
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
        this.aiError = errMsg.toLowerCase().includes('timeout')
          ? 'AI 生成超时，请稍后重试或减少图片数量'
          : 'AI 生成失败，请稍后重试'
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
        structuredReport: this.getSchemaObject('结构化报告', 'structuredReport') || undefined,
        aiPrompt: this.aiMeta.prompt,
        aiRawResponse: this.aiMeta.rawResponse
      }
      return new Promise((resolve) => {
        request({
          url: '/api/sell/draft/save',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
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
          this.resetAiPreviewState()
          this.persistEditingSession()
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
          label: this.normalizeBasicInfoLabel(item.label || item.name || item.key || item.title || `信息 ${index + 1}`),
          value: this.formatDisplayValue(item.value !== undefined ? item.value : item.content, item.unit),
          note: item.note || item.description || item.emphasis || ''
        })).filter((item) => item.label)
      }
      if (typeof source === 'object' && source) {
        return Object.keys(source).map((key) => {
          const rawValue = source[key]
          if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
            return {
              label: this.normalizeBasicInfoLabel(rawValue.label || rawValue.name || key),
              value: this.formatDisplayValue(rawValue.value !== undefined ? rawValue.value : rawValue.content, rawValue.unit),
              note: rawValue.note || rawValue.description || rawValue.emphasis || ''
            }
          }
          return {
            label: this.normalizeBasicInfoLabel(key),
            value: this.formatDisplayValue(rawValue),
            note: ''
          }
        }).filter((item) => item.label)
      }
      return []
    },
    normalizeBasicInfoLabel(label) {
      return getBackendFieldLabel(label)
    },
    buildMaintenanceHistoryView(source) {
      if (!source || typeof source !== 'object') {
        return null
      }
      const data = source.data && typeof source.data === 'object' ? source.data : {}
      const timelineItems = Array.isArray(data.keyRecords)
        ? data.keyRecords.map((item) => ({
            date: item.date || item.time || item.label || '--',
            content: [item.content, item.recordNo ? `记录编号${item.recordNo}` : ''].filter(Boolean).join('，')
          })).filter((item) => item.content)
        : []
      const progressItems = []
      if (data.fourSRatio !== undefined && data.fourSRatio !== null && data.fourSRatio !== '') {
        progressItems.push({
          label: '4S店保养占比',
          value: this.normalizePercentValue(data.fourSRatio),
          note: data.industryAverage ? `行业平均水平: ${data.industryAverage}` : ''
        })
      }
      const rows = []
      if (data.totalRecords !== undefined && data.totalRecords !== null && data.totalRecords !== '') {
        rows.push({
          label: '维修保养记录',
          value: `${data.totalRecords}条`
        })
      }
      if (data.accidentRecord) {
        rows.push({
          label: '事故记录',
          value: this.formatDisplayValue(data.accidentRecord)
        })
      }
      const intro = source.summary || source.description || ''
      return {
        title: source.title || '维修保养历史',
        intro,
        timelineItems,
        progressItems,
        rows
      }
    },
    normalizePercentValue(value) {
      if (typeof value === 'number') {
        return value <= 1 ? Math.round(value * 100) : Math.round(value)
      }
      if (typeof value === 'string') {
        const normalized = value.trim().replace('%', '')
        const parsed = Number(normalized)
        if (!Number.isNaN(parsed)) {
          return parsed <= 1 ? Math.round(parsed * 100) : Math.round(parsed)
        }
      }
      return value
    },
    normalizeStructuredBlocks(source) {
      if (!source) {
        return []
      }
      if (this.previewSectionKey === 'maintenanceHistory' || this.previewSectionKey === '维修历史') {
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
        if ((this.previewSectionKey === 'appearanceInspection' || this.previewSectionKey === '外观检测') && (key === 'conclusion' || key === '结论')) {
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
        const label = this.formatStructuredLabel(key)
        if (!label) {
          return
        }
        rows.push({
          label,
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
      return getBackendSectionLabel(key)
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
.report-tabs-scroll { width: 100%; margin-top: 20rpx; white-space: nowrap; }
.report-tabs { display: inline-flex; flex-wrap: nowrap; min-width: 100%; width: max-content; gap: 8rpx; padding: 10rpx 12rpx; background: #2f2f2f; border-radius: 8rpx; box-sizing: border-box; }
.report-tab { min-width: 116rpx; padding: 18rpx 16rpx; border-radius: 8rpx; flex-shrink: 0; }
.report-tab.active { background: #1f5d8b; }
.report-tab-text { font-size: 24rpx; color: #fff; text-align: center; }
.meta-list { margin-top: 20rpx; display: grid; gap: 12rpx; }
.meta-item { display: flex; justify-content: space-between; gap: 20rpx; padding: 18rpx 20rpx; border-radius: 16rpx; background-color: rgba(255,255,255,0.82); }
.detail-item { display: grid; grid-template-columns: 168rpx minmax(0, 1fr); align-items: start; column-gap: 20rpx; row-gap: 10rpx; padding: 18rpx 20rpx; border-radius: 16rpx; background-color: rgba(255,255,255,0.82); }
.detail-item-plain { grid-template-columns: minmax(0, 1fr); background: transparent; padding: 0; border-radius: 0; }
.meta-label, .meta-value, .detail-key, .detail-value, .detail-note { font-size: 24rpx; line-height: 1.6; }
.meta-label, .detail-key, .detail-note { color: var(--c-muted); }
.meta-value, .detail-value { color: var(--c-text); }
.detail-key { padding-top: 2rpx; }
.detail-value-wrap { min-width: 0; }
.detail-value { display: block; word-break: break-all; }
.detail-note { display: block; margin-top: 6rpx; }
.preview-block { margin-top: 28rpx; }
.hero-block, .report-card { padding: 24rpx; border: 1rpx solid rgba(15,23,42,0.08); border-radius: 20rpx; background: linear-gradient(135deg, rgba(230,240,246,0.92) 0%, #ffffff 100%); }
.hero-block { padding: 28rpx 30rpx; border: 1rpx solid rgba(31, 93, 139, 0.12); box-shadow: inset 0 1rpx 0 rgba(255,255,255,0.7); background: linear-gradient(135deg, rgba(227, 238, 247, 0.98) 0%, rgba(247, 250, 252, 0.96) 100%); }
.appearance-image-scroll { width: 100%; margin-top: 18rpx; }
.appearance-image-row { display: inline-flex; gap: 18rpx; }
.appearance-image-item { width: 220rpx; flex-shrink: 0; }
.appearance-image { width: 220rpx; height: 148rpx; border-radius: 18rpx; background: rgba(148,163,184,0.16); }
.appearance-image-label { display: block; margin-top: 10rpx; font-size: 22rpx; color: var(--c-muted); text-align: center; }
.appearance-conclusion-text-wrap { margin-top: 22rpx; padding: 0; border-radius: 0; background: transparent; }
.appearance-conclusion-text { font-size: 26rpx; line-height: 1.8; color: var(--c-text); }
.hero-title { display: block; font-size: 44rpx; line-height: 1.2; letter-spacing: 1rpx; }
.hero-price { display: block; margin-top: 10rpx; font-size: 42rpx; color: var(--c-primary); font-weight: 700; }
.hero-confidence { display: inline-flex; align-items: center; margin-top: 18rpx; padding: 8rpx 18rpx; border-radius: 999rpx; font-size: 22rpx; color: var(--c-text-2); background: rgba(255,255,255,0.66); }
.keyword-list { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.keyword-chip { padding: 10rpx 18rpx; background-color: var(--c-primary-soft); color: var(--c-primary); border-radius: 999rpx; font-size: 24rpx; }
.detail-list { margin-top: 16rpx; display: grid; gap: 12rpx; }
.maintenance-panel + .maintenance-panel,
.maintenance-panel + .maintenance-detail-list { margin-top: 24rpx; }
</style>
