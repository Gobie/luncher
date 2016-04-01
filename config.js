require('dotenv').config({silent: true})

if (!process.env.CLOUDAMQP_URL) {
  throw new Error('CLOUDAMQP_URL environment variable must be set')
}

module.exports = {
  // general
  REQUEST_TIMEOUT: 5000,
  AMQP: process.env.CLOUDAMQP_URL,
  // services
  SERVICES: (process.env.SERVICES || '').split(','),
  SERVICE_NAME: process.env.SERVICE_NAME || 'unknown',
  // server
  PORT: process.env.PORT || 3000,
  LOGGING: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  // global
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG,
  WORKERS: process.env.WEB_CONCURRENCY || 1
}
