<template>
  <view class="container">
    <view class="page-head">
      <view>
        <text class="page-title">发布车辆</text>
        <text class="page-subtitle">先填写车辆信息，再进入 AI 生成页检查内容。</text>
      </view>
      <view class="page-actions">
        <text class="page-action draft" :class="{ disabled: actionLoading || imageUploading }" @click="saveToDraftbox">
          {{ actionLoading || imageUploading ? '处理中' : '加入草稿箱' }}
        </text>
        <text class="page-action" :class="{ disabled: actionLoading }" @click="goToAiPreview">
          {{ actionLoading ? '处理中' : 'AI生成' }}
        </text>
      </view>
    </view>

    <view class="sell-form">
      <view class="section section-intro">
        <text class="section-intro-title">基础信息</text>
        <text class="section-intro-desc">这里填写的标题、图片和描述，会和 AI 生成内容一起保存。</text>
      </view>

      <view class="section">
        <text class="form-label">车辆图片</text>
        <view class="image-uploader">
          <view class="upload-item add" @click="chooseImage">
            <text class="add-icon">+</text>
            <text class="add-text">{{ imageUploading ? '上传中' : '添加图片' }}</text>
          </view>
          <view class="upload-item" v-for="(image, index) in images" :key="image + index">
            <image :src="toImageSrc(image)" mode="aspectFill"></image>
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
        <text class="helper-text">系统会自动关联当前登录账号，并把这些参数带入 AI 生成。</text>
        <view class="form-grid">
          <view class="param-card param-card-wide">
            <text class="mini-label">车架号 VIN</text>
            <input v-model="form.vehicleVin" class="form-input compact" type="text" maxlength="-1" placeholder="必填" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="param-card">
            <text class="mini-label">车型基础 ID</text>
            <input v-model="form.vehicleBaseId" class="form-input compact" type="number" placeholder="选填" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="param-card">
            <text class="mini-label">车牌号</text>
            <input v-model="form.licensePlate" class="form-input compact" type="text" maxlength="-1" placeholder="选填" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="param-card">
            <text class="mini-label">表显里程（公里）</text>
            <input v-model="form.mileage" class="form-input compact" type="number" placeholder="选填" placeholder-style="color: #94A3B8;" />
          </view>
        </view>
      </view>

      <view class="section">
        <text class="form-label">卖点描述</text>
        <textarea
          v-model="form.description"
          class="form-textarea"
          maxlength="-1"
          auto-height
          placeholder="请输入车况、里程、配置、保养记录和核心亮点"
          placeholder-style="color: #94A3B8;"
        />
        <text class="helper-text">当前已输入 {{ descriptionLength }} 字，点击右上角 `AI生成` 后会进入单独预览页。</text>
      </view>

      <view v-if="draftMeta.updatedAt" class="section draft-tips">
        <text class="form-label">当前草稿</text>
        <text class="helper-text">最近保存时间：{{ formatTime(draftMeta.updatedAt) }}</text>
      </view>
    </view>

    <BottomNav currentPage="sell" />
  </view>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'
