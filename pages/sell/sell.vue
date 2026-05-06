<template>
  <view class="container">
    <view class="page-head">
      <view>
        <text class="page-title">发布车辆</text>
        <text class="page-subtitle">分步骤完善车辆信息。</text>
      </view>
      <text class="page-action" @click="submit">发布</text>
    </view>

    <view class="panel-switch">
      <view
        v-for="panel in panelOptions"
        :key="panel.key"
        class="panel-pill"
        :class="{ active: currentPanel === panel.key }"
        @click="currentPanel = panel.key"
      >
        <text class="panel-pill-text">{{ panel.label }}</text>
      </view>
    </view>

    <view class="sell-form">
      <template v-if="currentPanel === 'basic'">
        <view class="section section-intro">
          <text class="section-intro-title">基础信息</text>
          
          <text class="section-intro-desc">这里填写的标题、图片和描述，会直接影响 AI 预览的展示效果。</text>
        </view>

        <view class="section">
          <text class="form-label">车辆图片</text>
          <view class="image-uploader">
            <view class="upload-item add" @click="chooseImage">
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
            <view class="upload-item" v-for="(image, index) in images" :key="index">
              <image :src="image" mode="aspectFill"></image>
              <text class="delete-icon" @click="deleteImage(index)">×</text>
            </view>
          </view>
        </view>

        <view class="section">
          <text class="form-label">车辆标题</text>
          <input
            v-model="form.title"
            class="form-input"
            type="text"
            placeholder="例如：2020款 宝马 325Li M 运动套装"
            placeholder-style="color: #94A3B8;"
          />
        </view>
        <view class="section">
          <text class="form-label">展示参数</text>
          <text class="helper-text">用于生成 AI 展示内容的补充信息，系统会自动关联当前登录账号。</text>
          <view class="form-grid">
            <view class="param-card param-card-wide">
              <text class="mini-label">车架号 VIN</text>
              <input
                v-model="form.vehicleVin"
                class="form-input compact"
                type="text"
                maxlength="-1"
                placeholder="必填"
                placeholder-style="color: #94A3B8;"
              />
            </view>
            <view class="param-card">
              <text class="mini-label">车型基础 ID</text>
              <input
                v-model="form.vehicleBaseId"
                class="form-input compact"
                type="number"
                placeholder="选填"
                placeholder-style="color: #94A3B8;"
              />
            </view>
            <view class="param-card">
              <text class="mini-label">车牌号</text>
              <input
                v-model="form.licensePlate"
                class="form-input compact"
                type="text"
                maxlength="-1"
                placeholder="选填"
                placeholder-style="color: #94A3B8;"
              />
            </view>
            <view class="param-card">
              <text class="mini-label">表显里程（公里）</text>
              <input
                v-model="form.mileage"
                class="form-input compact"
                type="number"
                placeholder="选填"
                placeholder-style="color: #94A3B8;"
              />
            </view>
          </view>
        </view>
        <view class="section">
          <view class="label-row">
            <text class="form-label">卖点描述</text>
            <button class="ai-trigger ghost" @click="generateAiPreview">生成预览</button>
          </view>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="请输入车况、里程、配置、保养记录和核心亮点"
            placeholder-style="color: #94A3B8;"
          />
          <text class="helper-text">建议把“配置、车况、交易方式、维修保养情况”写全，AI 预览会更完整。</text>
        </view>

        

        <view v-if="aiError" class="section ai-error">
          <text class="ai-error-text">{{ aiError }}</text>
        </view>
      </template>

      <template v-else-if="currentPanel === 'preview'">
        <view class="section section-intro">
          <text class="section-kicker">AI 预览</text>
          <text class="section-intro-title">把长页面拆成可切换的预览分区</text>
          <text class="section-intro-desc">通过下方切换栏查看概览、亮点和详细卡片，避免页面过长。</text>
        </view>

        <view v-if="aiError" class="section ai-error">
          <text class="ai-error-text">{{ aiError }}</text>
        </view>

        <view v-if="!aiPreview" class="section preview-empty">
          <text class="preview-empty-title">还没有生成预览</text>
          <text class="preview-empty-desc">先在“基础信息”里补充展示参数，再生成展示卡片。</text>
          <button class="ai-trigger preview-empty-action" @click="currentPanel = 'basic'">去填写参数</button>
        </view>

        <view v-else class="section ai-preview">
          <view class="preview-header">
            <view>
              <text class="preview-title">{{ aiPreview.pageTitle || 'AI 卖车展示' }}</text>
              <text class="preview-summary">{{ aiPreview.reportSubtitle || aiPreview.summary || '已生成可视化展示内容。' }}</text>
            </view>
            <text class="preview-badge">预览</text>
          </view>

          <view class="preview-tabs">
            <view
              v-for="tab in previewTabs"
              :key="tab.key"
              class="preview-tab"
              :class="{ active: previewTab === tab.key }"
              @click="previewTab = tab.key"
            >
              <text class="preview-tab-text">{{ tab.label }}</text>
            </view>
          </view>

          <template v-if="previewTab === 'overview'">
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
                <text class="keyword-chip" v-for="(tag, index) in heroTags" :key="'hero-tag-' + index">
                  {{ tag }}
                </text>
              </view>
            </view>

            <view v-if="basicInfoRows.length" class="preview-block">
              <text class="block-title">{{ '\u8f66\u8f86\u57fa\u672c\u4fe1\u606f' }}</text>
              <view class="basic-info-table">
                <view class="basic-info-table-head">
                  <text class="basic-info-head-label">{{ '\u57fa\u672c\u4fe1\u606f\u9879' }}</text>
                  <text class="basic-info-head-value">{{ '\u5177\u4f53\u53c2\u6570' }}</text>
                </view>
                <view class="basic-info-table-body">
                  <view
                    v-for="(item, index) in basicInfoRows"
                    :key="(item.label || 'basic-info') + '-' + index"
                    class="basic-info-row"
                  >
                    <text class="basic-info-label">{{ item.label }}</text>
                    <view class="basic-info-value-wrap">
                      <text class="basic-info-value">{{ item.value }}</text>
                      <text v-if="item.note" class="basic-info-note">{{ item.note }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-if="remainingOverviewCards.length" class="preview-block">
              <text class="block-title">{{ '\u6982\u89c8\u4fe1\u606f' }}</text>
              <view class="metric-grid">
                <view class="metric-item" v-for="card in remainingOverviewCards" :key="card.cardKey || card.label">
                  <text class="metric-label">{{ card.label }}</text>
                  <text class="metric-value">{{ formatOverviewValue(card) }}</text>
                  <text class="metric-desc">{{ card.emphasis || '' }}</text>
                </view>
              </view>
            </view>
          </template>

          <template v-else-if="previewTab === 'highlights'">
            <view class="preview-block">
              <text class="block-title">核心亮点</text>
              <view v-if="rawTextHighlights.length" class="keyword-list">
                <text class="keyword-chip" v-for="(item, index) in rawTextHighlights" :key="'raw-' + index">
                  {{ item }}
                </text>
              </view>
              <text v-else class="empty-hint">当前预览还没有返回核心亮点。</text>
            </view>
          </template>

          <template v-else>
            <view v-if="reportCards.length" class="preview-block">
              <view class="report-card" v-for="card in reportCards" :key="card.cardKey || card.title">
                <view class="report-card-head">
                  <view class="report-card-heading">
                    <text class="block-title">{{ card.title }}</text>
                    <text v-if="card.subtitle" class="chart-desc">{{ card.subtitle }}</text>
                  </view>
                  <text v-if="showScore(card)" class="score-pill">{{ card.score }}</text>
                </view>

                <view v-if="card.cardType === 'tags'" class="keyword-list">
                  <text class="keyword-chip" v-for="(item, index) in card.items || []" :key="(card.cardKey || card.title) + '-tag-' + index">
                    {{ item.label || item.value }}
                  </text>
                </view>

                <view v-else-if="card.cardType === 'stats'" class="detail-list">
                  <view class="detail-item" v-for="(item, index) in card.items || []" :key="(card.cardKey || card.title) + '-stat-' + index">
                    <text class="detail-key">{{ item.label }}</text>
                    <text class="detail-value">{{ formatCardItemValue(item) }}</text>
                  </view>
                </view>

                <view v-else-if="card.cardType === 'progress'" class="bar-list">
                  <view class="bar-row" v-for="(item, index) in card.items || []" :key="(card.cardKey || card.title) + '-progress-' + index">
                    <view class="bar-meta">
                      <text class="bar-label">{{ item.label }}</text>
                      <text class="bar-value">{{ formatCardItemValue(item) }}</text>
                    </view>
                    <view class="bar-track">
                      <view
                        class="bar-fill"
                        :style="{
                          width: normalizeBarValue(item.value) + '%',
                          backgroundColor: toneColor(item.tone)
                        }"
                      ></view>
                    </view>
                    <text v-if="item.description" class="bar-note">{{ item.description }}</text>
                  </view>
                </view>

                <view v-else-if="isListCard(card.cardType)" class="component-list">
                  <view class="component-item" v-for="(item, index) in card.items || []" :key="(card.cardKey || card.title) + '-list-' + index">
                    <text class="component-title">{{ item.label }}</text>
                    <text class="component-data">{{ item.description || formatCardItemValue(item) }}</text>
                  </view>
                </view>

                <view v-else class="component-list">
                  <view class="component-item">
                    <text class="component-data">{{ card.conclusion || stringifyData(card.items || []) }}</text>
                  </view>
                </view>

                <text v-if="card.conclusion" class="report-conclusion">{{ card.conclusion }}</text>
              </view>
            </view>
            <text v-else class="empty-hint">当前预览还没有返回详细卡片。</text>
          </template>
        </view>
      </template>

      <template v-else>
        <view class="section section-intro">
          <text class="section-kicker">发布设置</text>
          <text class="section-intro-title">最后确认售价与交易方式</text>
          <text class="section-intro-desc">确认完成后，点击右上角“发布”即可提交。</text>
        </view>

        <view class="section">
          <text class="form-label">售价</text>
          <view class="price-input">
            <text class="price-symbol">¥</text>
            <input
              v-model="form.price"
              class="form-input price"
              type="number"
              placeholder="请输入售价"
              placeholder-style="color: #94A3B8;"
            />
          </view>
        </view>

        <view class="section">
          <text class="form-label">交易方式</text>
          <view class="trade-type">
            <view class="trade-item" :class="{ active: form.tradeType === 'online' }" @click="form.tradeType = 'online'">
              <text class="trade-name">线上沟通</text>
            </view>
            <view class="trade-item" :class="{ active: form.tradeType === 'offline' }" @click="form.tradeType = 'offline'">
              <text class="trade-name">线下看车</text>
            </view>
          </view>
        </view>

        <view class="section publish-summary">
          <text class="form-label">发布前检查</text>
          <text class="helper-text">建议先生成一次 AI 预览，确认标题、卖点和展示卡片符合预期后再正式发布。</text>
          <view class="publish-actions">
            <button class="ai-trigger ghost" @click="currentPanel = 'preview'">查看预览</button>
            <button class="ai-trigger" @click="submit">立即发布</button>
          </view>
        </view>
      </template>
    </view>

    <BottomNav currentPage="sell" />
  </view>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'
