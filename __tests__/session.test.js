import { faker } from '@faker-js/faker'
import fastify from 'fastify'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import init from '../server/plugin.js'

const getFixturePath = filename => path.join('..', '__fixtures__', filename)
const readFixture = filename => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim()
const getFixtureData = filename => JSON.parse(readFixture(filename))

const createRandomName = () => ({ name: faker.word.adjective() })

const createRandomTask = () => ({
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  statusId: faker.number.int({ min: 1, max: 3 }),
  creatorId: 2,
  executorId: faker.number.int({ min: 1, max: 3 }),
})

const prepareData = async (app) => {
  const { knex } = app.objection
  await knex('users').insert(getFixtureData('users.mock.json'))
  await knex('statuses').insert(Array.from({ length: 3 }, createRandomName))
  await knex('tasks').insert(Array.from({ length: 1 }, createRandomTask))
  await knex('labels').insert(Array.from({ length: 3 }, createRandomName))
}

describe('Тесты сессии', () => {
  let app
  let knex

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: false,
    })
    await init(app)
    knex = app.objection.knex
    await knex.migrate.latest()
    await prepareData(app)
  })

  describe('GET /session/new', () => {
    it('должен рендерить форму входа', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/session/new',
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Вход')
    })
  })

  describe('POST /session', () => {
    it('должен обрабатывать ошибку аутентификации', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/session',
        payload: {
          data: {
            email: 'nonexistent@mail.com',
            password: 'O6AvLIQL1cbzrre', // NOSONAR - test password
          },
        },
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Неверная почта или пароль')
    })

    it('должен аутентифицировать пользователя и перенаправлять при успехе', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/session',
        payload: {
          data: {
            email: 'lawrence.kulas87@outlook.com',
            password: 'O6AvLIQL1cbzrre', // NOSONAR - test password
          },
        },
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/')
    })
  })

  describe('DELETE /session', () => {
    it('должен перенаправлять на главную страницу', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/session',
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/')
    })
  })

  afterAll(async () => {
    await knex.migrate.rollback()
    await app.close()
  })
})
