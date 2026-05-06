export function ensureArray(data) {
  return Array.isArray(data) ? data : []
}

export function formatDisplayValue(value) {
  if (value === undefined || value === null || value === '') {
    return '--'
  }
  if (typeof value === 'object') {
    if (value.value !== undefined) {
      return `${value.value}${value.unit || ''}`
    }
    return JSON.stringify(value)
  }
  return String(value)
}

export function readSummaryContent(data) {
  if (typeof data === 'string') {
    return data
  }
  return (data && (data.content || data.summary || data.description)) || ''
}

export function readTextBlockContent(data) {
  if (typeof data === 'string') {
    return data
  }
  return (data && (data.content || data.text || data.description)) || ''
}

export function readImageUrl(data) {
  if (!data || typeof data !== 'object') {
    return ''
  }
  return data.imageUrl || data.url || ''
}

export function readImageTextContent(data) {
  if (typeof data === 'string') {
    return data
  }
  return (data && (data.content || data.text || data.description)) || ''
}

export function readTagText(item) {
  if (item === undefined || item === null) {
    return '--'
  }
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item)
  }
  return item.label || item.name || item.value || '--'
}

export function readRiskLevel(data) {
  if (!data || typeof data !== 'object') {
    return '未标注'
  }
  return data.riskLevel || data.level || '未标注'
}

export function readRiskContent(data) {
  if (typeof data === 'string') {
    return data
  }
  return (data && (data.content || data.description || data.summary)) || ''
}

export function readRatingText(item) {
  if (!item) {
    return '--'
  }
  return item.rating || formatDisplayValue(item.value)
}

export function metricDisplayValue(item) {
  if (!item) {
    return '--'
  }
  const raw = item.value !== undefined ? item.value : item.rating
  return `${formatDisplayValue(raw)}${item.unit || ''}`
}

export function normalizeBarValue(value) {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) {
    return 40
  }
  if (numberValue < 0) {
    return 0
  }
  if (numberValue > 100) {
    return 100
  }
  return numberValue
}

export function toneColor(tone, fallbackColor) {
  if (tone === 'positive' || tone === '合格' || tone === '正常' || tone === '优秀' || tone === '低') {
    return '#16A34A'
  }
  if (tone === 'warning' || tone === '中' || tone === '关注') {
    return '#D97706'
  }
  if (tone === 'danger' || tone === '高' || tone === '风险') {
    return '#DC2626'
  }
  return fallbackColor || '#165DFF'
}

export function metricBarWidth(item) {
  if (!item) {
    return 40
  }
  const direct = Number(item.percent)
  if (!Number.isNaN(direct)) {
    return normalizeBarValue(direct)
  }
  const rawValue = Number(item.value)
  if (!Number.isNaN(rawValue)) {
    if (rawValue <= 1) {
      return normalizeBarValue(rawValue * 100)
    }
    if (rawValue <= 10) {
      return normalizeBarValue(rawValue * 10)
    }
    return normalizeBarValue(rawValue)
  }
  return 40
}

export function tableColumns(rows, explicitColumns) {
  if (Array.isArray(explicitColumns) && explicitColumns.length) {
    return explicitColumns
  }
  const firstRow = ensureArray(rows)[0]
  if (!firstRow || typeof firstRow !== 'object') {
    return []
  }
  return Object.keys(firstRow).map((key) => ({
    key,
    label: key
  }))
}

export function stringifyData(data) {
  if (data === undefined || data === null) {
    return ''
  }
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data)
}
