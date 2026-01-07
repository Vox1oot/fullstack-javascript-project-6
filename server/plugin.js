import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import fastifyStatic from '@fastify/static'
import fastifyView from '@fastify/view'
import fastifyFormbody from '@fastify/formbody'
import fastifySecureSession from '@fastify/secure-session'
import { Authenticator } from '@fastify/passport'
import fastifySensible from '@fastify/sensible'
import fastifyMethodOverride from 'fastify-method-override'
import fastifyObjectionjs from 'fastify-objectionjs'
import qs from 'qs'
import Pug from 'pug'
import i18next from 'i18next'
import ru from './locales/ru.js'
import addRoutes from './routes/index.js'
import getHelpers from './helpers/index.js'
import * as knexConfig from '../knexfile.js'
import models from './models/index.js'
import FormStrategy from './lib/passportStrategies/FormStrategy.js'
import { SessionConfig } from './config/session.config.js'
import { AuthConfig } from './config/auth.config.js'
import { FLASH_KEYS } from './constants/flashKeys.js'

const __dirname = fileURLToPath(path.dirname(import.meta.url))
const mode = process.env.NODE_ENV || 'development'

const PATHS = {
  public: path.join(__dirname, '..', 'dist'),
  views: path.join(__dirname, '..', 'server', 'views'),
}

const fastifyPassport = new Authenticator()

const setUpViews = (app) => {
  const helpers = getHelpers(app)
  app.register(fastifyView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext: {
      ...helpers,
      assetPath: filename => `/assets/${filename}`,
    },
    templates: PATHS.views,
  })

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this })
  })
}

const setUpStaticAssets = (app) => {
  if (!fs.existsSync(PATHS.public)) {
    fs.mkdirSync(PATHS.public, { recursive: true })
  }
  app.register(fastifyStatic, {
    root: PATHS.public,
    prefix: '/assets/',
  })
}

const setupLocalization = async () => {
  await i18next
    .init({
      lng: 'ru',
      fallbackLng: 'ru',
      resources: {
        ru,
      },
    })
}

const setupAuthMiddleware = (app) => {
  const authenticateMiddleware = (...args) => fastifyPassport.authenticate(
    'form',
    {
      ...AuthConfig,
      failureFlash: i18next.t(FLASH_KEYS.auth.error),
    },
  )(...args)

  const requireCurrentUserMiddleware = (req, reply, done) => {
    if (req.user.id !== Number(req.params.id)) {
      req.flash('error', i18next.t(FLASH_KEYS.auth.notCurrentUser))
      reply.redirect('/users')
      return reply
    }
    return done()
  }

  app.decorate('authenticate', authenticateMiddleware)
  app.decorate('requireCurrentUser', requireCurrentUserMiddleware)
}

const addHooks = (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    }
  })
}

const setupPassport = async (app) => {
  fastifyPassport.registerUserDeserializer(
    user => app.objection.models.user.query().findById(user.id),
  )
  fastifyPassport.registerUserSerializer(user => Promise.resolve(user))
  fastifyPassport.use(new FormStrategy('form', app))

  await app.register(fastifyPassport.initialize())
  await app.register(fastifyPassport.secureSession())
  await app.decorate('fp', fastifyPassport)
}

const registerPlugins = async (app) => {
  await app.register(fastifySensible)
  await app.register(fastifyFormbody, { parser: qs.parse })
  await app.register(fastifySecureSession, SessionConfig)
  await setupPassport(app)
  await app.register(fastifyMethodOverride)
  await app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  })
}

export default async (app, _options) => {
  await setupLocalization()
  await registerPlugins(app)

  setUpViews(app)
  setUpStaticAssets(app)
  addHooks(app)
  setupAuthMiddleware(app)
  addRoutes(app)

  return app
}
