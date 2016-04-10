'use strict'

let async = require('async')

module.exports = (config) => {
  let services = {}
  for (let i = 0; i < config.SERVICES.length; i++) {
    services[config.SERVICES[i].name] = {
      name: config.SERVICES[i].name,
      title: config.SERVICES[i].title,
      middleware: require(`../scrapper/${config.SERVICES[i].name}`)().middleware
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
        service.middleware(req, localRes, next)
      }
    }), next)
  }

  return {middleware}
}
