import { getEnv } from '~/utils/getEnv'

const envConfig = () => ({
  APP_PORT: getEnv('PORT', '4000'),
  APP_HOST: getEnv('HOST', 'localhost'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  BASE_PATH: getEnv('BASE_PATH', '/api'),

  MONGODB_URI: getEnv('MONGODB_URI'),
  DATABASE_NAME: getEnv('DATABASE_NAME'),
  DB_USERS_COLLECTION: getEnv('DB_USERS_COLLECTION')
})

export const environment = envConfig()