import { request } from '../../utils/api'
import { openPage } from '../../utils/navigation'

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      panelOptions: [
        { key: 'basic', label: '基础信息' },
        { key: 'preview', label: 'AI 预览' },
        { key: 'publish', label: '发布设置' }
      ],
      currentPanel: 'basic',
      previewTab: 'overview',
      form: {
        title: '',
        description: '',
        price: '',
        tradeType: 'online',
        userId: '',
        vehicleVin: '',
        vehicleBaseId: '',
        licensePlate: '',
        mileage: ''
      },
      images: [],
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
    basicInfoRows() {
      if (!this.aiPreview) {
        return []
      }
      const previewBasicInfo = this.aiPreview.basicInfo
      if (previewBasicInfo) {
        return this.normalizeBasicInfoRows(previewBasicInfo)
      }
      return this.overviewCards
        .map((card) => {
          const label = card && (card.label || card.name || card.title || card.key)
          if (!label) {
            return null
          }
          return {
            label,
            value: this.formatOverviewValue(card),
            note: this.cleanDisplayNote(card && card.emphasis)
          }
        })
        .filter(Boolean)
    },
    remainingOverviewCards() {
      if (this.basicInfoRows.length) {
        return []
      }
      return this.overviewCards
    },
    reportCards() {
      return (this.aiPreview && this.aiPreview.reportCards) || []
    },
    rawTextHighlights() {
      return (this.aiPreview && this.aiPreview.rawTextHighlights) || []
    },
    metaItems() {
      return [
        { label: '报告 ID', value: this.aiMeta.reportId },
        { label: '场景', value: 'sell_car_visualization' },
        { label: '风格', value: 'business' }
      ].filter((item) => item.value)
    },
    previewTabs() {
      return [
        { key: 'overview', label: '概览' },
        { key: 'highlights', label: '亮点' },
        { key: 'details', label: '详情' }
      ]
    }
  },
  onLoad() {
    this.hydrateUserContext()
  },
  methods: {
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
    submit() {
      if (!this.form.title) {
        this.showToast('请输入车辆标题')
        this.currentPanel = 'basic'
        return
      }
      if (!this.form.description) {
        this.showToast('请输入卖点描述')
        this.currentPanel = 'basic'
        return
      }
      if (!this.form.price) {
        this.showToast('请输入售价')
        this.currentPanel = 'publish'
        return
      }
      if (this.images.length === 0) {
        this.showToast('请至少上传一张图片')
        this.currentPanel = 'basic'
        return
      }

      uni.showToast({
        title: '发布成功',
        icon: 'success'
      })

      setTimeout(() => {
        openPage('/pages/index/index')
      }, 500)
    },
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.images.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.images = this.images.concat(res.tempFilePaths)
        }
      })
    },
    deleteImage(index) {
      this.images.splice(index, 1)
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
      this.previewTab = 'overview'
      this.aiMeta = {
        reportId: '',
        prompt: '',
        rawResponse: ''
      }
    },
    buildAiInputText() {
      const tradeTypeText = this.form.tradeType === 'online' ? '线上沟通' : '线下看车'
      const parts = [
        `标题：${this.form.title || '未填写'}`,
        `交易方式：${tradeTypeText}`,
        this.form.price ? `期望售价：${this.form.price}` : '',
        `描述：${this.form.description || '未填写'}`
      ]
      return parts.filter(Boolean).join('\n')
    },
    buildAiRequestData() {
      const data = {
        inputText: this.buildAiInputText(),
        scene: 'sell_car_visualization',
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
    generateAiPreview() {
      if (!this.form.description) {
        this.showToast('请先填写卖点描述')
        this.currentPanel = 'basic'
        return
      }
      if (!this.form.userId) {
        this.showToast('请先登录后再生成预览')
        return
      }
      if (!this.form.vehicleVin) {
        this.showToast('请填写车架号 VIN')
        return
      }

      this.aiLoading = true
      this.resetAiState()

      request({
        url: '/api/ai/report/generate-sell-visualization',
        method: 'POST',
        timeout: 180000,
        data: this.buildAiRequestData(),
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
            this.currentPanel = 'preview'
            this.previewTab = this.reportCards.length ? 'details' : this.rawTextHighlights.length ? 'highlights' : 'overview'
            return
          }

          this.aiError = payload.message || 'AI 解析失败'
          this.currentPanel = 'preview'
        },
        fail: (err) => {
          this.aiLoading = false
          const errMsg = (err && err.errMsg) || ''
          this.aiError = errMsg.includes('timeout')
            ? 'AI 生成超时，请稍后重试或精简卖点描述'
            : '请求失败，请检查后端服务是否可用'
          this.currentPanel = 'preview'
          console.error('generate ai preview failed', err)
        }
      })
    },
    formatOverviewValue(card) {
      if (!card) {
        return '--'
      }
      return this.formatDisplayValue(card.value, card.unit)
    },
    formatCardItemValue(item) {
      if (!item) {
        return '--'
      }
      return this.formatDisplayValue(item.value, item.unit)
    },
    formatDisplayValue(value, unit) {
      if (value === undefined || value === null || value === '') {
        return '--'
      }
      if (typeof value === 'boolean') {
        return value ? '\u662f' : '\u5426'
      }
      if (typeof value === 'object') {
        if (value.value !== undefined) {
          return this.formatDisplayValue(value.value, value.unit || unit)
        }
        return JSON.stringify(value)
      }
      return String(value) + (unit || '')
    },
    cleanDisplayNote(note) {
      if (note === undefined || note === null || note === '' || typeof note === 'boolean') {
        return ''
      }
      return String(note)
    },
    normalizeBasicInfoRows(source) {
      if (Array.isArray(source)) {
        return source
          .map((item, index) => {
            if (item === undefined || item === null) {
              return null
            }
            if (typeof item !== 'object') {
              return {
                label: '\u4fe1\u606f ' + (index + 1),
                value: this.formatDisplayValue(item),
                note: ''
              }
            }
            const label = item.label || item.name || item.key || item.title
            if (!label) {
              return null
            }
            const rawValue = item.value !== undefined ? item.value : item.content
            return {
              label,
              value: this.formatDisplayValue(rawValue, item.unit),
              note: this.cleanDisplayNote(item.note || item.description || item.emphasis || item.reference)
            }
          })
          .filter(Boolean)
      }
      if (typeof source === 'object') {
        return Object.keys(source)
          .map((key) => {
            const rawValue = source[key]
            if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
              return {
                label: rawValue.label || rawValue.name || key,
                value: this.formatDisplayValue(rawValue.value !== undefined ? rawValue.value : rawValue.content, rawValue.unit),
                note: this.cleanDisplayNote(rawValue.note || rawValue.description || rawValue.emphasis || rawValue.reference)
              }
            }
            return {
              label: key,
              value: this.formatDisplayValue(rawValue),
              note: ''
            }
          })
          .filter((item) => item.value !== '--' || item.note)
      }
      return []
    },
    normalizeBarValue(value) {
      const numberValue = Number(value)
      if (Number.isNaN(numberValue)) {
        return 40
      }
      if (numberValue < 0) {
        return 0
      }
      if (numberValue > 100) {
        return 100
      }
      return numberValue
    },
    toneColor(tone) {
      if (tone === 'positive') {
        return '#16A34A'
      }
      if (tone === 'warning') {
        return '#D97706'
      }
      if (tone === 'danger') {
        return '#DC2626'
      }
      return '#0B3C5D'
    },
    isListCard(cardType) {
      return ['checklist', 'risk', 'timeline'].includes(cardType)
    },
    showScore(card) {
      return card && card.score !== undefined && card.score !== null && card.score !== ''
    },
    stringifyData(data) {
      if (data === undefined || data === null) {
        return ''
      }
      if (typeof data === 'string') {
        return data
      }
      return JSON.stringify(data)
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: calc(24rpx + var(--status-bar-height)) 24rpx 180rpx;
  background:
    radial-gradient(circle at top left, rgba(11, 60, 93, 0.08) 0, rgba(11, 60, 93, 0) 36%),
    linear-gradient(180deg, #f3f7fb 0%, #edf3f8 100%);
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.page-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-text);
}

