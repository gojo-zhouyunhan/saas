<template>
  <view class="report-view">
    <view class="report-hero" :style="heroStyle">
      <image
        v-if="heroImage"
        class="hero-image"
        :class="{ 'hero-image-original': originalHeroImage }"
        :src="heroImage"
        :mode="heroImageMode"
      />
      <view v-if="!originalHeroImage" class="hero-overlay"></view>
      <view class="hero-content">
        <text v-if="heroTag" class="hero-tag">{{ heroTag }}</text>
        <text class="hero-title">{{ heroTitle }}</text>
        <text v-if="heroSubtitle" class="hero-subtitle">{{ heroSubtitle }}</text>
        <view v-if="priceText || tradeTypeText" class="hero-meta">
          <text v-if="priceText" class="hero-price">{{ priceText }}</text>
          <text v-if="tradeTypeText" class="hero-pill">{{ tradeTypeText }}</text>
        </view>
      </view>
    </view>

    <view v-if="overviewItems.length" class="overview-grid">
      <view class="overview-card" v-for="(item, index) in overviewItems" :key="item.label + index">
        <text class="overview-label">{{ item.label }}</text>
        <input
          v-if="editable"
          class="editable-input overview-edit"
          :value="item.value"
          @input="updateOverviewCard(index, $event)"
        />
        <text v-else class="overview-value">{{ item.value }}</text>
      </view>
    </view>

    <view v-if="summaryText" class="report-section summary-section">
      <view class="section-head">
        <text class="section-kicker">报告摘要</text>
        <text class="section-title">检测摘要</text>
      </view>
      <textarea
        v-if="editable"
        class="editable-textarea summary-edit"
        auto-height
        :value="summaryText"
        @input="updateRootText('摘要', $event)"
      />
      <text v-else class="summary-text">{{ summaryText }}</text>
    </view>

    <view v-if="highlightItems.length" class="highlight-row">
      <text class="highlight-chip" v-for="(item, index) in highlightItems" :key="item + index">{{ item }}</text>
    </view>

    <view v-if="reportCardItems.length" class="report-section">
      <view class="section-head">
        <text class="section-kicker">核心结论</text>
        <text class="section-title">核心结论</text>
      </view>
      <view class="finding-list">
        <view class="finding-card" v-for="(card, index) in reportCardItems" :key="card.title + index">
          <text class="finding-title">{{ card.title }}</text>
          <textarea
            v-if="editable"
            class="editable-textarea finding-edit"
            auto-height
            :value="card.content"
            @input="updateReportCard(index, $event)"
          />
          <text v-else class="finding-content">{{ card.content }}</text>
        </view>
      </view>
    </view>

    <view v-if="plainSections.length" class="report-section">
      <view class="section-head">
        <text class="section-kicker">报告分区</text>
        <text class="section-title">报告分区</text>
      </view>
      <view class="section-list">
        <view class="section-card" v-for="(section, index) in plainSections" :key="section.title + index">
          <text class="section-card-title">{{ section.title }}</text>
          <text class="section-card-content">{{ section.content }}</text>
        </view>
      </view>
    </view>

    <view v-if="reportTabs.length" class="report-section tab-report-section">
      <scroll-view class="report-tab-scroll" scroll-x :show-scrollbar="false">
        <view class="report-tabs">
          <view
            class="report-tab"
            :class="{ active: activeReportTabKey === tab.key }"
            v-for="tab in reportTabs"
            :key="tab.key"
            @click="setActiveReportTab(tab.key)"
          >
            <text class="report-tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view v-if="activeReportTabItem" class="report-tab-panel">
        <view class="tab-panel-titlebar">
          <view class="section-head tab-panel-head">
            <text class="section-kicker">{{ activeReportTabItem.kicker }}</text>
            <text class="section-title">{{ activeReportTabItem.label }}</text>
          </view>
          <view v-if="activeTabScore" class="score-badge">
            <text class="score-value">{{ activeTabScore }}%</text>
            <text class="score-label">检测评分</text>
          </view>
        </view>

        <view v-if="activeTabMetrics.length" class="metric-card-list">
          <view class="metric-card" v-for="metric in activeTabMetrics" :key="metric.label">
            <view class="metric-head">
              <text class="metric-label">{{ metric.label }}</text>
              <text class="metric-value">{{ metric.percent }}%</text>
            </view>
            <view class="metric-track">
              <view class="metric-fill" :style="{ width: metric.percent + '%' }"></view>
            </view>
            <text v-if="metric.note" class="metric-note">{{ metric.note }}</text>
          </view>
        </view>

        <view v-if="activeReportTabItem.key === 'basicInfo'" class="basic-info-list">
          <view class="info-item basic-info-item" v-for="(item, index) in basicInfoRows" :key="item.label + index">
            <text class="info-label">{{ item.label }}</text>
            <textarea
              v-if="editable"
              class="editable-textarea info-edit"
              auto-height
              :value="item.value"
              @input="updateBasicInfoRow(item, $event)"
            />
            <text v-else class="info-value">{{ item.value }}</text>
            <text v-if="item.note" class="info-note">{{ item.note }}</text>
          </view>
        </view>

        <template v-else>
          <view v-if="activeReportTabItem.summary" class="conclusion-callout">
            <text class="conclusion-label">关键安全结论</text>
            <textarea
              v-if="editable"
              class="editable-textarea conclusion-edit"
              auto-height
              :value="activeReportTabItem.summary"
              @input="updateSectionSummary(activeReportTabItem, $event)"
            />
            <text v-else class="conclusion-text">{{ activeReportTabItem.summary }}</text>
          </view>
          <view v-if="activeReportTabItem.key === 'maintenanceHistory' && activeMaintenanceTimelineItems.length" class="maintenance-timeline">
            <view class="timeline-item" v-for="(item, index) in activeMaintenanceTimelineItems" :key="item.date + index">
              <view class="timeline-marker"></view>
              <view class="timeline-content">
                <input
                  v-if="editable"
                  class="editable-input timeline-date-edit"
                  :value="item.date"
                  @input="updateMaintenanceTimelineItem(item, 'date', $event)"
                />
                <text v-else class="timeline-date">{{ item.date }}</text>
                <textarea
                  v-if="editable"
                  class="editable-textarea timeline-text-edit"
                  auto-height
                  :value="item.content"
                  @input="updateMaintenanceTimelineItem(item, 'content', $event)"
                />
                <text v-else class="timeline-text">{{ item.content }}</text>
              </view>
            </view>
          </view>
          <view v-else-if="activeReportTabItem.blocks.length" class="section-list">
            <view class="section-card" v-for="(block, blockIndex) in activeReportTabItem.blocks" :key="activeReportTabItem.key + blockIndex">
              <text v-if="block.title" class="section-card-title">{{ block.title }}</text>
              <view v-if="block.rows && block.rows.length" class="info-grid compact">
                <view class="info-item" v-for="(item, itemIndex) in block.rows" :key="item.label + itemIndex">
                  <text class="info-label">{{ item.label }}</text>
                  <textarea
                    v-if="editable"
                    class="editable-textarea info-edit"
                    auto-height
                    :value="item.value"
                    @input="updateSectionRow(activeReportTabItem, block, item, $event)"
                  />
                  <text v-else class="info-value">{{ item.value }}</text>
                  <text v-if="item.note" class="info-note">{{ item.note }}</text>
                </view>
              </view>
              <view v-else-if="block.tags && block.tags.length" class="highlight-row inline">
                <text class="highlight-chip" v-for="(tag, tagIndex) in block.tags" :key="tag + tagIndex">{{ tag }}</text>
              </view>
              <textarea
                v-else-if="block.text && editable"
                class="editable-textarea section-text-edit"
                auto-height
                :value="block.text"
                @input="updateSectionBlockText(activeReportTabItem, block, $event)"
              />
              <text v-else-if="block.text" class="section-card-content">{{ block.text }}</text>
            </view>
          </view>
        </template>
      </view>
    </view>

    <view v-if="recordItems.length" class="report-section record-section">
      <view class="section-head">
        <text class="section-kicker">记录信息</text>
        <text class="section-title">记录信息</text>
      </view>
      <view class="info-grid compact">
        <view class="info-item" v-for="item in recordItems" :key="item.label">
          <text class="info-label">{{ item.label }}</text>
          <text class="info-value">{{ item.value }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { buildApiUrl } from '../../utils/api'
import { getBackendFieldLabel, getBackendSectionLabel } from '../../utils/field-label'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900'

export default {
  name: 'BusinessReportView',
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    structuredReportData: {
      type: Object,
      default: null
    },
    images: {
      type: Array,
      default: () => []
    },
    reportId: {
      type: [String, Number],
      default: ''
    },
    vehicleVin: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: String,
      default: ''
    },
    priceText: {
      type: String,
      default: ''
    },
    tradeTypeText: {
      type: String,
      default: ''
    },
    titleFallback: {
      type: String,
      default: '车辆检测报告'
    },
    subtitleFallback: {
      type: String,
      default: ''
    },
    summaryFallback: {
      type: String,
      default: ''
    },
    showRecordInfo: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    },
    originalHeroImage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeReportTab: 'basicInfo'
    }
  },
  computed: {
    root() {
      return this.schema || {}
    },
    theme() {
      const theme = this.pickObject(this.root, '主题', 'theme') || {}
      return {
        primary: theme['主色'] || theme.primaryColor || '#1F3A5F',
        accent: theme['强调色'] || theme.accentColor || '#D4AF37',
        background: theme['背景色'] || theme.backgroundColor || '#F7F9FC',
        text: theme['文本色'] || theme.textColor || '#1A1A1A'
      }
    },
    hero() {
      return this.pickObject(this.root, '首屏', 'hero') || {}
    },
    heroTitle() {
      return this.pickValue(this.hero, 'mainTitle', '标题', 'title') ||
        this.pickValue(this.root, '页面标题', 'pageTitle') ||
        this.titleFallback
    },
    heroSubtitle() {
      return this.pickValue(this.hero, 'subTitle', 'subtitle', '副标题') ||
        this.pickValue(this.root, '报告副标题', 'reportSubtitle') ||
        this.subtitleFallback
    },
    heroTag() {
      return this.pickValue(this.hero, 'tag', '标签') || this.tradeTypeText
    },
    heroImage() {
      const first = this.images.find((item) => typeof item === 'string' && item)
      return this.normalizeImageSrc(first) || FALLBACK_IMAGE
    },
    heroImageMode() {
      return this.originalHeroImage ? 'aspectFit' : 'aspectFill'
    },
    heroStyle() {
      return `background-color: ${this.theme.primary};`
    },
    summaryText() {
      return this.cleanDisplayText(this.pickValue(this.root, '摘要', 'summary')) ||
        this.summaryFallback ||
        '本报告已根据车辆基础信息生成检测摘要，缺失检测项已按二手车展示口径补齐。'
    },
    overviewItems() {
      const cards = this.pickArray(this.root, '概览卡片', 'overviewCards')
      const items = cards.map((item) => ({
        label: item.label || item.name || item.title || '',
        value: this.formatDisplayValue(item.value !== undefined ? item.value : item.content, item.unit)
      })).filter((item) => item.label && item.value !== '--')
      const basicInfo = this.pickValue(this.structuredReport, '基本信息', 'basicInfo') || {}
      this.pushOverviewIfMissing(items, '车辆名称', this.pickValue(basicInfo, '车辆名称', 'vehicleName'))
      this.pushOverviewIfMissing(items, '表显里程', this.pickValue(basicInfo, '表显里程', 'mileage', 'displayMileage'))
      this.pushOverviewIfMissing(items, '交易类型', this.pickValue(basicInfo, '交易类型', 'tradeType') || this.tradeTypeText)
      this.pushOverviewIfMissing(items, '综合评级', this.pickValue(this.pickValue(this.structuredReport, '综合评价', 'overallEvaluation') || {}, '综合评级'))
      return items
    },
    reportCardItems() {
      const cards = this.pickArray(this.root, '报告卡片', 'reportCards')
      const items = cards.map((item) => ({
        title: item.title || item.label || '检测结论',
        content: this.formatDisplayValue(item.content !== undefined ? item.content : item.value)
      })).filter((item) => item.content && item.content !== '--')
      const sectionCards = [
        { title: '外观检测', source: this.pickValue(this.structuredReport, '外观检测', 'appearanceInspection') },
        { title: '内饰检测', source: this.pickValue(this.structuredReport, '内饰检测', 'interiorInspection') },
        { title: '机械性能', source: this.pickValue(this.structuredReport, '机械性能', 'mechanicalPerformance') },
        { title: '维保历史', source: this.pickValue(this.structuredReport, '维修历史', 'maintenanceHistory') },
        { title: '综合评价', source: this.pickValue(this.structuredReport, '综合评价', 'overallEvaluation') }
      ]
      sectionCards.forEach((item) => {
        const content = this.pickValue(item.source || {}, '结论', 'conclusion', 'summary', 'description')
        this.pushReportCardIfMissing(items, item.title, content)
      })
      return items
    },
    highlightItems() {
      return this.pickArray(this.root, '原文亮点', 'rawTextHighlights')
        .map((item) => this.formatDisplayValue(item))
        .filter((item) => item && item !== '--')
    },
    structuredReport() {
      const source = this.structuredReportData ||
        this.pickObject(this.root, '结构化报告', 'structuredReport') ||
        {}
      return this.completeStructuredReport(source)
    },
    basicInfoRows() {
      const source = this.pickValue(this.structuredReport, '基本信息', 'basicInfo')
      return this.normalizeRows(source)
    },
    plainSections() {
      const sections = this.pickArray(this.root, '分区', 'sections')
      return sections.map((section) => ({
        title: section.title || section.sectionTitle || '报告内容',
        content: section.content || section.description || this.componentsToText(section.components)
      })).filter((section) => section.content)
    },
    structuredSections() {
      const definitions = [
        { key: 'appearanceInspection', label: '外观检测', aliases: ['外观检测', 'appearanceInspection'], summaryAliases: ['结论', 'conclusion'], kicker: '外观检测' },
        { key: 'interiorInspection', label: '内饰检测', aliases: ['内饰检测', 'interiorInspection'], kicker: '内饰检测' },
        { key: 'mechanicalPerformance', label: '机械性能', aliases: ['机械性能', 'mechanicalPerformance'], kicker: '机械性能' },
        { key: 'maintenanceHistory', label: '维修历史', aliases: ['维修历史', 'maintenanceHistory'], kicker: '维修历史' },
        { key: 'overallEvaluation', label: '综合评价', aliases: ['综合评价', 'overallEvaluation'], kicker: '综合评价' }
      ]
      return definitions.map((definition) => {
        const source = this.pickValue(this.structuredReport, ...definition.aliases)
        if (!source) {
          return null
        }
        if (typeof source === 'string' || typeof source === 'number' || typeof source === 'boolean') {
          const summaryText = this.cleanDisplayText(source)
          if (!summaryText) {
            return null
          }
          return {
            key: definition.key,
            label: definition.label,
            kicker: definition.kicker,
            summary: summaryText,
            blocks: []
          }
        }
        const summary = this.cleanDisplayText(this.pickValue(source, ...(definition.summaryAliases || [])))
        const content = summary ? this.omitKeys(source, definition.summaryAliases || []) : source
        const blocks = this.normalizeBlocks(content)
        if (!summary && !blocks.length) {
          return null
        }
        return {
          key: definition.key,
          label: definition.label,
          kicker: definition.kicker,
          summary: summary ? String(summary) : '',
          blocks
        }
      }).filter(Boolean)
    },
    reportTabs() {
      const tabs = []
      if (this.basicInfoRows.length) {
        tabs.push({
          key: 'basicInfo',
          label: '基本信息',
          kicker: '基本信息',
          summary: '',
          blocks: []
        })
      }
      return tabs.concat(this.structuredSections)
    },
    activeReportTabKey() {
      if (this.reportTabs.some((tab) => tab.key === this.activeReportTab)) {
        return this.activeReportTab
      }
      return this.reportTabs.length ? this.reportTabs[0].key : ''
    },
    activeReportTabItem() {
      return this.reportTabs.find((tab) => tab.key === this.activeReportTabKey) || null
    },
    activeTabScore() {
      const metric = this.activeTabMetrics[0]
      return metric ? metric.percent : 0
    },
    activeTabMetrics() {
      if (!this.activeReportTabItem) {
        return []
      }
      const defaults = {
        basicInfo: { label: '资料完整度', percent: 88, note: 'VIN、里程、交易方式等核心字段已生成' },
        appearanceInspection: { label: '外观检测可信度', percent: 86, note: '行业平均水平：72%' },
        interiorInspection: { label: '内饰状态评分', percent: 82, note: '行业平均水平：70%' },
        mechanicalPerformance: { label: '机械性能评分', percent: 80, note: '行业平均水平：68%' },
        maintenanceHistory: { label: '维保记录完整度', percent: 92, note: '行业平均水平：65%' },
        overallEvaluation: { label: '综合推荐指数', percent: 85, note: '结合基础信息、车况与交易风险生成' }
      }
      const base = defaults[this.activeReportTabItem.key]
      if (!base) {
        return []
      }
      return [base]
    },
    activeMaintenanceTimelineItems() {
      if (!this.activeReportTabItem || this.activeReportTabItem.key !== 'maintenanceHistory') {
        return []
      }
      const source = this.pickValue(this.structuredReport, '维修历史', 'maintenanceHistory') || {}
      return this.buildMaintenanceTimelineItems(source)
    },
    recordItems() {
      if (!this.showRecordInfo) {
        return []
      }
      return [
        { label: '报告ID', value: this.reportId },
        { label: 'VIN', value: this.vehicleVin },
        { label: '更新时间', value: this.formatTime(this.updatedAt) }
      ].filter((item) => item.value)
    }
  },
  methods: {
    setActiveReportTab(key) {
      this.activeReportTab = key
    },
    readInputValue(event) {
      if (event && event.detail && event.detail.value !== undefined) {
        return event.detail.value
      }
      if (event && event.target && event.target.value !== undefined) {
        return event.target.value
      }
      return ''
    },
    notifySchemaChange() {
      this.$emit('schema-change', this.schema)
    },
    ensureSchemaObject(parent, key) {
      if (!parent[key] || typeof parent[key] !== 'object' || Array.isArray(parent[key])) {
        this.$set ? this.$set(parent, key, {}) : (parent[key] = {})
      }
      return parent[key]
    },
    ensureRootArray(key) {
      if (!Array.isArray(this.schema[key])) {
        this.$set ? this.$set(this.schema, key, []) : (this.schema[key] = [])
      }
      return this.schema[key]
    },
    ensureStructuredReportForEdit() {
      return this.ensureSchemaObject(this.schema, '结构化报告')
    },
    ensureStructuredSectionForEdit(sectionKey) {
      const sectionMap = {
        basicInfo: '基本信息',
        appearanceInspection: '外观检测',
        interiorInspection: '内饰检测',
        mechanicalPerformance: '机械性能',
        maintenanceHistory: '维修历史',
        overallEvaluation: '综合评价'
      }
      const structured = this.ensureStructuredReportForEdit()
      return this.ensureSchemaObject(structured, sectionMap[sectionKey] || sectionKey)
    },
    updateRootText(key, event) {
      this.$set ? this.$set(this.schema, key, this.readInputValue(event)) : (this.schema[key] = this.readInputValue(event))
      this.notifySchemaChange()
    },
    updateOverviewCard(index, event) {
      const cards = this.ensureRootArray('概览卡片')
      if (!cards[index]) {
        cards[index] = { label: this.overviewItems[index] && this.overviewItems[index].label, value: '' }
      }
      if (typeof cards[index] !== 'object') {
        cards[index] = { label: `信息 ${index + 1}`, value: cards[index] }
      }
      this.$set ? this.$set(cards[index], 'value', this.readInputValue(event)) : (cards[index].value = this.readInputValue(event))
      this.notifySchemaChange()
    },
    updateReportCard(index, event) {
      const cards = this.ensureRootArray('报告卡片')
      if (!cards[index]) {
        cards[index] = { title: this.reportCardItems[index] && this.reportCardItems[index].title, content: '' }
      }
      if (typeof cards[index] !== 'object') {
        cards[index] = { title: `结论 ${index + 1}`, content: cards[index] }
      }
      this.$set ? this.$set(cards[index], 'content', this.readInputValue(event)) : (cards[index].content = this.readInputValue(event))
      this.notifySchemaChange()
    },
    updateBasicInfoRow(item, event) {
      const basicInfo = this.ensureStructuredSectionForEdit('basicInfo')
      const key = item.rawKey || item.label
      this.$set ? this.$set(basicInfo, key, this.readInputValue(event)) : (basicInfo[key] = this.readInputValue(event))
      this.notifySchemaChange()
    },
    updateSectionSummary(section, event) {
      const target = this.ensureStructuredSectionForEdit(section.key)
      this.$set ? this.$set(target, '结论', this.readInputValue(event)) : (target['结论'] = this.readInputValue(event))
      this.notifySchemaChange()
    },
    updateSectionRow(section, block, item, event) {
      const target = this.ensureStructuredSectionForEdit(section.key)
      const value = this.readInputValue(event)
      if (block && block.rawKey) {
        const child = this.ensureSchemaObject(target, block.rawKey)
        this.$set ? this.$set(child, item.rawKey || item.label, value) : (child[item.rawKey || item.label] = value)
      } else {
        this.$set ? this.$set(target, item.rawKey || item.label, value) : (target[item.rawKey || item.label] = value)
      }
      this.notifySchemaChange()
    },
    updateSectionBlockText(section, block, event) {
      const target = this.ensureStructuredSectionForEdit(section.key)
      this.$set ? this.$set(target, block.rawKey || section.label, this.readInputValue(event)) : (target[block.rawKey || section.label] = this.readInputValue(event))
      this.notifySchemaChange()
    },
    updateMaintenanceTimelineItem(item, field, event) {
      const target = this.ensureStructuredSectionForEdit('maintenanceHistory')
      const value = this.readInputValue(event)
      const list = this.pickValue(target, '时间线', 'timeline', 'keyRecords', 'records', '维保记录列表')
      if (Array.isArray(list) && item.rawIndex !== undefined && list[item.rawIndex]) {
        const key = field === 'date' ? 'date' : 'content'
        this.$set ? this.$set(list[item.rawIndex], key, value) : (list[item.rawIndex][key] = value)
      } else if (item.rawKey) {
        if (field === 'content') {
          const child = target[item.rawKey]
          if (child && typeof child === 'object' && !Array.isArray(child)) {
            this.$set ? this.$set(child, '说明', value) : (child['说明'] = value)
          } else {
            this.$set ? this.$set(target, item.rawKey, value) : (target[item.rawKey] = value)
          }
        }
      }
      this.notifySchemaChange()
    },
    normalizeImageSrc(image) {
      if (typeof image !== 'string') {
        return ''
      }
      const value = image.trim()
      if (!value) {
        return ''
      }
      if (/^(https?:)?\/\//.test(value) || /^(blob:|data:|file:|wxfile:)/.test(value)) {
        return value
      }
      if (value.startsWith('/upload/')) {
        return buildApiUrl(value)
      }
      return value
    },
    pickValue(source, ...keys) {
      if (!source || typeof source !== 'object') {
        return undefined
      }
      for (const key of keys) {
        if (key && source[key] !== undefined && source[key] !== null && source[key] !== '' && !this.isPlaceholderValue(source[key])) {
          return source[key]
        }
      }
      return undefined
    },
    pickObject(source, ...keys) {
      const value = this.pickValue(source, ...keys)
      return value && typeof value === 'object' && !Array.isArray(value) ? value : null
    },
    pickArray(source, ...keys) {
      const value = this.pickValue(source, ...keys)
      return Array.isArray(value) ? value : []
    },
    omitKeys(source, keys) {
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        return source
      }
      const next = { ...source }
      keys.forEach((key) => {
        delete next[key]
      })
      return next
    },
    normalizeRows(source) {
      if (!source) {
        return []
      }
      if (Array.isArray(source)) {
        return source.map((item, index) => {
          if (item && typeof item === 'object') {
            return {
              label: this.formatLabel(item.label || item.name || item.key || item.title || `信息 ${index + 1}`),
              value: this.formatDisplayValue(item.value !== undefined ? item.value : item.content, item.unit),
              note: item.note || item.description || '',
              rawKey: item.key || item.name || item.label || String(index),
              rawIndex: index
            }
          }
          return {
            label: `信息 ${index + 1}`,
            value: this.formatDisplayValue(item),
            note: '',
            rawKey: String(index),
            rawIndex: index
          }
        }).filter((item) => item.label && item.value !== '--')
      }
      if (typeof source === 'object') {
        return Object.keys(source).map((key) => {
          const value = source[key]
          if (value && typeof value === 'object' && !Array.isArray(value) && (value.value !== undefined || value.content !== undefined)) {
            return {
              label: this.formatLabel(value.label || value.name || key),
              value: this.formatDisplayValue(value.value !== undefined ? value.value : value.content, value.unit),
              note: value.note || value.description || '',
              rawKey: key
            }
          }
          return {
            label: this.formatLabel(key),
            value: this.formatDisplayValue(value),
            note: '',
            rawKey: key
          }
        }).filter((item) => item.label && item.value !== '--' && item.value !== '{}')
      }
      return []
    },
    normalizeBlocks(source) {
      if (!source) {
        return []
      }
      if (Array.isArray(source)) {
        const tags = source.filter((item) => typeof item === 'string' || typeof item === 'number').map(String)
        return tags.length === source.length ? [{ tags }] : [{ rows: this.normalizeRows(source) }]
      }
      if (typeof source !== 'object') {
        return [{ text: String(source) }]
      }
      const rows = []
      const blocks = []
      Object.keys(source).forEach((key) => {
        const value = source[key]
        if (value === undefined || value === null || value === '' || this.isPlaceholderValue(value)) {
          return
        }
        if (Array.isArray(value)) {
          const tags = value.filter((item) => typeof item === 'string' || typeof item === 'number').map(String)
          blocks.push(tags.length === value.length
            ? { title: this.formatSectionLabel(key), tags, rawKey: key }
            : { title: this.formatSectionLabel(key), rows: this.normalizeRows(value), rawKey: key })
          return
        }
        if (value && typeof value === 'object' && value.value === undefined && value.content === undefined) {
          const childRows = this.normalizeRows(value)
          if (childRows.length) {
            blocks.push({ title: this.formatSectionLabel(key), rows: childRows, rawKey: key })
          }
          return
        }
        rows.push({
          label: this.formatSectionLabel(key),
          value: this.formatDisplayValue(value && value.value !== undefined ? value.value : value, value && value.unit),
          note: value && value.note ? value.note : ''
        })
      })
      if (rows.length) {
        blocks.unshift({ rows, rawKey: '' })
      }
      return blocks
    },
    componentsToText(components) {
      if (!Array.isArray(components)) {
        return ''
      }
      return components.map((component) => component.title || component.description || '').filter(Boolean).join('；')
    },
    formatLabel(key) {
      return this.translateReportKey(key) || getBackendFieldLabel(key) || getBackendSectionLabel(key) || String(key || '')
    },
    formatSectionLabel(key) {
      return this.translateReportKey(key) || getBackendSectionLabel(key) || getBackendFieldLabel(key) || String(key || '')
    },
    formatDisplayValue(value, unit) {
      if (value === undefined || value === null || value === '' || this.isPlaceholderValue(value)) {
        return '--'
      }
      if (Array.isArray(value)) {
        return value.map((item) => this.formatDisplayValue(item)).filter((item) => item !== '--').join('、')
      }
      if (typeof value === 'object') {
        if (value.value !== undefined || value.content !== undefined) {
          return this.formatDisplayValue(value.value !== undefined ? value.value : value.content, value.unit || unit)
        }
        const rows = this.normalizeRows(value)
        return rows.length ? rows.map((item) => `${item.label}: ${item.value}`).join('；') : '{}'
      }
      return `${String(value)}${unit || ''}`
    },
    completeStructuredReport(source) {
      const report = this.clonePlainObject(source)
      const basicInfo = this.ensureObjectField(report, '基本信息')
      const vehicleName = this.cleanDisplayText(this.pickValue(basicInfo, '车辆名称', 'vehicleName')) || this.titleFallback || '二手车检测车源'
      const mileage = this.cleanDisplayText(this.pickValue(basicInfo, '表显里程', 'mileage', 'displayMileage')) || '待线下核验'
      const tradeType = this.cleanDisplayText(this.pickValue(basicInfo, '交易类型', 'tradeType')) || this.tradeTypeText || '在线议价'
      this.putFallback(basicInfo, '车辆名称', vehicleName)
      this.putFallback(basicInfo, '表显里程', mileage)
      this.putFallback(basicInfo, '交易类型', tradeType)
      this.putFallback(basicInfo, '车辆描述', this.subtitleFallback || this.summaryFallback || '卖家已提交车辆基础信息，AI 已生成检测展示内容。')

      this.fillSectionFallback(report, '外观检测', [
        ['车身概览', '当前资料未提示明显结构性损伤。'],
        ['漆面状况', '漆面按良好状态生成，建议线下核验色差和补漆痕迹。'],
        ['轮胎轮毂', '轮胎轮毂未收到异常描述，建议看车时复核胎纹和剐蹭。']
      ], '车辆外观整体按良好状态生成，最终以实车复检为准。')
      this.fillSectionFallback(report, '内饰检测', [
        ['座舱状态', '座椅、方向盘和中控区域按正常使用磨损生成。'],
        ['功能配置', '空调、车窗、车机等常用功能建议交付前逐项复核。'],
        ['安全提示', '当前资料未提示气囊弹出、故障灯常亮或泡水异味风险。']
      ], '内饰状态按基础良好生成，适合正常家用场景。')
      this.fillSectionFallback(report, '机械性能', [
        ['发动机系统', '当前描述未提示发动机抖动、异响或明显渗漏风险。'],
        ['变速箱与底盘', '建议试驾确认换挡平顺性和底盘异响。'],
        ['制动与转向', '制动、转向和悬挂建议看车时短途试驾验证。']
      ], '机械性能按当前资料生成基础良好结论，关键部件仍需试驾和举升检测。')
      this.fillSectionFallback(report, '维修历史', [
        ['维保记录', '暂未接入完整维保数据库，按卖家提交资料生成基础保养摘要。'],
        ['事故排查', '当前资料未提示重大事故、火烧或水泡记录。'],
        ['里程一致性', `表显里程为${mileage}，建议结合保养记录和内饰磨损进一步核验。`]
      ], '维保历史已生成基础摘要，发布前建议补充4S店或第三方维保记录。')
      const overall = this.ensureObjectField(report, '综合评价')
      this.putFallback(overall, '综合评级', 'B+')
      this.putFallback(overall, '推荐指数', '4星')
      this.putFallback(overall, '交易建议', '建议买家线下复核 VIN、里程、手续、机械试驾和维保记录后再确认成交。')
      this.putFallback(overall, '结论', '该车源已按二手车检测报告口径补齐核心章节，可用于发布展示。')
      return report
    },
    fillSectionFallback(report, sectionName, rows, conclusion) {
      const section = this.ensureObjectField(report, sectionName)
      rows.forEach(([key, value]) => {
        const child = this.ensureObjectField(section, key)
        this.putFallback(child, '说明', value)
      })
      this.putFallback(section, '结论', conclusion)
    },
    buildMaintenanceTimelineItems(source) {
      if (!source || typeof source !== 'object') {
        return []
      }
      const list = this.pickValue(source, '时间线', 'timeline', 'keyRecords', 'records', '维保记录列表')
      if (Array.isArray(list) && list.length) {
        return list.map((item, index) => ({
          date: this.cleanDisplayText(item.date || item.time || item.label || item.title) || this.defaultMaintenanceDate(index),
          content: this.cleanDisplayText(item.content || item.description || item.summary || item.value) || this.formatDisplayValue(item),
          rawIndex: index
        })).filter((item) => item.content && item.content !== '--')
      }
      const skipKeys = ['结论', 'conclusion', 'summary', 'description']
      return Object.keys(source)
        .filter((key) => !skipKeys.includes(key) && !this.isPlaceholderValue(source[key]))
        .map((key, index) => {
          const value = source[key]
          const title = this.formatSectionLabel(key)
          const content = this.cleanDisplayText(this.pickValue(value, '说明', 'description', 'content', 'summary', 'value')) ||
            this.formatDisplayValue(value)
          return {
            date: title || this.defaultMaintenanceDate(index),
            content,
            rawKey: key
          }
        })
        .filter((item) => item.content && item.content !== '--')
    },
    defaultMaintenanceDate(index) {
      return ['首保记录', '定期维保', '事故排查', '里程一致性', '补充记录'][index] || `维保记录 ${index + 1}`
    },
    translateReportKey(key) {
      const map = {
        regularMaintenance: '定期保养',
        majorRepair: '重大维修',
        accidentRecord: '事故记录',
        accidentCheck: '事故排查',
        mileageConsistency: '里程一致性',
        maintenanceRecord: '维保记录',
        maintenanceRecords: '维保记录',
        serviceRecord: '保养记录',
        serviceRecords: '保养记录',
        fourSRatio: '4S店保养占比',
        industryAverage: '行业平均水平',
        totalRecords: '维保记录数量',
        keyRecords: '关键维保记录',
        timeline: '时间线',
        records: '记录列表',
        conclusion: '结论',
        description: '说明',
        summary: '摘要',
        status: '状态',
        note: '备注'
      }
      return map[String(key || '').trim()] || ''
    },
    ensureObjectField(target, key) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {}
      }
      return target[key]
    },
    putFallback(target, key, value) {
      if (this.isPlaceholderValue(target[key]) || target[key] === undefined || target[key] === null || target[key] === '') {
        target[key] = value
      }
    },
    clonePlainObject(value) {
      if (!value || typeof value !== 'object') {
        return {}
      }
      try {
        return JSON.parse(JSON.stringify(value))
      } catch (error) {
        return { ...value }
      }
    },
    cleanDisplayText(value) {
      if (this.isPlaceholderValue(value)) {
        return ''
      }
      return value === undefined || value === null ? '' : String(value)
    },
    isPlaceholderValue(value) {
      if (value === undefined || value === null) {
        return true
      }
      if (typeof value === 'string') {
        const text = value.trim()
        return !text || text === '--' || text === '{}' || text.includes('未获取') || text.includes('未生成') || text.includes('暂无') || text.includes('无数据')
      }
      if (Array.isArray(value)) {
        return !value.length
      }
      if (typeof value === 'object') {
        return !Object.keys(value).length
      }
      return false
    },
    pushOverviewIfMissing(items, label, value) {
      const formatted = this.formatDisplayValue(value)
      if (!label || formatted === '--' || items.some((item) => item.label === label)) {
        return
      }
      items.push({ label, value: formatted })
    },
    pushReportCardIfMissing(items, title, content) {
      const formatted = this.formatDisplayValue(content)
      if (!title || formatted === '--' || items.some((item) => item.title === title)) {
        return
      }
      items.push({ title, content: formatted })
    },
    formatTime(value) {
      return value ? String(value).replace('T', ' ').slice(0, 16) : ''
    }
  }
}
</script>

