'use strict'

var _ = require('lodash')
var uuid = require('uuid')
var moment = require('moment')

var createRoute = function (bus, config, inputCb, outputCb) {
  return function (req, res) {
    var options = {}
    _.defaults(options, req.query, {
      services: _.map(config.SERVICES, function (service) {
        return service.name
      })
    })

    var received = []
    var timer = null
    var channelWrapper = null

    var respond = _.once(function () {
      clearTimeout(timer)
      timer = null
      channelWrapper.close()
      channelWrapper = null
      res.send(outputCb(received))
    })

    channelWrapper = bus.client(function (msg, content) {
      received = content
      return respond()
    })

    channelWrapper.waitForConnect().then(function () {
      channelWrapper.sendToQueue('service.menu', inputCb(options), {
        correlationId: uuid.v4(),
        replyTo: channelWrapper.replyTo
      })

      timer = setTimeout(respond, config.REQUEST_TIMEOUT)
    })
  }
}

var normalizeOptions = function (options, config) {
  options.date = options.date || moment.utc().format('YYYY-MM-DD')
  if (!moment(options.date, 'YYYY-MM-DD', true).isValid()) {
    throw new Error('invalid date input' + options.date + ', required YYYY-MM-DD')
  }

  options.services = Array.isArray(options.services) ? options.services : [options.services]
  options.services = options.services.filter(function (serviceName) {
    return Boolean(_.find(config.SERVICES, ['name', serviceName]))
  })

  return options
}

var formatOutput = function (output) {
  if (output.error) {
    return [
      {error: output.error}
    ]
  }

  return output.data
}

module.exports = function (router, bus, config) {
  router.get('/today', createRoute(bus, config, function (options) {
    options = normalizeOptions(options, config)

    return {
      services: options.services,
      date: options.date,
      next: false
    }
  }, formatOutput))

  router.get('/next', createRoute(bus, config, function (options) {
    options = normalizeOptions(options, config)

    return {
      services: options.services,
      date: options.date,
      next: true
    }
  }, formatOutput))

  return router
}
