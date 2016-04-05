'use strict'

require('dotenv').config({silent: true})

var _ = require('lodash')
var services = require('./config.services.js')
var notifications = require('./config.notifications.js')

module.exports = {
  // addons
  AMQP: process.env.CLOUDAMQP_URL,
  MEMCAHE_SERVERS: process.env.MEMCACHEDCLOUD_SERVERS,
  MEMCAHE_USERNAME: process.env.MEMCACHEDCLOUD_USERNAME,
  MEMCAHE_PASSWORD: process.env.MEMCACHEDCLOUD_PASSWORD,
  // services
  SERVICES: services,
  SERVICE: _.find(services, function (service) {
    return service.name === process.env.SERVICE_NAME
  }),
  CACHE_EXPIRATION: 4 * 3600,
  CACHE_ENABLED: process.env.NODE_ENV === 'production',
  // server
  REQUEST_TIMEOUT: 5000,
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