.page-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--c-muted);
}

.page-action {
  padding: 16rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(11, 60, 93, 0.08);
  font-size: 28rpx;
  color: var(--c-primary);
  font-weight: 600;
}

.panel-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-bottom: 20rpx;
}

.panel-pill {
  min-width: 140rpx;
  padding: 16rpx 24rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.08);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
}

.panel-pill.active {
  background: linear-gradient(135deg, #0b3c5d 0%, #174f78 100%);
  border-color: transparent;
}

.panel-pill-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: var(--c-text-2);
  font-weight: 600;
}

.panel-pill.active .panel-pill-text {
  color: #ffffff;
}

.sell-form {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 18rpx 48rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
}

.section {
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #eef2f7;
}

.section:last-child {
  border-bottom: none;
}

.section-intro {
  background: linear-gradient(135deg, rgba(11, 60, 93, 0.08) 0%, rgba(255, 255, 255, 0.86) 100%);
}

.section-kicker {
  display: block;
  font-size: 22rpx;
  letter-spacing: 4rpx;
  color: var(--c-primary);
}

.section-intro-title {
  display: block;
  margin-top: 12rpx;
  font-size: 32rpx;
  line-height: 1.35;
  color: var(--c-text);
  font-weight: 700;
}

.section-intro-desc,
.helper-text,
.preview-summary,
.chart-desc,
.bar-note,
.metric-desc,
.component-data,
.empty-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--c-muted);
}

