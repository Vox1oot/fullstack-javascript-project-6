import i18next from 'i18next'
import { FLASH_KEYS } from '../constants/flashKeys.js'

export default (app) => {
  const objectionModels = app.objection.models

  app
    .get('/statuses', { preValidation: app.authenticate }, async (request, reply) => {
      const statuses = await objectionModels.status.query()
      reply.render('statuses/index', { statuses })
      return reply
    })
    .get('/statuses/new', { preValidation: app.authenticate }, (request, reply) => {
      const status = new objectionModels.status()
      reply.render('statuses/new', { status })
      return reply
    })
    .get('/statuses/:id/edit', { preValidation: app.authenticate }, async (request, reply) => {
      const { id } = request.params
      const status = await objectionModels.status.query().findById(id)
      reply.render('statuses/edit', { status })
      return reply
    })
    .post('/statuses', { preValidation: app.authenticate }, async (request, reply) => {
      const status = new objectionModels.status()
      status.$set(request.body.data)

      try {
        const validStatus = await objectionModels.status.fromJson(request.body.data)
        await objectionModels.status.query().insert(validStatus)
        request.flash('info', i18next.t(FLASH_KEYS.statuses.create.success))
        reply.redirect('/statuses')
      }
      catch ({ data }) {
        request.flash('error', i18next.t(FLASH_KEYS.statuses.create.error))
        reply.render('statuses/new', { status, errors: data })
      }
      return reply
    })
    .patch('/statuses/:id', { preValidation: app.authenticate }, async (request, reply) => {
      const { id } = request.params
      const status = await objectionModels.status.query().findById(id)
      const { data } = request.body

      try {
        await status.$query().patch(data)
        request.flash('info', i18next.t(FLASH_KEYS.statuses.update.success))
        reply.redirect('/statuses')
      }
      catch (errors) {
        request.flash('error', i18next.t(FLASH_KEYS.statuses.update.error))
        const errorData = errors.data || errors
        reply.render('statuses/edit', { status, errors: errorData })
      }
      return reply
    })
    .delete('/statuses/:id', { preValidation: app.authenticate }, async (request, reply) => {
      const { id } = request.params
      const status = await objectionModels.status.query().findById(id)

      try {
        await status.$query().delete()
        request.flash('info', i18next.t(FLASH_KEYS.statuses.delete.success))
        reply.redirect('/statuses')
      }
      catch (error) {
        console.error(error)
        request.flash('error', i18next.t(FLASH_KEYS.statuses.delete.error))
        reply.redirect('/statuses')
      }
      return reply
    })
}
