import Fastify from 'fastify'
import app from './plugin.js'

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '0.0.0.0'

const start = async () => {
  const fastify = Fastify({
    logger: {
      level: 'info',
    },
  })

  try {
    await fastify.register(app)
    await fastify.listen({ port: PORT, host: HOST })
    console.log(`Server listening on ${HOST}:${PORT}`)
  }
  catch (err) {
    console.error('Error starting server:', err)
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
