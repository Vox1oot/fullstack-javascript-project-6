import i18next from 'i18next'

const PROPERTY_NAME_MAP = {
  status: 'statusId',
  executor: 'executorId',
  labels: 'labels',
}

const ALERT_CLASS_MAP = {
  error: 'danger',
  success: 'success',
  info: 'info',
}

export default () => ({
  t(key) {
    return i18next.t(key)
  },

  formatDate(str) {
    const date = new Date(str)
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
    return date.toLocaleString('ru-RU', options).replace(' г.,', ' в')
  },

  isEmpty(value) {
    if (value == null) return true
    if (typeof value === 'string' || Array.isArray(value)) return value.length === 0
    if (value instanceof Map || value instanceof Set) return value.size === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  },

  get(obj, key, defaultValue = undefined) {
    return obj?.[key] ?? defaultValue
  },

  convertPropertyName(property) {
    return PROPERTY_NAME_MAP[property]
  },

  getAlertClass(type) {
    const alertClass = ALERT_CLASS_MAP[type]
    if (!alertClass) {
      throw new Error(`Unknown flash type: '${type}'`)
    }
    return alertClass
  },
})
