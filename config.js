'use strict'

require('dotenv').config({silent: true})

let services = require('./config.services.js')
let notifications = require('./config.notifications.js')

module.exports = {
  // addons
  AMQP: process.env.CLOUDAMQP_URL,
  MEMCACHE_SERVERS: process.env.MEMCACHEDCLOUD_SERVERS,
  MEMCACHE_USERNAME: process.env.MEMCACHEDCLOUD_USERNAME,
  MEMCACHE_PASSWORD: process.env.MEMCACHEDCLOUD_PASSWORD,
  // services
  SERVICES: services,
  CACHE_EXPIRATION: 4 * 3600,
  CACHE_ENABLED: process.env.NODE_ENV === 'production',
  ZOMATO_USER_KEY: process.env.ZOMATO_USER_KEY,
  X_RAY_REQUEST_TIMEOUT: 15000,
  // server
  REQUEST_TIMEOUT: 20000,
  PORT: process.env.PORT || 3000,
  LOGGING: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  // slack
  SLACK_API_TOKEN: process.env.SLACK_API_TOKEN || '',
  NOTIFICATIONS: notifications,
  // global
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG || '',
  WORKERS: process.env.WEB_CONCURRENCY || 1,
  URL: process.env.URL || 'http://localhost:3000/'
}
