const UI_LABEL_MAP = {
  profile: '\u6211\u7684',
  settings: '\u8bbe\u7f6e',
  balance: '\u8d26\u6237\u4f59\u989d',
  currentBalance: '\u5f53\u524d\u4f59\u989d',
  recharge: '\u5145\u503c',
  rechargeTitle: '\u8d26\u6237\u5145\u503c',
  myCars: '\u6211\u7684\u8f66\u8f86',
  drafts: '\u8349\u7a3f\u7bb1',
  orders: '\u6211\u7684\u8ba2\u5355',
  favorites: '\u6211\u7684\u6536\u85cf',
  points: '\u6211\u7684\u79ef\u5206',
  helpCenter: '\u5e2e\u52a9\u4e2d\u5fc3',
  feedback: '\u610f\u89c1\u53cd\u9988',
  about: '\u5173\u4e8e\u6211\u4eec',
  logOut: '\u9000\u51fa\u767b\u5f55',
  user: '\u7528\u6237',
  idPrefix: '\u7f16\u53f7\uff1a',
  basicMember: '\u57fa\u7840\u7248',
  proMember: '\u4e13\u4e1a\u7248',
  enterpriseMember: '\u4f01\u4e1a\u7248',
  comingSoon: '\u5f00\u53d1\u4e2d',
  notLoggedIn: '\u672a\u767b\u5f55',
  logOutTitle: '\u786e\u8ba4\u9000\u51fa\u767b\u5f55',
  logOutContent: '\u9000\u51fa\u540e\u9700\u8981\u91cd\u65b0\u767b\u5f55\u3002',
  logOutConfirm: '\u9000\u51fa',
  amount: '\u5145\u503c\u91d1\u989d',
  enterAnotherAmount: '\u8f93\u5165\u5176\u4ed6\u91d1\u989d',
  paymentMethod: '\u652f\u4ed8\u65b9\u5f0f',
  wechatPay: '\u5fae\u4fe1\u652f\u4ed8',
  wechatShort: '\u5fae',
  openMockWechatCheckout: '\u8df3\u8f6c\u5230\u6a21\u62df\u5fae\u4fe1\u6536\u94f6\u53f0',
  alipay: '\u652f\u4ed8\u5b9d',
  alipayShort: '\u652f',
  openMockAlipayCheckout: '\u8df3\u8f6c\u5230\u6a21\u62df\u652f\u4ed8\u5b9d\u6536\u94f6\u53f0',
  minimumAmount: '\u5145\u503c\u91d1\u989d\u4e0d\u80fd\u5c0f\u4e8e1\u5143',
  orderFailed: '\u521b\u5efa\u8ba2\u5355\u5931\u8d25',
  networkError: '\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5',
  mockCheckout: '\u6a21\u62df\u6536\u94f6\u53f0',
  payAmount: '\u652f\u4ed8\u91d1\u989d',
  orderNo: '\u8ba2\u5355\u7f16\u53f7',
  method: '\u652f\u4ed8\u65b9\u5f0f',
  paid: '\u652f\u4ed8\u6210\u529f',
  payNow: '\u786e\u8ba4\u652f\u4ed8',
  back: '\u8fd4\u56de',
  payFailed: '\u652f\u4ed8\u5931\u8d25',
  rechargeSuccess: '\u5145\u503c\u6210\u529f',
  currencyPrefix: '\u00a5',
  upgradeMember: '\u5347\u7ea7\u4f1a\u5458',
  membershipTitle: '\u4f1a\u5458\u5347\u7ea7',
  currentMember: '\u5f53\u524d\u4f1a\u5458',
  ordinaryUser: '\u666e\u901a\u7528\u6237',
  expireAt: '\u5230\u671f\u65f6\u95f4',
  noExpireTime: '\u6682\u65e0\u5230\u671f\u65f6\u95f4',
  monthly: '\u5143/\u6708',
  buyNow: '\u7acb\u5373\u5f00\u901a',
  basicPlan: '\u57fa\u7840\u7248',
  proPlan: '\u4e13\u4e1a\u7248',
  enterprisePlan: '\u4f01\u4e1a\u7248',
  planLoadFailed: '\u5957\u9910\u52a0\u8f7d\u5931\u8d25',
  planEmpty: '\u6682\u65e0\u53ef\u7528\u5957\u9910',
  selectPlanFirst: '\u8bf7\u5148\u9009\u62e9\u4f1a\u5458\u5957\u9910',
  memberOrderFailed: '\u521b\u5efa\u4f1a\u5458\u8ba2\u5355\u5931\u8d25',
  currentPlanUnavailable: '\u5f53\u524d\u4f1a\u5458\u4e0d\u53ef\u91cd\u590d\u8d2d\u4e70',
  downgradeUnavailable: '\u4e0d\u652f\u6301\u5411\u4e0b\u964d\u7ea7',
  upgradePayAmount: '\u5347\u7ea7\u8865\u5dee',
  noUpgradeablePlan: '\u5f53\u524d\u5df2\u662f\u6700\u9ad8\u7ea7\u4f1a\u5458',
  memberPayTitle: '\u4f1a\u5458\u652f\u4ed8',
  planName: '\u4f1a\u5458\u5957\u9910',
  memberUpgradeSuccess: '\u4f1a\u5458\u5347\u7ea7\u6210\u529f'
  ,
  continueEditTitle: '\u662f\u5426\u7ee7\u7eed\u7f16\u8f91',
  continueEditContent: '\u662f\u5426\u7ee7\u7eed\u7f16\u8f91\u8be5\u8349\u7a3f\uff1f',
  yes: '\u662f',
  no: '\u5426',
  gotIt: '\u77e5\u9053\u4e86',
  mockPayDone: '\u6a21\u62df\u652f\u4ed8\u5b8c\u6210\uff0c\u652f\u4ed8\u6210\u529f\u3002'
  ,
  refresh: '\u5237\u65b0',
  loadingDrafts: '\u6b63\u5728\u52a0\u8f7d\u8349\u7a3f...',
  noDrafts: '\u6682\u65e0\u8349\u7a3f',
  draftEmptyDesc: '\u4f60\u5728\u53d1\u5e03\u8f66\u8f86\u8fc7\u7a0b\u4e2d\u4fdd\u5b58\u7684\u6587\u672c\u548c\u56fe\u7247\u8349\u7a3f\uff0c\u4f1a\u663e\u793a\u5728\u8fd9\u91cc\u3002',
  loadingMyCars: '\u6b63\u5728\u52a0\u8f7d\u6211\u7684\u8f66\u8f86...',
  noMyCars: '\u6682\u65e0\u5df2\u53d1\u5e03\u8f66\u8f86',
  myCarsEmptyDesc: '\u4f60\u53d1\u5e03\u6210\u529f\u7684\u8f66\u6e90\u4f1a\u663e\u793a\u5728\u8fd9\u91cc\u3002',
  edit: '\u7f16\u8f91',
  delete: '\u5220\u9664',
  deleteCarTitle: '\u5220\u9664\u8f66\u8f86',
  deleteCarContent: '\u786e\u8ba4\u5220\u9664\u8fd9\u8f86\u8f66\u5417\uff1f\u5c06\u540c\u65f6\u771f\u5220\u9664 AI \u68c0\u6d4b\u62a5\u544a\u548c\u8f66\u8f86\u57fa\u7840\u4fe1\u606f\u3002',
  deleteSuccess: '\u5220\u9664\u6210\u529f',
  deleteFailed: '\u5220\u9664\u5931\u8d25',
  unnamedDraft: '\u672a\u547d\u540d\u8349\u7a3f',
  noDescription: '\u6682\u65e0\u63cf\u8ff0',
  noVin: '\u65e0 VIN',
  onlineTrade: '\u7ebf\u4e0a\u6c9f\u901a',
  offlineTrade: '\u7ebf\u4e0b\u770b\u8f66',
  unpriced: '\u672a\u5b9a\u4ef7',
  savedJustNow: '\u521a\u521a\u4fdd\u5b58'
  ,
  createMockOrder: '\u521b\u5efa\u6a21\u62df\u8ba2\u5355',
  loadingOrders: '\u8ba2\u5355\u52a0\u8f7d\u4e2d...',
  noOrders: '\u8fd8\u6ca1\u6709\u8ba2\u5355',
  noOrdersDesc: '\u70b9\u51fb\u53f3\u4e0a\u89d2\u5148\u521b\u5efa\u4e00\u4e2a\u6a21\u62df\u8ba2\u5355\uff0c\u518d\u6d4b\u8bd5\u5fae\u4fe1\u6216\u652f\u4ed8\u5b9d\u6309\u94ae\u3002',
  mockOrder: '\u6a21\u62df\u8ba2\u5355',
  orderNoLabel: '\u8ba2\u5355\u53f7\uff1a',
  createdAt: '\u521b\u5efa\u65f6\u95f4',
  paidAt: '\u652f\u4ed8\u65f6\u95f4',
  tradeNo: '\u6d41\u6c34\u53f7',
  orderLoadFailed: '\u8ba2\u5355\u52a0\u8f7d\u5931\u8d25',
  createFailed: '\u521b\u5efa\u5931\u8d25',
  orderCreated: '\u8ba2\u5355\u5df2\u521b\u5efa',
  pendingPay: '\u5f85\u652f\u4ed8',
  completed: '\u5df2\u5b8c\u6210',
  cancelled: '\u5df2\u53d6\u6d88',
  refunded: '\u5df2\u9000\u6b3e',
  unknownStatus: '\u672a\u77e5\u72b6\u6001'
}

