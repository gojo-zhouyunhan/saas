<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <view class="nav-center">
        <text class="nav-title">车辆详情</text>
        <text class="nav-subtitle">基于已保存的 AI 检测记录展示</text>
      </view>
    </view>

    <view v-if="loading" class="section">
      <text class="helper-text">正在加载车辆详情...</text>
    </view>

    <view v-else-if="error" class="section error-card">
      <text class="error-text">{{ error }}</text>
    </view>

    <template v-else-if="report">
      <view v-if="imageList.length" class="section" style="padding: 0">
        <image :src="imageList[0]" mode="aspectFill" style="width: 100%; height: 560rpx" />
      </view>

      <view class="section hero-card">
        <text class="hero-title">{{ reportTitle }}</text>
        <text v-if="priceText" class="hero-price">{{ priceText }}</text>
        <text v-if="tradeTypeText" class="hero-pill">{{ tradeTypeText }}</text>
        <text v-if="reportSubtitle" class="hero-subtitle">{{ reportSubtitle }}</text>
      </view>

      <view v-if="imageList.length" class="section">
        <text class="section-title">车辆图片</text>
        <scroll-view scroll-x class="image-scroll" show-scrollbar="false">
          <view class="image-row">
            <image
              v-for="(image, index) in imageList"
              :key="image + index"
              class="detail-image"
              :src="image"
              mode="aspectFill"
            />
          </view>
        </scroll-view>
      </view>

      <view v-if="reportSummary" class="section">
        <text class="section-title">AI摘要</text>
        <text class="summary-text">{{ reportSummary }}</text>
      </view>

      <view v-if="basicInfoRows.length" class="section">
        <text class="section-title">基本信息</text>
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

      <view
        v-for="section in structuredSections"
        :key="section.key"
        class="section"
      >
        <text class="section-title">{{ section.label }}</text>
        <text v-if="section.summary" class="summary-text">{{ section.summary }}</text>

        <view v-if="section.key === 'maintenanceHistory' && section.maintenanceView" class="block-list">
          <view class="report-card">
            <view class="report-card-head">
              <text class="block-title">{{ section.maintenanceView.title }}</text>
              <text v-if="section.maintenanceView.intro" class="helper-text">{{ section.maintenanceView.intro }}</text>
            </view>

            <view v-if="section.maintenanceView.timelineItems.length" class="maintenance-panel">
              <Timeline :data="section.maintenanceView.timelineItems" />
            </view>

            <view v-if="section.maintenanceView.progressItems.length" class="maintenance-panel">
              <ProgressBar :data="section.maintenanceView.progressItems" />
            </view>

            <view v-if="section.maintenanceView.rows.length" class="detail-list maintenance-detail-list">
              <view class="detail-item" v-for="(item, index) in section.maintenanceView.rows" :key="index">
                <text class="detail-key">{{ item.label }}</text>
                <view class="detail-value-wrap">
                  <text class="detail-value">{{ item.value }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="section.blocks.length" class="block-list">
          <view class="report-card" v-for="(block, blockIndex) in section.blocks" :key="blockIndex">
            <view v-if="block.title || block.description" class="report-card-head">
              <text v-if="block.title" class="block-title">{{ block.title }}</text>
              <text v-if="block.description" class="helper-text">{{ block.description }}</text>
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

            <view v-else-if="block.tags && block.tags.length" class="tag-list">
              <text class="tag-chip" v-for="(tag, index) in block.tags" :key="index">{{ tag }}</text>
            </view>

            <view v-else-if="block.text" class="plain-block">
              <text class="detail-value">{{ block.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section meta-section">
        <text class="section-title">记录信息</text>
        <view class="detail-list">
          <view class="detail-item">
            <text class="detail-key">报告ID</text>
            <view class="detail-value-wrap">
              <text class="detail-value">{{ report.reportId }}</text>
            </view>
          </view>
          <view class="detail-item" v-if="report.vehicleVin">
            <text class="detail-key">VIN</text>
            <view class="detail-value-wrap">
              <text class="detail-value">{{ report.vehicleVin }}</text>
            </view>
          </view>
          <view class="detail-item" v-if="report.updatedAt">
            <text class="detail-key">更新时间</text>
            <view class="detail-value-wrap">
              <text class="detail-value">{{ formatTime(report.updatedAt) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view
        class="hero-actions"
        style="position: fixed; left: 24rpx; right: 24rpx; bottom: calc(24rpx + env(safe-area-inset-bottom)); z-index: 240; margin-top: 0"
      >
        <view class="hero-action-button hero-action-primary" @click="handleContact">
          <text class="hero-action-text hero-action-text-primary">{{ '\u5728\u7ebf\u8054\u7cfb' }}</text>
        </view>
        <view class="hero-action-button hero-action-secondary" @click="toggleFavorite">
          <text class="hero-action-text hero-action-text-secondary">{{ isFavorite ? '\u5df2\u6536\u85cf' : '\u6536\u85cf' }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { buildApiUrl, request } from '../../utils/api'
import { goBackOrFallback, openPage } from '../../utils/navigation'
import Timeline from '../../components/report/Timeline.vue'
import ProgressBar from '../../components/report/ProgressBar.vue'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'
const FAVORITES_STORAGE_KEY = 'favoriteReports'

export default {
  components: {
    Timeline,
    ProgressBar
  },
  data() {
    return {
      reportId: '',
      report: null,
      loading: true,
      error: '',
      isFavorite: false
    }
  },
  computed: {
    reportSchema() {
      return (this.report && this.report.aiReportSchema) || {}
    },
    structuredReport() {
      return (this.report && this.report.structuredReport) || this.reportSchema['结构化报告'] || this.reportSchema.structuredReport || {}
    },
    reportTitle() {
      const hero = this.reportSchema['首屏'] || this.reportSchema.hero || {}
      return (this.report && this.report.title) || hero['标题'] || hero.title || this.reportSchema['页面标题'] || this.reportSchema.pageTitle || '车辆详情'
    },
    reportSubtitle() {
      return this.reportSchema['报告副标题'] || this.reportSchema.reportSubtitle || (this.report && this.report.description) || ''
    },
    reportSummary() {
      return this.reportSchema['摘要'] || this.reportSchema.summary || (this.report && this.report.description) || ''
    },
    imageList() {
      return this.normalizeImageList(this.report && this.report.imageUrls)
    },
    priceText() {
      if (!this.report || this.report.sellerPrice === undefined || this.report.sellerPrice === null || this.report.sellerPrice === '') {
        return ''
      }
      return `¥${this.report.sellerPrice}万`
    },
    tradeTypeText() {
      return this.formatTradeType(this.report && this.report.tradeType)
    },
    basicInfoRows() {
      const source = this.structuredReport['基本信息'] || this.structuredReport.basicInfo || (this.report && this.report.basicInfo)
      return source ? this.normalizeBasicInfoRows(source) : []
    },
    structuredSections() {
      const sectionDefs = [
        { key: 'appearanceInspection', label: '外观检测', summaryField: 'conclusion' },
        { key: 'interiorInspection', label: '内饰检测' },
        { key: 'mechanicalPerformance', label: '机械性能' },
        { key: 'maintenanceHistory', label: '维修保养' },
        { key: 'overallEvaluation', label: '综合评价' }
      ]
      const sectionAliases = {
        appearanceInspection: ['外观检测', 'appearanceInspection'],
        interiorInspection: ['内饰检测', 'interiorInspection'],
        mechanicalPerformance: ['机械性能', 'mechanicalPerformance'],
        maintenanceHistory: ['维修历史', 'maintenanceHistory'],
        overallEvaluation: ['综合评价', 'overallEvaluation']
      }
      return sectionDefs.map((section) => {
        const source = (sectionAliases[section.key] || [section.key]).map((key) => this.structuredReport[key]).find(Boolean)
        if (!source) {
          return null
        }
        if (section.key === 'maintenanceHistory') {
          const maintenanceView = this.buildMaintenanceHistoryView(source)
          if (!maintenanceView) {
            return null
          }
          return {
            key: section.key,
            label: section.label,
            summary: '',
            blocks: [],
            maintenanceView
          }
        }
        const summaryValue = source['结论'] || source[section.summaryField]
        const summary = section.summaryField && summaryValue ? String(summaryValue) : ''
        const content = section.summaryField ? this.omitField(source, source['结论'] ? '结论' : section.summaryField) : source
        const blocks = this.normalizeStructuredBlocks(content)
        if (!summary && !blocks.length) {
          return null
        }
        return {
          key: section.key,
          label: section.label,
          summary,
          blocks
        }
      }).filter(Boolean)
    }
  },
  onLoad(options) {
    this.reportId = options.reportId || ''
    if (!this.reportId) {
      this.loading = false
      this.error = '缺少 reportId'
      return
    }
    this.initFavoriteStatus()
    this.loadDetail()
  },
  methods: {
    goBack() {
      goBackOrFallback('/pages/index/index')
    },
    loadDetail() {
      this.loading = true
      this.error = ''
      request({
        url: `/api/ai/report/detail?reportId=${this.reportId}`,
        method: 'GET',
        success: (res) => {
          this.loading = false
          const payload = res.data || {}
          if (payload.code === 200 && payload.data) {
            this.report = payload.data
            return
          }
          this.error = payload.message || '详情加载失败'
        },
        fail: () => {
          this.loading = false
          this.error = '详情加载失败'
        }
      })
    },
    initFavoriteStatus() {
      const favorites = this.getFavoriteReportIds()
      this.isFavorite = favorites.includes(String(this.reportId))
    },
    getFavoriteReportIds() {
      const stored = uni.getStorageSync(FAVORITES_STORAGE_KEY)
      if (!stored) {
        return []
      }
      if (Array.isArray(stored)) {
        return stored.map((item) => String(item)).filter(Boolean)
      }
      if (typeof stored === 'string') {
        try {
          const parsed = JSON.parse(stored)
          return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : []
        } catch (error) {
          return []
        }
      }
      return []
    },
    saveFavoriteReportIds(ids) {
      uni.setStorageSync(FAVORITES_STORAGE_KEY, ids)
    },
    toggleFavorite() {
      const reportId = String(this.reportId || '')
      if (!reportId) {
        return
      }
      const favorites = this.getFavoriteReportIds()
      if (favorites.includes(reportId)) {
        this.saveFavoriteReportIds(favorites.filter((item) => item !== reportId))
        this.isFavorite = false
        uni.showToast({ title: '\u5df2\u53d6\u6d88\u6536\u85cf', icon: 'none' })
        return
      }
      this.saveFavoriteReportIds([...favorites, reportId])
      this.isFavorite = true
      uni.showToast({ title: '\u5df2\u52a0\u5165\u6536\u85cf', icon: 'none' })
    },
    handleContact() {
      openPage('/pages/message/message')
    },
    normalizeImageList(images) {
      if (!Array.isArray(images)) {
        return [FALLBACK_IMAGE]
      }
      const list = images.map((image) => {
        if (typeof image !== 'string' || !image) {
          return ''
        }
        if (image.startsWith('http') || image.startsWith('blob:') || image.startsWith('data:')) {
          return image
        }
        return buildApiUrl(image)
      }).filter(Boolean)
      return list.length ? list : [FALLBACK_IMAGE]
    },
    formatTradeType(tradeType) {
      if (tradeType === 'offline') {
        return '线下看车'
      }
      if (tradeType === 'online') {
        return '在线议价'
      }
      return ''
    },
    formatTime(value) {
      if (!value) {
        return ''
      }
      return String(value).replace('T', ' ').slice(0, 16)
    },
    omitField(source, field) {
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        return source
      }
      const next = { ...source }
      delete next[field]
      return next
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
      const labelMap = {
        vehicleName: '车辆名称',
        tradeType: '交易类型',
        otherInfo: '其余基础信息',
        vin: 'VIN'
      }
      return labelMap[label] !== undefined ? labelMap[label] : label
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
      return {
        title: source.title || '维修保养历史',
        intro: source.summary || source.description || '',
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
.page {
  min-height: 100vh;
  padding-bottom: 80rpx;
  background: linear-gradient(180deg, #f3f7fb 0%, #edf3f8 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: calc(24rpx + var(--status-bar-height)) 24rpx 20rpx;
}

.nav-back {
  font-size: 28rpx;
  color: var(--c-primary);
}

.nav-center {
  flex: 1;
  min-width: 0;
}

.nav-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-text);
}

.nav-subtitle,
.helper-text {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--c-muted);
}

.section {
  margin: 0 24rpx 24rpx;
  padding: 28rpx;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 24rpx;
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.08);
}

.hero-card {
  background: linear-gradient(135deg, rgba(227, 238, 247, 0.98) 0%, rgba(247, 250, 252, 0.96) 100%);
}

.hero-title,
.section-title,
.block-title {
  color: var(--c-text);
  font-weight: 700;
}

.hero-title {
  display: block;
  font-size: 42rpx;
  line-height: 1.22;
}

.hero-price {
  display: block;
  margin-top: 16rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--c-primary);
}

.hero-pill {
  display: inline-flex;
  margin-top: 18rpx;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: var(--c-primary);
  font-size: 22rpx;
  font-weight: 600;
}

.hero-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 22rpx;
  flex-wrap: wrap;
}

.hero-action-button {
  min-width: 180rpx;
  padding: 16rpx 26rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.hero-action-primary {
  background: var(--c-primary);
  box-shadow: 0 10rpx 24rpx rgba(15, 118, 110, 0.22);
}

.hero-action-secondary {
  background: rgba(255, 255, 255, 0.82);
  border: 1rpx solid rgba(15, 23, 42, 0.08);
}

.hero-action-text {
  font-size: 24rpx;
  font-weight: 700;
}

.hero-action-text-primary {
  color: #ffffff;
}

.hero-action-text-secondary {
  color: var(--c-text);
}

.hero-subtitle {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--c-muted);
}

.section-title {
  display: block;
  font-size: 30rpx;
}

.summary-text,
.detail-value {
  font-size: 26rpx;
  line-height: 1.8;
  color: var(--c-text);
}

.image-scroll {
  width: 100%;
  margin-top: 18rpx;
}

.image-row {
  display: inline-flex;
  gap: 18rpx;
}

.detail-image {
  width: 280rpx;
  height: 188rpx;
  border-radius: 20rpx;
  background: rgba(148, 163, 184, 0.16);
}

.detail-list,
.block-list {
  margin-top: 18rpx;
  display: grid;
  gap: 12rpx;
}

.detail-item {
  display: grid;
  grid-template-columns: 168rpx minmax(0, 1fr);
  align-items: start;
  column-gap: 20rpx;
  row-gap: 10rpx;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.82);
}

.detail-key,
.detail-note {
  color: var(--c-muted);
  font-size: 24rpx;
  line-height: 1.6;
}

.detail-value-wrap {
  min-width: 0;
}

.detail-value {
  display: block;
  word-break: break-all;
}

.detail-note {
  display: block;
  margin-top: 6rpx;
}

.report-card {
  padding: 24rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.08);
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(230, 240, 246, 0.92) 0%, #ffffff 100%);
}

.report-card-head {
  margin-bottom: 14rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-chip {
  padding: 10rpx 18rpx;
  background: var(--c-primary-soft);
  color: var(--c-primary);
  border-radius: 999rpx;
  font-size: 24rpx;
}

.plain-block {
  padding-top: 6rpx;
}

.maintenance-panel + .maintenance-panel,
.maintenance-panel + .maintenance-detail-list {
  margin-top: 24rpx;
}

.error-card {
  background: #fff7ed;
}

.error-text {
  color: #c2410c;
  font-size: 24rpx;
  line-height: 1.7;
}
</style>
