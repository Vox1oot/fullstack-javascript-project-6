import fp from 'fastify-plugin'
import fs from 'fs'
import fastifyStatic from '@fastify/static'
import { PATHS } from '../config/paths.js'

async function staticPlugin(app) {
  if (!fs.existsSync(PATHS.public)) {
    fs.mkdirSync(PATHS.public, { recursive: true })
  }
  
  await app.register(fastifyStatic, {
    root: PATHS.public,
    prefix: '/assets/',
  })
}

export default fp(staticPlugin)