const FIELD_LABEL_MAP = {
  vehicleName: '车辆名称',
  tradeType: '交易类型',
  otherInfo: '其余基础信息',
  vin: 'VIN',
  productionDate: '生产日期',
  firstRegistrationDate: '首次上牌日期',
  configurationIntro: '配置介绍',
  mileage: '里程',
  displayMileage: '表显里程',
  brand: '品牌',
  series: '车系',
  model: '车型',
  manufacturer: '厂商',
  color: '颜色',
  displacement: '排量',
  fuelType: '燃料类型',
  transmission: '变速箱',
  transmissionType: '变速箱',
  engineModel: '发动机型号',
  emissionStandard: '排放标准',
  licensePlate: '车牌号',
  licensePlateLocation: '上牌地',
  vehicleSource: '车辆来源',
  paintCondition: '漆面状况',
  overallStatus: '整体状态',
  overallCondition: '整体状况',
  structureCondition: '结构状况',
  bodyStructureCondition: '车身结构状况',
  glassCondition: '玻璃状况',
  bodyGlassCondition: '车身玻璃状况',
  tireWheelCondition: '轮胎轮毂状况',
  tireCondition: '轮胎状况',
  wheelCondition: '轮毂状况',
  exteriorCondition: '外观状况',
  bodyCondition: '车身状况',
  bodyPanelCondition: '覆盖件状况',
  visibleDamage: '可见损伤',
  paintRepair: '漆面修复',
  originalFactoryStatus: '原厂状态',
  interiorStatus: '内饰状态',
  cabinCondition: '座舱状况',
  seatCondition: '座椅状况',
  wearCondition: '磨损状况',
  centralControlCondition: '中控台状况',
  dashboardCondition: '仪表台状况',
  steeringWheelCondition: '方向盘状况',
  electronicFunction: '电子功能',
  electronicFunctions: '电子功能',
  functionalStatus: '功能状态',
  functionStatus: '功能状态',
  comfortConfig: '舒适配置',
  interiorCleanliness: '内饰整洁度',
  odorCondition: '异味状况',
  storageCondition: '储物空间状况',
  doorTrimCondition: '门板饰板状况',
  roofLiningCondition: '顶棚状况',
  floorMatCondition: '脚垫地毯状况',
  functionConfig: '功能配置',
  safetyStatus: '安全状态',
  airbagStatus: '安全气囊状态',
  instrumentStatus: '仪表状态',
  engineSystem: '发动机系统',
  engineCondition: '发动机状况',
  gearboxCondition: '变速箱状况',
  chassisCondition: '底盘状况',
  gearboxChassis: '变速箱与底盘',
  brakeSteering: '制动与转向',
  brakeCondition: '制动状况',
  steeringCondition: '转向状况',
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
  status: '状态',
  summary: '摘要',
  description: '说明',
  note: '备注',
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
  overallStatus: '整体状态',
  overallCondition: '整体状况',
  structureCondition: '结构状况',
  bodyStructureCondition: '车身结构状况',
  glassCondition: '玻璃状况',
  bodyGlassCondition: '车身玻璃状况',
  tireWheelCondition: '轮胎轮毂状况',
  tireCondition: '轮胎状况',
  wheelCondition: '轮毂状况',
  exteriorCondition: '外观状况',
  bodyCondition: '车身状况',
  bodyPanelCondition: '覆盖件状况',
  visibleDamage: '可见损伤',
  paintRepair: '漆面修复',
  originalFactoryStatus: '原厂状态',
  interiorStatus: '内饰状态',
  cabinCondition: '座舱状况',
  seatCondition: '座椅状况',
  wearCondition: '磨损状况',
  centralControlCondition: '中控台状况',
  dashboardCondition: '仪表台状况',
  steeringWheelCondition: '方向盘状况',
  electronicFunction: '电子功能',
  electronicFunctions: '电子功能',
  functionalStatus: '功能状态',
  functionStatus: '功能状态',
  comfortConfig: '舒适配置',
  interiorCleanliness: '内饰整洁度',
  odorCondition: '异味状况',
  storageCondition: '储物空间状况',
  doorTrimCondition: '门板饰板状况',
  roofLiningCondition: '顶棚状况',
  floorMatCondition: '脚垫地毯状况',
  functionConfig: '功能配置',
  safetyAirbagInstrument: '安全气囊与仪表',
  engineSystem: '发动机系统',
  engineCondition: '发动机状况',
  gearboxChassis: '变速箱与底盘',
  gearboxCondition: '变速箱状况',
  chassisCondition: '底盘状况',
  brakeSteering: '制动与转向',
  brakeCondition: '制动状况',
  steeringCondition: '转向状况',
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
  status: '状态',
  summary: '摘要',
  description: '说明',
  note: '备注',
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
  expiration: '到期',
  overall: '整体',
  status: '状态',
  condition: '状况',
  structure: '结构',
  body: '车身',
  glass: '玻璃',
  tire: '轮胎',
  tires: '轮胎',
  wheel: '轮毂',
  wheels: '轮毂',
  exterior: '外观',
  interior: '内饰',
  visible: '可见',
  damage: '损伤',
  paint: '漆面',
  repair: '修复',
  original: '原厂',
  factory: '出厂',
  panel: '覆盖件',
  panels: '覆盖件',
  part: '部件',
  parts: '部件',
  cabin: '座舱',
  seat: '座椅',
  wear: '磨损',
  central: '中控',
  control: '控制',
  dashboard: '仪表台',
  steering: '转向',
  electronic: '电子',
  functional: '功能',
  comfort: '舒适',
  cleanliness: '整洁度',
  odor: '异味',
  storage: '储物',
  door: '车门',
  trim: '饰板',
  roof: '顶棚',
  lining: '内衬',
  floor: '地板',
  mat: '脚垫',
  function: '功能',
  config: '配置',
  safety: '安全',
  airbag: '气囊',
  instrument: '仪表',
  mechanical: '机械',
  performance: '性能',
  engine: '发动机',
  system: '系统',
  gearbox: '变速箱',
  chassis: '底盘',
  brake: '制动',
  steering: '转向',
  maintenance: '维保',
  service: '保养',
  record: '记录',
  records: '记录',
  regular: '定期',
  major: '重大',
  accident: '事故',
  check: '排查',
  consistency: '一致性',
  ratio: '占比',
  industry: '行业',
  average: '平均',
  total: '总计',
  key: '关键',
  timeline: '时间线',
  summary: '摘要',
  description: '说明',
  note: '备注'
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

export function getUiLabel(key) {
  const rawKey = String(key || '').trim()
  if (!rawKey) {
    return ''
  }
  const mapped = pickMapValue(UI_LABEL_MAP, rawKey)
  return mapped !== undefined ? mapped : rawKey
}
