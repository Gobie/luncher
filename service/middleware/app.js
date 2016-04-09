'use strict'

var ware = require('ware')
var cacheFactory = require('./cache')
var hubFactory = require('./hub')

module.exports = function (config) {
  var cache = cacheFactory(config)
  var hub = hubFactory(config)

  return {
    middleware: ware()
      .use(cache.middleware.retrieve)
      .use(hub.middleware)
      .use(cache.middleware.save)
  }
}
