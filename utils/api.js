
import { getConfiguredApiBaseUrl, isApiStorageOverrideEnabled } from '../config/api'

const STORAGE_KEY = 'apiBaseUrl'
const TOKEN_KEY = 'token'
const LOGIN_PAGE = '/pages/login/login'
const API_DEBUG = true

const AUTH_FREE_RULES = [
  /(^|\/)(login|numberlogin|phonelogin)(\?|$)/,
  /(^|\/)register(\?|$)/,
  /(^|\/)(sendcode|captcha|verifycode)(\?|$)/,
  /(^|\/)(forgot-password|forget-password|reset-password)(\?|$)/,
  /\/api\/ai\/report\/published\/list(\?|$)/
]

let redirectingToLogin = false

function debugLog(level, label, payload) {
  if (!API_DEBUG || typeof console === 'undefined') {
    return
  }
  const message = `[API] ${label}`
  const logger = console[level] || console.log
  try {
    logger(message, payload)
  } catch (e) {
    console.log(message)
  }
}

function safeJson(value) {
  if (value === undefined) {
    return undefined
  }
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (e) {
    return String(value)
  }
}

function maskToken(token) {
  if (!token) {
    return ''
  }
  const value = String(token)
  if (value.length <= 12) {
    return `${value.slice(0, 3)}***`
  }
  return `${value.slice(0, 6)}***${value.slice(-4)}`
}

function trimSlash(value) {
  return value.replace(/\/+$/, '')
}

function getStoredBaseUrl() {
  if (!isApiStorageOverrideEnabled()) {
    uni.removeStorageSync(STORAGE_KEY)
    return ''
  }

  const storedValue = uni.getStorageSync(STORAGE_KEY)
  if (!storedValue) {
    return ''
  }
  const normalizedValue = trimSlash(storedValue)
  return normalizedValue
}

function getDefaultBaseUrl() {
  return getConfiguredApiBaseUrl()
}

export function getApiBaseUrl() {
  const storedBaseUrl = getStoredBaseUrl()
  const defaultBaseUrl = getDefaultBaseUrl()
  const apiBaseUrl = storedBaseUrl || defaultBaseUrl
  debugLog('log', 'base-url resolved', {
    apiBaseUrl,
    storedBaseUrl,
    defaultBaseUrl,
    usingStoredBaseUrl: Boolean(storedBaseUrl)
  })
  return apiBaseUrl
}

export function setApiBaseUrl(baseUrl) {
  if (!baseUrl) {
    uni.removeStorageSync(STORAGE_KEY)
    debugLog('warn', 'base-url cleared', { storageKey: STORAGE_KEY })
    return
  }

  const normalizedBaseUrl = trimSlash(baseUrl)
  uni.setStorageSync(STORAGE_KEY, normalizedBaseUrl)
  debugLog('log', 'base-url stored', { apiBaseUrl: normalizedBaseUrl })
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${getApiBaseUrl()}${normalizedPath}`
  debugLog('log', 'url built', { path, fullUrl })
  return fullUrl
}

function isAuthFreeUrl(url) {
  const normalizedUrl = String(url || '').toLowerCase()
  return AUTH_FREE_RULES.some((rule) => rule.test(normalizedUrl))
}

function isUnauthorized(res) {
  return res && (res.statusCode === 401 || (res.data && res.data.code === 401))
}

function handleUnauthorized() {
  uni.removeStorageSync(TOKEN_KEY)
  debugLog('warn', 'unauthorized, token removed', {})

  if (redirectingToLogin) {
    return
  }

  redirectingToLogin = true
  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
  setTimeout(() => {
    uni.reLaunch({
      url: LOGIN_PAGE,
      complete: () => {
        redirectingToLogin = false
      }
    })
  }, 500)
}

export function request(options) {
  const { url, header = {}, success, fail, complete, ...rest } = options
  const requestHeader = { ...header }
  const token = uni.getStorageSync(TOKEN_KEY)
  const fullUrl = buildApiUrl(url)
  const method = rest.method || 'GET'

  if (token && !isAuthFreeUrl(url)) {
    requestHeader.Authorization = `Bearer ${token}`
  }

  debugLog('log', 'request start', {
    method,
    url,
    fullUrl,
    hasToken: Boolean(token),
    token: maskToken(token),
    authFree: isAuthFreeUrl(url),
    headers: Object.keys(requestHeader),
    data: safeJson(rest.data)
  })

  return uni.request({
    url: fullUrl,
    withCredentials: true,
    header: requestHeader,
    ...rest,
    success: (res) => {
      debugLog(res.statusCode >= 400 || (res.data && res.data.code && res.data.code !== 200) ? 'warn' : 'log', 'request success', {
        method,
        url,
        fullUrl,
        statusCode: res.statusCode,
        response: safeJson(res.data)
      })

      if (isUnauthorized(res)) {
        handleUnauthorized()
        return
      }

      if (typeof success === 'function') {
        success(res)
      }
    },
    fail: (err) => {
      debugLog('error', 'request fail', {
        method,
        url,
        fullUrl,
        error: safeJson(err)
      })

      if (typeof fail === 'function') {
        fail(err)
      }
    },
    complete: (res) => {
      debugLog('log', 'request complete', {
        method,
        url,
        fullUrl,
        statusCode: res && res.statusCode,
        errMsg: res && res.errMsg
      })

      if (typeof complete === 'function') {
        complete(res)
      }
    }
  })
}

export function uploadFile(options) {
  const { url, header = {}, success, fail, complete, ...rest } = options
  const requestHeader = { ...header }
  const token = uni.getStorageSync(TOKEN_KEY)
  const fullUrl = buildApiUrl(url)

  if (token && !isAuthFreeUrl(url)) {
    requestHeader.Authorization = `Bearer ${token}`
  }

  debugLog('log', 'upload start', {
    url,
    fullUrl,
    filePath: rest.filePath,
    name: rest.name,
    formData: safeJson(rest.formData),
    hasToken: Boolean(token),
    token: maskToken(token),
    headers: Object.keys(requestHeader)
  })

  return uni.uploadFile({
    url: fullUrl,
    header: requestHeader,
    ...rest,
    success: (res) => {
      debugLog(res.statusCode >= 400 ? 'warn' : 'log', 'upload success', {
        url,
        fullUrl,
        statusCode: res.statusCode,
        response: safeJson(res.data)
      })

      if (typeof success === 'function') {
        success(res)
      }
    },
    fail: (err) => {
      debugLog('error', 'upload fail', {
        url,
        fullUrl,
        error: safeJson(err)
      })

      if (typeof fail === 'function') {
        fail(err)
      }
    },
    complete: (res) => {
      debugLog('log', 'upload complete', {
        url,
        fullUrl,
        statusCode: res && res.statusCode,
        errMsg: res && res.errMsg
      })

      if (typeof complete === 'function') {
        complete(res)
      }
    }
  })
}