.form-label,
.block-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text);
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.ai-trigger {
  margin: 0;
  padding: 0 26rpx;
  height: 68rpx;
  line-height: 68rpx;
  background: linear-gradient(135deg, #0b3c5d 0%, #174f78 100%);
  color: #ffffff;
  border-radius: 999rpx;
  font-size: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(11, 60, 93, 0.18);
}

.ai-trigger::after {
  border: none;
}

.ai-trigger.ghost {
  background: rgba(11, 60, 93, 0.08);
  color: var(--c-primary);
  box-shadow: none;
}

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.upload-item {
  width: 160rpx;
  height: 160rpx;
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
  background-color: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 1rpx rgba(15, 23, 42, 0.06);
}

.upload-item.add {
  border: 2rpx dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 48rpx;
  color: var(--c-primary);
  margin-bottom: 8rpx;
}

.add-text {
  font-size: 22rpx;
  color: var(--c-muted);
}

.upload-item image {
  width: 100%;
  height: 100%;
}

.delete-icon {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(15, 23, 42, 0.7);
  color: #ffffff;
  font-size: 28rpx;
  line-height: 40rpx;
  text-align: center;
}

.form-input,
.form-textarea {
  width: 100%;
  margin-top: 16rpx;
  padding: 0 22rpx;
  border: 2rpx solid rgba(15, 23, 42, 0.1);
  border-radius: 18rpx;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--c-text);
  font-size: 28rpx;
}

