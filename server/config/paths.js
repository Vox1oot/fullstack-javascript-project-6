import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = fileURLToPath(path.dirname(import.meta.url))

export const PATHS = {
  root: path.join(__dirname, '..', '..'),
  public: path.join(__dirname, '..', '..', 'dist'),
  views: path.join(__dirname, '..', 'views'),
  server: path.join(__dirname, '..'),
}

export const mode = process.env.NODE_ENV || 'development'
