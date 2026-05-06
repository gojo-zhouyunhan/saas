<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-top">
        <view class="nav-left">
          <text class="nav-back" @click="goBack"><</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">发布闲置</text>
        </view>
        <view class="nav-right">
          <text class="nav-submit" @click="submit">发布</text>
        </view>
      </view>
    </view>

    <view class="sell-form">
      <view class="section">
        <text class="form-label">商品图片</text>
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
        <text class="form-label">商品标题</text>
        <input
          v-model="form.title"
          class="form-input"
          type="text"
          placeholder="请输入车辆标题，例如：2020款宝马3系 325Li M运动套装"
          placeholder-style="color: #94A3B8;"
        />
      </view>

      <view class="section">
        <view class="label-row">
          <text class="form-label">商品描述</text>
          <button class="ai-trigger" :loading="aiLoading" @click="generateAiPreview">
            智能整理卖点
          </button>
        </view>
        <textarea
          v-model="form.description"
          class="form-textarea"
          placeholder="请输入车况、里程、过户、配置、维修保养、亮点和注意事项"
          placeholder-style="color: #94A3B8;"
        />
        <text class="helper-text">系统会把描述整理成一组车辆报告卡片，方便卖家快速检查亮点和买家顾虑。</text>
      </view>

      <view v-if="aiError" class="section ai-error">
        <text class="ai-error-text">{{ aiError }}</text>
      </view>

      <view v-if="aiPreview" class="section ai-preview">
        <view class="preview-header">
          <view>
            <text class="preview-title">{{ aiPreview.pageTitle || '车辆卖点报告' }}</text>
            <text class="preview-summary">{{ aiPreview.reportSubtitle || aiPreview.summary || '已生成车辆报告卡片流。' }}</text>
          </view>
          <text class="preview-badge">报告</text>
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

        <view v-if="overviewCards.length" class="preview-block">
          <text class="block-title">概览</text>
          <view class="metric-grid">
            <view class="metric-item" v-for="card in overviewCards" :key="card.cardKey">
              <text class="metric-label">{{ card.label }}</text>
              <text class="metric-value">{{ formatOverviewValue(card) }}</text>
              <text class="metric-desc">{{ card.emphasis || '' }}</text>
            </view>
          </view>
        </view>

        <view v-if="rawTextHighlights.length" class="preview-block">
          <text class="block-title">原文提炼</text>
          <view class="keyword-list">
            <text class="keyword-chip" v-for="(item, index) in rawTextHighlights" :key="'raw-' + index">
              {{ item }}
            </text>
          </view>
        </view>

        <view v-if="reportCards.length" class="preview-block">
          <view class="report-card" v-for="card in reportCards" :key="card.cardKey">
            <view class="report-card-head">
              <view class="report-card-heading">
                <text class="block-title">{{ card.title }}</text>
                <text v-if="card.subtitle" class="chart-desc">{{ card.subtitle }}</text>
              </view>
              <text v-if="showScore(card)" class="score-pill">{{ card.score }}</text>
            </view>

            <view v-if="card.cardType === 'tags'" class="keyword-list">
              <text class="keyword-chip" v-for="(item, index) in card.items || []" :key="card.cardKey + '-tag-' + index">
                {{ item.label || item.value }}
              </text>
            </view>

            <view v-else-if="card.cardType === 'stats'" class="detail-list">
              <view class="detail-item" v-for="(item, index) in card.items || []" :key="card.cardKey + '-stat-' + index">
                <text class="detail-key">{{ item.label }}</text>
                <text class="detail-value">{{ formatCardItemValue(item) }}</text>
              </view>
            </view>

            <view v-else-if="card.cardType === 'progress'" class="bar-list">
              <view class="bar-row" v-for="(item, index) in card.items || []" :key="card.cardKey + '-progress-' + index">
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
              <view class="component-item" v-for="(item, index) in card.items || []" :key="card.cardKey + '-list-' + index">
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
      </view>

      <view class="section">
        <text class="form-label">价格</text>
        <view class="price-input">
          <text class="price-symbol">￥</text>
          <input
            v-model="form.price"
            class="form-input price"
            type="number"
            placeholder="0.00"
            placeholder-style="color: #94A3B8;"
          />
        </view>
      </view>

      <view class="section">
        <text class="form-label">分类</text>
        <view class="category-selector">
          <view class="category-item" :class="{ active: form.category === 'car' }" @click="form.category = 'car'">
            <text class="category-name">二手车</text>
          </view>
          <view class="category-item" :class="{ active: form.category === 'phone' }" @click="form.category = 'phone'">
            <text class="category-name">手机数码</text>
          </view>
          <view class="category-item" :class="{ active: form.category === 'clothing' }" @click="form.category = 'clothing'">
            <text class="category-name">服饰鞋包</text>
          </view>
          <view class="category-item" :class="{ active: form.category === 'other' }" @click="form.category = 'other'">
            <text class="category-name">其他</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="form-label">交易方式</text>
        <view class="trade-type">
          <view class="trade-item" :class="{ active: form.tradeType === 'online' }" @click="form.tradeType = 'online'">
            <text class="trade-name">线上交易</text>
          </view>
          <view class="trade-item" :class="{ active: form.tradeType === 'offline' }" @click="form.tradeType = 'offline'">
            <text class="trade-name">线下交易</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { goBackOrFallback, openPage } from '../../utils/navigation'

