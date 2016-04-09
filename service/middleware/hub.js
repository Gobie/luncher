'use strict'

var async = require('async')

module.exports = function (config) {
  var services = {}
  for (var i = 0; i < config.SERVICES.length; i++) {
    services[config.SERVICES[i].name] = {
      name: config.SERVICES[i].name,
      title: config.SERVICES[i].title,
      middleware: require('../scrapper/' + config.SERVICES[i].name)().middleware
    }
  }

  var middleware = function (req, res, next) {
    async.parallel(req.data.services.map(function (serviceName) {
      return function (next) {
        var service = services[serviceName]
        var localRes = {
          name: service.name,
          title: service.title
        }
        res.data.push(localRes)
        service.middleware(req, localRes, next)
      }
    }), next)
  }

  return {
    middleware: middleware
  }
}
