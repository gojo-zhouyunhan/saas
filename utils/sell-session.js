const SELL_SESSION_KEY = 'sellPublishSession'

export function getSellSession() {
  const storedValue = uni.getStorageSync(SELL_SESSION_KEY)
  if (!storedValue) {
    return null
  }
  try {
    return typeof storedValue === 'string' ? JSON.parse(storedValue) : storedValue
  } catch (error) {
    return null
  }
}

export function setSellSession(data) {
  uni.setStorageSync(SELL_SESSION_KEY, data || {})
}

export function clearSellSession() {
  uni.removeStorageSync(SELL_SESSION_KEY)
}
