import _ from 'lodash'
import { faker } from '@faker-js/faker'
import { fastify } from 'fastify'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import hashPassword from '../server/lib/secure.cjs'
import init from '../server/plugin.js'

const getFixturePath = filename => path.join('..', '__fixtures__', filename)
const readFixture = filename => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim()
const getFixtureData = filename => JSON.parse(readFixture(filename))

const TEST_PASSWORDS = {
  existing: 'O6AvLIQL1cbzrre',
}

const createRandomUser = {
  new() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
  },
  update() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    }
  },
}

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

describe('CRUD операции с пользователями', () => {
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

  describe('POST /users - Создание пользователя', () => {
    it('должен создавать нового пользователя', async () => {
      const params = createRandomUser.new()
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          data: params,
        },
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/')

      const expected = {
        ..._.omit(params, 'password'),
        passwordDigest: hashPassword(params.password),
      }
      const user = await models.user.query().findOne({ email: params.email })
      expect(user).toMatchObject(expected)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      const params = createRandomUser.new()
      const invalidParams = { ...params, firstName: '' }
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          data: invalidParams,
        },
      })

      expect(response.statusCode).toBe(200)

      const users = await models.user.query()
      expect(users).toEqual([])
    })

    it('должен выбрасывать ошибку при создании пользователя с дублирующимся email', async () => {
      const params1 = createRandomUser.new()
      await models.user.query().insert(params1)
      const users = await models.user.query()

      const params2 = {
        ...params1,
        ...createRandomUser.update(),
      }
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          data: params2,
        },
      })

      expect(response.statusCode).toBe(200)
      const users1 = await models.user.query()
      expect(users.length).toBe(users1.length)
    })
  })

  describe('GET /users - Список пользователей', () => {
    it('должен возвращать пустой массив, если пользователей не существует', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users',
      })

      expect(response.statusCode).toBe(200)

      const users = await models.user.query()
      expect(users).toEqual([])
    })

    it('должен возвращать список пользователей', async () => {
      const params1 = createRandomUser.new()
      const params2 = createRandomUser.new()
      await models.user.query().insert(params1)
      await models.user.query().insert(params2)

      const response = await app.inject({
        method: 'GET',
        url: '/users',
      })

      expect(response.statusCode).toBe(200)

      const users = await models.user.query()
      expect(users.length).toBe(2)
      expect(users[0].verifyPassword(params1.password)).toBeTruthy()
      expect(users[1].verifyPassword(params2.password)).toBeTruthy()
    })
  })

  describe('PATCH /users/:id - Обновление пользователя', () => {
    it('должен обновлять данные пользователя', async () => {
      const authCookie = await signInUser(app)
      const user = await models.user.query().findById(2)
      const updateParams = createRandomUser.update()
      const response = await app.inject({
        method: 'PATCH',
        url: `/users/${user.id}`,
        payload: {
          data: {
            ...updateParams,
            email: user.email,
          },
        },
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/users')

      const expected = {
        ..._.omit(updateParams, 'password'),
        passwordDigest: hashPassword(updateParams.password),
      }
      const updatedUser = await models.user.query().findById(2)
      expect(updatedUser).toMatchObject(expected)
    })

    it('должен выбрасывать ошибку при обновлении на дублирующийся email', async () => {
      const authCookie = await signInUser(app)
      const user1 = await models.user.query().findById(1)
      const user2 = await models.user.query().findById(2)
      const updateParams = createRandomUser.update()
      const response = await app.inject({
        method: 'PATCH',
        url: `/users/${user2.id}`,
        payload: {
          data: {
            ...updateParams,
            email: user1.email,
          },
        },
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)

      const updatedUser = await models.user.query().findById(2)
      expect(updatedUser).toMatchObject(user2)
    })
  })

  describe('DELETE /users/:id - Удаление пользователя', () => {
    it('должен удалять пользователя, если аутентифицирован как тот же пользователь', async () => {
      const id = 2
      const authCookie = await signInUser(app)

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${id}`,
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/users')

      const deletedUser = await models.user.query().findById(id)
      expect(deletedUser).toBeUndefined()
    })

    it('должен возвращать ошибку при удалении неавторизованным пользователем', async () => {
      const id = 2
      await signInUser(app)
      const usersBeforeDeletion = await models.user.query()

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${id}`,
      })

      const usersAfterDeletion = await models.user.query()
      expect(response.statusCode).toBe(302)
      expect(usersAfterDeletion.length).toEqual(usersBeforeDeletion.length)
    })

    it('должен возвращать ошибку при удалении чужого пользователя', async () => {
      const id = 1
      const authCookie = await signInUser(app)
      const usersBeforeDeletion = await models.user.query()
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${id}`,
        cookies: authCookie,
      })

      const usersAfterDeletion = await models.user.query()
      expect(response.statusCode).toBe(302)
      expect(usersAfterDeletion.length).toEqual(usersBeforeDeletion.length)
    })
  })
})