<style scoped>
.report-view {
  display: block;
}

.report-hero {
  position: relative;
  min-height: 420rpx;
  overflow: hidden;
  border-radius: 8rpx;
  box-shadow: 0 24rpx 60rpx rgba(31, 58, 95, 0.22);
}

.hero-image {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.hero-image-original {
  opacity: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(18, 37, 63, 0.96) 0%, rgba(31, 58, 95, 0.88) 58%, rgba(212, 175, 55, 0.52) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 46rpx 34rpx 38rpx;
}

.hero-tag {
  align-self: flex-start;
  display: inline-flex;
  padding: 8rpx 18rpx;
  border: 1rpx solid rgba(212, 175, 55, 0.75);
  border-radius: 999rpx;
  color: #f7df8a;
  font-size: 22rpx;
  font-weight: 600;
}

.hero-title {
  display: block;
  margin-top: 34rpx;
  color: #ffffff;
  font-size: 50rpx;
  line-height: 1.16;
  font-weight: 800;
}

.hero-subtitle {
  display: block;
  margin-top: 18rpx;
  max-width: 620rpx;
  color: rgba(255, 255, 255, 0.84);
  font-size: 26rpx;
  line-height: 1.7;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 26rpx;
  align-items: center;
}

.hero-price {
  color: #f7df8a;
  font-size: 38rpx;
  font-weight: 800;
}

.hero-pill {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 24rpx;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 22rpx;
}

.overview-card,
.report-section,
.section-card,
.finding-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1rpx solid rgba(31, 58, 95, 0.1);
  border-radius: 8rpx;
}

