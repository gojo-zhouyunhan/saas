const ROOT_PAGES = [
  '/pages/index/index',
  '/pages/location/location',
  '/pages/sell/sell',
  '/pages/message/message',
  '/pages/profile/profile'
]

function normalizeUrl(url) {
  if (!url) {
    return ''
  }
  return url.startsWith('/') ? url : `/${url}`
}

export function isRootPage(url) {
  return ROOT_PAGES.includes(normalizeUrl(url))
}

export function openPage(url) {
  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) {
    return
  }

  if (isRootPage(normalizedUrl)) {
    uni.reLaunch({
      url: normalizedUrl
    })
    return
  }

  uni.navigateTo({
    url: normalizedUrl
  })
}

export function redirectToPage(url) {
  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) {
    return
  }

  if (isRootPage(normalizedUrl)) {
    uni.reLaunch({
      url: normalizedUrl
    })
    return
  }

  uni.redirectTo({
    url: normalizedUrl
  })
}

export function goBackOrFallback(fallbackUrl = '/pages/index/index') {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  const normalizedFallback = normalizeUrl(fallbackUrl)
  if (isRootPage(normalizedFallback)) {
    uni.reLaunch({
      url: normalizedFallback
    })
    return
  }

  uni.reLaunch({
    url: normalizedFallback
  })
}
