const STORAGE_KEY = 'apiBaseUrl'
const TOKEN_KEY = 'token'
const LOGIN_PAGE = '/pages/login/login'

const AUTH_FREE_RULES = [
  /(^|\/)(login|numberlogin|phonelogin)(\?|$)/,
  /(^|\/)register(\?|$)/,
  /(^|\/)(sendcode|captcha|verifycode)(\?|$)/,
  /(^|\/)(forgot-password|forget-password|reset-password)(\?|$)/
]

let redirectingToLogin = false

function trimSlash(value) {
  return value.replace(/\/+$/, '')
}

function getStoredBaseUrl() {
  const storedValue = uni.getStorageSync(STORAGE_KEY)
  return storedValue ? trimSlash(storedValue) : ''
}

function getDefaultBaseUrl() {
  let host = '127.0.0.1'

  // #ifdef H5
  host = window.location.hostname || '127.0.0.1'
  // #endif

  return `http://${host}:9090`
}

export function getApiBaseUrl() {
  return getStoredBaseUrl() || getDefaultBaseUrl()
}

export function setApiBaseUrl(baseUrl) {
  if (!baseUrl) {
    uni.removeStorageSync(STORAGE_KEY)
    return
  }

  uni.setStorageSync(STORAGE_KEY, trimSlash(baseUrl))
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
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

function isHttpSuccess(statusCode) {
  return statusCode >= 200 && statusCode < 300
}

function attachAuthHeader(url, header = {}) {
  const requestHeader = { ...header }
  const token = uni.getStorageSync(TOKEN_KEY)

  if (token && !isAuthFreeUrl(url)) {
    requestHeader.Authorization = `Bearer ${token}`
  }

  return requestHeader
}

export function request(options) {
  const { url, header = {}, success, fail, complete, ...rest } = options
  const requestHeader = attachAuthHeader(url, header)

  return uni.request({
    url: buildApiUrl(url),
    withCredentials: true,
    header: requestHeader,
    ...rest,
    success: (res) => {
      if (isUnauthorized(res)) {
        handleUnauthorized()
        return
      }

      if (!isHttpSuccess(res.statusCode)) {
        if (typeof fail === 'function') {
          fail(res)
        }
        return
      }

      if (typeof success === 'function') {
        success(res)
      }
    },
    fail: (error) => {
      if (typeof fail === 'function') {
        fail(error)
      }
    },
    complete: (res) => {
      if (typeof complete === 'function') {
        complete(res)
      }
    }
  })
}

function normalizeUploadResponse(res) {
  if (!res || typeof res.data !== 'string') {
    return res
  }

  try {
    return {
      ...res,
      data: JSON.parse(res.data)
    }
  } catch (error) {
    return res
  }
}

export function uploadFile(options) {
  const { url, header = {}, success, fail, complete, ...rest } = options
  const requestHeader = attachAuthHeader(url, header)

  return uni.uploadFile({
    url: buildApiUrl(url),
    withCredentials: true,
    header: requestHeader,
    ...rest,
    success: (res) => {
      const normalizedRes = normalizeUploadResponse(res)
      if (isUnauthorized(normalizedRes)) {
        handleUnauthorized()
        return
      }

      if (!isHttpSuccess(normalizedRes.statusCode)) {
        if (typeof fail === 'function') {
          fail(normalizedRes)
        }
        return
      }

      if (typeof success === 'function') {
        success(normalizedRes)
      }
    },
    fail: (error) => {
      if (typeof fail === 'function') {
        fail(error)
      }
    },
    complete: (res) => {
      if (typeof complete === 'function') {
        complete(res)
      }
    }
  })
}
