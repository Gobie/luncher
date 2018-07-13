'use strict'

let async = require('async')

module.exports = (config, winston) => {
  let services = {}
  for (let i = 0; i < config.SERVICES.length; i++) {
    services[config.SERVICES[i].name] = {
      name: config.SERVICES[i].name,
      title: config.SERVICES[i].title,
      middleware: require(`../scrapper/${config.SERVICES[i].name}`)(config, config.SERVICES[i]).middleware
    }
  }

  let middleware = (req, res, next) => {
    async.parallel(req.data.services.map((serviceName) => {
      return (next) => {
        let service = services[serviceName]
        let localRes = {
          name: service.name,
          title: service.title
        }
        res.data.push(localRes)
        winston.info('HUB: scrapper queried', serviceName)
        service.middleware(req, localRes, (e, r) => {
          winston.info('HUB: scrapper responded', serviceName)
          next(e, r)
        })
      }
    }), next)
  }

  return {middleware}
}