.form-input {
  height: 88rpx;
  line-height: 88rpx;
}

.form-textarea {
  min-height: 240rpx;
  padding: 22rpx;
  line-height: 1.7;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18rpx;
  margin-top: 18rpx;
}

.param-card {
  padding: 22rpx;
  border-radius: 20rpx;
  background: linear-gradient(180deg, rgba(243, 247, 251, 0.9) 0%, #ffffff 100%);
  border: 1rpx solid rgba(15, 23, 42, 0.06);
}

.param-card-wide {
  grid-column: span 1;
}

.mini-label {
  display: block;
  font-size: 24rpx;
  color: var(--c-muted);
}

.compact {
  margin-top: 14rpx;
  font-size: 30rpx;
}

.price-input {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  padding: 0 20rpx;
  border: 2rpx solid rgba(15, 23, 42, 0.1);
  border-radius: 18rpx;
  background-color: rgba(255, 255, 255, 0.9);
}

.price-symbol {
  font-size: 32rpx;
  color: var(--c-primary);
  font-weight: 600;
}

.price {
  flex: 1;
  min-width: 0;
  margin-top: 0;
  border: none;
  padding-left: 0;
  background: transparent;
}

.trade-type {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.trade-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 24rpx;
  border: 2rpx solid rgba(15, 23, 42, 0.1);
  border-radius: 18rpx;
  background-color: rgba(255, 255, 255, 0.8);
}

.trade-item.active {
  border-color: var(--c-primary);
  background-color: var(--c-primary-soft);
}

.trade-name {
  font-size: 26rpx;
  color: var(--c-text-2);
}

.trade-item.active .trade-name {
  color: var(--c-primary);
  font-weight: 600;
}

.ai-error {
  background-color: #fff7ed;
}

.ai-error-text {
  font-size: 24rpx;
  color: #c2410c;
  line-height: 1.7;
}

.preview-empty {
  text-align: center;
  padding-top: 70rpx;
  padding-bottom: 70rpx;
}

.preview-empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--c-text);
}

