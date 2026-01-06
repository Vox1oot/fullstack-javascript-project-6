import { faker } from '@faker-js/faker'
import { fastify } from 'fastify'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import init from '../server/plugin.js'

const getFixturePath = filename => path.join('..', '__fixtures__', filename)
const readFixture = filename => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim()
const getFixtureData = filename => JSON.parse(readFixture(filename))

const TEST_PASSWORDS = {
  existing: 'O6AvLIQL1cbzrre',
}

const createRandomLabel = () => ({ name: faker.word.adjective() })

const prepareUsersData = async (app) => {
  const { knex } = app.objection
  await knex('users').insert(getFixtureData('users.mock.json'))
}

const signInUser = async (app) => {
  await prepareUsersData(app)
  const responseSignIn = await app.inject({
    method: 'POST',
    url: '/session',
    payload: {
      data: {
        email: 'lawrence.kulas87@outlook.com',
        password: TEST_PASSWORDS.existing,
      },
    },
  })

  const [sessionCookie] = responseSignIn.cookies
  const { name, value } = sessionCookie
  return { [name]: value }
}

const truncateTables = async (knex) => {
  await knex('tasks').truncate()
  await Promise.all([
    knex('users').truncate(),
    knex('statuses').truncate(),
    knex('labels').truncate(),
  ])
}

const setupCRUDTestSuite = async () => {
  const app = fastify({
    exposeHeadRoutes: false,
    logger: false,
  })
  await init(app)
  const { knex, models } = app.objection
  return { app, knex, models }
}

const makeRequest = async (app, method, url, payload = null, cookies = null) => {
  const options = { method, url }
  if (cookies) options.cookies = cookies
  if (payload) options.payload = { data: payload }
  return app.inject(options)
}

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

  describe('POST /labels - Создание метки', () => {
    it('должен рендерить форму создания новой метки', async () => {
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'GET', '/labels/new', null, authCookie)

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Создание метки')
    })

    it('должен создавать новую метку', async () => {
      const params = createRandomLabel()
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'POST', '/labels', params, authCookie)

      expect(response.statusCode).toBe(302)
      const label = await models.label.query().findOne({ name: params.name })
      expect(label).toBeDefined()
      expect(label).toMatchObject(params)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      const params = { name: '' }
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'POST', '/labels', params, authCookie)

      expect(response.statusCode).toBe(200)
      const labels = await models.label.query()
      expect(labels).toEqual([])
    })
  })

  describe('GET /labels - Список меток', () => {
    it('должен возвращать пустой массив, если меток не существует', async () => {
      const wrongResponse = await makeRequest(app, 'GET', '/labels')
      expect(wrongResponse.statusCode).toBe(302)

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'GET', '/labels', null, authCookie)

      expect(response.statusCode).toBe(200)
      const labels = await models.label.query()
      expect(labels).toEqual([])
    })

    it('должен возвращать список меток', async () => {
      const [label1, label2] = await Promise.all([
        models.label.query().insert(createRandomLabel()),
        models.label.query().insert(createRandomLabel()),
      ])

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'GET', '/labels', null, authCookie)

      expect(response.statusCode).toBe(200)
      const labels = await models.label.query()
      expect(labels.length).toBe(2)
      expect(labels[0].name).toBe(label1.name)
      expect(labels[1].name).toBe(label2.name)
    })
  })

  describe('PATCH /labels/:id - Обновление метки', () => {
    it('должен возвращать метку по ID', async () => {
      const label = await models.label.query().insert(createRandomLabel())
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'GET', `/labels/${label.id}/edit`, null, authCookie)

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Изменение метки')
      expect(response.payload).toMatch(label.name)
    })

    it('должен обновлять имя метки', async () => {
      const currentData = createRandomLabel()
      const updatedData = createRandomLabel()
      const { id } = await models.label.query().insert(currentData)

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'PATCH', `/labels/${id}`, updatedData, authCookie)

      expect(response.statusCode).toBe(302)
      const updated = await models.label.query().findById(id)
      expect(updated.name).toBe(updatedData.name)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      const currentData = createRandomLabel()
      const updatedData = { name: '' }
      const { id } = await models.label.query().insert(currentData)

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'PATCH', `/labels/${id}`, updatedData, authCookie)

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Не удалось обновить метку')
      const updated = await models.label.query().findById(id)
      expect(updated.name).toBe(currentData.name)
    })
  })

  describe('DELETE /labels/:id - Удаление метки', () => {
    it('должен удалять метку', async () => {
      const label = await models.label.query().insert(createRandomLabel())
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'DELETE', `/labels/${label.id}`, null, authCookie)

      expect(response.statusCode).toBe(302)
      const deleted = await models.label.query().findById(label.id)
      expect(deleted).toBeUndefined()
    })
  })

})
