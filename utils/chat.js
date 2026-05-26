const SESSION_LIST_KEY = 'chatSessionList'
const MESSAGE_KEY_PREFIX = 'chatMessages:'

function safeParse(value, fallback) {
  if (!value) {
    return fallback
  }
  if (typeof value !== 'string') {
    return value
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

function readStorageList(key) {
  const value = safeParse(uni.getStorageSync(key), [])
  return Array.isArray(value) ? value : []
}

function writeStorage(key, value) {
  uni.setStorageSync(key, JSON.stringify(value))
}

function normalizeId(value) {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  return String(value)
}

function nowIsoString() {
  return new Date().toISOString()
}

export function getCurrentUserId() {
  const storedUser = uni.getStorageSync('user')
  const parsed = safeParse(storedUser, storedUser) || {}
  const user = parsed.user || parsed.userInfo || parsed
  return normalizeId(user.userId || user.id || user.uid || user.number || user.userNo)
}

export function buildSessionId(buyerUserId, sellerUserId) {
  return `buyer_${normalizeId(buyerUserId)}_seller_${normalizeId(sellerUserId)}`
}

export function getChatSessions() {
  return readStorageList(SESSION_LIST_KEY).sort((a, b) => {
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  })
}

export function saveChatSessions(sessions) {
  writeStorage(SESSION_LIST_KEY, sessions)
}

export function getChatMessages(sessionId) {
  return readStorageList(`${MESSAGE_KEY_PREFIX}${sessionId}`)
}

export function saveChatMessages(sessionId, messages) {
  writeStorage(`${MESSAGE_KEY_PREFIX}${sessionId}`, messages)
}

export function ensureChatSession(payload) {
  const buyerUserId = normalizeId(payload.buyerUserId)
  const sellerUserId = normalizeId(payload.sellerUserId)
  const sessionId = buildSessionId(buyerUserId, sellerUserId)
  const sessions = getChatSessions()
  const existingIndex = sessions.findIndex((item) => item.sessionId === sessionId)
  const baseSession = {
    sessionId,
    buyerUserId,
    sellerUserId,
    sellerName: payload.sellerName || `商家 ${sellerUserId}`,
    vehicleTitle: payload.vehicleTitle || '',
    reportId: normalizeId(payload.reportId),
    lastMessage: payload.lastMessage || '',
    updatedAt: payload.updatedAt || nowIsoString(),
    unreadCount: 0
  }

  if (existingIndex === -1) {
    sessions.unshift(baseSession)
    saveChatSessions(sessions)
    return baseSession
  }

  const nextSession = {
    ...sessions[existingIndex],
    ...baseSession,
    lastMessage: sessions[existingIndex].lastMessage || baseSession.lastMessage
  }
  sessions.splice(existingIndex, 1)
  sessions.unshift(nextSession)
  saveChatSessions(sessions)
  return nextSession
}

export function appendChatMessage(sessionId, message) {
  const messages = getChatMessages(sessionId)
  const nextMessage = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    senderUserId: normalizeId(message.senderUserId),
    content: message.content || '',
    createTime: message.createTime || nowIsoString(),
    isRead: message.isRead !== false,
    type: message.type || 'text'
  }
  const nextMessages = [...messages, nextMessage]
  saveChatMessages(sessionId, nextMessages)
  updateChatSession(sessionId, {
    lastMessage: nextMessage.content,
    updatedAt: nextMessage.createTime
  })
  return nextMessage
}

export function updateChatSession(sessionId, patch) {
  const sessions = getChatSessions()
  const index = sessions.findIndex((item) => item.sessionId === sessionId)
  if (index === -1) {
    return null
  }
  const nextSession = {
    ...sessions[index],
    ...patch
  }
  sessions.splice(index, 1)
  sessions.unshift(nextSession)
  saveChatSessions(sessions)
  return nextSession
}
