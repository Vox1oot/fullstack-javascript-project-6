import { createCRUDRoutes } from '../lib/crudRoutes.js'
import { FLASH_KEYS } from '../constants/flashKeys.js'

export default (app) => {
  createCRUDRoutes(app, 'label', 'labels', {
    createSuccess: FLASH_KEYS.labels.create.success,
    createError: FLASH_KEYS.labels.create.error,
    updateSuccess: FLASH_KEYS.labels.update.success,
    updateError: FLASH_KEYS.labels.update.error,
    deleteSuccess: FLASH_KEYS.labels.delete.success,
    deleteError: FLASH_KEYS.labels.delete.error,
  })
}
