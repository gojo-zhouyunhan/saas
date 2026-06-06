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
      <view class="report-shell">
        <BusinessReportView
          :schema="reportSchema"
          :structured-report-data="structuredReport"
          :images="imageList"
          :report-id="report.reportId"
          :vehicle-vin="report.vehicleVin || ''"
          :updated-at="report.updatedAt || ''"
          :price-text="priceText"
          :trade-type-text="tradeTypeText"
          :title-fallback="report.title || '车辆详情'"
          :subtitle-fallback="report.description || ''"
          :summary-fallback="report.description || ''"
          :original-hero-image="true"
        />
      </view>

      <view class="bottom-actions">
        <view class="hero-actions bottom-actions-inner">
          <view class="hero-action-button hero-action-primary hero-action-contact" :class="{ disabled: isOwnReport }" @click="handleContact">
            <text class="hero-action-text hero-action-text-primary">和商家沟通</text>
          </view>
          <view class="hero-action-button hero-action-secondary" :class="{ disabled: isOwnReport }" @click="toggleFavorite">
            <uni-icons :type="isFavorite ? 'star-filled' : 'star'" size="30" :color="favoriteIconColor"></uni-icons>
          </view>
        </view>
      </view>
    </template>

  </view>
</template>

<script>
import { buildApiUrl, request } from '../../utils/api'
import { goBackOrFallback, openPage } from '../../utils/navigation'
import { getBackendFieldLabel, getBackendSectionLabel } from '../../utils/field-label'
import Timeline from '../../components/report/Timeline.vue'
import ProgressBar from '../../components/report/ProgressBar.vue'
import BusinessReportView from '../../components/report/BusinessReportView.vue'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'
const FAVORITES_STORAGE_KEY = 'favoriteReports'

export default {
  components: {
    Timeline,
    ProgressBar,
    BusinessReportView
  },
  data() {
    return {
      reportId: '',
      report: null,
      loading: true,
      error: '',
      isFavorite: false,
      currentUserId: ''
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
    isOwnReport() {
      return this.sameUserId(this.currentUserId, this.report && this.report.userId)
    },
    favoriteIconColor() {
      if (this.isOwnReport) {
        return 'var(--c-muted)'
      }
      return this.isFavorite ? 'var(--c-primary)' : 'var(--c-text)'
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
    this.currentUserId = this.getCurrentUserId()
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
            this.removeOwnReportFavoriteIfNeeded()
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
    removeOwnReportFavoriteIfNeeded() {
      if (!this.isOwnReport) {
        return
      }
      const reportId = String(this.reportId || '')
      const favorites = this.getFavoriteReportIds()
      if (favorites.includes(reportId)) {
        this.saveFavoriteReportIds(favorites.filter((item) => item !== reportId))
      }
      this.isFavorite = false
    },
    toggleFavorite() {
      if (this.isOwnReport) {
        this.showToast('不能收藏自己的车源')
        return
      }
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
      if (this.isOwnReport) {
        this.showToast('不能和自己的车源沟通')
        return
      }
      openPage('/pages/message/message')
    },
    getCurrentUserId() {
      const storedUser = uni.getStorageSync('user')
      if (!storedUser) {
        return ''
      }
      try {
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser
        const user = parsedUser.user || parsedUser.userInfo || parsedUser
        const userId = user.userId || user.id || user.uid || user.number || user.userNo
        return userId === undefined || userId === null ? '' : String(userId)
      } catch (error) {
        return ''
      }
    },
    sameUserId(left, right) {
      if (left === undefined || left === null || right === undefined || right === null) {
        return false
      }
      return String(left) === String(right)
    },
    showToast(title) {
      uni.showToast({ title, icon: 'none' })
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
.page {
  min-height: 100vh;
  padding-bottom: 170rpx;
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

.report-shell {
  margin: 0 24rpx 24rpx;
}

.hero-card {
  background: linear-gradient(135deg, rgba(227, 238, 247, 0.98) 0%, rgba(247, 250, 252, 0.96) 100%);
}

.gallery-section {
  padding: 0;
  overflow: hidden;
}

.gallery-swiper {
  width: 100%;
  height: 520rpx;
}

.gallery-image {
  width: 100%;
  height: 100%;
  background: rgba(148, 163, 184, 0.16);
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

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: rgba(243, 247, 251, 0.96);
  box-shadow: 0 -10rpx 28rpx rgba(15, 23, 42, 0.08);
}

.bottom-actions-inner {
  margin-top: 0;
  justify-content: center;
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

.hero-action-button.disabled {
  opacity: 0.48;
}

.hero-action-primary {
  background: var(--c-primary);
  box-shadow: 0 10rpx 24rpx rgba(15, 118, 110, 0.22);
}

.hero-action-contact {
  min-width: 260rpx;
  padding: 22rpx 42rpx;
}

.hero-action-contact .hero-action-text {
  font-size: 28rpx;
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
