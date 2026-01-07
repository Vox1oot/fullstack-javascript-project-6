const objectionUnique = require('objection-unique')

const BaseModel = require('./BaseModel.cjs')
const { hashPassword, verifyPassword } = require('../auth/password.cjs')

const unique = objectionUnique({ fields: ['email'] })

module.exports = class User extends unique(BaseModel) {
  static get tableName() {
    return 'users'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    }
  }

  static relationMappings = {
    createdTasks: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'Task.cjs',
      join: {
        from: 'users.id',
        to: 'tasks.creatorId',
      },
    },
    assignedTasks: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'Task.cjs',
      join: {
        from: 'users.id',
        to: 'tasks.executorId',
      },
    },
  }

  static modifiers = {
    getFullName(query) {
      const { raw } = User
      query.select(
        'id',
        raw('CONCAT(??, \' \', ??)', ['firstName', 'lastName']).as('fullName'),
      )
    },

    getPublicDate(query) {
      const { raw } = User
      query.select(
        'id',
        raw('CONCAT(??, \' \', ??)', ['firstName', 'lastName']).as('fullName'),
        'email',
        'createdAt',
      )
    },
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    if (this.password) {
      this.passwordDigest = await hashPassword(this.password)
      delete this.password
    }
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)
    if (this.password) {
      this.passwordDigest = await hashPassword(this.password)
      delete this.password
    }
  }

  async verifyPassword(password) {
    return verifyPassword(password, this.passwordDigest)
  }
}
