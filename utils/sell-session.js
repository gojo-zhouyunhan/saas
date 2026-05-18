const SELL_SESSION_KEY = 'sellPublishSession'
let memorySession = null

function isVolatileImageUrl(value) {
  return typeof value === 'string' && (value.startsWith('blob:') || value.startsWith('data:'))
}

function sanitizeSession(data) {
  if (!data || typeof data !== 'object') {
    return data || {}
  }

  const next = {
    ...data
  }

  if (Array.isArray(next.images)) {
    next.images = next.images.filter((image) => !isVolatileImageUrl(image))
  }

  return next
}

export function getSellSession() {
  if (memorySession) {
    return memorySession
  }

  const storedValue = uni.getStorageSync(SELL_SESSION_KEY)
  if (!storedValue) {
    return null
  }
  try {
    const parsed = typeof storedValue === 'string' ? JSON.parse(storedValue) : storedValue
    return parsed || null
  } catch (error) {
    return null
  }
}

export function setSellSession(data) {
  memorySession = data || {}
  uni.setStorageSync(SELL_SESSION_KEY, sanitizeSession(data))
}

export function clearSellSession() {
  memorySession = null
  uni.removeStorageSync(SELL_SESSION_KEY)
}
