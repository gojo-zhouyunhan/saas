<template>
  <view class="container">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <view class="nav-center">
        <text class="nav-title">AI预览</text>
        <text class="nav-subtitle">检查 AI 生成内容后再进入发布设置</text>
      </view>
      <view class="nav-actions">
        <text class="nav-action" :class="{ disabled: aiLoading }" @click="toggleEditMode">{{ editMode ? '完成' : '编辑' }}</text>
        <text class="nav-action" :class="{ disabled: aiLoading }" @click="goToPublishSettings">发布设置</text>
      </view>
    </view>

    <view v-if="aiError" class="section ai-error">
      <text class="ai-error-text">{{ aiError }}</text>
    </view>

    <view v-if="aiLoading" class="loading-section">
      <view class="ai-loader">
        <view class="loader-ring">
          <view class="loader-core">AI</view>
        </view>
        <text class="loading-title">正在智能生成中</text>
        <text class="loading-desc">正在分析车辆图片、参数和卖点描述，自动生成检测预览报告</text>
        <view class="loading-track">
          <view class="loading-bar"></view>
        </view>
        <view class="loading-steps">
          <view class="loading-step active">
            <text class="step-dot"></text>
            <text class="step-text">识别图片</text>
          </view>
          <view class="loading-step active delay-one">
            <text class="step-dot"></text>
            <text class="step-text">理解参数</text>
          </view>
          <view class="loading-step active delay-two">
            <text class="step-dot"></text>
            <text class="step-text">生成报告</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="aiPreview && !aiLoading" class="export-actions">
      <button class="export-button" @click="exportPdfReport">导出PDF报告</button>
    </view>

    <view v-if="aiPreview && !aiLoading" class="report-shell">
      <BusinessReportView
        :schema="aiPreview"
        :editable="editMode"
        :images="images"
        :report-id="aiMeta.reportId"
        :price-text="displayPriceText"
        :trade-type-text="displayTradeTypeText"
        :title-fallback="form.title || 'AI 检测报告'"
        :subtitle-fallback="form.description || ''"
        :original-hero-image="true"
        @schema-change="handleAiPreviewChange"
      />
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
import BusinessReportView from '../../components/report/BusinessReportView.vue'

const KEEP_SELL_SESSION_ONCE_KEY = 'keepSellSessionOnce'