import { buildApiUrl, request } from '../../utils/api'
import { openPage } from '../../utils/navigation'
import { clearSellSession, getSellSession, setSellSession } from '../../utils/sell-session'

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      form: {
        draftId: '',
        reportId: '',
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
      aiPreview: null,
      aiMeta: {
        reportId: '',
        prompt: '',
        rawResponse: ''
      },
      actionLoading: false,
      imageUploading: false,
      draftMeta: {
        updatedAt: ''
      }
    }
  },
  computed: {
    descriptionLength() {
      return (this.form.description || '').length
    }
  },
  onLoad(options) {
    this.hydrateUserContext()
    this.restoreSession(options)
  },
  onBackPress() {
    return this.handleExitPrompt()
  },
  methods: {
    ensureAuthenticated() {
      const token = uni.getStorageSync('token')
      if (token) {
        return true
      }
      this.showToast('请先登录后再上传图片')
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 500)
      return false
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
    restoreSession(options = {}) {
      const session = getSellSession()
      if (session) {
        this.applySession(session)
        return
      }
      const draftId = options.draftId || options.reportId
      if (draftId) {
        this.loadDraftDetail(draftId)
      }
    },
    applySession(session) {
      this.form = Object.assign({}, this.form, session.form || {})
      this.images = Array.isArray(session.images) ? session.images.slice() : []
      this.aiPreview = session.aiPreview || null
      this.aiMeta = Object.assign({}, this.aiMeta, session.aiMeta || {})
      this.draftMeta = {
        updatedAt: session.updatedAt || ''
      }
    },
    persistSession() {
      const session = {
        form: this.form,
        images: this.images,
        aiPreview: this.aiPreview,
        aiMeta: this.aiMeta,
        updatedAt: new Date().toISOString()
      }
      setSellSession(session)
      this.draftMeta.updatedAt = session.updatedAt
    },
    loadDraftDetail(draftId) {
      request({
        url: `/api/sell/draft/detail?draftId=${draftId}&userId=${this.form.userId || ''}`,
        success: (res) => {
          const payload = res.data || {}
          if (payload.code !== 200 || !payload.data) {
            this.showToast(payload.message || '草稿加载失败')
            return
          }
          const data = payload.data
          this.form = Object.assign({}, this.form, {
            draftId: data.draftId || '',
            reportId: '',
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            tradeType: data.tradeType || 'online',
            userId: data.userId ? String(data.userId) : this.form.userId,
            vehicleVin: data.vehicleVin || '',
            vehicleBaseId: data.vehicleBaseId || '',
            licensePlate: data.licensePlate || '',
            mileage: data.mileage || ''
          })
          this.images = Array.isArray(data.imageUrls) ? data.imageUrls : []
          this.aiPreview = data.aiReportSchema || null
          this.aiMeta = {
            reportId: data.reportId || '',
            prompt: data.aiPrompt || '',
            rawResponse: data.aiRawResponse || ''
          }
          this.persistSession()
        }
      })
    },
    chooseImage() {
      if (this.imageUploading) {
        return
      }
      if (!this.ensureAuthenticated()) {
        return
      }
      uni.chooseImage({
        count: 9 - this.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const files = res.tempFilePaths || []
          if (!files.length) {
            return
          }
          this.images = this.images.concat(files).slice(0, 9)
          this.persistSession()
        }
      })
    },
    deleteImage(index) {
      this.images.splice(index, 1)
      this.persistSession()
    },
    buildAuthHeader() {
      const token = uni.getStorageSync('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    getRemoteImageUrls() {
      return this.images.filter((image) => /^https?:\/\//.test(image))
    },
    uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: buildApiUrl('/api/ai/report/generate-layout'),
          filePath,
          name: 'image',
          header: this.buildAuthHeader(),
          success: (res) => {
            try {
              const payload = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
              if (payload.code !== 200 || !payload.data || !payload.data.imageUrl) {
                reject(new Error(payload.message || '图片上传失败'))
                return
              }
              resolve(payload.data.imageUrl)
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
      const localImages = this.images.filter((image) => !/^https?:\/\//.test(image))
      if (!localImages.length) {
        return remoteImages
      }
      this.imageUploading = true
      try {
        const uploadedImages = []
        for (const filePath of localImages) {
          const imageUrl = await this.uploadImage(filePath)
          uploadedImages.push(imageUrl)
        }
        this.images = remoteImages.concat(uploadedImages)
        this.persistSession()
        return this.images.slice()
      } finally {
        this.imageUploading = false
      }
    },
    buildDraftPayload(imageUrls) {
      return {
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
        imageUrls,
        aiReportSchema: this.aiPreview,
        structuredReport: this.aiPreview && this.aiPreview.structuredReport ? this.aiPreview.structuredReport : undefined,
        aiPrompt: this.aiMeta.prompt,
        aiRawResponse: this.aiMeta.rawResponse
      }
    },
    validateBeforeAi() {
      if (!this.form.title) {
        this.showToast('请输入车辆标题')
        return false
      }
      if (!this.form.description) {
        this.showToast('请输入卖点描述')
        return false
      }
      if (!this.form.vehicleVin) {
        this.showToast('请填写车架号 VIN')
        return false
      }
      if (this.images.length === 0) {
        this.showToast('请至少上传一张图片')
        return false
      }
      if (!this.form.userId) {
        this.showToast('请先登录后再操作')
        return false
      }
      return true
    },
    goToAiPreview() {
      if (this.actionLoading) {
        return
      }
      if (!this.validateBeforeAi()) {
        return
      }
      this.actionLoading = true
      this.aiPreview = null
      this.aiMeta = {
        reportId: '',
        prompt: '',
        rawResponse: ''
      }
      this.form.reportId = ''
      this.persistSession()
      openPage('/pages/sell/ai-preview')
      setTimeout(() => {
        this.actionLoading = false
      }, 200)
    },
    resetSellForm() {
      const userId = this.form.userId
      this.form = {
        draftId: '',
        reportId: '',
        title: '',
        description: '',
        price: '',
        tradeType: 'online',
        userId,
        vehicleVin: '',
        vehicleBaseId: '',
        licensePlate: '',
        mileage: ''
      }
      this.images = []
      this.aiPreview = null
      this.aiMeta = {
        reportId: '',
        prompt: '',
        rawResponse: ''
      }
      this.draftMeta = {
        updatedAt: ''
      }
    },
    async submitDraftSave() {
      this.persistSession()
      if (!this.form.userId) {
        return false
      }
      const imageUrls = await this.ensureDraftImagesUploaded()
      const payload = this.buildDraftPayload(imageUrls)
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
              this.persistSession()
              resolve(true)
              return
            }
            resolve(false)
          },
          fail: () => resolve(false)
        })
      })
    },
    async saveToDraftbox() {
      if (this.actionLoading || this.imageUploading) {
        return
      }
      if (!this.form.userId) {
        this.showToast('请先登录后再操作')
        return
      }
      this.actionLoading = true
      try {
        const success = await this.submitDraftSave()
        if (!success) {
          this.showToast('草稿保存失败')
          return
        }
        uni.showToast({ title: '已加入草稿箱', icon: 'success' })
        clearSellSession()
        this.resetSellForm()
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 600)
      } catch (error) {
        this.showToast((error && error.message) || '草稿保存失败')
      } finally {
        this.actionLoading = false
      }
    },
    async saveDraftSilently() {
      try {
        return await this.submitDraftSave()
      } catch (error) {
        return false
      }
    },
    handleExitPrompt() {
      if (!this.form.title && !this.form.description && this.images.length === 0) {
        return false
      }
      uni.showModal({
        title: '保存草稿',
        content: '当前内容尚未完成发布，是否存入草稿箱？',
        confirmText: '存草稿',
        cancelText: '直接退出',
        success: async (res) => {
          if (res.confirm) {
            const success = await this.saveDraftSilently()
            this.showToast(success ? '已存入草稿箱' : '草稿保存失败')
          }
          uni.switchTab({ url: '/pages/profile/profile' })
        }
      })
      return true
    },
    toImageSrc(image) {
      if (!image) {
        return ''
      }
      if (
        image.startsWith('http') ||
        image.startsWith('blob:') ||
        image.startsWith('data:')
      ) {
        return image
      }
      return buildApiUrl(image)
    },
    formatTime(value) {
      if (!value) {
        return ''
      }
      return String(value).replace('T', ' ').slice(0, 16)
    },
    showToast(title) {
      uni.showToast({ title, icon: 'none' })
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
.page-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.page-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-text);
}
.page-subtitle,
.helper-text,
.section-intro-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--c-muted);
}
.page-action {
  padding: 16rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #0b3c5d 0%, #174f78 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}
.page-action.draft {
  background: rgba(11, 60, 93, 0.08);
  color: var(--c-primary);
}
.page-action.disabled {
  opacity: 0.65;
}
.sell-form {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 18rpx 48rpx rgba(15, 23, 42, 0.08);
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
.section-intro-title,
.form-label {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text);
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
}
.add-text {
  margin-top: 8rpx;
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
.mini-label {
  display: block;
  font-size: 24rpx;
  color: var(--c-muted);
}
.compact {
  margin-top: 14rpx;
}
.draft-tips {
  background: rgba(11, 60, 93, 0.04);
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
