import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const baseConfig = {
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'server', 'migrations'),
  },
}

const sqliteConfig = {
  client: 'sqlite3',
  pool: {
    afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb),
  },
}

export const development = {
  ...baseConfig,
  ...sqliteConfig,
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
}

export const test = {
  ...baseConfig,
  ...sqliteConfig,
  connection: ':memory:',
}

export const production = {
  ...baseConfig,
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
}
