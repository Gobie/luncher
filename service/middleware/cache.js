'use strict'

let memjs = require('memjs')
let crypto = require('crypto')

module.exports = (config, winston) => {
  if (!config.MEMCACHE_SERVERS) throw new Error('MEMCACHE_SERVERS config variable must be set')

  let client = memjs.Client.create(config.MEMCACHE_SERVERS, {
    username: config.MEMCACHE_USERNAME,
    password: config.MEMCACHE_PASSWORD
  })

  let createKey = (data) => {
    let key = JSON.stringify(data)
    return crypto.createHash('md5').update(key).digest('hex')
  }

  let retrieve = (req, res, next) => {
    let key = createKey(req.data)
    client.get(key, (err, val) => {
      if (err) {
        winston.error('CACHE: failed to retrieve', key, err)
        return next()
      }

      if (val) {
        try {
          winston.info('CACHE: retrieve from cache', key)
          res.data = JSON.parse(val.toString())
          res.send(null, req, res)
          return
        } catch (e) {
          client.delete(key)
        }
      }

      next()
    })
  }

  let save = (req, res, next) => {
    let key = createKey(req.data)
    client.set(key, JSON.stringify(res.data), (err, val) => {
      if (err || !val) winston.error('CACHE: failed to save', key, err, val)
    }, config.CACHE_EXPIRATION)

    next() // intentionally don't wait for save to finish
  }

  let noop = (req, res, next) => next()

  return {
    middleware: {
      retrieve: config.CACHE_ENABLED ? retrieve : noop,
      save: config.CACHE_ENABLED ? save : noop
    }
  }
}
