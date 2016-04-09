'use strict'

var memjs = require('memjs')
var crypto = require('crypto')

module.exports = function (config, winston) {
  if (!config.MEMCAHE_SERVERS) {
    throw new Error('MEMCAHE_SERVERS config variable must be set')
  }

  var client = memjs.Client.create(config.MEMCAHE_SERVERS, {
    username: config.MEMCAHE_USERNAME,
    password: config.MEMCAHE_PASSWORD
  })

  var createKey = function (data) {
    var key = config.SERVICE.name + '_' + JSON.stringify(data)
    return crypto.createHash('md5').update(key).digest('hex')
  }

  var retrieve = function (req, res, next) {
    var key = createKey(req.data)
    client.get(key, function (err, val) {
      if (err) {
        winston.error('CACHE: failed to retrieve', key, err)
        next()
        return
      }

      if (val) {
        try {
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

  var save = function (req, res, next) {
    var key = createKey(req.data)
    client.set(key, JSON.stringify(res.data), function (err, val) {
      if (err || !val) {
        winston.error('CACHE: failed to save', key, err, val)
      }
    }, config.CACHE_EXPIRATION)

    next() // intentionally don't wait for save to finish
  }

  var noop = function (req, res, next) {
    next()
  }

  return {
    middleware: {
      retrieve: config.CACHE_ENABLED ? retrieve : noop,
      save: config.CACHE_ENABLED ? save : noop
    }
  }
}