export default {
  data() {
    return {
      form: {
        title: '',
        description: '',
        price: '',
        category: 'car',
        tradeType: 'online'
      },
      images: [],
      aiLoading: false,
      aiError: '',
      aiPreview: null
    }
  },
  computed: {
    heroTitle() {
      return (this.aiPreview && this.aiPreview.hero && this.aiPreview.hero.title) || this.form.title || '车辆卖点报告'
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
    reportCards() {
      return (this.aiPreview && this.aiPreview.reportCards) || []
    },
    rawTextHighlights() {
      return (this.aiPreview && this.aiPreview.rawTextHighlights) || []
    }
  },
  methods: {
    goBack() {
      goBackOrFallback('/pages/index/index')
    },
    submit() {
      if (!this.form.title) {
        this.showToast('请输入商品标题')
        return
      }
      if (!this.form.description) {
        this.showToast('请输入商品描述')
        return
      }
      if (!this.form.price) {
        this.showToast('请输入价格')
        return
      }
      if (this.images.length === 0) {
        this.showToast('请添加商品图片')
        return
      }

      console.log('submit form', this.form, this.images, this.aiPreview)
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
    buildAiInputText() {
      const priceText = this.form.price ? `期望售价：${this.form.price}万元。` : ''
      return [
        `标题：${this.form.title || '未填写'}`,
        `分类：${this.form.category}`,
        `交易方式：${this.form.tradeType}`,
        priceText,
        `描述：${this.form.description || '未填写'}`
      ].filter(Boolean).join('\n')
    },
    generateAiPreview() {
      if (!this.form.description) {
        this.showToast('请先填写商品描述')
        return
      }

      this.aiLoading = true
      this.aiError = ''

      request({
        url: '/api/ai/report/generate-sell-visualization',
        method: 'POST',
        data: {
          inputText: this.buildAiInputText(),
          scene: 'sell_listing',
          preferredStyle: 'mobile_vehicle_report_cards'
        },
        success: (res) => {
          this.aiLoading = false
          const payload = res.data || {}

          if (res.statusCode === 200 && payload.code === 200 && payload.data && payload.data.schema) {
            this.aiPreview = payload.data.schema
            return
          }

          this.aiPreview = null
          this.aiError = payload.message || '解析失败，请稍后重试'
        },
        fail: (err) => {
          this.aiLoading = false
          this.aiPreview = null
          this.aiError = '请求后端失败，请确认服务已启动'
          console.error('generate ai preview failed', err)
        }
      })
    },
    formatOverviewValue(card) {
      if (!card) {
        return '--'
      }
      const value = card.value === undefined || card.value === null || card.value === '' ? '--' : card.value
      return `${value}${card.unit || ''}`
    },
    formatCardItemValue(item) {
      if (!item) {
        return '--'
      }
      const value = item.value === undefined || item.value === null || item.value === '' ? '--' : item.value
      return `${value}${item.unit || ''}`
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
      return '#2563EB'
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
  background-color: #f8fafc;
  min-height: 100vh;
  padding-bottom: 140rpx;
}

.nav-bar {
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(15, 23, 42, 0.08);
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

.nav-right {
  display: flex;
  justify-content: flex-end;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.nav-back {
  font-size: 36rpx;
  color: #0f172a;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.nav-submit {
  font-size: 28rpx;
  color: #2563eb;
  font-weight: 600;
}

.sell-form {
  margin: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  border: 1rpx solid #e2e8f0;
}

.section {
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #eef2f7;
}

.section:last-child {
  border-bottom: none;
}

.form-label,
.block-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.ai-trigger {
  margin: 0;
  padding: 0 22rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: #2563eb;
  color: #ffffff;
  border-radius: 12rpx;
  font-size: 24rpx;
}

.ai-trigger::after {
  border: none;
}

.helper-text,
.preview-summary,
.chart-desc,
.bar-note,
.metric-desc,
.component-data {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #64748b;
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
  border-radius: 14rpx;
  overflow: hidden;
  position: relative;
  background-color: #f8fafc;
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
  color: #2563eb;
  margin-bottom: 8rpx;
}

.add-text {
  font-size: 22rpx;
  color: #64748b;
}

.upload-item image {
  width: 100%;
  height: 100%;
}

.delete-icon {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background-color: rgba(15, 23, 42, 0.65);
  color: #ffffff;
  font-size: 22rpx;
  line-height: 36rpx;
  text-align: center;
}

.form-input,
.form-textarea {
  width: 100%;
  margin-top: 16rpx;
  padding: 20rpx;
  border: 2rpx solid #dbe4ee;
  border-radius: 14rpx;
  box-sizing: border-box;
  background-color: #f8fafc;
  color: #0f172a;
  font-size: 28rpx;
}

.form-textarea {
  height: 220rpx;
}

.price-input {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  padding: 0 20rpx;
  border: 2rpx solid #dbe4ee;
  border-radius: 14rpx;
  background-color: #f8fafc;
}

.price-symbol {
  font-size: 30rpx;
  color: #2563eb;
  font-weight: 600;
}

.price {
  margin-top: 0;
  border: none;
  padding-left: 0;
}

.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.category-item,
.trade-item {
  padding: 16rpx 24rpx;
  border: 2rpx solid #dbe4ee;
  border-radius: 999rpx;
  background-color: #f8fafc;
}

.category-item.active,
.trade-item.active {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.category-name,
.trade-name {
  font-size: 26rpx;
  color: #475569;
}

.category-item.active .category-name,
.trade-item.active .trade-name {
  color: #2563eb;
  font-weight: 600;
}

.trade-type {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.trade-item {
  flex: 1;
  text-align: center;
  border-radius: 14rpx;
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
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
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
  color: #0f172a;
}

.preview-badge {
  height: 48rpx;
  line-height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background-color: #dbeafe;
  color: #1d4ed8;
  font-size: 22rpx;
  font-weight: 600;
}

.preview-block {
  margin-top: 28rpx;
}

.hero-block {
  padding: 24rpx;
  border: 1rpx solid #dbe4ee;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.hero-title {
  display: block;
  font-size: 32rpx;
  line-height: 1.4;
  color: #0f172a;
  font-weight: 700;
}

.hero-price {
  display: block;
  margin-top: 10rpx;
  font-size: 40rpx;
  line-height: 1.2;
  color: #2563eb;
  font-weight: 700;
}

.hero-confidence {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #475569;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.keyword-chip {
  padding: 10rpx 18rpx;
  background-color: #eff6ff;
  color: #1d4ed8;
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
  padding: 20rpx;
  border: 1rpx solid #dbe4ee;
  border-radius: 14rpx;
  background-color: #ffffff;
  box-sizing: border-box;
}

.metric-label,
.component-title {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

.metric-value {
  display: block;
  margin-top: 12rpx;
  font-size: 36rpx;
  line-height: 1.2;
  color: #0f172a;
  font-weight: 700;
}

.detail-list {
  margin-top: 16rpx;
  border: 1rpx solid #dbe4ee;
  border-radius: 14rpx;
  overflow: hidden;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 18rpx 20rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-key,
.detail-value {
  font-size: 24rpx;
  line-height: 1.5;
}

.detail-key {
  color: #64748b;
}

.detail-value {
  flex: 1;
  text-align: right;
  color: #0f172a;
}

.report-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border: 1rpx solid #dbe4ee;
  border-radius: 16rpx;
  background-color: #ffffff;
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
  background-color: #dbeafe;
  color: #1d4ed8;
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
  color: #334155;
}

.bar-track {
  width: 100%;
  height: 14rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background-color: #e2e8f0;
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
  line-height: 1.6;
  color: #334155;
}
</style>
