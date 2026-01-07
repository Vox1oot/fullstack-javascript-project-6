import i18next from 'i18next'
import { FLASH_KEYS } from '../constants/flashKeys.js'

export default (app) => {
  const objectionModels = app.objection.models

  app
    .get('/labels', { preValidation: app.authenticate }, async (request, reply) => {
      const labels = await objectionModels.label.query()
      reply.render('labels/index', { labels })
      return reply
    })
    .get('/labels/new', { preValidation: app.authenticate }, (request, reply) => {
      const label = new objectionModels.label()
      reply.render('labels/new', { label })
      return reply
    })
    .get('/labels/:id/edit', { preValidation: app.authenticate }, async (request, reply) => {
      const { id } = request.params
      const label = await objectionModels.label.query().findById(id)
      reply.render('labels/edit', { label })
      return reply
    })
    .post('/labels', { preValidation: app.authenticate }, async (request, reply) => {
      const label = new objectionModels.label()
      label.$set(request.body.data)

      try {
        await objectionModels.label.query().insert(request.body.data)
        request.flash('info', i18next.t(FLASH_KEYS.labels.create.success))
        reply.redirect('/labels')
      }
      catch ({ data }) {
        request.flash('error', i18next.t(FLASH_KEYS.labels.create.error))
        reply.render('labels/new', { label, errors: data })
      }
      return reply
    })
    .patch('/labels/:id', { preValidation: app.authenticate }, async (request, reply) => {
      const { id } = request.params
      const label = await objectionModels.label.query().findById(id)
      const { data } = request.body

      try {
        label.$set(data)
        await label.$query().patch(data)
        request.flash('info', i18next.t(FLASH_KEYS.labels.update.success))
        reply.redirect('/labels')
      }
      catch (errors) {
        request.flash('error', i18next.t(FLASH_KEYS.labels.update.error))
        const errorData = errors.data || errors
        reply.render('labels/edit', { label, errors: errorData })
      }
      return reply
    })
    .delete('/labels/:id', { preValidation: app.authenticate }, async (request, reply) => {
      const { id } = request.params
      const label = await objectionModels.label.query().findById(id)

      try {
        await label.$query().delete()
        request.flash('info', i18next.t(FLASH_KEYS.labels.delete.success))
        reply.redirect('/labels')
      }
      catch (error) {
        console.error(error)
        request.flash('error', i18next.t(FLASH_KEYS.labels.delete.error))
        reply.redirect('/labels')
      }
      return reply
    })
}