export default {
  components: {
    Timeline,
    ProgressBar,
    BusinessReportView
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
      editMode: false,
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
    },
    displayPriceText() {
      return this.form.price ? `¥${this.form.price}万` : ''
    },
    displayTradeTypeText() {
      if (this.form.tradeType === 'online') {
        return '在线议价'
      }
      if (this.form.tradeType === 'offline') {
        return '线下看车'
      }
      return ''
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
    async toggleEditMode() {
      if (this.aiLoading) {
        return
      }
      if (this.editMode) {
        await this.saveDraftSilently()
        this.showToast('修改已保存')
      }
      this.editMode = !this.editMode
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
        this.form.mileage ? `Mileage: ${this.form.mileage} km` : '',
        this.sourceAddressText() ? `Source Address: ${this.sourceAddressText()}` : ''
      ]
      return parts.filter(Boolean).join('\n')
    },
    sourceAddressText() {
      return [
        this.form.sourceProvince,
        this.form.sourceCity,
        this.form.sourceDistrict,
        this.form.sourceDetailAddress
      ].filter(Boolean).join(' ')
    },
    buildAiRequestData() {
      const data = {
        reportId: this.form.reportId ? Number(this.form.reportId) : undefined,
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
      return this.images.filter((image) => this.isPersistedImageUrl(image))
    },
    isTemporaryImageUrl(image) {
      if (typeof image !== 'string') {
        return false
      }
      const value = image.trim().toLowerCase()
      return value.startsWith('blob:') ||
        value.startsWith('data:') ||
        value.startsWith('file:') ||
        value.startsWith('wxfile:') ||
        value.startsWith('http://tmp') ||
        value.startsWith('https://tmp') ||
        value.includes('/tmp/') ||
        value.includes('/temp/')
    },
    isPersistedImageUrl(image) {
      if (typeof image !== 'string') {
        return false
      }
      const value = image.trim()
      if (!value) {
        return false
      }
      if (value.startsWith('/upload/')) {
        return true
      }
      return /^https?:\/\//.test(value) && !this.isTemporaryImageUrl(value)
    },
    uploadSellImage(filePath) {
      return new Promise((resolve, reject) => {
        uploadFile({
          url: '/api/ai/report/upload-sell-image',
          filePath,
          name: 'image',
          success: (res) => {
            try {
              const payload = this.parseResponseData(res && res.data)
              const imageUrl = payload.data && (payload.data.imageUrl || payload.data.url)
              if (payload.code !== 200 || !imageUrl) {
                reject(new Error(payload.message || '图片上传失败'))
                return
              }
              resolve(imageUrl)
            } catch (error) {
              reject(error)
            }
          },
          fail: reject
        })
      })
    },
    async ensureDraftImagesUploaded() {
      const remoteImages = this.getRemoteImageUrls()
      const localImages = this.images.filter((image) => !this.isPersistedImageUrl(image))
      if (!localImages.length) {
        return remoteImages
      }
      const uploadedImages = []
      for (const filePath of localImages) {
        const imageUrl = await this.uploadSellImage(filePath)
        uploadedImages.push(imageUrl)
      }
      this.images = remoteImages.concat(uploadedImages)
      setSellSession({
        form: this.form,
        images: this.images,
        aiPreview: this.aiPreview,
        aiMeta: this.aiMeta,
        updatedAt: new Date().toISOString()
      })
      return this.images.slice()
    },
    requestGenerateLayout() {
      const requestTimeout = 300000
      const localFiles = this.images.filter((image) => !this.isPersistedImageUrl(image))
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
        const payload = this.parseResponseData(res && res.data)
        if (res.statusCode === 200 && payload.code === 200 && payload.data && payload.data.schema) {
          this.aiPreview = payload.data.schema
          this.form.reportId = payload.data.reportId || this.form.reportId
          this.form.vehicleBaseId = payload.data.vehicleBaseId || this.form.vehicleBaseId
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
    parseResponseData(data) {
      if (!data) {
        return {}
      }
      if (typeof data === 'string') {
        try {
          return JSON.parse(data)
        } catch (error) {
          return {}
        }
      }
      return data
    },
    async saveDraftSilently() {
      if (this.form.editingPublished) {
        setSellSession({
          form: this.form,
          images: this.images,
          aiPreview: this.aiPreview,
          aiMeta: this.aiMeta,
          updatedAt: new Date().toISOString()
        })
        return true
      }
      let imageUrls = this.getRemoteImageUrls()
      try {
        imageUrls = await this.ensureDraftImagesUploaded()
      } catch (error) {
        this.showToast((error && error.message) || '图片上传失败')
        return false
      }
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
        sourceProvince: this.form.sourceProvince,
        sourceCity: this.form.sourceCity,
        sourceDistrict: this.form.sourceDistrict,
        sourceDetailAddress: this.form.sourceDetailAddress,
        imageUrls,
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
          uni.setStorageSync(KEEP_SELL_SESSION_ONCE_KEY, '1')
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
    handleAiPreviewChange(schema) {
      this.aiPreview = schema
      setSellSession({
        form: this.form,
        images: this.images,
        aiPreview: this.aiPreview,
        aiMeta: this.aiMeta,
        updatedAt: new Date().toISOString()
      })
    },
    exportPdfReport() {
      if (!this.aiPreview) {
        this.showToast('请先等待 AI 生成完成')
        return
      }
      const html = this.buildPdfHtml()
      // #ifdef H5
      const win = window.open('', '_blank')
      if (!win) {
        this.showToast('浏览器阻止了弹窗，请允许后重试')
        return
      }
      win.document.open()
      win.document.write(html)
      win.document.close()
      setTimeout(() => this.printPdfWindow(win), 300)
      // #endif
      // #ifndef H5
      this.showToast('当前端暂不支持直接导出，请在浏览器端打开后导出PDF')
      // #endif
    },
    printPdfWindow(win) {
      let printed = false
      const print = () => {
        if (printed) {
          return
        }
        printed = true
        win.focus()
        win.print()
      }
      const images = Array.from(win.document.images || [])
      if (!images.length) {
        setTimeout(print, 200)
        return
      }
      let settled = 0
      const done = () => {
        settled += 1
        if (settled >= images.length) {
          setTimeout(print, 200)
        }
      }
      images.forEach((image) => {
        if (image.complete) {
          done()
          return
        }
        image.onload = done
        image.onerror = done
      })
      setTimeout(print, 2500)
    },
    buildPdfHtml() {
      const title = this.escapeHtml(this.heroTitle || this.form.title || '二手车检测报告')
      const subtitle = this.escapeHtml(this.heroConfidenceText || this.form.description || 'AI 检测报告')
      const price = this.escapeHtml(this.displayPriceText || '')
      const tradeType = this.escapeHtml(this.displayTradeTypeText || '')
      const coverImage = this.getPdfCoverImage()
      const coverImageHtml = coverImage
        ? `<div class="hero-media"><img src="${this.escapeHtml(coverImage)}" alt="车辆图片"></div>`
        : ''
      const reportNo = this.aiMeta.reportId ? `<div class="fact"><span>报告编号</span><strong>${this.escapeHtml(this.aiMeta.reportId)}</strong></div>` : ''
      const overviewHtml = this.buildPdfOverviewHtml()
      const summaryHtml = this.buildPdfSectionHtml('检测摘要', this.getFieldValue(this.aiPreview, '摘要', 'summary'))
      const findingsHtml = this.buildPdfCardsHtml('核心结论', this.getFieldValue(this.aiPreview, '报告卡片', 'reportCards'))
      const structuredHtml = this.buildPdfStructuredHtml()
      return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    @page { size: A4; margin: 14mm; }
    body { margin: 0; padding: 24px; background: #eef3f7; color: #17212b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
    .page { max-width: 900px; margin: 0 auto; background: #fff; padding: 28px; border-radius: 8px; }
    .hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.82fr); gap: 22px; align-items: stretch; padding: 24px; background: #102f4a; color: #fff; border-radius: 8px; break-inside: avoid; }
    .hero.no-image { grid-template-columns: 1fr; }
    .hero-copy { min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
    .kicker { color: #f2d57a; font-size: 13px; font-weight: 700; letter-spacing: 0; }
    .title { margin: 8px 0 0; font-size: 31px; line-height: 1.22; }
    .subtitle { margin-top: 10px; color: rgba(255,255,255,.82); font-size: 15px; line-height: 1.7; }
    .price { margin-top: 16px; color: #ffd86a; font-size: 25px; line-height: 1.2; font-weight: 800; }
    .pill { display: inline-block; margin-left: 10px; padding: 5px 10px; border-radius: 999px; background: rgba(255,255,255,.16); color: #fff; font-size: 13px; vertical-align: middle; }
    .hero-facts { display: flex; flex-wrap: wrap; gap: 10px; }
    .fact { min-width: 120px; padding: 10px 12px; border: 1px solid rgba(255,255,255,.16); border-radius: 6px; background: rgba(255,255,255,.08); }
    .fact span { display: block; color: rgba(255,255,255,.68); font-size: 12px; }
    .fact strong { display: block; margin-top: 4px; color: #fff; font-size: 14px; word-break: break-all; }
    .hero-media { min-height: 236px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 8px; background: #f8fafc; }
    .hero-media img { width: 100%; height: 100%; max-height: 290px; object-fit: contain; display: block; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; margin-top: 18px; }
    .item { padding: 12px 14px; background: #f6f8fb; border: 1px solid #e5e9ef; border-radius: 6px; break-inside: avoid; }
    .label { color: #64748b; font-size: 13px; }
    .value { margin-top: 6px; color: #111827; font-size: 15px; font-weight: 700; line-height: 1.55; white-space: pre-wrap; }
    .section { margin-top: 22px; padding-top: 16px; border-top: 1px solid #e5e9ef; break-inside: avoid; }
    .section h2 { margin: 0 0 12px; padding-left: 10px; border-left: 4px solid #d4af37; color: #173a59; font-size: 20px; }
    .paragraph { color: #273444; font-size: 14px; line-height: 1.85; white-space: pre-wrap; }
    .card { margin-top: 9px; padding: 12px 14px; border-radius: 6px; background: #f7f9fc; border: 1px solid #e5e9ef; break-inside: avoid; }
    .card-title { color: #173a59; font-size: 15px; font-weight: 800; }
    .card-text { margin-top: 6px; color: #273444; font-size: 13px; line-height: 1.78; white-space: pre-wrap; }
    @media (max-width: 760px) { .hero, .hero.no-image { grid-template-columns: 1fr; } .grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
    @media print { body { background: #fff; padding: 0; } .page { max-width: none; padding: 0; border-radius: 0; } .hero { grid-template-columns: minmax(0, 1fr) 260px; } .grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero${coverImage ? '' : ' no-image'}">
      <div class="hero-copy">
        <div>
          <div class="kicker">AI 二手车检测报告</div>
          <h1 class="title">${title}</h1>
          <div class="subtitle">${subtitle}</div>
          <div class="price">${price}${tradeType ? `<span class="pill">${tradeType}</span>` : ''}</div>
        </div>
        <div class="hero-facts">
          ${reportNo}
          <div class="fact"><span>生成来源</span><strong>AI 预览页</strong></div>
        </div>
      </div>
      ${coverImageHtml}
    </section>
    ${overviewHtml}
    ${summaryHtml}
    ${findingsHtml}
    ${structuredHtml}
  </main>
</body>
</html>`
    },
    getPdfCoverImage() {
      const image = this.images.find((item) => typeof item === 'string' && item)
      return this.normalizeImageSrc(image)
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
    buildPdfOverviewHtml() {
      const cards = this.getFieldValue(this.aiPreview, '概览卡片', 'overviewCards') || []
      const items = cards.map((item) => ({
        label: item.label || item.name || item.title || '',
        value: this.formatDisplayValue(item.value !== undefined ? item.value : item.content, item.unit)
      })).filter((item) => item.label && item.value && item.value !== '--')
      if (!items.length) {
        return ''
      }
      return `<section class="grid">${items.map((item) => `
        <div class="item">
          <div class="label">${this.escapeHtml(item.label)}</div>
          <div class="value">${this.escapeHtml(item.value)}</div>
        </div>`).join('')}</section>`
    },
    buildPdfCardsHtml(title, cards) {
      if (!Array.isArray(cards) || !cards.length) {
        return ''
      }
      const html = cards.map((card) => {
        const cardTitle = card.title || card.label || card.name || '检测结论'
        const content = this.formatDisplayValue(card.content !== undefined ? card.content : card.value)
        if (!content || content === '--') {
          return ''
        }
        return `<div class="card"><div class="card-title">${this.escapeHtml(cardTitle)}</div><div class="card-text">${this.escapeHtml(content)}</div></div>`
      }).filter(Boolean).join('')
      return html ? `<section class="section"><h2>${this.escapeHtml(title)}</h2>${html}</section>` : ''
    },
    buildPdfSectionHtml(title, content) {
      const text = this.formatDisplayValue(content)
      if (!text || text === '--') {
        return ''
      }
      return `<section class="section"><h2>${this.escapeHtml(title)}</h2><div class="paragraph">${this.escapeHtml(text)}</div></section>`
    },
    buildPdfStructuredHtml() {
      const structured = this.getSchemaObject('结构化报告', 'structuredReport') || {}
      const sections = [
        ['基本信息', 'basicInfo'],
        ['外观检测', 'appearanceInspection'],
        ['内饰检测', 'interiorInspection'],
        ['机械性能', 'mechanicalPerformance'],
        ['维修历史', 'maintenanceHistory'],
        ['综合评价', 'overallEvaluation']
      ]
      return sections.map(([cn, en]) => {
        const source = this.getFieldValue(structured, cn, en)
        if (!source) {
          return ''
        }
        return `<section class="section"><h2>${this.escapeHtml(cn)}</h2>${this.buildPdfObjectHtml(source)}</section>`
      }).filter(Boolean).join('')
    },
    buildPdfObjectHtml(source) {
      if (source === undefined || source === null || source === '') {
        return ''
      }
      if (typeof source !== 'object') {
        return `<div class="paragraph">${this.escapeHtml(source)}</div>`
      }
      if (Array.isArray(source)) {
        return source.map((item, index) => `<div class="card"><div class="card-title">记录 ${index + 1}</div><div class="card-text">${this.escapeHtml(this.formatDisplayValue(item))}</div></div>`).join('')
      }
      return Object.keys(source).map((key) => {
        const value = source[key]
        if (value === undefined || value === null || value === '') {
          return ''
        }
        const label = getBackendSectionLabel(key) || getBackendFieldLabel(key) || key
        if (typeof value === 'object') {
          return `<div class="card"><div class="card-title">${this.escapeHtml(label)}</div><div class="card-text">${this.buildPdfObjectHtml(value)}</div></div>`
        }
        return `<div class="card"><div class="card-title">${this.escapeHtml(label)}</div><div class="card-text">${this.escapeHtml(value)}</div></div>`
      }).filter(Boolean).join('')
    },
    escapeHtml(value) {
      return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
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
.nav-actions { display: flex; align-items: center; gap: 20rpx; flex-shrink: 0; }
.nav-center { flex: 1; min-width: 0; }
.nav-title { display: block; font-size: 32rpx; font-weight: 700; color: var(--c-text); }
.nav-subtitle, .helper-text, .preview-summary { display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-muted); }
.section { margin: 0 24rpx 24rpx; padding: 28rpx; background: rgba(255,255,255,0.94); border-radius: 24rpx; box-shadow: 0 16rpx 40rpx rgba(15,23,42,0.08); }
.loading-section { margin: 18rpx 24rpx 24rpx; padding: 44rpx 30rpx; border-radius: 24rpx; background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,246,250,0.96) 100%); box-shadow: 0 18rpx 46rpx rgba(11,60,93,0.12); border: 1rpx solid rgba(11,60,93,0.08); }
.ai-loader { display: flex; flex-direction: column; align-items: center; text-align: center; }
.loader-ring { position: relative; width: 150rpx; height: 150rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: conic-gradient(from 0deg, #0b3c5d, #45a3c7, #d4af37, #0b3c5d); animation: ai-spin 1.7s linear infinite; box-shadow: 0 18rpx 38rpx rgba(11,60,93,0.2); }
.loader-ring::before { content: ''; position: absolute; inset: 12rpx; border-radius: 50%; background: #ffffff; }
.loader-core { position: relative; z-index: 1; width: 104rpx; height: 104rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0b3c5d 0%, #174f78 100%); color: #ffffff; font-size: 36rpx; line-height: 104rpx; font-weight: 900; animation: ai-pulse 1.35s ease-in-out infinite; }
.loading-title { display: block; margin-top: 28rpx; color: #142536; font-size: 34rpx; line-height: 1.35; font-weight: 800; }
.loading-desc { display: block; max-width: 560rpx; margin-top: 12rpx; color: #66758a; font-size: 24rpx; line-height: 1.7; }
.loading-track { position: relative; width: 100%; height: 14rpx; margin-top: 34rpx; overflow: hidden; border-radius: 999rpx; background: rgba(11,60,93,0.09); }
.loading-bar { position: absolute; top: 0; bottom: 0; left: -42%; width: 42%; border-radius: 999rpx; background: linear-gradient(90deg, rgba(11,60,93,0) 0%, #0b3c5d 42%, #d4af37 100%); animation: ai-progress 1.65s ease-in-out infinite; }
.loading-steps { display: flex; justify-content: center; flex-wrap: wrap; gap: 18rpx; margin-top: 26rpx; }
.loading-step { display: inline-flex; align-items: center; gap: 8rpx; padding: 10rpx 16rpx; border-radius: 999rpx; background: rgba(11,60,93,0.06); color: #425466; }
.step-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #0b3c5d; animation: ai-dot 1.25s ease-in-out infinite; }
.step-text { font-size: 22rpx; line-height: 1.3; }
.delay-one .step-dot { animation-delay: 0.18s; }
.delay-two .step-dot { animation-delay: 0.36s; }
.export-actions { margin: 0 24rpx 20rpx; }
.export-button { height: 76rpx; line-height: 76rpx; border-radius: 8rpx; background: #173a59; color: #fff; font-size: 28rpx; font-weight: 700; box-shadow: 0 14rpx 30rpx rgba(23,58,89,0.18); }
.export-button::after { border: 0; }
.report-shell { margin: 0 24rpx 24rpx; }
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
@keyframes ai-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes ai-pulse {
  0%, 100% { transform: scale(0.94); box-shadow: 0 0 0 0 rgba(11,60,93,0.22); }
  50% { transform: scale(1); box-shadow: 0 0 0 14rpx rgba(11,60,93,0.06); }
}
@keyframes ai-progress {
  0% { left: -42%; }
  55% { left: 38%; }
  100% { left: 100%; }
}
@keyframes ai-dot {
  0%, 100% { transform: scale(0.72); opacity: 0.45; }
  50% { transform: scale(1.18); opacity: 1; }
}
</style>
