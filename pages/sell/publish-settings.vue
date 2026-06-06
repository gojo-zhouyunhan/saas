<template>
  <view class="container">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">&lt;</text>
      <view class="nav-center">
        <text class="nav-title">发布设置</text>
        <text class="nav-subtitle">最后确认售价和交易方式，点击发布后才会真正入库发布。</text>
      </view>
    </view>

    <view class="section">
      <text class="form-label">售价</text>
      <view class="price-input">
        <text class="price-symbol">¥</text>
        <input v-model="form.price" class="form-input price" type="number" placeholder="请输入售价" placeholder-style="color: #94A3B8;" />
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

    <view class="section">
      <text class="form-label">发布前检查</text>
      <text class="helper-text">标题：{{ form.title || '未填写' }}</text>
      <text class="helper-text">图片数量：{{ images.length }} 张</text>
      <text class="helper-text">AI 报告：{{ aiMeta.reportId ? '已生成' : '未生成' }}</text>
      <view class="publish-actions">
        <button class="ghost-btn" @click="backToPreview">返回预览</button>
        <button class="primary-btn" :loading="publishLoading" :disabled="publishLoading" @click="publishNow">
          {{ publishLoading ? '发布中' : '发布' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { buildApiUrl } from '../../utils/api'
import { openPage } from '../../utils/navigation'
import { clearSellSession, getSellSession, setSellSession } from '../../utils/sell-session'

export default {
  data() {
    return {
      form: {},
      images: [],
      aiPreview: null,
      aiMeta: {
        reportId: '',
        prompt: '',
        rawResponse: ''
      },
      publishLoading: false
    }
  },
  onLoad() {
    const session = getSellSession()
    if (!session || !session.form) {
      uni.showToast({ title: '请先完成 AI 生成', icon: 'none' })
      openPage('/pages/sell/sell')
      return
    }
    this.form = Object.assign({}, session.form)
    this.images = Array.isArray(session.images) ? session.images.slice() : []
    this.aiPreview = session.aiPreview || null
    this.aiMeta = Object.assign({}, this.aiMeta, session.aiMeta || {})
  },
  onBackPress() {
    return this.handleExitPrompt()
  },
  methods: {
    goBack() {
      this.handleExitPrompt()
    },
    buildAuthHeader() {
      const token = uni.getStorageSync('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    persistSession() {
      setSellSession({
        form: this.form,
        images: this.images,
        aiPreview: this.aiPreview,
        aiMeta: this.aiMeta,
        updatedAt: new Date().toISOString()
      })
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
    getRemoteImageUrls() {
      return this.images.filter((image) => this.isPersistedImageUrl(image))
    },
    uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: buildApiUrl('/api/ai/report/upload-sell-image'),
          filePath,
          name: 'image',
          header: this.buildAuthHeader(),
          success: (res) => {
            try {
              const payload = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
              const uploadedUrl = payload.data && (payload.data.imageUrl || payload.data.url)
              if (payload.code !== 200 || !uploadedUrl) {
                reject(new Error(payload.message || '图片上传失败'))
                return
              }
              resolve(uploadedUrl)
            } catch (error) {
              reject(error)
            }
          },
          fail: reject
        })
      })
    },
    async ensureImagesUploaded() {
      const remoteImages = this.getRemoteImageUrls()
      const localImages = this.images.filter((image) => !this.isPersistedImageUrl(image))
      if (!localImages.length) {
        return remoteImages
      }
      const uploadedImages = []
      for (const filePath of localImages) {
        const imageUrl = await this.uploadImage(filePath)
        uploadedImages.push(imageUrl)
      }
      this.images = remoteImages.concat(uploadedImages)
      this.persistSession()
      return this.images.slice()
    },
    backToPreview() {
      this.persistSession()
      openPage('/pages/sell/ai-preview')
    },
    hasValue(value) {
      return value !== undefined && value !== null && String(value).trim() !== ''
    },
    validateBeforePublish() {
      const requiredRules = [
        { valid: this.images.length > 0, message: '请至少上传一张车辆图片' },
        { valid: this.hasValue(this.form.title), message: '请输入车辆标题' },
        { valid: this.hasValue(this.form.vehicleVin), message: '请输入车架号 VIN' },
        { valid: this.hasValue(this.form.licensePlate), message: '请输入车牌号' },
        { valid: this.hasValue(this.form.mileage), message: '请输入表显里程' },
        { valid: this.hasValue(this.form.sourceProvince) && this.hasValue(this.form.sourceCity) && this.hasValue(this.form.sourceDistrict), message: '请选择车源省市区' },
        { valid: this.hasValue(this.form.sourceDetailAddress), message: '请输入车源详细地址' },
        { valid: this.hasValue(this.form.description), message: '请输入卖点描述' },
        { valid: this.hasValue(this.form.price), message: '请输入售价' }
      ]
      const missing = requiredRules.find((item) => !item.valid)
      if (missing) {
        this.showToast(missing.message)
        return false
      }
      if (!this.aiPreview) {
        this.showToast('请先完成 AI 生成')
        return false
      }
      return true
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
    async publishNow() {
      if (this.publishLoading || !this.validateBeforePublish()) {
        return
      }
      this.publishLoading = true
      let imageUrls = []
      try {
        imageUrls = await this.ensureImagesUploaded()
      } catch (error) {
        this.publishLoading = false
        this.showToast((error && error.message) || '图片上传失败')
        return
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
        structuredReport: this.aiPreview.structuredReport || undefined,
        aiPrompt: this.aiMeta.prompt,
        aiRawResponse: this.aiMeta.rawResponse
      }
      uni.request({
        url: buildApiUrl('/api/ai/report/publish'),
        method: 'POST',
        header: Object.assign({ 'Content-Type': 'application/json' }, this.buildAuthHeader()),
        data: payload,
        success: (res) => {
          this.publishLoading = false
          const result = this.parseResponseData(res && res.data)
          const report = result.data || {}
          const httpOk = !res.statusCode || (res.statusCode >= 200 && res.statusCode < 300)
          const statusOk = report.status === undefined || report.status === null || Number(report.status) === 2
          const published = httpOk && result.code === 200 && statusOk
          if (!published) {
            this.showToast(result.message || '发布失败')
            return
          }
          this.form.reportId = report.reportId || this.form.reportId
          this.aiMeta.reportId = report.reportId || this.aiMeta.reportId
          this.persistSession()
          clearSellSession()
          uni.showToast({ title: '发布成功', icon: 'success' })
          this.goHomeAfterPublish()
        },
        fail: () => {
          this.publishLoading = false
          this.showToast('发布失败，请稍后重试')
        }
      })
    },
    goHomeAfterPublish() {
      // #ifdef H5
      if (typeof window !== 'undefined') {
        const target = `${window.location.origin}${window.location.pathname}#/pages/index/index`
        window.location.replace(target)
        return
      }
      // #endif
      uni.reLaunch({
        url: '/pages/index/index',
        fail: () => {
          uni.redirectTo({
            url: '/pages/index/index',
            fail: () => {
              openPage('/pages/index/index')
            }
          })
        }
      })
    },
    handleExitPrompt() {
      uni.showModal({
        title: '保存草稿',
        content: '当前还没正式发布，是否先存入草稿箱？',
        confirmText: '存草稿',
        cancelText: '返回上页',
        success: async (res) => {
          if (res.confirm) {
            this.persistSession()
            let imageUrls = []
            try {
              imageUrls = await this.ensureImagesUploaded()
            } catch (error) {
              this.showToast((error && error.message) || '图片上传失败')
              return
            }
            uni.request({
              url: buildApiUrl('/api/sell/draft/save'),
              method: 'POST',
              header: Object.assign({ 'Content-Type': 'application/json' }, this.buildAuthHeader()),
              data: {
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
                structuredReport: this.aiPreview && this.aiPreview.structuredReport ? this.aiPreview.structuredReport : undefined,
                aiPrompt: this.aiMeta.prompt,
                aiRawResponse: this.aiMeta.rawResponse
              },
              complete: () => {
                openPage('/pages/profile/profile')
              }
            })
            return
          }
          openPage('/pages/sell/ai-preview')
        }
      })
      return true
    },
    showToast(title) {
      uni.showToast({ title, icon: 'none' })
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: linear-gradient(180deg, #f3f7fb 0%, #edf3f8 100%); padding-bottom: 80rpx; }
.nav-bar { display: flex; align-items: center; gap: 16rpx; padding: calc(24rpx + var(--status-bar-height)) 24rpx 20rpx; }
.nav-back { font-size: 28rpx; color: var(--c-primary); }
.nav-center { flex: 1; }
.nav-title { display: block; font-size: 32rpx; font-weight: 700; color: var(--c-text); }
.nav-subtitle, .helper-text { display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 1.7; color: var(--c-muted); }
.section { margin: 0 24rpx 24rpx; padding: 28rpx; background: rgba(255,255,255,0.94); border-radius: 24rpx; box-shadow: 0 16rpx 40rpx rgba(15,23,42,0.08); }
.form-label { font-size: 28rpx; font-weight: 600; color: var(--c-text); }
.price-input { display: flex; align-items: center; gap: 12rpx; margin-top: 16rpx; padding: 0 20rpx; border: 2rpx solid rgba(15, 23, 42, 0.1); border-radius: 18rpx; background-color: rgba(255,255,255,0.9); }
.price-symbol { font-size: 32rpx; color: var(--c-primary); font-weight: 600; }
.form-input { width: 100%; height: 88rpx; line-height: 88rpx; font-size: 28rpx; color: var(--c-text); }
.price { flex: 1; border: none; background: transparent; }
.trade-type { display: flex; gap: 16rpx; margin-top: 16rpx; }
.trade-item { flex: 1; text-align: center; padding: 20rpx 24rpx; border: 2rpx solid rgba(15,23,42,0.1); border-radius: 18rpx; background-color: rgba(255,255,255,0.8); }
.trade-item.active { border-color: var(--c-primary); background-color: var(--c-primary-soft); }
.trade-name { font-size: 26rpx; color: var(--c-text-2); }
.publish-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.ghost-btn, .primary-btn { flex: 1; height: 76rpx; line-height: 76rpx; border-radius: 999rpx; font-size: 26rpx; }
.ghost-btn { background: rgba(11, 60, 93, 0.08); color: var(--c-primary); }
.primary-btn { background: linear-gradient(135deg, #0b3c5d 0%, #174f78 100%); color: #fff; }
</style>
