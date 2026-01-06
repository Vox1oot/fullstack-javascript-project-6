import {
  createRandomName as createRandomStatus, signInUser, truncateTables, setupCRUDTestSuite,
} from './helpers/index'
import { createCRUDTestHelpers } from './helpers/crudTestHelpers'

describe('CRUD операции со статусами', () => {
  let app
  let knex
  let models

  beforeAll(async () => {
    const context = await setupCRUDTestSuite()
    app = context.app
    knex = context.knex
    models = context.models
  })

  beforeEach(async () => {
    await knex.migrate.latest()
  })

  afterEach(async () => {
    await truncateTables(knex)
  })

  afterAll(async () => {
    await knex.migrate.rollback()
    await app.close()
  })

  const testHelpers = createCRUDTestHelpers('statuses', 'status', createRandomStatus)

  describe('POST /statuses - Создание статуса', () => {
    it('должен создавать новый статус', async () => {
      await testHelpers.createItem(app, models, signInUser)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      await testHelpers.createWithValidationError(app, models, signInUser)
    })
  })

  describe('GET /statuses - Список статусов', () => {
    it('должен возвращать пустой массив, если статусов не существует', async () => {
      await testHelpers.listEmpty(app, models, signInUser)
    })

    it('должен возвращать список статусов', async () => {
      await testHelpers.listItems(app, models, signInUser)
    })
  })

  describe('PATCH /statuses/:id - Обновление статуса', () => {
    it('должен возвращать статус по ID', async () => {
      const status = await models.status.query().insert(createRandomStatus())
      const response = await testHelpers.getEditForm(app, models, signInUser, status.id)

      expect(response.statusCode).toBe(200)
    })

    it('должен обновлять имя статуса', async () => {
      await testHelpers.updateItem(app, models, signInUser)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      await testHelpers.updateWithValidationError(app, models, signInUser)
    })
  })

  describe('DELETE /statuses/:id - Удаление статуса', () => {
    it('должен удалять статус', async () => {
      await testHelpers.deleteItem(app, models, signInUser)
    })
  })
})
