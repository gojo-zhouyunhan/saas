<template>
  <view class="container">
    <view class="page-head">
      <view class="page-copy">
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
        <text class="section-intro-desc">这里填写的标题、图片、描述和展示参数，会和 AI 生成内容一起保存。</text>
      </view>

      <view class="section">
        <text class="form-label required">车辆图片</text>
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
        <text class="form-label required">车辆标题</text>
        <input
          v-model="form.title"
          class="form-input"
          type="text"
          placeholder="例如：2020款 宝马 325Li M 运动套装"
          placeholder-style="color: #94A3B8;"
        />
      </view>

      <view class="section">
        <text class="form-label required">车源地址</text>
        <view class="address-stack">
          <view class="form-picker" @click="openSourceRegionPicker">
            <text :class="sourceRegionLabel ? 'picker-text' : 'picker-placeholder'">
              {{ sourceRegionLabel || '请选择省 / 市 / 区' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
          <input
            v-model="form.sourceDetailAddress"
            class="form-input compact"
            type="text"
            maxlength="-1"
            placeholder="请输入详细地址，如街道、门牌号或展厅名称"
            placeholder-style="color: #94A3B8;"
          />
        </view>
      </view>

      <view class="section">
        <text class="form-label">展示参数</text>
        <text class="helper-text">系统会自动关联当前登录账号和车型基础信息，并把这些必填参数带入 AI 生成。</text>
        <view class="form-grid">
          <view class="param-card param-card-wide">
            <text class="mini-label required">车架号 VIN</text>
            <input v-model="form.vehicleVin" class="form-input compact" type="text" maxlength="-1" placeholder="请输入车架号 VIN" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="param-card">
            <text class="mini-label required">车牌号</text>
            <input v-model="form.licensePlate" class="form-input compact" type="text" maxlength="-1" placeholder="请输入车牌号" placeholder-style="color: #94A3B8;" />
          </view>
          <view class="param-card">
            <text class="mini-label required">表显里程（公里）</text>
            <input v-model="form.mileage" class="form-input compact" type="number" placeholder="请输入表显里程" placeholder-style="color: #94A3B8;" />
          </view>
        </view>
      </view>

      <view class="section">
        <text class="form-label required">卖点描述</text>
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

    <view v-if="regionPopupVisible" class="region-mask" @click="closeSourceRegionPicker">
      <view class="region-panel" @click.stop>
        <view class="region-toolbar">
          <text class="region-action" @click="closeSourceRegionPicker">取消</text>
          <view class="region-title-wrap">
            <text class="region-title">选择车源地址</text>
            <text v-if="regionLoadFailed" class="region-subtitle">当前为本地地区数据</text>
            <text v-else-if="regionLoading" class="region-subtitle">正在更新地区数据</text>
          </view>
          <text class="region-action primary" @click="confirmSourceRegion">确定</text>
        </view>
        <picker-view
          class="region-picker-view"
          :value="regionPickerIndexes"
          indicator-class="region-indicator"
          @change="handleSourceRegionChange"
        >
          <picker-view-column>
            <view class="region-option" v-for="province in provinceOptions" :key="province.name">
              <text>{{ province.name }}</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="region-option" v-for="city in cityOptions" :key="city.name">
              <text>{{ city.name }}</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="region-option" v-for="district in districtOptions" :key="district.name">
              <text>{{ district.name }}</text>
            </view>
          </picker-view-column>
        </picker-view>
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

const KEEP_SELL_SESSION_ONCE_KEY = 'keepSellSessionOnce'
const AMAP_DISTRICT_API = 'https://restapi.amap.com/v3/config/district'
const AMAP_WEB_KEY = '6c88d549ce544a36e18779a26642e3aa'
const FALLBACK_REGION_OPTIONS = [
  { name: '北京市', children: [{ name: '北京市', children: [{ name: '东城区' }, { name: '西城区' }, { name: '朝阳区' }, { name: '海淀区' }] }] },
  { name: '天津市', children: [{ name: '天津市', children: [{ name: '和平区' }, { name: '河西区' }, { name: '南开区' }, { name: '滨海新区' }] }] },
  { name: '河北省', children: [{ name: '石家庄市', children: [{ name: '长安区' }, { name: '桥西区' }, { name: '裕华区' }] }, { name: '唐山市', children: [{ name: '路南区' }, { name: '路北区' }] }] },
  { name: '山西省', children: [{ name: '太原市', children: [{ name: '小店区' }, { name: '迎泽区' }, { name: '万柏林区' }] }] },
  { name: '内蒙古自治区', children: [{ name: '呼和浩特市', children: [{ name: '新城区' }, { name: '赛罕区' }] }] },
  { name: '辽宁省', children: [{ name: '沈阳市', children: [{ name: '和平区' }, { name: '沈河区' }, { name: '铁西区' }] }, { name: '大连市', children: [{ name: '中山区' }, { name: '甘井子区' }] }] },
  { name: '吉林省', children: [{ name: '长春市', children: [{ name: '南关区' }, { name: '朝阳区' }, { name: '宽城区' }] }] },
  { name: '黑龙江省', children: [{ name: '哈尔滨市', children: [{ name: '道里区' }, { name: '南岗区' }, { name: '香坊区' }] }] },
  { name: '上海市', children: [{ name: '上海市', children: [{ name: '黄浦区' }, { name: '浦东新区' }, { name: '闵行区' }, { name: '嘉定区' }] }] },
  { name: '江苏省', children: [{ name: '南京市', children: [{ name: '玄武区' }, { name: '秦淮区' }, { name: '江宁区' }] }, { name: '苏州市', children: [{ name: '姑苏区' }, { name: '吴中区' }] }] },
  { name: '浙江省', children: [{ name: '杭州市', children: [{ name: '上城区' }, { name: '拱墅区' }, { name: '余杭区' }] }, { name: '宁波市', children: [{ name: '海曙区' }, { name: '鄞州区' }] }] },
  { name: '安徽省', children: [{ name: '合肥市', children: [{ name: '瑶海区' }, { name: '蜀山区' }, { name: '包河区' }] }] },
  { name: '福建省', children: [{ name: '福州市', children: [{ name: '鼓楼区' }, { name: '台江区' }, { name: '仓山区' }] }, { name: '厦门市', children: [{ name: '思明区' }, { name: '湖里区' }] }] },
  { name: '江西省', children: [{ name: '南昌市', children: [{ name: '东湖区' }, { name: '西湖区' }, { name: '青山湖区' }] }] },
  { name: '山东省', children: [{ name: '济南市', children: [{ name: '历下区' }, { name: '市中区' }, { name: '槐荫区' }] }, { name: '青岛市', children: [{ name: '市南区' }, { name: '黄岛区' }] }] },
  { name: '河南省', children: [{ name: '郑州市', children: [{ name: '中原区' }, { name: '金水区' }, { name: '管城回族区' }] }] },
  { name: '湖北省', children: [{ name: '武汉市', children: [{ name: '江岸区' }, { name: '武昌区' }, { name: '洪山区' }] }] },
  { name: '湖南省', children: [{ name: '长沙市', children: [{ name: '芙蓉区' }, { name: '岳麓区' }, { name: '雨花区' }] }] },
  { name: '广东省', children: [{ name: '广州市', children: [{ name: '越秀区' }, { name: '天河区' }, { name: '番禺区' }] }, { name: '深圳市', children: [{ name: '福田区' }, { name: '南山区' }, { name: '宝安区' }] }, { name: '东莞市', children: [{ name: '东城街道' }, { name: '南城街道' }] }] },
  { name: '广西壮族自治区', children: [{ name: '南宁市', children: [{ name: '青秀区' }, { name: '兴宁区' }, { name: '江南区' }] }] },
  { name: '海南省', children: [{ name: '海口市', children: [{ name: '龙华区' }, { name: '美兰区' }] }, { name: '三亚市', children: [{ name: '吉阳区' }, { name: '天涯区' }] }] },
  { name: '重庆市', children: [{ name: '重庆市', children: [{ name: '渝中区' }, { name: '江北区' }, { name: '渝北区' }, { name: '九龙坡区' }] }] },
  { name: '四川省', children: [{ name: '成都市', children: [{ name: '锦江区' }, { name: '武侯区' }, { name: '双流区' }] }] },
  { name: '贵州省', children: [{ name: '贵阳市', children: [{ name: '南明区' }, { name: '云岩区' }, { name: '观山湖区' }] }] },
  { name: '云南省', children: [{ name: '昆明市', children: [{ name: '五华区' }, { name: '盘龙区' }, { name: '官渡区' }] }] },
  { name: '西藏自治区', children: [{ name: '拉萨市', children: [{ name: '城关区' }, { name: '堆龙德庆区' }] }] },
  { name: '陕西省', children: [{ name: '西安市', children: [{ name: '新城区' }, { name: '雁塔区' }, { name: '未央区' }] }] },
  { name: '甘肃省', children: [{ name: '兰州市', children: [{ name: '城关区' }, { name: '七里河区' }] }] },
  { name: '青海省', children: [{ name: '西宁市', children: [{ name: '城中区' }, { name: '城西区' }] }] },
  { name: '宁夏回族自治区', children: [{ name: '银川市', children: [{ name: '兴庆区' }, { name: '金凤区' }] }] },
  { name: '新疆维吾尔自治区', children: [{ name: '乌鲁木齐市', children: [{ name: '天山区' }, { name: '沙依巴克区' }] }] }
]

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
        mileage: '',
        sourceProvince: '',
        sourceCity: '',
        sourceDistrict: '',
        sourceDetailAddress: '',
        editingPublished: false
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
      regionPopupVisible: false,
      regionLoading: false,
      regionLoadFailed: false,
      regionRemoteLoaded: false,
      regionOptions: FALLBACK_REGION_OPTIONS,
      regionPickerIndexes: [0, 0, 0],
      draftMeta: {
        updatedAt: ''
      }
    }
  },
  computed: {
    descriptionLength() {
      return (this.form.description || '').length
    },
    regionPickerValue() {
      return [
        this.form.sourceProvince || '',
        this.form.sourceCity || '',
        this.form.sourceDistrict || ''
      ]
    },
    sourceRegionLabel() {
      return this.regionPickerValue.filter(Boolean).join(' / ')
    },
    provinceOptions() {
      return this.regionOptions
    },
    selectedProvince() {
      return this.provinceOptions[this.regionPickerIndexes[0]] || this.provinceOptions[0] || { children: [] }
    },
    cityOptions() {
      return this.selectedProvince.children || []
    },
    selectedCity() {
      return this.cityOptions[this.regionPickerIndexes[1]] || this.cityOptions[0] || { children: [] }
    },
    districtOptions() {
      return this.selectedCity.children || []
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
        const userId = user.userId || user.id || user.uid || user.number || user.userNo
        if (userId) {
          this.form.userId = String(userId)
        }
      } catch (error) {
        console.warn('hydrate user context failed', error)
      }
    },
    restoreSession(options = {}) {
      if (options.edit === '1' && options.reportId) {
        this.loadPublishedDetail(options.reportId)
        return
      }
      const draftId = options.draftId
      if (draftId) {
        this.loadDraftDetail(draftId)
        return
      }
      if (!this.consumeKeepSessionOnceFlag()) {
        clearSellSession()
        this.resetSellForm()
        return
      }
      const session = getSellSession()
      if (session) {
        this.applySession(session)
      }
    },
    consumeKeepSessionOnceFlag() {
      const keepSession = uni.getStorageSync(KEEP_SELL_SESSION_ONCE_KEY)
      uni.removeStorageSync(KEEP_SELL_SESSION_ONCE_KEY)
      return keepSession === true || keepSession === '1'
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
            mileage: data.mileage || '',
            sourceProvince: data.sourceProvince || '',
            sourceCity: data.sourceCity || '',
            sourceDistrict: data.sourceDistrict || '',
            sourceDetailAddress: data.sourceDetailAddress || '',
            editingPublished: true
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
    loadPublishedDetail(reportId) {
      request({
        url: `/api/ai/report/detail?reportId=${reportId}&userId=${this.form.userId || ''}`,
        success: (res) => {
          const payload = res.data || {}
          if (payload.code !== 200 || !payload.data) {
            this.showToast(payload.message || '车源加载失败')
            return
          }
          const data = payload.data
          this.form = Object.assign({}, this.form, {
            draftId: '',
            reportId: data.reportId || '',
            title: data.title || '',
            description: data.description || '',
            price: data.sellerPrice || '',
            tradeType: data.tradeType || 'online',
            userId: data.userId ? String(data.userId) : this.form.userId,
            vehicleVin: data.vehicleVin || '',
            vehicleBaseId: data.vehicleBaseId || '',
            licensePlate: data.licensePlate || '',
            mileage: data.mileage || '',
            sourceProvince: data.sourceProvince || '',
            sourceCity: data.sourceCity || '',
            sourceDistrict: data.sourceDistrict || '',
            sourceDetailAddress: data.sourceDetailAddress || ''
          })
          this.images = this.normalizeImageList(data.imageUrls)
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
    normalizeImageList(images) {
      if (Array.isArray(images)) {
        return images.filter(Boolean)
      }
      return []
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
    openSourceRegionPicker() {
      this.syncRegionIndexesFromForm()
      this.regionPopupVisible = true
      this.ensureRegionOptions()
    },
    closeSourceRegionPicker() {
      this.regionPopupVisible = false
    },
    confirmSourceRegion() {
      const region = this.getRegionByIndexes(this.regionPickerIndexes)
      this.form.sourceProvince = region.province
      this.form.sourceCity = region.city
      this.form.sourceDistrict = region.district
      this.regionPopupVisible = false
      this.persistSession()
    },
    handleSourceRegionChange(event) {
      const value = (event && event.detail && event.detail.value) || [0, 0, 0]
      const provinceIndex = Number(value[0]) || 0
      let cityIndex = Number(value[1]) || 0
      let districtIndex = Number(value[2]) || 0
      const previousProvinceIndex = this.regionPickerIndexes[0]
      const previousCityIndex = this.regionPickerIndexes[1]
      if (provinceIndex !== previousProvinceIndex) {
        cityIndex = 0
        districtIndex = 0
      } else if (cityIndex !== previousCityIndex) {
        districtIndex = 0
      }
      this.regionPickerIndexes = this.normalizeRegionIndexes([provinceIndex, cityIndex, districtIndex])
    },
    ensureRegionOptions() {
      if (this.regionRemoteLoaded || this.regionLoading) {
        return
      }
      this.regionLoading = true
      uni.request({
        url: `${AMAP_DISTRICT_API}?keywords=中国&subdistrict=3&extensions=base&key=${AMAP_WEB_KEY}`,
        method: 'GET',
        success: (res) => {
          const payload = res.data || {}
          const provinces = payload.districts && payload.districts[0] && payload.districts[0].districts
          const options = this.normalizeRegionOptions(provinces)
          if (options.length) {
            this.regionOptions = options
            this.regionRemoteLoaded = true
            this.regionLoadFailed = false
            this.syncRegionIndexesFromForm()
            return
          }
          this.regionLoadFailed = true
        },
        fail: () => {
          this.regionLoadFailed = true
        },
        complete: () => {
          this.regionLoading = false
        }
      })
    },
    normalizeRegionOptions(provinces = []) {
      if (!Array.isArray(provinces)) {
        return []
      }
      return provinces
        .filter((province) => province && province.name)
        .map((province) => {
          const cities = Array.isArray(province.districts) && province.districts.length
            ? province.districts
            : [{ name: province.name, districts: [] }]
          return {
            name: province.name,
            children: cities
              .filter((city) => city && city.name)
              .map((city) => {
                const districts = Array.isArray(city.districts) && city.districts.length
                  ? city.districts
                  : [{ name: city.name }]
                return {
                  name: city.name,
                  children: districts
                    .filter((district) => district && district.name)
                    .map((district) => ({ name: district.name }))
                }
              })
          }
        })
    },
    syncRegionIndexesFromForm() {
      const provinceIndex = Math.max(0, this.regionOptions.findIndex((province) => province.name === this.form.sourceProvince))
      const province = this.regionOptions[provinceIndex] || { children: [] }
      const cityIndex = Math.max(0, (province.children || []).findIndex((city) => city.name === this.form.sourceCity))
      const city = (province.children || [])[cityIndex] || { children: [] }
      const districtIndex = Math.max(0, (city.children || []).findIndex((district) => district.name === this.form.sourceDistrict))
      this.regionPickerIndexes = this.normalizeRegionIndexes([provinceIndex, cityIndex, districtIndex])
    },
    normalizeRegionIndexes(indexes) {
      const provinceIndex = Math.min(Math.max(Number(indexes[0]) || 0, 0), Math.max(this.provinceOptions.length - 1, 0))
      const cityList = (this.provinceOptions[provinceIndex] && this.provinceOptions[provinceIndex].children) || []
      const cityIndex = Math.min(Math.max(Number(indexes[1]) || 0, 0), Math.max(cityList.length - 1, 0))
      const districtList = (cityList[cityIndex] && cityList[cityIndex].children) || []
      const districtIndex = Math.min(Math.max(Number(indexes[2]) || 0, 0), Math.max(districtList.length - 1, 0))
      return [provinceIndex, cityIndex, districtIndex]
    },
    getRegionByIndexes(indexes) {
      const normalized = this.normalizeRegionIndexes(indexes)
      const province = this.provinceOptions[normalized[0]] || {}
      const city = ((province.children || [])[normalized[1]]) || {}
      const district = ((city.children || [])[normalized[2]]) || {}
      return {
        province: province.name || '',
        city: city.name || '',
        district: district.name || ''
      }
    },
    buildAuthHeader() {
      const token = uni.getStorageSync('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
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
    async ensureDraftImagesUploaded() {
      const remoteImages = this.getRemoteImageUrls()
      const localImages = this.images.filter((image) => !this.isPersistedImageUrl(image))
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
        sourceProvince: this.form.sourceProvince,
        sourceCity: this.form.sourceCity,
        sourceDistrict: this.form.sourceDistrict,
        sourceDetailAddress: this.form.sourceDetailAddress,
        imageUrls,
        aiReportSchema: this.aiPreview,
        structuredReport: this.aiPreview && this.aiPreview.structuredReport ? this.aiPreview.structuredReport : undefined,
        aiPrompt: this.aiMeta.prompt,
        aiRawResponse: this.aiMeta.rawResponse
      }
    },
    validateRequiredFields() {
      if (!this.form.userId) {
        this.hydrateUserContext()
        if (!this.form.userId) {
          this.showToast('请先登录后再操作')
          return false
        }
      }
      const requiredRules = [
        { valid: this.images.length > 0, message: '请至少上传一张车辆图片' },
        { valid: this.hasValue(this.form.title), message: '请输入车辆标题' },
        { valid: this.hasValue(this.form.vehicleVin), message: '请输入车架号 VIN' },
        { valid: this.hasValue(this.form.licensePlate), message: '请输入车牌号' },
        { valid: this.hasValue(this.form.mileage), message: '请输入表显里程' },
        { valid: this.hasValue(this.form.sourceProvince) && this.hasValue(this.form.sourceCity) && this.hasValue(this.form.sourceDistrict), message: '请选择车源省市区' },
        { valid: this.hasValue(this.form.sourceDetailAddress), message: '请输入车源详细地址' },
        { valid: this.hasValue(this.form.description), message: '请输入卖点描述' }
      ]
      const missing = requiredRules.find((item) => !item.valid)
      if (missing) {
        this.showToast(missing.message)
        return false
      }
      return true
    },
    hasValue(value) {
      return value !== undefined && value !== null && String(value).trim() !== ''
    },
    validateBeforeAi() {
      return this.validateRequiredFields()
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
      const reportId = this.form.reportId || ''
      this.aiMeta = {
        reportId,
        prompt: '',
        rawResponse: ''
      }
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
        mileage: '',
        sourceProvince: '',
        sourceCity: '',
        sourceDistrict: '',
        sourceDetailAddress: '',
        editingPublished: false
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
        this.hydrateUserContext()
        if (!this.form.userId) {
          return false
        }
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
              this.form.vehicleBaseId = result.data.vehicleBaseId || this.form.vehicleBaseId
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
        this.hydrateUserContext()
        if (!this.form.userId) {
          this.showToast('请先登录后再操作')
          return
        }
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
          openPage('/pages/index/index')
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
      if (!this.form.title && !this.form.description && !this.sourceRegionLabel && !this.form.sourceDetailAddress && this.images.length === 0) {
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
          openPage('/pages/profile/profile')
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
        image.startsWith('data:') ||
        image.startsWith('file:') ||
        image.startsWith('wxfile:')
      ) {
        return image
      }
      if (image.startsWith('/upload/')) {
        return buildApiUrl(image)
      }
      return image
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
  padding: calc(24rpx + var(--status-bar-height)) 24rpx 190rpx;
  background:
    linear-gradient(180deg, rgba(230, 240, 246, 0.98) 0%, rgba(246, 249, 252, 0.98) 38%, #f3f4f6 100%);
}
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 26rpx;
  padding: 10rpx 2rpx 0;
}
.page-copy {
  flex: 1;
  min-width: 0;
}
.page-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}
.page-title {
  display: block;
  font-size: 40rpx;
  line-height: 1.18;
  font-weight: 800;
  color: #142536;
}
.page-subtitle,
.helper-text,
.section-intro-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #66758a;
}
.page-action {
  min-width: 92rpx;
  min-height: 92rpx;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #0b3c5d 0%, #174f78 100%);
  color: #fff;
  font-size: 24rpx;
  line-height: 1.24;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 14rpx 30rpx rgba(11, 60, 93, 0.22);
}
.page-action.draft {
  min-width: 126rpx;
  background: rgba(11, 60, 93, 0.08);
  color: var(--c-primary);
  box-shadow: none;
}
.page-action.disabled {
  opacity: 0.65;
}
.sell-form {
  display: grid;
  gap: 18rpx;
}
.section {
  padding: 28rpx 30rpx 30rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.06);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 14rpx 34rpx rgba(15, 23, 42, 0.06);
}
.section-intro {
  padding: 30rpx;
  border-color: rgba(11, 60, 93, 0.08);
  background: linear-gradient(135deg, rgba(236, 244, 249, 0.98) 0%, rgba(255, 255, 255, 0.96) 100%);
  box-shadow: 0 12rpx 28rpx rgba(11, 60, 93, 0.06);
}
.section-intro-title,
.form-label {
  display: block;
  font-size: 28rpx;
  line-height: 1.35;
  font-weight: 800;
  color: #172536;
}

.required::after {
  content: ' *';
  color: var(--c-danger);
  font-weight: 700;
}
.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 18rpx;
}
.upload-item {
  width: 164rpx;
  height: 164rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1rpx rgba(15, 23, 42, 0.08);
}
.upload-item.add {
  border: 2rpx dashed #b8c7d5;
  background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.add-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba(11, 60, 93, 0.08);
  font-size: 42rpx;
  line-height: 50rpx;
  color: var(--c-primary);
  text-align: center;
}
.add-text {
  margin-top: 12rpx;
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
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background-color: rgba(15, 23, 42, 0.68);
  color: #ffffff;
  font-size: 26rpx;
  line-height: 36rpx;
  text-align: center;
}
.form-input,
.form-textarea {
  width: 100%;
  margin-top: 18rpx;
  padding: 0 24rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.12);
  border-radius: 14rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #172536;
  font-size: 27rpx;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
}
.form-input {
  height: 86rpx;
  line-height: 86rpx;
}
.address-stack {
  display: grid;
  gap: 14rpx;
  margin-top: 18rpx;
}
.form-picker {
  width: 100%;
  min-height: 86rpx;
  padding: 0 24rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.12);
  border-radius: 14rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}
.picker-text,
.picker-placeholder {
  min-width: 0;
  flex: 1;
  font-size: 27rpx;
  line-height: 1.45;
  word-break: break-all;
}
.picker-text {
  color: #172536;
}
.picker-placeholder {
  color: #94a3b8;
}
.picker-arrow {
  color: #94a3b8;
  font-size: 36rpx;
  line-height: 1;
}
.form-textarea {
  min-height: 220rpx;
  padding: 22rpx 24rpx;
  line-height: 1.7;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20rpx;
  margin-top: 22rpx;
}
.param-card {
  min-width: 0;
  padding: 0;
}
.mini-label {
  display: block;
  font-size: 24rpx;
  line-height: 1.35;
  color: #64748b;
  font-weight: 700;
}
.compact {
  margin-top: 12rpx;
}
.draft-tips {
  border-color: rgba(11, 60, 93, 0.08);
  background: rgba(245, 249, 252, 0.96);
}
.region-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.42);
  display: flex;
  align-items: flex-end;
}
.region-panel {
  width: 100%;
  max-height: 72vh;
  border-radius: 28rpx 28rpx 0 0;
  background: #ffffff;
  box-shadow: 0 -18rpx 50rpx rgba(15, 23, 42, 0.18);
  overflow: hidden;
}
.region-toolbar {
  min-height: 104rpx;
  padding: 0 28rpx;
  border-bottom: 1rpx solid rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}
.region-title-wrap {
  min-width: 0;
  flex: 1;
  text-align: center;
}
.region-title,
.region-subtitle {
  display: block;
}
.region-title {
  font-size: 30rpx;
  line-height: 1.35;
  font-weight: 800;
  color: #172536;
}
.region-subtitle {
  margin-top: 4rpx;
  font-size: 22rpx;
  line-height: 1.3;
  color: #94a3b8;
}
.region-action {
  min-width: 92rpx;
  min-height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 28rpx;
  font-weight: 700;
}
.region-action.primary {
  color: var(--c-primary);
}
.region-picker-view {
  width: 100%;
  height: 520rpx;
}
.region-option {
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 8rpx;
  box-sizing: border-box;
  text-align: center;
  color: #172536;
  font-size: 28rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
