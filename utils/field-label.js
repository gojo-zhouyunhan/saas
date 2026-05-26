const FIELD_LABEL_MAP = {
  vehicleName: '车辆名称',
  tradeType: '交易类型',
  otherInfo: '其余基础信息',
  vin: 'VIN',
  productionDate: '生产日期',
  firstRegistrationDate: '首次上牌日期',
  configurationIntro: '配置介绍',
  mileage: '里程',
  brand: '品牌',
  series: '车系',
  model: '车型',
  color: '颜色',
  displacement: '排量',
  fuelType: '燃料类型',
  transmission: '变速箱',
  emissionStandard: '排放标准',
  licensePlateLocation: '上牌地',
  ownerCount: '过户次数',
  annualInspectionDate: '年检到期',
  insuranceExpirationDate: '保险到期',
  scene: '',
  preferredStyle: '',
  style: ''
}

const SECTION_LABEL_MAP = {
  basicInfo: '基本信息',
  appearanceInspection: '外观检测',
  interiorInspection: '内饰检测',
  mechanicalPerformance: '机械性能',
  maintenanceHistory: '维修历史',
  overallEvaluation: '综合评估',
  vehicleOverview: '车身概览',
  paintCondition: '漆面状况',
  bodyGlassParts: '车身玻璃与覆盖件',
  tiresWheels: '轮胎轮毂',
  conclusion: '结论'
}

const WORD_LABEL_MAP = {
  vin: 'VIN',
  production: '生产',
  first: '首次',
  registration: '上牌',
  date: '日期',
  configuration: '配置',
  intro: '介绍',
  mileage: '里程',
  brand: '品牌',
  series: '车系',
  model: '车型',
  color: '颜色',
  displacement: '排量',
  fuel: '燃料',
  type: '类型',
  transmission: '变速箱',
  emission: '排放',
  standard: '标准',
  license: '牌照',
  plate: '牌照',
  location: '地区',
  owner: '车主',
  count: '次数',
  annual: '年',
  inspection: '检验',
  insurance: '保险',
  expiration: '到期'
}

function containsChinese(value) {
  return /[\u4e00-\u9fff]/.test(value)
}

function lowerFirst(value) {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value
}

function splitIdentifier(value) {
  return String(value).match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[0-9]+/g) || []
}

function tryAutoTranslate(value) {
  const tokens = splitIdentifier(value).map((token) => token.toLowerCase()).filter(Boolean)
  if (!tokens.length) {
    return ''
  }
  const translated = tokens.map((token) => WORD_LABEL_MAP[token]).filter((item) => item !== undefined)
  if (translated.length !== tokens.length) {
    return ''
  }
  return translated.join('')
}

function pickMapValue(map, rawKey) {
  const key = String(rawKey || '').trim()
  if (!key) {
    return ''
  }
  if (Object.prototype.hasOwnProperty.call(map, key)) {
    return map[key]
  }
  const normalized = lowerFirst(key)
  if (normalized !== key && Object.prototype.hasOwnProperty.call(map, normalized)) {
    return map[normalized]
  }
  const lower = key.toLowerCase()
  if (lower !== key && Object.prototype.hasOwnProperty.call(map, lower)) {
    return map[lower]
  }
  return undefined
}

export function getBackendFieldLabel(key) {
  const rawKey = String(key || '').trim()
  if (!rawKey) {
    return ''
  }
  if (containsChinese(rawKey)) {
    return rawKey
  }
  const mapped = pickMapValue(FIELD_LABEL_MAP, rawKey)
  if (mapped !== undefined) {
    return mapped
  }
  return tryAutoTranslate(rawKey)
}

export function getBackendSectionLabel(key) {
  const rawKey = String(key || '').trim()
  if (!rawKey) {
    return ''
  }
  if (containsChinese(rawKey)) {
    return rawKey
  }
  const mapped = pickMapValue(SECTION_LABEL_MAP, rawKey)
  if (mapped !== undefined) {
    return mapped
  }
  return tryAutoTranslate(rawKey)
}

