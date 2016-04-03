'use strict'

require('dotenv').config({silent: true})

module.exports = {
  // addons
  AMQP: process.env.CLOUDAMQP_URL,
  MEMCAHE_SERVERS: process.env.MEMCACHEDCLOUD_SERVERS,
  MEMCAHE_USERNAME: process.env.MEMCACHEDCLOUD_USERNAME,
  MEMCAHE_PASSWORD: process.env.MEMCACHEDCLOUD_PASSWORD,
  // services
  SERVICES: (process.env.SERVICES || '').split(','),
  SERVICE_NAME: process.env.SERVICE_NAME || 'unknown',
  CACHE_EXPIRATION: 4 * 3600,
  // server
  REQUEST_TIMEOUT: 5000,
  PORT: process.env.PORT || 3000,
  LOGGING: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  // slack
  SLACK_API_TOKEN: process.env.SLACK_API_TOKEN || '',
  // global
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG,
  WORKERS: process.env.WEB_CONCURRENCY || 1
}