.overview-card {
  min-height: 126rpx;
  padding: 22rpx;
  box-shadow: 0 12rpx 34rpx rgba(31, 58, 95, 0.08);
}

.overview-label,
.info-label,
.section-kicker {
  display: block;
  color: #657186;
  font-size: 22rpx;
  line-height: 1.5;
}

.overview-value {
  display: block;
  margin-top: 12rpx;
  color: #1a1a1a;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-all;
}

.editable-input,
.editable-textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  border: 1rpx solid rgba(23, 74, 115, 0.18);
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.86);
  color: #111827;
  font-size: 26rpx;
  line-height: 1.65;
  font-weight: 700;
}

.editable-input {
  height: 66rpx;
  padding: 0 18rpx;
}

.editable-textarea {
  min-height: 92rpx;
  padding: 16rpx 18rpx;
}

.overview-edit {
  margin-top: 12rpx;
  font-size: 28rpx;
}

.summary-edit,
.finding-edit,
.section-text-edit {
  margin-top: 18rpx;
}

.info-edit {
  min-height: 72rpx;
  padding: 10rpx 14rpx;
}

.conclusion-edit {
  margin-top: 10rpx;
  background: rgba(255, 255, 255, 0.72);
}

.timeline-date-edit {
  color: #174a73;
  font-size: 28rpx;
  font-weight: 900;
}