.preview-empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--c-muted);
}

.preview-empty-action {
  margin-top: 28rpx;
}

.ai-preview {
  background: linear-gradient(180deg, rgba(230, 240, 246, 0.72) 0%, #ffffff 100%);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.preview-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--c-text);
}

.preview-badge {
  height: 48rpx;
  line-height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background-color: var(--c-primary-soft);
  color: var(--c-primary);
  font-size: 22rpx;
  font-weight: 600;
}

.preview-tabs {
  display: flex;
  gap: 12rpx;
  margin-top: 24rpx;
  padding: 10rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.7);
}

.preview-tab {
  flex: 1;
  min-width: 0;
  padding: 18rpx 12rpx;
  border-radius: 14rpx;
}

.preview-tab.active {
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.preview-tab-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: var(--c-text-2);
  font-weight: 600;
}

.preview-tab.active .preview-tab-text {
  color: var(--c-primary);
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
  border-radius: 16rpx;
  background-color: rgba(255, 255, 255, 0.82);
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
  padding: 26rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.08);
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(230, 240, 246, 0.92) 0%, #ffffff 100%);
}

.hero-title {
  display: block;
  font-size: 34rpx;
  line-height: 1.4;
  color: var(--c-text);
  font-weight: 700;
}

.hero-price {
  display: block;
  margin-top: 10rpx;
  font-size: 42rpx;
  line-height: 1.2;
  color: var(--c-primary);
  font-weight: 700;
}

