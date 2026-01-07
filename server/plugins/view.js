import fp from 'fastify-plugin'
import fastifyView from '@fastify/view'
import { viewConfig } from '../config/viewConfig.js'

async function viewPlugin(app) {
  await app.register(fastifyView, viewConfig)

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this })
  })
}

export default fp(viewPlugin)