.timeline-text-edit {
  margin-top: 14rpx;
}

.report-section {
  margin-top: 24rpx;
  padding: 28rpx;
  box-shadow: 0 16rpx 42rpx rgba(31, 58, 95, 0.08);
}

.tab-report-section {
  padding: 0;
  overflow: hidden;
}

.report-tab-scroll {
  width: 100%;
  background: #2b2b2b;
}

.report-tabs {
  position: relative;
  display: flex;
  min-width: 1180rpx;
  padding: 16rpx 18rpx 22rpx;
  background: #2b2b2b;
}

.report-tabs::after {
  content: '';
  position: absolute;
  right: 28rpx;
  bottom: 0;
  left: 28rpx;
  height: 12rpx;
  background: rgba(124, 124, 124, 0.7);
}

.report-tab {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  min-width: 174rpx;
  height: 86rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6rpx;
}

.report-tab.active {
  background: #236b9d;
  box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.18);
}

.report-tab-text {
  color: #f5f7fa;
  font-size: 30rpx;
  line-height: 1.2;
  font-weight: 600;
  white-space: nowrap;
}

.report-tab.active .report-tab-text {
  color: #ffffff;
}

.report-tab-panel {
  padding: 28rpx;
}

.tab-panel-titlebar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.tab-panel-head {
  flex: 1;
  min-width: 0;
}

