'use strict'

var memjs = require('memjs')
var crypto = require('crypto')

module.exports = function (config) {
  if (!config.MEMCAHE_SERVERS) {
    throw new Error('MEMCAHE_SERVERS config variable must be set')
  }

  var client = memjs.Client.create(config.MEMCAHE_SERVERS, {
    username: config.MEMCAHE_USERNAME,
    password: config.MEMCAHE_PASSWORD
  })

  var createKey = function (data) {
    var key = config.SERVICE_NAME + '_' + JSON.stringify(data)
    return crypto.createHash('md5').update(key).digest('hex')
  }

  var retrieve = function (req, res, next) {
    var key = createKey(req.data)
    client.get(key, function (err, val) {
      if (err) {
        console.error('failed to retrieve cache ' + key, err)
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
        console.error('failed to cache ' + key, err, val)
      }
    }, config.CACHE_EXPIRATION)

    next() // intenionally don't wait for save to finish
  }

  return {
    middleware: {
      retrieve: retrieve,
      save: save
    }
  }
}
