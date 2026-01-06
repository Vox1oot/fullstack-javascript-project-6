import {
  createRandomName as createRandomLabel, signInUser, truncateTables, setupCRUDTestSuite,
} from './helpers/index.js'
import { createCRUDTestHelpers } from './helpers/crudTestHelpers.js'

describe('CRUD операции с метками', () => {
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
  
  const testHelpers = createCRUDTestHelpers('labels', 'label', createRandomLabel)

  describe('POST /labels - Создание метки', () => {
    it('должен рендерить форму создания новой метки', async () => {
      const authCookie = await signInUser(app)
      const response = await app.inject({
        method: 'GET',
        url: '/labels/new',
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Создание метки')
    })

    it('должен создавать новую метку', async () => {
      await testHelpers.createItem(app, models, signInUser)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      await testHelpers.createWithValidationError(app, models, signInUser)
    })
  })

  describe('GET /labels - Список меток', () => {
    it('должен возвращать пустой массив, если меток не существует', async () => {
      await testHelpers.listEmpty(app, models, signInUser)
    })

    it('должен возвращать список меток', async () => {
      await testHelpers.listItems(app, models, signInUser)
    })
  })

  describe('PATCH /labels/:id - Обновление метки', () => {
    it('должен возвращать метку по ID', async () => {
      const label = await models.label.query().insert(createRandomLabel())
      const response = await testHelpers.getEditForm(app, models, signInUser, label.id)

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Изменение метки')
      expect(response.payload).toMatch(label.name)
    })

    it('должен обновлять имя метки', async () => {
      await testHelpers.updateItem(app, models, signInUser)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      await testHelpers.updateWithValidationError(app, models, signInUser, 'Не удалось обновить метку')
    })
  })

  describe('DELETE /labels/:id - Удаление метки', () => {
    it('должен удалять метку', async () => {
      await testHelpers.deleteItem(app, models, signInUser)
    })
  })

})