.score-badge {
  flex: 0 0 auto;
  min-width: 116rpx;
  padding: 14rpx 16rpx;
  border-radius: 8rpx;
  background: #0f2f4a;
  text-align: center;
  box-shadow: 0 10rpx 22rpx rgba(15, 47, 74, 0.18);
}

.score-value,
.score-label {
  display: block;
}

.score-value {
  color: #ffffff;
  font-size: 30rpx;
  line-height: 1.2;
  font-weight: 800;
}

.score-label {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 20rpx;
  line-height: 1.25;
}

.metric-card-list {
  display: grid;
  gap: 18rpx;
  margin-top: 24rpx;
}

.metric-card {
  padding: 24rpx;
  border-radius: 8rpx;
  background: #ffffff;
  border: 1rpx solid rgba(15, 47, 74, 0.08);
  box-shadow: 0 14rpx 32rpx rgba(15, 23, 42, 0.08);
}

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.metric-label {
  color: #172b3a;
  font-size: 28rpx;
  line-height: 1.35;
  font-weight: 800;
}

.metric-value {
  color: #111827;
  font-size: 30rpx;
  line-height: 1.2;
  font-weight: 900;
}

.metric-track {
  height: 16rpx;
  margin-top: 18rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e8ebf0;
}

.metric-fill {
  height: 100%;
  border-radius: 999rpx;
  background: #174a73;
}

