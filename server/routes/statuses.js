import { createCRUDRoutes } from '../lib/crudRoutes.js'
import { FLASH_KEYS } from '../constants/flashKeys.js'

export default (app) => {
  createCRUDRoutes(app, 'status', 'statuses', {
    createSuccess: FLASH_KEYS.statuses.create.success,
    createError: FLASH_KEYS.statuses.create.error,
    updateSuccess: FLASH_KEYS.statuses.update.success,
    updateError: FLASH_KEYS.statuses.update.error,
    deleteSuccess: FLASH_KEYS.statuses.delete.success,
    deleteError: FLASH_KEYS.statuses.delete.error,
  })
}
