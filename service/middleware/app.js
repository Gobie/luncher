'use strict'

let ware = require('ware')
let cacheFactory = require('./cache')
let hubFactory = require('./hub')

module.exports = (config, winston) => {
  let cache = cacheFactory(config, winston)
  let hub = hubFactory(config)

  return {
    middleware: ware()
      .use(cache.middleware.retrieve)
      .use(hub.middleware)
      .use(cache.middleware.save)
  }
}