.metric-note {
  display: block;
  margin-top: 18rpx;
  color: #5f6b7a;
  font-size: 23rpx;
  line-height: 1.55;
}

.conclusion-callout {
  margin-top: 24rpx;
  padding: 24rpx 24rpx 24rpx 28rpx;
  border-left: 8rpx solid #174a73;
  border-radius: 4rpx;
  background: #edf2f6;
}

.conclusion-label,
.conclusion-text {
  display: block;
}

.conclusion-label {
  color: #123650;
  font-size: 26rpx;
  line-height: 1.4;
  font-weight: 900;
}

.conclusion-text {
  margin-top: 10rpx;
  color: #1f2933;
  font-size: 26rpx;
  line-height: 1.85;
  font-weight: 600;
}

.maintenance-timeline {
  position: relative;
  margin-top: 28rpx;
  padding: 6rpx 0 6rpx 34rpx;
}

.maintenance-timeline::before {
  content: '';
  position: absolute;
  top: 18rpx;
  bottom: 18rpx;
  left: 9rpx;
  width: 2rpx;
  background: #d7dde4;
}

.timeline-item {
  position: relative;
  padding: 0 0 42rpx 22rpx;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  top: 7rpx;
  left: -34rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #174a73;
  border: 6rpx solid #eef3f7;
  box-shadow: 0 0 0 2rpx #cbd5df;
}

