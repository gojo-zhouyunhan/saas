const API_SERVER_CONFIG = {
  protocol: 'http',
  port: 9090,

  // H5 runs in the desktop browser, so localhost is usually correct.
  h5Host: 'localhost',

  // App runs on a phone/emulator, so it must use the LAN address of this machine.
  appHost: '192.168.1.133',

  // Set this to a full URL when you want to force every platform to one address.
  // Example: 'http://192.168.1.133:9090'
  baseUrl: '',

  // Keep false when this file should be the only place to switch backend address.
  allowStorageOverride: false
}

function trimSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function buildBaseUrl(host) {
  return `${API_SERVER_CONFIG.protocol}://${host}:${API_SERVER_CONFIG.port}`
}

export function getConfiguredApiBaseUrl() {
  if (API_SERVER_CONFIG.baseUrl) {
    return trimSlash(API_SERVER_CONFIG.baseUrl)
  }

  let host = API_SERVER_CONFIG.appHost

  // #ifdef H5
  host = API_SERVER_CONFIG.h5Host || window.location.hostname || 'localhost'
  // #endif

  return buildBaseUrl(host)
}

export function isApiStorageOverrideEnabled() {
  return Boolean(API_SERVER_CONFIG.allowStorageOverride)
}
