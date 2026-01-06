import { fastify } from 'fastify'
import init from '../server/plugin'

describe('Маршруты приложения', () => {
  let app
  
  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: false,
    })
    
    await init(app)
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET / должен возвращать 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/',
    })

    expect(res.statusCode).toBe(200)
  })

  it.each([
    { method: 'GET', url: '/non-existent-path' },
    { method: 'POST', url: '/' },
  ])('должен возвращать 404 для $method $url', async ({ method, url }) => {
    const res = await app.inject({
      method,
      url,
    })
    
    expect(res.statusCode).toBe(404)
    expect(res.payload).toContain('Not Found')
  })
})
