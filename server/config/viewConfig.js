import Pug from 'pug'
import i18next from './i18nConfig.js'
import formatDate from '../helpers/formatDate.js'
import isEmpty from '../helpers/isEmpty.js'
import { PATHS } from './paths.js'

export const viewConfig = {
  engine: {
    pug: Pug,
  },
  includeViewExtension: true,
  defaultContext: {
    formatDate,
    isEmpty,
    t: key => i18next.t(key),
    assetPath: filename => `/assets/${filename}`,
  },
  templates: PATHS.views,
}