.hero-confidence {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--c-text-2);
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.keyword-chip {
  padding: 10rpx 18rpx;
  background-color: var(--c-primary-soft);
  color: var(--c-primary);
  border-radius: 999rpx;
  font-size: 24rpx;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 16rpx;
}

.metric-item,
.component-item {
  min-height: 160rpx;
  padding: 22rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.1);
  border-radius: 18rpx;
  background-color: rgba(255, 255, 255, 0.92);
  box-sizing: border-box;
}

.metric-label,
.component-title {
  display: block;
  font-size: 24rpx;
  color: var(--c-muted);
}

.metric-value {
  display: block;
  margin-top: 12rpx;
  font-size: 36rpx;
  line-height: 1.25;
  color: var(--c-text);
  font-weight: 700;
}

.detail-list {
  margin-top: 16rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.1);
  border-radius: 18rpx;
  overflow: hidden;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 18rpx 20rpx;
  background-color: rgba(255, 255, 255, 0.92);
  border-bottom: 1rpx solid #eef2f7;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-key,
.detail-value {
  font-size: 24rpx;
  line-height: 1.6;
}

.detail-key {
  color: var(--c-muted);
}

.detail-value {
  flex: 1;
  text-align: right;
  color: var(--c-text);
}
.basic-info-table {
  margin-top: 16rpx;
  border-radius: 22rpx;
  overflow: hidden;
  border: 1rpx solid rgba(11, 60, 93, 0.12);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16rpx 40rpx rgba(11, 60, 93, 0.08);
}
.basic-info-table-head {
  display: grid;
  grid-template-columns: 200rpx minmax(0, 1fr);
  gap: 24rpx;
  padding: 22rpx 24rpx;
  background: linear-gradient(135deg, #0b3c5d 0%, #174f78 100%);
}
.basic-info-head-label,
.basic-info-head-value {
  font-size: 24rpx;
  line-height: 1.5;
  color: #ffffff;
  font-weight: 600;
}
.basic-info-row {
  display: grid;
  grid-template-columns: 200rpx minmax(0, 1fr);
  gap: 24rpx;
  padding: 22rpx 24rpx;
  border-top: 1rpx solid rgba(226, 232, 240, 0.9);
}
.basic-info-label,
.basic-info-value,
.basic-info-note {
  font-size: 24rpx;
  line-height: 1.7;
}
.basic-info-label {
  color: var(--c-text-2);
  font-weight: 600;
}
.basic-info-value-wrap {
  min-width: 0;
}
.basic-info-value {
  display: block;
  color: var(--c-text);
  word-break: break-all;
}
.basic-info-note {
  display: block;
  margin-top: 8rpx;
  color: var(--c-muted);
}

.report-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.1);
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.94);
}

.report-card:first-child {
  margin-top: 0;
}

.report-card-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.report-card-heading {
  flex: 1;
}

.score-pill {
  flex-shrink: 0;
  height: 52rpx;
  line-height: 52rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background-color: var(--c-primary-soft);
  color: var(--c-primary);
  font-size: 22rpx;
  font-weight: 600;
}

.bar-list {
  margin-top: 16rpx;
}

.bar-row + .bar-row {
  margin-top: 18rpx;
}

.bar-meta {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.bar-label,
.bar-value {
  font-size: 24rpx;
  color: var(--c-text-2);
}

.bar-track {
  width: 100%;
  height: 14rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background-color: rgba(15, 23, 42, 0.12);
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
}

.component-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16rpx;
  margin-top: 16rpx;
}

.report-conclusion {
  display: block;
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #eef2f7;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--c-text-2);
}

.publish-summary {
  background: linear-gradient(135deg, rgba(11, 60, 93, 0.06) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.publish-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 22rpx;
}

.publish-actions .ai-trigger {
  flex: 1;
}

@media screen and (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .param-card-wide {
    grid-column: span 2;
  }
}
</style>



