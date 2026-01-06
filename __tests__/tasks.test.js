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

const createRandomName = () => ({ name: faker.word.adjective() })

const createRandomTask = {
  new() {
    return {
      name: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      statusId: faker.number.int({ min: 1, max: 3 }),
      executorId: faker.number.int({ min: 1, max: 3 }),
    }
  },
  invalid() {
    return {
      name: '',
      description: faker.lorem.paragraph(),
      statusId: faker.number.int({ min: 1, max: 3 }),
      executorId: faker.number.int({ min: 1, max: 3 }),
    }
  },
  prepare() {
    return {
      name: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      statusId: faker.number.int({ min: 1, max: 3 }),
      creatorId: 2,
      executorId: faker.number.int({ min: 1, max: 3 }),
    }
  },
}

const prepareUsersData = async (app) => {
  const { knex } = app.objection
  await knex('users').insert(getFixtureData('users.mock.json'))
}

const prepareData = async (app) => {
  const { knex } = app.objection
  await knex('users').insert(getFixtureData('users.mock.json'))
  await knex('statuses').insert(Array.from({ length: 3 }, createRandomName))
  await knex('tasks').insert(Array.from({ length: 1 }, createRandomTask.prepare))
  await knex('labels').insert(Array.from({ length: 3 }, createRandomName))
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

describe('CRUD операции с задачами', () => {
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

  describe('POST /tasks', () => {
    it('должен возвращать форму для создания новой задачи', async () => {
      const authCookie = await signInUser(app)
      const response = await app.inject({
        method: 'GET',
        url: '/tasks/new',
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Создание задачи')
    })

    it('должен создавать новую задачу', async () => {
      await prepareData(app)
      const authCookie = await signInUser(app)
      const params = createRandomTask.new()

      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          data: params,
        },
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/tasks')

      const task = await models.task.query().findOne({ name: params.name })
      expect(task).toMatchObject(params)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      const authCookie = await signInUser(app)
      const params = createRandomTask.invalid()

      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          data: params,
        },
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Не удалось создать задачу')

      const task = await models.task.query()
      expect(task).toEqual([])
    })
  })

  describe('GET /tasks', () => {
    it('должен возвращать пустой массив, если задач не существует', async () => {
      const authCookie = await signInUser(app)
      const response = await app.inject({
        method: 'GET',
        url: '/tasks',
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)

      const task = await models.task.query()
      expect(task).toEqual([])
    })

    it('должен возвращать список задач', async () => {
      await prepareData(app)
      const { name } = await models.task.query().first()

      const authCookie = await signInUser(app)
      const response = await app.inject({
        method: 'GET',
        url: '/tasks',
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch(name)
    })

    it('должен возвращать детали задачи', async () => {
      await prepareData(app)
      const authCookie = await signInUser(app)
      const { id, name } = await models.task.query().first()
      const response = await app.inject({
        method: 'GET',
        url: `/tasks/${id}`,
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch(name)
    })
  })

  describe('PATCH /tasks/:id', () => {
    it('должен возвращать форму редактирования для задачи', async () => {
      await prepareData(app)
      const authCookie = await signInUser(app)
      const { id } = await models.task.query().first()
      const response = await app.inject({
        method: 'GET',
        url: `/tasks/${id}/edit`,
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Изменение задачи')
    })

    it('должен успешно обновлять задачу', async () => {
      await prepareData(app)
      const authCookie = await signInUser(app)
      const task = await models.task.query().first()
      const params = createRandomTask.new()

      const response = await app.inject({
        method: 'PATCH',
        url: `/tasks/${task.id}`,
        payload: {
          data: params,
        },
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/tasks')

      const updatedTask = await models.task.query().findById(task.id)
      expect(updatedTask.name).toBe(params.name)
      expect(updatedTask.description).toBe(params.description)
    })

    it('должен выбрасывать ошибку валидации для неверных данных', async () => {
      await prepareData(app)
      const authCookie = await signInUser(app)
      const task = await models.task.query().first()
      const params = createRandomTask.invalid()

      const response = await app.inject({
        method: 'PATCH',
        url: `/tasks/${task.id}`,
        payload: {
          data: params,
        },
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toMatch('Не удалось обновить задачу')

      const updatedTask = await models.task.query().findById(task.id)
      expect(updatedTask.name).not.toBe(params.name)
      expect(updatedTask.name).toBe(task.name)
    })
  })

  describe('DELETE /tasks/:id', () => {
    it('должен успешно удалять задачу', async () => {
      await prepareData(app)
      const authCookie = await signInUser(app)
      const task = await models.task.query().first()

      const response = await app.inject({
        method: 'DELETE',
        url: `/tasks/${task.id}`,
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/tasks')

      const deletedTask = await models.task.query().findById(task.id)
      expect(deletedTask).toBeUndefined()
    })

    it('не должен позволять удаление, если не владелец', async () => {
      await prepareData(app)
      const authCookie = await signInUser(app)
      const task = await models.task.query().insert({
        ...createRandomTask.new(),
        creatorId: 1,
      })

      const response = await app.inject({
        method: 'DELETE',
        url: `/tasks/${task.id}`,
        cookies: authCookie,
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/tasks')

      const stillExists = await models.task.query().findById(task.id)
      expect(stillExists).toBeDefined()
    })
  })
 
})