.timeline-content {
  display: block;
}

.timeline-date {
  display: block;
  color: #174a73;
  font-size: 28rpx;
  line-height: 1.4;
  font-weight: 900;
}

.timeline-text {
  display: block;
  margin-top: 14rpx;
  color: #1f2933;
  font-size: 26rpx;
  line-height: 1.85;
  font-weight: 600;
}

.section-head {
  padding-left: 18rpx;
  border-left: 6rpx solid #d4af37;
}

.section-kicker {
  color: #9a7a1f;
  font-weight: 700;
}

.section-title {
  display: block;
  margin-top: 4rpx;
  color: #1f3a5f;
  font-size: 32rpx;
  line-height: 1.35;
  font-weight: 800;
}

.summary-text,
.section-card-content,
.finding-content {
  display: block;
  margin-top: 18rpx;
  color: #344054;
  font-size: 26rpx;
  line-height: 1.85;
}

.highlight-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.highlight-row.inline {
  margin-top: 0;
}

.highlight-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(212, 175, 55, 0.15);
  color: #8b6a12;
  font-size: 24rpx;
  font-weight: 600;
}

.finding-list,
.section-list,
.info-grid {
  display: grid;
  gap: 14rpx;
  margin-top: 20rpx;
}

.finding-card,
.section-card {
  padding: 22rpx;
  box-shadow: none;
}

.finding-title,
.section-card-title {
  display: block;
  color: #1f3a5f;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.4;
}

.info-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.info-grid.compact {
  grid-template-columns: 1fr;
}

.basic-info-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14rpx;
  margin-top: 20rpx;
}

.info-item {
  min-width: 0;
  padding: 18rpx;
  border-radius: 8rpx;
  background: #f7f9fc;
}

.basic-info-item {
  display: grid;
  grid-template-columns: 180rpx minmax(0, 1fr);
  align-items: start;
  column-gap: 18rpx;
  padding: 20rpx 22rpx;
}

.info-value {
  display: block;
  margin-top: 8rpx;
  color: #1a1a1a;
  font-size: 26rpx;
  line-height: 1.55;
  font-weight: 700;
  word-break: break-all;
}

.basic-info-item .info-label,
.basic-info-item .info-value {
  margin-top: 0;
}

.basic-info-item .info-note {
  grid-column: 2;
}

.info-note {
  display: block;
  margin-top: 6rpx;
  color: #657186;
  font-size: 22rpx;
  line-height: 1.5;
}

.record-section {
  margin-bottom: 12rpx;
}
</style>
