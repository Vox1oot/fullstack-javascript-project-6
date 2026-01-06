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

const createRandomStatus = () => ({ name: faker.word.adjective() })

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

  describe('POST /statuses - Создание статуса', () => {
    it('должен создавать новый статус', async () => {
      const params = createRandomStatus()
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'POST', '/statuses', params, authCookie)

      expect(response.statusCode).toBe(302)
      const status = await models.status.query().findOne({ name: params.name })
      expect(status).toBeDefined()
      expect(status).toMatchObject(params)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      const params = { name: '' }
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'POST', '/statuses', params, authCookie)

      expect(response.statusCode).toBe(200)
      const statuses = await models.status.query()
      expect(statuses).toEqual([])
    })
  })

  describe('GET /statuses - Список статусов', () => {
    it('должен возвращать пустой массив, если статусов не существует', async () => {
      const wrongResponse = await makeRequest(app, 'GET', '/statuses')
      expect(wrongResponse.statusCode).toBe(302)

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'GET', '/statuses', null, authCookie)

      expect(response.statusCode).toBe(200)
      const statuses = await models.status.query()
      expect(statuses).toEqual([])
    })

    it('должен возвращать список статусов', async () => {
      const [status1, status2] = await Promise.all([
        models.status.query().insert(createRandomStatus()),
        models.status.query().insert(createRandomStatus()),
      ])

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'GET', '/statuses', null, authCookie)

      expect(response.statusCode).toBe(200)
      const statuses = await models.status.query()
      expect(statuses.length).toBe(2)
      expect(statuses[0].name).toBe(status1.name)
      expect(statuses[1].name).toBe(status2.name)
    })
  })

  describe('PATCH /statuses/:id - Обновление статуса', () => {
    it('должен возвращать статус по ID', async () => {
      const status = await models.status.query().insert(createRandomStatus())
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'GET', `/statuses/${status.id}/edit`, null, authCookie)

      expect(response.statusCode).toBe(200)
    })

    it('должен обновлять имя статуса', async () => {
      const currentData = createRandomStatus()
      const updatedData = createRandomStatus()
      const { id } = await models.status.query().insert(currentData)

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'PATCH', `/statuses/${id}`, updatedData, authCookie)

      expect(response.statusCode).toBe(302)
      const updated = await models.status.query().findById(id)
      expect(updated.name).toBe(updatedData.name)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      const currentData = createRandomStatus()
      const updatedData = { name: '' }
      const { id } = await models.status.query().insert(currentData)

      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'PATCH', `/statuses/${id}`, updatedData, authCookie)

      expect(response.statusCode).toBe(200)
      const updated = await models.status.query().findById(id)
      expect(updated.name).toBe(currentData.name)
    })
  })

  describe('DELETE /statuses/:id - Удаление статуса', () => {
    it('должен удалять статус', async () => {
      const status = await models.status.query().insert(createRandomStatus())
      const authCookie = await signInUser(app)
      const response = await makeRequest(app, 'DELETE', `/statuses/${status.id}`, null, authCookie)

      expect(response.statusCode).toBe(302)
      const deleted = await models.status.query().findById(status.id)
      expect(deleted).toBeUndefined()
    })
  })
})
