import i18next from '../config/i18nConfig.js'
import { fastifyPassport } from '../plugins/auth.js'
import { FLASH_KEYS } from '../constants/flashKeys.js'

export const authenticateMiddleware = (...args) => fastifyPassport.authenticate(
  'form',
  {
    failureRedirect: '/',
    failureFlash: i18next.t(FLASH_KEYS.auth.error),
  },
)(...args)

export const requireCurrentUserMiddleware = (req, reply, done) => {
  if (req.user.id !== Number(req.params.id)) {
    req.flash('error', i18next.t(FLASH_KEYS.auth.notCurrentUser))
    reply.redirect('/users')
    return reply
  }
  return done()
}

export default (app) => {
  app.decorate('authenticate', authenticateMiddleware)
  app.decorate('requireCurrentUser', requireCurrentUserMiddleware)
}
